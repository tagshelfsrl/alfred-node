import { AlfredClient } from "../index";
import {
  DownloadResult,
  FileUploadPayload,
  UploadFilePayload,
} from "../../interfaces";
import FormData from "form-data";

class Files {
  constructor(private client: AlfredClient) {}

  /**
   * Retrieves the details of a file.
   *
   * This method sends a GET request to the 'api/file/detail/{id}' endpoint to fetch the details of the file with the given id.
   *
   * @async
   * @param {string} id - The id of the file to fetch details for.
   * @returns {Promise<File>} - A promise that resolves to a File object representing the details of the file.
   * @throws {Error} Will throw an error if the HTTP request fails.
   */
  async get(id: string): Promise<File> {
    const resp = await this.client._http.get<File>(`api/file/detail/${id}`);
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
      originalName: resp.headers["content-disposition"].split("filename=")[1],
      mimetype: resp.headers["content-type"],
    };
  }

  /**
   * Uploads a file to the server.
   *
   * This method creates a new FormData instance, appends the session_id, file, and optional metadata to it,
   * and then sends a POST request to the 'api/file/uploadfile' endpoint with the FormData as the body.
   *
   * @async
   * @param {UploadFilePayload} payload - The payload for the file upload. It should include the session_id, file, and optional metadata.
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
   * This method sends a POST request to the 'api/file/upload' endpoint with the payload as the body.
   *
   * @async
   * @param {FileUploadPayload} payload - The payload for the file upload. It should include the necessary data for the file upload.
   * @returns {Promise<{ fileId: string }>} - A promise that resolves to an object containing the id of the uploaded file.
   * @throws {Error} Will throw an error if the HTTP request fails.
   */
  async upload(payload: FileUploadPayload): Promise<{ fileId: string }> {
    const resp = await this.client._http.post<{ fileId: string }>(
      "api/file/upload",
      payload
    );

    return resp.data;
  }
}

export = Files;
