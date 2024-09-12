export enum AlfredEvent {
  // Job Events
  JobStart = "alfred_event_job_start",
  JobFinished = "alfred_event_job_finished",
  JobCreate = "alfred_event_job_create",
  JobStageUpdate = "alfred_event_job_stage_update",
  JobExceededRetries = "alfred_event_job_exceeded_retries",
  JobFailed = "alfred_event_job_failed",
  JobInvalid = "alfred_event_job_invalid",
  JobRetry = "alfred_event_job_retry",

  // File Events
  FileStatusUpdate = "alfred_event_file_status_update",
  FileMove = "alfred_event_file_move",
  FileDone = "alfred_event_file_done",
  FileUpdate = "alfred_event_file_update",
  FileRemoveTag = "alfred_event_file_remove_tag",
  FilePropertyDelete = "alfred_event_file_property_delete",
  FilePropertyCreate = "alfred_event_file_property_create",
  FileMoveToRecycleBin = "alfred_event_file_move_to_recycle_bin",
  FileMoveToPending = "alfred_event_file_move_to_pending",
  FileFailed = "alfred_event_file_failed",
  FileExtractedDataDelete = "alfred_event_file_extracted_data_delete",
  FileExtractedDataCreate = "alfred_event_file_extracted_data_create",
  FileChangeTag = "alfred_event_file_change_tag",
  FileCategoryDelete = "alfred_event_file_category_delete",
  FileAddToJob = "alfred_event_file_add_to_job",
  FileCategoryCreate = "alfred_event_file_category_create",
}
