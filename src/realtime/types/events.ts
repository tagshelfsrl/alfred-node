// Common event properties
type EventProperties = {
  eventId: string;
  eventTime: number;
};

type CompanyInfo = {
  companyId: string;
  companyName: string;
};

type Timestamps = {
  creationDate: Date;
  updateDate: Date;
};

// Job events
type JobStartEvent = CompanyInfo &
  Timestamps & {
    eventName: "alfred_event_job_start";
    jobId: string;
  };

type JobFinishedEvent = CompanyInfo &
  Timestamps & {
    eventName: "alfred_event_job_finished";
    jobId: string;
  };

type JobCreateEvent = CompanyInfo &
  Timestamps & {
    eventName: "alfred_event_job_create";
    jobId: string;
    userName: string;
    merge: boolean;
    metadata: any;
    fileCount: number;
  };

type JobStageUpdateEvent = CompanyInfo &
  Timestamps & {
    eventName: "alfred_event_job_stage_update";
    jobId: string;
    stage: string;
  };

// File events
type FileStatusUpdateEvent = CompanyInfo &
  Timestamps & {
    eventName: "alfred_event_file_status_update";
    blobName: string;
    blobUrl: string;
    fileId: string;
    tagId: string;
    tagName: string;
    manualClassification: boolean;
    classificationScore: number;
    fileStatus: string;
  };

type FileMoveEvent = CompanyInfo &
  Timestamps & {
    eventName: "alfred_event_file_move";
    blobName: string;
    blobUrl: string;
    fileId: string;
    fileName: string;
    fileNameWithoutExtension: string;
    previousFileDirectory: string;
    newFileDirectory: string;
  };

type FileDoneEvent = CompanyInfo &
  Timestamps & {
    eventName: "alfred_event_file_done";
    blobName: string;
    blobUrl: string;
    fileId: string;
    tagId: string;
    tagName: string;
    fileStatus: string;
  };

// Job and file event types
type JobEventType =
  | { eventType: "job_event"; event: JobStartEvent }
  | { eventType: "job_event"; event: JobFinishedEvent }
  | { eventType: "job_event"; event: JobCreateEvent }
  | { eventType: "job_event"; event: JobStageUpdateEvent };

type FileEventType =
  | { eventType: "file_event"; event: FileStatusUpdateEvent }
  | { eventType: "file_event"; event: FileMoveEvent }
  | { eventType: "file_event"; event: FileDoneEvent };

// Final types
export type JobEvent = EventProperties & JobEventType;
export type FileEvent = EventProperties & FileEventType;
export {};
