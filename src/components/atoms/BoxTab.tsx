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
      style={[styles.box, style, selected && styles.selectedBox]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon?.icon({
        color: selected ? theme.colors.PrimaryBlack : theme.colors.PrimaryWhite,
        size: 22,
      })}
      <Text style={[styles.boxText, selected && styles.selectedBoxText]}>
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
});

export default BoxTab;
