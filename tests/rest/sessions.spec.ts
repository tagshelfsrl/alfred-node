import Sessions from "../../src/rest/sessions";
import { mockRequest } from "../mock-utils";
import { AlfredClient, Configuration } from "../../src";

const config = Configuration.v1("staging");
const auth = { apiKey: "AXXXXXXXX" };

describe("rest: sessions", () => {
  it("should create a deferred session", async () => {
    const client = new AlfredClient(config, auth);

    client._http.post = mockRequest(client, {
      data: {
        sessionId: "123",
      },
    });
    console.log(client._http.post);

    const sessions = new Sessions(client);
    const resp = await sessions.createDeferredSession();

    expect(resp.sessionId).toBe("123");
    expect(client._http.post).toHaveBeenCalledWith("/api/deferred/create");
  });

  it("should get a deferred session", async () => {
    const client = new AlfredClient(config, auth);
    const sessionId = "123";

    client._http.get = mockRequest(client, {
      data: {
        id: sessionId,
        creation_date: "2021-01-01T00:00:00Z",
        update_date: "2021-01-01T00:00:00Z",
        status: "open",
        user_name: "test",
        company_id: "123",
        job_id: null,
      },
    });

    const sessions = new Sessions(client);
    const resp = await sessions.getDeferredSession(sessionId);

    expect(resp.id).toBe(sessionId);
    expect(resp.creationDate).toBe("2021-01-01T00:00:00Z");
    expect(resp.updateDate).toBe("2021-01-01T00:00:00Z");
    expect(resp.status).toBe("open");
    expect(resp.userName).toBe("test");
    expect(client._http.get).toHaveBeenCalledWith(`/api/deferred/${sessionId}`);
  });
});
