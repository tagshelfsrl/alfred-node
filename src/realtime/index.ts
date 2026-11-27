import { io, Socket } from "socket.io-client";
import { toCamelCase } from "../utils/convert-case";
import { castProps, DataType } from "../utils/cast";
import { ClientConfiguration } from "../config";
import { EventType } from "../config/constants";
import { BulkTaskEvent, FileEvent, JobEvent } from "./types";
import { AlfredEvent } from "../enums";

// The event names, stream names and payload types callers need to subscribe.
export { AlfredEvent } from "../enums";
export { EventType } from "../config/constants";
export * from "./types";

/** A callback that receives an event payload. It may be async. */
export type RealtimeCallback<T> = (data: T) => void | Promise<void>;
/** A callback that receives an error. */
export type RealtimeErrorHandler = (error: Error) => void;
/** A callback that receives no arguments. */
export type RealtimeEventHandler = () => void;
/**
 * A name accepted by {@link AlfredRealTimeClient.on}: an {@link AlfredEvent}
 * name or one of the three streams (`job_event`, `file_event`,
 * `bulk_task_event`).
 */
export type RealtimeEventName =
  | AlfredEvent
  | EventType
  | `${AlfredEvent}`
  | `${EventType}`;

// The Socket.IO events the real-time server emits.
const STREAMS: EventType[] = [
  EventType.JobEvent,
  EventType.FileEvent,
  EventType.BulkTaskEvent,
];

// Payload fields parsed into `Date` objects.
const DATE_FIELDS = ["creationDate", "updateDate", "timestamp"];

const REDACTED = "[redacted]";

type ConnectionWaiter = {
  connected: () => void;
  failed: (error: Error) => void;
};

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  value !== null &&
  (typeof value === "object" || typeof value === "function") &&
  typeof (value as PromiseLike<unknown>).then === "function";

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null || Array.isArray(value);
};

const describe = (value: unknown): string => {
  if (typeof value === "string") return value;
  try {
    const json = JSON.stringify(value);
    return json === undefined ? String(value) : json;
  } catch {
    return String(value);
  }
};

export class AlfredRealTimeClient {
  private readonly socket: Socket;
  private readonly secrets: string[];
  private readonly subscriptions = new Map<string, RealtimeCallback<any>[]>();
  private readonly errorCallbacks: RealtimeErrorHandler[] = [];
  private readonly connectCallbacks: RealtimeEventHandler[] = [];
  private readonly disconnectCallbacks: ((reason: string) => void)[] = [];
  private readonly connectErrorCallbacks: RealtimeErrorHandler[] = [];
  private readonly reconnectAttemptCallbacks: ((attempt: number) => void)[] =
    [];
  private readonly reconnectCallbacks: ((attempt: number) => void)[] = [];
  private readonly waiters = new Set<ConnectionWaiter>();

  /**
   * Connects to the real-time server. The connection is made in the
   * background: use {@link waitUntilConnected} or {@link onConnect} to know
   * when it is established. If the connection fails or drops, the client keeps
   * trying to reconnect (see {@link onConnectError}).
   * @param config - The client configuration; its `realTimeURL` is used.
   * @param apiKey - The API key of the account whose events you receive.
   */
  constructor(config: ClientConfiguration, apiKey: string) {
    const key = apiKey ?? "";
    this.secrets = Array.from(new Set([key, encodeURIComponent(key)]))
      .filter((secret) => secret.length > 0)
      .sort((a, b) => b.length - a.length);

    try {
      // Connect to realtime server and provide API key
      this.socket = io(config.realTimeURL, { query: { apiKey } });
    } catch (err) {
      throw this.redact(err);
    }

    // One listener per stream for the lifetime of the client; subscriptions
    // are dispatched from here by the payload's event name.
    for (const stream of STREAMS) {
      this.socket.on(stream, (data: unknown) => this.dispatch(stream, data));
    }

    this.socket.on("connect", () => {
      for (const waiter of Array.from(this.waiters)) waiter.connected();
      for (const callback of this.connectCallbacks.slice()) {
        this.invoke(callback);
      }
    });

    this.socket.on("disconnect", (reason: string) => {
      for (const callback of this.disconnectCallbacks.slice()) {
        this.invoke(callback, reason);
      }
    });

    // Never close the socket or throw here: socket.io keeps reconnecting
    // unless the server refused the connection.
    this.socket.on("connect_error", (err: unknown) => {
      const error = this.redact(err);
      const gaveUp = !this.socket.active;
      const waiting = this.waiters.size > 0;
      if (gaveUp) {
        for (const waiter of Array.from(this.waiters)) waiter.failed(error);
      }
      for (const callback of this.connectErrorCallbacks.slice()) {
        this.invoke(callback, error);
      }
      if (gaveUp && !waiting && this.connectErrorCallbacks.length === 0) {
        console.error(
          "Alfred real-time client: the connection was refused and will not be retried.",
          error
        );
      }
    });

    this.socket.io.on("reconnect_attempt", (attempt: number) => {
      for (const callback of this.reconnectAttemptCallbacks.slice()) {
        this.invoke(callback, attempt);
      }
    });

    this.socket.io.on("reconnect", (attempt: number) => {
      for (const callback of this.reconnectCallbacks.slice()) {
        this.invoke(callback, attempt);
      }
    });
  }

