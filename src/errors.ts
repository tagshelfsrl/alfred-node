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
function stripQuery(url?: string): string | undefined {
  if (typeof url !== "string") return url;
  return url.split(/[?#]/)[0];
}
