import crypto from "crypto";
import axios, { AxiosInstance, AxiosRequestConfig, isAxiosError } from "axios";

import { Jobs } from "./jobs";
import { Files } from "./files";
import { Accounts } from "./accounts";
import { Sessions } from "./sessions";
import { DataPoints } from "./datapoints";
import { Classifications } from "./classifications";
import { Env } from "../utils/env";
import { ClientConfiguration } from "../config";
import { toCamelCase } from "../utils/convert-case";
import { ConfigurationError, HTTPError } from "../errors";
import { AuthConfiguration, AuthMethod } from "../config/types";
import { buildHmacHeader, finalizeBody } from "./hmac";

// eslint-disable-next-line
const moduleInfo = require("../../package.json");

interface TokenResponse {
  accessToken: string;
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

  // Domains
  private _accounts?: Accounts;
  private _sessions?: Sessions;
  private _dataPoints?: DataPoints;
  private _jobs?: Jobs;
  private _files?: Files;
  private _classifications?: Classifications;

  constructor(configuration: ClientConfiguration, auth: AuthConfiguration) {
    this.auth = auth;
    this.configuration = configuration;

    // Create default axios instance
    this._http = axios.create({
      baseURL: this.configuration.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
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
      (err) => {
        if (isAxiosError(err) && err.response) {
          // Store original request
          const originalReq = err.config as AxiosRequestConfig & {
            _retry?: boolean;
          };

          // When using OAuth, retry the request using a new token to handle expirations
          if (
            !originalReq._retry &&
            err.response.status === 401 &&
            this.authMethod === AuthMethod.OAUTH
          ) {
            // Mark request as retried
            originalReq._retry = true;

            // Clean expired access token
            this.accessToken = "";

            // Retry the request
            return this._http(originalReq);
          }

          // Otherwise, raise an HTTP error
          throw new HTTPError(
            err.message,
            err.response.status,
            err.response.data,
            err.config?.url as string
          );
        }
        throw err;
      }
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
      if (!this.accessToken && config.url !== "/token") {
        // Get access token
        const tokenResp = await this.getToken(username, password);
        this.accessToken = tokenResp.accessToken;
      }

      config.headers.Authorization = `Bearer ${this.accessToken}`;
      return config;
    });

    // Set auth method
    this.authMethod = AuthMethod.OAUTH;
  }

  /**
   * Signs every request the way the API verifies it. The `Authorization`
   * header is `amx <secretKey>:<signature>:<nonce>:<timestamp>`.
   * @param {string} apiKey - The signing key (base64). It is used to compute the
   * signature and is never sent.
   * @param {string} secretKey - Identifies your account to the API. It travels
   * in the `Authorization` header.
   */
  private authWithHmac(apiKey: string, secretKey: string) {
    this._http.interceptors.request.use((config) => {
      // The URL exactly as axios will request it (base URL, path and query)
      const url = new URL(this._http.getUri(config)).href;
      // The bytes exactly as they will be sent
      const body = finalizeBody(config);

      config.headers.Authorization = buildHmacHeader(
        apiKey,
        secretKey,
        config.method as string,
        url,
        body,
        crypto.randomUUID(),
        Math.floor(Date.now() / 1000)
      );

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
      return resp.data;
    } catch (err) {
      // Raise credential errors configuration errors
      if (err instanceof HTTPError && err.status === 400)
        throw new ConfigurationError(
          "Provided auth configuration is not valid."
        );

      throw err;
    }
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

  get classifications(): Classifications {
    if (!this._classifications)
      this._classifications = new Classifications(this);
    return this._classifications;
  }
}
