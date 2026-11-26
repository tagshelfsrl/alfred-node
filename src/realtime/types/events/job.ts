import { CompanyInfo, Timestamps, EventProperties, Correlation } from "./base";
import { AlfredEvent } from "../../../enums";

/** Fields every job event carries. */
type JobBase = EventProperties &
  CompanyInfo &
  Timestamps &
  Correlation & {
    jobId: string;
  };

/** Fields of the job create, retry and exceeded-retries events. */
type JobDetails = {
  userName: string;
  merge: boolean;
  /** The job's metadata as a JSON string. Left out when the job has none. */
  metadata?: string;
  fileCount: number;
  fileUrls: string[];
};

// Job events
export type JobStartEvent = JobBase & {
  eventName: AlfredEvent.JobStart;
};

export type JobFinishedEvent = JobBase & {
  eventName: AlfredEvent.JobFinished;
};

export type JobCreateEvent = JobBase &
  JobDetails & {
    eventName: AlfredEvent.JobCreate;
  };

export type JobStageUpdateEvent = JobBase & {
  eventName: AlfredEvent.JobStageUpdate;
  /** The stage the job moved to, for example `syncing`. */
  stage: string;
};

/**
 * A job that used up its retries. Alfred before 1.131.0 sends it with the
 * `eventName` `alfred_event_job_retry`; from 1.131.0 it is
 * `alfred_event_job_exceeded_retries`. The SDK delivers both to subscribers of
 * {@link AlfredEvent.JobExceededRetries} and leaves `eventName` as sent.
 */
export type JobExceededRetriesEvent = JobBase &
  JobDetails & {
    eventName: AlfredEvent.JobExceededRetries | AlfredEvent.JobRetry;
    retries: number;
    exceededRetries: boolean;
    errorMessages?: string[];
  };

export type JobFailedEvent = JobBase & {
  eventName: AlfredEvent.JobFailed;
  retries: number;
  exceededRetries: boolean;
  errorMessages?: string[];
};

export type JobInvalidEvent = JobBase & {
  eventName: AlfredEvent.JobInvalid;
  retries: number;
  exceededRetries: boolean;
  errorMessages?: string[];
  hasBrokenInputSources: boolean;
};

export type JobCancelledEvent = JobBase & {
  eventName: AlfredEvent.JobCancelled;
  cancellationReason?: string;
  errorMessages?: string[];
};

export type JobExpiredEvent = JobBase & {
  eventName: AlfredEvent.JobExpired;
  /** The stage the job was in when it expired. */
  previousStage: string;
  /** When the job's current attempt started (UTC). */
  attemptStartedAt: string;
  expirationDays: number;
};

/**
 * @deprecated Not sent from Alfred 1.131.0. Before that version Alfred sent
 * this name only for a job that used up its retries; see
 * {@link JobExceededRetriesEvent}.
 */
export type JobRetryEvent = JobBase &
  JobDetails & {
    eventName: AlfredEvent.JobRetry;
    retries: number;
    exceededRetries: boolean;
    errorMessages?: string[];
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
  | JobCancelledEvent
  | JobExpiredEvent
  | JobRetryEvent;

export type JobEvent = JobEventType;
