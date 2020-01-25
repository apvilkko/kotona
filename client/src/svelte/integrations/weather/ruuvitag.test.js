import { getTemperature, getHumidity } from "./ruuvitag";

const toArr = str => str.match(/.{2}/g).map(x => Number(`0x${x}`));

const V3_DATA = toArr("032b151dbf57ffe0002804210b8f");
const V5_DATA = toArr("0510922fddbf43ffe8ffe803f09736430033eb940fdc378e");
const V5_DATA1 = toArr("0501c3271abf43ffe8ffe803f09736430033eb940fdc378e");
const V5_DATA2 = toArr("05fe3d2fddbf43ffe8ffe803f09736430033eb940fdc378e");

describe("ruuvitag", () => {
  describe("temperature", () => {
    it("v3 works", () => {
      expect(getTemperature(V3_DATA)).toEqual(21.29);
    });
    it("v5 works", () => {
      expect(getTemperature(V5_DATA)).toEqual(21.21);
    });
    it("v5 works (plus)", () => {
      expect(getTemperature(V5_DATA1)).toEqual(2.255);
    });
    it("v5 works (minus)", () => {
      expect(getTemperature(V5_DATA2)).toEqual(-2.255);
    });
  });
  describe("humidity", () => {
    it("v3 works", () => {
      expect(getHumidity(V3_DATA)).toEqual(21.5);
    });
    it("v5 works", () => {
      expect(getHumidity(V5_DATA)).toEqual(30.6325);
    });
    it("v5 works (1)", () => {
      expect(getHumidity(V5_DATA1).toFixed(3)).toEqual("25.025");
    });
  });
});
