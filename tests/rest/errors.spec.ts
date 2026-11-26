import { AxiosHeaders } from "axios";

import {
  AlfredError,
  AuthenticationError,
  BadRequestError,
  ConfigurationError,
  ConflictError,
  HTTPError,
  NotFoundError,
  PayloadTooLargeError,
  PermissionError,
  RateLimitError,
  RequestError,
  ServerError,
  TimeoutError,
  createHTTPError,
  extractErrorMessage,
  parseRetryAfter,
} from "../../src/errors";

describe("errors: class hierarchy", () => {
  it("should keep the legacy 4-argument HTTPError constructor working", () => {
    const err = new HTTPError("boom", 418, { a: 1 }, "api/x?secret=1");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AlfredError);
    expect(err.message).toBe("boom");
    expect(err.status).toBe(418);
    expect(err.data).toEqual({ a: 1 });
    expect(err.url).toBe("api/x");
    expect(err.name).toBe("HTTPError");
    expect(err.method).toBeUndefined();
  });

  it("should name errors after their class", () => {
    expect(new ConfigurationError("x").name).toBe("ConfigurationError");
    expect(new ConfigurationError("x")).toBeInstanceOf(AlfredError);
    expect(new TimeoutError("x").name).toBe("TimeoutError");
    expect(new TimeoutError("x")).toBeInstanceOf(RequestError);
    expect(new NotFoundError("x", 404, "", "u")).toBeInstanceOf(HTTPError);
  });

  it("should strip the query string from RequestError urls", () => {
    const err = new RequestError("x", {
      method: "GET",
      url: "api/a?b=c#d",
      code: "ECONNRESET",
    });
    expect(err.url).toBe("api/a");
    expect(err.code).toBe("ECONNRESET");
  });
});

describe("errors: createHTTPError", () => {
  it.each([
    [400, BadRequestError],
    [401, AuthenticationError],
    [403, PermissionError],
    [404, NotFoundError],
    [409, ConflictError],
    [413, PayloadTooLargeError],
    [429, RateLimitError],
    [500, ServerError],
    [502, ServerError],
    [503, ServerError],
    [599, ServerError],
  ])("should map status %i to its class", (status, cls) => {
    const err = createHTTPError(status, "", "", {}, "get", "api/x");
    expect(err).toBeInstanceOf(cls);
    expect(err).toBeInstanceOf(HTTPError);
    expect(err.status).toBe(status);
    expect(err.method).toBe("GET");
    expect(err.name).toBe((cls as any).name);
  });

  it.each([402, 405, 418, 422, 600])(
    "should keep status %i a plain HTTPError",
    (status) => {
      const err = createHTTPError(status, "", "", {}, "GET", "api/x");
      expect(err.constructor).toBe(HTTPError);
    }
  );

  it("should remove the query string from the url", () => {
    const err = createHTTPError(404, "", "", {}, "GET", "api/job?id=1&k=v");
    expect(err.url).toBe("api/job");
  });

  it("should read correlation_id, reason and errors", () => {
    const err = createHTTPError(
      409,
      "Conflict",
      {
        message: "Job cannot be restarted.",
        reason: "job_finished",
        correlation_id: "ABCDEF123456",
      },
      {},
      "POST",
      "api/job/restart"
    );
    expect(err).toBeInstanceOf(ConflictError);
    expect(err.message).toBe("Job cannot be restarted.");
    expect(err.reason).toBe("job_finished");
    expect(err.correlationId).toBe("ABCDEF123456");

    const tags = createHTTPError(
      400,
      "",
      { errors: ["a is required.", "b is invalid."] },
      {},
      "POST",
      "api/tag"
    );
    expect(tags.errors).toEqual(["a is required.", "b is invalid."]);
    expect(tags.message).toBe("a is required.; b is invalid.");
  });

  it("should read max_bytes on 413", () => {
    const err = createHTTPError(
      413,
      "",
      { message: "Too large.", max_bytes: 1048576 },
      {},
      "POST",
      "api/file/upload"
    ) as PayloadTooLargeError;
    expect(err.maxBytes).toBe(1048576);
    expect(err.message).toBe("Too large.");
  });

  it("should read Retry-After in seconds on 429 and 5xx", () => {
    const headers = new AxiosHeaders({ "Retry-After": "7" });
    const rate = createHTTPError(429, "", "slow down", headers, "GET", "u");
    expect((rate as RateLimitError).retryAfter).toBe(7);
    const server = createHTTPError(503, "", "", { "retry-after": "3" }, "", "");
    expect((server as ServerError).retryAfter).toBe(3);
  });

  it("should read Retry-After given as an HTTP date", () => {
    const now = Date.parse("2026-11-26T12:00:00Z");
    const later = new Date(now + 12000).toUTCString();
    expect(parseRetryAfter({ "Retry-After": later }, now)).toBe(12);
    expect(parseRetryAfter({ "Retry-After": "not a date" }, now)).toBe(
      undefined
    );
    expect(parseRetryAfter({}, now)).toBeUndefined();
    expect(
      parseRetryAfter({ "Retry-After": "Thu, 01 Jan 2026 00:00:00 GMT" }, now)
    ).toBe(0);
  });

  it("should not use X-RateLimit-Reset", () => {
    const err = createHTTPError(
      429,
      "",
      "",
      { "X-RateLimit-Reset": "150000" },
      "GET",
      "u"
    ) as RateLimitError;
    expect(err.retryAfter).toBeUndefined();
  });

  it("should decode an ArrayBuffer body", () => {
    const buffer = Buffer.from(JSON.stringify({ message: "File not found." }));
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );
    const err = createHTTPError(404, "", arrayBuffer, {}, "GET", "u");
    expect(err.message).toBe("File not found.");
    expect(err.data).toEqual({ message: "File not found." });
  });
});

