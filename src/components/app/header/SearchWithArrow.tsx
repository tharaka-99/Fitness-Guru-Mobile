import { Search, ArrowRight } from "lucide-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";

import Box from "@components/atoms/Box";
import { constants, theme } from "@utils/styles/theme";

interface Props {
  arrow?: {
    onPress?: () => void;
    disabled?: boolean;
  };
  search?: {
    onPress?: () => void;
    disabled?: boolean;
  };
  icons?: "search" | "arrow" | "both";
}

const SearchWithArrow: React.FC<Props> = ({
  arrow,
  search,
  icons = "both",
}) => {
  const showSearchIcon = icons === "search" || icons === "both";
  const showArrowIcon = icons === "arrow" || icons === "both";

  return (
    <Box flexDirection="row" alignItems="center" gap="xs">
      {showSearchIcon && (
        <TouchableOpacity
          onPress={search?.onPress}
          disabled={search?.disabled}
          activeOpacity={constants.activeOpacity}
        >
          <Box px="sm" py="xs">
            <Search size={23} color={theme.colors.PrimaryWhite} />
          </Box>
        </TouchableOpacity>
      )}
      {showArrowIcon && (
        <TouchableOpacity
          onPress={arrow?.onPress}
          disabled={arrow?.disabled}
          activeOpacity={constants.activeOpacity}
        >
          <Box px="sm" py="xs">
            <ArrowRight
              size={23}
              color={
                arrow?.disabled
                  ? theme.colors.PrimaryGrey
                  : theme.colors.PrimaryGreen
              }
            />
          </Box>
        </TouchableOpacity>
      )}
    </Box>
  );
};

export default SearchWithArrow;
