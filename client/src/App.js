import React from "react";
import { ThemeProvider } from "styled-components";
import Button from "./components/Button";
import Container from "./components/Container";

const theme = {
  colorPrimary: "papayawhip",
  colorBg: "black"
};

export default () => (
  <ThemeProvider theme={theme}>
    <Container>
      Hello <Button>asdf</Button>
    </Container>
  </ThemeProvider>
);
