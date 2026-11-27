import Jobs from "../../src/rest/jobs";
import { mockRequest } from "../mock-utils";
import { AlfredClient, Configuration } from "../../src";

const config = Configuration.v1("staging");
const auth = { apiKey: "AXXXXXXXX" };
const JOB_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

const summaryData = () => ({
  id: JOB_ID,
  correlation_id: "",
  stage: "completed",
  channel: "api",
  priority: "normal",
  user_name: "user@example.com",
  file_sources_count: 1,
  file_count: 1,
  finished_files: 1,
  has_failed_files: false,
  failed_files_count: 0,
  has_confirmation_required_files: false,
  confirmation_required_files_count: 0,
  retries: 0,
  exceeded_retries: false,
  merge: false,
  decompose: false,
  propagate_metadata: false,
  creation_date: "2026-11-26T16:34:41.94Z",
  update_date: "2026-11-26T16:35:41.94Z",
});

const fullData = () => ({
  id: JOB_ID,
  cancellation_reason: "",
  last_canceled_by: "",
  company_id: "c1",
  user_name: "user@example.com",
  channel: "api",
  correlation_id: "order-42",
  merge: false,
  decompose: false,
  propagate_metadata: false,
  metadata: '{\r\n  "source": "x"\r\n}',
  file_count: 1,
  total_file_count: 1,
  file_sources_count: 1,
  metadata_objects_count: 1,
  finished_files: 1,
  files: [
    {
      id: "f1",
      creation_date: "2026-11-26T16:34:41.94Z",
      update_date: "2026-11-26T16:34:41.94Z",
      file_name: "a.pdf",
      content_type: "application/pdf",
      tag_name: "INVOICE",
      is_parent: false,
      is_children: false,
      group_role: "standalone",
      is_processing_unit: true,
      is_result_ready: true,
      status: "finished",
      is_reextracting: false,
    },
  ],
  retries: 0,
  stage: "completed",
  priority: "Normal",
  has_failed_files: false,
  has_broken_input_sources: false,
});

