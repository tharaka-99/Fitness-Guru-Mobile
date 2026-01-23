import { DefaultTheme, Theme } from "@react-navigation/native";
import { theme } from "@utils/styles/theme";

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colors.PrimaryGreen,
    background: theme.colors.backgroundPrimary,
    card: theme.colors.backgroundPrimary,
    border: theme.colors.border,
    text: theme.colors.PrimaryWhite,
    notification: theme.colors.PrimaryGreen,
  },
};

export default navigationTheme;
