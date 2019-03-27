import React from "react";

export default ({ id, label, value, handleChange }) => {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input type="text" value={value} onChange={handleChange(id)} />
    </div>
  );
};
