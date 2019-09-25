<script>
  export let min;
  export let max;
  export let value;
  export let onChange;
</script>

<div class="range">
  <input type="range" on:change={onChange} {min} {max} {value} />
</div>
