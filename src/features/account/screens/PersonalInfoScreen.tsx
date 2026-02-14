import React, { useState, useEffect } from "react";
import { View, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import PageHeader from "@components/app/header/PageHeader";
import PageWrapper from "@components/app/PageWrapper";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { store } from "@/store";
import { capitalizeString } from "@utils/helpers";
import Button from "@components/atoms/Button";
import { uploadProfileImage } from "@utils/services/authServices";
import Toast from "react-native-toast-message";
import { authActions } from "@features/auth/context/slice";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";
import { theme } from "@utils/styles/theme";

const PersonalInfoScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Use useSelector to make the component reactive to store changes
  const user = useSelector((state: any) => state["feature/auth"].user);
  const defaultImage = require("../../../../assets/images/profile.png");

  const [profileImage, setProfileImage] = useState<string | undefined>(
    user?.profileImageFileUrl
  );
  const [newImageUri, setNewImageUri] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProfileImage(user?.profileImageFileUrl);
  }, [user?.profileImageFileUrl]);

  const handleImagePick = async () => {
    try {
      // Request permissions for Android
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permission Required',
          text2: 'Please grant photo library access to change your profile picture',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"], // Fixed deprecated syntax
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        setNewImageUri(selectedUri);
        setProfileImage(selectedUri);
      }
    } catch (err) {
      console.error("Picker Error:", err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to pick image. Please try again.',
      });
    }
  };

  const handleSave = async () => {
    if (!newImageUri) {
      console.warn("Abort: No new image URI to upload");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", {
      uri: newImageUri,
      name: "profile_photo.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const response = await uploadProfileImage(formData);
      const newRemoteUrl = response?.data?.profileImageFileUrl;

      if (newRemoteUrl) {
        dispatch(authActions.setProfileImage(newRemoteUrl));
        setNewImageUri(undefined);

        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Profile photo updated successfully.",
        });
      } else {
        console.warn("API Success, but URL was missing in response body");
      }
    } catch (error: any) {
      if (error.response) {
        Toast.show({
          type: "error",
          text1: "Upload Failed",
          text2: error.response.data?.message || "Server error occurred",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Network Error",
          text2: "Could not connect to server",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Profile"
        leftComponent={
          <Box flexDirection="row" alignItems="center" gap="md">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={30} color={theme.colors.PrimaryGreen} />
            </TouchableOpacity>
            <Text color="PrimaryGreen" variant="xlBold" numberOfLines={1}>
              Profile
            </Text>
          </Box>
        }
      />
      <Box flex={1} alignItems="center" padding="sm">
        {/* Profile Image Section */}
        <TouchableOpacity
          onPress={handleImagePick}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
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
          <Box width={"50%"} height={"2%"} m="base">
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
            User Name :{" "}
            <Text variant="md">
              {capitalizeString(user?.firstName + " " + user?.lastName)}
            </Text>
          </Text>

          <Text
            style={{ padding: 10, borderBottomWidth: 1 }}
            color="SecondaryGrey"
          >
            User Goal :{" "}
            <Text variant="md">
              {capitalizeString(user?.fitnessInfo?.goal ?? "Your goal")}
            </Text>
          </Text>
        </Box>
      </Box>
    </PageWrapper>
  );
};

export default PersonalInfoScreen;
