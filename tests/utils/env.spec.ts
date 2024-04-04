import { Env } from "../../src/utils/env";

describe("utils: env", () => {
  it("should cast environment variable to number", () => {
    process.env.VERSION = "2";

    const version = Env.castNumericValue("VERSION");
    expect(version).toBe(2);
  });

  it("should cast environment variable to string", () => {
    process.env.APP_NAME = "super-app";

    const name = Env.castStringValue("APP_NAME");
    expect(name).toBe("super-app");
  });

  it("should cast environment variable to boolean", () => {
    process.env.FLAG1 = "true";
    process.env.FLAG2 = "1";
    process.env.FLAG3 = "false";
    process.env.FLAG4 = "0";

    const flag1 = Env.castBooleanValue("FLAG1");
    const flag2 = Env.castBooleanValue("FLAG2");
    const flag3 = Env.castBooleanValue("FLAG3");
    const flag4 = Env.castBooleanValue("FLAG4");

    expect(flag1).toBe(true);
    expect(flag2).toBe(true);
    expect(flag3).toBe(false);
    expect(flag4).toBe(false);
  });

  it("should cast environment variable to array", () => {
    process.env.MAILING_LIST = "john@example.com,jane@example.com";

    const mailingList = Env.castArrayValue("MAILING_LIST");

    expect(mailingList).toHaveLength(2);
    expect(mailingList).toContain("john@example.com");
    expect(mailingList).toContain("jane@example.com");
  });
});
