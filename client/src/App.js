import React from "react";
import { ThemeProvider } from "styled-components";
import { BrowserRouter } from "react-router-dom";
import theme from "./theme";
import GlobalStyle from "./GlobalStyle";
import NavigationContainer from "./NavigationContainer";

import "react-simple-keyboard/build/css/index.css";

export default () => (
  <BrowserRouter basename="ui">
    <ThemeProvider theme={theme}>
      <>
        <GlobalStyle />
        <NavigationContainer />
      </>
    </ThemeProvider>
  </BrowserRouter>
);
