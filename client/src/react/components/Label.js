import React from "react";

const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor}>{children}</label>
);

export default Label;
