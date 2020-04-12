import convertWindDeg from "./convertWindDeg";

describe("convertWindDeg", () => {
  it("works", () => {
    expect(convertWindDeg(0)).toEqual("↓");
    expect(convertWindDeg(80)).toEqual("←");
    expect(convertWindDeg(210)).toEqual("↗");
    expect(convertWindDeg(348)).toEqual("↓");
  });
});
