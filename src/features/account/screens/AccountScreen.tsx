import { MapPin, Dumbbell, CreditCard, ChevronRight, Phone, Mail } from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import Purchases from 'react-native-purchases';
import Toast from 'react-native-toast-message';
import useSubscription from '@features/subscription/hooks/useSubscription';

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
import { Button as PaperButton, Dialog, Portal } from 'react-native-paper';
import Button from '@components/atoms/Button';
import { RootState } from '@/store';
import env from '@utils/env';

const AccountScreen: React.FC<MyTabNavigatorScreenProps<'Account'>> = ({
  navigation,
}) => {
  const dispatch = useDispatch();
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const user = useSelector((state: RootState) => state['feature/auth'].user);
  const { isSubscribed, customerInfo, restorePurchases } = useSubscription();

  const handleSignOut = async () => {
    dispatch(authActions.clearAuth());
  };


  const handleDeleteAccount = async () => {
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
            value: profile?.email ?? 'loading...',
          },
        ]}
        isEditLink={true}
      />


      <Box gap="md" mt="md">
        <SettingsBox.Group>
          {user?.subscription?.status ? (
            <Box px="md" py="md">
              <Box flexDirection="row" alignItems="center" mb="sm">
                <Box width={30} alignItems="center" justifyContent="center" mr="md">
                  <CreditCard color={theme.colors.textPrimary} size={25} />
                </Box>
                <Text>My Subscription</Text>
              </Box>

              <Box>
                <Box flexDirection="row" justifyContent="space-between" mb="xs">
                  <Text variant="sm" color="textSecondary">Plan</Text>
                  <Text variant="sm" fontWeight="500">
                    {customerInfo?.entitlements.active['Premium access']?.periodType === 'TRIAL'
                      ? 'Free Trial'
                      : customerInfo?.entitlements.active['Premium access']?.productIdentifier.includes('monthly')
                        ? 'Premium Monthly'
                        : 'Premium'}
                  </Text>
                </Box>

                {customerInfo?.entitlements.active['Premium access']?.expirationDate && (
                  <Box flexDirection="row" justifyContent="space-between">
                    <Text variant="sm" color="textSecondary">Expires On</Text>
                    <Text variant="sm" fontWeight="500">
                      {new Date(customerInfo.entitlements.active['Premium access']!.expirationDate!).toLocaleDateString()}
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          ) : (
            <Box px="md" py="base">
              <Box flexDirection="row" alignItems="center" mb="md">
                <Box width={30} alignItems="center" justifyContent="center" mr="md">
                  <CreditCard color={theme.colors.textPrimary} size={25} />
                </Box>
                <Text variant="md" fontWeight="bold">My Subscription</Text>
              </Box>
              <Text variant="sm" color="textSecondary" mb="md">
                You are not currently subscribed to any plan. Upgrade now to get full access to all features.
              </Text>
              <TouchableOpacity
                activeOpacity={constants.activeOpacity}
                onPress={() => navigation.navigate('PricingPackages')}
                style={{ marginTop: 5 }}
              >
                <Box flexDirection="row" justifyContent="flex-end" alignItems="center">
                  <Text variant="smBold" color="PrimaryGreen" mr="xs">Upgrade to Premium</Text>

                </Box>
              </TouchableOpacity>
            </Box>
          )}
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
            <PaperButton onPress={() => setIsDialogVisible(false)}>Cancel</PaperButton>
            <PaperButton
              color={theme.colors.PrimaryRed}
              onPress={handleDeleteAccount}
            >
              Delete
            </PaperButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </PageWrapper>
  );
};


export default AccountScreen;



