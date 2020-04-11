<script>
  import Icon from "./Icon.svelte";

  export let data;
</script>

{#each ['rain', 'snow'] as key}
  {#if data[key]}
    <li>
      <Icon icon={key} size={'sm'} />
      {#if typeof data[key] === 'number'}
        {data[key]} mm
      {:else}{Object.values(data[key])[0]} mm {Object.keys(data[key])[0]}{/if}
    </li>
  {/if}
{/each}
