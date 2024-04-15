import { io, Socket } from "socket.io-client";

import { ClientConfiguration } from "../config";
import { JobEvent, FileEvent } from "./types";
import { toCamelCase } from "../utils/convert-case";
import { EventName } from "../config/constants";
import { castProps, DataType } from "../utils/cast";

export class AlfredSocketClient {
  private socket: Socket;

  constructor(config: ClientConfiguration, apiKey: string) {
    // Connect to socket server and provide API key
    this.socket = io(config.socketURL, { query: { apiKey } });

    // Handle connection error
    this.socket.on("connect_error", (err) => {
      this.disconnect();
      throw err;
    });
  }

  /**
   * Registers a callback function to be executed when a specific event is
   * emitted on a socket connection.
   * @param {string} event - A string that represents the event name that the
   * socket is listening for. When this event is triggered, the callback
   * function provided will be executed with the data associated with the event.
   * @param callback - A function that will get executed when new events are emitted.
   */
  private _callback<T>(
    event: string,
    callback: (data: T) => void | Promise<void>
  ) {
    this.socket.on(event, async (data: any) => {
      const parsed = <T>toCamelCase(data);
      castProps(parsed, ["creationDate", "updateDate"], DataType.Date);
      await callback(parsed);
    });
  }

  /**
   * Registers a callback to handle file events.
   * @param callback - A function that takes a `FileEvent` object and handles it.
   */
  onFileEvent(callback: (data: FileEvent) => void | Promise<void>) {
    this._callback<FileEvent>(EventName.FileEvent, callback);
  }

  /**
   * Registers a callback to handle job events.
   * @param callback - A function that takes a `JobEvent` object and handles it.
   */
  onJobEvent(callback: (data: JobEvent) => void | Promise<void>) {
    this._callback<JobEvent>(EventName.JobEvent, callback);
  }

  /**
   * Registers a callback to handle the specified event.
   * @param {string} event - A string that represents the event name that the
   * socket is listening for.
   * @param callback - A function that takes a `JobEvent` object and handles it.
   */
  on(event: string, callback: (data: any) => void | Promise<void>) {
    this._callback(event, callback);
  }

  /**
   * Closes the socket connection.
   */
  disconnect() {
    this.socket.close();
  }
}
