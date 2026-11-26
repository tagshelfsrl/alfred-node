import crypto from "crypto";
import axios, { AxiosInstance, isAxiosError } from "axios";

import { Jobs } from "./jobs";
import { Files } from "./files";
import { Accounts } from "./accounts";
import { Sessions } from "./sessions";
import { DataPoints } from "./datapoints";
import { Env } from "../utils/env";
import { ClientConfiguration } from "../config";
import { toCamelCase } from "../utils/convert-case";
import { ConfigurationError, HTTPError } from "../errors";
import {
  ClientOptions,
  RetryableRequestConfig,
  TransportSettings,
  isRetryable,
  resolveOptions,
  retryDelay,
  sleep,
  timeoutFor,
  toAlfredError,
} from "./http";
import { AuthConfiguration, AuthMethod } from "../config/types";

// eslint-disable-next-line
const moduleInfo = require("../../package.json");

export * from "../errors";
export type { ClientOptions } from "./http";

interface TokenResponse {
  accessToken?: string;
  tokenType: string;
  expiresIn: number;
  userName: string;
}

export class AlfredClient {
  _http: AxiosInstance;
  private auth: AuthConfiguration;
  private authMethod!: AuthMethod;
  private accessToken?: string;
  private configuration: ClientConfiguration;
  /** Waits between retries; replaceable in tests. */
  _sleep: (ms: number) => Promise<void> = sleep;
  private transport: TransportSettings;
  private tokenRequest?: Promise<string>;

  // Domains
  private _accounts?: Accounts;
  private _sessions?: Sessions;
  private _dataPoints?: DataPoints;
  private _jobs?: Jobs;
  private _files?: Files;

  /**
   * @param configuration - Environment configuration.
   * @param auth - Credentials: API key, OAuth or HMAC.
   * @param options - Optional timeout and retry settings.
   * @throws {ConfigurationError} When no usable credentials are given or an option is invalid.
   */
  constructor(
    configuration: ClientConfiguration,
    auth: AuthConfiguration,
    options?: ClientOptions
  ) {
    this.auth = auth;
    this.configuration = configuration;
    this.transport = resolveOptions(options);

    // Create default axios instance
    this._http = axios.create({
      baseURL: this.configuration.baseURL,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": `alfred-node/${moduleInfo.version}`,
      },
    });

    // Apply the default timeout to requests that do not set their own
    this._http.interceptors.request.use((config) => {
      config.timeout = timeoutFor(config, this.transport);
      return config;
    });

    // Setup response interceptor
    this._http.interceptors.response.use(
      (response) => {
        if (
          response.config.responseType === "arraybuffer" ||
          response.config.responseType === "stream" ||
          response.config.responseType === "blob"
        ) {
          return response;
        }

        response.data = toCamelCase(response.data);
        return response;
      },
      (err) => this.handleResponseError(err)
    );

    // Check API key authorization
    this.authWithApiKey(this.auth.apiKey);

    // Check OAuth authorization
    if (!this.authMethod && this.auth.oauth)
      this.authWithOAuth(this.auth.oauth.username, this.auth.oauth.password);

    // Check HMAC authorization
    if (!this.authMethod && this.auth.hmac)
      this.authWithHmac(this.auth.hmac.apiKey, this.auth.hmac.secretKey);

