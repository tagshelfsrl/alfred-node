import { AlfredRealTimeClient, Configuration } from "../../src";
import { io } from "socket.io-client";
import {
  __emitManagerEvent,
  __emitSocketEvent,
  __resetSocketMock,
  __simulateAuthFailure,
  __simulateAuthSuccess,
  socket,
} from "../__mocks__/socket.io-client";
import { AlfredEvent } from "../../src/enums";

// Mock Socket IO client library
jest.mock("socket.io-client");

const config = Configuration.v1("staging", {
  realTimeURL: "http://localhost:5000",
});
const apiKey = "AXXXXXXXX";

describe("realtime: alfred realtime client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __resetSocketMock();
  });

  it("should successfully connect to realtime server", () => {
    __simulateAuthSuccess();
    const _ = new AlfredRealTimeClient(config, apiKey);

    expect(io).toHaveBeenCalledWith(
      config.realTimeURL,
      expect.objectContaining({ query: { apiKey } })
    );
    expect(socket.close).not.toHaveBeenCalled();
  });

  it("should keep the socket open on connection errors", () => {
    __simulateAuthFailure();
    const client = new AlfredRealTimeClient(config, "");
    const handler = jest.fn();

    client.onConnectError(handler);

    expect(socket.close).not.toHaveBeenCalled();
  });

  it("should get job event", () => {
    __simulateAuthSuccess();
    let data = {};
    const client = new AlfredRealTimeClient(config, apiKey);
    const handler = jest.fn((_data) => (data = _data));
    client.onJobEvent(handler);

    expect(handler).toHaveBeenCalled();
    expect(data).toHaveProperty("event");
    expect(data).toHaveProperty("eventId");
    expect(data).toHaveProperty("eventTime");
    expect(data).toHaveProperty("eventType", "job_event");
  });

  it("should get file event", () => {
    __simulateAuthSuccess();
    let data = {};
    const client = new AlfredRealTimeClient(config, apiKey);
    const handler = jest.fn((_data) => (data = _data));
    client.onFileEvent(handler);

    expect(handler).toHaveBeenCalled();
    expect(data).toHaveProperty("event");
    expect(data).toHaveProperty("eventId");
    expect(data).toHaveProperty("eventTime");
    expect(data).toHaveProperty("eventType");
  });

  it("should get a job create event", () => {
    __simulateAuthSuccess();
    let data = {};
    const client = new AlfredRealTimeClient(config, apiKey);
    const handler = jest.fn((_data) => (data = _data));
    client.on(AlfredEvent.JobCreate, handler);

    expect(handler).toHaveBeenCalled();
    expect(data).toHaveProperty("event");
    expect(data).toHaveProperty("eventId");
    expect(data).toHaveProperty("eventTime");
    expect(data).toHaveProperty("eventType", "file_event");
  });

  it("should wait until the socket connects", async () => {
    const client = new AlfredRealTimeClient(config, apiKey);
    const readiness = client.waitUntilConnected(1000);

    __emitSocketEvent("connect");

    await expect(readiness).resolves.toBeUndefined();
  });

  it("should time out while waiting for the socket connection", async () => {
    jest.useFakeTimers();
    const client = new AlfredRealTimeClient(config, apiKey);
    const readiness = client.waitUntilConnected(1000);

    jest.advanceTimersByTime(1000);

    await expect(readiness).rejects.toThrow("Realtime connection timed out after 1000ms");
    jest.useRealTimers();
  });

  it("should expose realtime lifecycle callbacks", () => {
    const client = new AlfredRealTimeClient(config, apiKey);
    const onConnect = jest.fn();
    const onDisconnect = jest.fn();
    const onConnectError = jest.fn();
    const onReconnectAttempt = jest.fn();
    const onReconnect = jest.fn();

    client.onConnect(onConnect);
    client.onDisconnect(onDisconnect);
    client.onConnectError(onConnectError);
    client.onReconnectAttempt(onReconnectAttempt);
    client.onReconnect(onReconnect);

    __emitSocketEvent("connect");
    __emitSocketEvent("disconnect");
    __emitSocketEvent("connect_error", new Error("boom"));
    __emitManagerEvent("reconnect_attempt");
    __emitManagerEvent("reconnect");

    expect(onConnect).toHaveBeenCalled();
    expect(onDisconnect).toHaveBeenCalled();
    expect(onConnectError).toHaveBeenCalledWith(expect.any(Error));
    expect(onReconnectAttempt).toHaveBeenCalled();
    expect(onReconnect).toHaveBeenCalled();
  });
});
