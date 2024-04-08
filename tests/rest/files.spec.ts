import Files from "../../src/rest/files";
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
    const mockData = { id: 123, name: "testfile" };
    client._http.get = mockRequest(client, { data: mockData });

    const file = await files.get("123");

    expect(file).toEqual(mockData);
    expect(client._http.get).toHaveBeenCalledWith("api/file/detail/123");
  });

  it("should download a file", async () => {
// Create a new TextEncoder
   const mockData = "test data";
   const mockHeaders = {
      "content-disposition": "attachment; filename=testfile.txt",
        "content-type": "text/plain"
    }

    client._http.get = mockRequest(client, {
      data: mockData,
      headers : mockHeaders,
      config: {
        responseType: "arraybuffer",
      },
    });


    const result = await files.download("123");

    // evaluate the result type.
    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.originalName).toEqual("testfile.txt");
    expect(result.mimetype).toEqual("text/plain");
    expect(client._http.get).toHaveBeenCalledWith("api/file/download/123", { responseType: 'arraybuffer' });
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
    expect(client._http.post).toHaveBeenCalledWith("api/file/uploadfile", expect.anything(), expect.anything());
  });

  it("should upload a file with FileUploadPayload", async () => {
    const mockData = { fileId: "123" };
    const payload = {
      url: "https://craftypixels.com/placeholder-image/800x200/29bd00/fff&text=An+image+placeholder+is+a+dummy+image+designed+",
    };
    client._http.post = mockRequest(client, { data: mockData });

    const result = await files.upload(payload);

    expect(result).toEqual(mockData);
    expect(client._http.post).toHaveBeenCalledWith("api/file/upload", payload);
  });
});