    if (!this.authMethod)
      throw new ConfigurationError(
        "You must provide at least one valid authorization property."
      );
  }

  /**
   * Set the X-TagshelfAPI-Key header using the provided API key or a
   * default value from the environment variable.
   * @param {string} [apiKey] - TA string that represents an API key used for
   * authentication. If no value is provided, the function will attempt to retrieve the API key from
   * the environment variable
   * @returns A boolean indicating whether it was able to set up the authorization.

   */
  private authWithApiKey(apiKey?: string) {
    let key = apiKey;
    if (!key) key = Env.castStringValue("ALFRED_API_KEY");
    if (!key) return;

    this._http.defaults.headers.common["X-TagshelfAPI-Key"] = key;
    this.authMethod = AuthMethod.API_KEY;
  }

  /**
   * Handles authentication using OAuth by obtaining an access token and
   * setting it in the HTTP headers.
   * @param {string} username - A string that represents the username used for authentication.
   * @param {string} password - A string that represents the user's password for authentication.
   */
  private authWithOAuth(username: string, password: string) {
    this._http.interceptors.request.use(async (config) => {
      if (config.url === "/token") return config;

      // Get access token, sharing one token request between concurrent calls
      if (!this.accessToken)
        this.accessToken = await this.fetchAccessToken(username, password);

      config.headers.Authorization = `Bearer ${this.accessToken}`;
      return config;
    });

    // Set auth method
    this.authMethod = AuthMethod.OAUTH;
  }

  /**
   * Generates a HMAC-based authentication header for API requests using provided API key and secret key.
   * @param {string} apiKey - A unique identifier associated with your user.
   * @param {string} secretKey - A secret key associated with your user.
   */
  private authWithHmac(apiKey: string, secretKey: string) {
    this._http.interceptors.request.use((config) => {
      const nonce = crypto.randomUUID();
      const requestURI = encodeURIComponent(
        ((config.baseURL as string) + config.url) as string
      ).toLowerCase();
      const requestMethod = (config.method as string).toUpperCase();
      const requestTimestamp = Math.floor(new Date().getTime() / 1000);
      let requestContent = "";

      if (config.data)
        requestContent = crypto
          .createHash("md5")
          .update(JSON.stringify(config.data))
          .digest("base64");

      // Prepare request signature
      const signatureRawData =
        secretKey +
        requestMethod +
        requestURI +
        requestTimestamp +
        nonce +
        requestContent;

      const signature = Buffer.from(signatureRawData);

      const secretByteArray = Buffer.from(apiKey, "base64");

      const signatureBase64 = crypto
        .createHmac("sha256", secretByteArray)
        .update(signature)
        .digest("base64");

      const hmacKey =
        "amx " +
        secretKey +
        ":" +
        signatureBase64 +
        ":" +
        nonce +
        ":" +
        requestTimestamp;

      config.headers.Authorization = hmacKey;

      return config;
    });

    // Set auth method
    this.authMethod = AuthMethod.HMAC;
  }

  /**
   * Get access token.
   * @param {string} username - A string that represents the username used for authentication.
   * @param {string} password - A string that represents the user's password for authentication.
   */
  private async getToken(username: string, password: string) {
    try {
      const payload = { grant_type: "password", username, password };
      const params = new URLSearchParams(payload);

      const resp = await this._http.post<TokenResponse>("/token", params);
      if (!resp.data || !resp.data.accessToken)
        throw new ConfigurationError(
          "Alfred did not return an access token for the username and password."
        );
      return resp.data;
    } catch (err) {
      // Refused credentials are configuration errors; rate limits and server errors are not
      if (
        err instanceof HTTPError &&
        err.status >= 400 &&
        err.status < 500 &&
        err.status !== 429
      )
        throw new ConfigurationError(
          `Alfred refused the username and password: ${err.message}`
        );

      throw err;
    }
  }

  /**
   * Returns a new access token, reusing the token request already in flight if there is one.
   */
  private async fetchAccessToken(username: string, password: string) {
    if (!this.tokenRequest)
      this.tokenRequest = this.getToken(username, password).then(
        (token) => token.accessToken as string
      );

    const request = this.tokenRequest;
    try {
      return await request;
    } finally {
      if (this.tokenRequest === request) this.tokenRequest = undefined;
    }
  }

  /**
   * Handles a failed request: renews an expired OAuth token, retries reads that failed for a
   * temporary reason, and otherwise throws the matching AlfredError.
   */
  private async handleResponseError(err: unknown) {
    if (isAxiosError(err) && err.config) {
      const config = err.config as RetryableRequestConfig;

      // When using OAuth, retry the request using a new token to handle expirations
      if (
        !config._retry &&
        err.response?.status === 401 &&
        this.authMethod === AuthMethod.OAUTH
      ) {
        config._retry = true;
        this.accessToken = "";
        return this._http(config);
      }

      // Retry reads that failed for a temporary reason
      const attempt = config._retryCount ?? 0;
      if (attempt < this.transport.maxRetries && isRetryable(err, config)) {
        config._retryCount = attempt + 1;
        await this._sleep(retryDelay(err, attempt));
        return this._http(config);
      }
    }

    throw toAlfredError(err);
  }

  /**
   * Returns the version of the package.
   */
  version() {
    return moduleInfo.version;
  }

  get accounts(): Accounts {
    if (!this._accounts) this._accounts = new Accounts(this);
    return this._accounts;
  }

  get sessions(): Sessions {
    if (!this._sessions) this._sessions = new Sessions(this);
    return this._sessions;
  }

  get jobs(): Jobs {
    if (!this._jobs) this._jobs = new Jobs(this);
    return this._jobs;
  }
  get dataPoints(): DataPoints {
    if (!this._dataPoints) this._dataPoints = new DataPoints(this);
    return this._dataPoints;
  }

  get files(): Files {
    if (!this._files) this._files = new Files(this);
    return this._files;
  }
}
