import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import PageHeader from '@components/app/header/PageHeader';
import PageWrapper from '@components/app/PageWrapper';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { store } from '@/store';
import { capitalizeString } from '@utils/helpers';
import Button from '@components/atoms/Button';
import { uploadProfileImage } from '@utils/services/authServices';
import Toast from 'react-native-toast-message';
import { authActions } from '@features/auth/context/slice';

const PersonalInfoScreen: React.FC = () => {
  const { user } = store.getState()['feature/auth'];
  const defaultImage = require('../../../../assets/images/profile.png');

  const [profileImage, setProfileImage] = useState<string | undefined>(
    user?.profileImageFileUrl
  );
  const [newImageUri, setNewImageUri] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // Sync profile image with the store's updated URL when component mounts or user data changes
  useEffect(() => {
    setProfileImage(user?.profileImageFileUrl);
  }, [user?.profileImageFileUrl]);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setNewImageUri(result.assets[0].uri);
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!newImageUri) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', {
      uri: newImageUri,
      name: 'profile.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await uploadProfileImage(formData);
      store.dispatch(
        authActions.setProfileImage(response?.data?.profileImageFileUrl)
      );
      Toast.show({
        type: 'success',
        text1: 'Profile photo updated!',
        text2: 'Profile photo updated successfully.',
      });
      setNewImageUri(undefined);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error ',
        text2: 'Error updating profile',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <PageHeader title="Profile" />
      <Box flex={1} alignItems="center" padding="sm">
        <TouchableOpacity
          onPress={handleImagePick}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Image
            source={profileImage ? { uri: profileImage } : defaultImage}
            style={{ width: 140, height: 140, borderRadius: 100 }}
          />
          <Text mt="xs" color="PrimaryGreen">
            Change Profile Picture
          </Text>
        </TouchableOpacity>

        {newImageUri && (
          <Box width={'50%'} height={'2%'} m="base">
            <Button
              onPress={handleSave}
              title="Save Changes"
              type="outline"
              isLoading={loading}
            />
          </Box>
        )}

        <Box width="100%" mt="2xl">
          <Text variant="xl" fontWeight="bold" textAlign="center" mb="md">
            Personal Information
          </Text>

          <Text
            style={{ padding: 10, borderBottomWidth: 1 }}
            color="SecondaryGrey"
          >
            User Name :{' '}
            <Text variant="md">
              {capitalizeString(user?.firstName + ' ' + user?.lastName)}
            </Text>
          </Text>

          <Text
            style={{ padding: 10, borderBottomWidth: 1 }}
            color="SecondaryGrey"
          >
            User Goal :{' '}
            <Text variant="md">
              {capitalizeString(user?.fitnessInfo?.goal ?? 'Your goal')}
            </Text>
          </Text>
        </Box>
      </Box>
    </PageWrapper>
  );
};

export default PersonalInfoScreen;
