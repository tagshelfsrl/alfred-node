export type Environment = "staging" | "production";

export interface AuthConfiguration {
  apiKey?: string;
  oauth?: {
    username: string;
    password: string;
  };
  hmac?: {
    apiKey: string;
    secretKey: string;
  };
}

export enum AuthMethod {
  API_KEY = "apikey",
  OAUTH = "oauth",
  HMAC = "hmac",
}
