import React from "react";
import styled from "styled-components";

export default styled.button`
  background: transparent;
  border-radius: 3px;
  border: 2px solid ${p => p.theme.colorPrimary};
  color: ${p => p.theme.colorPrimary};
  margin: 0 1em;
  padding: 0.25em 1em;
`;
