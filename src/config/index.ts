import { Environment } from "./types";

export interface ClientConfiguration {
  baseURL: string;
  socketURL: string;
  version: number;
  environment: Environment;
}

export interface ClientConfigurationOverrides {
  baseURL?: string;
  socketURL?: string;
}

export class Configuration {
  static default(env: Environment): ClientConfiguration {
    return this.v1(env);
  }

  static v1(
    env: Environment,
    overrides?: ClientConfigurationOverrides
  ): ClientConfiguration {
    if (env === "staging") {
      return {
        baseURL: overrides?.baseURL
          ? overrides.baseURL
          : "https://staging.tagshelf.com",
        socketURL: overrides?.socketURL ? overrides.socketURL : "",
        version: 1,
        environment: "staging",
      };
    }

    return {
      baseURL: overrides?.baseURL
        ? overrides.baseURL
        : "https://app.tagshelf.com",
      socketURL: overrides?.socketURL ? overrides.socketURL : "",
      version: 1,
      environment: "production",
    };
  }
}
