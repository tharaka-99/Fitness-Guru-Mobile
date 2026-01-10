import { MapPin, Dumbbell, CreditCard } from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';

import PageHeader from '@components/app/header/PageHeader';
import PageWrapper from '@components/app/PageWrapper';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { MyTabNavigatorScreenProps } from '@navigation/types';
import { constants, theme } from '@utils/styles/theme';
import SettingsBox from '../components/settings-box';
import { authActions } from '@features/auth/context/slice';
import ProfileHeaderCard from '@components/app/ProfileHeaderCard';
import { useQuery } from 'react-query';
import { getClientProfileInfo } from '@utils/services/authServices';
import { Button, Dialog, Portal } from 'react-native-paper';

const AccountScreen: React.FC<MyTabNavigatorScreenProps<'Account'>> = ({
  navigation,
}) => {
  const dispatch = useDispatch();
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const handleSignOut = async () => {
    dispatch(authActions.clearAuth());
  };

  const handleDeleteAccount = async () => {
    // Call API to delete account or handle logic here
    console.log('Account deleted');
    setIsDialogVisible(false);
    dispatch(authActions.clearAuth());
  };

  const {
    isLoading: isProfileLoading,
    data: profile,
    refetch: profileRefetch,
  } = useQuery('profile', getClientProfileInfo);

  return (
    <PageWrapper>
      <PageHeader title="Account" />

      <ProfileHeaderCard
        image={profile?.profileImageFileUrl || ''}
        name={`${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`}
        details={[
          {
            icon: ({ color, size }) => (
              <MapPin color={color} size={size + 1} />
            ),
            value: profile?.city ?? 'location loading...',
          },
          {
            icon: ({ color, size }) => (
              <Dumbbell color={color} size={size - 4} />
            ),
            value: profile?.mobileNumber ?? 'not set yet',
          },
        ]}
        isEditLink={true}
      />

      <Box gap="md" mt="md">
        <SettingsBox.Group>
          <SettingsBox.Item
            isLastItem
            title="My Subscription"
            onPress={() => navigation.navigate('PricingPackages')}
            icon={({ color, size }) => (
              <CreditCard color={color} size={size} />
            )}
          />
        </SettingsBox.Group>
      </Box>

      <Box
        left={0}
        right={0}
        bottom={20}
        position="absolute"
        alignItems="center"
        justifyContent="center"
      >
        <TouchableOpacity
          activeOpacity={constants.activeOpacity}
          onPress={() => setIsDialogVisible(true)}
          style={{
            borderColor: theme.colors.PrimaryRed,
            borderWidth: 1,
            borderRadius: 5,
            width: '60%',
          }}
        >
          <Text
            px="base"
            py="base"
            variant="md"
            textAlign="center"
            color="PrimaryRed"
          >
            Delete my account
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={constants.activeOpacity}
          onPress={handleSignOut}
        >
          <Text
            px="base"
            py="base"
            variant="md"
            textAlign="center"
            color="PrimaryGreen"
          >
            Sign Out
          </Text>
        </TouchableOpacity>
      </Box>

      <Portal>
        <Dialog
          visible={isDialogVisible}
          onDismiss={() => setIsDialogVisible(false)}
        >
          <Dialog.Title>Delete Account</Dialog.Title>
          <Dialog.Content>
            <Text variant="md" textAlign="left" color="textPrimary">
              Deleting your account will permanently remove all your data,
              including your profile, subscriptions, and any associated
              information. This action cannot be undone. Are you sure you want
              to proceed?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
            <Button
              color={theme.colors.PrimaryRed}
              onPress={handleDeleteAccount}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </PageWrapper>
  );
};

export default AccountScreen;
