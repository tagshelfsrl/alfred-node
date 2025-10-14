import { AlfredClient } from "..";
import { CreateSessionResult, GetSessionResult } from "../../interfaces";

export class Sessions {
  constructor(private client: AlfredClient) {}

  /**
   * Creates a new session for uploding files.
   */
  async create(): Promise<CreateSessionResult> {
    const resp = await this.client._http.post<CreateSessionResult>(
      "/api/deferred/create"
    );
    return resp.data;
  }

  /**
   * Returns a session by ID.
   */
  async get(sessionId: string): Promise<GetSessionResult> {
    const resp = await this.client._http.get<GetSessionResult>(
      `/api/deferred/detail/${sessionId}`
    );
    return resp.data;
  }
}

export default Sessions;
