import React from 'react';
import { TouchableOpacity } from 'react-native';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { theme } from '@utils/styles/theme';
import { HabitType } from '@utils/types/habitTypes';
import { Lightbulb, BarChart2, ChevronRight } from 'lucide-react-native';

interface Props {
  habitType: HabitType;
  title: string;
  subtitle: string;
  onPress?: () => void;
}

export const HabitInsightCard: React.FC<Props> = ({ habitType, title, subtitle, onPress }) => {
  const isWeight = habitType === 'weight';

  const Content = (
    <Box
      backgroundColor="backgroundSecondary"
      borderRadius="md"
      p="md"
      mb="md"
      flexDirection="row"
      alignItems="center"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
      }}
    >
      <Box
        width={44}
        height={44}
        borderRadius="full"
        backgroundColor="PrimaryBlack"
        alignItems="center"
        justifyContent="center"
        mr="md"
        style={{
          borderWidth: 1,
          borderColor: 'rgba(160, 226, 32, 0.3)',
        }}
      >

        <Lightbulb size={22} color={theme.colors.PrimaryGreen} />

      </Box>

      <Box flex={1}>
        <Text variant="mdBold" color="textPrimary">
          {title}
        </Text>
        <Text variant="xs" color="textSecondary" mt="xs" numberOfLines={2}>
          {subtitle}
        </Text>
      </Box>


    </Box>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {Content}
      </TouchableOpacity>
    );
  }

  return Content;
};

export default HabitInsightCard;
