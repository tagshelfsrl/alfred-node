import axios, { AxiosInstance } from "axios";
import { Env } from "../utils/env";
import { ConfigurationError } from "../errors";
import { ClientConfiguration } from "../config";
import { toSnakeCase } from "../utils/convert-case";

const moduleInfo = require("../../package.json");

export class AlfredClient {
  private apiKey: string;
  private http: AxiosInstance;
  private configuration: ClientConfiguration;

  constructor(configuration: ClientConfiguration, apiKey?: string) {
    if (apiKey) this.apiKey = apiKey;
    else this.apiKey = Env.castStringValue("ALFRED_API_KEY");

    if (!apiKey)
      throw new ConfigurationError("Cannot initialize client without API key.");

    this.configuration = configuration;

    this.http = axios.create({
      baseURL: this.configuration.baseURL,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    // Optionally, set a response interceptor to automatically convert responses to
    this.http.interceptors.response.use((response) => {
      response.data = toSnakeCase(response.data);
      return response;
    });
  }

  /**
   * Returns the version of the package.
   */
  version() {
    return moduleInfo.version;
  }
}
