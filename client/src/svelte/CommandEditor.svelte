<script>
  import Button from "./components/Button.svelte";
  import Spacer from "./components/Spacer.svelte";
  import Label from "./components/Label.svelte";
  import t from "../i18n";
  import CommandForm from "./CommandForm.svelte";
  import { apiGet } from "../utils/api";

  export let onExit;
  export let currentData;
  export let integrations;

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
      { label: "Actions", entities: "actions" },
      { label: "Triggers", entities: "triggers" }
    ],
    actions: [
      { label: "Integration", id: "intKey" },
      { label: "Entity", id: "entKey" },
      { label: "Parameter", id: "parameter" },
      { label: "Value", id: "value" }
    ],
    triggers: [
      {
        label: "Type",
        id: "type",
        type: "radio",
        options: [
          { label: "After", value: "after" },
          { label: "After inactivity", value: "inactivity" }
        ]
      },
      { label: "Duration", id: "duration" },
      { label: "Integration", id: "intKey" },
      { label: "Entity", id: "entKey" },
      { label: "Parameter", id: "parameter" },
      { label: "Value", id: "value" },
      { label: "Operator", id: "operator" }
    ]
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

  $: entityOptions = {};

  const fetchEntKeys = entKeys => {
    entKeys.forEach(entKey => {
      if (!entityOptions[entKey]) {
        apiGet(`/api/integrations/${encodeURIComponent(entKey)}/entities`).then(
          x => {
            entityOptions[entKey] = x;
          }
        );
      }
    });
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
      {integrations}
      {entityOptions}
      {fetchEntKeys} />
  </div>
  <div>
    <Spacer vertical={true} />
    <Button onClick={() => onExit()}>{t('Cancel')}</Button>
    <Button variant="primary" onClick={() => onExit(formData)}>
      {t('Save')}
    </Button>
  </div>
</div>
