<script>
  import Tag from "./Tag.svelte";
  import { apiGet } from "../../../utils/api";

  const integration = "weather/ruuvitag";

  let data = [];
  //export let jsonData;

  /*$: {
    if (data && jsonData) {
      const id = jsonData.id;
      const index = data.findIndex(item => item.id === id);
      if (index > -1) {
        data = [...data.slice(0, index), jsonData, ...data.slice(index + 1)];
      }
    }
  }*/

  const loadAll = () => {
    apiGet('/measurements').then(x => {
      data = x;
    });
  };
</script>

<div use:loadAll class="ruuvitag">
  {#each data as item}
    <Tag {item} />
  {/each}
</div>
