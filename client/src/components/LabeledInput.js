import React from "react";
import Label from "./Label";

export default ({ id, label, value, handleChange, type = "text", ...rest }) => {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
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
