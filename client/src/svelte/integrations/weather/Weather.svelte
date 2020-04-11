<script>
  import BoxRow from "../../components/BoxRow.svelte";
  import Spacer from "../../components/Spacer.svelte";
  import Smaller from "../../components/Smaller.svelte";
  import { apiGet, websocket } from "../../../utils/api";
  import Currently from "./Currently.svelte";
  import Daily from "./Daily.svelte";
  import RuuviTag from "./RuuviTag.svelte";
  import WeatherChart from "./WeatherChart.svelte";

  const integration = "weather/openweathermap";

  $: data = [];
  $: w = data[0];
  $: daily = w ? w.daily.slice(0, 4) : [];

  const onData = jsonData => {
    if (data && jsonData && jsonData.integration === integration) {
      data = [jsonData];
    }
  };

  const loadAll = () => {
    apiGet(`/api/entities?type=${encodeURIComponent(integration)}`).then(x => {
      data = x;
    });

    const destroy = websocket({ onData });
    return { destroy };
  };
</script>

<div use:loadAll>
  {#if w}
    <BoxRow>
      <Currently {w} />
      <Spacer big />
      <RuuviTag jsonData={data} />
    </BoxRow>
    <Spacer vertical />
    <BoxRow>
      {#each daily as day}
        <Daily {w} data={day} />
      {/each}
    </BoxRow>
    <Spacer vertical />
    <WeatherChart {w} />
    <Spacer vertical />
    <Smaller dimmer>{w.lat.toFixed(2)}°, {w.lon.toFixed(2)}°</Smaller>
  {/if}
</div>
