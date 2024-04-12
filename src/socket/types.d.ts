type EventProperties = {
  eventId: string;
  eventTime: number;
};

type JobEventType = {
  eventType: string;
  event: any;
};

type FileEventType = {
  eventType: string;
  event: any;
};

export type JobEvent = EventProperties & JobEventType;

export type FileEvent = EventProperties & FileEventType;
