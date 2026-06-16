import React from "react";
import { Dimensions, ScrollView } from "react-native";

import Box from "@components/atoms/Box";

import { theme } from "@utils/styles/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PageWrapperProps {
  children: React.ReactNode;
  noPadding?: boolean;
  noBottomPadding?: boolean;
}

const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  noPadding = false,
  noBottomPadding = false
}) => {
  const insets = useSafeAreaInsets();
  return (
    <Box
      flex={1}
      width={SCREEN_WIDTH}
      px={noPadding ? undefined : "md"}
      pt="sm"
      style={{ paddingBottom: noBottomPadding ? undefined : insets.bottom }}
    >
      {children}
    </Box>
  );
};

export default PageWrapper;

/**
 * The width of the screen. using Dimensions API.
 */
export const SCREEN_WIDTH = Dimensions.get("window").width;

/**
 * The padding on the left and right of the page.
 */
export const PAGE_PADDING_HORIZONTAL = theme.spacing.md;

/**
 * The width of the page is the width of the screen minus the padding on the left and right.
 */
export const PAGE_WIDTH = SCREEN_WIDTH - PAGE_PADDING_HORIZONTAL * 2;

/**
 * The height of the screen. using Dimensions API.
 */
export const SCREEN_HEIGHT = Dimensions.get("screen").height;
