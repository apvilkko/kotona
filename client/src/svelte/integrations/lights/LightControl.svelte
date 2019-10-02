<script>
  import BoxColumn from "../../components/BoxColumn.svelte";
  import Range from "../../components/Range.svelte";
  import ColorChanger from "./ColorChanger";
  import throttle from "../../../utils/throttle";
  import { apiPost } from "../../../utils/api";
  import { getColorChoices } from "./tradfri";

  export let entity;
  export let integration;

  const entityState = entity => ({
    on: entity.on,
    brightness: Math.round(entity.brightness),
    color: entity.color
  });

  $: uiState = entityState(entity);

  const doRequest = req => {
    apiPost(`/api/entities/${req.id}`, { ...req, integration });
  };

  const changeBrightness = throttle(
    newValue => {
      doRequest({ id: entity.id, dimmer: newValue });
    },
    500,
    { leading: false }
  );

  const setUiState = state => {
    const oldState = { ...uiState };
    uiState = state;
    const brightness = Math.round(state.brightness);
    const oldBrightness = Math.round(oldState.brightness);
    if (
      brightness !== oldBrightness &&
      Math.abs(brightness - oldBrightness) > 1
    ) {
      changeBrightness(brightness);
    } else if (state.color !== oldState.color) {
      doRequest({ id: entity.id, color: state.color });
    } else if (state.on !== oldState.on) {
      doRequest({ id: entity.id, state: state.on });
    }
  };

  const colors = getColorChoices(entity);
</script>

<BoxColumn
  class={`${$$props.class} light-control ${uiState.on ? 'light-on' : ''}`}>
  <button
    type="button"
    class="light-toggle"
    on:click={() => setUiState({ ...uiState, on: !uiState.on })}
    style={uiState.on ? `background: #${uiState.color}` : ''}>
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
