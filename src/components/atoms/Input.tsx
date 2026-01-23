import React from "react";
import { KeyboardType, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";

import Box from "@components/atoms/Box";
import { theme } from "@utils/styles/theme";

export interface InputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  secureTextEntry?: boolean;
  placeholder?: string;
  keyboardType?: KeyboardType;
}

if (TextInput.defaultProps == null) {
  TextInput.defaultProps = {};
  TextInput.defaultProps.allowFontScaling = false;
}

const Input: React.FC<InputProps> = ({
  value,
  onBlur,
  placeholder,
  onChangeText,
  keyboardType = "default",
  secureTextEntry = false,
}) => {
  return (
    <Box height={50}>
      <TextInput
        dense
        value={value}
        onBlur={onBlur}
        mode="outlined"
        style={styles.input}
        placeholder={placeholder}
        outlineColor="transparent"
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        textColor={theme.colors.textPrimary}
        selectionColor={theme.colors.PrimaryGreen}
        activeOutlineColor={theme.colors.PrimaryGreen}
        placeholderTextColor={theme.colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
      />
    </Box>
  );
};

export default Input;

const styles = StyleSheet.create({
  input: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
});
