<script>
  import BoxRow from "../../components/BoxRow.svelte";
  import LightControl from "./LightControl.svelte";
  import { apiGet, websocket } from "../../../utils/api";

  const integration = "lights/tradfri";

  let filtered = [];
  $: data = [];

  $: {
    filtered = data
      ? data.filter(x => x.subtype === "light" || x.subtype === "outlet")
      : [];
  }

  const onData = jsonData => {
    if (data && jsonData) {
      const id = jsonData.id;
      const index = data.findIndex(item => item.id === id);
      if (index > -1) {
        data = [...data.slice(0, index), jsonData, ...data.slice(index + 1)];
      }
    }
  };

  const loadAll = () => {
    apiGet(`/api/entities?type=${encodeURIComponent(integration)}`).then(x => {
      data = x;
    });

    const destroy = websocket({ onData });
    return { destroy };
  };
</script>

<div use:loadAll>
  <BoxRow top>
    {#each filtered as entity}
      <LightControl {entity} {integration} />
    {/each}
  </BoxRow>
</div>
