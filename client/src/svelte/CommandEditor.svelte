<script>
  import Button from "./components/Button.svelte";
  import Label from "./components/Label.svelte";
  import t from "../i18n";
  import CommandForm from "./CommandForm.svelte";

  export let onExit;
  export let currentData;
  export let integrations;
  export let current;

  $: formData = { ...currentData };

  const FORM_ENTITIES = {
    commands: [
      { label: "Name", id: "name" },
      {
        label: "Type",
        id: "type",
        type: "radio",
        options: [
          { label: "Oneshot", value: "oneshot" },
          { label: "Switch", value: "switch" }
        ]
      },
      { label: "Actions", entities: "actions" }
      // { label: "Triggers", entities: "triggers" }
    ],
    actions: [
      { label: "Integration", id: "intKey" },
      { label: "Entity", id: "entKey" },
      { label: "Parameter", id: "parameter" },
      { label: "Value", id: "value" }
    ]
    // triggers: []
  };

  const fields = FORM_ENTITIES.commands;

  const push = arrayName => () => {
    formData = {
      ...formData,
      [arrayName]: ((formData || {})[arrayName] || []).concat({})
    };
  };

  const remove = (arrayName, index) => () => {
    const arr = (formData || {})[arrayName] || [];
    formData = {
      ...formData,
      [arrayName]: [...arr.slice(0, index), ...arr.slice(index + 1)]
    };
  };

  const handleChange = id => evt => {
    const parts = id.split("__");
    const value = evt.target.value;
    if (parts.length > 2) {
      const key = parts[0];
      const index = parts[1];
      const name = parts[2];
      const arr = formData[key];
      formData = {
        ...formData,
        [key]: [
          ...arr.slice(0, index),
          { ...arr[index], [name]: value },
          ...arr.slice(index + 1)
        ]
      };
    } else {
      formData = {
        ...formData,
        [id]: value
      };
    }
  };
</script>

<div>
  <div>
    <CommandForm
      {fields}
      data={formData}
      formEntities={FORM_ENTITIES}
      {push}
      {remove}
      {handleChange}
      {integrations} />
  </div>
  <div>
    <Button onClick={() => onExit()}>{t('Cancel')}</Button>
    <Button variant="primary" onClick={() => onExit(formData)}>
      {t('Save')}
    </Button>
  </div>
</div>
