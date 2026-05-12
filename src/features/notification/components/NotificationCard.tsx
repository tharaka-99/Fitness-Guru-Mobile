import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Trash2 } from 'lucide-react-native';


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
  onDelete?: () => void;
}


const IMAGE_SIZE = 50;


const formatNotificationDate = (date: Date) => {
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );


  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return date.toLocaleDateString();
};


const NotificationCard: React.FC<NotificationCardProps> = ({
  title,
  body,
  image: _image,
  date,
  read = true,
  onDelete,
}) => {
  return (
    <Box
      px="base"
      gap="md"
      py="base"
      borderRadius="sm"
      flexDirection="row"
      backgroundColor={read ? 'backgroundSecondary' : 'PrimaryGreyDark'}
      borderLeftWidth={read ? 0 : 3}
      borderLeftColor="PrimaryGreen"
      width="100%"
    >
      <Image
        source={require('../../../../assets/logo-Icon-new.png')}
        style={styles.image}
      />


      <Box flex={1}>
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Text
            variant="smBold"
            fontWeight={read ? '600' : '800'}
            numberOfLines={2}
            style={{ flex: 1, marginRight: theme.spacing.sm }}
            color={read ? 'textSecondary' : 'textPrimary'}
          >
            {title}
          </Text>
          <Text variant="xs" color="textSecondary" opacity={0.7}>
            {formatNotificationDate(date)}
          </Text>
        </Box>


        {body ? (
          <Text
            mt="xs"
            variant="sm"
            color="textSecondary"
            numberOfLines={5}
            style={{ flexWrap: 'wrap' }}
          >
            {body}
          </Text>
        ) : null}


        <Box flexDirection="row" justifyContent="flex-end" mt="sm" gap="md">
          {!read ? (
            <Box
              backgroundColor="PrimaryGreen"
              width={8}
              height={8}
              borderRadius="full"
              alignSelf="center"
            />
          ) : null}


          {onDelete ? (
            <TouchableOpacity
              onPress={onDelete}
              activeOpacity={constants.activeOpacity}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Trash2 color={theme.colors.PrimaryRed} size={16} opacity={0.8} />
            </TouchableOpacity>
          ) : null}
        </Box>
      </Box>
    </Box>
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



