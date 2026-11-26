export type CompanyInfo = {
  /** The account (tenant) the event belongs to. */
  companyId: string;
  /** The account's name. Some events (such as job create) can arrive without it. */
  companyName?: string;
};

export type Timestamps = {
  /** When the job or file the event is about was created (UTC). */
  creationDate: Date;
  /** When the job or file the event is about was last updated (UTC). */
  updateDate: Date;
};

export type EventProperties = {
  /**
   * The UTC time the event happened. On Alfred before 1.131.0 it is unset:
   * a date in year 1 (`0001-01-01T00:00:00.000Z`).
   */
  timestamp: Date;
  /** @deprecated Never delivered by the realtime server. */
  eventId?: string;
  /** @deprecated Never delivered by the realtime server. */
  eventTime?: number;
};

/** A field sent only when the job has one: the caller's correlation ID. */
export type Correlation = {
  correlationId?: string;
};
