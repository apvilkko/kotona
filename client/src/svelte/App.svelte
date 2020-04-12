<script>
  import Router from "svelte-router-spa/src/components/router.svelte";
  import routes from "./routes";
</script>

<style>
  :global(html),
  :global(body),
  :global(#app) {
    height: 100%;
    box-sizing: border-box;
  }
</style>

<Router {routes} />
