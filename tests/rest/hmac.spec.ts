import crypto from "crypto";
import FormData from "form-data";
import { Readable } from "stream";

import { AlfredClient, Configuration } from "../../src";

const API_KEY = Buffer.from("test-signing-key").toString("base64");
const SECRET_KEY = "my-secret-key";
const BASE = "https://app.tagshelf.com";

function makeClient() {
  const client = new AlfredClient(Configuration.default("production"), {
    hmac: { apiKey: API_KEY, secretKey: SECRET_KEY },
  });
  const captured: any[] = [];
  (client as any)._http.defaults.adapter = async (config: any) => {
    captured.push(config);
    return { data: {}, status: 200, statusText: "OK", headers: {}, config };
  };
  return { client: client as any, captured };
}

// .NET HttpUtility.UrlEncode, written out independently of the SDK
function netUrlEncode(s: string): string {
  let out = "";
  for (const byte of Buffer.from(s, "utf8")) {
    const ch = String.fromCharCode(byte);
    if (/[A-Za-z0-9\-_.!*()]/.test(ch)) out += ch;
    else out += "%" + byte.toString(16).padStart(2, "0");
  }
  return out;
}

function parse(header: string) {
  expect(header.startsWith("amx ")).toBe(true);
  const parts = header.slice(4).split(":");
  expect(parts).toHaveLength(4);
  const [secret, signature, nonce, timestamp] = parts;
  return { secret, signature, nonce, timestamp };
}

// What the server computes
function expectedSignature(opts: {
  method: string;
  url: string;
  timestamp: string;
  nonce: string;
  body: Buffer;
}) {
  const bodyHash = opts.body.length
    ? crypto.createHash("md5").update(opts.body).digest("base64")
    : "";
  const raw =
    SECRET_KEY +
    opts.method.toUpperCase() +
    netUrlEncode(opts.url.toLowerCase()) +
    opts.timestamp +
    opts.nonce +
    bodyHash;
  return crypto
    .createHmac("sha256", Buffer.from(API_KEY, "base64"))
    .update(Buffer.from(raw, "utf8"))
    .digest("base64");
}

function check(cfg: any, method: string, url: string, body: Buffer) {
  const p = parse(cfg.headers.Authorization);
  expect(p.secret).toBe(SECRET_KEY);
  expect(p.signature).toBe(
    expectedSignature({
      method,
      url,
      timestamp: p.timestamp,
      nonce: p.nonce,
      body,
    })
  );
  return p;
}

