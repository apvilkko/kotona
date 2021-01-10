<script>
  import BoxRow from "../../components/BoxRow.svelte";
  import Smaller from "../../components/Smaller.svelte";
  import Spacer from "../../components/Spacer.svelte";

  export let item;

</script>

{#if item}
  <BoxRow>
    <div class="tag-name">{item.name}</div>
    <div>
      <div class="tag-temperature">{item.temperature.toFixed(1)}°</div>
      <Spacer />
      <Smaller dimmer>{item.humidity.toFixed(1)}%</Smaller>
      <Spacer />
      <Smaller dimmer>
        ( {new Date(item.datetime).toLocaleString('fi', {
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })} )
      </Smaller>
    </div>
  </BoxRow>
{/if}
