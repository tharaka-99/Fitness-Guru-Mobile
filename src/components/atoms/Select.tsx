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
}
interface Item {
  id: string;
  option: string;
  value: string | boolean | number;
}

const { width } = Dimensions.get("window");

const Select: React.FC<SelectProps> = ({ items, label, onSelect }) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    if (selectedItem && onSelect) onSelect(selectedItem);
  }, [selectedItem]);

  const handleItemSelect = (item: Item) => {
    setSelectedItem(item);
  };

  return (
    <Box gap="sm">
      <InputLabel label={label} />
      <Box gap="sm">
        {items?.map((item) => (
          <SelectItem
            item={item}
            key={item?.id}
            onSelect={handleItemSelect}
            selected={selectedItem?.id === item?.id}
          />
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
