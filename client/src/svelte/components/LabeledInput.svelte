<script>
  import Label from "./Label.svelte";

  export let id;
  export let label;
  export let value;
  export let handleChange;
</script>

<div class="form-group">
  <Label for={id}>{label}</Label>
  <input type="text" {id} value={value || ''} on:change={handleChange(id)} />
</div>
