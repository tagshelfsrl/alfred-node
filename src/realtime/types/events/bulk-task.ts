import { CompanyInfo, EventProperties } from "./base";

/**
 * An event of the `bulk_task_event` stream. Its fields are not documented
 * yet, so it is typed loosely: read the fields you need and check that they
 * are present.
 */
export type BulkTaskEvent = EventProperties &
  CompanyInfo & {
    eventName: string;
    creationDate?: Date;
    updateDate?: Date;
    [key: string]: any;
  };
