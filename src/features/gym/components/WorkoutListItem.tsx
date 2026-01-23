import React from 'react';
import { Image } from 'react-native';

import { PAGE_WIDTH } from '@components/app/PageWrapper';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';

interface WorkoutListItemProps {
  image: string;
  title: string;
  description: string;
  theme?: 'green' | 'standard';
}

const IMAGE_SIZE = 65;

const WorkoutListItem: React.FC<WorkoutListItemProps> = React.memo(({
  image,
  title,
  description,
  theme = 'standard',
}) => {
  const isThemeGreen = theme === 'green';

  return (
    <Box gap="base" width={PAGE_WIDTH} flexDirection="row">
      <Box
        borderRadius="xs"
        width={IMAGE_SIZE}
        height={IMAGE_SIZE}
        overflow="hidden"
        borderBottomWidth={isThemeGreen ? 0.5 : 0}
        borderWidth={isThemeGreen ? 1 : undefined}
      >
        <Image
          width={IMAGE_SIZE}
          height={IMAGE_SIZE}
          resizeMode="cover"
          source={{ uri: image }}
        />
      </Box>
      <Box
        flex={1}
        alignItems="flex-start"
        justifyContent="center"
        borderBottomWidth={isThemeGreen ? 0 : 0.5}
        borderBottomColor="textSecondary"
      >
        <Text
          variant="mdBold"
          numberOfLines={1}
          color={isThemeGreen ? 'PrimaryBlack' : 'textPrimary'}
          style={{ textTransform: 'capitalize' }}
        >
          {title}
        </Text>
        <Text
          numberOfLines={1}
          color={isThemeGreen ? 'PrimaryGrey' : 'textSecondary'}
        >
          {description}
        </Text>
      </Box>
    </Box>
  );
});

WorkoutListItem.displayName = 'WorkoutListItem';

export default WorkoutListItem;
