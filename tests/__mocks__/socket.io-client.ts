import { EventName } from "../../src/config/constants";
import { mockFileEvent, mockJobEvent } from "../mock-utils";

let mockFailAuth = false;

export const socket = {
  on: jest.fn((event, callback) => {
    if (event === "connect_error") {
      if (mockFailAuth) callback(new Error("Authentication failed"));
    } else if (event === EventName.JobEvent) {
      callback(mockJobEvent());
    } else if (event === EventName.FileEvent) {
      callback(mockFileEvent());
    } else {
      callback(mockFileEvent());
    }
  }),
  close: jest.fn(),
};

export const io = jest.fn(() => socket);

export const __simulateAuthFailure = () => {
  mockFailAuth = true;
};

export const __simulateAuthSuccess = () => {
  mockFailAuth = false;
};
