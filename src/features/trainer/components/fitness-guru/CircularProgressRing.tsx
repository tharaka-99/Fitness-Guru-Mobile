import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Text from '@components/atoms/Text';
import Box from '@components/atoms/Box';
import { theme } from '@utils/styles/theme';

interface Props {
  radius: number;
  strokeWidth: number;
  progress: number; // 0 to 1
  color: string;
  backgroundColor?: string;
  title: string;
  subtitle: string;
  label: string;
  subLabel: string;
}

const CircularProgressRing: React.FC<Props> = ({
  radius,
  strokeWidth,
  progress,
  color,
  backgroundColor = theme.colors.borderSecondary,
  title,
  subtitle,
  label,
  subLabel
}) => {
  const halfCircle = radius + strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(isNaN(progress) ? 0 : progress, 0), 1);
  const strokeDashoffset = circumference - clampedProgress * circumference;

  return (
    <Box alignItems="center">
      <View style={{ width: halfCircle * 2, height: halfCircle * 2, justifyContent: 'center', alignItems: 'center' }}>
        <Svg width={halfCircle * 2} height={halfCircle * 2} viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}>
          <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
            <Circle
              cx="50%"
              cy="50%"
              stroke={backgroundColor}
              strokeWidth={strokeWidth}
              r={radius}
              fill="transparent"
            />
            <Circle
              cx="50%"
              cy="50%"
              stroke={color}
              strokeWidth={strokeWidth}
              r={radius}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </G>
        </Svg>
        <Box position="absolute" alignItems="center" justifyContent="center">
          <Text variant="lgBold">{title}</Text>
          <Text variant="xs" color="textSecondary">{subtitle}</Text>
        </Box>
      </View>
      <Box mt="sm" alignItems="center">
        <Text variant="md" style={{ fontWeight: '600' }}>{label}</Text>
        <Text variant="xs" color="textSecondary">{subLabel}</Text>
      </Box>
    </Box>
  );
};

export default CircularProgressRing;
