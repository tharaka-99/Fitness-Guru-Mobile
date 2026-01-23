import { ArrowRight } from 'lucide-react-native';
import React from 'react';
import { Image, TouchableOpacity } from 'react-native';

import { PAGE_WIDTH } from '@components/app/PageWrapper';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { constants, theme } from '@utils/styles/theme';

interface Props {
  title: string;
  description: string;
  image: any;
  onPress?: () => void;
}

const DefaultWorkoutsTypeCard: React.FC<Props> = ({
  title,
  description,
  image,
  onPress,
}) => {
  return (
    <TouchableOpacity activeOpacity={constants.activeOpacity} onPress={onPress}>
      <Box
        mb="xs"
        height={90}
        borderRadius="sm"
        overflow="hidden"
        width={PAGE_WIDTH}
        flexDirection="row"
        backgroundColor="backgroundSecondary"
      >
        <Box
          width="18%"
          height="100%"
          alignItems="center"
          justifyContent="center"
        >
          <Image style={{}} source={image} />
        </Box>

        <Box px="sm" flex={1} alignItems="flex-start" justifyContent="center">
          <Text variant="lgBold" numberOfLines={1} color="SecondaryGreen">
            {title.toUpperCase()}
          </Text>
          <Text color="textPrimary" variant="smBold" fontWeight={'300'}>
            {description}
          </Text>
        </Box>

        <Box
          width="16%"
          height="100%"
          alignItems="center"
          justifyContent="center"
          backgroundColor="PrimaryGreen"
        >
          <ArrowRight
            size={23}
            color={theme.colors.PrimaryWhite}
          />
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

export default DefaultWorkoutsTypeCard;
