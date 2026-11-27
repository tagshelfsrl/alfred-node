import crypto from "crypto";
import { InternalAxiosRequestConfig } from "axios";

/**
 * Encode a string the way .NET's `HttpUtility.UrlEncode` does, which is what
 * the API uses when it verifies an HMAC signature: unreserved characters are
 * `A-Z a-z 0-9 - _ . ! * ( )`, everything else is percent-encoded with
 * lower-case hex digits (so `'` becomes `%27` and `~` becomes `%7e`).
 */
export function dotNetUrlEncode(value: string): string {
  return encodeURIComponent(value)
    .replace(/'/g, "%27")
    .replace(/~/g, "%7e")
    .replace(/%[0-9A-F]{2}/g, (m) => m.toLowerCase());
}

/**
 * Turn the request body into the exact bytes that will be sent and assign them
 * back to `config.data`, so that what is hashed is what travels on the wire.
 * Returns the body bytes (empty when there is no body).
 */
export function finalizeBody(config: InternalAxiosRequestConfig): Buffer {
  const data: any = config.data;
  if (data === undefined || data === null || data === "") {
    return Buffer.alloc(0);
  }

  // form-data package (multipart uploads)
  if (
    typeof data === "object" &&
    typeof data.getBuffer === "function" &&
    typeof data.getHeaders === "function"
  ) {
    const body: Buffer = data.getBuffer();
    config.headers.set("Content-Type", data.getHeaders()["content-type"]);
    config.headers.set("Content-Length", String(body.length));
    config.data = body;
    return body;
  }

  if (Buffer.isBuffer(data) || data instanceof Uint8Array) {
    // Assign a Buffer view back: axios would otherwise send a bare
    // Uint8Array's whole underlying ArrayBuffer, ignoring its offset.
    const body = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    config.data = body;
    return body;
  }
  if (data instanceof ArrayBuffer) {
    const body = Buffer.from(data);
    config.data = body;
    return body;
  }

  // Strings and URLSearchParams are sent as bytes: axios would otherwise
  // trim them or JSON-quote them when the Content-Type is JSON (the client's
  // default), and the signed bytes would no longer be the sent bytes.
  if (typeof data === "string") {
    const body = Buffer.from(data, "utf8");
    config.data = body;
    return body;
  }

  if (data instanceof URLSearchParams) {
    const body = Buffer.from(data.toString(), "utf8");
    config.headers.set(
      "Content-Type",
      "application/x-www-form-urlencoded;charset=utf-8"
    );
    config.data = body;
    return body;
  }

  if (typeof data === "object" && typeof data.pipe !== "function") {
    const text = JSON.stringify(data);
    if (!config.headers.has("Content-Type")) {
      config.headers.set("Content-Type", "application/json");
    }
    config.data = text;
    return Buffer.from(text, "utf8");
  }

  throw new Error("Unsupported request body type for HMAC authentication.");
}

/**
 * Build the value of the `Authorization` header the API verifies:
 * `amx <secretKey>:<signature>:<nonce>:<unixSeconds>`.
 * The signature is HMAC-SHA256, keyed with the base64-decoded API key, over
 * `secretKey + METHOD + urlEncode(lower(absoluteUrl)) + timestamp + nonce + bodyMd5`.
 */
export function buildHmacHeader(
  apiKey: string,
  secretKey: string,
  method: string,
  absoluteUrl: string,
  body: Buffer,
  nonce: string,
  timestamp: number
): string {
  const requestUri = dotNetUrlEncode(absoluteUrl.toLowerCase());
  const bodyHash = body.length
    ? crypto.createHash("md5").update(body).digest("base64")
    : "";

  const raw =
    secretKey +
    method.toUpperCase() +
    requestUri +
    timestamp +
    nonce +
    bodyHash;
  const signature = crypto
    .createHmac("sha256", Buffer.from(apiKey, "base64"))
    .update(Buffer.from(raw, "utf8"))
    .digest("base64");

  return `amx ${secretKey}:${signature}:${nonce}:${timestamp}`;
}
