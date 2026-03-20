import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';

import { PAGE_WIDTH } from '@components/app/PageWrapper';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { constants, theme } from '@utils/styles/theme';

interface NotificationCardProps {
  title: string;
  /** Optional subtitle (e.g. push body / meal plan message) */
  body?: string;
  image?: string;
  date: Date;
  read?: boolean;
}

const IMAGE_SIZE = 60;
const TEXT_MAX_WIDTH =
  PAGE_WIDTH - IMAGE_SIZE - theme.spacing.base * 2 - theme.spacing.md;

const NotificationCard: React.FC<NotificationCardProps> = ({
  title,
  body,
  image: _image,
  date,
  read = true,
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
        backgroundColor={read ? 'backgroundSecondary' : 'PrimaryBlack'}
        opacity={read ? 1 : 0.95}
      >
        <Image
          source={require('../../../../assets/logo-Icon-new.png')}
          style={styles.image}
        />

        <Box flex={1}>
          <Text
            mt="xs"
            variant="sm"
            fontWeight={read ? '400' : '700'}
            numberOfLines={2}
            style={{ flexWrap: 'wrap', width: TEXT_MAX_WIDTH }}
          >
            {title}
          </Text>
          {body ? (
            <Text
              variant="sm"
              color="textSecondary"
              numberOfLines={3}
              style={{ flexWrap: 'wrap', width: TEXT_MAX_WIDTH, marginTop: 4 }}
            >
              {body}
            </Text>
          ) : null}

          <Text variant="sm" color="textSecondary" textAlign="right">
            {date.toDateString()}
          </Text>
        </Box>

        {!read ? (
          <Box
            backgroundColor="PrimaryRed"
            width={12}
            height={12}
            borderRadius="full"
            alignSelf="center"
          />
        ) : null}
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
