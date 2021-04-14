<script>
  import Button from "./components/Button.svelte";
  import Spacer from "./components/Spacer.svelte";
  import { apiGet, apiPost } from "../utils/api";
  import { active, saunaTo, started } from "./saunamode";
  import { onMount } from 'svelte'
  import {get} from 'svelte/store'
  import t from '../i18n'
  let count = 0

  const formatSeconds = x => {
    const minutes = Math.floor(x/60)
    const seconds = x%60
    return `${minutes < 10 ? '0':''}${minutes}:${seconds < 10 ? '0':''}${seconds}`
  }

  $: saunaTemp = 0;

  onMount(() => {
    const interval = setInterval(() => {
      const start = get(started);
      if (!start) {
        return;
      }
      const elapsedSeconds = Math.round((new Date().getTime() - start.getTime())/1000)
      if (elapsedSeconds % 20 === 0) {
        apiGet('/measurements').then(x => {
          const entity = (x || []).find(y => y.name === 'Sauna');
          if (entity) {
            saunaTemp = entity.temperature
          }
        });
      }
      if (elapsedSeconds > 60*60) {
        clearInterval(interval)
        saunaTo(false)
      }
      count = formatSeconds(elapsedSeconds)
    }, 1000)
    return () => clearInterval(interval)
  })
  $: actions = [];

  const loadActions = () => {
    apiGet("/api/commands").then(data => {
      actions = data;
    });
  };

  const runCommand = command => {
    apiPost(`/api/commands/${command.id}/run`);
  };

</script>

<div use:loadActions>
  {#each actions as action}
    <Button class="button-command" onClick={() => runCommand(action)}>
      {action.name}
    </Button>
  {/each}
  <Spacer vertical/>
  <h2>Sauna mode</h2>
  <Spacer vertical/>
  {#if $active}
    <p>{#if saunaTemp}<span class={'temperature'}>{saunaTemp}°</span>{/if} <span class="smaller-dimmer">{count}</span></p>
    <Spacer vertical/>
    <Button class="button-command" onClick={() => saunaTo(false)}>{t("Off")}</Button>
  {:else}
    <Button class="button-command" onClick={() => saunaTo(true)}>{t("On")}</Button>
  {/if}
</div>
