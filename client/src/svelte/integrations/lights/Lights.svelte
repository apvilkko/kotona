<script>
  import BoxRow from "../../components/BoxRow.svelte";
  import LightControl from "./LightControl.svelte";

  let filtered = [{ name: "asdf" }];
</script>

<div>
  <BoxRow top>
    {#each filtered as entity}
      <LightControl {entity} />
    {/each}
  </BoxRow>
</div>
