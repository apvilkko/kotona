const toSeconds = require("./toSeconds");

describe("toSeconds", () => {
  test("works", () => {
    expect(toSeconds(30)).toBe(30);
    expect(toSeconds("30")).toBe(30);
    expect(toSeconds("30s")).toBe(30);

    expect(toSeconds(null)).toBe(0);

    expect(toSeconds("2m")).toBe(120);
    expect(toSeconds("2m15s")).toBe(135);

    expect(toSeconds("4h")).toBe(4 * 60 * 60);

    expect(toSeconds("asdf")).toEqual(NaN);
    expect(toSeconds("123sa4545gfd")).toEqual(NaN);
  });
});
