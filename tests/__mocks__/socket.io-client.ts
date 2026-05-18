import { EventType } from "../../src/config/constants";
import { mockFileEvent, mockJobEvent } from "../mock-utils";

let mockFailAuth = false;
const callbacks = new Map<string, Function[]>();
const managerCallbacks = new Map<string, Function[]>();

const registerCallback = (map: Map<string, Function[]>, event: string, callback: Function) => {
  map.set(event, [...(map.get(event) ?? []), callback]);
};

const emit = (map: Map<string, Function[]>, event: string, ...args: any[]) => {
  for (const callback of map.get(event) ?? []) {
    callback(...args);
  }
};

export const socket = {
  connected: false,
  on: jest.fn((event, callback) => {
    registerCallback(callbacks, event, callback);
    if (event === "connect_error") {
      if (mockFailAuth) callback(new Error("Authentication failed"));
    } else if (event === EventType.JobEvent) {
      callback(mockJobEvent());
    } else if (event === EventType.FileEvent) {
      callback(mockFileEvent());
    } else {
      callback(mockFileEvent());
    }
  }),
  once: jest.fn((event, callback) => {
    const wrapped = (...args: any[]) => {
      socket.off(event, wrapped);
      callback(...args);
    };
    registerCallback(callbacks, event, wrapped);
  }),
  off: jest.fn((event, callback) => {
    callbacks.set(
      event,
      (callbacks.get(event) ?? []).filter((registered) => registered !== callback)
    );
  }),
  close: jest.fn(),
  io: {
    on: jest.fn((event, callback) => {
      registerCallback(managerCallbacks, event, callback);
    }),
  },
};

export const io = jest.fn(() => socket);

export const __simulateAuthFailure = () => {
  mockFailAuth = true;
};

export const __simulateAuthSuccess = () => {
  mockFailAuth = false;
};

export const __emitSocketEvent = (event: string, ...args: any[]) => {
  if (event === "connect") {
    socket.connected = true;
  }
  if (event === "disconnect") {
    socket.connected = false;
  }
  emit(callbacks, event, ...args);
};

export const __emitManagerEvent = (event: string, ...args: any[]) => {
  emit(managerCallbacks, event, ...args);
};

export const __resetSocketMock = () => {
  mockFailAuth = false;
  socket.connected = false;
  callbacks.clear();
  managerCallbacks.clear();
};
