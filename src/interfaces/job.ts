/** Which representation of a job the API returns. `summary` is the default. */
export type JobView = "summary" | "full";

/** Processing stage of a job. Future values are accepted as plain strings. */
export type JobStage =
  | "queued"
  | "started"
  | "downloading"
  | "downloaded"
  | "uploading"
  | "uploaded"
  | "in_progress"
  | "completed"
  | "failed"
  | "invalid"
  | "canceled"
  | "syncing"
  | "synced"
  | "in_revision"
  | "waiting_to_be_sent_to_third_party"
  | "sent_to_third_party"
  | "pre_completion"
  | "draft"
  | "expired"
  | "canceling"
  | "restarting"
  | (string & {});

/**
 * Job priority. The summary view sends it in lowercase ("high"), the full view
 * with a capital letter ("High").
 */
export type JobPriority = "low" | "normal" | "high" | "urgent" | (string & {});

/**
 * Job priority as the full view sends it: the same four values, capitalised.
 */
export type JobFullPriority =
  | "Low"
  | "Normal"
  | "High"
  | "Urgent"
  | (string & {});

/** Processing status of a file. Future values are accepted as plain strings. */
export type JobFileStatus =
  | "uploaded"
  | "metadata"
  | "pre_processing"
  | "pre_processed"
  | "decomposing"
  | "decomposed"
  | "transforming"
  | "transformed"
  | "classifying"
  | "classified"
  | "indexing"
  | "indexed"
  | "extracting"
  | "extracted"
  | "confirmation_required"
  | "confirmation_submitted"
  | "confirmed"
  | "finished"
  | "re_tagged"
  | "tag_removed"
  | "failed_classification"
  | "deleted"
  | "duplicate"
  | "waiting_to_be_sent_to_third_party"
  | "sent_to_third_party"
  | "re_queued"
  | "failed_extraction"
  | "failed_to_send_to_third_party"
  | "failed_file_operation"
  | "failed_transformation"
  | "failed_job"
  | "canceled_job"
  | "requeued_for_extraction"
  | "pending_job_validation"
  | "preparing"
  | "prepared"
  | "password_required"
  | (string & {});

/** How a file relates to a grouped document. */
export type JobFileGroupRole =
  | "standalone"
  | "virtual"
  | "member"
  | (string & {});

/** The short job record returned by default. */
export interface JobSummary {
  /** Job ID. */
  id: string;
  /** Your own reference sent when the job was created; "" when none. */
  correlationId: string;
  /** Current processing stage. */
  stage: JobStage;
  /** Channel the job came through. */
  channel: string;
  /** Job priority, in lowercase (for example "normal"). */
  priority: JobPriority;
  /** User that created the job. */
  userName: string;
  /** Number of file sources (uploaded files or remote URLs) in the job. */
  fileSourcesCount: number;
  /** Number of files the job currently holds. */
  fileCount: number;
  /** Number of files that have finished processing. */
  finishedFiles: number;
  /** True when at least one file failed. */
  hasFailedFiles: boolean;
  /** Number of files that failed. */
  failedFilesCount: number;
  /** True when at least one file waits for a person to confirm it. */
  hasConfirmationRequiredFiles: boolean;
  /** Number of files waiting for confirmation. */
  confirmationRequiredFilesCount: number;
  /** Number of times the job was retried. */
  retries: number;
  /** True when the job used up its allowed retries. */
  exceededRetries: boolean;
  /** Files are merged into a single document. */
  merge: boolean;
  /** PDFs are split into pages. */
  decompose: boolean;
  /** Job-level metadata is copied to every file. */
  propagateMetadata: boolean;
  /** When the job was created (ISO 8601, UTC). */
  creationDate: string;
  /** When the job last changed (ISO 8601, UTC). */
  updateDate: string;
  /** When the job started; left out until it starts. */
  startDate?: string;
}

/** A file inside a job, as listed by the full view. */
export interface JobFile {
  id: string;
  creationDate: string;
  updateDate: string;
  fileName: string;
  contentType: string;
  /** Name of the tag (document type) the file was classified as. */
  tagName: string;
  /** The file was split into pages or children. */
  isParent: boolean;
  /** The file is a page or child of a parent file. */
  isChildren: boolean;
  /** Whether the file stands alone, is a virtual grouped document, or a page of one. */
  groupRole: JobFileGroupRole;
  /** ID of the group the file belongs to, when grouped. */
  groupId?: string;
  /** ID of the parent file, when this is a child. */
  parentId?: string;
  /** The file is classified and extracted in its own right, i.e. not a split parent and not a page of a grouped document. */
  isProcessingUnit: boolean;
  /** An automated result exists and can be read; review may still be pending. */
  isResultReady: boolean;
  /** Current processing status. */
  status: JobFileStatus;
  /** The file is being extracted again. */
  isReextracting: boolean;
}

