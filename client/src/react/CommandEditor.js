import React, { useState, useEffect } from "react";
import LabeledInput from "./components/LabeledInput";
import Button from "./components/Button";
import Label from "./components/Label";
import t from "./i18n";
import useFetch from "./hooks/useFetch";

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

const getter = (data, id, prefix, index) => {
  // TODO support prefix & index
  return data[id];
};

const CommandEditor = ({ currentData, onExit, integrations }) => {
  const [formData, setFormData] = useState(null);
  const [entityOptions, setEntityOptions] = useState({});
  const [entKey, setEntKey] = useState(null);
  const { doRequest, data: entityData } = useFetch();

  useEffect(() => {
    setFormData(currentData);
  }, [currentData]);

  useEffect(() => {
    if (entityData && entKey && !entityOptions[entKey]) {
      setEntityOptions({
        ...entityOptions,
        [entKey]: entityData
      });
    }
  }, [entityData]);

  useEffect(() => {
    if (entKey) {
      if (!entityOptions[entKey]) {
        // TODO doesn't support multiple concurrent calls
        doRequest({
          url: `/api/integrations/${encodeURIComponent(entKey)}/entities`
        });
      }
    }
  }, [entKey]);

  const handleChange = id => evt => {
    const parts = id.split("__");
    const value = evt.target.value;
    if (parts.length > 2) {
      const key = parts[0];
      const index = parts[1];
      const name = parts[2];
      const arr = formData[key];
      setFormData({
        ...formData,
        [key]: [
          ...arr.slice(0, index),
          { ...arr[index], [name]: value },
          ...arr.slice(index + 1)
        ]
      });
    } else {
      setFormData({
        ...formData,
        [id]: value
      });
    }
  };

  useEffect(() => {
    if (!formData) return;
    Object.keys(formData).forEach(key => {
      if (Array.isArray(formData[key])) {
        formData[key].forEach(item => {
          Object.keys(item).forEach(k => {
            if (k === "intKey") {
              const intKey = item[k];
              setEntKey(intKey);
            }
          });
        });
      }
    });
  }, [formData]);

  const push = arrayName => () => {
    setFormData({
      ...formData,
      [arrayName]: ((formData || {})[arrayName] || []).concat({})
    });
  };

  const remove = (arrayName, index) => () => {
    const arr = (formData || {})[arrayName] || [];
    setFormData({
      ...formData,
      [arrayName]: [...arr.slice(0, index), ...arr.slice(index + 1)]
    });
  };

  if (formData === null) return null;

  const renderForm = (fields, formData, prefix, index) => {
    const data = formData || {};
    const fieldsPart = fields.map(field => {
      if (field.entities) {
        return (
          <div key={field.entities}>
            <Label htmlFor={field.label}>{t(field.label)}</Label>
            {(data[field.entities] || []).map((item, i) => {
              return (
                <div key={i}>
                  {renderForm(
                    FORM_ENTITIES[field.entities],
                    item,
                    field.entities,
                    i
                  )}
                  <Button onClick={remove(field.entities, i)}>{t("-")}</Button>
                </div>
              );
            })}
            <Button onClick={push(field.entities)}>{t("+")}</Button>
          </div>
        );
      }
      const id = prefix
        ? `${prefix}__${index}__${field.id || field.label}`
        : field.id || field.label;
      if (field.type === "radio") {
        return (
          <fieldset key={`${id}-wrapper`}>
            <legend>{t(field.label)}</legend>
            {field.options.map(opt => (
              <span key={opt.value}>
                <input
                  type="radio"
                  name={id}
                  id={`${id}${opt.value}`}
                  value={opt.value}
                  onChange={handleChange(id)}
                  checked={getter(data, field.id, prefix, index) === opt.value}
                />
                <label htmlFor={`${id}${opt.value}`}>{t(opt.label)}</label>
              </span>
            ))}
          </fieldset>
        );
      } else if (field.id === "intKey") {
        return (
          <div key={id}>
            <Label htmlFor={id}>{t(field.label)}</Label>
            <select
              id={id}
              onChange={handleChange(id)}
              value={getter(data, field.id)}
            >
              <option value="">Choose</option>
              {integrations.map(intKey => (
                <option value={intKey} key={intKey}>
                  {intKey}
                </option>
              ))}
            </select>
          </div>
        );
      } else if (field.id === "entKey") {
        return (
          <div key={id}>
            <Label htmlFor={id}>{t(field.label)}</Label>
            <select
              id={id}
              onChange={handleChange(id)}
              value={getter(data, field.id)}
            >
              <option value="">Choose</option>
              {(entityOptions[data.intKey] || []).map(x => (
                <option value={x.id} key={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </div>
        );
      }
      return (
        <LabeledInput
          key={id}
          label={t(field.label)}
          id={id}
          handleChange={handleChange}
          value={data ? data[field.id] : ""}
        />
      );
    });

    return fieldsPart;
  };

  return (
    <div>
      <div>{renderForm(fields, formData)}</div>
      <div>
        <Button onClick={() => onExit()}>{t("Cancel")}</Button>
        <Button primary onClick={() => onExit(formData)}>
          {t("Save")}
        </Button>
      </div>
    </div>
  );
};

export default CommandEditor;
