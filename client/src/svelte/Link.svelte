<script>
  import { navigateTo } from "svelte-router-spa";
  import { BASENAME } from "./routes";
  export let to;
  export let hook;

  $: path = BASENAME + to;
</script>

<a
  href={path}
  on:click={evt => {
    evt.preventDefault();
    evt.stopPropagation();
    navigateTo(path);
    if (hook) {
      hook();
    }
  }}>
  <slot />
</a>
