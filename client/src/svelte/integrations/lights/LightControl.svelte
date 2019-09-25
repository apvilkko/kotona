<script>
  import BoxColumn from "../../components/BoxColumn.svelte";
  import Range from "../../components/Range.svelte";
  import ColorChanger from "./ColorChanger";

  export let entity;
  $: uiState = { on: false, color: "#fff", brightness: 0 };

  const setUiState = state => {
    uiState = state;
  };

  const colors = [];
</script>

<BoxColumn
  class={`${$$props.class} light-control ${uiState.on ? 'light-on' : ''}`}>
  <button
    type="button"
    class="light-toggle"
    on:click={() => setUiState({ ...uiState, on: !uiState.on })}
    style={uiState.on ? { background: `#${uiState.color}` } : {}}>
    {entity.name}
  </button>
  <Range
    min="0"
    max="100"
    value={uiState.brightness}
    onChange={e => setUiState({ ...uiState, brightness: e.target.value })} />
  <ColorChanger
    {colors}
    value={uiState.color}
    handleChange={color => setUiState({ ...uiState, color })} />
</BoxColumn>
