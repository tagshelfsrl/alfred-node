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
