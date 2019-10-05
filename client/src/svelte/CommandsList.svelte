<script>
  import Button from "./components/Button.svelte";
  import t from "../i18n";

  export let data;
  export let setEditing;
  export let remove;
  export let runCommand;
</script>

<ul>
  {#each data as item}
    <li>
      <div>
        {item.name}
        <Button onClick={() => setEditing(item.id)}>{t('Edit')}</Button>
        <Button onClick={remove(item.id)}>{t('Remove')}</Button>
        <Button primary onClick={runCommand(item.id)}>{t('Run')}</Button>
      </div>
    </li>
  {/each}
</ul>
