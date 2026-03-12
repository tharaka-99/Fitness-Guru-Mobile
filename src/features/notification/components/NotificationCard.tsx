import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';

import { PAGE_WIDTH } from '@components/app/PageWrapper';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { constants, theme } from '@utils/styles/theme';

interface NotificationCardProps {
  title: string;
  image: string;
  date: Date;
}

const IMAGE_SIZE = 60;
const TEXT_MAX_WIDTH =
  PAGE_WIDTH - IMAGE_SIZE - theme.spacing.base * 2 - theme.spacing.md;

const NotificationCard: React.FC<NotificationCardProps> = ({
  title,
  image,
  date,
}) => {
  return (
    <TouchableOpacity activeOpacity={constants.activeOpacity}>
      <Box
        px="base"
        gap="md"
        py="base"
        borderRadius="sm"
        width={PAGE_WIDTH}
        flexDirection="row"
        backgroundColor="backgroundSecondary"
      >
        <Image
          source={require('../../../../assets/logo-Icon-new.png')}
          style={styles.image}
        />

        <Box>
          <Text
            mt="xs"
            variant="sm"
            numberOfLines={2}
            style={{ flexWrap: 'wrap', width: TEXT_MAX_WIDTH }}
          >
            {title}
          </Text>

          <Text variant="sm" color="textSecondary" textAlign="right">
            {date.toDateString()}
          </Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

export default NotificationCard;

const styles = StyleSheet.create({
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: theme.borderRadii.sm,
  },
});
