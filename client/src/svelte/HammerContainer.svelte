<script>
  import { onMount } from "svelte";
  import "hammerjs";

  export let options;
  let ref;
  let hammer;

  onMount(() => {
    hammer = new Hammer(ref); // eslint-disable-line no-undef
    hammer.on("swipe", evt => {
      if (evt.target.tagName === "INPUT") {
        return;
      }
      if (evt.deltaX < 0) {
        if (options.onSwipeLeft) {
          options.onSwipeLeft(evt);
        }
      } else {
        if (options.onSwipeRight) {
          options.onSwipeRight(evt);
        }
      }
    });
  });
</script>

<style>
  .hammer-container {
    width: 100%;
    height: 100%;
  }
</style>

<div bind:this={ref} class="hammer-container">
  <slot />
</div>
