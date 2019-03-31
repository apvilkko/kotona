import React from "react";
import styled from "styled-components";
import { darken } from "polished";

const BaseButton = styled.button`
  font-family: inherit;
  font-size: inherit;
  background: transparent;
  color: ${p => p.theme.colorPrimary};
`;

const ActionButton = styled(BaseButton)`
  border-radius: 0.2em;
  border: 0.1em solid;
  border-color: ${p => p.theme.colorPrimary};
  margin: 0 1em;
  padding: 0.25em 1em;
  box-shadow: 0 0 0.4em rgba(255, 255, 255, 0.4);
  height: 2em;
  box-sizing: border-box;
  background: ${p => p.color || "transparent"}

  &:active {
    border-color: ${p => darken(0.15)(p.theme.colorPrimary)};
    border-width: 0.09em;
  }

  transition: border-color 0.2s linear;
`;

export { BaseButton, ActionButton as default };
