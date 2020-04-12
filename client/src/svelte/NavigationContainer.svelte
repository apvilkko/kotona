<script>
  import Route from "svelte-router-spa/src/components/route.svelte";
  import { routeIsActive } from "svelte-router-spa";
  import { navigateTo } from "svelte-router-spa";
  import Menu from "./Menu.svelte";
  import HammerContainer from "./HammerContainer.svelte";
  import pages from "./pages";
  import { BASENAME } from "./routes";

  export let currentRoute;
  const params = {};

  $: activePage = null;
  let timer = null;
  const TO_HOME_TIMEOUT = 60 * 1000;

  const update = () => {
    pages.forEach((page, i) => {
      if (routeIsActive(BASENAME + page.path)) {
        activePage = i;
      }
    });
  };

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

  const restartTimer = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      navigateTo(BASENAME);
    }, TO_HOME_TIMEOUT);
  };

  const EVENTS = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];

  const activityTimer = () => {
    restartTimer();
    EVENTS.forEach(event => {
      document.addEventListener(event, restartTimer, true);
    });
    return {
      destroy: () => {
        clearTimeout(timer);
        EVENTS.forEach(event => {
          document.removeEventListener(event, restartTimer);
        });
      }
    };
  };

  $: {
    update();
    restartTimer();
  }
</script>

<svelte:window on:locationchange={update} />

<div use:activityTimer style="width: 100%; height: 100%;">
  <HammerContainer {options}>
    <Menu />
    <main>
      <Route {currentRoute} {params} />
    </main>
  </HammerContainer>
</div>
