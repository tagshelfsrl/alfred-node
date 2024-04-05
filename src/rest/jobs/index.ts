import { AlfredClient } from "..";
import { JobResult, CreateJobResult } from "../../interfaces";

class Jobs {
  constructor(private client: AlfredClient) {}

  /**
   * Creates a new job.
   *
   * @async
   * @param {string} sessionId - The unique identifier of the session.
   * @returns {Promise<CreateJobResult>} - A promise that resolves to a CreateJobResult object.
   * @throws {HTTPError} Will throw an error if the HTTP request fails.
   */

  async createJob(sessionId: string): Promise<CreateJobResult> {
    const body = { session_id: sessionId };
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