describe("rest: hmac request signing", () => {
  it("signs a GET whose path has no leading slash", async () => {
    const { client, captured } = makeClient();
    await client._http.get("api/job/detail/abc");
    check(captured[0], "GET", `${BASE}/api/job/detail/abc`, Buffer.alloc(0));
  });

  it("signs a GET whose path has a leading slash", async () => {
    const { client, captured } = makeClient();
    await client._http.get("/api/job/detail/abc");
    check(captured[0], "GET", `${BASE}/api/job/detail/abc`, Buffer.alloc(0));
  });

  it("includes query parameters in the signed URL", async () => {
    const { client, captured } = makeClient();
    await client._http.get("api/job/list", {
      params: { page: 2, name: "A B", tag: "x" },
    });
    check(
      captured[0],
      "GET",
      `${BASE}/api/job/list?page=2&name=A+B&tag=x`,
      Buffer.alloc(0)
    );
  });

  it("encodes apostrophes and tildes like .NET", async () => {
    const { client, captured } = makeClient();
    await client._http.get("api/it's/a~b");
    const url = `${BASE}/api/it's/a~b`;
    expect(netUrlEncode(url)).toContain("%27");
    expect(netUrlEncode(url)).toContain("%7e");
    check(captured[0], "GET", url, Buffer.alloc(0));
  });

  it("signs the JSON string that is actually sent", async () => {
    const { client, captured } = makeClient();
    const payload = { name: "café", n: 1, nested: { a: [1, 2] } };
    await client._http.post("api/job/create", payload);
    const cfg = captured[0];
    // The adapter receives a string identical to what was hashed
    expect(typeof cfg.data).toBe("string");
    expect(cfg.data).toBe(JSON.stringify(payload));
    expect(String(cfg.headers["Content-Type"])).toContain("application/json");
    check(cfg, "POST", `${BASE}/api/job/create`, Buffer.from(cfg.data, "utf8"));
  });

  it("signs the exact multipart buffer that is sent", async () => {
    const { client, captured } = makeClient();
    const form = new FormData();
    const binary = Buffer.from([0, 1, 2, 255, 254, 10, 13, 200]);
    form.append("file", binary, { filename: "a.bin" });
    form.append("tag", "invoice");
    const boundary = form.getBoundary();
    await client._http.post("api/file/upload", form);
    const cfg = captured[0];
    expect(Buffer.isBuffer(cfg.data)).toBe(true);
    expect(cfg.data.includes(binary)).toBe(true);
    expect(String(cfg.headers["Content-Type"])).toBe(
      `multipart/form-data; boundary=${boundary}`
    );
    expect(cfg.data.toString("latin1")).toContain(`--${boundary}--`);
    expect(String(cfg.headers["Content-Length"])).toBe(String(cfg.data.length));
    check(cfg, "POST", `${BASE}/api/file/upload`, cfg.data);
  });

  it("uses an empty body hash for a POST with no body", async () => {
    const { client, captured } = makeClient();
    await client._http.post("api/job/cancel/1");
    check(captured[0], "POST", `${BASE}/api/job/cancel/1`, Buffer.alloc(0));
  });

  it("signs a URLSearchParams body as its string form", async () => {
    const { client, captured } = makeClient();
    const params = new URLSearchParams({ a: "1", b: "x y" });
    await client._http.post("api/x", params);
    const cfg = captured[0];
    expect(Buffer.from(cfg.data).toString("utf8")).toBe("a=1&b=x+y");
    expect(String(cfg.headers["Content-Type"])).toContain(
      "application/x-www-form-urlencoded"
    );
    check(cfg, "POST", `${BASE}/api/x`, Buffer.from("a=1&b=x+y"));
  });

  it("signs a plain string body as is", async () => {
    const { client, captured } = makeClient();
    await client._http.post("api/x", "  raw text  ", {
      headers: { "Content-Type": "application/json" },
    });
    const cfg = captured[0];
    expect(Buffer.isBuffer(cfg.data)).toBe(true);
    expect(cfg.data.toString("utf8")).toBe("  raw text  ");
    check(cfg, "POST", `${BASE}/api/x`, Buffer.from("  raw text  "));
  });

  it("uses a different nonce for every request", async () => {
    const { client, captured } = makeClient();
    await client._http.get("api/a");
    await client._http.get("api/a");
    const a = parse(captured[0].headers.Authorization);
    const b = parse(captured[1].headers.Authorization);
    expect(a.nonce).not.toBe(b.nonce);
  });

  it("sends secretKey first and a whole-second timestamp", async () => {
    const { client, captured } = makeClient();
    const before = Math.floor(Date.now() / 1000);
    await client._http.get("api/a");
    const p = parse(captured[0].headers.Authorization);
    expect(p.secret).toBe(SECRET_KEY);
    expect(p.timestamp).toMatch(/^\d+$/);
    expect(Number(p.timestamp)).toBeGreaterThanOrEqual(before);
    expect(Number(p.timestamp)).toBeLessThanOrEqual(before + 5);
    expect(captured[0].headers.Authorization).not.toContain(API_KEY);
  });

  describe("body forms", () => {
    const url = `${BASE}/api/x`;

    async function send(data: any, dropContentType = false) {
      const { client, captured } = makeClient();
      if (dropContentType) {
        // Registered last, so it runs before the HMAC interceptor
        client._http.interceptors.request.use((c: any) => {
          c.headers.delete("Content-Type");
          return c;
        });
      }
      await client._http.post("api/x", data);
      return captured[0];
    }

    it("signs a Buffer body", async () => {
      const bytes = Buffer.from([1, 2, 3, 250]);
      const cfg = await send(bytes);
      expect(Buffer.from(cfg.data).equals(bytes)).toBe(true);
      check(cfg, "POST", url, Buffer.from(cfg.data));
    });

    it("signs a Uint8Array that is a view into a larger buffer", async () => {
      const backing = new Uint8Array([9, 9, 1, 2, 3, 9]);
      const view = backing.subarray(2, 5);
      const cfg = await send(view);
      expect(Buffer.from(cfg.data).equals(Buffer.from([1, 2, 3]))).toBe(true);
      check(cfg, "POST", url, Buffer.from(cfg.data));
    });

    it("signs an ArrayBuffer body", async () => {
      const ab = new Uint8Array([4, 5, 6]).buffer;
      const cfg = await send(ab);
      expect(Buffer.from(cfg.data).equals(Buffer.from([4, 5, 6]))).toBe(true);
      check(cfg, "POST", url, Buffer.from(cfg.data));
    });

    it("signs a string body", async () => {
      const cfg = await send("h\u00e9llo");
      expect(Buffer.from(cfg.data).toString("utf8")).toBe("h\u00e9llo");
      check(cfg, "POST", url, Buffer.from(cfg.data));
    });

    it("signs a URLSearchParams body", async () => {
      const cfg = await send(new URLSearchParams({ q: "a b" }));
      expect(Buffer.from(cfg.data).toString("utf8")).toBe("q=a+b");
      check(cfg, "POST", url, Buffer.from(cfg.data));
    });

    it("treats empty, null and undefined bodies as no body", async () => {
      for (const data of ["", null, undefined]) {
        const cfg = await send(data);
        expect(parse(cfg.headers.Authorization).signature).toBe(
          expectedSignature({
            method: "POST",
            url,
            ...parseTimes(cfg),
            body: Buffer.alloc(0),
          })
        );
      }
    });

    it("sets a JSON Content-Type for an object when none is set", async () => {
      const cfg = await send({ a: 1 }, true);
      expect(String(cfg.headers["Content-Type"])).toBe("application/json");
      expect(cfg.data).toBe('{"a":1}');
      check(cfg, "POST", url, Buffer.from(cfg.data));
    });

    it("rejects a stream body, which cannot be hashed up front", async () => {
      const { client } = makeClient();
      const stream = new Readable({ read() {} });
      await expect(client._http.post("api/x", stream)).rejects.toThrow(
        "Unsupported request body type"
      );
    });
  });
});

function parseTimes(cfg: any) {
  const p = parse(cfg.headers.Authorization);
  return { timestamp: p.timestamp, nonce: p.nonce };
}
