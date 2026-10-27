import React from 'react';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { theme } from '@utils/styles/theme';
import { HabitType } from '@utils/types/habitTypes';
import { Scale, Footprints, Droplets, Moon } from 'lucide-react-native';

interface Props {
  habitType: HabitType;
  primaryValue: string;
  subtitle: string;
}

const getHeroIcon = (type: HabitType) => {
  switch (type) {
    case 'weight':
      return <Scale size={26} color={theme.colors.PrimaryBlack} />;
    case 'steps':
      return <Footprints size={26} color={theme.colors.PrimaryBlack} />;
    case 'water':
      return <Droplets size={26} color={theme.colors.PrimaryBlack} />;
    case 'sleep':
      return <Moon size={26} color={theme.colors.PrimaryBlack} />;
    default:
      return <Scale size={26} color={theme.colors.PrimaryBlack} />;
  }
};

export const HabitHeroCard: React.FC<Props> = ({ habitType, primaryValue, subtitle }) => {
  return (
    <Box
      backgroundColor="backgroundSecondary"
      borderRadius="md"
      p="lg"
      mb="md"
      justifyContent="center"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
      }}
    >
      <Box flexDirection="row" alignItems="center">
        <Box
          width={52}
          height={52}
          borderRadius="full"
          backgroundColor="PrimaryGreen"
          alignItems="center"
          justifyContent="center"
          mr="md"
        >
          {getHeroIcon(habitType)}
        </Box>
        <Box flex={1}>
          <Text
            style={{
              fontSize: 34,
              fontWeight: 'bold',
              color: theme.colors.PrimaryWhite,
              lineHeight: 40,
            }}
          >
            {primaryValue}
          </Text>
          <Text variant="sm" color="textSecondary" mt="xs">
            {subtitle}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default HabitHeroCard;
