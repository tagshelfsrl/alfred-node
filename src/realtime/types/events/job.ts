import { CompanyInfo, Timestamps, EventProperties } from "./base";

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

type JobExceededRetriesEvent = CompanyInfo &
  Timestamps & {
    eventName: "alfred_event_job_exceeded_retries";
    jobId: string;
    userName: string;
    merge: boolean;
    metadata: any;
    fileCount: number;
    retries: number;
    exceededRetries: boolean;
  };

type JobFailedEvent = CompanyInfo &
  Timestamps & {
    eventName: "alfred_event_job_failed";
    jobId: string;
    retries: number;
    exceededRetries: boolean;
  };

type JobInvalidEvent = CompanyInfo &
  Timestamps & {
    eventName: "alfred_event_job_invalid";
    jobId: string;
    retries: number;
    exceededRetries: boolean;
  };

type JobRetryEvent = CompanyInfo &
  Timestamps & {
    eventName: "alfred_event_job_retry";
    jobId: string;
    userName: string;
    merge: boolean;
    metadata: any;
    fileCount: number;
    retries: number;
    exceededRetries: boolean;
  };

// Job and file event types
type JobEventType =
  | { eventType: "job_event"; event: JobStartEvent }
  | { eventType: "job_event"; event: JobFinishedEvent }
  | { eventType: "job_event"; event: JobCreateEvent }
  | { eventType: "job_event"; event: JobStageUpdateEvent }
  | { eventType: "jov_event"; event: JobExceededRetriesEvent }
  | { eventType: "jov_event"; event: JobFailedEvent }
  | { eventType: "jov_event"; event: JobInvalidEvent }
  | { eventType: "jov_event"; event: JobRetryEvent };

export type JobEvent = EventProperties & JobEventType;
