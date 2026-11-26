import { ConfigurationError, HTTPError } from "../src/errors";

describe("errors", () => {
  it("HTTPError exposes its fields and is an Error", () => {
    const err = new HTTPError("boom", 404, { message: "nope" }, "api/x");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(HTTPError);
    expect(err.message).toBe("boom");
    expect(err.status).toBe(404);
    expect(err.data).toEqual({ message: "nope" });
    expect(err.url).toBe("api/x");
  });

  it("ConfigurationError is an Error with its message", () => {
    const err = new ConfigurationError("bad config");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ConfigurationError);
    expect(err.message).toBe("bad config");
  });
});
