import React from 'react';
import { View, StyleSheet } from 'react-native';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { Divider } from 'react-native-paper';
import { LogEntryDto, LogResponseDto } from '@utils/types/analyticsTypes';
import { Unit } from '@utils/types/types';

interface Props {
  tableData: LogResponseDto[];
}

const WorkoutSummaryTable: React.FC<Props> = ({ tableData }) => {
  const renderSetsData = (data: LogEntryDto, entryIndex: number) => {
    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(data.logDate));

    return (
      <Box key={`${data.logDate}-${entryIndex}`} mt="md">
        <Text variant="md" color="PrimaryWhite" mb="sm">
          {formattedDate.toUpperCase()}
        </Text>
        <Box bg="PrimaryGrey" borderRadius="sm" p="md">
          {data.logSets?.map((set, index) => (
            <Box key={index}>
              <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                mb="sm"
              >
                <Text variant="md" color="PrimaryWhite">
                  SET {set.setNo}
                </Text>
                <Text variant="md" color="SecondaryGrey">
                  {set.totalReps} REPS
                </Text>
                <Text variant="md" color="PrimaryGreen">
                  {set.totalWeight}
                  {set?.unit === Unit.Metric ? ' KG' : ' Lbs'}
                </Text>
              </Box>
              <Divider style={styles.divider} />
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <View>{tableData.map((entry, index) => renderSetsData(entry, index))}</View>
  );
};

export default WorkoutSummaryTable;

const styles = StyleSheet.create({
  divider: {
    marginVertical: 10,
    height: 1.5,
  },
});
