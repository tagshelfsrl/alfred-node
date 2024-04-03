import { toCamelCase, toSnakeCase } from "../../src/utils/convert-case";

describe("utils: convert-case", () => {
  it("should convert object keys to camel case", () => {
    const snakeObj = {
      app_id: "00000000-0000-0000-0000-000000000000",
      app_name: "TAGSHELF",
      address: {
        street_no: 12,
      },
    };

    const camelObj = toCamelCase(snakeObj);

    expect(camelObj.appId).toBe(snakeObj.app_id);
    expect(camelObj.appName).toBe(snakeObj.app_name);
    expect(camelObj.address.streetNo).toBe(snakeObj.address.street_no);
  });

  it("should convert object keys to snake case", () => {
    const camelObj = {
      appId: "00000000-0000-0000-0000-000000000000",
      appName: "TAGSHELF",
      address: {
        streetNo: 12,
      },
    };

    const snakeObj = toSnakeCase(camelObj);

    expect(snakeObj.app_id).toBe(camelObj.appId);
    expect(snakeObj.app_name).toBe(camelObj.appName);
    expect(snakeObj.address.street_no).toBe(camelObj.address.streetNo);
  });
});
