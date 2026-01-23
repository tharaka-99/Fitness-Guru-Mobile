import { ChevronRight } from "lucide-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";

import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { constants, theme } from "@utils/styles/theme";

export interface ItemProps {
  title: string;
  onPress?: () => void;
  icon: ({ color, size }: { color: string; size: number }) => React.ReactNode;
  isLastItem?: boolean;
}

const Item: React.FC<ItemProps> = ({
  title,
  icon,
  onPress,
  isLastItem = false,
}) => {
  return (
    <TouchableOpacity activeOpacity={constants.activeOpacity} onPress={onPress}>
      <Box flexDirection="row" gap="md" pl="md" alignItems="center">
        <Box width={30} alignItems="center" justifyContent="center">
          {icon({ color: theme.colors.textPrimary, size: 25 })}
        </Box>

        <Box
          py="md"
          pr="md"
          flex={1}
          flexDirection="row"
          alignItems="center"
          borderBottomColor="border"
          justifyContent="space-between"
          borderBottomWidth={isLastItem ? 0 : 0.5}
        >
          <Text numberOfLines={1}>{title}</Text>

          <ChevronRight
            size={25}
            color={theme.colors.textSecondary}
          />
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

export default Item;
