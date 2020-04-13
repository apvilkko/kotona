<script>
  import BoxRow from "../../components/BoxRow.svelte";
  import Smaller from "../../components/Smaller.svelte";
  import Spacer from "../../components/Spacer.svelte";
  import { getTemperature, getHumidity, preprocess } from "./ruuvitag.js";

  export let item;
  let data;

  $: {
    data = preprocess(item.data);
  }
</script>

{#if item}
  <BoxRow>
    <div class="tag-name">{item.name}</div>
    <div>
      <div class="tag-temperature">{getTemperature(data).toFixed(1)}°</div>
      <Spacer />
      <Smaller dimmer>{getHumidity(data).toFixed(1)}%</Smaller>
      <Spacer />
      <Smaller dimmer>
        ( {new Date(item.meta.updated).toLocaleString('fi', {
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })} )
      </Smaller>
    </div>
  </BoxRow>
{/if}
