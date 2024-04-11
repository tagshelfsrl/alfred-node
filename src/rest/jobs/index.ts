import { AlfredClient } from "..";
import { JobResult, CreateJobResult, CreateJob } from "../../interfaces";
import { toSnakeCase } from "../../utils/convert-case";

export class Jobs {
  constructor(private client: AlfredClient) {}

  /**
   * Creates a new job.
   *
   * @async
   * @param {CreateJob} createJob - The job creation request object.
   * @returns {Promise<CreateJobResult>} - A promise that resolves to a CreateJobResult object.
   * @throws {HTTPError} Will throw an error if the HTTP request fails.
   */

  async create(createJob: CreateJob): Promise<CreateJobResult> {
    const body = toSnakeCase(createJob);
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
  async get(jobId: string): Promise<JobResult> {
    const response = await this.client._http.get<JobResult>(
      `api/job/detail/${jobId}`
    );
    return response.data;
  }
}

export default Jobs;
