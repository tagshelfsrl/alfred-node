import DataPoints from "../../src/rest/datapoints";
import { mockRequest } from "../mock-utils";
import { AlfredClient, Configuration } from "../../src";
import {
  DataPointValidation,
  DataPointValidationResult,
} from "../../src/interfaces/datapoint";

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

  const fileId = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

  it("should camelize a PascalCase stored validation and leave capitalised keys odd", async () => {
    const client = new AlfredClient(config, auth);
    const mockResponse = {
      data: [
        {
          id: "1",
          file_log_id: "2",
          metadata_id: "3",
          metadata_name: "InvoiceNumber",
          field_key: "invoice_number",
          value: "INV-1042",
          extracted_value: "inv 1042",
          normalized_value: "INV-1042",
          classification_score: 1,
          validation: {
            Status: "failed",
            ExecutedAt: "2026-11-26T16:34:41.94Z",
            DurationMs: 12,
            Results: [
              {
                ValidatorId: "v1",
                Type: "regex",
                Passed: false,
                Skipped: false,
                Severity: 2,
                BlocksCompletion: true,
                Message: "bad format",
                Metadata: { URL: "x", MyKey: 1, snake_key: 2 },
                DurationMs: 3,
                ScriptName: "s",
                Runtime: "js",
              },
            ],
            Summary: {
              Total: 1,
              Passed: 0,
              Failed: 1,
              Skipped: 0,
              HighestSeverityFailed: "error",
              HasBlockingFailures: true,
            },
            Reason: "r",
            MustPassValidation: true,
          },
        },
      ],
    };
    client._http.get = mockRequest(client, mockResponse);
    const [row] = await new DataPoints(client).getValues(fileId);

    expect(row.fieldKey).toBe("invoice_number");
    expect(row.extractedValue).toBe("inv 1042");
    expect(row.normalizedValue).toBe("INV-1042");
    const v = row.validation as DataPointValidation;
    expect(Object.keys(v).sort()).toEqual(
      [
        "durationMs",
        "executedAt",
        "mustPassValidation",
        "reason",
        "results",
        "status",
        "summary",
      ].sort()
    );
    expect(Object.keys(v.results[0]).sort()).toEqual(
      [
        "blocksCompletion",
        "durationMs",
        "message",
        "metadata",
        "passed",
        "runtime",
        "scriptName",
        "severity",
        "skipped",
        "type",
        "validatorId",
      ].sort()
    );
    expect(Object.keys(v.summary as object).sort()).toEqual(
      [
        "failed",
        "hasBlockingFailures",
        "highestSeverityFailed",
        "passed",
        "skipped",
        "total",
      ].sort()
    );
    // humps lowercases only the first letter: all-caps keys become "uRL".
    expect(v.results[0].metadata).toEqual({ uRL: "x", myKey: 1, snakeKey: 2 });
  });

  it("should camelize the older snake_case array form", async () => {
    const client = new AlfredClient(config, auth);
    const mockResponse = {
      data: [
        {
          id: "1",
          value: "v",
          field_key: "k",
          validation: [
            {
              validator_id: "v1",
              type: "regex",
              passed: true,
              skipped: false,
              severity: 0,
              blocks_completion: false,
              message: "ok",
              metadata: {},
            },
          ],
        },
      ],
    };
    client._http.get = mockRequest(client, mockResponse);
    const [row] = await new DataPoints(client).getValues(fileId);
    const items = row.validation as DataPointValidationResult[];
    expect(Array.isArray(items)).toBe(true);
    expect(items[0]).toEqual({
      validatorId: "v1",
      type: "regex",
      passed: true,
      skipped: false,
      severity: 0,
      blocksCompletion: false,
      message: "ok",
      metadata: {},
    });
  });

  it("should return a not-found row with empty value and score 0", async () => {
    const client = new AlfredClient(config, auth);
    const mockResponse = {
      data: [
        {
          id: "1",
          file_log_id: "2",
          metadata_id: "3",
          metadata_name: "InvoiceNumber",
          field_key: "invoice_number",
          value: "",
          classification_score: 0,
          normalized_value: "",
        },
      ],
    };
    client._http.get = mockRequest(client, mockResponse);
    const [row] = await new DataPoints(client).getValues(fileId);
    expect(row.value).toBe("");
    expect(row.classificationScore).toBe(0);
    expect(row.normalizedValue).toBe("");
    expect(row.extractedValue).toBeUndefined();
    expect(row.validation).toBeUndefined();
  });
});
