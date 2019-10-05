<script>
  import FormField from "./components/FormField.svelte";
  import Label from "./components/Label.svelte";
  import Button from "./components/Button.svelte";
  import t from "../i18n";

  export let fields;
  export let data;
  export let prefix;
  export let index;
  export let formEntities;
  export let remove;
  export let push;
  export let handleChange;
  export let integrations;
  export let entityOptions;
  export let fetchEntKeys;
</script>

<div>
  {#each fields as field}
    {#if field.entities}
      <div>
        <Label for={field.label}>{t(field.label)}</Label>
        {#each data[field.entities] || [] as item, i}
          <div>
            <svelte:self
              fields={formEntities[field.entities]}
              data={item}
              prefix={field.entities}
              index={i}
              {integrations}
              {handleChange}
              {formEntities}
              {entityOptions}
              {fetchEntKeys}
              {remove}
              {push} />
            <Button onClick={remove(field.entities, i)}>{t('-')}</Button>
          </div>
        {/each}
        <Button onClick={push(field.entities)}>{t('+')}</Button>
      </div>
    {:else}
      <FormField
        type={field.type}
        {prefix}
        {index}
        {field}
        {data}
        {handleChange}
        {integrations}
        {entityOptions}
        {fetchEntKeys} />
    {/if}
  {/each}
</div>
