import { AlfredClient } from "../../src/rest";
import { Configuration } from "../../src/config";

describe("rest: files.uploadFile with metadata", () => {
  it("sends multipart form data including a metadata part", async () => {
    const client = new AlfredClient(Configuration.default("staging"), {
      apiKey: "key",
    });
    const calls: any[] = [];
    client._http.defaults.adapter = async (config) => {
      calls.push(config);
      return {
        data: { file_id: "f1" },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };

    const resp = await client.files.uploadFile({
      sessionId: "s1",
      file: {
        buffer: Buffer.from("hello"),
        originalName: "a.txt",
        mimetype: "text/plain",
      },
      metadata: { foo: "bar" },
    } as any);

    expect(resp).toEqual({ fileId: "f1" });
    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe("post");
    expect(String(calls[0].headers["Content-Type"])).toContain(
      "multipart/form-data"
    );
    const body = calls[0].data.getBuffer().toString();
    expect(body).toContain('name="session_id"');
    expect(body).toContain('name="metadata"');
    expect(body).toContain(JSON.stringify({ foo: "bar" }));
    expect(body).toContain('filename="a.txt"');
  });
});
