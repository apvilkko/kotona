<script>
  import convertWindDeg from "./convertWindDeg";

  export let degrees;
  export let minimal;

  const direction = convertWindDeg(degrees);
</script>

<span>
  {#if minimal}{direction}{:else}{direction} ({degrees}°){/if}
</span>
