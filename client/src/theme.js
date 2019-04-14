const colors = {
  bg: "#121517",
  dark: "#424b54",
  medium: "#919eaa",
  dimmer: "#bababa",
  light: "#fff",
  accentLight: "#b5cce2",
  accentDark: "#69829b"
};

export default {
  fonts: {
    baseSize: "30px",
    baseFamily: "'Oxygen', sans-serif"
  },
  colors: {
    ...colors,
    text: colors.light,
    link: colors.accentLight
  },
  modal: {
    bg: colors.bg
  },
  bodyPadding: "1em",
  box: {
    border: `0.2em solid ${colors.dark}`,
    borderRadius: "1em"
  }
};
