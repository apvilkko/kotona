import React, { useRef, useEffect } from "react";
import { withTheme } from "styled-components";
import Chart from "chart.js";
import { pipe, pathOr, map, prop } from "ramda";
import time from "./time";

const ID = "weatherChart";

const WeatherChart = ({ w, theme }) => {
  const canvasEl = useRef(null);

  useEffect(() => {
    const datapoints = pathOr([], ["hourly", "data"])(w);
    const labels = pipe(
      map(prop("time")),
      map(x => time(x, w.timezone, false, true))
    )(datapoints);

    const data = map(prop("temperature"))(datapoints);
    const data2 = map(prop("precipIntensity"))(datapoints);

    const ctx = canvasEl.current.getContext("2d");

    Chart.defaults.global.defaultFontColor = theme.colors.text;
    Chart.defaults.global.defaultFontSize = 18;
    Chart.defaults.global.elements.point.radius = 0;
    Chart.defaults.global.elements.line.borderWidth = 4;

    new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            type: "line",
            borderColor: theme.colors.accentLight,
            data,
            yAxisID: "temp"
          },
          {
            backgroundColor: theme.colors.dark,
            data: data2,
            yAxisID: "precip"
          }
        ]
      },
      options: {
        tooltips: {
          enabled: false
        },
        legend: {
          display: false
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                color: theme.colors.darker
              }
            }
          ],
          yAxes: [
            {
              id: "temp",
              gridLines: {
                color: theme.colors.dark
              }
            },
            {
              id: "precip",
              display: false,
              barPercentage: 1.0,
              categoryPercentage: 1.0
            }
          ]
        }
      }
    });
  }, [w]);

  return (
    <div>
      <canvas id={ID} ref={canvasEl} />
    </div>
  );
};

export default withTheme(WeatherChart);
