<script>
  import BoxRow from "../../components/BoxRow.svelte";
  import Smaller from "../../components/Smaller.svelte";
  import Spacer from "../../components/Spacer.svelte";

  export let item;
  let data;

  $: {
    if (Array.isArray(item.data)) {
      data = item.data.map(Number);
    } else {
      const hex = [];
      for (let i = 0; i < item.data.length - 1; i += 2) {
        hex.push("0x" + item.data[i] + item.data[i + 1]);
      }
      data = hex.map(Number);
    }
  }

  const getTemperature = data => {
    if (data[0] === 3) {
      const sign = data[2] > 127 ? -1 : 1;
      const value = sign === -1 ? data[2] - 128 : data[2];
      return sign * value + data[3] / 100;
    }
    return -1;
  };

  const getHumidity = data => {
    if (data[0] === 3) {
      return data[1] / 2;
    }
    return -1;
  };
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
