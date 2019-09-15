import React from "react";
import styled from "styled-components";
import { BaseButton } from "./Button";

const Closer = ({ className, handleClick }) => (
  <BaseButton className={className} type="button" onClick={handleClick}>
    ✕
  </BaseButton>
);

export default styled(Closer)`
  border: none;
`;
