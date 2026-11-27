import { Configuration } from "../../src/config";

const PROD = {
  baseURL: "https://app.tagshelf.com",
  realTimeURL: "https://sockets.tagshelf.io",
  version: 1,
  environment: "production",
};
const STAGING = {
  baseURL: "https://staging.tagshelf.com",
  realTimeURL: "https://sockets.tagshelf.dev",
  version: 1,
  environment: "staging",
};

describe("config: Configuration", () => {
  it("default returns the v1 configuration", () => {
    expect(Configuration.default("production")).toEqual(PROD);
    expect(Configuration.default("staging")).toEqual(STAGING);
  });

  describe.each([
    ["production", PROD],
    ["staging", STAGING],
  ] as const)("v1 %s", (env, base) => {
    it("uses the documented URLs without overrides", () => {
      expect(Configuration.v1(env)).toEqual(base);
    });

    it("overrides only baseURL", () => {
      expect(Configuration.v1(env, { baseURL: "http://local" })).toEqual({
        ...base,
        baseURL: "http://local",
      });
    });

    it("overrides only realTimeURL", () => {
      expect(Configuration.v1(env, { realTimeURL: "ws://local" })).toEqual({
        ...base,
        realTimeURL: "ws://local",
      });
    });

    it("overrides both URLs", () => {
      expect(
        Configuration.v1(env, { baseURL: "http://a", realTimeURL: "ws://b" })
      ).toEqual({ ...base, baseURL: "http://a", realTimeURL: "ws://b" });
    });
  });
});
