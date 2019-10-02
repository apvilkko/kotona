<script>
  import BoxColumn from "../../components/BoxColumn.svelte";
  import BoxRow from "../../components/BoxRow.svelte";
  import Smaller from "../../components/Smaller.svelte";
  import Icon from "./Icon.svelte";
  import Temperature from "./Temperature.svelte";
  import time from "./time";

  export let w;
  export let data;
  export let forecast;
</script>

{#if data && w}
  <BoxColumn class={`weather-box ${$$props.class}`}>
    <div class="weather-box-title">{time(data.time, w.timezone, forecast)}</div>
    <BoxRow>
      <span>
        <Icon icon={data.icon} />
      </span>
      <BoxColumn>
        {#if forecast}
          <Temperature amount={2} {data} dataKey="temperature" variant="High" />
          <Temperature amount={2} {data} dataKey="temperature" variant="Low" />
        {:else}
          <Temperature {data} dataKey="temperature" />
        {/if}
        <Smaller dimmer>
          <Icon icon={'wind'} size="sm" />
          {data.windSpeed.toFixed(0)}
        </Smaller>
        <Smaller dimmer>{(data.humidity * 100).toFixed(0)}%</Smaller>
      </BoxColumn>
    </BoxRow>
  </BoxColumn>
{/if}
