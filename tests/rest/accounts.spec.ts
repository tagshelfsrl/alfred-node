import Account from "../../src/rest/accounts";
import { mockRequest } from "../mock-utils";
import { AlfredClient, Configuration } from "../../src";

const config = Configuration.v1("staging");
const auth = { apiKey: "AXXXXXXXX" };

describe("rest: account", () => {
  it("should provide account information", async () => {
    const client = new AlfredClient(config, auth);

    client._http.get = mockRequest(client, {
      data: { id: 123, app_name: "TAGSHELF" },
    });

    const account = new Account(client);
    const resp = await account.whoAmI();

    expect(resp.data.id).toBe(123);
    expect(resp.data.appName).toBe("TAGSHELF");
    expect(client._http.get).toHaveBeenCalledWith("/api/tagshelf/who-am-i");
  });
});
