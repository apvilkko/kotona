<script>
  import Button from "./Button.svelte";
  export let onClick;
</script>

<Button variant="base" class={`button-closer ${$$props.class}`} {onClick}>
  ✕
</Button>
