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
      font-size: 5vw;
    }
    @media screen and (orientation: landscape) {
      font-size: 5vh;
    }
    background: ${p => p.theme.colorBg};
    color: ${p => p.theme.colorPrimary};
  }

  small {
    font-size: 1rem;
  }

  .icon {
    stroke: ${p => p.theme.colorPrimary};
    fill: ${p => p.theme.colorPrimary};
  }

  .icon-sm {
    width: 2rem;
    height: 2rem;
    display: inline-flex;
    vertical-align: -40%;
    margin: -0.3rem
  }

  a {
    color: ${p => p.theme.colorPrimary};
  }
`;