  /** Whether the client is connected to the real-time server right now. */
  get connected(): boolean {
    return this.socket.connected;
  }

  /**
   * Registers a callback for every file event (the `file_event` stream).
   * @param callback - A function that takes a `FileEvent` object and handles it.
   */
  onFileEvent(callback: RealtimeCallback<FileEvent>): void {
    this.on(EventType.FileEvent, callback);
  }

  /**
   * Registers a callback for every job event (the `job_event` stream).
   * @param callback - A function that takes a `JobEvent` object and handles it.
   */
  onJobEvent(callback: RealtimeCallback<JobEvent>): void {
    this.on(EventType.JobEvent, callback);
  }

  /**
   * Registers a callback for every bulk task event (the `bulk_task_event`
   * stream).
   * @param callback - A function that takes a `BulkTaskEvent` object and handles it.
   */
  onBulkTaskEvent(callback: RealtimeCallback<BulkTaskEvent>): void {
    this.on(EventType.BulkTaskEvent, callback);
  }

  /**
   * Registers a callback for one kind of event, or for a whole stream.
   *
   * The server sends every event on one of three streams and names it in the
   * payload's `eventName`; the SDK calls the callback only for payloads whose
   * `eventName` matches. Two events that Alfred before 1.131.0 sends under
   * another name are also recognised: {@link AlfredEvent.JobExceededRetries}
   * (sent as `alfred_event_job_retry` with `exceededRetries: true`) and
   * {@link AlfredEvent.FileRemoveTag} (sent as `alfred_event_file_change_tag`
   * with `tagBeingRemovedId`).
   *
   * Registering is additive: every callback registered for a name is called,
   * in registration order. A callback is called at most once per event.
   * @param eventName - An {@link AlfredEvent} name, or `job_event`,
   * `file_event` or `bulk_task_event` for a whole stream.
   * @param callback - A function that receives the event payload.
   */
  on<T = any>(
    eventName: RealtimeEventName,
    callback: RealtimeCallback<T>
  ): void {
    const callbacks = this.subscriptions.get(eventName);
    if (callbacks) callbacks.push(callback);
    else this.subscriptions.set(eventName, [callback]);
  }

  /**
   * Removes a callback registered with {@link on} (or with `onJobEvent`,
   * `onFileEvent`, `onBulkTaskEvent`, whose names are the stream names).
   * @param eventName - The name the callback was registered with.
   * @param callback - The callback to remove. Without it, every callback
   * registered for the name is removed.
   */
  off<T = any>(
    eventName: RealtimeEventName,
    callback?: RealtimeCallback<T>
  ): void {
    if (!callback) {
      this.subscriptions.delete(eventName);
      return;
    }
    const callbacks = this.subscriptions.get(eventName);
    if (!callbacks) return;
    const remaining = callbacks.filter((cb) => cb !== callback);
    if (remaining.length > 0) this.subscriptions.set(eventName, remaining);
    else this.subscriptions.delete(eventName);
  }

  /**
   * Registers a callback for errors thrown (or rejected) by your event and
   * lifecycle callbacks. Without one, such errors are written with
   * `console.error`. A failing callback never stops the others.
   * @param callback - A function that receives the error.
   */
  onError(callback: RealtimeErrorHandler): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Registers a callback for each time the connection is established,
   * including after a reconnection.
   */
  onConnect(callback: RealtimeEventHandler): void {
    this.connectCallbacks.push(callback);
  }

  /**
   * Registers a callback for each time the connection closes. It receives
   * socket.io's reason, for example `transport close` or
   * `io client disconnect`.
   */
  onDisconnect(callback: (reason: string) => void): void {
    this.disconnectCallbacks.push(callback);
  }

  /**
   * Registers a callback for each failed connection attempt. The error never
   * contains the API key. The client keeps retrying unless the server refused
   * the connection (for example a wrong API key).
   */
  onConnectError(callback: (err: Error) => void): void {
    this.connectErrorCallbacks.push(callback);
  }

  /** Registers a callback for each reconnection attempt, with its number. */
  onReconnectAttempt(callback: (attempt: number) => void): void {
    this.reconnectAttemptCallbacks.push(callback);
  }

  /**
   * Registers a callback for each successful reconnection, with the number of
   * attempts it took.
   */
  onReconnect(callback: (attempt: number) => void): void {
    this.reconnectCallbacks.push(callback);
  }