describe("rest: jobs", () => {
  const setup = () => {
    const client = new AlfredClient(config, auth);
    return { client, jobs: new Jobs(client) };
  };

  describe("get", () => {
    it("returns the summary and sends no view by default", async () => {
      const { client, jobs } = setup();
      client._http.get = mockRequest(client, { data: summaryData() });

      const resp = await jobs.get(JOB_ID);

      expect(resp.id).toBe(JOB_ID);
      expect(resp.fileSourcesCount).toBe(1);
      expect(resp.hasConfirmationRequiredFiles).toBe(false);
      expect(resp.startDate).toBeUndefined();
      expect(client._http.get).toHaveBeenCalledWith(
        `api/job/detail/${JOB_ID}`,
        { params: {} }
      );
    });

    it("sends view=full and returns the camelCased full record", async () => {
      const { client, jobs } = setup();
      client._http.get = mockRequest(client, { data: fullData() });

      const resp = await jobs.get(JOB_ID, { view: "full" });

      expect(resp.correlationId).toBe("order-42");
      expect(resp.metadata).toBe('{\r\n  "source": "x"\r\n}');
      expect(resp.files?.[0].isProcessingUnit).toBe(true);
      expect(resp.files?.[0].groupRole).toBe("standalone");
      expect(client._http.get).toHaveBeenCalledWith(
        `api/job/detail/${JOB_ID}`,
        { params: { view: "full" } }
      );
    });

    it("joins exclude given as an array", async () => {
      const { client, jobs } = setup();
      client._http.get = mockRequest(client, { data: fullData() });

      await jobs.get(JOB_ID, {
        view: "full",
        exclude: ["files", "metadata"],
      });

      expect(client._http.get).toHaveBeenCalledWith(
        `api/job/detail/${JOB_ID}`,
        { params: { view: "full", exclude: "files,metadata" } }
      );
    });

    it("trims a comma-separated exclude string and drops empty parts", async () => {
      const { client, jobs } = setup();
      client._http.get = mockRequest(client, { data: fullData() });

      await jobs.get(JOB_ID, {
        view: "full",
        exclude: " fileUrls , ,errorMessages,",
      });

      expect(client._http.get).toHaveBeenCalledWith(
        `api/job/detail/${JOB_ID}`,
        { params: { view: "full", exclude: "fileUrls,errorMessages" } }
      );
    });

    it("URL-encodes the id", async () => {
      const { client, jobs } = setup();
      client._http.get = mockRequest(client, { data: summaryData() });

      await jobs.get("a/b c?d");

      expect((client._http.get as jest.Mock).mock.calls[0][0]).toBe(
        "api/job/detail/a%2Fb%20c%3Fd"
      );
    });
  });

  describe("getAll", () => {
    it("returns the page envelope and sends both spellings of paging", async () => {
      const { client, jobs } = setup();
      client._http.get = mockRequest(client, {
        data: {
          items: [summaryData()],
          page: 2,
          page_size: 10,
          total: 11,
          has_more: false,
        },
      });

      const resp = await jobs.getAll({ page: 2, pageSize: 10 });

      expect(resp.items).toHaveLength(1);
      expect(resp.items[0].id).toBe(JOB_ID);
      expect(resp.page).toBe(2);
      expect(resp.pageSize).toBe(10);
      expect(resp.total).toBe(11);
      expect(resp.hasMore).toBe(false);
      expect(client._http.get).toHaveBeenCalledWith("api/job/all", {
        params: { page: 2, currentPage: 2, page_size: 10, pageSize: 10 },
      });
    });

    it("sends no parameters when called without options", async () => {
      const { client, jobs } = setup();
      client._http.get = mockRequest(client, {
        data: { items: [], page: 1, page_size: 10, total: 0, has_more: false },
      });

      await jobs.getAll();

      expect(client._http.get).toHaveBeenCalledWith("api/job/all", {
        params: {},
      });
    });

    it("formats a Date as its UTC calendar date and passes filters", async () => {
      const { client, jobs } = setup();
      client._http.get = mockRequest(client, {
        data: { items: [], page: 1, page_size: 10, total: 0, has_more: false },
      });

      await jobs.getAll({
        startDate: new Date("2026-11-01T23:30:00Z"),
        endDate: "2026-11-25",
        sortDirection: "ASC",
        correlationId: "Order-42",
        channel: "api",
        view: "full",
      });

      expect(client._http.get).toHaveBeenCalledWith("api/job/all", {
        params: {
          startDate: "2026-11-01",
          endDate: "2026-11-25",
          sortDirection: "ASC",
          correlation_id: "Order-42",
          channel: "api",
          view: "full",
        },
      });
    });

    it("converts the old { result, total, is_empty } shape", async () => {
      const { client, jobs } = setup();
      client._http.get = mockRequest(client, {
        data: { result: [summaryData()], total: 25, is_empty: false },
      });

      const resp = await jobs.getAll({ page: 2, pageSize: 10 });

      expect(resp).toEqual({
        items: [expect.objectContaining({ id: JOB_ID })],
        page: 2,
        pageSize: 10,
        total: 25,
        hasMore: true,
      });
    });

    it("uses defaults 1 and 10 when converting the old shape", async () => {
      const { client, jobs } = setup();
      client._http.get = mockRequest(client, {
        data: { result: [], total: 0, is_empty: true },
      });

      const resp = await jobs.getAll();

      expect(resp).toEqual({
        items: [],
        page: 1,
        pageSize: 10,
        total: 0,
        hasMore: false,
      });
    });

    it("counts the items when the old shape carries no total", async () => {
      const { client, jobs } = setup();
      client._http.get = mockRequest(client, {
        data: { result: [summaryData(), summaryData()] },
      });

      const resp = await jobs.getAll({ page: 1, pageSize: 10 });

      expect(resp.items).toHaveLength(2);
      expect(resp.total).toBe(2);
      expect(resp.hasMore).toBe(false);
    });
  });

  describe("actions", () => {
    it("cancels a job", async () => {
      const { client, jobs } = setup();
      client._http.post = mockRequest(client, { data: { canceled: true } });

      const resp = await jobs.cancel(JOB_ID);

      expect(resp).toEqual({ canceled: true });
      expect(client._http.post).toHaveBeenCalledWith(
        "api/job/cancel",
        undefined,
        { params: { jobId: JOB_ID } }
      );
    });

    it("restarts a job without redownloading by default", async () => {
      const { client, jobs } = setup();
      client._http.post = mockRequest(client, { data: { restarted: true } });

      const resp = await jobs.restart(JOB_ID);

      expect(resp).toEqual({ restarted: true });
      expect(client._http.post).toHaveBeenCalledWith(
        "api/job/restart",
        undefined,
        { params: { jobId: JOB_ID, redownloadRemoteFiles: false } }
      );
    });

    it("restarts a job redownloading remote files", async () => {
      const { client, jobs } = setup();
      client._http.post = mockRequest(client, { data: { restarted: true } });

      await jobs.restart(JOB_ID, { redownloadRemoteFiles: true });

      expect(client._http.post).toHaveBeenCalledWith(
        "api/job/restart",
        undefined,
        { params: { jobId: JOB_ID, redownloadRemoteFiles: true } }
      );
    });

    it("checks the sources of a job", async () => {
      const { client, jobs } = setup();
      client._http.post = mockRequest(client, {
        data: { available: false, unavailable_urls: ["https://x/y.pdf"] },
      });

      const resp = await jobs.checkSources(JOB_ID);

      expect(resp).toEqual({
        available: false,
        unavailableUrls: ["https://x/y.pdf"],
      });
      expect(client._http.post).toHaveBeenCalledWith(
        "api/job/check-sources",
        undefined,
        { params: { jobId: JOB_ID } }
      );
    });
  });

  describe("blank ids", () => {
    it.each(["", "   "])("throws without a request for %p", async (id) => {
      const { client, jobs } = setup();
      client._http.get = jest.fn();
      client._http.post = jest.fn();

      await expect(jobs.get(id)).rejects.toThrow("jobId is required.");
      await expect(jobs.cancel(id)).rejects.toThrow("jobId is required.");
      await expect(jobs.restart(id)).rejects.toThrow("jobId is required.");
      await expect(jobs.checkSources(id)).rejects.toThrow("jobId is required.");
      await expect(jobs.get(undefined as any)).rejects.toThrow(
        "jobId is required."
      );
      expect(client._http.get).not.toHaveBeenCalled();
      expect(client._http.post).not.toHaveBeenCalled();
    });
  });

  describe("create", () => {
    it("should create job", async () => {
      const { client, jobs } = setup();
      client._http.post = mockRequest(client, {
        data: { job_id: "56d3dfc5-79f3-44f9-8a45-d3b6d9b73937" },
      });

      const resp = await jobs.create({
        sessionId: "56d3dfc5-79f3-44f9-8a45-d3b6d9b73937",
      });

      expect(resp).toEqual({ jobId: "56d3dfc5-79f3-44f9-8a45-d3b6d9b73937" });
      expect(client._http.post).toHaveBeenCalledWith("api/job/create", {
        session_id: "56d3dfc5-79f3-44f9-8a45-d3b6d9b73937",
      });
    });

    it("sends correlation_id, password and priority and returns correlationId", async () => {
      const { client, jobs } = setup();
      client._http.post = mockRequest(client, {
        data: { job_id: "j1", correlation_id: "order-42" },
      });

      const resp = await jobs.create({
        sessionId: "s1",
        correlationId: "order-42",
        password: "secret",
        priority: "high",
      });

      expect(resp).toEqual({ jobId: "j1", correlationId: "order-42" });
      expect(client._http.post).toHaveBeenCalledWith("api/job/create", {
        session_id: "s1",
        correlation_id: "order-42",
        password: "secret",
        priority: "high",
      });
    });
  });
});
