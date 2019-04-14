import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import Closer from "./components/Closer";
import Button, { BaseButton } from "./components/Button";
import ClickOutside from "./components/ClickOutside";
import t from "./i18n";
import PAGES from "./pages";

const Opener = styled(({ className, handleClick }) => (
  <BaseButton className={className} onClick={handleClick}>
    ☰
  </BaseButton>
))`
  border: none;
  color: ${p => p.theme.colors.dark};
  background: none;
`;

const Menu = ({ className }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={className}>
      {menuOpen ? (
        <ClickOutside onClick={() => setMenuOpen(false)}>
          <div className="menu">
            <Closer handleClick={() => setMenuOpen(false)} />
            <ul>
              {PAGES.map(page => (
                <li key={page.path}>
                  <NavLink to={page.path}>{t(page.label)}</NavLink>
                </li>
              ))}
              <li>
                <Button
                  onClick={() => {
                    window.location.reload(true);
                  }}
                >
                  refresh
                </Button>
              </li>
            </ul>
          </div>
        </ClickOutside>
      ) : (
        <Opener handleClick={() => setMenuOpen(true)} />
      )}
    </div>
  );
};

export default styled(Menu)`
  position: absolute;
  top: ${p => p.theme.bodyPadding};
  right: 0;
  text-align: right;
  padding-right: ${p => p.theme.bodyPadding};
  padding-left: ${p => p.theme.bodyPadding};
  z-index: 90;

  .menu {
    background: ${p => p.theme.colors.bg};
  }

  ul {
    margin-top: 1em;
  }

  li {
    margin-bottom: 1em;
  }
`;
