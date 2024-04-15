import { castProps, DataType } from "../../src/utils/cast";

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
});
