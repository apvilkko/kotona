const forecast = require("./forecast.json");
const processForecast = require("./processForecast");

describe("darksky", () => {
  test("forecast is parsed", () => {
    const result = processForecast(forecast);
    expect(result.currently.temperature).toEqual(9.75);
    expect(result.hourly.length).toEqual(3);
  });
});
