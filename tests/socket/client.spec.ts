import { AlfredSocketClient, Configuration } from "../../src";
import { io } from "socket.io-client";
import {
  __simulateAuthFailure,
  __simulateAuthSuccess,
  socket,
} from "../__mocks__/socket.io-client";

// Mock Socket IO client library
jest.mock("socket.io-client");

const config = Configuration.v1("staging", {
  socketURL: "http://localhost:5000",
});
const apiKey = "AXXXXXXXX";

describe("socket: alfred socket client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully connect to socket server", () => {
    __simulateAuthSuccess();
    const _ = new AlfredSocketClient(config, apiKey);

    expect(io).toHaveBeenCalledWith(
      config.socketURL,
      expect.objectContaining({ query: { apiKey } })
    );
    expect(socket.close).not.toHaveBeenCalled();
  });

  it("should disconnect on invalid API key", (done) => {
    __simulateAuthFailure();
    try {
      const _ = new AlfredSocketClient(config, "");
    } catch (error) {
      expect(socket.close).toHaveBeenCalled();
      done();
    }
  });

  it("should get job event", () => {
    __simulateAuthSuccess();
    let data = {};
    const client = new AlfredSocketClient(config, apiKey);
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
    const client = new AlfredSocketClient(config, apiKey);
    const handler = jest.fn((_data) => (data = _data));
    client.onFileEvent(handler);

    expect(handler).toHaveBeenCalled();
    expect(data).toHaveProperty("event");
    expect(data).toHaveProperty("eventId");
    expect(data).toHaveProperty("eventTime");
    expect(data).toHaveProperty("eventType");
  });

  it("should get any event", () => {
    __simulateAuthSuccess();
    let data = {};
    const client = new AlfredSocketClient(config, apiKey);
    const handler = jest.fn((_data) => (data = _data));
    client.on("mesage", handler);

    expect(handler).toHaveBeenCalled();
    expect(data).toHaveProperty("event");
    expect(data).toHaveProperty("eventId");
    expect(data).toHaveProperty("eventTime");
    expect(data).toHaveProperty("eventType", "file_event");
  });
});
