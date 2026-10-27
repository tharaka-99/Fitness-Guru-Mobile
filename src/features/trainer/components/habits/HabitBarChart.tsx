import React, { useState } from 'react';
import { View, LayoutChangeEvent, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Line, Rect, Text as SvgText, G } from 'react-native-svg';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { theme } from '@utils/styles/theme';
import { HabitType } from '@utils/types/habitTypes';
import { ProcessedDayPoint } from '../../hooks/useHabitHistory';

interface Props {
  habitType: HabitType;
  period: 'week' | 'month';
  points: ProcessedDayPoint[];
  targetValue: number;
  ticks: number[];
  maxY: number;
  title: string;
  unitRight?: string;
  onSelectDay?: (point: ProcessedDayPoint) => void;
}

const DEFAULT_WIDTH = Dimensions.get('window').width - 32;

export const HabitBarChart: React.FC<Props> = ({
  habitType,
  period,
  points,
  targetValue,
  ticks,
  maxY,
  title,
  unitRight,
  onSelectDay,
}) => {
  const [chartWidth, setChartWidth] = useState(DEFAULT_WIDTH);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && Math.abs(width - chartWidth) > 2) {
      setChartWidth(width);
    }
  };

  const chartHeight = 180;
  const paddingLeft = habitType === 'steps' ? 44 : 36;
  const paddingRight = 16;
  const paddingTop = 26;
  const paddingBottom = 26;

  const plotWidth = Math.max(10, chartWidth - paddingLeft - paddingRight);
  const plotHeight = Math.max(10, chartHeight - paddingTop - paddingBottom);

  // Goal Line Y
  const goalY =
    targetValue > 0 && maxY > 0
      ? paddingTop + (1 - Math.min(1, targetValue / maxY)) * plotHeight
      : null;

  // Format goal text based on habit type
  const formatGoalLabel = () => {
    if (habitType === 'sleep') return `Goal ${targetValue}h`;
    if (habitType === 'water') return `Goal ${targetValue} L`;
    if (habitType === 'steps') return `Goal ${targetValue.toLocaleString()}`;
    return `Goal ${targetValue}`;
  };

  // Format bar top label
  const formatBarLabel = (point: ProcessedDayPoint) => {
    if (!point.isLogged || point.value == null || point.value === 0) return '';
    if (habitType === 'sleep') {
      return `${point.value}h`;
    }
    if (habitType === 'water') {
      return point.value.toFixed(1);
    }
    if (habitType === 'steps') {
      return point.value >= 1000 ? Math.round(point.value).toLocaleString() : `${point.value}`;
    }
    return `${point.value}`;
  };

  const isMonth = period === 'month';
  const count = points.length;
  const colWidth = plotWidth / Math.max(1, count);
  const barWidth = isMonth ? Math.max(4, colWidth * 0.65) : Math.max(18, Math.min(32, colWidth * 0.62));

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
      <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="sm">
        <Text variant="mdBold" color="textPrimary">
          {title}
        </Text>
        {unitRight && (
          <Text variant="xs" color="textSecondary">
            {unitRight}
          </Text>
        )}
      </Box>

      {/* SVG Canvas */}
      <View style={{ width: '100%', height: chartHeight, overflow: 'hidden' }}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Horizontal Grid lines and Y-axis labels */}
          {ticks.map((tickVal, idx) => {
            const y = paddingTop + (1 - Math.min(1, Math.max(0, tickVal / maxY))) * plotHeight;
            let tickLabel = `${tickVal}`;
            if (habitType === 'steps' && tickVal >= 1000) {
              tickLabel = `${tickVal}`;
            }

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
                  {tickLabel}
                </SvgText>
                <Line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke={theme.colors.PrimaryGreyDark}
                  strokeWidth={0.7}
                  strokeDasharray="2, 4"
                  opacity={0.4}
                />
              </G>
            );
          })}

          {/* Goal Line (Dashed Green) */}
          {goalY !== null && goalY >= paddingTop && goalY <= paddingTop + plotHeight && (
            <G>
              <Line
                x1={paddingLeft}
                y1={goalY}
                x2={chartWidth - paddingRight}
                y2={goalY}
                stroke={theme.colors.PrimaryGreen}
                strokeWidth={1.5}
                strokeDasharray="4, 4"
                opacity={0.9}
              />
              <SvgText
                x={chartWidth - paddingRight - 20}
                y={goalY - 6}
                fill={theme.colors.PrimaryGreen}
                fontSize={10}
                fontWeight="700"
                textAnchor="end"
              >
                {formatGoalLabel()}
              </SvgText>
            </G>
          )}

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

          {/* Bars */}
          {points.map((point, index) => {
            const centerX = paddingLeft + index * colWidth + colWidth / 2;
            const barX = centerX - barWidth / 2;
            const val = point.value ?? 0;
            const clampedVal = Math.min(maxY, Math.max(0, val));
            const barHeight = maxY > 0 ? (clampedVal / maxY) * plotHeight : 0;
            const barY = paddingTop + plotHeight - barHeight;
            const isSelected = selectedDate === point.dateString;

            // X-axis label: Day letter for week, or sparse day numbers for month
            let xLabel = point.dayLetter;
            let showXLabel = true;
            if (isMonth) {
              // Show label on 1st, 5th, 10th, 15th, 20th, 25th, last
              showXLabel =
                point.dayNumber === 1 ||
                point.dayNumber % 5 === 0 ||
                point.dayNumber === points.length;
              xLabel = `${point.dayNumber}`;
            }

            const barLabel = formatBarLabel(point);

            return (
              <G key={`bar-${point.dateString}-${index}`}>
                {/* Bar */}
                {point.isLogged && barHeight > 2 ? (
                  <Rect
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    rx={Math.min(6, barWidth / 2)}
                    ry={Math.min(6, barWidth / 2)}
                    fill={theme.colors.PrimaryGreen}
                    opacity={isSelected ? 1 : 0.95}
                  />
                ) : (
                  // Empty day placeholder dot/dash
                  <Rect
                    x={barX + barWidth / 2 - 2}
                    y={paddingTop + plotHeight - 3}
                    width={4}
                    height={3}
                    rx={1.5}
                    ry={1.5}
                    fill={theme.colors.PrimaryGreyDark}
                  />
                )}

                {/* Top Value Label (for Week mode or when selected) */}
                {(!isMonth || isSelected) && barLabel ? (
                  <SvgText
                    x={centerX}
                    y={Math.max(14, barY - 5)}
                    fill={theme.colors.PrimaryWhite}
                    fontSize={isMonth ? 9 : 10}
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {barLabel}
                  </SvgText>
                ) : null}

                {/* X Axis Label */}
                {showXLabel && (
                  <SvgText
                    x={centerX}
                    y={chartHeight - 8}
                    fill={isSelected ? theme.colors.PrimaryGreen : theme.colors.SecondaryGrey}
                    fontSize={isMonth ? 9 : 11}
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="middle"
                  >
                    {xLabel}
                  </SvgText>
                )}
              </G>
            );
          })}
        </Svg>

        {/* Touch overlay to tap bars */}
        <View
          style={{
            position: 'absolute',
            left: paddingLeft,
            top: paddingTop,
            width: plotWidth,
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
                setSelectedDate(point.dateString);
                onSelectDay?.(point);
              }}
            />
          ))}
        </View>
      </View>
    </Box>
  );
};

export default HabitBarChart;