/** The complete job record, returned with `view: "full"`. */
export interface JobFull {
  id: string;
  /** Why the job was canceled, when it was. */
  cancellationReason: string;
  /** User that last canceled the job. */
  lastCanceledBy: string;
  lastCancellationDate?: string;
  companyId: string;
  bulkId?: string;
  deferredSessionId?: string;
  userName: string;
  channel: string;
  /** Your own reference sent when the job was created; "" when none. */
  correlationId: string;
  source: string;
  container: string;
  remoteFileName: string;
  merge: boolean;
  decompose: boolean;
  propagateMetadata: boolean;
  parentFilePrefix: string;
  /** Job metadata as a JSON string, exactly as the API sends it; "" when none or excluded. */
  metadata: string;
  fileCount: number;
  /** File count including files created by splitting. */
  totalFileCount: number;
  fileSourcesCount: number;
  /** Number of metadata objects sent with the job. */
  metadataObjectsCount: number;
  finishedFiles: number;
  /** Files of the job; left out when excluded. */
  files?: JobFile[];
  retries: number;
  /** Times the job was canceled. */
  cancelCount: number;
  /** Times the job was restarted. */
  restartCount: number;
  /** Restarts that reused cached downloads. */
  cachedRestartCount: number;
  /** Restarts that downloaded the remote files again. */
  redownloadRestartCount: number;
  /** User that last restarted the job. */
  restartedBy: string;
  restartedAt?: string;
  exceededRetries: boolean;
  /** URLs of the files; left out when excluded. */
  fileUrls?: string[];
  /** Errors recorded for the job; left out when excluded. */
  errorMessages?: string[];
  stage: JobStage;
  /** True when the remote sources were checked and are available. */
  remoteSourcesAvailable?: boolean;
  /** Source URLs found to be unavailable. */
  unavailableSourceUrls?: string[];
  /** Job priority, capitalised in this view (for example "Normal"). */
  priority: JobFullPriority;
  startDate?: string;
  hasFailedFiles: boolean;
  /** True when some input sources can no longer be read. */
  hasBrokenInputSources: boolean;
  creationDate: string;
  updateDate: string;
}

/** @deprecated Use JobFull (the full view) or JobSummary. */
export type JobResult = JobFull;

/** One page of a job list. */
export interface JobPage<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

/** Collections the full view can leave out. */
export type JobExcludableField =
  | "files"
  | "metadata"
  | "fileUrls"
  | "errorMessages";

export interface GetJobOptions {
  /** `summary` (default, nothing is sent) or `full`. `full` needs an API key or Account Admin role. */
  view?: JobView;
  /** Collections to leave out of the full view; an array or a comma-separated string. */
  exclude?: JobExcludableField[] | string;
}

export interface ListJobsOptions {
  /** Page number, from 1. */
  page?: number;
  /** Items per page, 10 to 100. */
  pageSize?: number;
  /** Sort by update date; newest first when omitted. */
  sortDirection?: "ASC" | "DESC";
  /** First day to include. A Date is sent as its UTC calendar date; a string as given (YYYY-MM-DD). */
  startDate?: string | Date;
  /** Last day to include; needs a start date. No future dates. */
  endDate?: string | Date;
  /** Exact, case-sensitive match on the correlation id. */
  correlationId?: string;
  channel?: string;
  /** `summary` (default) or `full` (full view without files, fileUrls and errorMessages). */
  view?: JobView;
}

export interface CreateJobResult {
  jobId: string;
  /** The correlation id sent with the request; "" when none. */
  correlationId?: string;
}

export interface CancelJobResult {
  canceled: boolean;
}

export interface RestartJobOptions {
  /** Download remote files again instead of reusing the stored copies. */
  redownloadRemoteFiles?: boolean;
}

export interface RestartJobResult {
  restarted: boolean;
}

export interface CheckJobSourcesResult {
  available: boolean;
  unavailableUrls?: string[];
}

export interface CreateJob {
  sessionId?: string;
  propagateMetadata?: boolean;
  merge?: boolean;
  decompose?: boolean;
  metadata?: any;
  channel?: string;
  parentFilePrefix?: string;
  pageRotation?: number;
  container?: string;
  fileName?: string;
  fileNames?: string[];
  /** Your own reference for the job: opaque, case-sensitive, at most 512 characters after trimming. Never deduplicated. */
  correlationId?: string;
  /** Password for protected PDF, zip or Office files. Refused with HTTP 400 where the feature is off. */
  password?: string;
  /** Job priority. A workspace-level override, when configured, wins over it. */
  priority?: JobPriority;
}
