import React from 'react';
import { Image, Dimensions } from 'react-native';

import Box from '@components/atoms/Box';
import Button from '@components/atoms/Button';
import Text from '@components/atoms/Text';

interface InfoCardProps {
  imageSource: any;
  title?: string;
  description: string;
  buttonTitle?: string;
  buttonOnPress?: () => void;
}

// Get screen height
const { height: screenHeight } = Dimensions.get('window');

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  imageSource,
  buttonTitle,
  buttonOnPress,
}) => {
  return (
    <Box
      backgroundColor="backgroundSecondary"
      p="md"
      borderRadius="sm"
      flexGrow={1}
    >
      <Box
        py="lg"
        px="lg"
        borderWidth={1}
        borderRadius="sm"
        borderStyle="dashed"
        borderColor="textSecondary"
        flex={1}
      >
        <Box alignItems="center" gap="md" flex={1} justifyContent="center">
          <Image
            resizeMode="contain"
            source={imageSource}
            style={{ height: 100, width: 100 }}
          />

          {title && (
            <Text variant="xlBold" textAlign="center" color="PrimaryGreen">
              {title}
            </Text>
          )}

          <Text color="textSecondary" textAlign="center">
            {description}
          </Text>
        </Box>

        {buttonTitle && (
          <Box mt="lg">
            <Button title={buttonTitle} onPress={buttonOnPress} />
          </Box>
        )}
      </Box>
    </Box>
  );
};


export default InfoCard;
