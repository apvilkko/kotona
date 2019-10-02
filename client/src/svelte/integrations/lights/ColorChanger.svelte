<script>
  import Modal from "../../components/Modal.svelte";
  import Closer from "../../components/Closer.svelte";
  import Button from "../../components/Button.svelte";

  export let colors;
  export let value;
  export let handleChange;
  let container;

  $: modalOpen = false;

  const setModalOpen = state => {
    modalOpen = state;
  };

  const getStyle = (color, current) => {
    let style = `background: #${color};`;
    if (color === current) {
      style += `border: 0.5em solid #333;`;
    }
    return style;
  };

  const handleClick = () => {
    if (
      container &&
      !container.contains(event.target) &&
      !event.target.classList.contains("color-modal-toggle")
    ) {
      setModalOpen(false);
    }
  };
</script>

<svelte:window on:click={handleClick} />

<div class="color-modal-toggle-container">
  <Button
    variant="base"
    class="color-modal-toggle"
    onClick={() => setModalOpen(!modalOpen)}
    style={`background: #${value};`} />
  {#if modalOpen}
    <div bind:this={container}>
      <Modal>
        <div class="color-select">
          {#each colors as color}
            <Button
              variant="base"
              class="color"
              onClick={() => handleChange(color)}
              style={getStyle(color, value)} />
          {/each}
        </div>
        <Closer onClick={() => setModalOpen(false)} />
      </Modal>
    </div>
  {/if}

</div>
