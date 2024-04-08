import Jobs from "../../src/rest/jobs";
import { mockRequest } from "../mock-utils";
import { AlfredClient, Configuration } from "../../src";

const config = Configuration.v1("staging");
const auth = { apiKey: "AXXXXXXXX" };

describe("rest: jobs", () => {
  it("should get job by id", async () => {
    const client = new AlfredClient(config, auth);

    const mockResponse = {
      data: {
        id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        creationDate: "2021-07-19T16:06:45.000Z",
        hasJobRequestInfo: true,
        jobRequestDate: "2021-07-19T16:06:45.000Z",
        updateDate: "2021-07-19T16:06:45.000Z",
        companyId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        bulkId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        deferredSessionId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        userName: "userName",
        channel: "channel",
        source: "source",
        container: "container",
        remoteFileName: "remoteFileName",
        remoteFileNames: "remoteFileNames",
        merge: true,
        decompose: true,
        propagateMetadata: true,
        parentFilePrefix: "parentFilePrefix",
        decomposedPageRotation: 0,
        fileCount: 0,
        fileSourcesCount: 0,
        metadataObjectsCount: 0,
        finishedFiles: 0,
        files: [
          {
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            creationDate: "2021-07-19T16:06:45.000Z",
            updateDate: "2021-07-19T16:06:45.000Z",
            fileName: "fileName",
            tagName: "tagName",
            isParent: true,
            isChildren: true,
            status: "status",
          },
        ],
        retries: 0,
        exceededRetries: true,
        fileUrls: ["fileUrls"],
        errorMessages: ["errorMessages"],
        stage: "stage",
        startDate: "2021-07-19T16:06:45.000Z",
        emailFrom: "emailFrom",
        emailSubject: "emailSubject",
        emailBody: "emailBody",
      },
    };

    client._http.get = mockRequest(client, mockResponse);

    const jobs = new Jobs(client);
    const resp = await jobs.get("3fa85f64-5717-4562-b3fc-2c963f66afa6");

    expect(resp).toEqual(mockResponse.data);
    expect(client._http.get).toHaveBeenCalledWith(
      "api/job/detail/3fa85f64-5717-4562-b3fc-2c963f66afa6"
    );
  });

  it("should create job", async () => {
    const client = new AlfredClient(config, auth);

    const mockResponse = {
      data: { jobId: "56d3dfc5-79f3-44f9-8a45-d3b6d9b73937" },
    };

    client._http.post = mockRequest(client, mockResponse);

    const jobs = new Jobs(client);
    const resp = await jobs.create({
      sessionId: "56d3dfc5-79f3-44f9-8a45-d3b6d9b73937",
    });

    expect(resp).toEqual(mockResponse.data);
    expect(client._http.post).toHaveBeenCalledWith("api/job/create", {
      session_id: "56d3dfc5-79f3-44f9-8a45-d3b6d9b73937",
    });
  });
});
