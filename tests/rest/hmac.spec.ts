import crypto from "crypto";
import FormData from "form-data";

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
});
