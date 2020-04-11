<script>
  import WeatherBox from "./WeatherBox.svelte";
  export let w;
</script>

<WeatherBox {w} data={w.current} class="weather-box-currently" />
