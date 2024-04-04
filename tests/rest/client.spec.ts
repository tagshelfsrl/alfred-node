import { AlfredClient, Configuration } from "../../src";

const moduleInfo = require("../../package.json");

const config = Configuration.v1("staging");
const auth = { apiKey: "AXXXXXXXX" };

describe("rest: alfred-client", () => {
  it("should provide package version", () => {
    const client = new AlfredClient(config, auth);
    expect(client.version()).toBe(moduleInfo.version);
  });
});
