<script>
  import BoxColumn from "../../components/BoxColumn.svelte";
  import BoxRow from "../../components/BoxRow.svelte";
  import Smaller from "../../components/Smaller.svelte";
  import Modal from "../../components/Modal.svelte";
  import Closer from "../../components/Closer.svelte";
  import Icon from "./Icon.svelte";
  import Temperature from "./Temperature.svelte";
  import WindDirection from "./WindDirection.svelte";
  import Precipitation from "./Precipitation.svelte";
  import time from "./time";

  export let w;
  export let data;
  export let forecast;
  let container;

  $: modalOpen = false;

  const setModalOpen = state => {
    modalOpen = state;
  };
</script>

{#if data && w}
  <div on:click={() => setModalOpen(!modalOpen)}>
    <BoxColumn class={`weather-box ${$$props.class}`}>
      <div class="weather-box-title">{time(data.dt, w.timezone, forecast)}</div>
      <BoxRow>
        <span>
          <Icon icon={data.weather[0].icon} />
        </span>
        <BoxColumn>
          {#if forecast}
            <Temperature amount={2} {data} dataKey="temp" variant="High" />
            <Temperature amount={2} {data} dataKey="temp" variant="Low" />
          {:else}
            <Temperature {data} dataKey="temp" />
          {/if}
          <Smaller dimmer>
            <Icon icon={'wind'} size="sm" />
            {data.wind_speed.toFixed(0)}
            <WindDirection degrees={data.wind_deg} minimal />
          </Smaller>
          <Smaller dimmer>{data.humidity.toFixed(0)}%</Smaller>
        </BoxColumn>
      </BoxRow>
    </BoxColumn>
  </div>
{/if}

{#if modalOpen}
  <div bind:this={container}>
    <Modal>
      <div class="weather-detail">
        <h2>{time(data.dt, w.timezone, forecast)}</h2>
        <BoxRow>
          <span>
            <Icon icon={data.weather[0].icon} />
          </span>
          <BoxColumn>
            {#if forecast}
              <Temperature
                amount={2}
                {data}
                dataKey="temp"
                variant="High"
                decimals={1} />
              <Temperature
                amount={2}
                {data}
                dataKey="temp"
                variant="Low"
                decimals={1} />
            {:else}
              <Temperature {data} dataKey="temp" decimals={1} />
            {/if}
            <Smaller dimmer>
              <Icon icon={'wind'} size="sm" />
              {data.wind_speed.toFixed(1)}
              <WindDirection degrees={data.wind_deg} />
            </Smaller>
            <Smaller dimmer>{data.humidity.toFixed(0)}%</Smaller>
          </BoxColumn>
        </BoxRow>
        <ul>
          <li>{data.pressure} hPa</li>
          <li>
            <Icon icon={'thermometerZero'} size={'sm'} />
            {data.dew_point}°
          </li>
          <li>{data.weather[0].description}</li>
          <li>
            <Icon icon={'cloud'} size={'sm'} />
            {data.clouds}%
          </li>
          <li>
            <Icon icon={'shades'} size={'sm'} />
            {data.uvi}
          </li>
          <Precipitation {data} />
          <li>
            {#if data.sunrise}
              <Icon icon={'sunrise'} size={'sm'} />
              {time(data.sunrise, w.timezone, false, true)}
            {/if}
            {#if data.sunset}
              <Icon icon={'sunset'} size={'sm'} />
              {time(data.sunset, w.timezone, false, true)}
            {/if}
          </li>
          {#if data.visibility}
            <li>{data.visibility} m</li>
          {/if}
        </ul>
      </div>
      <Closer onClick={() => setModalOpen(false)} />
    </Modal>
  </div>
{/if}
