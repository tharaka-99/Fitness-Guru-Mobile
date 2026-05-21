import React from "react";
import Box from "@components/atoms/Box";
import Input, { InputProps } from "@components/atoms/Input";
import InputLabel, { InputLabelProps } from "@components/atoms/InputLabel";
import { Text } from "react-native-paper";
import { theme } from "@utils/styles/theme";

interface TextInputProps extends InputProps, InputLabelProps {
  error?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  label,
  onBlur,
  placeholder,
  onChangeText,
  secureTextEntry,
  keyboardType,
  error,
  autoCapitalize,
}) => {
  return (
    <Box gap="sm">
      <InputLabel label={label} />
      <Input
        value={value}
        onBlur={onBlur}
        placeholder={placeholder}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
      />
      {error && (
        <Text
          style={{ color: theme.colors.PrimaryRed, fontSize: 12, marginTop: 4 }}
        >
          {error}
        </Text>
      )}
    </Box>
  );
};

export default TextInput;
