import { Tab } from '@rneui/base';
import React, { useState } from 'react';

import Box from '@components/atoms/Box';
import Button from '@components/atoms/Button';
import Text from '@components/atoms/Text';
import { theme } from '@utils/styles/theme';
import { TrainerPackage } from '@utils/types/trainersTypes';

interface Props {
  packageInfo: TrainerPackage[];
  onButtonPress?: (selectedPackage: string) => void;
}

const PricingPlanCard: React.FC<Props> = ({ packageInfo, onButtonPress }) => {
  const [index, setIndex] = useState<number>(0);
  const [selectedPackage, setSelectedPackage] = useState<string>(
    packageInfo[0]?.name
  );

  const getTextColor = (itemIndex: number) => {
    return index === itemIndex
      ? theme.colors.PrimaryBlack
      : theme.colors.PrimaryBlack;
  };

  const handleTabChange = (index: number) => {
    setIndex(index);
    setSelectedPackage(packageInfo[index]?.name);
  };

  return (
    <Box
      overflow="hidden"
      borderRadius="sm"
      backgroundColor="backgroundSecondary"
      width="100%"
    >
      {packageInfo.length === 0 ? (
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          p="md"
          gap="md"
        >
          <Text>No packages found</Text>
        </Box>
      ) : (
        <>
          <Tab
            value={index}
            onChange={handleTabChange}
            indicatorStyle={{
              zIndex: 1,
              width: `${100 / packageInfo.length}%`,
              height: '100%',
              backgroundColor: theme.colors.PrimaryGreen,
            }}
            style={{ backgroundColor: 'white' }}
          >
            {packageInfo.map((pkg, pkgIndex) => (
              <Tab.Item
                key={pkgIndex}
                containerStyle={{
                  position: 'relative',
                  zIndex: 2,
                }}
                titleStyle={{
                  color: getTextColor(pkgIndex),
                  zIndex: 3,
                  position: 'relative',
                  padding: 1,
                }}
                title={
                  <Text
                    style={{
                      color: getTextColor(pkgIndex),
                      zIndex: 3,
                      position: 'relative',
                    }}
                  >
                    {pkg.name}
                  </Text>
                }
              />
            ))}
          </Tab>

          <Box p="md" gap="md">
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text variant="md">
                {packageInfo[index]?.trainingPeriod} months
              </Text>
              <Text color="PrimaryGreen" variant="mdBold">
                Rs. {packageInfo[index]?.price}
              </Text>
            </Box>

            <Box>
              <Text color="textSecondary">
                {packageInfo[index]?.packageBrief}
              </Text>
            </Box>

            <Button
              title="Continue"
              onPress={() => onButtonPress && onButtonPress(selectedPackage)}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default PricingPlanCard;
