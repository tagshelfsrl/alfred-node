import { AlfredRealTimeClient, Configuration } from "../../src";
import { io } from "socket.io-client";
import {
  __connect,
  __connectError,
  __disconnect,
  __emit,
  __emitManager,
  __listenerCount,
  socket,
} from "../__mocks__/socket.io-client";
import { AlfredEvent } from "../../src/enums";
import { EventType } from "../../src/config/constants";
import { JobEvent, FileEvent } from "../../src/realtime/types";
import { mockFileEvent, mockJobEvent } from "../mock-utils";
import * as realtime from "../../src/realtime";

// Mock Socket IO client library
jest.mock("socket.io-client");

const config = Configuration.v1("staging", {
  realTimeURL: "http://localhost:5000",
});
const apiKey = "AXXX+XXX/XX=";

// Lets pending promise callbacks (rejections of async callbacks) run.
const flush = () => new Promise((resolve) => setImmediate(resolve));

// The production shape of a job that used up its retries (Alfred < 1.131.0).
const exceededRetriesBefore = () =>
  mockJobEvent({
    event_name: "alfred_event_job_retry",
    user_name: "Tagshelf Node Demo",
    merge: false,
    metadata: "{}",
    file_count: 1,
    file_urls: [],
    retries: 3,
    exceeded_retries: true,
  });

// The production shape of a removed document type (Alfred < 1.131.0).
const removeTagBefore = () => {
  const event: Record<string, any> = mockFileEvent({
    event_name: "alfred_event_file_change_tag",
    tag_being_removed_id: "5db8ed9f-0000-0000-0000-000000000000",
    tag_being_removed_name: "Invoice",
    classification_score: 0.9,
  });
  delete event.creation_date;
  delete event.update_date;
  return event;
};

