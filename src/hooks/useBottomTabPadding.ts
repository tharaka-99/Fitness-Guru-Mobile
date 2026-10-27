import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "@utils/styles/theme";

export const TAB_BAR_HEIGHT = 70;
export const TAB_BAR_BOTTOM_MARGIN = 15;

/**
 * Calculates the dynamic padding bottom needed for scroll views
 * so their content isn't covered by the absolute positioned custom tab bar.
 */
export const useBottomTabPadding = (
  extraPadding: number = theme.spacing.base
) => {
  const insets = useSafeAreaInsets();

  const bottomOffset = Platform.OS === "ios" ? 0 : TAB_BAR_BOTTOM_MARGIN;
  // const bottomOffset = Math.max(insets.bottom, 10) + 10;

  return TAB_BAR_HEIGHT + bottomOffset + extraPadding;
};
