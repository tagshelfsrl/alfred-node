import { STATUS_CODES } from "http";

/** Longest message kept from a server answer, so an HTML page never ends up in a log line. */
export const MAX_MESSAGE_LENGTH = 300;

/** Longest wait, in seconds, the client honours from a `Retry-After` header. */
export const MAX_RETRY_AFTER_SECONDS = 30;

const MESSAGE_KEYS = [
  "message",
  "Message",
  "error_description",
  "error",
  "detail",
];

/**
 * Base class of every error the SDK throws.
 */
export class AlfredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * The client was configured incorrectly, or Alfred refused the credentials it was given.
 */
export class ConfigurationError extends AlfredError {}

/** Optional details carried by an {@link HTTPError}. */
export interface HTTPErrorDetails {
  method?: string;
  correlationId?: string;
  reason?: string;
  errors?: string[];
}

/**
 * Alfred answered with an error status. `message` holds Alfred's own explanation when it gave one.
 */
export class HTTPError extends AlfredError {
  status: number;
  data: any;
  url: string;
  method?: string;
  /** Support reference for the logged error (not a job's correlation id). */
  correlationId?: string;
  /** Why Alfred refused the request, when it says so (for example a job restart). */
  reason?: string;
  /** Individual validation messages, when Alfred lists them. */
  errors?: string[];

  constructor(
    message: string,
    status: number,
    data: any,
    url: string,
    details: HTTPErrorDetails = {}
  ) {
    super(message);
    this.status = status;
    this.data = data;
    this.url = stripQuery(url) as string;
    if (details.method !== undefined) this.method = details.method;
    if (details.correlationId !== undefined)
      this.correlationId = details.correlationId;
    if (details.reason !== undefined) this.reason = details.reason;
    if (details.errors !== undefined) this.errors = details.errors;
  }
}

/** HTTP 400: Alfred rejected the request as invalid. */
export class BadRequestError extends HTTPError {}

/** HTTP 401: the credentials were missing, wrong or expired. */
export class AuthenticationError extends HTTPError {}

/** HTTP 403: the credentials are valid but not allowed to do this. */
export class PermissionError extends HTTPError {}

/** HTTP 404: the resource does not exist or is not visible to these credentials. */
export class NotFoundError extends HTTPError {}

/** HTTP 409: the request conflicts with the resource's current state. */
export class ConflictError extends HTTPError {}

/** HTTP 413: the payload is larger than Alfred accepts. */
export class PayloadTooLargeError extends HTTPError {
  /** Largest accepted size in bytes, when Alfred says so. */
  maxBytes?: number;
}

/** HTTP 429: too many requests. */
export class RateLimitError extends HTTPError {
  /** Seconds Alfred asked to wait before trying again, when it says so. */
  retryAfter?: number;
}

/** HTTP 5xx: Alfred failed to handle the request. */
export class ServerError extends HTTPError {
  /** Seconds Alfred asked to wait before trying again, when it says so. */
  retryAfter?: number;
}

/** Optional details carried by a {@link RequestError}. */
export interface RequestErrorDetails {
  method?: string;
  url?: string;
  code?: string;
}

/**
 * The request never got an HTTP answer (connection refused or reset, DNS failure...).
 */
export class RequestError extends AlfredError {
  method?: string;
  url?: string;
  /** Low-level error code, such as `ECONNRESET`. */
  code?: string;

  constructor(message: string, details: RequestErrorDetails = {}) {
    super(message);
    if (details.method !== undefined) this.method = details.method;
    if (details.url !== undefined) this.url = stripQuery(details.url);
    if (details.code !== undefined) this.code = details.code;
  }
}

/** The request took longer than the configured timeout. */
export class TimeoutError extends RequestError {}

/**
 * Removes the query string and fragment from a URL.
 */
