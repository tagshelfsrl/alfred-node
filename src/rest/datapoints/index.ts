import { AlfredClient } from "..";
import { DataPointResult } from "../../interfaces";

export class DataPoints {
  constructor(private client: AlfredClient) {}

  /**
   * Fetches the data point values of a file by its ID.
   *
   * Returns one row per data point of the file's document type. A data point
   * that was not found in the document comes back with `value: ""` and a
   * `classificationScore` of `0`. Key integrations on `fieldKey`, not on
   * `metadataName`.
   *
   * A file that has not finished processing answers 404 (not an empty list),
   * as does a file whose document type has no data points. Wait for the file
   * to finish before asking for values. A file of another workspace answers
   * 401.
   *
   * @async
   * @param {string} fileId - The unique identifier of the file.
   * @returns {Promise<DataPointResult[]>} - A promise that resolves to an array of DataPointResult objects.
   * @throws {HTTPError} Will throw an error if the HTTP request fails, including the 404 and 401 cases above.
   */
  async getValues(fileId: string): Promise<DataPointResult[]> {
    const response = await this.client._http.get<DataPointResult[]>(
      `api/values/file/${fileId}`
    );
    return response.data;
  }
}

export default DataPoints;
