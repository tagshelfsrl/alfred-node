import { CompanyInfo, Timestamps, EventProperties } from "./base";
import { AlfredEvent } from "../../../enums";

/** Fields every file event carries. */
type FileBase = EventProperties & CompanyInfo;

/** The job the file belongs to, when it belongs to one. */
type FileJob = {
  jobId?: string | null;
};

/** The file's blob. */
type FileBlob = {
  blobName: string;
  blobUrl: string;
  /** @deprecated Misspelling of `blobUrl`; never delivered. Use `blobUrl`. */
  bloUrl?: string;
};

/** The file's name, with and without its extension. */
type FileNames = {
  fileName: string;
  fileNameWithoutExtension: string;
};

/** The file's document type (tag). `null` while the file has none. */
type FileTag = {
  tagId: string | null;
  tagName: string | null;
};

// File events
export type FileCreateEvent = FileBase &
  Timestamps &
  FileJob &
  FileBlob &
  FileNames & {
    eventName: AlfredEvent.FileCreate;
    fileId: string;
  };

export type FileStatusUpdateEvent = FileBase &
  Timestamps &
  FileJob &
  FileBlob &
  FileTag & {
    eventName: AlfredEvent.FileStatusUpdate;
    fileId: string;
    manualClassification: boolean;
    classificationScore: number;
    classificationStatus: string;
    fileStatus: string;
  };

export type FileMoveEvent = FileBase &
  Timestamps &
  FileJob &
  FileBlob &
  FileNames & {
    eventName: AlfredEvent.FileMove;
    fileId: string;
    previousFileDirectory: string;
    newFileDirectory: string;
  };

export type FileDoneEvent = FileBase &
  Timestamps &
  FileJob &
  FileBlob &
  FileTag & {
    eventName: AlfredEvent.FileDone;
    fileId: string;
    fileStatus: string;
  };

/** A file linked to a job. This event carries no `creationDate` or `updateDate`. */
export type FileAddToJobEvent = FileBase & {
  eventName: AlfredEvent.FileAddToJob | AlfredEvent.FileAddedToJob;
  fileId: string;
  jobId: string;
};

/** A file linked to a job. */
export type FileAddedToJobEvent = FileAddToJobEvent;

export type FileCategoryCreateEvent = FileBase &
  Timestamps &
  FileJob & {
    eventName: AlfredEvent.FileCategoryCreate;
    fileLogId: string;
    description: string;
    confidence: number;
  };

export type FileCategoryDeleteEvent = FileBase &
  Timestamps &
  FileJob & {
    eventName: AlfredEvent.FileCategoryDelete;
    fileLogId: string;
    description: string;
    confidence: number;
  };

/** A file's document type changed. This event carries no `creationDate` or `updateDate`. */
export type FileChangeTagEvent = FileBase &
  FileJob & {
    eventName: AlfredEvent.FileChangeTag;
    fileId: string;
    previousTagId: string;
    previousTagName: string;
    proposedTagId: string;
    classificationScore: number;
    newTagId: string;
    newTagName: string;
  };

export type FileExtractedDataCreateEvent = FileBase &
  Timestamps &
  FileJob & {
    eventName: AlfredEvent.FileExtractedDataCreate;
    fileLogId: string;
    /** The extracted content, as a string (often JSON). */
    content: string;
    provider: string;
  };

export type FileExtractedDataDeleteEvent = FileBase &
  Timestamps &
  FileJob & {
    eventName: AlfredEvent.FileExtractedDataDelete;
    fileLogId: string;
    /** The extracted content, as a string (often JSON). */
    content: string;
    provider: string;
  };

export type FileFailedEvent = FileBase &
  Timestamps &
  FileJob &
  FileBlob &
  FileTag & {
    eventName: AlfredEvent.FileFailed;
    fileId: string;
    classificationScore: number;
    classificationStatus: string;
    fileStatus: string;
    errorMessages?: string[];
  };

export type FileMoveToPendingEvent = FileBase &
  Timestamps &
  FileJob &
  FileBlob &
  FileNames & {
    eventName: AlfredEvent.FileMoveToPending;
    fileId: string;
  };

export type FileMoveToRecycleBinEvent = FileBase &
  Timestamps &
  FileJob &
  FileBlob &
  FileNames & {
    eventName: AlfredEvent.FileMoveToRecycleBin;
    fileId: string;
  };

export type FileMoveToDecomposedEvent = FileBase &
  Timestamps &
  FileJob &
  FileBlob &
  FileNames & {
    eventName: AlfredEvent.FileMoveToDecomposed;
    fileId: string;
  };

/** A file split into its documents. This event carries no `jobId`. */
export type FileDecomposedEvent = FileBase &
  Timestamps &
  FileBlob &
  FileNames & {
    eventName: AlfredEvent.FileDecomposed;
    fileId: string;
  };

export type FilePropertyCreateEvent = FileBase &
  Timestamps &
  FileJob & {
    eventName: AlfredEvent.FilePropertyCreate;
    fileLogId: string;
    name: string;
    value: string;
  };

export type FilePropertyDeleteEvent = FileBase &
  Timestamps &
  FileJob & {
    eventName: AlfredEvent.FilePropertyDelete;
    fileLogId: string;
    name: string;
    value: string;
  };

/**
 * A document type removed from a file. Alfred before 1.131.0 sends it with the
 * `eventName` `alfred_event_file_change_tag`; from 1.131.0 it is
 * `alfred_event_file_remove_tag`. The SDK delivers both to subscribers of
 * {@link AlfredEvent.FileRemoveTag} and leaves `eventName` as sent. This event
 * carries no `creationDate` or `updateDate`.
 */
export type FileRemoveTagEvent = FileBase &
  FileJob & {
    eventName: AlfredEvent.FileRemoveTag | AlfredEvent.FileChangeTag;
    fileId: string;
    tagBeingRemovedId: string;
    tagBeingRemovedName: string;
    classificationScore: number;
  };

export type FileUpdateEvent = FileBase &
  Timestamps &
  FileJob &
  FileBlob &
  FileNames & {
    eventName: AlfredEvent.FileUpdate;
    fileId: string;
    fileLogId: string;
  };

export type FileEventType =
  | FileCreateEvent
  | FileStatusUpdateEvent
  | FileMoveEvent
  | FileDoneEvent
  | FileUpdateEvent
  | FileRemoveTagEvent
  | FilePropertyDeleteEvent
  | FilePropertyCreateEvent
  | FileMoveToRecycleBinEvent
  | FileMoveToPendingEvent
  | FileMoveToDecomposedEvent
  | FileDecomposedEvent
  | FileFailedEvent
  | FileExtractedDataDeleteEvent
  | FileExtractedDataCreateEvent
  | FileChangeTagEvent
  | FileCategoryDeleteEvent
  | FileAddToJobEvent
  | FileCategoryCreateEvent;

export type FileEvent = FileEventType;
