<script>
  export let vertical = false;
  export let big = false;
</script>

<span class="spacer" class:spacer-vertical={vertical} class:spacer-big={big}>
  <slot />
</span>
