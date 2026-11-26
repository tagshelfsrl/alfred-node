import * as sdk from "../src";
import type {
  AuthConfiguration,
  ClientConfiguration,
  CreateJob,
  CreateSessionResult,
  DataPointResult,
  DownloadResult,
  Environment,
  FileEvent,
  FileUploadPayload,
  JobEvent,
  JobResult,
  UploadFilePayload,
} from "../src";

// Compile-time check: the types the README imports from the package entry
// point are reachable from it. A missing export fails the build of this file.
type PublicTypes = [
  AuthConfiguration,
  ClientConfiguration,
  CreateJob,
  CreateSessionResult,
  DataPointResult,
  DownloadResult,
  Environment,
  FileEvent,
  FileUploadPayload,
  JobEvent,
  JobResult,
  UploadFilePayload,
];

describe("package entry point", () => {
  it("should export the clients and the configuration", () => {
    expect(sdk.AlfredClient).toBeDefined();
    expect(sdk.AlfredRealTimeClient).toBeDefined();
    expect(sdk.Configuration.default("production").baseURL).toBe(
      "https://app.tagshelf.com"
    );
  });

  it("should export the event names used to subscribe", () => {
    expect(sdk.AlfredEvent.JobFinished).toBe("alfred_event_job_finished");
    expect(sdk.AlfredEvent.FileDone).toBe("alfred_event_file_done");
    expect(sdk.EventType.JobEvent).toBe("job_event");
    expect(sdk.EventType.FileEvent).toBe("file_event");
  });

  it("should export the error classes so callers can use instanceof", () => {
    const error = new sdk.HTTPError("Not Found", 404, "", "api/job/detail/1");
    expect(error).toBeInstanceOf(sdk.HTTPError);
    expect(error).toBeInstanceOf(Error);
    expect(new sdk.ConfigurationError("bad")).toBeInstanceOf(
      sdk.ConfigurationError
    );
  });

  it("should export the authentication method names", () => {
    expect(sdk.AuthMethod.API_KEY).toBe("apikey");
  });

  it("should keep the public types importable", () => {
    const types: PublicTypes | undefined = undefined;
    expect(types).toBeUndefined();
  });
});
