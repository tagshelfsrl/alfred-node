import { inspect } from "util";
import {
  AxiosError,
  AxiosHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import {
  AlfredClient,
  AuthenticationError,
  ConfigurationError,
  Configuration,
  HTTPError,
  NotFoundError,
  RateLimitError,
  RequestError,
  ServerError,
  TimeoutError,
} from "../../src";

const moduleInfo = require("../../package.json");

const config = Configuration.v1("staging");
const auth = { apiKey: "AXXXXXXXX" };

const API_KEY = "SECRET-API-KEY-1234567890";
const ACCESS_TOKEN = "SECRET-BEARER-TOKEN-0987654321";
const PASSWORD = "SECRET-PASSWORD-555";

interface Reply {
  status?: number;
  statusText?: string;
  data?: any;
  headers?: Record<string, string>;
}

type Handler = (
  config: InternalAxiosRequestConfig,
  call: number
) => Reply | Promise<Reply>;

/**
 * Replaces the axios adapter, so the client's real interceptors run end to end. Non-2xx replies
 * are rejected the way axios' own adapters do.
 */
const stubAdapter = (client: AlfredClient, handler: Handler) => {
  const calls: InternalAxiosRequestConfig[] = [];
  client._http.defaults.adapter = async (cfg: InternalAxiosRequestConfig) => {
    calls.push(cfg);
    const reply = await handler(cfg, calls.length);
    const status = reply.status ?? 200;
    const response: AxiosResponse = {
      status,
      statusText: reply.statusText ?? "",
      data: reply.data ?? "",
      headers: new AxiosHeaders(reply.headers ?? {}),
      config: cfg,
      request: {},
    };
    if (status >= 200 && status < 300) return response;
    throw new AxiosError(
      `Request failed with status code ${status}`,
      status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
      cfg,
      {},
      response
    );
  };
  return calls;
};

const networkError = (cfg: InternalAxiosRequestConfig, code: string) =>
  new AxiosError(`connect ${code} 10.0.0.1:443`, code, cfg, {});

const newClient = (options?: any) => {
  const client = new AlfredClient(config, { apiKey: API_KEY }, options);
  const sleep = jest.fn(async (_ms: number) => undefined);
  client._sleep = sleep;
  return { client, sleep };
};

const oauthClient = () => {
  const client = new AlfredClient(config, {
    oauth: { username: "user@example.com", password: PASSWORD },
  });
  client._sleep = jest.fn(async () => undefined);
  return client;
};

const catchError = async (promise: Promise<unknown>): Promise<any> => {
  try {
    await promise;
  } catch (err) {
    return err;
  }
  throw new Error("Expected the call to fail");
};

const uploadPayload = {
  sessionId: "session-1",
  file: {
    buffer: Buffer.from("hello"),
    originalName: "a.txt",
    mimetype: "text/plain",
  },
};

describe("rest: alfred-client", () => {
  it("should provide package version", () => {
    const client = new AlfredClient(config, auth);
    expect(client.version()).toBe(moduleInfo.version);
  });

  it("should send a User-Agent identifying the SDK", async () => {
    const { client } = newClient();
    const calls = stubAdapter(client, () => ({ data: { id: "1" } }));
    await client.jobs.get("1");
    expect(calls[0].headers["User-Agent"]).toBe(
      `alfred-node/${moduleInfo.version}`
    );
  });
});

describe("rest: client options", () => {
  it.each([
    [{ timeout: -1 }],
    [{ maxRetries: -1 }],
    [{ timeout: "10" }],
    [{ maxRetries: NaN }],
  ])("should reject invalid options %p", (options) => {
    expect(() => new AlfredClient(config, auth, options as any)).toThrow(
      ConfigurationError
    );
  });

  it("should accept zero values", () => {
    expect(
      () => new AlfredClient(config, auth, { timeout: 0, maxRetries: 0 })
    ).not.toThrow();
  });
});

describe("rest: timeouts", () => {
  it("should apply the default timeout to a normal call", async () => {
    const { client } = newClient();
    const calls = stubAdapter(client, () => ({ data: {} }));
    await client.jobs.get("1");
    expect(calls[0].timeout).toBe(60000);
  });

  it("should keep a timeout set on the request", async () => {
    const { client } = newClient();
    const calls = stubAdapter(client, () => ({ data: {} }));
    await client._http.get("api/job/detail/1", { timeout: 1234 });
    expect(calls[0].timeout).toBe(1234);
  });

  it("should not apply the default timeout to a multipart upload", async () => {
    const { client } = newClient();
    const calls = stubAdapter(client, () => ({ data: { file_id: "f" } }));
    await client.files.uploadFile(uploadPayload);
    expect(calls[0].timeout).toBeFalsy();
  });

  it("should not apply the default timeout to an arraybuffer download", async () => {
    const { client } = newClient();
    const calls = stubAdapter(client, () => ({
      data: Buffer.from("abc"),
      headers: {
        "content-disposition": "attachment; filename=a.txt",
        "content-type": "text/plain",
      },
    }));
    const result = await client.files.download("f");
    expect(result.originalName).toBe("a.txt");
    expect(calls[0].timeout).toBeFalsy();
  });

  it("should apply an explicit timeout to file transfers too", async () => {
    const { client } = newClient({ timeout: 5000 });
    const calls = stubAdapter(client, () => ({ data: { file_id: "f" } }));
    await client.files.uploadFile(uploadPayload);
    await client.jobs.get("1");
    expect(calls[0].timeout).toBe(5000);
    expect(calls[1].timeout).toBe(5000);
  });

  it("should disable the timeout with 0", async () => {
    const { client } = newClient({ timeout: 0 });
    const calls = stubAdapter(client, () => ({ data: {} }));
    await client.jobs.get("1");
    expect(calls[0].timeout).toBe(0);
  });
});

describe("rest: typed errors", () => {
  it("should throw NotFoundError, still an HTTPError, without the query string", async () => {
    const { client } = newClient();
    stubAdapter(client, () => ({ status: 404, statusText: "Not Found" }));
    const err = await catchError(
      client._http.get("api/job/detail/1?api_key=abc")
    );
    expect(err).toBeInstanceOf(NotFoundError);
    expect(err).toBeInstanceOf(HTTPError);
    expect(err.status).toBe(404);
    expect(err.message).toBe("404 Not Found");
    expect(err.method).toBe("GET");
    expect(err.url).toBe("api/job/detail/1");
  });

  it("should carry Alfred's message and correlation id", async () => {
    const { client } = newClient();
    stubAdapter(client, () => ({
      status: 400,
      data: { message: "Session is closed.", correlation_id: "ABCDEF123456" },
    }));
    const err = await catchError(client.jobs.create({ sessionId: "s" } as any));
    expect(err.message).toBe("Session is closed.");
    expect(err.correlationId).toBe("ABCDEF123456");
    expect(err.data).toEqual({
      message: "Session is closed.",
      correlation_id: "ABCDEF123456",
    });
  });

  it("should decode an error body of an arraybuffer download", async () => {
    const { client } = newClient();
    stubAdapter(client, () => ({
      status: 404,
      data: Buffer.from(JSON.stringify({ message: "File not found." })),
    }));
    const err = await catchError(client.files.download("f"));
    expect(err).toBeInstanceOf(NotFoundError);
    expect(err.message).toBe("File not found.");
  });

  it("should wrap a network error in RequestError", async () => {
    const { client } = newClient({ maxRetries: 0 });
    stubAdapter(client, (cfg) => {
      throw networkError(cfg, "ECONNRESET");
    });
    const err = await catchError(client.jobs.get("1"));
    expect(err).toBeInstanceOf(RequestError);
    expect(err).not.toBeInstanceOf(TimeoutError);
    expect(err.code).toBe("ECONNRESET");
    expect(err.method).toBe("GET");
    expect(err.url).toBe("api/job/detail/1");
  });

  it.each(["ECONNABORTED", "ETIMEDOUT"])(
    "should wrap %s in TimeoutError",
    async (code) => {
      const { client } = newClient({ maxRetries: 0 });
      stubAdapter(client, (cfg) => {
        throw new AxiosError("timeout of 60000ms exceeded", code, cfg, {});
      });
      const err = await catchError(client.jobs.get("1"));
      expect(err).toBeInstanceOf(TimeoutError);
      expect(err).toBeInstanceOf(RequestError);
      expect(err.code).toBe(code);
    }
  );

  it("should not leak the API key in thrown errors", async () => {
    const { client } = newClient({ maxRetries: 0 });
    stubAdapter(client, (cfg) => {
      if (cfg.url?.includes("network")) throw networkError(cfg, "ECONNRESET");
      return { status: 500, data: { message: "Boom" } };
    });

    for (const url of ["api/network", "api/server"]) {
      const err = await catchError(client._http.get(url));
      const text = JSON.stringify(err) + inspect(err, { depth: 6 });
      expect(text).not.toContain(API_KEY);
      expect(err.config).toBeUndefined();
      expect(err.request).toBeUndefined();
      expect(err.response).toBeUndefined();
    }
  });

  it("should not leak the bearer token or password in thrown errors", async () => {
    const client = oauthClient();
    stubAdapter(client, (cfg) => {
      if (cfg.url === "/token")
        return { data: { access_token: ACCESS_TOKEN, token_type: "bearer" } };
      if (cfg.url?.includes("network")) throw networkError(cfg, "ECONNRESET");
      return { status: 403, data: { Message: "Denied." } };
    });

    for (const url of ["api/network", "api/denied"]) {
      const err = await catchError(client._http.get(url));
      const text = JSON.stringify(err) + inspect(err, { depth: 6 });
      expect(text).not.toContain(ACCESS_TOKEN);
      expect(text).not.toContain(PASSWORD);
    }
  });
});

describe("rest: retries", () => {
  it("should retry a GET on 503 and succeed", async () => {
    const { client, sleep } = newClient();
    const calls = stubAdapter(client, (_cfg, call) =>
      call < 3 ? { status: 503 } : { data: { job_id: "1" } }
    );
    const job: any = await client.jobs.get("1");
    expect(job.jobId).toBe("1");
    expect(calls).toHaveLength(3);
    expect(sleep.mock.calls.map((c) => c[0])).toEqual([500, 1000]);
  });

  it("should give up after maxRetries", async () => {
    const { client } = newClient({ maxRetries: 3 });
    const calls = stubAdapter(client, () => ({ status: 502 }));
    const err = await catchError(client.jobs.get("1"));
    expect(err).toBeInstanceOf(ServerError);
    expect(err.status).toBe(502);
    expect(calls).toHaveLength(4);
  });

  it("should not retry when maxRetries is 0", async () => {
    const { client } = newClient({ maxRetries: 0 });
    const calls = stubAdapter(client, () => ({ status: 503 }));
    await catchError(client.jobs.get("1"));
    expect(calls).toHaveLength(1);
  });

  it.each([500, 400, 404, 409])(
    "should not retry status %i",
    async (status) => {
      const { client } = newClient();
      const calls = stubAdapter(client, () => ({ status }));
      await catchError(client.jobs.get("1"));
      expect(calls).toHaveLength(1);
    }
  );

  it("should retry a GET after a network error", async () => {
    const { client } = newClient();
    const calls = stubAdapter(client, (cfg, call) => {
      if (call === 1) throw networkError(cfg, "ECONNRESET");
      return { data: {} };
    });
    await client.jobs.get("1");
    expect(calls).toHaveLength(2);
  });

  it.each(["post", "put", "patch", "delete"])(
    "should never retry %s",
    async (method) => {
      const { client } = newClient();
      const calls = stubAdapter(client, (cfg, call) => {
        if (call === 1) return { status: 503 };
        throw networkError(cfg, "ECONNRESET");
      });
      const err = await catchError(
        client._http.request({ method, url: "api/job/create", data: {} })
      );
      expect(err).toBeInstanceOf(ServerError);
      expect(calls).toHaveLength(1);

      const second = await catchError(
        client._http.request({ method, url: "api/job/create", data: {} })
      );
      expect(second).toBeInstanceOf(RequestError);
      expect(calls).toHaveLength(2);
    }
  );

  it("should honour Retry-After in seconds and expose it", async () => {
    const { client, sleep } = newClient({ maxRetries: 1 });
    stubAdapter(client, () => ({
      status: 429,
      data: "API calls quota exceeded! maximum admitted 2500 per Minute.",
      headers: { "Retry-After": "5", "X-RateLimit-Reset": "150000" },
    }));
    const err = await catchError(client.jobs.get("1"));
    expect(err).toBeInstanceOf(RateLimitError);
    expect(err.retryAfter).toBe(5);
    expect(err.message).toBe(
      "API calls quota exceeded! maximum admitted 2500 per Minute."
    );
    expect(sleep).toHaveBeenCalledWith(5000);
  });

  it("should cap Retry-After at 30 seconds", async () => {
    const { client, sleep } = newClient({ maxRetries: 1 });
    stubAdapter(client, () => ({
      status: 503,
      headers: { "Retry-After": "120" },
    }));
    const err = await catchError(client.jobs.get("1"));
    expect(err.retryAfter).toBe(120);
    expect(sleep).toHaveBeenCalledWith(30000);
  });

  it("should honour Retry-After given as an HTTP date", async () => {
    const { client, sleep } = newClient({ maxRetries: 1 });
    stubAdapter(client, () => ({
      status: 429,
      headers: { "Retry-After": new Date(Date.now() + 8000).toUTCString() },
    }));
    const err = await catchError(client.jobs.get("1"));
    expect(err.retryAfter).toBeGreaterThanOrEqual(7);
    expect(err.retryAfter).toBeLessThanOrEqual(9);
    expect(sleep.mock.calls[0][0]).toBeGreaterThanOrEqual(7000);
    expect(sleep.mock.calls[0][0]).toBeLessThanOrEqual(9000);
  });

  it("should wait with real timers by default", async () => {
    jest.useFakeTimers();
    try {
      const client = new AlfredClient(config, auth);
      const calls = stubAdapter(client, (_cfg, call) =>
        call === 1 ? { status: 504 } : { data: {} }
      );
      const promise = client.jobs.get("1");
      await jest.advanceTimersByTimeAsync(499);
      expect(calls).toHaveLength(1);
      await jest.advanceTimersByTimeAsync(1);
      await promise;
      expect(calls).toHaveLength(2);
    } finally {
      jest.useRealTimers();
    }
  });
});

describe("rest: oauth", () => {
  it("should share one token request between concurrent calls", async () => {
    const client = oauthClient();
    const calls = stubAdapter(client, async (cfg) => {
      if (cfg.url === "/token") {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return { data: { access_token: ACCESS_TOKEN } };
      }
      return { data: {} };
    });
    await Promise.all([
      client.jobs.get("1"),
      client.jobs.get("2"),
      client.jobs.get("3"),
    ]);
    const tokenCalls = calls.filter((c) => c.url === "/token");
    expect(tokenCalls).toHaveLength(1);
    expect(tokenCalls[0].headers.Authorization).toBeUndefined();
    const apiCalls = calls.filter((c) => c.url !== "/token");
    for (const call of apiCalls)
      expect(call.headers.Authorization).toBe(`Bearer ${ACCESS_TOKEN}`);
  });

  it("should fetch a new token and retry once on 401", async () => {
    const client = oauthClient();
    let tokens = 0;
    const calls = stubAdapter(client, (cfg) => {
      if (cfg.url === "/token") {
        tokens += 1;
        return { data: { access_token: `token-${tokens}` } };
      }
      return cfg.headers.Authorization === "Bearer token-1"
        ? { status: 401 }
        : { data: {} };
    });
    await client.jobs.get("1");
    expect(tokens).toBe(2);
    expect(calls.filter((c) => c.url !== "/token")).toHaveLength(2);
  });

  it("should throw AuthenticationError when the new token is refused too", async () => {
    const client = oauthClient();
    stubAdapter(client, (cfg) =>
      cfg.url === "/token"
        ? { data: { access_token: ACCESS_TOKEN } }
        : { status: 401, headers: { "WWW-Authenticate": "Bearer" } }
    );
    const err = await catchError(client.jobs.get("1"));
    expect(err).toBeInstanceOf(AuthenticationError);
    expect(err.message).toBe("401 Unauthorized");
  });

  it("should include the server's error_description when credentials are refused", async () => {
    const client = oauthClient();
    stubAdapter(client, (cfg) =>
      cfg.url === "/token"
        ? {
            status: 400,
            data: {
              error: "invalid_grant",
              error_description: "The user name or password is incorrect.",
            },
          }
        : { data: {} }
    );
    const err = await catchError(client.jobs.get("1"));
    expect(err).toBeInstanceOf(ConfigurationError);
    expect(err.message).toBe(
      "Alfred refused the username and password: The user name or password is incorrect."
    );
  });

  it("should keep rate limits and server errors on /token typed", async () => {
    const client = oauthClient();
    stubAdapter(client, (cfg, call) =>
      cfg.url === "/token" ? { status: call === 1 ? 429 : 500 } : { data: {} }
    );
    expect(await catchError(client.jobs.get("1"))).toBeInstanceOf(
      RateLimitError
    );
    expect(await catchError(client.jobs.get("1"))).toBeInstanceOf(ServerError);
  });

  it("should reject a token answer without access_token", async () => {
    const client = oauthClient();
    const calls = stubAdapter(client, (cfg) =>
      cfg.url === "/token" ? { data: { token_type: "bearer" } } : { data: {} }
    );
    const err = await catchError(client.jobs.get("1"));
    expect(err).toBeInstanceOf(ConfigurationError);
    expect(calls.filter((c) => c.url !== "/token")).toHaveLength(0);
  });
});
