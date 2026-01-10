import React from "react";
import Dots from "react-native-dots-pagination";

import { theme } from "@utils/styles/theme";

interface PaginationDotsProps {
  currentPage: number;
  dotsCount: number;
}

const PaginationDots: React.FC<PaginationDotsProps> = ({
  currentPage,
  dotsCount,
}) => {
  return (
    <Dots
      length={dotsCount}
      active={currentPage}
      paddingVertical={2}
      activeDotWidth={9}
      activeDotHeight={9}
      passiveDotWidth={7}
      passiveDotHeight={7}
      activeColor={theme.colors.PrimaryGreen}
      passiveColor={theme.colors.textSecondary}
    />
  );
};

export default PaginationDots;
