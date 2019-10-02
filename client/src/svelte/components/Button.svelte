<script>
  export let variant = "action";
  export let onClick;
</script>

<button
  class={`button ${$$props.class}`}
  class:action-button={variant === 'action'}
  type="button"
  on:click={onClick}
  style={$$props.style}>
  <slot />
</button>
