import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Switch, Route, withRouter } from "react-router-dom";
import Menu from "./Menu";
import PAGES from "./pages";
import HammerContainer from "./HammerContainer";

const StyledHammerContainer = styled(HammerContainer)`
  height: 100%;
  width: 100%;
`;

const getNextPage = (pages, pathname, direction) => {
  const i = pages.findIndex(page => page.path === pathname);
  let index = i + direction;
  if (index > pages.length - 1) {
    index = 0;
  }
  if (index < 0) {
    index = pages.length - 1;
  }
  return pages[index].path;
};

const NavigationContainer = ({ history, location }) => {
  const [desiredPage, setDesiredPage] = useState(0);

  useEffect(() => {
    if (desiredPage === 1 || desiredPage === -1) {
      history.push(getNextPage(PAGES, location.pathname, desiredPage));
      setDesiredPage(0);
    }
  }, [desiredPage]);

  const options = {
    onSwipeLeft: () => {
      setDesiredPage(1);
    },
    onSwipeRight: () => {
      setDesiredPage(-1);
    }
  };

  return (
    <StyledHammerContainer options={options}>
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
    </StyledHammerContainer>
  );
};

export default withRouter(NavigationContainer);
