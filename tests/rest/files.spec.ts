import Files, { parseContentDispositionFilename } from "../../src/rest/files";
import { mockRequest } from "../mock-utils";
import { AlfredClient, Configuration } from "../../src";

const config = Configuration.v1("staging");
const auth = { apiKey: "AXXXXXXXX" };

describe("rest: files", () => {
  let client: AlfredClient;
  let files: Files;

  beforeEach(() => {
    client = new AlfredClient(config, auth);
    files = new Files(client);
  });

  it("should get file details", async () => {
    client._http.get = mockRequest(client, {
      data: {
        id: "123",
        file_name: "testfile",
        is_processing_unit: true,
        file_size: 103,
      },
    });

    const file = await files.get("123");

    expect(file).toEqual({
      id: "123",
      fileName: "testfile",
      isProcessingUnit: true,
      fileSize: 103,
    });
    expect(client._http.get).toHaveBeenCalledWith("api/file/detail/123");
  });

  it("should download a file", async () => {
    // Create a new TextEncoder
    const mockData = "test data";
    const mockHeaders = {
      "content-disposition": "attachment; filename=testfile.txt",
      "content-type": "text/plain",
    };

    client._http.get = mockRequest(client, {
      data: mockData,
      headers: mockHeaders,
      config: {
        responseType: "arraybuffer",
      },
    });

    const result = await files.download("123");

    // evaluate the result type.
    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.originalName).toEqual("testfile.txt");
    expect(result.mimetype).toEqual("text/plain");
    expect(client._http.get).toHaveBeenCalledWith("api/file/download/123", {
      responseType: "arraybuffer",
    });
  });

  it("should upload a file with UploadFilePayload", async () => {
    const mockData = { fileId: "123" };
    const payload = {
      sessionId: "session123",
      file: {
        buffer: Buffer.from("test data"),
        originalName: "testfile.txt",
        mimetype: "text/plain",
      },
    };
    client._http.post = mockRequest(client, { data: mockData });

    const result = await files.uploadFile(payload);

    expect(result).toEqual(mockData);
    expect(client._http.post).toHaveBeenCalledWith(
      "api/file/uploadfile",
      expect.anything(),
      expect.anything()
    );
  });

  it("uploadFile should send channel when given", async () => {
    client._http.post = mockRequest(client, { data: { file_id: "abc" } });

    const result = await files.uploadFile({
      sessionId: "s1",
      channel: "api",
      file: {
        buffer: Buffer.from("x"),
        originalName: "a.txt",
        mimetype: "text/plain",
      },
    });

    expect(result).toEqual({ fileId: "abc" });
    const form = (client._http.post as jest.Mock).mock.calls[0][1];
    expect(form.getBuffer().toString()).toContain('name="channel"');
    expect(form.getBuffer().toString()).toContain("api");
  });

  describe("upload", () => {
    const post = () => (client._http.post as jest.Mock).mock.calls[0];

    it("returns the created job", async () => {
      client._http.post = mockRequest(client, {
        data: { job_id: "j1", correlation_id: "c1", warnings: ["w"] },
      });

      const result = await files.upload({ url: "https://example.com/a.pdf" });

      expect(result).toEqual({
        jobId: "j1",
        correlationId: "c1",
        warnings: ["w"],
      });
      expect(post()[0]).toBe("api/file/upload");
      expect(post()[1]).toEqual({ url: "https://example.com/a.pdf" });
    });

    it("sends snake_case names for every mapped field", async () => {
      client._http.post = mockRequest(client, { data: { job_id: "j1" } });

      await files.upload({
        url: "u",
        urls: ["u1"],
        source: "s",
        container: "c",
        fileName: "f",
        fileNames: ["f1"],
        merge: true,
        decompose: true,
        pageRotation: 90,
        metadata: { a: 1 },
        propagateMetadata: true,
        parentFilePrefix: "p",
        channel: "api",
        correlationId: "corr",
        password: "pw",
        priority: "high",
      });

      expect(post()[1]).toEqual({
        url: "u",
        urls: ["u1"],
        source: "s",
        container: "c",
        file_name: "f",
        file_names: ["f1"],
        merge: true,
        decompose: true,
        page_rotation: 90,
        metadata: { a: 1 },
        propagate_metadata: true,
        parent_file_prefix: "p",
        channel: "api",
        correlation_id: "corr",
        password: "pw",
        priority: "high",
      });
    });

    it("maps the deprecated filename and filenames", async () => {
      client._http.post = mockRequest(client, { data: { job_id: "j1" } });

      await files.upload({ filename: "f", filenames: ["a", "b"] });

      expect(post()[1]).toEqual({ file_name: "f", file_names: ["a", "b"] });
    });

    it("lets the new spelling win over the deprecated one", async () => {
      client._http.post = mockRequest(client, { data: { job_id: "j1" } });

      await files.upload({
        filename: "old",
        fileName: "new",
        fileNames: ["n"],
        filenames: ["o"],
      });

      expect(post()[1]).toEqual({ file_name: "new", file_names: ["n"] });
    });

    it("forwards unknown keys and leaves out undefined values", async () => {
      client._http.post = mockRequest(client, { data: { job_id: "j1" } });

      await files.upload({
        url: "u",
        parent_file_prefix: "x",
        propagateMetadata: undefined,
      } as any);

      expect(post()[1]).toEqual({ url: "u", parent_file_prefix: "x" });
      expect(Object.keys(post()[1])).not.toContain("propagate_metadata");
    });

    it("leaves metadata keys untouched and does not mutate the input", async () => {
      client._http.post = mockRequest(client, { data: { job_id: "j1" } });
      const payload = {
        url: "u",
        fileName: "f",
        propagateMetadata: true,
        metadata: { invoiceId: 1, snake_key: 2 },
      };
      const copy = JSON.parse(JSON.stringify(payload));

      await files.upload(payload);

      expect(post()[1].metadata).toEqual({ invoiceId: 1, snake_key: 2 });
      expect(payload).toEqual(copy);
    });
  });

  describe("parseContentDispositionFilename", () => {
    it("reads a plain name", () => {
      expect(
        parseContentDispositionFilename("attachment; filename=report.pdf")
      ).toBe("report.pdf");
    });
    it("reads a quoted name with spaces", () => {
      expect(
        parseContentDispositionFilename('attachment; filename="my report.pdf"')
      ).toBe("my report.pdf");
    });
    it("unescapes quotes", () => {
      expect(
        parseContentDispositionFilename('attachment; filename="a\\"b.pdf"')
      ).toBe('a"b.pdf');
    });
    it("reads the RFC 5987 form", () => {
      expect(
        parseContentDispositionFilename(
          "attachment; filename*=UTF-8''r%C3%A9sum%C3%A9.pdf"
        )
      ).toBe("résumé.pdf");
    });
    it("prefers the starred form when both are present", () => {
      expect(
        parseContentDispositionFilename(
          "attachment; filename=\"resume.pdf\"; filename*=UTF-8''r%C3%A9sum%C3%A9.pdf"
        )
      ).toBe("résumé.pdf");
    });
    it("stops at a semicolon", () => {
      expect(
        parseContentDispositionFilename(
          "attachment; filename=report.pdf; size=123"
        )
      ).toBe("report.pdf");
    });
    it("returns an empty string when the header is missing", () => {
      expect(parseContentDispositionFilename(undefined)).toBe("");
      expect(parseContentDispositionFilename("attachment")).toBe("");
    });
  });

  it("download falls back when headers are missing", async () => {
    client._http.get = mockRequest(client, { data: "x", headers: {} });

    const result = await files.download("1");

    expect(result.originalName).toBe("");
    expect(result.mimetype).toBe("application/octet-stream");
  });
});
