import { ArrowRight } from 'lucide-react-native';
import React from 'react';
import { Image, TouchableOpacity } from 'react-native';

import { PAGE_WIDTH } from '@components/app/PageWrapper';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { constants, theme } from '@utils/styles/theme';

interface Props {
  onPress?: () => void;
  name?: string;
  image?: string | null;
}

const ExploreMyTrainersCard: React.FC<Props> = ({ onPress, name, image }) => {
  return (
    <TouchableOpacity activeOpacity={constants.activeOpacity} onPress={onPress}>
      <Box
        mb="xs"
        height={85}
        borderRadius="sm"
        overflow="hidden"
        width={PAGE_WIDTH}
        flexDirection="row"
        backgroundColor="backgroundSecondary"
      >
        <Box
          flex={1}
          p="base"
          gap="base"
          alignItems="center"
          flexDirection="row"
        >
          <Image
            resizeMode="cover"
            style={{ width: 60, height: 60, borderRadius: 10 }}
            source={
              image ? { uri: image } : require('assets/images/logo-3.png')
            }
          />

          <Box>
            <Text variant="lgBold" color="PrimaryGreen">
              {name}
            </Text>
            <Text color="textSecondary">Start Your Fitness Journey</Text>
          </Box>
        </Box>

        <Box
          width="16%"
          height="100%"
          alignItems="center"
          justifyContent="center"
          backgroundColor="PrimaryGreen"
        >
          <ArrowRight
            size={26}
            color={theme.colors.PrimaryWhite}
          />
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

export default ExploreMyTrainersCard;
