// src/alfred-client.ts
import axios, { AxiosInstance } from "axios";
import { ALFRED_BASE_URL } from "./constants";
import { EnvironmentType } from "./types";
import { toSnakeCase } from "./utils/convert-case";

export class AlfredClient {
  private apiKey: string;
  private http: AxiosInstance;
  public environment: EnvironmentType;

  constructor(apiKey: string, environment: EnvironmentType = "production") {
    this.apiKey = apiKey;
    this.environment = environment;

    this.http = axios.create({
      baseURL: ALFRED_BASE_URL[environment],
      headers: {
        "Content-Type": "application/json",
        "X-TagshelfAPI-Key": this.apiKey,
      },
    });

    // Optionally, set a response interceptor to automatically convert responses to
    this.http.interceptors.response.use((response) => {
      response.data = toSnakeCase(response.data);
      return response;
    });
  }

  static getFromEnvironmentVariables(): AlfredClient {
    const apiKey = process.env.ALFRED_API_KEY;
    const environment =
      (process.env.ALFRED_ENVIRONMENT as EnvironmentType) || "production";
    if (!apiKey) {
      throw new Error("API key not found in environment variables");
    }
    return new AlfredClient(apiKey, environment);
  }

  async createDeferredSession(): Promise<string> {
    try {
      const response = await this.http.post("/deferred/create");
      return response.data.session_id;
    } catch (error: any) {
      // Handle errors
      throw new Error(`Failed to create deferred session: ${error.message}`);
    }
  }

  async getDeferredSession(id: string): Promise<any> {
    try {
      const response = await this.http.get(`/deferred/detail/${id}`);
      return response.data;
    } catch (error: any) {
      // Handle errors
      throw new Error(`Failed to fetch deferred session: ${error.message}`);
    }
  }
}
