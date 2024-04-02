import { AlfredClient, Configuration } from "../../src";

const moduleInfo = require("../../package.json");

describe("Alfred Client", () => {
  it("should provide package version", () => {
    const client = new AlfredClient(
      Configuration.default("staging"),
      "AXXXXXXXXXX"
    );

    expect(client.version()).toBe(moduleInfo.version);
  });
});
