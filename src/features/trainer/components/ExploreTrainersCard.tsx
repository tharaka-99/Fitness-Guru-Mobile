import React, { useState } from 'react';
import { Image, TouchableOpacity } from 'react-native';

import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { constants, theme } from '@utils/styles/theme';
import { TrainingFor } from '@utils/types/trainersTypes';
import { User } from 'lucide-react-native';

interface ExploreTrainersCardProps {
  name: string;
  width: number;
  image: string | null;
  onPress?: () => void;
  yearsOfExperience: number;
  genderOfClients: TrainingFor;
}

const ExploreTrainersCard: React.FC<ExploreTrainersCardProps> = ({
  name,
  image,
  width,
  onPress,
  yearsOfExperience,
  genderOfClients,
}) => {
  const [loading, setLoading] = useState(true);

  const genTagLabel = () => {
    switch (genderOfClients) {
      case TrainingFor.Men:
        return 'Men';
      case TrainingFor.Women:
        return 'Women';
      case TrainingFor.MenAndWomen:
        return 'Men & Women';
      default:
        return 'Men';
    }
  };
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={constants.activeOpacity}>
      <Box
        flex={1}
        p="base"
        borderRadius="sm"
        alignItems="center"
        backgroundColor="backgroundSecondary"
        width={width}
      >
        <Image
          resizeMode="cover"
          source={
            image
              ? { uri: image }
              : require('../../../../assets/images/trainer-with-form.png')
          }
          style={{
            width: 60,
            height: 60,
            borderRadius: theme.borderRadii.full,
          }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />

        <Text
          mt="sm"
          variant="mdBold"
          numberOfLines={1}
          style={{ textTransform: 'capitalize' }}
        >
          {name}
        </Text>

        <Text numberOfLines={2}>
          {yearsOfExperience && yearsOfExperience === 1
            ? '1 Year Experience'
            : `${yearsOfExperience} Years Experience`}
        </Text>

        <Box
          py="sm"
          px="sm"
          mt="sm"
          width="80%"
          borderRadius="sm"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
        >
          {genderOfClients === TrainingFor.Men && (
            <User size={24} color="lightblue" />
          )}
          {genderOfClients === TrainingFor.Women && (
            <User size={24} color="pink" />
          )}
          {genderOfClients === TrainingFor.MenAndWomen && (
            <>
              <User
                size={24}
                color="lightblue"
                style={{ marginRight: 8 }}
              />
              <User size={24} color="pink" />
            </>
          )}
        </Box>

        <Box
          mt="sm"
          px="xs"
          py="xs"
          width="100%"
          borderWidth={4}
          borderRadius="xs"
          borderColor="PrimaryGreen"
          backgroundColor="PrimaryGreen"
        >
          <Text
            variant="smBold"
            textAlign="center"
            color="PrimaryBlack"
            style={{ flexWrap: 'wrap' }}
          >
            Compare Packages
          </Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

export default ExploreTrainersCard;
