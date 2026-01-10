import { theme } from '@utils/styles/theme';
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export const UserAvatar = (name: string) => {
  const getInitials = (name: string) => {
    return name
      ? name
          .split(' ')
          .map((word) => word[0])
          .join('')
          .toUpperCase()
      : '';
  };

  return (
    <View style={styles.avatarContainer}>
      <View style={styles.initialsContainer}>
        <Text style={styles.initials}>{getInitials(name)}</Text>
      </View>
    </View>
  );
};

export const UserAvatarRounded = (name: string) => {
  const getInitials = (name: string) => {
    return name
      ? name
          .split(' ')
          .map((word) => word[0])
          .join('')
          .toUpperCase()
      : '';
  };

  return (
    <View style={styles.avatarContainer}>
      <View style={styles.roundedInitialsContainer}>
        <Text style={styles.roundedInitials}>{getInitials(name)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  initialsContainer: {
    width: 115,
    height: 130,
    backgroundColor: theme.colors.SecondaryGrey,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadii.sm,
  },
  roundedInitialsContainer: {
    width: 35,
    height: 35,
    borderRadius: theme.borderRadii.full,
    backgroundColor: theme.colors.SecondaryGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  roundedInitials: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
