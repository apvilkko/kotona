<script>
  import { navigateTo } from "svelte-router-spa";
  import pages from "./pages";
  import Link from "./Link.svelte";
  import t from "../i18n";

  $: isOpen = false;

  const toggle = () => {
    isOpen = !isOpen;
  };
</script>

<div>
  <button type="button" on:click={toggle}>☰</button>
  {#if isOpen}
    <ul>
      {#each pages as page}
        <li>
          <Link to={page.path} hook={toggle}>{t(page.label)}</Link>
        </li>
      {/each}
    </ul>
  {/if}

</div>
