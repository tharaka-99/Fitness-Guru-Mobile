import React, { useState } from "react";
import { KeyboardType, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
import { Eye, EyeOff } from "lucide-react-native";

import Box from "@components/atoms/Box";
import { theme } from "@utils/styles/theme";

export interface InputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  secureTextEntry?: boolean;
  placeholder?: string;
  keyboardType?: KeyboardType;
  outlinecolor?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  leftIcon?: string | React.ReactNode;
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
  outlinecolor = "transparent",
  autoCapitalize = "none",
  leftIcon,
}) => {
  const [isPasswordHidden, setIsPasswordHidden] = useState(secureTextEntry);

  return (
    <Box height={50}>
      <TextInput
        dense
        value={value}
        onBlur={onBlur}
        mode="outlined"
        style={styles.input}
        placeholder={placeholder}
        outlineColor={outlinecolor}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={isPasswordHidden}
        textColor={theme.colors.textPrimary}
        selectionColor={theme.colors.PrimaryGreen}
        activeOutlineColor={theme.colors.PrimaryGreen}
        placeholderTextColor={theme.colors.textSecondary}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        autoComplete="off"
        left={
          leftIcon ? (
            <TextInput.Icon
              icon={typeof leftIcon === "string" ? leftIcon : () => leftIcon}
              color={theme.colors.PrimaryGreen}
            />
          ) : undefined
        }
        right={
          secureTextEntry ? (
            <TextInput.Icon
              icon={() =>
                isPasswordHidden ? (
                  <Eye color={theme.colors.PrimaryGreen} size={20} />
                ) : (
                  <EyeOff color={theme.colors.PrimaryGreen} size={20} />
                )
              }
              onPress={() => setIsPasswordHidden(!isPasswordHidden)}
            />
          ) : undefined
        }
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
