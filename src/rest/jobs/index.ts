import { AlfredClient } from "..";
import { JobResult, CreateJobResult } from "../../interfaces";

class Jobs {
  constructor(private client: AlfredClient) {}

  /**
   * Creates a new job.
   *
   * @async
   * @param {string} sessionId - The unique identifier of the session.
   * @param {string} propagateMetadata - A boolean that indicates whether to propagate metadata.
   * @param {string} merge - A boolean that indicates whether to merge the files.
   * @param {string} decompose - A boolean that indicates whether to decompose the files.
   * @param {any} metadata - A JSON object that contains metadata.
   * @param {string} channel - A string that represents the channel.
   * @param {string} parentFilePrefix - A string that represents the parent file prefix.
   * @param {number} pageRotation - A number that represents the page rotation.
   * @param {string} container - A string that represents the container.
   * @param {string} fileName - A string that represents the file name.
   * @param {string} fileNames - An array of strings that represent the file names.
   * @returns {Promise<CreateJobResult>} - A promise that resolves to a CreateJobResult object.
   * @throws {HTTPError} Will throw an error if the HTTP request fails.
   */

  async createJob(
    sessionId?: string,
    propagateMetadata?: boolean,
    merge?: boolean,
    decompose?: boolean,
    metadata?: any,
    channel: string = "libary",
    parentFilePrefix?: string,
    pageRotation?: number,
    container?: string,
    fileName?: string,
    fileNames?: string[]
  ): Promise<CreateJobResult> {
    const body = {
      merge,
      channel,
      metadata,
      container,
      decompose,
      file_name: fileName,
      file_names: fileNames,
      session_id: sessionId,
      page_rotation: pageRotation,
      parent_file_prefix: parentFilePrefix,
      propagate_metadata: propagateMetadata,
    };
    const response = await this.client._http.post<CreateJobResult>(
      `api/job/create`,
      body
    );
    return response.data;
  }

  /**
   * Fetches a job by its ID.
   *
   * @async
   * @param {string} jobId - The unique identifier of the job.
   * @returns {Promise<JobResult>} - A promise that resolves to a JobResult object.
   * @throws {HTTPError} Will throw an error if the HTTP request fails.
   */
  async getJob(jobId: string): Promise<JobResult> {
    const response = await this.client._http.get<JobResult>(
      `api/job/detail/${jobId}`
    );
    return response.data;
  }
}

export = Jobs;
