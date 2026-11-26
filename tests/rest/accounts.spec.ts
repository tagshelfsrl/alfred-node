import Account from "../../src/rest/accounts";
import { mockRequest } from "../mock-utils";
import { AlfredClient, Configuration } from "../../src";

const config = Configuration.v1("staging");
const apiKey = "AXXXXXXXX";
const auth = { apiKey };

const mockAccount = {
  request_origin_ip_address: "203.0.113.7:59385",
  authentication_type: "ApiKey",
  roles: ["Account Admin", "Application"],
  app_id: "22a7a11b-0000-0000-0000-000000000000",
  app_name: "My integration",
  status: "active",
  company_id: "fb9268c7-0000-0000-0000-000000000000",
  company_name: "ACME",
  user_id: "00000000-0000-0000-0000-000000000000",
  user_name: "",
  name: "",
  last_name: "",
};

describe("rest: account", () => {
  it("should return the account fields at the top level", async () => {
    const client = new AlfredClient(config, auth);

    client._http.get = mockRequest(client, { data: mockAccount });

    const account = new Account(client);
    const result = await account.whoAmI();

    expect(result.companyId).toBe("fb9268c7-0000-0000-0000-000000000000");
    expect(result.companyName).toBe("ACME");
    expect(result.appName).toBe("My integration");
    expect(result.authenticationType).toBe("ApiKey");
    expect(result.roles).toEqual(["Account Admin", "Application"]);
    expect(client._http.get).toHaveBeenCalledWith("/api/tagshelf/who-am-i");
  });

  it("keeps the deprecated .data accessor working", async () => {
    const client = new AlfredClient(config, auth);

    client._http.get = mockRequest(client, { data: mockAccount });

    const account = new Account(client);
    const result = await account.whoAmI();

    expect(result.data.companyId).toBe("fb9268c7-0000-0000-0000-000000000000");
    expect(result.data).toBe(result);
  });

  it("does not expose .data, status, headers or config as enumerable keys", async () => {
    const client = new AlfredClient(config, auth);

    client._http.get = mockRequest(client, { data: mockAccount });

    const account = new Account(client);
    const result = await account.whoAmI();
    const keys = Object.keys(result);

    expect(keys).not.toContain("data");
    expect(keys).not.toContain("headers");
    expect(keys).not.toContain("config");
    expect(keys).toContain("status");
    expect(keys).not.toContain("request");
  });

  it("serializes without the API key or the deprecated data property", async () => {
    const client = new AlfredClient(config, auth);

    client._http.get = mockRequest(client, { data: mockAccount });

    const account = new Account(client);
    const result = await account.whoAmI();

    let json = "";
    expect(() => {
      json = JSON.stringify(result);
    }).not.toThrow();
    expect(json).not.toContain(apiKey);
    expect(json).not.toContain('"data"');
  });
});
