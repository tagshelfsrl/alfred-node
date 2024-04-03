import { AlfredClient, Configuration } from "../../src";
import { AuthMethod } from "../../src/config/types";
import { ConfigurationError } from "../../src/errors";

const moduleInfo = require("../../package.json");

describe("rest: alfred-client", () => {
  it("should provide package version", () => {
    const client = new AlfredClient(Configuration.default("staging"), {
      apiKey: "AXXXXXXX",
    });
    expect(client.version()).toBe(moduleInfo.version);
  });
});
