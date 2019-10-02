<script>
  import WeatherBox from "./WeatherBox.svelte";
  export let w;
  export let data;
</script>

<WeatherBox {w} {data} class="weather-box-daily" forecast={true} />
