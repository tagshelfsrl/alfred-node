import { AxiosError } from "axios";
import { AlfredClient } from "../../src/rest";
import { Configuration } from "../../src/config";
import { HTTPError } from "../../src/errors";

const makeClient = () => {
  const client = new AlfredClient(Configuration.default("staging"), {
    apiKey: "key",
  });
  const calls: any[] = [];
  return { client, calls };
};

const ok = (client: AlfredClient, calls: any[], data: any) => {
  client._http.defaults.adapter = async (config: any) => {
    calls.push(config);
    return { data, status: 200, statusText: "OK", headers: {}, config };
  };
};

describe("rest: client responses", () => {
  it("converts JSON keys to camelCase, nested too", async () => {
    const { client, calls } = makeClient();
    ok(client, calls, { some_key: { inner_key: [{ deep_key: 1 }] } });
    const resp = await client._http.get("api/x");
    expect(resp.data).toEqual({ someKey: { innerKey: [{ deepKey: 1 }] } });
  });

  it.each(["arraybuffer", "stream", "blob"] as const)(
    "returns %s responses untouched",
    async (responseType) => {
      const { client, calls } = makeClient();
      const payload = { some_key: 1 };
      ok(client, calls, payload);
      const resp = await client._http.get("api/x", { responseType });
      expect(resp.data).toBe(payload);
      expect(resp.data).toEqual({ some_key: 1 });
    }
  );

  it("rejects with HTTPError carrying status and data", async () => {
    const { client } = makeClient();
    client._http.defaults.adapter = async (config: any) => {
      throw new AxiosError(
        "Request failed with status code 404",
        AxiosError.ERR_BAD_REQUEST,
        config,
        null,
        {
          data: { message: "not found" },
          status: 404,
          statusText: "Not Found",
          headers: {},
          config,
        } as any
      );
    };
    const err: any = await client._http.get("api/x").catch((e) => e);
    expect(err).toBeInstanceOf(HTTPError);
    expect(err.status).toBe(404);
    expect(err.data).toEqual({ message: "not found" });
  });

  it("rejects when the error config is gone by the time the URL is read", async () => {
    // The interceptor reads err.config first for the retry bookkeeping and
    // again for the URL. A real AxiosError always has a config, so simulate
    // one that no longer does on the later read.
    const { client } = makeClient();
    client._http.defaults.adapter = async (config: any) => {
      const err = new AxiosError(
        "Request failed with status code 409",
        AxiosError.ERR_BAD_REQUEST,
        config,
        null,
        {
          data: { message: "conflict" },
          status: 409,
          statusText: "Conflict",
          headers: {},
          config,
        } as any
      );
      let reads = 0;
      Object.defineProperty(err, "config", {
        get: () => (reads++ === 0 ? config : undefined),
      });
      throw err;
    };
    // Only assert that it rejects: how an error without a config is reported
    // is an implementation detail.
    await expect(client._http.get("api/x")).rejects.toBeInstanceOf(Error);
  });

  it("rejects when there is no response", async () => {
    const { client } = makeClient();
    client._http.defaults.adapter = async (config: any) => {
      throw new AxiosError("socket hang up", "ECONNRESET", config);
    };
    await expect(client._http.post("api/x", {})).rejects.toBeDefined();
  });

  it("rejects when a non-axios error is thrown", async () => {
    const { client } = makeClient();
    client._http.defaults.adapter = async () => {
      throw new Error("plain failure");
    };
    await expect(client._http.post("api/x", {})).rejects.toBeInstanceOf(Error);
  });
});

describe("rest: client misc", () => {
  it("version() equals the package.json version", () => {
    const { client } = makeClient();
    // eslint-disable-next-line
    expect(client.version()).toBe(require("../../package.json").version);
  });

  it.each(["accounts", "sessions", "jobs", "dataPoints", "files"] as const)(
    "%s returns a cached instance",
    (name) => {
      const { client } = makeClient();
      const first = client[name];
      expect(first).toBeDefined();
      expect(client[name]).toBe(first);
    }
  );
});
