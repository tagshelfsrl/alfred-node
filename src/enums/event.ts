/**
 * Names of the events Alfred sends to the real-time client. Each one arrives
 * inside a stream (`job_event`, `file_event` or `bulk_task_event`) and is the
 * value of the payload's `eventName`.
 */
export enum AlfredEvent {
  // Job Events
  JobStart = "alfred_event_job_start",
  JobFinished = "alfred_event_job_finished",
  JobCreate = "alfred_event_job_create",
  JobStageUpdate = "alfred_event_job_stage_update",
  /**
   * A job that used up its retries. Alfred before 1.131.0 sends it under the
   * name `alfred_event_job_retry` (with `exceededRetries: true`); the SDK
   * delivers both to subscribers of this name.
   */
  JobExceededRetries = "alfred_event_job_exceeded_retries",
  JobFailed = "alfred_event_job_failed",
  JobInvalid = "alfred_event_job_invalid",
  JobCancelled = "alfred_event_job_cancelled",
  JobExpired = "alfred_event_job_expired",
  /**
   * @deprecated Not sent from Alfred 1.131.0. Before that version it was only
   * sent for a job that used up its retries; subscribe to
   * {@link AlfredEvent.JobExceededRetries} instead.
   */
  JobRetry = "alfred_event_job_retry",

  // File Events
  FileCreate = "alfred_event_file_create",
  FileStatusUpdate = "alfred_event_file_status_update",
  FileMove = "alfred_event_file_move",
  FileDone = "alfred_event_file_done",
  FileUpdate = "alfred_event_file_update",
  /**
   * A document type removed from a file. Alfred before 1.131.0 sends it under
   * the name `alfred_event_file_change_tag` (with `tagBeingRemovedId`); the
   * SDK delivers both to subscribers of this name.
   */
  FileRemoveTag = "alfred_event_file_remove_tag",
  FilePropertyDelete = "alfred_event_file_property_delete",
  FilePropertyCreate = "alfred_event_file_property_create",
  FileMoveToRecycleBin = "alfred_event_file_move_to_recycle_bin",
  FileMoveToPending = "alfred_event_file_move_to_pending",
  FileMoveToDecomposed = "alfred_event_file_move_to_decomposed",
  FileDecomposed = "alfred_event_file_decomposed",
  FileFailed = "alfred_event_file_failed",
  FileExtractedDataDelete = "alfred_event_file_extracted_data_delete",
  FileExtractedDataCreate = "alfred_event_file_extracted_data_create",
  FileChangeTag = "alfred_event_file_change_tag",
  FileCategoryDelete = "alfred_event_file_category_delete",
  /** A file linked to a job. Same value as {@link AlfredEvent.FileAddedToJob}. */
  FileAddToJob = "alfred_event_file_added_to_job",
  /** A file linked to a job. */
  FileAddedToJob = "alfred_event_file_added_to_job", // eslint-disable-line @typescript-eslint/no-duplicate-enum-values
  FileCategoryCreate = "alfred_event_file_category_create",

  // Bulk Task Events
  BulkTaskCreate = "alfred_event_bulk_task_create",
  BulkTaskUpdate = "alfred_event_bulk_task_update",
  BulkTaskStart = "alfred_event_bulk_task_start",
  BulkTaskClosed = "alfred_event_bulk_task_closed",
}
