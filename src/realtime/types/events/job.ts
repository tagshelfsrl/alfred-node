import { CompanyInfo, Timestamps, EventProperties } from "./base";
import { AlfredEvent } from "../../../enums";

// Job events
export type JobStartEvent = CompanyInfo &
  Timestamps & {
    eventName: AlfredEvent.JobStart;
    jobId: string;
  };

export type JobFinishedEvent = CompanyInfo &
  Timestamps & {
    eventName: AlfredEvent.JobFinished;
    jobId: string;
  };

export type JobCreateEvent = CompanyInfo &
  Timestamps & {
    eventName: AlfredEvent.JobCreate;
    jobId: string;
    userName: string;
    merge: boolean;
    metadata: any;
    fileCount: number;
  };

export type JobStageUpdateEvent = CompanyInfo &
  Timestamps & {
    eventName: AlfredEvent.JobStageUpdate;
    jobId: string;
    stage: string;
  };

export type JobExceededRetriesEvent = CompanyInfo &
  Timestamps & {
    eventName: AlfredEvent.JobExceededRetries;
    jobId: string;
    userName: string;
    merge: boolean;
    metadata: any;
    fileCount: number;
    retries: number;
    exceededRetries: boolean;
  };

export type JobFailedEvent = CompanyInfo &
  Timestamps & {
    eventName: AlfredEvent.JobFailed;
    jobId: string;
    retries: number;
    exceededRetries: boolean;
  };

export type JobInvalidEvent = CompanyInfo &
  Timestamps & {
    eventName: AlfredEvent.JobInvalid;
    jobId: string;
    retries: number;
    exceededRetries: boolean;
  };

export type JobRetryEvent = CompanyInfo &
  Timestamps & {
    eventName: AlfredEvent.JobRetry;
    jobId: string;
    userName: string;
    merge: boolean;
    metadata: any;
    fileCount: number;
    retries: number;
    exceededRetries: boolean;
  };

// Job and file event types
export type JobEventType =
  | JobStartEvent
  | JobFinishedEvent
  | JobCreateEvent
  | JobStageUpdateEvent
  | JobExceededRetriesEvent
  | JobFailedEvent
  | JobInvalidEvent
  | JobRetryEvent;

export type JobEvent = EventProperties & JobEventType;
