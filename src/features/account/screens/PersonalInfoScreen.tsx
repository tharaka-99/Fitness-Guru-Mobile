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

const PersonalInfoScreen: React.FC = () => {
  const dispatch = useDispatch();

  // Use useSelector to make the component reactive to store changes
  const user = useSelector((state: any) => state["feature/auth"].user);
  const defaultImage = require("../../../../assets/images/profile.png");

  const [profileImage, setProfileImage] = useState<string | undefined>(
    user?.profileImageFileUrl
  );
  const [newImageUri, setNewImageUri] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // Sync internal state when Redux store updates
  useEffect(() => {
    console.log("--- Store Sync ---");
    console.log("New URL from Store:", user?.profileImageFileUrl);
    setProfileImage(user?.profileImageFileUrl);
  }, [user?.profileImageFileUrl]);

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7, // Reduced slightly for better upload speed
      });

      console.log("--- Image Picker Result ---");
      console.log("Canceled:", result.canceled);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        console.log("Selected URI:", selectedUri);

        setNewImageUri(selectedUri);
        setProfileImage(selectedUri); // Update preview immediately
      }
    } catch (err) {
      console.error("Picker Error:", err);
    }
  };

  const handleSave = async () => {
    if (!newImageUri) {
      console.warn("Abort: No new image URI to upload");
      return;
    }

    setLoading(true);
    console.log("--- Starting Upload ---");

    const formData = new FormData();
    // Casting to 'any' prevents TypeScript errors with FormData file objects
    formData.append("file", {
      uri: newImageUri,
      name: "profile_photo.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const response = await uploadProfileImage(formData);

      console.log("--- API SUCCESS ---");
      console.log("Status:", response.status);
      console.log("Response Data:", JSON.stringify(response.data, null, 2));

      const newRemoteUrl = response?.data?.profileImageFileUrl;

      if (newRemoteUrl) {
        // 1. Update Redux
        dispatch(authActions.setProfileImage(newRemoteUrl));
        // 2. Clear pending state
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
      console.log("--- API ERROR ---");
      if (error.response) {
        console.log("Server Error Data:", error.response.data);
        console.log("Server Error Status:", error.response.status);

        Toast.show({
          type: "error",
          text1: "Upload Failed",
          text2: error.response.data?.message || "Server error occurred",
        });
      } else {
        console.log("Network/Request Error:", error.message);
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
      <PageHeader title="Profile" />
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
