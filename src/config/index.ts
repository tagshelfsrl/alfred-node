import { Environment } from "./types";

export interface ClientConfiguration {
  baseURL: string;
  socketURL: string;
  version: number;
  environment: Environment;
}

export class Configuration {
  static default(env: Environment): ClientConfiguration {
    return this.v1(env);
  }

  static v1(env: Environment): ClientConfiguration {
    if (env === "staging") {
      return {
        baseURL: "https://staging.tagshelf.com",
        socketURL: "",
        version: 1,
        environment: "staging",
      };
    }

    return {
      baseURL: "hthttps://app.tagshelf.com",
      socketURL: "",
      version: 1,
      environment: "production",
    };
  }
}
