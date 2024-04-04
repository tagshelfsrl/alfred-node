import { AlfredClient } from "../src";

export const mockRequest = (client: AlfredClient, mockResp: any) => {
  return jest.fn().mockImplementation(async () => {
    const interceptors = (client._http.interceptors.response as any).handlers;

    for (const interceptor of interceptors) {
      if (interceptor.fulfilled) {
        const modifiedResp = await interceptor.fulfilled(mockResp);
        return Promise.resolve(modifiedResp);
      }
    }
    return Promise.resolve(mockResp);
  });
};
