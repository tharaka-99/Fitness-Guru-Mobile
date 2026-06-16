import { CreditCard, ChevronRight, Crown, User, Shield, HelpCircle, Trash2, LogOut, Clock, Calendar } from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity, ScrollView, Image, Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import useSubscription from '@features/subscription/hooks/useSubscription';

import PageHeader from '@components/app/header/PageHeader';
import PageWrapper from '@components/app/PageWrapper';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { MyTabNavigatorScreenProps } from '@navigation/types';
import { constants, theme } from '@utils/styles/theme';
import { authActions } from '@features/auth/context/slice';
import { capitalizeString } from '@utils/helpers';
import { useQuery } from '@tanstack/react-query';
import { getClientProfileInfo } from '@utils/services/authServices';
import { Button as PaperButton, Dialog, Portal } from 'react-native-paper';
import { RootState } from '@/store';

const AccountScreen: React.FC<MyTabNavigatorScreenProps<'Account'>> = ({
  navigation,
}) => {
  const dispatch = useDispatch();
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const user = useSelector((state: RootState) => state['feature/auth'].user);
  const { isSubscribed, customerInfo } = useSubscription();

  const handleSignOut = async () => {
    dispatch(authActions.clearAuth());
  };

  const handleDeleteAccount = async () => {
    setIsDialogVisible(false);
    dispatch(authActions.clearAuth());
  };

  const {
    data: profile,
  } = useQuery(
    {
      queryKey: ["profile"],
      queryFn: getClientProfileInfo
    }
  );

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL", err)
    );
  };


  const defaultImage = require("../../../../assets/images/profile.png");
  const displayEmail = profile?.email || user?.email || "";
  const displayMobile = profile?.mobileNumber || user?.mobileNumber || "";

  const planName = customerInfo?.entitlements.active['Premium access']?.periodType === 'TRIAL'
    ? 'Free Trial'
    : customerInfo?.entitlements.active['Premium access']?.productIdentifier.includes('monthly')
      ? 'Premium Monthly'
      : 'Premium';

  const expirationDate = customerInfo?.entitlements.active['Premium access']?.expirationDate
    ? new Date(customerInfo.entitlements.active['Premium access']!.expirationDate!).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
    : 'Active';

  return (
    <PageWrapper noBottomPadding>
      <PageHeader title="Account" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Box flex={1} justifyContent="space-between">
          <Box>
            {/* Profile Section */}
            <Box alignItems="center" my="md">
              <Box

                mb="sm"
                width={100}
                height={100}
                borderRadius="full"
                overflow="hidden"
              >
                {profile?.profileImageFileUrl || user?.profileImageFileUrl ? (
                  <Image
                    source={{ uri: profile?.profileImageFileUrl || user?.profileImageFileUrl || "" }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                ) : (
                  <Box
                    width={100}
                    height={100}
                    borderRadius="full"
                    backgroundColor="SecondaryGrey"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text variant="2xlBold" color="PrimaryWhite">
                      {(capitalizeString(profile?.firstName?.[0] ?? "") ||
                        capitalizeString(user?.firstName?.[0] ?? "") ||
                        "") +
                        (capitalizeString(profile?.lastName?.[0] ?? "") ||
                          capitalizeString(user?.lastName?.[0] ?? "") ||
                          "")}
                    </Text>
                  </Box>
                )

                }
              </Box>
              <Text variant="mdBold" color="textPrimary" mb="xs">
                {profile?.firstName ? `${profile.firstName} ${profile.lastName ?? ""}` : user?.firstName ? `${user.firstName} ${user.lastName ?? ""}` : "User"}
              </Text>
              {displayEmail || displayMobile ? (
                <Text variant="sm" color="textSecondary" textAlign="center">
                  {displayEmail}
                  {displayEmail && displayMobile ? " | " : ""}
                  {displayMobile}
                </Text>
              ) : null}

            </Box>

            {/* Subscription Section */}
            {isSubscribed ? (
              <Box
                backgroundColor="PrimaryGreen"
                borderRadius="sm"
                p="md"
                mb="xl"
              >
                {/* Main Header Row */}
                <Box flexDirection="row" gap="sm" alignItems="flex-start" mb="sm">
                  {/* Left Crown Icon */}
                  <Box
                    width={36}
                    height={36}
                    borderRadius="full"
                    backgroundColor="PrimaryBlack"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Crown color={theme.colors.PrimaryGreen} size={20} />
                  </Box>

                  {/* Right Content Column */}
                  <Box flex={1}>
                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="xs">
                      <Text variant="smBold" color="textPrimaryBlack">My Subscription</Text>

                      {/* Premium Badge */}
                      <Box
                        backgroundColor="PrimaryBlack"
                        px="sm"
                        py="xs"
                        borderRadius="xs"
                      >
                        <Text variant="xs" color="PrimaryGreen" fontWeight="bold">Premium</Text>
                      </Box>
                    </Box>

                    {/* Description */}
                    <Text variant="xs" color="textPrimaryBlack" style={{ opacity: 0.85 }}>
                      You are subscribed to Fitness Guru Premium. Enjoy full access to all features.
                    </Text>
                  </Box>
                </Box>

                {/* Inner Details Container */}
                <Box
                  backgroundColor="PrimaryBlack"
                  borderRadius="sm"
                  p="xs"
                  flexDirection="row"
                  alignItems="center"
                >
                  {/* Active Plan */}
                  <Box flex={1} alignItems="center" justifyContent="center" mb="xs">
                    <Box
                      width={28}
                      height={28}
                      borderRadius="full"
                      backgroundColor="backgroundSecondary"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Clock color={theme.colors.PrimaryGreen} size={16} />
                    </Box>
                    <Text variant="xs" color="textSecondary">Active Plan</Text>
                    <Text variant="smBold" color="PrimaryGreen" textAlign="center">
                      {planName}
                    </Text>
                  </Box>

                  {/* Vertical Divider */}
                  <Box width={1} height={40} backgroundColor="borderSecondary" mx="sm" />

                  {/* Next Renewal */}
                  <Box flex={1} alignItems="center" justifyContent="center" mb="xs">
                    <Box
                      width={28}
                      height={28}
                      borderRadius="full"
                      backgroundColor="backgroundSecondary"
                      alignItems="center"
                      justifyContent="center"

                    >
                      <Calendar color={theme.colors.PrimaryGreen} size={16} />
                    </Box>
                    <Text variant="xs" color="textSecondary">Next Renewal</Text>
                    <Text variant="smBold" color="PrimaryGreen" textAlign="center">
                      {expirationDate}
                    </Text>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box
                backgroundColor="backgroundSecondary"
                borderRadius="sm"
                p="md"
                mb="xl"
              >
                {/* Main Header Row */}
                <Box flexDirection="row" gap="md" alignItems="flex-start" mb="md">
                  {/* Left Crown Icon */}
                  <Box
                    width={36}
                    height={36}
                    borderRadius="full"
                    style={{ backgroundColor: 'rgba(160, 226, 32, 0.15)' }}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Crown color={theme.colors.PrimaryGreen} size={20} />
                  </Box>

                  {/* Right Content Column */}
                  <Box flex={1}>
                    <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="xs">
                      <Text variant="smBold" color="textPrimary">My Subscription</Text>

                      {/* Plan Badge */}
                      <Box
                        backgroundColor="borderSecondary"
                        px="sm"
                        py="xs"
                        borderRadius="xs"
                      >
                        <Text variant="xs" color="textSecondary">
                          Free Plan
                        </Text>
                      </Box>
                    </Box>

                    {/* Description */}
                    <Text variant="xs" color="textSecondary">
                      You are not currently subscribed to any plan. Upgrade now to get full access to all features.
                    </Text>
                  </Box>
                </Box>

                {/* Action Button */}
                <TouchableOpacity
                  activeOpacity={constants.activeOpacity}
                  onPress={() => navigation.navigate('PricingPackages')}
                  style={{
                    backgroundColor: theme.colors.PrimaryGreen,
                    borderRadius: theme.borderRadii.sm,
                    paddingVertical: theme.spacing.sm,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Crown color={theme.colors.textPrimaryBlack} size={20} />
                  <Text color="textPrimaryBlack" variant="smBold">
                    Upgrade to Premium
                  </Text>
                </TouchableOpacity>
              </Box>
            )}

            {/* Menu Options Group */}
            <Box
              backgroundColor="backgroundSecondary"
              borderRadius="sm"
              mb="xl"
              overflow="hidden"
            >
              {/* Personal Information */}
              <TouchableOpacity
                activeOpacity={constants.activeOpacity}
                onPress={() => navigation.navigate('PersonalInfo')}
              >
                <Box
                  flexDirection="row"
                  alignItems="center"
                  pl="md"
                  pr="md"
                  style={{ paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: theme.colors.borderSecondary }}
                >
                  <Box flexDirection="row" alignItems="center" gap="md" flex={1}>
                    <User color={theme.colors.PrimaryGreen} size={20} />
                    <Text variant="sm">Personal Information</Text>
                  </Box>
                  <ChevronRight color={theme.colors.textSecondary} size={18} />
                </Box>
              </TouchableOpacity>

              {/* Privacy & Security */}
              <TouchableOpacity
                activeOpacity={constants.activeOpacity}
                onPress={() =>
                  openLink("https://www.fitnessgurulk.com/privacy-policy")
                }
              >
                <Box
                  flexDirection="row"
                  alignItems="center"
                  pl="md"
                  pr="md"
                  style={{ paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: theme.colors.borderSecondary }}
                >
                  <Box flexDirection="row" alignItems="center" gap="md" flex={1}>
                    <Shield color={theme.colors.PrimaryGreen} size={20} />
                    <Text variant="sm">Privacy & Security</Text>
                  </Box>
                  <ChevronRight color={theme.colors.textSecondary} size={18} />
                </Box>
              </TouchableOpacity>

              {/* Help & Support */}
              <TouchableOpacity
                activeOpacity={constants.activeOpacity}
                onPress={() => openLink("mailto:contact@fitnessgurulk.com")}
              >
                <Box
                  flexDirection="row"
                  alignItems="center"
                  pl="md"
                  pr="md"
                  style={{ paddingVertical: 10 }}
                >
                  <Box flexDirection="row" alignItems="center" gap="md" flex={1}>
                    <HelpCircle color={theme.colors.PrimaryGreen} size={20} />
                    <Text variant="sm">Help & Support</Text>
                  </Box>
                  <ChevronRight color={theme.colors.textSecondary} size={18} />
                </Box>
              </TouchableOpacity>
            </Box>
          </Box>

          {/* Bottom Actions */}
          <Box gap="md" pt="sm" pb="lg">

            <TouchableOpacity
              activeOpacity={constants.activeOpacity}
              onPress={handleSignOut}
              style={{
                borderColor: theme.colors.borderSecondary,
                borderWidth: 1,
                borderRadius: theme.borderRadii.sm,
                paddingVertical: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "transparent",
              }}
            >
              <LogOut color={theme.colors.PrimaryGreen} size={20} />
              <Text color="PrimaryGreen" variant="smBold">
                Sign Out
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={constants.activeOpacity}
              onPress={() => setIsDialogVisible(true)}
              style={{
                borderColor: theme.colors.PrimaryRed,
                borderWidth: 1,
                borderRadius: theme.borderRadii.sm,
                paddingVertical: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "transparent",
              }}
            >
              <Trash2 color={theme.colors.PrimaryRed} size={20} />
              <Text color="PrimaryRed" variant="smBold">
                Delete my account
              </Text>
            </TouchableOpacity>
          </Box>
        </Box>

      </ScrollView>

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




