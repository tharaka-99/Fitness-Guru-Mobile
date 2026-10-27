import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";

import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { constants, theme } from "@utils/styles/theme";

interface ButtonProps {
  onPress?: () => void;
  title: string;
  type?: "solid" | "outline";
  icon?: "arrow" | "none";
  isLoading?: boolean;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  icon,
  title,
  onPress,
  isLoading = false,
  type = "solid",
  disabled = false,
}) => {
  const isButtonDisabled = isLoading || disabled;

  if (type === "solid")
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={constants.activeOpacity}
        disabled={isButtonDisabled}
        style={{ opacity: isButtonDisabled ? 0.5 : 1, paddingBottom: 20 }}
      >
        <LinearGradient
          start={{ x: 1, y: 0.5 }}
          end={{ x: 0, y: 0.5 }}
          style={[styles.buttonBase, styles.buttonGradient]}
          colors={["#A0E220", "#A0E220"]}
        >
          <Box style={styles.buttonContent}>
            <Text
              variant="md"
              fontWeight="500"
              letterSpacing={1}
              color="textPrimaryBlack"
              textTransform="capitalize"
            >
              {title}
            </Text>
            {isLoading && (
              <ActivityIndicator
                size="small"
                color="white"
                style={styles.loader}
              />
            )}
          </Box>
        </LinearGradient>
      </TouchableOpacity>
    );

  if (type === "outline")
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={constants.activeOpacity}
        disabled={isButtonDisabled}
        style={{ opacity: isButtonDisabled ? 0.5 : 1, paddingBottom: 20 }}
      >
        <Box style={[styles.buttonBase, styles.buttonOutline]}>
          <Box style={styles.buttonContent}>
            <Text
              variant="md"
              fontWeight="500"
              letterSpacing={1}
              color="PrimaryGreen"
              textTransform="capitalize"
            >
              {title}
            </Text>
            {isLoading && (
              <ActivityIndicator
                size="small"
                color={theme.colors.PrimaryGreen}
                style={styles.loader}
              />
            )}
          </Box>
        </Box>
      </TouchableOpacity>
    );
};

export default Button;

const styles = StyleSheet.create({
  buttonBase: {
    height: 50,
    width: "100%",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadii.xs,
  },

  buttonGradient: {},

  buttonOutline: {
    borderWidth: 1,
    borderColor: theme.colors.PrimaryGreen,
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  loader: {
    marginLeft: 8, // Spacing between text and loader
  },
});
