<script>
  import Button from "./components/Button.svelte";
  import Spacer from "./components/Spacer.svelte";
  import { apiGet, apiPost, apiDelete } from "../utils/api";
  import { onMount } from 'svelte'
  import t from '../i18n'

  let count = 0
  let interval
  const POLL_INTERVAL = 5000
  const TIMER_INTERVAL = 1000
  const TEMPERATURE_LIMIT = 33
  const saunaApi = "/measurements/saunamode"

  const formatSeconds = x => {
    const minutes = Math.floor(x/60)
    const seconds = x%60
    return `${minutes < 10 ? '0':''}${minutes}:${seconds < 10 ? '0':''}${seconds}`
  }

  let saunaTemp = 0;
  $: alarmOn = saunaTemp >= TEMPERATURE_LIMIT
  let started = null;

  const timerFn = setInterval(() => {
    const start = started;
    if (!start) {
      return;
    }
    const elapsedSeconds = Math.round((new Date().getTime() - start)/1000)
    if (elapsedSeconds % 20 === 0) {
      apiGet('/measurements').then(x => {
        const entity = (x || []).find(y => y.name === 'Sauna');
        if (entity) {
          saunaTemp = entity.temperature;
        }
      });
    }
    if (elapsedSeconds > 60*60) {
      clearInterval(interval)
      saunaTo(false)
    }
    count = formatSeconds(elapsedSeconds)
  }, TIMER_INTERVAL)

  const saunaTo = mode => {
    if (mode) {
      apiPost(saunaApi);
      started = new Date().getTime();
      interval = timerFn
    } else {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
      apiDelete(saunaApi);
      started = null;
    }
  };

  onMount(() => {
    const pollInterval = setInterval(() => {
      apiGet(saunaApi).then(x => {
        started = x.started
      })
    }, POLL_INTERVAL)

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      clearInterval(pollInterval);
    }
  })

</script>

<div class:alarm={started && alarmOn}>
  <h2>Sauna mode</h2>
  <Spacer vertical/>
  {#if started}
    <p>{#if saunaTemp}<span class={'temperature'}>{saunaTemp}°</span>{/if} <span class="smaller-dimmer">{count}</span></p>
    <Spacer vertical/>
    <Button class="button-command" onClick={() => saunaTo(false)}>{t("Off")}</Button>
  {:else}
    <Button class="button-command" onClick={() => saunaTo(true)}>{t("On")}</Button>
  {/if}
</div>
