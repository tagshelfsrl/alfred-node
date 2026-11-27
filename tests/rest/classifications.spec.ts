import FormData from "form-data";
import Classifications from "../../src/rest/classifications";
import { mockRequest } from "../mock-utils";
import { AlfredClient, Configuration } from "../../src";

const config = Configuration.v1("staging");
const auth = { apiKey: "AXXXXXXXX" };

const tags = [
  {
    name: "Invoice",
    description: "A bill for goods or services",
    threshold: 0.5,
  },
  { name: "Receipt", description: "Proof of a completed payment" },
];

const queued = {
  id: "c1",
  file_id: "f1",
  status: "queued",
  created_at: "2026-11-26T16:34:41.94Z",
  correlation_id: "",
  text_truncated: false,
};

describe("rest: classifications", () => {
  let client: AlfredClient;
  let classifications: Classifications;

  beforeEach(() => {
    client = new AlfredClient(config, auth);
    classifications = new Classifications(client);
  });

  it("should create a text classification with snake_case keys", async () => {
    client._http.post = mockRequest(client, { data: queued });

    const result = await classifications.create({
      tags,
      text: "Invoice 123",
      fileName: "a.txt",
      correlationId: "corr",
    });

    expect(client._http.post).toHaveBeenCalledWith("api/classify", {
      tags,
      text: "Invoice 123",
      file_name: "a.txt",
      correlation_id: "corr",
    });
    expect(result).toEqual({
      id: "c1",
      fileId: "f1",
      status: "queued",
      createdAt: "2026-11-26T16:34:41.94Z",
      correlationId: "",
      textTruncated: false,
    });
  });

  it("should not send undefined optional keys", async () => {
    client._http.post = mockRequest(client, { data: queued });

    await classifications.create({ tags, text: "hello" });

    const body = (client._http.post as jest.Mock).mock.calls[0][1];
    expect(Object.keys(body).sort()).toEqual(["tags", "text"]);
  });

  it("should create a file classification as multipart", async () => {
    client._http.post = mockRequest(client, { data: queued });

    await classifications.createFromFile({
      file: {
        buffer: Buffer.from("file-bytes"),
        originalName: "doc.pdf",
        mimetype: "application/pdf",
      },
      tags,
      correlationId: "corr-1",
    });

    const [url, form, opts] = (client._http.post as jest.Mock).mock.calls[0];
    expect(url).toBe("api/classify");
    expect(form).toBeInstanceOf(FormData);
    const raw = (form as FormData).getBuffer().toString();
    expect(raw).toContain('name="file"; filename="doc.pdf"');
    expect(raw).toContain("file-bytes");
    expect(raw).toContain('name="tags"');
    expect(raw).toContain(JSON.stringify(tags));
    expect(raw).toContain('name="correlation_id"');
    expect(raw).toContain("corr-1");
    expect(opts.headers["content-type"]).toContain("multipart/form-data");
  });

  it("should omit correlation_id from the file request when not set", async () => {
    client._http.post = mockRequest(client, { data: queued });

    await classifications.createFromFile({
      file: { buffer: Buffer.from("x"), originalName: "a.txt" },
      tags,
    });

    const form = (client._http.post as jest.Mock).mock.calls[0][1] as FormData;
    expect(form.getBuffer().toString()).not.toContain("correlation_id");
  });

  it("should throw without a request when buffer or name is missing", async () => {
    client._http.post = mockRequest(client, { data: queued });

    await expect(
      classifications.createFromFile({
        file: { originalName: "a.pdf" } as any,
        tags,
      })
    ).rejects.toThrow();
    await expect(
      classifications.createFromFile({
        file: { buffer: Buffer.from("x"), originalName: "" },
        tags,
      })
    ).rejects.toThrow();
    expect(client._http.post).not.toHaveBeenCalled();
  });

  it("should get a completed classification", async () => {
    client._http.get = mockRequest(client, {
      data: {
        ...queued,
        status: "completed",
        completed_at: "2026-11-26T16:34:45Z",
        result: {
          class: "",
          score: 0.2,
          below_threshold: true,
          predictions: [{ class: "Invoice", score: 0.2 }],
          model: "m",
          reason: "no_match",
        },
      },
    });

    const result = await classifications.get("a b/1");

    expect(client._http.get).toHaveBeenCalledWith("api/classify/a%20b%2F1");
    expect(result.status).toBe("completed");
    expect(result.result?.class).toBe("");
    expect(result.result?.belowThreshold).toBe(true);
    expect(result.result?.predictions).toEqual([
      { class: "Invoice", score: 0.2 },
    ]);
    expect(result.result?.reason).toBe("no_match");
  });

  it("should throw on a blank id", async () => {
    client._http.get = mockRequest(client, { data: {} });

    await expect(classifications.get("  ")).rejects.toThrow(
      "classificationId is required."
    );
    expect(client._http.get).not.toHaveBeenCalled();
  });

  it("should return the same instance on repeated access", () => {
    expect(client.classifications).toBe(client.classifications);
    expect(client.classifications).toBeInstanceOf(Classifications);
  });
});
