<script>
  import BoxRow from "../../components/BoxRow.svelte";
  import Spacer from "../../components/Spacer.svelte";
  import Smaller from "../../components/Smaller.svelte";
  import { apiGet } from "../../../utils/api";

  const integration = "security/camera";

  const withPrefix = x => (x.startsWith("http") ? x : `http://${x}`);

  $: data = [];

  const loadAll = () => {
    apiGet(`/api/entities?type=${encodeURIComponent(integration)}`).then(x => {
      data = x;
    });
  };
</script>

<div use:loadAll>
  {#if data.length}
    {#each data as camera}
      <div>
        <h4>{camera.name}</h4>
        <img src={withPrefix(camera.addr)} alt={camera.name} />
      </div>
    {/each}
  {/if}
</div>
