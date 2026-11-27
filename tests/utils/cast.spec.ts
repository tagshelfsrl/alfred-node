import { castProps, DataType, parseDate } from "../../src/utils/cast";

describe("utils: cast", () => {
  it("should cast property(s) 'date' to Date", () => {
    const obj = {
      date: new Date().toISOString(),
      appointment: {
        date: new Date().toISOString(),
        endDate: new Date().toISOString(),
      },
    };

    castProps(obj, ["date"], DataType.Date);

    expect(obj.date).toBeInstanceOf(Date);
    expect(obj.appointment.date).toBeInstanceOf(Date);
    expect(typeof obj.appointment.endDate).toBe("string");
  });

  it("should failed to cast property(s) 'random'", () => {
    const spy = jest.spyOn(console, "warn");
    const obj = {
      random: Math.random(),
    };

    castProps(obj, ["random"], <DataType>"random");

    expect(typeof obj.random).toBe("number");
    expect(spy).toHaveBeenCalled();
  });

  // Assertions use toISOString(), which is always UTC, so they hold whatever
  // the machine's timezone is.
  it("reads a date without a timezone as UTC", () => {
    const obj: any = { creationDate: "2026-11-26T16:34:41.94" };

    castProps(obj, ["creationDate"], DataType.Date);

    expect(obj.creationDate.toISOString()).toBe("2026-11-26T16:34:41.940Z");
  });

  it("reads dates without seconds or fraction as UTC", () => {
    expect(parseDate("2026-11-26T16:34").toISOString()).toBe(
      "2026-11-26T16:34:00.000Z"
    );
    expect(parseDate("2026-11-26T16:34:41").toISOString()).toBe(
      "2026-11-26T16:34:41.000Z"
    );
  });

  it("keeps an explicit timezone", () => {
    expect(parseDate("2026-11-26T16:34:41.5Z").toISOString()).toBe(
      "2026-11-26T16:34:41.500Z"
    );
    expect(parseDate("2026-11-26T12:34:41-04:00").toISOString()).toBe(
      "2026-11-26T16:34:41.000Z"
    );
    expect(parseDate("2026-11-26T12:34:41-0400").toISOString()).toBe(
      "2026-11-26T16:34:41.000Z"
    );
  });

  it("trims a 7-digit fraction", () => {
    expect(parseDate("2026-11-26T16:34:45.1731087Z").toISOString()).toBe(
      "2026-11-26T16:34:45.173Z"
    );
    expect(parseDate("2026-11-26T16:34:45.1731087").toISOString()).toBe(
      "2026-11-26T16:34:45.173Z"
    );
  });

  it("reads Alfred's unset date as year 1 UTC", () => {
    const date = parseDate("0001-01-01T00:00:00");
    expect(date.getUTCFullYear()).toBe(1);
    expect(date.getUTCMonth()).toBe(0);
    expect(date.getUTCDate()).toBe(1);
    expect(date.getUTCHours()).toBe(0);
  });

  it("leaves null and undefined alone", () => {
    const obj: any = { creationDate: null, updateDate: undefined };

    castProps(obj, ["creationDate", "updateDate"], DataType.Date);

    expect(obj.creationDate).toBeNull();
    expect(obj.updateDate).toBeUndefined();
    expect("updateDate" in obj).toBe(true);
  });

  it("casts timestamp, creationDate and updateDate", () => {
    const obj: any = {
      timestamp: "2026-11-26T16:35:06.4231065Z",
      creationDate: "2026-11-26T16:34:41.5",
      updateDate: "2026-11-26T16:35:06.5949809Z",
      other: "2026-11-26T16:34:41.5",
    };

    castProps(obj, ["creationDate", "updateDate", "timestamp"], DataType.Date);

    expect(obj.timestamp.toISOString()).toBe("2026-11-26T16:35:06.423Z");
    expect(obj.creationDate.toISOString()).toBe("2026-11-26T16:34:41.500Z");
    expect(obj.updateDate.toISOString()).toBe("2026-11-26T16:35:06.594Z");
    expect(obj.other).toBe("2026-11-26T16:34:41.5");
  });

  it("leaves Date values as they are and passes other values to Date", () => {
    const date = new Date(0);
    const obj: any = { a: date, b: 0, c: "not a date" };

    castProps(obj, ["a", "b", "c"], DataType.Date);

    expect(obj.a).toBe(date);
    expect(obj.b.toISOString()).toBe("1970-01-01T00:00:00.000Z");
    expect(Number.isNaN(obj.c.getTime())).toBe(true);
  });
});
