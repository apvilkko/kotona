import React, { useState, useEffect } from "react";
import LabeledInput from "./components/LabeledInput";
import Button from "./components/Button";

const FORM_ENTITIES = {
  command: [
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
    { label: "Actions", entities: "action" },
    { label: "Triggers", entities: "trigger" }
  ],
  action: [
    { label: "Integration", id: "intKey" },
    { label: "Entity", id: "entity" },
    { label: "Parameter", id: "parameter" },
    { label: "Value", id: "value" }
  ],
  trigger: []
};

const fields = FORM_ENTITIES.command;

const CommandEditor = ({ currentData, onExit }) => {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    setFormData(currentData);
  }, [currentData]);

  const handleChange = id => evt => {
    setFormData({
      ...formData,
      [id]: evt.target.value
    });
  };

  if (formData === null) return null;

  const renderForm = fields =>
    fields.map(field => (
      <LabeledInput
        key={field.id}
        label={field.label}
        id={field.id}
        handleChange={handleChange}
        value={formData ? formData[field.id] : ""}
      />
    ));

  return (
    <div>
      <div>{renderForm(fields)}</div>
      <div>
        <Button onClick={() => onExit()}>Cancel</Button>
        <Button onClick={() => onExit(formData)}>Save</Button>
      </div>
    </div>
  );
};

export default CommandEditor;