describe("errors: extractErrorMessage", () => {
  it.each([
    ["message", { message: "Job not found." }, "Job not found."],
    [
      "Message",
      { Message: "An error has occurred." },
      "An error has occurred.",
    ],
    [
      "message with correlation_id",
      { message: "Something failed.", correlation_id: "ABCDEF123456" },
      "Something failed.",
    ],
    [
      "error with statusCode",
      { error: "page_size must be at most 100.", statusCode: 400 },
      "page_size must be at most 100.",
    ],
    [
      "error_description",
      {
        error: "invalid_grant",
        error_description: "The user name or password is incorrect.",
      },
      "The user name or password is incorrect.",
    ],
    [
      "nested error object",
      { error: { message: "Nested failure." } },
      "Nested failure.",
    ],
    ["detail", { detail: "Detail text." }, "Detail text."],
    ["errors array", { errors: ["One.", "Two."] }, "One.; Two."],
    ["bare JSON string", "tag_id is required.", "tag_id is required."],
    ["unparsed JSON string", '"tag_id is required."', "tag_id is required."],
    [
      "plain text",
      "  API calls quota\n exceeded!  ",
      "API calls quota exceeded!",
    ],
    [
      "HTML",
      "<html><head><style>p{}</style></head><body><h1>Service   Unavailable</h1><p>Try &amp; retry</p></body></html>",
      "Service Unavailable Try & retry",
    ],
    ["Buffer JSON", Buffer.from('{"Message":"From buffer."}'), "From buffer."],
  ])("should read %s", (_name, body, expected) => {
    expect(extractErrorMessage(body, 400, "Bad Request")).toBe(expected);
  });

  it("should skip empty values", () => {
    expect(extractErrorMessage({ message: "", Message: "Second." }, 400)).toBe(
      "Second."
    );
  });

  it.each([
    ["empty string", ""],
    ["undefined", undefined],
    ["null", null],
    ["empty object", {}],
    ["empty buffer", Buffer.alloc(0)],
  ])("should fall back to the status for %s", (_name, body) => {
    expect(extractErrorMessage(body, 404, "Not Found")).toBe("404 Not Found");
  });

  it("should use the standard status text when none was sent", () => {
    expect(extractErrorMessage("", 401, "")).toBe("401 Unauthorized");
  });

  it("should cap long messages at 300 characters", () => {
    const message = extractErrorMessage("x".repeat(1000), 500);
    expect(message.length).toBe(300);
    expect(message.endsWith("...")).toBe(true);
  });
});