  /**
   * Resolves once the client is connected (at once if it already is).
   * Rejects when `timeoutMs` passes first, when the server refuses the
   * connection so that no further attempt is made, or when
   * {@link disconnect} is called.
   * @param timeoutMs - How long to wait, in milliseconds. Defaults to 10000.
   */
  waitUntilConnected(timeoutMs = 10000): Promise<void> {
    if (this.socket.connected) return Promise.resolve();
    if (!this.socket.active) {
      return Promise.reject(
        new Error(
          "The real-time client is not connecting: it was disconnected or the server refused the connection."
        )
      );
    }

    return new Promise<void>((resolve, reject) => {
      const settle = (error?: Error) => {
        clearTimeout(timer);
        this.waiters.delete(waiter);
        if (error) reject(error);
        else resolve();
      };
      const waiter: ConnectionWaiter = {
        connected: () => settle(),
        failed: (error) => settle(error),
      };
      const timer = setTimeout(
        () =>
          settle(
            new Error(
              `Timed out after ${timeoutMs} ms waiting for the real-time connection.`
            )
          ),
        timeoutMs
      );
      this.waiters.add(waiter);
    });
  }

  /**
   * Closes the realtime connection. Pending {@link waitUntilConnected} calls
   * are rejected.
   */
  disconnect(): void {
    this.socket.close();
    const error = new Error("The real-time client was disconnected.");
    for (const waiter of Array.from(this.waiters)) waiter.failed(error);
  }

  // Delivers one payload of a stream to its subscribers.
  private dispatch(stream: EventType, data: unknown) {
    let payload: any;
    try {
      payload = toCamelCase(data);
      castProps(payload, DATE_FIELDS, DataType.Date);
    } catch (err) {
      this.reportError(err);
      return;
    }

    const names: string[] = [stream];
    const eventName =
      payload !== null && typeof payload === "object"
        ? payload.eventName
        : undefined;
    if (typeof eventName === "string") {
      names.push(eventName);
      // Alfred before 1.131.0 sends these two events under another name.
      if (
        eventName === AlfredEvent.JobRetry &&
        payload.exceededRetries === true
      ) {
        names.push(AlfredEvent.JobExceededRetries);
      }
      if (
        eventName === AlfredEvent.FileChangeTag &&
        payload.tagBeingRemovedId !== undefined &&
        payload.tagBeingRemovedId !== null &&
        (payload.newTagId === undefined || payload.newTagId === null)
      ) {
        names.push(AlfredEvent.FileRemoveTag);
      }
    }

    const called = new Set<RealtimeCallback<any>>();
    for (const name of names) {
      const callbacks = this.subscriptions.get(name);
      if (!callbacks) continue;
      for (const callback of callbacks.slice()) {
        if (called.has(callback)) continue;
        called.add(callback);
        this.invoke(callback, payload);
      }
    }
  }

  // Calls a user callback; a throw or a rejection goes to the error listeners.
  private invoke<A extends unknown[]>(
    callback: (...args: A) => unknown,
    ...args: A
  ) {
    try {
      const result = callback(...args);
      if (isPromiseLike(result)) {
        result.then(undefined, (err: unknown) => this.reportError(err));
      }
    } catch (err) {
      this.reportError(err);
    }
  }

  private reportError(err: unknown) {
    const error = this.redact(err);
    if (this.errorCallbacks.length === 0) {
      console.error("Alfred real-time client: a callback failed.", error);
      return;
    }
    for (const callback of this.errorCallbacks.slice()) {
      try {
        const result: unknown = callback(error);
        if (isPromiseLike(result)) {
          result.then(undefined, (e: unknown) =>
            console.error(
              "Alfred real-time client: an error callback failed.",
              this.redact(e)
            )
          );
        }
      } catch (e) {
        console.error(
          "Alfred real-time client: an error callback failed.",
          this.redact(e)
        );
      }
    }
  }

  private scrub(text: string): string {
    return this.secrets.reduce(
      (result, secret) => result.split(secret).join(REDACTED),
      text
    );
  }

  // Returns the value as an Error with the API key removed from it.
  private redact(value: unknown): Error {
    const error =
      value instanceof Error ? value : new Error(this.scrub(describe(value)));
    if (this.secrets.length > 0) this.scrubError(error, new Set());
    return error;
  }

  // Removes the API key from an error's text, in place. Objects that are not
  // plain data or errors (requests, sockets, transport events) can hold the
  // connection URL and are removed.
  private scrubError(target: object, seen: Set<object>) {
    if (seen.has(target)) return;
    seen.add(target);
    const record = target as Record<string, unknown>;
    for (const key of Object.getOwnPropertyNames(target)) {
      const value = record[key];
      try {
        if (typeof value === "string") {
          const scrubbed = this.scrub(value);
          if (scrubbed !== value) record[key] = scrubbed;
        } else if (value instanceof Error || isPlainObject(value)) {
          this.scrubError(value, seen);
        } else if (value !== null && typeof value === "object") {
          delete record[key];
        }
      } catch {
        // A read-only property: leave it.
      }
    }
  }
}
