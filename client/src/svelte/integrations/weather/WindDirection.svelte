<script>
  export let degrees;
  export let minimal;

  const ranges = ["🡻", "🡿", "🡸", "🡼", "🡹", "🡽", "🡺", "🡾"].map((x, i) => [
    x,
    degrees > 45 * (i + 1) - 22.5
  ]);
  const direction = ranges.filter(x => !x[1])[0][0];
</script>

<span>
  {#if minimal}{direction}{:else}{direction} ({degrees}°){/if}
</span>
