import React, { useState } from 'react';
import { View, LayoutChangeEvent, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Line, Path, Circle, Text as SvgText, G } from 'react-native-svg';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { theme } from '@utils/styles/theme';
import { ProcessedDayPoint } from '../../hooks/useHabitHistory';

interface Props {
  period: 'week' | 'month';
  points: ProcessedDayPoint[];
  ticks: number[];
  title?: string;
  unit?: string;
  onSelectDay?: (point: ProcessedDayPoint) => void;
}

const DEFAULT_WIDTH = Dimensions.get('window').width - 32;

export const HabitLineChart: React.FC<Props> = ({
  period,
  points,
  ticks,
  title = 'Weight trend',
  unit = 'kg',
  onSelectDay,
}) => {
  const [chartWidth, setChartWidth] = useState(DEFAULT_WIDTH);
  const [selectedPoint, setSelectedPoint] = useState<ProcessedDayPoint | null>(null);

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && Math.abs(width - chartWidth) > 2) {
      setChartWidth(width);
    }
  };

  const chartHeight = 180;
  const paddingLeft = 38;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 26;

  const plotWidth = Math.max(10, chartWidth - paddingLeft - paddingRight);
  const plotHeight = Math.max(10, chartHeight - paddingTop - paddingBottom);

  const minY = ticks.length > 0 ? Math.min(...ticks) : 60;
  const maxY = ticks.length > 0 ? Math.max(...ticks) : 70;
  const yRange = Math.max(0.1, maxY - minY);

  const isMonth = period === 'month';
  const count = points.length;
  const colWidth = plotWidth / Math.max(1, count - 1 || 1);

  // Compute Coordinates for Logged Points
  const loggedCoords: { x: number; y: number; point: ProcessedDayPoint }[] = [];

  points.forEach((point, idx) => {
    if (point.isLogged && point.value != null) {
      const x = paddingLeft + (count === 1 ? plotWidth / 2 : idx * colWidth);
      const normalized = Math.min(1, Math.max(0, (point.value - minY) / yRange));
      const y = paddingTop + (1 - normalized) * plotHeight;
      loggedCoords.push({ x, y, point });
    }
  });

  // Construct SVG Path
  let pathD = '';
  if (loggedCoords.length > 1) {
    pathD = `M ${loggedCoords[0].x} ${loggedCoords[0].y}`;
    for (let i = 1; i < loggedCoords.length; i++) {
      pathD += ` L ${loggedCoords[i].x} ${loggedCoords[i].y}`;
    }
  }

  return (
    <Box
      backgroundColor="backgroundSecondary"
      borderRadius="md"
      p="md"
      mb="md"
      onLayout={onLayout}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
      }}
    >
      {/* Header */}
      <Box mb="xs">
        <Text variant="mdBold" color="textPrimary">
          {title}
        </Text>
        <Text variant="xs" color="textSecondary" mt="xs">
          {selectedPoint ? `${selectedPoint.fullDate}: ${selectedPoint.value} ${unit}` : unit}
        </Text>
      </Box>

      {/* SVG Canvas */}
      <View style={{ width: '100%', height: chartHeight, overflow: 'hidden' }}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Horizontal Grid lines and Y-axis labels */}
          {ticks.map((tickVal, idx) => {
            const normalized = Math.min(1, Math.max(0, (tickVal - minY) / yRange));
            const y = paddingTop + (1 - normalized) * plotHeight;

            return (
              <G key={`tick-${idx}`}>
                <SvgText
                  x={paddingLeft - 8}
                  y={y + 3}
                  fill={theme.colors.SecondaryGrey}
                  fontSize={10}
                  fontWeight="500"
                  textAnchor="end"
                >
                  {tickVal.toFixed(1)}
                </SvgText>
                <Line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke={theme.colors.PrimaryGreyDark}
                  strokeWidth={0.7}
                  strokeDasharray="3, 4"
                  opacity={0.4}
                />
              </G>
            );
          })}

          {/* Base bottom axis line */}
          <Line
            x1={paddingLeft}
            y1={paddingTop + plotHeight}
            x2={chartWidth - paddingRight}
            y2={paddingTop + plotHeight}
            stroke={theme.colors.borderSecondary}
            strokeWidth={1}
            opacity={0.6}
          />

          {/* Line connecting points */}
          {pathD ? (
            <Path
              d={pathD}
              stroke={theme.colors.PrimaryGreen}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {/* Dots on logged coordinates */}
          {loggedCoords.map(({ x, y, point }) => {
            const isSelected = selectedPoint?.dateString === point.dateString;

            return (
              <G key={`dot-${point.dateString}`}>
                {isSelected && (
                  <Circle
                    cx={x}
                    cy={y}
                    r={9}
                    fill={theme.colors.PrimaryGreen}
                    opacity={0.25}
                  />
                )}
                <Circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 6 : 4.5}
                  fill={theme.colors.PrimaryGreen}
                  stroke={theme.colors.PrimaryBlack}
                  strokeWidth={1.5}
                />
              </G>
            );
          })}

          {/* X-axis day labels */}
          {points.map((point, index) => {
            const x = paddingLeft + (count === 1 ? plotWidth / 2 : index * colWidth);
            let showXLabel = true;
            let xLabel = point.dayLetter;

            if (isMonth) {
              showXLabel =
                point.dayNumber === 1 ||
                point.dayNumber % 5 === 0 ||
                point.dayNumber === points.length;
              xLabel = `${point.dayNumber}`;
            }

            if (!showXLabel) return null;

            const isSelected = selectedPoint?.dateString === point.dateString;

            return (
              <SvgText
                key={`xlabel-${point.dateString}`}
                x={x}
                y={chartHeight - 8}
                fill={isSelected ? theme.colors.PrimaryGreen : theme.colors.SecondaryGrey}
                fontSize={isMonth ? 9 : 11}
                fontWeight={isSelected ? 'bold' : 'normal'}
                textAnchor="middle"
              >
                {xLabel}
              </SvgText>
            );
          })}
        </Svg>

        {/* Touch Targets */}
        <View
          style={{
            position: 'absolute',
            left: paddingLeft - 10,
            top: paddingTop,
            width: plotWidth + 20,
            height: plotHeight,
            flexDirection: 'row',
          }}
        >
          {points.map((point) => (
            <TouchableOpacity
              key={`touch-${point.dateString}`}
              style={{ flex: 1 }}
              activeOpacity={0.7}
              onPress={() => {
                setSelectedPoint(point);
                onSelectDay?.(point);
              }}
            />
          ))}
        </View>
      </View>
    </Box>
  );
};

export default HabitLineChart;
