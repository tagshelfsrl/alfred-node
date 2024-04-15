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

export const mockJobEvent = () => {
  return {
    event_id: Math.random().toString(36).substring(2, 10),
    event_type: "job_event",
    event_time: Date.now() / 1000,
    event: {
      event_name: "alfred_event_job_start",
      company_id: crypto.randomUUID(),
      company_name: "TAGSHELF",
      job_id: crypto.randomUUID(),
      creation_date: new Date().toISOString(),
      update_date: new Date().toISOString(),
    },
  };
};

export const mockFileEvent = () => {
  return {
    event_id: Math.random().toString(36).substring(2, 10),
    event_type: "file_event",
    event_time: Date.now() / 1000,
    event: {
      event_name: "alfred_event_file_status_update",
      company_id: crypto.randomUUID(),
      company_name: "TAGSHELF",
      blob_name: crypto.randomUUID(),
      blob_url: "https://picsum.photos/200/300",
      file_id: crypto.randomUUID(),
      tag_id: crypto.randomUUID(),
      tag_name: "INVOICE",
      manual_classification: false,
      classification_score: Math.random(),
      classification_status: "waiting",
      file_status: "finished",
      creation_date: new Date().toISOString(),
      update_date: new Date().toISOString(),
    },
  };
};
