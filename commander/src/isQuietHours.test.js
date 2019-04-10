const isQuietHours = require("./isQuietHours");

describe("isQuietHours", () => {
  test("works", () => {
    expect(isQuietHours(new Date("2019-01-01T01:30:00"))).toBe(true);
    expect(isQuietHours(new Date("2019-01-01T23:01:00"))).toBe(true);
    expect(isQuietHours(new Date("2019-01-01T05:50:00"))).toBe(true);

    expect(isQuietHours(new Date("2019-01-01T06:30:00"))).toBe(false);
    expect(isQuietHours(new Date("2019-01-01T11:01:00"))).toBe(false);
    expect(isQuietHours(new Date("2019-01-01T22:50:00"))).toBe(false);
  });
});
