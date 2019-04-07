import isEqual from "./isEqual";

describe("isEqual", () => {
  test("works", () => {
    expect(isEqual({}, {})).toBe(true);
    expect(isEqual({ a: 1 }, { a: 1 })).toBe(true);
    expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(isEqual({ a: 1, b: 2 }, { a: 2, b: 2 }, ["a"])).toBe(true);
    expect(isEqual({ a: 1, b: 2 }, { a: 2, b: 2 })).toBe(false);
  });
});
