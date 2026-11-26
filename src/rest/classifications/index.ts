import FormData from "form-data";
import { AlfredClient } from "../index";
import {
  Classification,
  CreateClassification,
  CreateClassificationFromFile,
} from "../../interfaces";

export class Classifications {
  constructor(private client: AlfredClient) {}

  /**
   * Classifies text against criteria supplied in the request.
   *
   * Sends a POST request to 'api/classify'. Every call creates and bills one
   * request. There is no idempotency: a retried create is a second, billed
   * request. If a call timed out but you received an id, use `get` instead.
   *
   * @async
   * @param {CreateClassification} payload - The tags and text to classify.
   * @returns {Promise<Classification>} - The queued request.
   * @throws {HTTPError} Will throw an error if the HTTP request fails.
   */
  async create(payload: CreateClassification): Promise<Classification> {
    const body: Record<string, unknown> = {
      tags: payload.tags,
      text: payload.text,
    };
    if (payload.fileName !== undefined) body.file_name = payload.fileName;
    if (payload.correlationId !== undefined)
      body.correlation_id = payload.correlationId;

    const resp = await this.client._http.post<Classification>(
      "api/classify",
      body
    );
    return resp.data;
  }

  /**
   * Classifies a file against criteria supplied in the request.
   *
   * Sends a multipart POST request to 'api/classify'. Every call creates and
   * bills one request; a retried create is a second, billed request.
   *
   * @async
   * @param {CreateClassificationFromFile} payload - The file and tags to classify.
   * @returns {Promise<Classification>} - The queued request.
   * @throws {Error} When the file buffer or name is missing.
   * @throws {HTTPError} Will throw an error if the HTTP request fails.
   */
  async createFromFile(
    payload: CreateClassificationFromFile
  ): Promise<Classification> {
    if (!payload.file || !payload.file.buffer)
      throw new Error("file.buffer is required.");
    if (!payload.file.originalName)
      throw new Error(
        "file.originalName is required: the API reads the file type from its extension."
      );

    const formData = new FormData();
    formData.append("file", payload.file.buffer, {
      filename: payload.file.originalName,
      contentType: payload.file.mimetype,
    });
    formData.append("tags", JSON.stringify(payload.tags));
    if (payload.correlationId)
      formData.append("correlation_id", payload.correlationId);

    const resp = await this.client._http.post<Classification>(
      "api/classify",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );
    return resp.data;
  }

  /**
   * Retrieves a classification request and, once finished, its result.
   *
   * Sends a GET request to 'api/classify/{id}'.
   *
   * @async
   * @param {string} classificationId - The id returned by create.
   * @returns {Promise<Classification>} - The request.
   * @throws {Error} When the id is blank.
   * @throws {HTTPError} Will throw an error if the HTTP request fails.
   */
  async get(classificationId: string): Promise<Classification> {
    if (!classificationId || !classificationId.trim())
      throw new Error("classificationId is required.");

    const resp = await this.client._http.get<Classification>(
      `api/classify/${encodeURIComponent(classificationId)}`
    );
    return resp.data;
  }
}

export default Classifications;
