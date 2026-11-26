import { AxiosError } from "axios";
import { AlfredClient } from "../../src/rest";
import { Configuration } from "../../src/config";
import { ConfigurationError, HTTPError } from "../../src/errors";

const config = Configuration.default("staging");
const HMAC = {
  apiKey: Buffer.from("super-secret-bytes").toString("base64"),
  secretKey: "my-secret",
};

type Handler = (config: any) => { status: number; data?: any };

const stub = (client: AlfredClient, handler: Handler) => {
  const calls: any[] = [];
  client._http.defaults.adapter = async (cfg: any) => {
    calls.push(cfg);
    const { status, data = {} } = handler(cfg);
    const response = {
      data,
      status,
      statusText: "",
      headers: {},
      config: cfg,
    };
    if (status >= 400)
      throw new AxiosError(
        `Request failed with status code ${status}`,
        status >= 500
          ? AxiosError.ERR_BAD_RESPONSE
          : AxiosError.ERR_BAD_REQUEST,
        cfg,
        null,
        response as any
      );
    return response;
  };
  return calls;
};

const header = (cfg: any, name: string) =>
  cfg.headers.get ? cfg.headers.get(name) : cfg.headers[name];

describe("rest: client authentication", () => {
  const original = process.env.ALFRED_API_KEY;
  beforeEach(() => {
    delete process.env.ALFRED_API_KEY;
  });
  afterEach(() => {
    if (original === undefined) delete process.env.ALFRED_API_KEY;
    else process.env.ALFRED_API_KEY = original;
  });

  describe("API key", () => {
    it("sends the X-TagshelfAPI-Key header", async () => {
      const client = new AlfredClient(config, { apiKey: "abc" });
      const calls = stub(client, () => ({ status: 200 }));
      await client._http.get("api/x");
      expect(header(calls[0], "X-TagshelfAPI-Key")).toBe("abc");
    });

    it("falls back to ALFRED_API_KEY from the environment", async () => {
      process.env.ALFRED_API_KEY = "env-key";
      const client = new AlfredClient(config, {});
      const calls = stub(client, () => ({ status: 200 }));
      await client._http.get("api/x");
      expect(header(calls[0], "X-TagshelfAPI-Key")).toBe("env-key");
    });

    it("throws ConfigurationError without any credentials", () => {
      expect(() => new AlfredClient(config, {})).toThrow(ConfigurationError);
    });
  });

  describe("OAuth", () => {
    const oauth = { username: "user@example.com", password: "p@ss word" };
    const handler =
      (tokenStatus = 200, tokenValue = "tok1"): Handler =>
      (cfg) =>
        cfg.url === "/token"
          ? tokenStatus === 200
            ? { status: 200, data: { access_token: tokenValue } }
            : { status: tokenStatus, data: {} }
          : { status: 200, data: { ok: true } };

    it("gets a token first, then sends the request with it", async () => {
      const client = new AlfredClient(config, { oauth });
      const calls = stub(client, handler());
      await client._http.get("api/x");

      expect(calls).toHaveLength(2);
      expect(calls[0].url).toBe("/token");
      expect(calls[0].method).toBe("post");
      const body = new URLSearchParams(String(calls[0].data));
      expect(body.get("grant_type")).toBe("password");
      expect(body.get("username")).toBe(oauth.username);
      expect(body.get("password")).toBe(oauth.password);
      expect(calls[1].url).toBe("api/x");
      expect(header(calls[1], "Authorization")).toBe("Bearer tok1");
    });

    it("reuses the token on later requests", async () => {
      const client = new AlfredClient(config, { oauth });
      const calls = stub(client, handler());
      await client._http.get("api/x");
      await client._http.get("api/y");
      expect(calls.filter((c) => c.url === "/token")).toHaveLength(1);
      expect(header(calls[2], "Authorization")).toBe("Bearer tok1");
    });

    it("gets a new token and retries once after a 401", async () => {
      const client = new AlfredClient(config, { oauth });
      let tokens = 0;
      let first = true;
      const calls = stub(client, (cfg) => {
        if (cfg.url === "/token")
          return { status: 200, data: { access_token: `tok${++tokens}` } };
        if (first) {
          first = false;
          return { status: 401 };
        }
        return { status: 200, data: { ok: true } };
      });

      const resp = await client._http.get("api/x");
      expect(resp.data).toEqual({ ok: true });
      expect(calls.filter((c) => c.url === "/token")).toHaveLength(2);
      const apiCalls = calls.filter((c) => c.url === "api/x");
      expect(apiCalls).toHaveLength(2);
      expect(header(apiCalls[0], "Authorization")).toBe("Bearer tok1");
      expect(header(apiCalls[1], "Authorization")).toBe("Bearer tok2");
    });

    it("rejects with HTTPError after a second 401", async () => {
      const client = new AlfredClient(config, { oauth });
      const calls = stub(client, (cfg) =>
        cfg.url === "/token"
          ? { status: 200, data: { access_token: "t" } }
          : { status: 401, data: { message: "no" } }
      );
      const err: any = await client._http.get("api/x").catch((e) => e);
      expect(err).toBeInstanceOf(HTTPError);
      expect(err.status).toBe(401);
      expect(calls.filter((c) => c.url === "api/x")).toHaveLength(2);
    });

    it("rejects with ConfigurationError when /token answers 400", async () => {
      const client = new AlfredClient(config, { oauth });
      stub(client, handler(400));
      await expect(client._http.get("api/x")).rejects.toBeInstanceOf(
        ConfigurationError
      );
    });

    it("rejects, but not with ConfigurationError, when /token answers 500", async () => {
      const client = new AlfredClient(config, { oauth });
      stub(client, handler(500));
      const err = await client._http.post("api/x", {}).catch((e) => e);
      expect(err).toBeInstanceOf(Error);
      expect(err).not.toBeInstanceOf(ConfigurationError);
    });
  });

  describe("HMAC", () => {
    const parse = (auth: string) => {
      expect(auth.startsWith("amx ")).toBe(true);
      const parts = auth.slice(4).split(":");
      expect(parts).toHaveLength(4);
      return parts;
    };

    it("signs a GET without a body", async () => {
      const client = new AlfredClient(config, { hmac: HMAC });
      const calls = stub(client, () => ({ status: 200 }));
      await client._http.get("api/x");
      const [secret, signature, nonce, timestamp] = parse(
        header(calls[0], "Authorization")
      );
      expect(secret).toBe(HMAC.secretKey);
      expect(signature.length).toBeGreaterThan(0);
      expect(nonce.length).toBeGreaterThan(0);
      expect(Number(timestamp)).not.toBeNaN();
    });

    it("signs a POST with a JSON body", async () => {
      const client = new AlfredClient(config, { hmac: HMAC });
      const calls = stub(client, () => ({ status: 200 }));
      await client._http.post("api/x", { a: 1 });
      const [secret] = parse(header(calls[0], "Authorization"));
      expect(secret).toBe(HMAC.secretKey);
    });
  });

  describe("precedence", () => {
    it("API key wins over OAuth and HMAC", async () => {
      const client = new AlfredClient(config, {
        apiKey: "k",
        oauth: { username: "u", password: "p" },
        hmac: HMAC,
      });
      const calls = stub(client, () => ({ status: 200 }));
      await client._http.get("api/x");
      expect(calls).toHaveLength(1);
      expect(header(calls[0], "X-TagshelfAPI-Key")).toBe("k");
      expect(header(calls[0], "Authorization")).toBeFalsy();
    });

    it("OAuth wins over HMAC", async () => {
      const client = new AlfredClient(config, {
        oauth: { username: "u", password: "p" },
        hmac: HMAC,
      });
      const calls = stub(client, (cfg) =>
        cfg.url === "/token"
          ? { status: 200, data: { access_token: "t" } }
          : { status: 200 }
      );
      await client._http.get("api/x");
      expect(header(calls[calls.length - 1], "Authorization")).toBe("Bearer t");
    });
  });
});
