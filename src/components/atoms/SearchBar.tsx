import { Search, X } from "lucide-react-native";
import { SearchBar as ElementSearchBar } from "@rneui/base";
import React from "react";
import { Touchable, TouchableOpacity, TouchableWithoutFeedback } from "react-native";

import Box from "@components/atoms/Box";
import { theme } from "@utils/styles/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (v: string) => void;
  onCancel: () => void;
  // onClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  // onClear,
  onCancel,
  onChangeText,
}) => {
  return (
    <ElementSearchBar
      autoFocus={true}
      value={value}
      platform="ios"
      // onClear={onClear}
      onCancel={onCancel}
      allowFontScaling={false}
      onChangeText={onChangeText}
      clearIcon={
       false
      }
      inputStyle={{
        color: theme.colors.textPrimary,
        fontSize: 16,
      }}
      cancelButtonProps={{ color: theme.colors.textSecondary }}
      placeholder="Search food"
      style={{ borderWidth: 0 }}
      containerStyle={{
        backgroundColor: theme.colors.backgroundPrimary,
        borderBottomWidth: 0,
        borderTopWidth: 0,
        paddingTop: 0,
        paddingBottom: 0,
      }}
      
      inputContainerStyle={{
        borderRadius: theme.borderRadii.sm,
        backgroundColor: theme.colors.backgroundSecondary,
        marginLeft: 0,
        // marginRight: 0,
      }}
      placeholderTextColor={theme.colors.textSecondary}
      searchIcon={
        <Search size={23} color={theme.colors.textSecondary} />
      }
    />
  );
};

export default SearchBar;
