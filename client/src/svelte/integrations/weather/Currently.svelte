<script>
  import WeatherBox from "./WeatherBox.svelte";
  export let w;
</script>

<WeatherBox {w} data={w.currently} class="weather-box-currently" />
