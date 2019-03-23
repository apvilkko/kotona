import React from "react";
import { ThemeProvider } from "styled-components";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Button from "./components/Button";
import theme from "./theme";
import Menu from "./Menu";
import GlobalStyle from "./GlobalStyle";
import PAGES from "./pages";

export default () => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <>
        <GlobalStyle />
        <Menu />
        <main>
          <Switch>
            {PAGES.map(page => (
              <Route
                key={page.path}
                path={page.path}
                exact={true}
                component={page.component}
              />
            ))}
          </Switch>
        </main>
      </>
    </ThemeProvider>
  </BrowserRouter>
);
