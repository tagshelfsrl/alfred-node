export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class HTTPError extends Error {
  status: number;
  data: any;
  url: string;

  constructor(message: string, status: number, data: any, url: string) {
    super(message);
    this.status = status;
    this.data = data;
    this.url = url;
  }
}