describe("realtime: alfred realtime client", () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    jest.useRealTimers();
  });

  it("connects to the realtime server with the API key", () => {
    const _ = new AlfredRealTimeClient(config, apiKey);

    expect(io).toHaveBeenCalledWith(
      config.realTimeURL,
      expect.objectContaining({ query: { apiKey } })
    );
    expect(socket.close).not.toHaveBeenCalled();
  });

  it("attaches one socket listener per stream whatever is subscribed", () => {
    const client = new AlfredRealTimeClient(config, apiKey);
    client.onJobEvent(jest.fn());
    client.onJobEvent(jest.fn());
    client.onFileEvent(jest.fn());
    client.onBulkTaskEvent(jest.fn());
    client.on(AlfredEvent.JobFinished, jest.fn());
    client.on(AlfredEvent.JobFinished, jest.fn());
    client.on(AlfredEvent.FileDone, jest.fn());
    client.on(AlfredEvent.JobExceededRetries, jest.fn());

    expect(__listenerCount("job_event")).toBe(1);
    expect(__listenerCount("file_event")).toBe(1);
    expect(__listenerCount("bulk_task_event")).toBe(1);
    expect(__listenerCount(AlfredEvent.JobFinished)).toBe(0);
    expect(__listenerCount(AlfredEvent.FileDone)).toBe(0);
    expect(__listenerCount("connect_error")).toBe(1);
  });

  it("delivers job events to onJobEvent in camelCase with dates", () => {
    const client = new AlfredRealTimeClient(config, apiKey);
    const handler = jest.fn();
    client.onJobEvent(handler);

    const payload = mockJobEvent();
    __emit("job_event", payload);

    expect(handler).toHaveBeenCalledTimes(1);
    const event: JobEvent = handler.mock.calls[0][0];
    expect(event.eventName).toBe(AlfredEvent.JobStart);
    expect(event.jobId).toBe(payload.job_id);
    expect(event.correlationId).toBe("alfred-node-test");
    expect(event.creationDate.toISOString()).toBe("2026-11-26T16:34:41.500Z");
    expect(event.updateDate.toISOString()).toBe("2026-11-26T16:34:45.173Z");
    expect(event.timestamp).toBeInstanceOf(Date);
    expect(event.timestamp.getUTCFullYear()).toBe(1);
    expect(event).not.toHaveProperty("eventId");
  });

  it("delivers file events to onFileEvent and not to onJobEvent", () => {
    const client = new AlfredRealTimeClient(config, apiKey);
    const fileHandler = jest.fn();
    const jobHandler = jest.fn();
    client.onFileEvent(fileHandler);
    client.onJobEvent(jobHandler);

    __emit("file_event", mockFileEvent());

    expect(jobHandler).not.toHaveBeenCalled();
    expect(fileHandler).toHaveBeenCalledTimes(1);
    const event: FileEvent = fileHandler.mock.calls[0][0];
    expect(event.eventName).toBe(AlfredEvent.FileStatusUpdate);
    if (event.eventName === AlfredEvent.FileStatusUpdate) {
      expect(event.tagId).toBeNull();
      expect(event.blobUrl).toContain(event.fileId);
      expect(event.creationDate.toISOString()).toBe("2026-11-26T16:34:41.940Z");
    }
  });

  it("delivers bulk task events to onBulkTaskEvent", () => {
    const client = new AlfredRealTimeClient(config, apiKey);
    const handler = jest.fn();
    const byName = jest.fn();
    client.onBulkTaskEvent(handler);
    client.on(AlfredEvent.BulkTaskStart, byName);

    __emit("bulk_task_event", {
      event_name: "alfred_event_bulk_task_start",
      company_id: "c",
      timestamp: "2026-11-26T16:34:41Z",
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].eventName).toBe(AlfredEvent.BulkTaskStart);
    expect(byName).toHaveBeenCalledTimes(1);
  });

  it("calls on(eventName) only for payloads with that event name", () => {
    const client = new AlfredRealTimeClient(config, apiKey);
    const finished = jest.fn();
    const fileDone = jest.fn();
    client.on(AlfredEvent.JobFinished, finished);
    client.on(AlfredEvent.FileDone, fileDone);

    __emit(
      "job_event",
      mockJobEvent({ event_name: "alfred_event_job_create" })
    );
    __emit("job_event", mockJobEvent());
    __emit("file_event", mockFileEvent());
    expect(finished).not.toHaveBeenCalled();
    expect(fileDone).not.toHaveBeenCalled();

    const payload = mockJobEvent({ event_name: "alfred_event_job_finished" });
    __emit("job_event", payload);
    __emit(
      "file_event",
      mockFileEvent({
        event_name: "alfred_event_file_done",
        tag_id: "5db8ed9f",
        tag_name: "Invoice",
        file_status: "finished",
      })
    );

    expect(finished).toHaveBeenCalledTimes(1);
    expect(finished.mock.calls[0][0].jobId).toBe(payload.job_id);
    expect(fileDone).toHaveBeenCalledTimes(1);
    expect(fileDone.mock.calls[0][0].tagName).toBe("Invoice");
  });

  it("accepts plain strings and stream names in on()", () => {
    const client = new AlfredRealTimeClient(config, apiKey);
    const finished = jest.fn();
    const stream = jest.fn();
    client.on("alfred_event_job_finished", finished);
    client.on("job_event", stream);
    client.on(EventType.FileEvent, stream);

    __emit(
      "job_event",
      mockJobEvent({ event_name: "alfred_event_job_finished" })
    );
    __emit("file_event", mockFileEvent());

    expect(finished).toHaveBeenCalledTimes(1);
    expect(stream).toHaveBeenCalledTimes(2);
  });

  it("calls the stream callbacks, then the event callbacks, in order", () => {
    const client = new AlfredRealTimeClient(config, apiKey);
    const order: string[] = [];
    client.on(AlfredEvent.JobFinished, () => {
      order.push("first");
    });
    client.on(AlfredEvent.JobFinished, () => {
      order.push("second");
    });
    client.onJobEvent(() => {
      order.push("stream");
    });

    __emit(
      "job_event",
      mockJobEvent({ event_name: "alfred_event_job_finished" })
    );

    expect(order).toEqual(["stream", "first", "second"]);
  });

  it("removes one callback or all with off()", () => {
    const client = new AlfredRealTimeClient(config, apiKey);
    const a = jest.fn();
    const b = jest.fn();
    const stream = jest.fn();
    client.on(AlfredEvent.JobFinished, a);
    client.on(AlfredEvent.JobFinished, b);
    client.onJobEvent(stream);
    const finished = () =>
      __emit(
        "job_event",
        mockJobEvent({ event_name: "alfred_event_job_finished" })
      );

    client.off(AlfredEvent.JobFinished, a);
    finished();
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);

    client.off(AlfredEvent.JobFinished);
    client.off(EventType.JobEvent, stream);
    client.off(AlfredEvent.FileDone, a);
    finished();
    expect(b).toHaveBeenCalledTimes(1);
    expect(stream).toHaveBeenCalledTimes(1);
  });

  it("delivers a payload once to a callback registered under several names", () => {
    const client = new AlfredRealTimeClient(config, apiKey);
    const handler = jest.fn();
    client.onJobEvent(handler);
    client.on(AlfredEvent.JobFinished, handler);
    client.on(AlfredEvent.JobFinished, handler);

    __emit(
      "job_event",
      mockJobEvent({ event_name: "alfred_event_job_finished" })
    );

    expect(handler).toHaveBeenCalledTimes(1);
  });

  describe("events that arrive under another name before Alfred 1.131.0", () => {
    it("delivers a job_retry with exceeded retries to JobExceededRetries", () => {
      const client = new AlfredRealTimeClient(config, apiKey);
      const exceeded = jest.fn();
      const retry = jest.fn();
      client.on(AlfredEvent.JobExceededRetries, exceeded);
      client.on(AlfredEvent.JobRetry, retry);

      __emit("job_event", exceededRetriesBefore());

      expect(exceeded).toHaveBeenCalledTimes(1);
      expect(exceeded.mock.calls[0][0].eventName).toBe(AlfredEvent.JobRetry);
      expect(exceeded.mock.calls[0][0].exceededRetries).toBe(true);
      expect(retry).toHaveBeenCalledTimes(1);

      __emit(
        "job_event",
        mockJobEvent({
          event_name: "alfred_event_job_retry",
          exceeded_retries: false,
        })
      );
      expect(exceeded).toHaveBeenCalledTimes(1);
    });

    it("delivers the 1.131.0 job_exceeded_retries once", () => {
      const client = new AlfredRealTimeClient(config, apiKey);
      const exceeded = jest.fn();
      const retry = jest.fn();
      client.on(AlfredEvent.JobExceededRetries, exceeded);
      client.on(AlfredEvent.JobRetry, retry);

      __emit("job_event", {
        ...exceededRetriesBefore(),
        event_name: "alfred_event_job_exceeded_retries",
      });

      expect(exceeded).toHaveBeenCalledTimes(1);
      expect(retry).not.toHaveBeenCalled();
    });

    it("delivers a change_tag that removes a tag to FileRemoveTag", () => {
      const client = new AlfredRealTimeClient(config, apiKey);
      const removed = jest.fn();
      const changed = jest.fn();
      const both = jest.fn();
      client.on(AlfredEvent.FileRemoveTag, removed);
      client.on(AlfredEvent.FileChangeTag, changed);
      client.on(AlfredEvent.FileRemoveTag, both);
      client.on(AlfredEvent.FileChangeTag, both);

      __emit("file_event", removeTagBefore());

      expect(removed).toHaveBeenCalledTimes(1);
      expect(removed.mock.calls[0][0].tagBeingRemovedName).toBe("Invoice");
      expect(changed).toHaveBeenCalledTimes(1);
      expect(both).toHaveBeenCalledTimes(1);

      // A real tag change is not a removal.
      __emit(
        "file_event",
        mockFileEvent({
          event_name: "alfred_event_file_change_tag",
          previous_tag_id: "a",
          new_tag_id: "b",
          new_tag_name: "Receipt",
        })
      );
      expect(removed).toHaveBeenCalledTimes(1);
      expect(changed).toHaveBeenCalledTimes(2);
    });

    it("delivers the 1.131.0 file_remove_tag once", () => {
      const client = new AlfredRealTimeClient(config, apiKey);
      const removed = jest.fn();
      const changed = jest.fn();
      client.on(AlfredEvent.FileRemoveTag, removed);
      client.on(AlfredEvent.FileChangeTag, changed);

      __emit("file_event", {
        ...removeTagBefore(),
        event_name: "alfred_event_file_remove_tag",
      });

      expect(removed).toHaveBeenCalledTimes(1);
      expect(changed).not.toHaveBeenCalled();
    });
  });

  it("uses the server's name for files added to a job", () => {
    expect(AlfredEvent.FileAddToJob).toBe("alfred_event_file_added_to_job");
    expect(AlfredEvent.FileAddedToJob).toBe("alfred_event_file_added_to_job");

    const client = new AlfredRealTimeClient(config, apiKey);
    const handler = jest.fn();
    client.on(AlfredEvent.FileAddToJob, handler);
    __emit("file_event", {
      event_name: "alfred_event_file_added_to_job",
      company_id: "c",
      file_id: "f",
      job_id: "j",
      timestamp: "0001-01-01T00:00:00",
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  describe("callback errors", () => {
    it("keeps calling the other callbacks and reports to onError", async () => {
      const client = new AlfredRealTimeClient(config, apiKey);
      const errors: Error[] = [];
      client.onError((err) => errors.push(err));
      const after = jest.fn();
      client.on(AlfredEvent.JobFinished, () => {
        throw new Error(`sync failure with ${apiKey}`);
      });
      client.on(AlfredEvent.JobFinished, async () => {
        throw new Error("async failure");
      });
      client.on(AlfredEvent.JobFinished, after);

      expect(() =>
        __emit(
          "job_event",
          mockJobEvent({ event_name: "alfred_event_job_finished" })
        )
      ).not.toThrow();
      await flush();

      expect(after).toHaveBeenCalledTimes(1);
      expect(errors.map((e) => e.message)).toEqual([
        "sync failure with [redacted]",
        "async failure",
      ]);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it("writes the error with console.error when there is no error listener", async () => {
      const client = new AlfredRealTimeClient(config, apiKey);
      client.onJobEvent(() => Promise.reject(new Error("boom")));

      __emit("job_event", mockJobEvent());
      await flush();

      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.mock.calls[0][1]).toEqual(new Error("boom"));
    });

    it("survives an error listener that throws", () => {
      const client = new AlfredRealTimeClient(config, apiKey);
      client.onError(() => {
        throw new Error("listener failed");
      });
      client.onJobEvent(() => {
        throw "not an error";
      });

      expect(() => __emit("job_event", mockJobEvent())).not.toThrow();
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("connection lifecycle", () => {
    it("does not throw or close the socket on connect_error", () => {
      const client = new AlfredRealTimeClient(config, apiKey);
      const onConnectError = jest.fn();
      client.onConnectError(onConnectError);

      const err = new Error(
        `xhr poll error for http://localhost:5000/socket.io/?apiKey=${encodeURIComponent(apiKey)}&EIO=4 (${apiKey})`
      );
      expect(() => __connectError(err)).not.toThrow();

      expect(socket.close).not.toHaveBeenCalled();
      expect(onConnectError).toHaveBeenCalledTimes(1);
      const received: Error = onConnectError.mock.calls[0][0];
      expect(received.message).toBe(
        "xhr poll error for http://localhost:5000/socket.io/?apiKey=[redacted]&EIO=4 ([redacted])"
      );
      expect(received.stack).not.toContain(apiKey);
      expect(received.stack).not.toContain(encodeURIComponent(apiKey));
    });

    it("removes the API key from nested errors and drops transport objects", () => {
      const client = new AlfredRealTimeClient(config, apiKey);
      const onConnectError = jest.fn();
      client.onConnectError(onConnectError);

      const err: any = new Error("websocket error");
      err.description = new Error(`failed ${apiKey}`);
      err.context = new (class Request {
        url = `http://localhost:5000/?apiKey=${apiKey}`;
      })();
      err.data = { message: `refused ${apiKey}` };
      __connectError(err);

      const received: any = onConnectError.mock.calls[0][0];
      expect(received.description.message).toBe("failed [redacted]");
      expect(received.context).toBeUndefined();
      expect(received.data).toEqual({ message: "refused [redacted]" });
    });

    it("calls the lifecycle callbacks", () => {
      const client = new AlfredRealTimeClient(config, apiKey);
      const onConnect = jest.fn();
      const onDisconnect = jest.fn();
      const onReconnectAttempt = jest.fn();
      const onReconnect = jest.fn();
      client.onConnect(onConnect);
      client.onDisconnect(onDisconnect);
      client.onReconnectAttempt(onReconnectAttempt);
      client.onReconnect(onReconnect);

      expect(client.connected).toBe(false);
      __connect();
      expect(client.connected).toBe(true);
      expect(onConnect).toHaveBeenCalledTimes(1);

      __disconnect("transport close");
      expect(client.connected).toBe(false);
      expect(onDisconnect).toHaveBeenCalledWith("transport close");

      __emitManager("reconnect_attempt", 2);
      __emitManager("reconnect", 2);
      __connect();
      expect(onReconnectAttempt).toHaveBeenCalledWith(2);
      expect(onReconnect).toHaveBeenCalledWith(2);
      expect(onConnect).toHaveBeenCalledTimes(2);
    });

    it("waitUntilConnected resolves at once when connected", async () => {
      const client = new AlfredRealTimeClient(config, apiKey);
      __connect();
      await expect(client.waitUntilConnected()).resolves.toBeUndefined();
    });

    it("waitUntilConnected resolves when the connection is made, through retries", async () => {
      const client = new AlfredRealTimeClient(config, apiKey);
      const waiting = client.waitUntilConnected(1000);
      __connectError(new Error("xhr poll error"));
      __connect();
      await expect(waiting).resolves.toBeUndefined();
    });

    it("waitUntilConnected rejects on timeout", async () => {
      jest.useFakeTimers();
      const client = new AlfredRealTimeClient(config, apiKey);
      const waiting = client.waitUntilConnected(500);
      jest.advanceTimersByTime(499);
      jest.advanceTimersByTime(1);
      await expect(waiting).rejects.toThrow(
        "Timed out after 500 ms waiting for the real-time connection."
      );
    });

    it("waitUntilConnected uses a 10 second default timeout", async () => {
      jest.useFakeTimers();
      const client = new AlfredRealTimeClient(config, apiKey);
      let settled = false;
      const waiting = client.waitUntilConnected().catch((err) => {
        settled = true;
        throw err;
      });
      jest.advanceTimersByTime(9999);
      await Promise.resolve();
      expect(settled).toBe(false);
      jest.advanceTimersByTime(1);
      await expect(waiting).rejects.toThrow("Timed out after 10000 ms");
    });

    it("waitUntilConnected rejects when the server refuses the connection", async () => {
      const client = new AlfredRealTimeClient(config, apiKey);
      const waiting = client.waitUntilConnected();
      __connectError(
        new Error(`Connection rejected by server ${apiKey}`),
        false
      );

      await expect(waiting).rejects.toThrow(
        "Connection rejected by server [redacted]"
      );
      expect(socket.close).not.toHaveBeenCalled();
      await expect(client.waitUntilConnected()).rejects.toThrow(
        "not connecting"
      );
    });

    it("logs a refused connection when nobody listens for it", () => {
      const _ = new AlfredRealTimeClient(config, apiKey);
      __connectError(new Error("xhr poll error"));
      expect(errorSpy).not.toHaveBeenCalled();
      __connectError(new Error("Connection rejected by server"), false);
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it("disconnect closes the socket and rejects pending waits", async () => {
      const client = new AlfredRealTimeClient(config, apiKey);
      const waiting = client.waitUntilConnected();
      client.disconnect();

      expect(socket.close).toHaveBeenCalledTimes(1);
      await expect(waiting).rejects.toThrow("disconnected");
    });
  });

  describe("edge cases", () => {
    it("exports the event and stream names with the client", () => {
      expect(realtime.AlfredEvent).toBe(AlfredEvent);
      expect(realtime.EventType).toBe(EventType);
      expect(realtime.EventType.BulkTaskEvent).toBe("bulk_task_event");
    });

    it("redacts the API key from an error thrown while creating the socket", () => {
      (io as jest.Mock).mockImplementationOnce(() => {
        throw new Error(`Invalid URL http://x/?apiKey=${apiKey}`);
      });

      expect(() => new AlfredRealTimeClient(config, apiKey)).toThrow(
        "Invalid URL http://x/?apiKey=[redacted]"
      );
    });

    it("works without an API key and leaves errors untouched", () => {
      const client = new AlfredRealTimeClient(config, undefined as any);
      const onConnectError = jest.fn();
      client.onConnectError(onConnectError);
      const err: any = new Error("xhr poll error");
      const context = new (class Request {})();
      err.context = context;

      __connectError(err);

      expect(onConnectError.mock.calls[0][0]).toBe(err);
      expect(err.context).toBe(context);
      expect(err.message).toBe("xhr poll error");
    });

    it("leaves an error without the key in it as it is", () => {
      const client = new AlfredRealTimeClient(config, apiKey);
      const onConnectError = jest.fn();
      client.onConnectError(onConnectError);
      const err: any = new Error("timeout");
      err.type = "TransportError";
      err.code = 5;
      err.missing = null;
      err.self = err; // a cycle
      err.data = [{ message: "refused" }];

      __connectError(err);

      const received = onConnectError.mock.calls[0][0];
      expect(received).toBe(err);
      expect(received.message).toBe("timeout");
      expect(received.type).toBe("TransportError");
      expect(received.code).toBe(5);
      expect(received.missing).toBeNull();
      expect(received.data).toEqual([{ message: "refused" }]);
    });

    it("keeps read-only properties it cannot change", () => {
      const client = new AlfredRealTimeClient(config, apiKey);
      const onConnectError = jest.fn();
      client.onConnectError(onConnectError);
      const err = new Error("failed");
      Object.defineProperty(err, "url", {
        value: `http://x/?apiKey=${apiKey}`,
        writable: false,
      });

      expect(() => __connectError(err)).not.toThrow();
      expect(onConnectError).toHaveBeenCalledTimes(1);
    });

    it("turns thrown values that are not errors into errors", () => {
      const client = new AlfredRealTimeClient(config, apiKey);
      const errors: Error[] = [];
      client.onError((err) => errors.push(err));
      const circular: any = { name: "loop" };
      circular.self = circular;
      const thrown: unknown[] = [
        `text with ${apiKey}`,
        { code: 42, key: apiKey },
        undefined,
        circular,
      ];
      for (const value of thrown) {
        client.on(AlfredEvent.JobFinished, () => {
          throw value;
        });
      }

      __emit(
        "job_event",
        mockJobEvent({ event_name: "alfred_event_job_finished" })
      );

      expect(errors.every((e) => e instanceof Error)).toBe(true);
      expect(errors.map((e) => e.message)).toEqual([
        "text with [redacted]",
        '{"code":42,"key":"[redacted]"}',
        "undefined",
        "[object Object]",
      ]);
    });

    it("writes a rejection of an async error listener with console.error", async () => {
      const client = new AlfredRealTimeClient(config, apiKey);
      client.onError(async () => {
        throw new Error(`listener failed ${apiKey}`);
      });
      client.onJobEvent(() => {
        throw new Error("boom");
      });

      __emit("job_event", mockJobEvent());
      await flush();

      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.mock.calls[0][1].message).toBe(
        "listener failed [redacted]"
      );
    });

    it("reports a payload that cannot be read and delivers nothing", () => {
      const client = new AlfredRealTimeClient(config, apiKey);
      const errors: Error[] = [];
      const handler = jest.fn();
      client.onError((err) => errors.push(err));
      client.onJobEvent(handler);
      const payload = {
        get event_name(): string {
          throw new Error("unreadable");
        },
      };

      __emit("job_event", payload);

      expect(handler).not.toHaveBeenCalled();
      expect(errors.map((e) => e.message)).toEqual(["unreadable"]);
    });

    it("delivers a payload that is not an object to the stream only", () => {
      const client = new AlfredRealTimeClient(config, apiKey);
      const stream = jest.fn();
      const byName = jest.fn();
      client.onJobEvent(stream);
      client.on(AlfredEvent.JobFinished, byName);

      __emit("job_event", "alfred_event_job_finished");
      __emit("job_event", null);
      __emit("job_event", { job_id: "no name" });

      expect(stream.mock.calls.map((c) => c[0])).toEqual([
        "alfred_event_job_finished",
        null,
        { jobId: "no name" },
      ]);
      expect(byName).not.toHaveBeenCalled();
    });

    it("treats a change_tag with null fields by what they hold", () => {
      const client = new AlfredRealTimeClient(config, apiKey);
      const removed = jest.fn();
      client.on(AlfredEvent.FileRemoveTag, removed);

      // tag removed, new tag sent as null: a removal
      __emit("file_event", { ...removeTagBefore(), new_tag_id: null });
      // no tag being removed (null): a tag change
      __emit(
        "file_event",
        mockFileEvent({
          event_name: "alfred_event_file_change_tag",
          tag_being_removed_id: null,
          new_tag_id: "b",
        })
      );
      // both present: a tag change
      __emit("file_event", { ...removeTagBefore(), new_tag_id: "b" });

      expect(removed).toHaveBeenCalledTimes(1);
    });
  });
});
