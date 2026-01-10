import { createTheme } from "@shopify/restyle";

const palette = {
  PrimaryBlack: "#0D0D0D",
  PrimaryWhite: "#FFFFFF",
  SecondaryWhite: "#D9D9D9",
  PrimaryGrey: "#363636",
  SecondaryGrey: "#939292",
  PrimaryGreen: "#A0E220",
  SecondaryGreen: "#B7FFC8",
  PrimaryYellow: "#FFEDB1",
  PrimaryRed: "#FF6767",
  LightBlue: "#BADFFF",
  LightGreen: "#73C8A9",
  LightPink: "#FFA3AC",
  PrimaryPurple: "#DA78E2",
  PrimaryOrange: "#FBAC62",
  ModalOverlay: "rgba(0,0,0,0.8)",
};

const theme = createTheme({
  spacing: {
    none: 0,
    xs: 4,
    sm: 8,
    base: 12,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 48,
    "3xl": 64,
  },

  borderRadii: {
    none: 0,
    xs: 5,
    sm: 12,
    md: 18,
    lg: 20,
    xl: 25,
    "2xl": 35,
    full: 100,
  },

  colors: {
    textPrimary: palette.PrimaryWhite,
    textSecondary: palette.SecondaryGrey,
    textPrimaryBlack: palette.PrimaryBlack,

    backgroundPrimary: palette.PrimaryBlack,
    backgroundSecondary: palette.PrimaryGrey,

    border: palette.SecondaryGrey,
    borderColor: palette.SecondaryGrey,

    ...palette,
  },

  textVariants: {
    defaults: {
      fontSize: 14,
      color: "textPrimary",
      // fontFamily: "Arial",
    },

    xs: {
      fontSize: 12,
    },
    xsBold: {
      fontSize: 12,
      fontWeight: "bold",
    },

    sm: {
      fontSize: 14,
    },
    smBold: {
      fontSize: 14,
      fontWeight: "bold",
    },

    md: {
      fontSize: 16,
    },
    mdBold: {
      fontSize: 16,
      fontWeight: "bold",
    },

    lg: {
      fontSize: 18,
    },
    lgBold: {
      fontSize: 18,
      fontWeight: "bold",
    },

    xl: {
      fontSize: 23,
    },
    xlBold: {
      fontSize: 23,
      fontWeight: "bold",
    },

    "2xl": {
      fontSize: 30,
    },
    "2xlBold": {
      fontSize: 30,
      fontWeight: "bold",
    },

    "3xl": {
      fontSize: 36,
    },
    "3xlBold": {
      fontSize: 36,
      fontWeight: "bold",
    },

    "4xl": {
      fontSize: 48,
    },
    "4xlBold": {
      fontSize: 48,
      fontWeight: "bold",
    },

    "5xl": {
      fontSize: 60,
    },
    "5xlBold": {
      fontSize: 60,
      fontWeight: "bold",
    },
  },

  cardVariants: {
    defaults: {
      shadowOpacity: 0.1,
      backgroundColor: "backgroundPrimary",
    },
    primary: {
      shadowOpacity: 0.3,
      backgroundColor: "backgroundPrimary",
    },
    secondary: {
      shadowOpacity: 0.1,
      backgroundColor: "backgroundSecondary",
    },
  },
});

const constants = {
  activeOpacity: 0.7,
};

export { constants, palette, theme };
export type Theme = typeof theme;
