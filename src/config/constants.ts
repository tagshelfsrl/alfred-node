/** The Socket.IO event names (streams) the real-time server emits. */
export enum EventType {
  JobEvent = "job_event",
  FileEvent = "file_event",
  BulkTaskEvent = "bulk_task_event",
}
