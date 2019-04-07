const forecast = require("./forecast.json");
const { processForecast } = require("./darksky");

describe("darksky", () => {
  test("forecast is parsed", () => {
    const result = processForecast(forecast);
    expect(result.currently.temperature).toEqual(9.75);
    expect(result.hourly.length).toEqual(3);
  });
});