export function stripQuery(url?: string): string | undefined {
  if (typeof url !== "string") return url;
  return url.split(/[?#]/)[0];
}

/**
 * Turns a response body into a string or a parsed value: binary bodies are decoded as UTF-8
 * and text that looks like JSON is parsed.
 */
export function decodeBody(body: unknown): unknown {
  let value = body;
  if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer)
    value = Buffer.from(value).toString("utf8");
  else if (value instanceof Uint8Array)
    value = Buffer.from(value).toString("utf8");

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^[{["]/.test(trimmed)) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return value;
      }
    }
  }
  return value;
}

function cleanText(text: string): string {
  let result = text;
  if (/<[a-z!/][^>]*>/i.test(result)) {
    result = result
      .replace(/<(script|style)\b[\s\S]*?<\/\1\s*>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&amp;/gi, "&");
  }
  result = result.replace(/\s+/g, " ").trim();
  if (result.length > MAX_MESSAGE_LENGTH)
    result = result.slice(0, MAX_MESSAGE_LENGTH - 3).trimEnd() + "...";
  return result;
}

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rawMessage(body: unknown): string | undefined {
  if (typeof body === "string") return body;
  if (!isObject(body)) return undefined;

  for (const key of MESSAGE_KEYS) {
    const value = body[key];
    if (typeof value === "string" && value.trim()) return value;
    if (key === "error" && isObject(value)) {
      const nested = value.message;
      if (typeof nested === "string" && nested.trim()) return nested;
    }
  }

  if (Array.isArray(body.errors)) {
    const joined = body.errors
      .filter((item: unknown) => typeof item === "string" && item.trim())
      .join("; ");
    if (joined) return joined;
  }
  return undefined;
}

/**
 * Extracts the human-readable message from an Alfred error body.
 * @param body - The response body, in any of the shapes Alfred sends (object, JSON string,
 * plain text, HTML, binary or empty).
 * @param status - The HTTP status, used for the fallback message.
 * @param statusText - The HTTP status text, used for the fallback message.
 * @returns Alfred's message, or `"<status> <statusText>"` when the body has none.
 */
export function extractErrorMessage(
  body: unknown,
  status: number,
  statusText?: string
): string {
  const raw = rawMessage(decodeBody(body));
  const text = raw ? cleanText(raw) : "";
  if (text) return text;

  const reason = statusText || STATUS_CODES[status] || "";
  return `${status} ${reason}`.trim();
}

function headerValue(headers: unknown, name: string): string | undefined {
  if (!headers || typeof headers !== "object") return undefined;
  const lower = name.toLowerCase();
  let value: unknown;
  const getter = (headers as any).get;
  if (typeof getter === "function") value = getter.call(headers, name);
  if (value === undefined || value === null) {
    for (const key of Object.keys(headers)) {
      if (key.toLowerCase() === lower) {
        value = (headers as any)[key];
        break;
      }
    }
  }
  if (Array.isArray(value)) value = value[0];
  if (value === undefined || value === null) return undefined;
  return String(value);
}

/**
 * Reads a `Retry-After` header given in seconds or as an HTTP date.
 * @returns The wait in seconds, or `undefined` when the header is missing or invalid.
 */
export function parseRetryAfter(
  headers: unknown,
  now: number = Date.now()
): number | undefined {
  const value = headerValue(headers, "retry-after")?.trim();
  if (!value) return undefined;

  if (/^\d+(\.\d+)?$/.test(value)) return Number(value);

  const date = Date.parse(value);
  if (isNaN(date)) return undefined;
  return Math.max(0, Math.ceil((date - now) / 1000));
}

function errorClassFor(status: number): typeof HTTPError {
  switch (status) {
    case 400:
      return BadRequestError;
    case 401:
      return AuthenticationError;
    case 403:
      return PermissionError;
    case 404:
      return NotFoundError;
    case 409:
      return ConflictError;
    case 413:
      return PayloadTooLargeError;
    case 429:
      return RateLimitError;
    default:
      return status >= 500 && status <= 599 ? ServerError : HTTPError;
  }
}

/**
 * Builds the typed error for a failed HTTP answer.
 * @param status - HTTP status code.
 * @param statusText - HTTP status text.
 * @param body - Response body as received.
 * @param headers - Response headers; only `Retry-After` is read and none are kept.
 * @param method - HTTP method of the request.
 * @param url - Request URL; the query string is removed.
 */
export function createHTTPError(
  status: number,
  statusText: string | undefined,
  body: unknown,
  headers: unknown,
  method?: string,
  url?: string
): HTTPError {
  const data = decodeBody(body);
  const message = extractErrorMessage(data, status, statusText);
  const details: HTTPErrorDetails = {};
  if (method) details.method = method.toUpperCase();

  if (isObject(data)) {
    const correlationId = data.correlation_id ?? data.correlationId;
    if (typeof correlationId === "string" && correlationId)
      details.correlationId = correlationId;
    if (typeof data.reason === "string" && data.reason)
      details.reason = data.reason;
    if (Array.isArray(data.errors))
      details.errors = data.errors.filter(
        (item: unknown): item is string => typeof item === "string"
      );
  }

  const ErrorClass = errorClassFor(status);
  const error = new ErrorClass(message, status, data, url ?? "", details);

  if (error instanceof PayloadTooLargeError && isObject(data)) {
    const maxBytes = data.max_bytes ?? data.maxBytes;
    if (maxBytes !== null && maxBytes !== "" && !isNaN(Number(maxBytes)))
      error.maxBytes = Number(maxBytes);
  }

  if (error instanceof RateLimitError || error instanceof ServerError) {
    const retryAfter = parseRetryAfter(headers);
    if (retryAfter !== undefined) error.retryAfter = retryAfter;
  }

  return error;
}
