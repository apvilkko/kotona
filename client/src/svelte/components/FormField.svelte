<script>
  import Label from "./Label.svelte";
  import LabeledInput from "./LabeledInput.svelte";
  import t from "../../i18n";

  export let type;
  export let prefix;
  export let index;
  export let integrations;
  export let entityOptions;
  export let field;
  export let data;
  export let handleChange;
  export let fetchEntKeys;

  $: id = prefix
    ? `${prefix}__${index}__${field.id || field.label}`
    : field.id || field.label;

  const getter = (data, id, prefix, index) => {
    // TODO support prefix & index
    return data[id];
  };

  $: {
    if (field.id === "entKey") {
      const entKey = data.intKey;
      if (entKey) {
        fetchEntKeys([entKey]);
      }
    }
  }
</script>

<div>
  {#if type === 'radio'}
    <fieldset>
      <legend>{t(field.label)}</legend>
      {#each field.options as opt}
        <span>
          <input
            type="radio"
            name={id}
            id={`${id}${opt.value}`}
            value={opt.value}
            on:change={handleChange(id)}
            checked={getter(data, field.id, prefix, index) === opt.value} />
          <label for={`${id}${opt.value}`}>{t(opt.label)}</label>
        </span>
      {/each}
    </fieldset>
  {:else if field.id === 'intKey'}
    <div>
      <Label for={id}>{t(field.label)}</Label>
      <select {id} on:change={handleChange(id)} value={getter(data, field.id)}>
        <option value="">Choose</option>
        {#each integrations as intKey}
          <option
            value={intKey}
            key={intKey}
            selected={intKey === getter(data, field.id)}>
            {intKey}
          </option>
        {/each}
      </select>
    </div>
  {:else if field.id === 'entKey'}
    <div>
      <Label for={id}>{t(field.label)}</Label>
      <select {id} on:change={handleChange(id)} value={getter(data, field.id)}>
        <option value="">Choose</option>
        {#each entityOptions[data.intKey] || [] as x}
          <option
            value={x.id}
            key={x.id}
            selected={x.id === getter(data, field.id)}>
            {x.name}
          </option>
        {/each}
      </select>
    </div>
  {:else}
    <LabeledInput
      key={id}
      label={t(field.label)}
      {id}
      {handleChange}
      value={data ? data[field.id] : ''} />
  {/if}
</div>
