<script>
  import Router from "svelte-router-spa/src/components/router.svelte";
  import { routeIsActive } from "svelte-router-spa";
  import { navigateTo } from "svelte-router-spa";
  import Menu from "./Menu.svelte";
  import HammerContainer from "./HammerContainer.svelte";
  import pages from "./pages";
  import { BASENAME } from "./routes";

  $: activePage = null;

  const update = () => {
    pages.forEach((page, i) => {
      if (routeIsActive(BASENAME + page.path)) {
        activePage = i;
      }
    });
  };

  $: {
    update();
  }

  const options = {
    onSwipeLeft: () => {
      let next = activePage + 1;
      if (next >= pages.length) {
        next = 0;
      }
      navigateTo(BASENAME + pages[next].path);
    },
    onSwipeRight: () => {
      let next = activePage - 1;
      if (next <= -1) {
        next = pages.length - 1;
      }
      navigateTo(BASENAME + pages[next].path);
    }
  };
</script>

<svelte:window on:locationchange={update} />

<HammerContainer {options}>
  <Menu />
  <main>
    <Router />
  </main>
</HammerContainer>
