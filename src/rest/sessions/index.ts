import { AlfredClient } from "..";
import { CreateSessionResult, GetSessionResult } from "../../interfaces";

class Sessions {
  constructor(private client: AlfredClient) {}

  /**
   * Creates a new session for uploding files.
   */
  async createDeferredSession() {
    const resp = await this.client._http.post<CreateSessionResult>(
      "/api/deferred/create"
    );
    return resp.data;
  }

  /**
   * Returns a session by ID.
   */
  async getDeferredSession(sessionId: string) {
    const resp = await this.client._http.get<GetSessionResult>(
      `/api/deferred/${sessionId}`
    );
    return resp.data;
  }
}

export = Sessions;
