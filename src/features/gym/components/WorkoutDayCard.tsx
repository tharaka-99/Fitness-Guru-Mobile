import { ArrowRight } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';

import { PAGE_WIDTH } from '@components/app/PageWrapper';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { constants, theme } from '@utils/styles/theme';

interface Props {
  title: string;
  description: string;
  onPress?: () => void;
}

const WorkoutDayCard: React.FC<Props> = ({ title, description, onPress }) => {
  return (
    <TouchableOpacity activeOpacity={constants.activeOpacity} onPress={onPress}>
      <Box
        mb="xs"
        height={80}
        borderRadius="sm"
        overflow="hidden"
        width={PAGE_WIDTH}
        flexDirection="row"
        backgroundColor="backgroundSecondary"
      >
        <Box px="lg" flex={1} alignItems="flex-start" justifyContent="center">
          <Text variant="mdBold" numberOfLines={1}>
            {title}
          </Text>
          <Text
            color="textSecondary"
            numberOfLines={1}
            style={{ textTransform: 'capitalize' }}
          >
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

export default WorkoutDayCard;
