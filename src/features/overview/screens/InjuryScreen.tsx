import React from 'react';
import { Image, TouchableOpacity } from 'react-native';

import PageHeader from '@components/app/header/PageHeader';
import PageWrapper from '@components/app/PageWrapper';
import Box from '@components/atoms/Box';
import Button from '@components/atoms/Button';
import Text from '@components/atoms/Text';
import { MyStackNavigatorScreenProps } from '@navigation/types';
import UserNameWithAvatar from '../components/onboard/UserNameWithAvatar';
import { store } from '@/store';
import { authActions } from '@features/auth/context/slice';
import { Icon } from 'react-native-paper';
import { theme } from '@utils/styles/theme';

const InjuryScreen: React.FC<MyStackNavigatorScreenProps<'Injury'>> = ({
  navigation,
}) => {
  const handleTrainWithFitnessGuru = () => {
    store.dispatch(authActions.setIsInjured(true));
    navigation.navigate('PricingPackages');
  };

  const handleSearchTrainers = () => {
    navigation.navigate('Tab', { screen: 'MyTrainer' });
  };

  return (
    <PageWrapper>
      <Box flexDirection="row" alignItems="center" gap="md">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
            >
              <Icon
                source="arrow-left"
                size={30}
                color={theme.colors.PrimaryGreen}
              />
            </TouchableOpacity>
            <UserNameWithAvatar />
          </Box>
      <Box flex={1} alignItems="center" justifyContent="center">
        <Image
          source={require('assets/images/sadface.png')}
          style={{ width: 150, height: 150 }}
          resizeMode="contain"
        />

        <Text
          mt="lg"
          variant="lgBold"
          textAlign="center"
          textTransform="uppercase"
        >
          Sorry we have to stop you here {'\n'} as we care about your health.
        </Text>

        <Box gap="lg" mt="2xl">
          <Text color="textSecondary" textAlign="center">
            FITNESS GURU do not provide workout routines and meal plans for
            clients who are having health issues or injuries.
          </Text>

          <Text color="textSecondary" textAlign="center">
            We highly recommend you to get the help of our professional trainers
            to guide you through your fitness journey.
          </Text>
        </Box>

        <Box gap="base" mt="2xl" width="100%">
          <Button
            title="Train with Fitness Guru"
            onPress={handleTrainWithFitnessGuru}
          />
          <Button
            type="outline"
            title="Search Trainers"
            onPress={handleSearchTrainers}
          />
        </Box>
      </Box>
    </PageWrapper>
  );
};

export default InjuryScreen;
