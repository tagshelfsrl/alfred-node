import { AlfredClient } from "..";
import {
  CancelJobResult,
  CheckJobSourcesResult,
  CreateJob,
  CreateJobResult,
  GetJobOptions,
  JobFull,
  JobPage,
  JobSummary,
  ListJobsOptions,
  RestartJobOptions,
  RestartJobResult,
} from "../../interfaces";
import { toSnakeCase } from "../../utils/convert-case";

const requireJobId = (jobId: string): string => {
  if (typeof jobId !== "string" || jobId.trim() === "") {
    throw new Error("jobId is required.");
  }
  return jobId;
};

const formatDate = (value: string | Date): string =>
  value instanceof Date ? value.toISOString().slice(0, 10) : value;

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
   * Fetches a job by its ID. Returns the summary unless `view: "full"` is passed.
   *
   * @async
   * @param {string} jobId - The unique identifier of the job.
   * @param {GetJobOptions} [options] - `view` and, for the full view, `exclude`.
   * @returns {Promise<JobSummary | JobFull>} - The summary by default, the full record with `view: "full"`.
   * @throws {Error} If `jobId` is blank.
   * @throws {HTTPError} Will throw an error if the HTTP request fails.
   */
  async get(jobId: string): Promise<JobSummary>;
  async get(
    jobId: string,
    options: GetJobOptions & { view: "full" }
  ): Promise<JobFull>;
  async get(
    jobId: string,
    options?: GetJobOptions
  ): Promise<JobSummary | JobFull>;
  async get(
    jobId: string,
    options: GetJobOptions = {}
  ): Promise<JobSummary | JobFull> {
    requireJobId(jobId);
    const params: Record<string, string> = {};
    if (options.view) params.view = options.view;
    const exclude = Array.isArray(options.exclude)
      ? options.exclude
      : (options.exclude || "").split(",");
    const excluded = exclude.map((f) => f.trim()).filter((f) => f !== "");
    if (excluded.length > 0) params.exclude = excluded.join(",");

    const response = await this.client._http.get<JobSummary | JobFull>(
      `api/job/detail/${encodeURIComponent(jobId)}`,
      { params }
    );
    return response.data;
  }

  /**
   * Lists jobs, one page at a time.
   *
   * @async
   * @param {ListJobsOptions} [options] - Paging, sorting and filters.
   * @returns {Promise<JobPage<JobSummary | JobFull>>} - The page envelope; `hasMore` tells whether to ask for the next page.
   * @throws {HTTPError} Will throw an error if the HTTP request fails.
   */
  async getAll(
    options?: ListJobsOptions & { view?: "summary" }
  ): Promise<JobPage<JobSummary>>;
  async getAll(
    options: ListJobsOptions & { view: "full" }
  ): Promise<JobPage<JobFull>>;
  async getAll(
    options?: ListJobsOptions
  ): Promise<JobPage<JobSummary | JobFull>>;
  async getAll(
    options: ListJobsOptions = {}
  ): Promise<JobPage<JobSummary | JobFull>> {
    const params: Record<string, string | number> = {};
    if (options.page !== undefined) {
      params.page = options.page;
      params.currentPage = options.page;
    }
    if (options.pageSize !== undefined) {
      params.page_size = options.pageSize;
      params.pageSize = options.pageSize;
    }
    if (options.sortDirection) params.sortDirection = options.sortDirection;
    if (options.startDate) params.startDate = formatDate(options.startDate);
    if (options.endDate) params.endDate = formatDate(options.endDate);
    if (options.correlationId) params.correlation_id = options.correlationId;
    if (options.channel) params.channel = options.channel;
    if (options.view) params.view = options.view;

    const response = await this.client._http.get<any>(`api/job/all`, {
      params,
    });
    const data = response.data;

    // Alfred before 1.130.0 answers { result, total, isEmpty }.
    if (data && !Array.isArray(data.items) && Array.isArray(data.result)) {
      const page = options.page ?? 1;
      const pageSize = options.pageSize ?? 10;
      const total = data.total ?? data.result.length;
      return {
        items: data.result,
        page,
        pageSize,
        total,
        hasMore: page * pageSize < total,
      };
    }
    return data;
  }

  /**
   * Cancels a job.
   *
   * @param {string} jobId - The job to cancel.
   * @returns {Promise<CancelJobResult>}
   * @throws {Error} If `jobId` is blank.
   * @throws {HTTPError} Will throw an error if the HTTP request fails.
   */
  async cancel(jobId: string): Promise<CancelJobResult> {
    requireJobId(jobId);
    const response = await this.client._http.post<CancelJobResult>(
      `api/job/cancel`,
      undefined,
      { params: { jobId } }
    );
    return response.data;
  }

  /**
   * Restarts a job. A refusal (for example missing sources) is thrown as an HTTPError.
   *
   * @param {string} jobId - The job to restart.
   * @param {RestartJobOptions} [options] - `redownloadRemoteFiles` (default false).
   * @returns {Promise<RestartJobResult>}
   * @throws {Error} If `jobId` is blank.
   * @throws {HTTPError} Will throw an error if the HTTP request fails or Alfred refuses.
   */
  async restart(
    jobId: string,
    options: RestartJobOptions = {}
  ): Promise<RestartJobResult> {
    requireJobId(jobId);
    const response = await this.client._http.post<RestartJobResult>(
      `api/job/restart`,
      undefined,
      {
        params: {
          jobId,
          redownloadRemoteFiles: options.redownloadRemoteFiles === true,
        },
      }
    );
    return response.data;
  }

  /**
   * Checks whether the remote sources of a job can still be downloaded.
   *
   * @param {string} jobId - The job to check.
   * @returns {Promise<CheckJobSourcesResult>}
   * @throws {Error} If `jobId` is blank.
   * @throws {HTTPError} Will throw an error if the HTTP request fails (404 for an unknown job).
   */
  async checkSources(jobId: string): Promise<CheckJobSourcesResult> {
    requireJobId(jobId);
    const response = await this.client._http.post<CheckJobSourcesResult>(
      `api/job/check-sources`,
      undefined,
      { params: { jobId } }
    );
    return response.data;
  }
}

export default Jobs;
