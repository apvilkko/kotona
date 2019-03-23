import { createGlobalStyle } from "styled-components";

export default createGlobalStyle`
  html, body, #app {
    height: 100%;
    box-sizing: border-box;
  }

  #app {
    padding: ${p => p.theme.bodyPadding};
  }

  body {
    font-family: ${p => p.theme.fontFamily};
    @media screen and (orientation: portrait) {
      font-size: 4vw;
    }
    @media screen and (orientation: landscape) {
      font-size: 4vh;
    }
    background: ${p => p.theme.colorBg};
    color: ${p => p.theme.colorPrimary};
  }

  a {
    color: ${p => p.theme.colorPrimary};
  }
`;
