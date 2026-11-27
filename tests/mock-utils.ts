import crypto from "crypto";
import { AlfredClient } from "../src";

export const mockRequest = (client: AlfredClient, mockResp: any) => {
  return jest.fn().mockImplementation(async () => {
    const interceptors = (client._http.interceptors.response as any).handlers;

    // add config to mockResp
    if (!mockResp.config) mockResp.config = {};
    if (!mockResp.config.responseType) mockResp.config.responseType = "json";

    // add headers to mockResp
    if (!mockResp.headers) mockResp.headers = {};

    for (const interceptor of interceptors) {
      if (interceptor.fulfilled) {
        const modifiedResp = await interceptor.fulfilled(mockResp);
        return Promise.resolve(modifiedResp);
      }
    }
    return Promise.resolve(mockResp);
  });
};

// A job event as the real-time server emits it on `job_event`: the flat,
// snake_case event (no envelope). Dates carry no timezone, as Alfred sends them.
export const mockJobEvent = (overrides: Record<string, any> = {}) => {
  return {
    event_name: "alfred_event_job_start",
    company_id: crypto.randomUUID(),
    company_name: "TAGSHELF",
    job_id: crypto.randomUUID(),
    correlation_id: "alfred-node-test",
    creation_date: "2026-11-26T16:34:41.5",
    update_date: "2026-11-26T16:34:45.1731087Z",
    timestamp: "0001-01-01T00:00:00",
    ...overrides,
  };
};

// A file event as the real-time server emits it on `file_event`.
export const mockFileEvent = (overrides: Record<string, any> = {}) => {
  const fileId = crypto.randomUUID();
  return {
    event_name: "alfred_event_file_status_update",
    company_id: crypto.randomUUID(),
    company_name: "TAGSHELF",
    blob_name: fileId,
    blob_url: `https://example.blob.core.windows.net/files/${fileId}`,
    file_id: fileId,
    job_id: crypto.randomUUID(),
    tag_id: null,
    tag_name: null,
    manual_classification: false,
    classification_score: 0,
    classification_status: "waiting",
    file_status: "preparing",
    creation_date: "2026-11-26T16:34:41.94",
    update_date: "2026-11-26T16:34:49.36",
    timestamp: "0001-01-01T00:00:00",
    ...overrides,
  };
};
