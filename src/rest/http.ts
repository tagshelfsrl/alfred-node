import { AxiosError, InternalAxiosRequestConfig, isAxiosError } from "axios";

import {
  AlfredError,
  ConfigurationError,
  RequestError,
  TimeoutError,
} from "../errors";
import {
  MAX_RETRY_AFTER_SECONDS,
  createHTTPError,
  parseRetryAfter,
} from "./error-response";

/**
 * Transport options for {@link AlfredClient}.
 */
export interface ClientOptions {
  /**
   * Request timeout in milliseconds. Defaults to 60000; `0` disables it. When left out, file
   * uploads and downloads have no timeout.
   */
  timeout?: number;
  /**
   * How many times a failed read (`GET`) is tried again after a network error, a timeout or an
   * HTTP 429, 502, 503 or 504. Defaults to 2; `0` disables retries.
   */
  maxRetries?: number;
}

export const DEFAULT_TIMEOUT_MS = 60000;
export const DEFAULT_MAX_RETRIES = 2;
const BASE_BACKOFF_MS = 500;
const RETRYABLE_STATUSES = [429, 502, 503, 504];
const TIMEOUT_CODES = ["ECONNABORTED", "ETIMEDOUT"];

/** Request config with the bookkeeping fields the client adds. */
export type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _retryCount?: number;
};

/** Resolved transport settings. */
export interface TransportSettings {
  timeout: number;
  timeoutExplicit: boolean;
  maxRetries: number;
}

function checkOption(name: string, value: unknown, fallback: number): number {
  if (value === undefined) return fallback;
  if (typeof value !== "number" || !isFinite(value) || value < 0)
    throw new ConfigurationError(
      `The "${name}" option must be a number greater than or equal to 0.`
    );
  return value;
}

/**
 * Validates the client options and applies the defaults.
 * @throws {ConfigurationError} When an option is negative or not a number.
 */
export function resolveOptions(options: ClientOptions = {}): TransportSettings {
  return {
    timeout: checkOption("timeout", options.timeout, DEFAULT_TIMEOUT_MS),
    timeoutExplicit: options.timeout !== undefined,
    maxRetries: Math.floor(
      checkOption("maxRetries", options.maxRetries, DEFAULT_MAX_RETRIES)
    ),
  };
}

/**
 * Whether a request uploads or downloads a file: multipart form data, or a binary response.
 */
export function isFileTransfer(config: InternalAxiosRequestConfig): boolean {
  if (
    config.responseType === "arraybuffer" ||
    config.responseType === "stream" ||
    config.responseType === "blob"
  )
    return true;

  const data = config.data as any;
  if (!data || typeof data !== "object") return false;
  if (typeof FormData !== "undefined" && data instanceof FormData) return true;
  // The `form-data` package used for Node uploads
  return (
    typeof data.getHeaders === "function" &&
    typeof data.getBoundary === "function"
  );
}

/**
 * Returns the timeout a request should use. A timeout the caller set on the request wins.
 */
export function timeoutFor(
  config: InternalAxiosRequestConfig,
  settings: TransportSettings
): number | undefined {
  if (config.timeout) return config.timeout;
  if (!settings.timeoutExplicit && isFileTransfer(config)) return undefined;
  return settings.timeout;
}

/**
 * Whether a failed request may be sent again: only reads, and only for failures that are
 * likely to be temporary.
 */
export function isRetryable(
  err: AxiosError,
  config: InternalAxiosRequestConfig
): boolean {
  if (err.code === AxiosError.ERR_CANCELED) return false;
  // axios has already lower-cased the method and defaulted it to "get"
  if (config.method !== "get") return false;
  if (!err.response) return true;
  return RETRYABLE_STATUSES.includes(err.response.status);
}

/**
 * Milliseconds to wait before retry number `attempt` (0-based): `Retry-After` when Alfred sent a
 * valid one (at most 30 s), otherwise 500 ms, 1 s, 2 s...
 */
export function retryDelay(err: AxiosError, attempt: number): number {
  const retryAfter = err.response
    ? parseRetryAfter(err.response.headers)
    : undefined;
  if (retryAfter !== undefined)
    return Math.min(retryAfter, MAX_RETRY_AFTER_SECONDS) * 1000;
  return BASE_BACKOFF_MS * Math.pow(2, attempt);
}

/** Waits the given number of milliseconds. */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Converts anything a request can fail with into an {@link AlfredError} that holds no request
 * configuration, headers or credentials.
 */
export function toAlfredError(err: unknown): AlfredError {
  if (err instanceof AlfredError) return err;

  if (isAxiosError(err)) {
    const method = err.config?.method?.toUpperCase();
    const url = err.config?.url;

    if (err.response)
      return createHTTPError(
        err.response.status,
        err.response.statusText,
        err.response.data,
        err.response.headers,
        method,
        url
      );

    const code = err.code;
    const target = ["Request", method, url?.split(/[?#]/)[0]]
      .filter(Boolean)
      .join(" ");
    const details = { method, url, code };
    if (code && TIMEOUT_CODES.includes(code))
      return new TimeoutError(`${target} timed out: ${err.message}`, details);
    return new RequestError(`${target} failed: ${err.message}`, details);
  }

  const message = err instanceof Error ? err.message : String(err);
  return new RequestError(`Request failed: ${message}`);
}
