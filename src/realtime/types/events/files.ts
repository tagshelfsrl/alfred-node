import { CompanyInfo, Timestamps, EventProperties } from "./base";

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

  type FileAddToJobEvent = CompanyInfo &
  Timestamps & {
    eventName: "alfred_event_file_add_to_job",
    fileId: string,
    jobId: string,  
  };

  type FileCategoryCreateEvent = CompanyInfo &
  Timestamps & {
    eventName: "alfred_event_file_category_create",
    fileLogId: string,
    description: any,
    confidence: number,
  };

  type FileCategoryDeleteEvent = CompanyInfo &
  Timestamps & {
    eventName: "alfred_event_file_category_delete",
    fileLogId: string,
    description: any,
    confidence: number,
  };

  type FileChangeTagEvent = CompanyInfo & {
    eventName: "alfred_event_file_change_tag",
    fileId: string,
    previousTagId: string,
    previousTagName: any,
    proposedTagId: string,
    classificationScore: number,
    newTagId: string,
    newTagName: string,
  };

  type FileExtractedDataCreateEvent = CompanyInfo & 
  Timestamps & {
    eventName: "alfred_event_file_extracted_data_create",
    fileLogId: string,
    content: any,
    provider: string,
  };

  type FileExtractedDataDeleteEvent = CompanyInfo & 
  Timestamps & {
    eventName: "alfred_event_file_extracted_data_delete",
    fileLogId: string,
    content: any,
    provider: string,
  };

  type FileFailedEvent = CompanyInfo & 
  Timestamps & {
    eventName: "alfred_event_file_failed",
    fileId: string,
    blobName: string,
    bloUrl: string,
    tagId: string,
    tagName: string,
    classificationScore: number,
    classificationStatus: any,
    fileStatus: any,
  };

  type FileMoveToPendingEvent = CompanyInfo & 
  Timestamps & {
    eventName: "alfred_event_file_move_to_pending",
    fileId: string,
    fileName: string,
    fileNameWithoutExtension: string,
    blobName: string,
    bloUrl: string,
  };

  type FileMoveToRecycleBinEvent = CompanyInfo & 
  Timestamps & {
    eventName: "alfred_event_file_move_to_recycle_bin",
    fileId: string,
    fileName: string,
    fileNameWithoutExtension: string,
    blobName: string,
    bloUrl: string,
  };

  type FilePropertyCreateEvent = CompanyInfo & 
  Timestamps & {
    eventName: "alfred_event_file_property_create",
    fileLogId: string,
    name: string,
    value: any,
  };

  type FilePropertyDeleteEvent = CompanyInfo & 
  Timestamps & {
    eventName: "alfred_event_file_property_delete",
    fileLogId: string,
    name: string,
    value: any,
  };

  type FileRemoveTagEvent = CompanyInfo & {
    eventName: "alfred_event_file_remove_tag",
    fileId: string,
    tagBeingRemovedId: string,
    tagBeingRemovedName: string,
    classificationScore: number,
  };

  type FileUpdateEvent = CompanyInfo & 
  Timestamps & {
    eventName: "alfred_event_file_update",
    fileId: string,
    fileLogId: string,
    fileName: string,
    fileNameWithoutExtension: string,
    blobName: string,
    blobUrl: string,
  };

  type FileEventType =
  | { eventType: "file_event"; event: FileStatusUpdateEvent }
  | { eventType: "file_event"; event: FileMoveEvent }
  | { eventType: "file_event"; event: FileDoneEvent }
  | { eventType: "file_event"; event: FileUpdateEvent }
  | { eventType: "file_event"; event: FileRemoveTagEvent }
  | { eventType: "file_event"; event: FilePropertyDeleteEvent }
  | { eventType: "file_event"; event: FilePropertyCreateEvent }
  | { eventType: "file_event"; event: FileMoveToRecycleBinEvent }
  | { eventType: "file_event"; event: FileMoveToPendingEvent }
  | { eventType: "file_event"; event: FileFailedEvent }
  | { eventType: "file_event"; event: FileExtractedDataDeleteEvent }
  | { eventType: "file_event"; event: FileExtractedDataCreateEvent }
  | { eventType: "file_event"; event: FileChangeTagEvent }
  | { eventType: "file_event"; event: FileCategoryDeleteEvent }
  | { eventType: "file_event"; event: FileAddToJobEvent }
  | { eventType: "file_event"; event: FileCategoryCreateEvent };

  export type FileEvent = EventProperties & FileEventType;