<script>
  import Smaller from "../../components/Smaller.svelte";
  import Spacer from "../../components/Spacer.svelte";

  export let amount;
  export let dataKey;
  export let data;
  export let variant = "";
  export let decimals = 0;

  const safeNumber = val => {
    if (typeof val === "number") {
      return val;
    }
    return NaN;
  };

  let realKey = dataKey;
  let apparentKey = "feels_like";
  let realData = data[realKey];
  let apparentData = data[apparentKey];
  if (variant) {
    const variantKey = `${variant === "High" ? "day" : "night"}`;
    realData = realData[variantKey];
    apparentData = apparentData[variantKey];
  }
  realData = safeNumber(realData).toFixed(decimals);
  apparentData = safeNumber(apparentData).toFixed(decimals);

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
