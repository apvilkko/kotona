import React from "react";

export default ({ id, label, value, handleChange, type = "text", ...rest }) => {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={handleChange(id)}
        {...rest}
      />
    </div>
  );
};
