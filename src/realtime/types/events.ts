type EventProperties = {
  eventId: string;
  eventTime: number;
};

type JobEventType =
  | {
  eventType: "job_event";
  event: {
    eventName: "alfred_event_job_start" | "alfred_event_job_finished";
    companyId: string;
    companyName: string;
    jobId: string;
    creationDate: Date;
    updateDate: Date;
  };
}
  | {
  eventType: "job_event";
  event: {
    eventName: "alfred_event_job_stage_update";
    companyId: string;
    companyName: string;
    jobId: string;
    stage: string;
    creationDate: Date;
    updateDate: Date;
  };
};

type FileEventType =
  | {
  eventType: "file_event";
  event: {
    eventName: "alfred_event_file_status_update";
    companyId: string;
    companyName: string;
    blobName: string;
    blobUrl: string;
    fileId: string;
    tagId: string;
    tagName: string;
    manualClassification: boolean;
    classificationScore: number;
    fileStatus: string;
    creationDate: Date;
    updateDate: Date;
  };
}
  | {
  eventType: "file_event";
  event: {
    eventName: "alfred_event_file_move";
    companyId: string;
    companyName: string;
    blobName: string;
    blobUrl: string;
    fileId: string;
    fileName: string;
    fileNameWithoutExtension: string;
    previousFileDirectory: string;
    newFileDirectory: string;
    creationDate: Date;
    updateDate: Date;
  };
}
  | {
  eventType: "file_event";
  event: {
    eventName: "alfred_event_file_done";
    companyId: string;
    companyName: string;
    blobName: string;
    blobUrl: string;
    fileId: string;
    tagId: string;
    tagName: string;
    fileStatus: string;
    creationDate: Date;
    updateDate: Date;
  };
};

export type JobEvent = EventProperties & JobEventType;

export type FileEvent = EventProperties & FileEventType;
