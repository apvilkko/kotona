<script>
  import Chart from "chart.js";
  import { pipe, pathOr, map, prop } from "ramda";
  import time from "./time";

  const ID = "weatherChart";
  let canvasEl;
  export let w;

  $: {
    if (w && canvasEl) {
      const datapoints = pathOr([], ["hourly", "data"])(w);
      const labels = pipe(
        map(prop("time")),
        map(x => time(x, w.timezone, false, true))
      )(datapoints);

      const data = map(prop("temperature"))(datapoints);
      const data2 = map(prop("precipIntensity"))(datapoints);

      const ctx = canvasEl.getContext("2d");

      Chart.defaults.global.defaultFontColor = /*$color-text:*/ "#fff";
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
              borderColor: /*$color-accentLight:*/ "#b5cce2",
              data,
              yAxisID: "temp"
            },
            {
              backgroundColor: /*$color-dark:*/ "#424b54",
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
                  color: /*$color-darker:*/ "#262626"
                }
              }
            ],
            yAxes: [
              {
                id: "temp",
                gridLines: {
                  color: /*$color-dark:*/ "#424b54"
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
    }
  }
</script>

<div>
  <canvas id={ID} bind:this={canvasEl} />
</div>
