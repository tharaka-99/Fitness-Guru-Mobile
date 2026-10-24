// BoxComponent.tsx
import { theme } from '@utils/styles/theme';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface BoxTabProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  icon?: {
    icon: ({ color, size }: { color: string; size: number }) => React.ReactNode;
  };
  selected?: boolean;
  disabled?:boolean
}

const BoxTab: React.FC<BoxTabProps> = ({
  title,
  onPress,
  style,
  icon,
  selected,
  disabled,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.box,
        style,
        selected && styles.selectedBox,
        disabled && styles.disabledBox,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : undefined}
    >
      {icon?.icon({
        color: selected
          ? theme.colors.PrimaryBlack
          : disabled
          ? theme.colors.SecondaryGrey
          : theme.colors.PrimaryWhite,
        size: 22,
      })}
      <Text
        style={[
          styles.boxText,
          selected && styles.selectedBoxText,
          disabled && styles.disabledBoxText,
        ]}
      >
        {title.toLocaleUpperCase()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  box: {
    flex: 1,
    margin: 1,
    padding: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxText: {
    color: theme.colors.textPrimary,
    marginTop: 10,
  },
  selectedBox: {
    backgroundColor: theme.colors.PrimaryGreen,
  },
  selectedBoxText: {
    color: theme.colors.PrimaryBlack,
  },
  disabledBox: {
    opacity: 0.4,
  },
  disabledBoxText: {
    color: theme.colors.SecondaryGrey,
  },
});

export default BoxTab;
