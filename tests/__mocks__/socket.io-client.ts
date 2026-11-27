// A stand-in for socket.io-client that behaves like the real server: handlers
// are registered per event name and run only when a test emits that name.

type Handler = (...args: any[]) => void;

const createEmitter = () => {
  const handlers = new Map<string, Handler[]>();
  return {
    handlers,
    on: jest.fn((event: string, handler: Handler) => {
      const list = handlers.get(event) ?? [];
      list.push(handler);
      handlers.set(event, list);
    }),
    off: jest.fn((event: string, handler?: Handler) => {
      if (!handler) handlers.delete(event);
      else
        handlers.set(
          event,
          (handlers.get(event) ?? []).filter((h) => h !== handler)
        );
    }),
    emit(event: string, ...args: any[]) {
      for (const handler of (handlers.get(event) ?? []).slice()) {
        handler(...args);
      }
    },
  };
};

const socketEmitter = createEmitter();
const managerEmitter = createEmitter();

export const socket = {
  connected: false,
  active: true,
  on: socketEmitter.on,
  off: socketEmitter.off,
  once: jest.fn(),
  close: jest.fn(() => {
    socket.connected = false;
    socket.active = false;
  }),
  io: {
    on: managerEmitter.on,
    off: managerEmitter.off,
  },
};

export const io = jest.fn(() => {
  socketEmitter.handlers.clear();
  managerEmitter.handlers.clear();
  socket.connected = false;
  socket.active = true;
  return socket;
});

/** Emits a named Socket.IO event (for example `job_event`) with a payload. */
export const __emit = (event: string, ...args: any[]) => {
  socketEmitter.emit(event, ...args);
};

/** Emits a Manager event on `socket.io` (`reconnect_attempt`, `reconnect`). */
export const __emitManager = (event: string, ...args: any[]) => {
  managerEmitter.emit(event, ...args);
};

/** Simulates an established connection. */
export const __connect = () => {
  socket.connected = true;
  socket.active = true;
  socketEmitter.emit("connect");
};

/** Simulates a dropped connection. */
export const __disconnect = (reason = "transport close") => {
  socket.connected = false;
  socketEmitter.emit("disconnect", reason);
};

/**
 * Simulates a failed connection attempt. With `retrying: false` the server
 * refused the connection and socket.io makes no further attempt.
 */
export const __connectError = (err: Error, retrying = true) => {
  socket.connected = false;
  socket.active = retrying;
  socketEmitter.emit("connect_error", err);
};

/** The number of socket handlers registered for an event name. */
export const __listenerCount = (event: string) =>
  (socketEmitter.handlers.get(event) ?? []).length;
