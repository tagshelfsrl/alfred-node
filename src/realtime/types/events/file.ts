import { CompanyInfo, Timestamps, EventProperties } from "./base";
import { AlfredEvent } from "../../../enums";

// File events
type FileStatusUpdateEvent = CompanyInfo &
  Timestamps & {
    eventName: AlfredEvent.FileStatusUpdate;
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
    eventName: AlfredEvent.FileMove;
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
    eventName: AlfredEvent.FileDone;
    blobName: string;
    blobUrl: string;
    fileId: string;
    tagId: string;
    tagName: string;
    fileStatus: string;
  };

type FileAddToJobEvent = CompanyInfo &
  Timestamps & {
    eventName: AlfredEvent.FileAddToJob;
    fileId: string;
    jobId: string;
  };

type FileCategoryCreateEvent = CompanyInfo &
  Timestamps & {
    eventName: AlfredEvent.FileCategoryCreate;
    fileLogId: string;
    description: any;
    confidence: number;
  };

type FileCategoryDeleteEvent = CompanyInfo &
  Timestamps & {
    eventName: AlfredEvent.FileCategoryDelete;
    fileLogId: string;
    description: any;
    confidence: number;
  };

type FileChangeTagEvent = CompanyInfo & {
  eventName: AlfredEvent.FileChangeTag;
  fileId: string;
  previousTagId: string;
  previousTagName: any;
  proposedTagId: string;
  classificationScore: number;
  newTagId: string;
  newTagName: string;
};

type FileExtractedDataCreateEvent = CompanyInfo &
  Timestamps & {
    eventName: AlfredEvent.FileExtractedDataCreate;
    fileLogId: string;
    content: any;
    provider: string;
  };

type FileExtractedDataDeleteEvent = CompanyInfo &
  Timestamps & {
    eventName: AlfredEvent.FileExtractedDataDelete;
    fileLogId: string;
    content: any;
    provider: string;
  };

type FileFailedEvent = CompanyInfo &
  Timestamps & {
    eventName: AlfredEvent.FileFailed;
    fileId: string;
    blobName: string;
    bloUrl: string;
    tagId: string;
    tagName: string;
    classificationScore: number;
    classificationStatus: any;
    fileStatus: any;
  };

type FileMoveToPendingEvent = CompanyInfo &
  Timestamps & {
    eventName: AlfredEvent.FileMoveToPending;
    fileId: string;
    fileName: string;
    fileNameWithoutExtension: string;
    blobName: string;
    bloUrl: string;
  };

type FileMoveToRecycleBinEvent = CompanyInfo &
  Timestamps & {
    eventName: AlfredEvent.FileMoveToRecycleBin;
    fileId: string;
    fileName: string;
    fileNameWithoutExtension: string;
    blobName: string;
    bloUrl: string;
  };

type FilePropertyCreateEvent = CompanyInfo &
  Timestamps & {
    eventName: AlfredEvent.FilePropertyCreate;
    fileLogId: string;
    name: string;
    value: any;
  };

type FilePropertyDeleteEvent = CompanyInfo &
  Timestamps & {
    eventName: AlfredEvent.FilePropertyDelete;
    fileLogId: string;
    name: string;
    value: any;
  };

type FileRemoveTagEvent = CompanyInfo & {
  eventName: AlfredEvent.FileRemoveTag;
  fileId: string;
  tagBeingRemovedId: string;
  tagBeingRemovedName: string;
  classificationScore: number;
};

type FileUpdateEvent = CompanyInfo &
  Timestamps & {
    eventName: AlfredEvent.FileUpdate;
    fileId: string;
    fileLogId: string;
    fileName: string;
    fileNameWithoutExtension: string;
    blobName: string;
    blobUrl: string;
  };

type FileEventType =
  | FileStatusUpdateEvent
  | FileMoveEvent
  | FileDoneEvent
  | FileUpdateEvent
  | FileRemoveTagEvent
  | FilePropertyDeleteEvent
  | FilePropertyCreateEvent
  | FileMoveToRecycleBinEvent
  | FileMoveToPendingEvent
  | FileFailedEvent
  | FileExtractedDataDeleteEvent
  | FileExtractedDataCreateEvent
  | FileChangeTagEvent
  | FileCategoryDeleteEvent
  | FileAddToJobEvent
  | FileCategoryCreateEvent;

export type FileEvent = EventProperties & FileEventType;
