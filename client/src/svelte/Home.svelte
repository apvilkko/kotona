<script>
  import Button from "./components/Button.svelte";
  import Spacer from "./components/Spacer.svelte";
  import SaunaMode from "./SaunaMode.svelte";
  import { apiGet, apiPost } from "../utils/api";

  $: actions = [];

  const loadActions = () => {
    apiGet("/api/commands").then(data => {
      actions = data;
    });
  };

  const runCommand = command => {
    apiPost(`/api/commands/${command.id}/run`);
  };

</script>

<div use:loadActions>
  {#each actions as action}
    <Button class="button-command" onClick={() => runCommand(action)}>
      {action.name}
    </Button>
  {/each}
  <Spacer vertical/>
  <SaunaMode />
</div>
