<script>
  import { navigateTo } from "svelte-router-spa";
  import pages from "./pages";
  import Link from "./Link.svelte";
  import Button from "./components/Button.svelte";
  import Closer from "./components/Closer.svelte";
  import t from "../i18n";

  let container;

  $: isOpen = false;

  const toggle = state => {
    isOpen = typeof state === "boolean" ? state : !isOpen;
  };

  const handleClick = event => {
    if (
      container &&
      !container.contains(event.target) &&
      !event.target.classList.contains("menu-opener")
    ) {
      toggle(false);
    }
  };

  const reload = () => {
    window.location.reload(true);
  };
</script>

<svelte:window on:click={handleClick} />

<div class="menu-container" bind:this={container}>
  {#if isOpen}
    <div class="menu">
      <Closer class="menu-opener" onClick={toggle} />
      <ul>
        {#each pages as page}
          <li>
            <Link to={page.path} hook={toggle}>{t(page.label)}</Link>
          </li>
        {/each}
      </ul>
      <Button onClick={reload}>{t('Refresh')}</Button>
    </div>
  {:else}
    <Button variant="base" class="menu-opener" onClick={toggle}>☰</Button>
  {/if}

</div>
