import React, { useRef } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { theme } from '@utils/styles/theme';
import { Scale, Footprints, Droplets, Moon, Plus, Check, ChevronRight } from 'lucide-react-native';
import { HabitData, LogHabitDto } from '@utils/types/habitTypes';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import HabitLogBottomSheet from './HabitLogBottomSheet';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';

interface Props {
  habits: HabitData[];
  onLogHabit: (data: LogHabitDto) => void;
  isLoading?: boolean;
}

const getHabitIcon = (type: string) => {
  switch (type) {
    case 'weight':
      return <Scale size={20} color={theme.colors.PrimaryGreen} />;
    case 'steps':
      return <Footprints size={20} color={theme.colors.PrimaryGreen} />;
    case 'water':
      return <Droplets size={20} color={theme.colors.PrimaryGreen} />;
    case 'sleep':
      return <Moon size={20} color={theme.colors.PrimaryGreen} />;
    default:
      return <Plus size={20} color={theme.colors.PrimaryGreen} />;
  }
};

const HabitCard: React.FC<{
  habit: HabitData;
  onPressCard: () => void;
  onPressLog: () => void;
}> = ({ habit, onPressCard, onPressLog }) => {
  const isLogged = habit.logged;
  const progressPercent = Math.min(100, Math.max(0, Math.round((habit.progress || 0) * 100)));

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPressCard}>
      <Box
        backgroundColor="backgroundSecondary"
        borderRadius="md"
        p="md"
        mr="md"
        width={160}
        style={{
          justifyContent: 'space-between',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 8,
        }}
      >
        {/* Top Row: Icon and Status Badge */}
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="sm">
          <Box
            width={36}
            height={36}
            borderRadius="full"
            alignItems="center"
            justifyContent="center"
            style={{ backgroundColor: 'rgba(160, 226, 32, 0.2)' }}
          >
            {getHabitIcon(habit.type)}
          </Box>

          <Box
            flexDirection="row"
            alignItems="center"

          >

            <ChevronRight color={theme.colors.textSecondary} size={25} />
          </Box>
        </Box>

        {/* Habit Title */}
        <Text variant="sm" color="textSecondary" style={{ textTransform: 'capitalize' }}>
          {habit.type}
        </Text>

        {/* Metric Display */}
        <Box mt="xs" minHeight={48} justifyContent="center">
          {isLogged ? (
            <Text variant="xlBold" numberOfLines={1}>
              {habit.formattedValue}
            </Text>
          ) : (
            <Text variant="md" color="textSecondary">
              Not logged
            </Text>
          )}

          {habit.formattedTarget ? (
            <Text variant="xs" color="textSecondary" mt="xs">
              Target: {habit.formattedTarget}
            </Text>
          ) : (
            <Text variant="xs" color="textSecondary" mt="xs">
              {habit.type === 'weight' ? 'Daily check-in' : ''}
            </Text>
          )}
        </Box>

        {/* Progress Bar (if target exists) */}
        {habit.targetValue ? (
          <Box mt="xs">
            <Box height={6} backgroundColor="PrimaryGreyDark" borderRadius="full" overflow="hidden">
              <Box
                height="100%"
                width={`${progressPercent}%`}
                backgroundColor="PrimaryGreen"
                borderRadius="full"
              />
            </Box>
            <Box flexDirection="row" justifyContent="flex-end" mt="xs">
              <Text variant="xs" color="textSecondary" style={{ fontSize: 10 }}>
                {progressPercent}%
              </Text>
            </Box>
          </Box>
        ) : (
          <Box height={30} />
        )}

        <Box height={1} backgroundColor="borderSecondary" mt="sm" opacity={0.3} />

        {/* Action Button */}
        <TouchableOpacity
          style={{
            backgroundColor: isLogged ? theme.colors.PrimaryBlack : theme.colors.SecondaryWhite,
            paddingVertical: 8,
            borderRadius: 20,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 12,
            borderWidth: isLogged ? 1 : 0,
            borderColor: theme.colors.borderSecondary,
          }}
          onPress={onPressLog}
        >
          <Plus
            size={16}
            color={isLogged ? theme.colors.PrimaryWhite : theme.colors.PrimaryBlack}
          />
          <Text
            variant="smBold"
            ml="xs"
            style={{
              color: isLogged ? theme.colors.PrimaryWhite : theme.colors.textPrimaryBlack,
            }}
          >
            {isLogged ? 'Update' : 'Log'}
          </Text>
        </TouchableOpacity>
      </Box>
    </TouchableOpacity>
  );
};

const DailyHabitsSection: React.FC<Props> = ({ habits, onLogHabit, isLoading }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const sheetRef = useRef<BottomSheetModalMethods | null>(null);
  const [selectedHabit, setSelectedHabit] = React.useState<HabitData | null>(null);

  const handleOpenSheet = (habit: HabitData) => {
    setSelectedHabit(habit);
    sheetRef.current?.present();
  };

  const handleSave = (dto: LogHabitDto) => {
    onLogHabit(dto);
    sheetRef.current?.dismiss();
  };

  return (
    <Box px="md" mb="md">
      <Text variant="lgBold" mb="md">
        Daily Habits
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {habits.map((habit) => (
          <HabitCard
            key={habit.type}
            habit={habit}
            onPressCard={() =>
              navigation.navigate('HabitHistory', { habitType: habit.type })
            }
            onPressLog={() => handleOpenSheet(habit)}
          />
        ))}
      </ScrollView>

      {selectedHabit && (
        <HabitLogBottomSheet
          bottomSheetRef={sheetRef}
          habit={selectedHabit}
          onSave={handleSave}
          isLoading={isLoading}
        />
      )}
    </Box>

  );
};

export default DailyHabitsSection;
