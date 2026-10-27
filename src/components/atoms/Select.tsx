import { Circle, Check } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Dimensions, TouchableOpacity, View } from "react-native";

import Box from "@components/atoms/Box";
import InputLabel from "@components/atoms/InputLabel";
import Text from "@components/atoms/Text";
import { constants, theme } from "@utils/styles/theme";

interface SelectProps {
  items: Item[];
  onSelect?: (item: Item) => void;
  label?: string;
  value?: string | boolean | number;
  horizontal?: boolean;
}
interface Item {
  id: string;
  option: string;
  value: string | boolean | number;
}

const { width } = Dimensions.get("window");

const Select: React.FC<SelectProps> = ({ items, label, onSelect, value, horizontal }) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Sync state when incoming 'value' changes (e.g., loaded from Redux profile info)
  useEffect(() => {
    if (value !== undefined && items) {
      const matchedItem = items.find((item) => item.value === value);
      if (matchedItem) {
        setSelectedItem(matchedItem);
      }
    }
  }, [value, items]);

  // Handle local item selection and notify parent form component
  const handleItemSelect = (item: Item) => {
    setSelectedItem(item);
    if (onSelect) {
      onSelect(item);
    }
  };

  return (
    <Box gap="sm">
      {label && <InputLabel label={label} />}
      <Box gap="sm" flexDirection={horizontal ? "row" : "column"}>
        {items?.map((item) => (
          <Box key={item?.id} flex={horizontal ? 1 : undefined}>
            <SelectItem
              item={item}
              onSelect={handleItemSelect}
              selected={selectedItem?.id === item?.id}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

interface SelectItemProps {
  item: Item;
  selected?: boolean;
  onSelect: (item: Item) => void;
}

const SelectItem: React.FC<SelectItemProps> = ({
  item,
  onSelect,
  selected = false,
}) => {
  return (
    <TouchableOpacity
      onPress={() => onSelect(item)}
      activeOpacity={constants.activeOpacity}
    >
      <Box
        gap="base"
        height={50}
        overflow="hidden"
        borderRadius="xs"
        alignItems="center"
        flexDirection="row"
        paddingHorizontal="base"
        justifyContent="flex-start"
        backgroundColor="backgroundSecondary"
      >
        <Box justifyContent="center" alignItems="center">
          {selected ? (
            <View style={{ position: "relative", width: 32, height: 32 }}>
              <Circle
                size={32}
                color={theme.colors.PrimaryGreen}
                fill={theme.colors.PrimaryGreen}
                strokeWidth={2.5}
              />
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 32,
                  height: 32,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Check
                  size={20}
                  color={theme.colors.PrimaryBlack}
                  strokeWidth={3}
                />
              </View>
            </View>
          ) : (
            <Circle
              size={32}
              color={theme.colors.textSecondary}
              strokeWidth={2}
            />
          )}
        </Box>
        <Text
          numberOfLines={2}
          variant="sm"
          color={selected ? "textPrimary" : "textSecondary"}
          style={{ flexWrap: "wrap", maxWidth: width * 0.7 }}
        >
          {item?.option}
        </Text>
      </Box>
    </TouchableOpacity>
  );
};

export default Select;
