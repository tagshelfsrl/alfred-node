import axios, { AxiosInstance, isAxiosError } from "axios";
import { Env } from "../utils/env";
import { ConfigurationError } from "../errors";
import { ClientConfiguration } from "../config";
import { AuthConfiguration, AuthMethod } from "../config/types";
import { toCamelCase } from "../utils/convert-case";

const moduleInfo = require("../../package.json");

interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userName: string;
}

export class AlfredClient {
  private http: AxiosInstance;
  private authMethod!: AuthMethod;
  private auth: AuthConfiguration;
  private configuration: ClientConfiguration;

  constructor(configuration: ClientConfiguration, auth: AuthConfiguration) {
    // if (auth.apiKey) this.apiKey = auth.apiKey;
    // else this.apiKey = Env.castStringValue("ALFRED_API_KEY");

    // if (!apiKey)
    //   throw new ConfigurationError("Cannot initialize client without API key.");
    this.auth = auth;
    this.configuration = configuration;

    this.http = axios.create({
      baseURL: this.configuration.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Optionally, set a response interceptor to automatically convert responses to
    this.http.interceptors.response.use(
      (response) => {
        response.data = toCamelCase(response.data);
        return response;
      },
      (err) => {
        if (isAxiosError(err)) {
          err.status;
        }
      }
    );
  }

  /**
   * Set the X-TagshelfAPI-Key header using the provided API key or a
   * default value from the environment variable.
   * @param {string} [apiKey] - TA string that represents an API key used for
   * authentication. If no value is provided, the function will attempt to retrieve the API key from
   * the environment variable
   * @returns A boolean indicating whether or not it was able to setup the authorization.
   */
  private authWithApiKey(apiKey?: string) {
    let key = apiKey;
    if (!key) key = Env.castStringValue("ALFRED_API_KEY");
    if (!key) return;

    this.http.defaults.headers.common["X-TagshelfAPI-Key"] = key;
    this.authMethod = AuthMethod.API_KEY;
  }

  private async authWithOAuth(username: string, password: string) {
    try {
      // Get access token
      const tokenResp = await this.getToken(username, password);

      // Set access token
      this.http.defaults.headers.common["Authorization"] =
        `Bearer ${tokenResp.accessToken}`;

      // Set auth method
      this.authMethod = AuthMethod.OAUTH;
    } catch (err) {
      if (isAxiosError(err) && err.status === 400)
        throw new ConfigurationError("Invalid credentials for OAuth provided.");
    }
  }

  private async getToken(username: string, password: string) {
    const payload = { grant_type: "password", username, password };
    const resp = await this.http.post<TokenResponse>("/token", payload);
    return resp.data;
  }

  async init() {
    // Check API key authorization
    this.authWithApiKey(this.auth.apiKey);

    // Check OAuth authorization
    if (!this.authMethod && this.auth.oauth)
      await this.authWithOAuth(
        this.auth.oauth.username,
        this.auth.oauth.password
      );

    // Check HMAC authorization
    if (!this.authMethod && this.auth.hmac) {
    }
  }

  /**
   * Returns the version of the package.
   */
  version() {
    return moduleInfo.version;
  }
}
