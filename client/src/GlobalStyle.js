import { createGlobalStyle } from "styled-components";

export default createGlobalStyle`
  html {
    font-size: ${p => p.theme.fonts.baseSize};
  }

  html, body, #app {
    height: 100%;
    box-sizing: border-box;
  }

  #app {
    padding: ${p => p.theme.bodyPadding};
  }

  body {
    font-family: ${p => p.theme.fonts.baseFamily};
    background: ${p => p.theme.colors.bg};
    color: ${p => p.theme.colors.text};
  }

  small {
    font-size: 0.8rem;
  }

  .icon {
    stroke: ${p => p.theme.colors.accentLight};
    fill: ${p => p.theme.colors.accentLight};
  }

  .icon-sm {
    width: 2rem;
    height: 2rem;
    display: inline-flex;
    vertical-align: -40%;
    margin: -0.3rem
  }

  button {
    color: ${p => p.theme.colors.text};
    font-size: ${p => p.theme.fonts.baseSize};
    font-family: ${p => p.theme.fonts.baseFamily};
  }

  a {
    color: ${p => p.theme.colors.link};
  }

  ::-webkit-scrollbar {
    height: 0.2rem;
    width: 0.2rem;
    background: ${p => p.theme.colors.bg};
  }

  ::-webkit-scrollbar-thumb {
    background: ${p => p.theme.colors.dark};
    -webkit-border-radius: 0.15rem;
    -webkit-box-shadow: none;
  }

  ::-webkit-scrollbar-corner {
    background: ${p => p.theme.colors.bg};
  }

  .react-simple-keyboard {
    position: fixed;
    bottom: 0;
    left: 0;
    .hg-button {
      background: ${p => p.theme.colors.dark} !important;
      span {
        color: ${p => p.theme.colors.text} !important;
      }
    }

  }
`;
