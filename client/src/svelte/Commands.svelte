<script>
  import Button from "./components/Button.svelte";
  import { apiGet, apiPost, apiDelete, apiPut } from "../utils/api";
  import t from "../i18n";
  import CommandsList from "./CommandsList.svelte";
  import CommandEditor from "./CommandEditor.svelte";

  $: commands = [];
  $: integrations = [];
  $: editing = false;

  const setEditing = id => {
    editing = id;
  };

  const handleRemove = id => () => {
    apiDelete(commandUrl(id)).then(() => {
      loadCommands();
    });
  };

  const handleSave = draft => {
    const fn = draft.id ? apiPut : apiPost;
    fn(commandUrl(draft.id), draft).then(() => {
      loadCommands();
    });
  };

  const commandUrl = id => `/api/commands${id ? "/" + id : ""}`;

  const runCommand = id => () => {
    apiPost(`${commandUrl(id)}/run`);
  };

  const loadCommands = () => {
    apiGet("/api/commands").then(data => {
      commands = data;
    });
  };

  const load = () => {
    loadCommands();
    apiGet("/api/integrations").then(data => {
      integrations = data;
    });
  };
</script>

<div use:load>
  {#if editing}
    <CommandEditor
      {integrations}
      current={editing}
      currentData={editing === 'newdata' ? {} : commands.find(x => x.id === editing)}
      onExit={draft => {
        if (draft) {
          handleSave(draft);
        }
        setEditing(null);
      }} />
  {:else}
    <CommandsList
      data={commands}
      {setEditing}
      remove={handleRemove}
      {runCommand} />
    <div>
      <Button onClick={() => setEditing('new')}>{t('Add command')}</Button>
    </div>
  {/if}
</div>
