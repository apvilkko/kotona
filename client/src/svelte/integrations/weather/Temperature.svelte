<script>
  import Smaller from "../../components/Smaller.svelte";
  import Spacer from "../../components/Spacer.svelte";

  export let amount;
  export let dataKey;
  export let data;
  export let variant = "";

  const safeNumber = val => {
    if (typeof val === 'number') {
      return val;
    }
    return NaN;
  }

  let realKey = dataKey + variant;
  let apparentKey = `apparent${cap(realKey)}`;
  let realData = safeNumber(data[realKey]).toFixed(0);
  let apparentData = safeNumber(data[apparentKey]).toFixed(0);

  function cap(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
</script>

<span>
  <span class={`temperature${amount === 2 ? '-2' : ''}`}>{realData}°</span>
  {#if apparentData !== realData}
    <Spacer />
    <Smaller>{apparentData}°</Smaller>
  {/if}
</span>
