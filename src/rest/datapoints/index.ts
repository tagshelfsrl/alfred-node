import { AlfredClient } from "..";
import { DataPointResult } from "../../interfaces";

class DataPoints {
  constructor(private client: AlfredClient) {
  }

  /**
   * Fetches the metadata for a specific file by its ID.
   *
   * @async
   * @param {string} fileId - The unique identifier of the file.
   * @returns {Promise<DataPointResult[]>} - A promise that resolves to an array of DataPointResult objects.
   * @throws {HTTPError} Will throw an error if the HTTP request fails.
   */
  async getMetadataByFileId(fileId: string): Promise<DataPointResult[]> {
    const response = await this.client._http.get<DataPointResult[]>(`api/values/file/${ fileId }`);
    return response.data
  }
}

export = DataPoints;
