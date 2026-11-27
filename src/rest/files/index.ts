import { AlfredClient } from "../index";
import {
  DownloadResult,
  FileDetails,
  FileUploadPayload,
  FileUploadResult,
  UploadFilePayload,
} from "../../interfaces";
import FormData from "form-data";

const UPLOAD_WIRE_NAMES: Record<string, string> = {
  fileName: "file_name",
  fileNames: "file_names",
  filename: "file_name",
  filenames: "file_names",
  pageRotation: "page_rotation",
  propagateMetadata: "propagate_metadata",
  parentFilePrefix: "parent_file_prefix",
  correlationId: "correlation_id",
};

/**
 * Builds the body of `POST api/file/upload`: maps the SDK's camelCase field
 * names to the names the API reads. `metadata` is never touched, unknown keys
 * are forwarded as they are and `undefined` values are left out.
 */
export function buildUploadBody(
  payload: FileUploadPayload
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  const deprecated: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    if (key === "filename" || key === "filenames") {
      deprecated[UPLOAD_WIRE_NAMES[key]] = value;
    } else {
      body[UPLOAD_WIRE_NAMES[key] ?? key] = value;
    }
  }
  // The new spelling wins over the deprecated one.
  for (const [key, value] of Object.entries(deprecated)) {
    if (!(key in body)) body[key] = value;
  }
  return body;
}

/**
 * Reads the file name from a `Content-Disposition` header value. Prefers the
 * RFC 5987 `filename*=` form, then a quoted `filename="..."`, then a bare
 * token. Returns an empty string when there is no usable name.
 */
export function parseContentDispositionFilename(
  header: string | undefined | null
): string {
  if (!header || typeof header !== "string") return "";

  const star = /(?:^|;)\s*filename\*\s*=\s*([^;]*)/i.exec(header);
  if (star) {
    let value = star[1].trim();
    const ext = /^[^']*'[^']*'(.*)$/.exec(value);
    if (ext) value = ext[1];
    try {
      const decoded = decodeURIComponent(value);
      if (decoded) return decoded;
    } catch {
      // fall through to the plain forms
    }
  }

  const quoted = /(?:^|;)\s*filename\s*=\s*"((?:[^"\\]|\\.)*)"/i.exec(header);
  if (quoted) return quoted[1].replace(/\\(.)/g, "$1");

  const bare = /(?:^|;)\s*filename\s*=\s*([^;"]*)/i.exec(header);
  if (bare) return bare[1].trim();

  return "";
}

export class Files {
  constructor(private client: AlfredClient) {}

  /**
   * Retrieves the details of a file.
   *
   * This method sends a GET request to the 'api/file/detail/{id}' endpoint to fetch the details of the file with the given id.
   *
   * @async
   * @param {string} id - The id of the file to fetch details for.
   * @returns {Promise<FileDetails>} - A promise that resolves to a FileDetails object representing the details of the file.
   * @throws {Error} Will throw an error if the HTTP request fails.
   */
  async get(id: string): Promise<FileDetails> {
    const resp = await this.client._http.get<FileDetails>(
      `api/file/detail/${id}`
    );
    return resp.data;
  }

  /**
   * Downloads a file from Alfred.
   *
   * This method sends a GET request to the 'api/file/download/{id}' endpoint to download the file with the given id.
   * The responseType is set to 'blob' to ensure the file is downloaded as a Blob object.
   *
   * @async
   * @param {string} id - The id of the file to download.
   * @returns {Promise<DownloadResult>} - A promise that resolves to a Blob object representing the downloaded file.
   * @throws {Error} Will throw an error if the HTTP request fails.
   */
  async download(id: string): Promise<DownloadResult> {
    const resp = await this.client._http.get(`api/file/download/${id}`, {
      responseType: "arraybuffer",
    });

    return {
      buffer: Buffer.from(resp.data),
      originalName: parseContentDispositionFilename(
        resp.headers["content-disposition"]
      ),
      mimetype: resp.headers["content-type"] || "application/octet-stream",
    };
  }

  /**
   * Uploads a file to the server.
   *
   * This method creates a new FormData instance, appends the sessionId, file, and optional metadata to it,
   * and then sends a POST request to the 'api/file/uploadfile' endpoint with the FormData as the body.
   *
   * @async
   * @param {UploadFilePayload} payload - The payload for the file upload. It should include the sessionId, file, and optional metadata.
   * @returns {Promise<{ fileId: string }>} - A promise that resolves to an object containing the id of the uploaded file.
   * @throws {Error} Will throw an error if the HTTP request fails.
   */
  async uploadFile(payload: UploadFilePayload): Promise<{ fileId: string }> {
    const formData = new FormData();

    formData.append("session_id", payload.sessionId);
    formData.append("file", payload.file.buffer, {
      filename: payload.file.originalName,
      contentType: payload.file.mimetype,
    });
    if (payload.metadata)
      formData.append("metadata", JSON.stringify(payload.metadata));
    if (payload.channel) formData.append("channel", payload.channel);

    const resp = await this.client._http.post<{ fileId: string }>(
      "api/file/uploadfile",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    return resp.data;
  }

  /**
   * Uploads a file to the server.
   *
   * This method sends a POST request to the 'api/file/upload' endpoint. Field names are
   * mapped to the names the API reads, and the API creates a job for the files.
   *
   * @async
   * @param {FileUploadPayload} payload - The payload for the file upload. It should include the necessary data for the file upload.
   * @returns {Promise<FileUploadResult>} - A promise that resolves to the created job (`jobId`, `correlationId`, `warnings`).
   * @throws {Error} Will throw an error if the HTTP request fails.
   */
  async upload(payload: FileUploadPayload): Promise<FileUploadResult> {
    const resp = await this.client._http.post<FileUploadResult>(
      "api/file/upload",
      buildUploadBody(payload)
    );

    return resp.data;
  }
}

export default Files;
