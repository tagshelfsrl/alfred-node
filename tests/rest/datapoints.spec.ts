import DataPoints from "../../src/rest/datapoints";
import { mockRequest } from "../mock-utils";
import { AlfredClient, Configuration } from "../../src";

const config = Configuration.v1("staging");
const auth = { apiKey: "AXXXXXXXX" };

describe("rest: datapoints", () => {
  it("should get datapoint values by file id", async () => {
    const client = new AlfredClient(config, auth);

    const mockResponse = {
      data: [
        {
          id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          fileLogId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          metadataId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          metadataName: "metadataName_1",
          value: "value_1",
          classificationScore: 0.9,
        },
        {
          id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          fileLogId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          metadataId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          metadataName: "metadataName_2",
          value: "value_2",
          classificationScore: 0.8,
        },
      ],
    };

    client._http.get = mockRequest(client, mockResponse);

    const dataPoints = new DataPoints(client);
    const resp = await dataPoints.getValues(
      "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    );

    expect(resp).toEqual(mockResponse.data);
    expect(client._http.get).toHaveBeenCalledWith(
      "api/values/file/3fa85f64-5717-4562-b3fc-2c963f66afa6"
    );
  });
});
