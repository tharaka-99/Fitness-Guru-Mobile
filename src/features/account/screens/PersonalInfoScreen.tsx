import React, { useState, useEffect } from "react";
import { Image, TouchableOpacity, ScrollView } from "react-native";
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
import TextInput from "@components/molecules/TextInput";

const PersonalInfoScreen: React.FC = () => {
  const { user } = store.getState()["feature/auth"];
  const defaultImage = require("../../../../assets/images/profile.png");

  const [profileImage, setProfileImage] = useState<string | undefined>(
    user?.profileImageFileUrl
  );
  const [newImageUri, setNewImageUri] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");

  useEffect(() => {
    setProfileImage(user?.profileImageFileUrl);
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
  }, [user?.profileImageFileUrl, user?.firstName, user?.lastName]);

  const handleImagePick = async () => {
    try {
      // Request permissions first
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission Denied",
          text2: "We need permission to access your photos.",
        });
        return;
      }

      console.log("Launching image picker...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      console.log("Image picker result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log("Setting newImageUri to:", imageUri);
        setNewImageUri(imageUri);
        setProfileImage(imageUri);
        console.log("Image URI set successfully");
      } else {
        console.log("Image picker was canceled or no assets");
      }
    } catch (error: any) {
      console.error("Error picking image:", error);

      // Check if it's a module linking error
      const errorMessage = error?.message || "";
      if (
        errorMessage.includes("Module") &&
        errorMessage.includes("not found")
      ) {
        Toast.show({
          type: "error",
          text1: "Module Not Linked",
          text2:
            "Please rebuild the app: Run 'npx expo run:android' or 'npx expo run:ios'",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to pick image. Please try again.",
        });
      }
    }
  };

  const handleSave = async () => {
    console.log("handleSave called");
    console.log("hasChanges():", hasChanges());
    console.log("newImageUri:", newImageUri);
    console.log("firstName changed:", firstName !== user?.firstName);
    console.log("lastName changed:", lastName !== user?.lastName);

    if (!hasChanges()) {
      Toast.show({
        type: "info",
        text1: "No changes",
        text2: "No changes to save.",
      });
      return;
    }

    setLoading(true);
    const hasImageUpdate = !!newImageUri;
    const hasNameUpdate =
      firstName !== user?.firstName || lastName !== user?.lastName;

    console.log("hasImageUpdate:", hasImageUpdate);
    console.log("hasNameUpdate:", hasNameUpdate);

    try {
      // Update profile image if a new one was selected
      if (hasImageUpdate) {
        console.log("Entering image update block");
        if (!newImageUri) {
          throw new Error("Image URI is missing");
        }

        // Normalize URI for React Native (remove file:// prefix if present on Android)
        const imageUri = newImageUri.startsWith("file://")
          ? newImageUri
          : newImageUri;

        const formData = new FormData();
        formData.append("file", {
          uri: imageUri,
          name: "profile.jpg",
          type: "image/jpeg",
        } as any);

        console.log("Uploading profile image...", { uri: imageUri });
        const imageResponse = await uploadProfileImage(formData);
        console.log(
          "Profile image upload response:",
          JSON.stringify(imageResponse, null, 2)
        );

        // Handle different possible response structures
        const profileImageUrl =
          imageResponse?.data?.profileImageFileUrl ||
          imageResponse?.data?.data?.profileImageFileUrl ||
          imageResponse?.profileImageFileUrl;

        if (profileImageUrl) {
          store.dispatch(authActions.setProfileImage(profileImageUrl));
          setNewImageUri(undefined);
        } else {
          console.error(
            "Profile image URL not found in response:",
            imageResponse
          );
          throw new Error("Profile image URL not found in response");
        }
      }

      if (hasNameUpdate) {
        store.dispatch(
          authActions.updateUserName({
            firstName,
            lastName,
          })
        );
      }

      Toast.show({
        type: "success",
        text1: "Profile updated!",
        text2: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Error updating profile. Please try again.";

      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    return (
      newImageUri !== undefined ||
      firstName !== user?.firstName ||
      lastName !== user?.lastName
    );
  };

  return (
    <PageWrapper>
      <PageHeader title="Edit Profile" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box flex={1} alignItems="center" padding="sm">
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

          <Box width="100%" mt="xl" gap="md">
            <Text variant="xl" fontWeight="bold" textAlign="center" mb="sm">
              Personal Information
            </Text>

            <TextInput
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
            />

            <TextInput
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
            />

            <Box mt="md">
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

          <Box width="100%" mt="xl" mb="xl">
            <Button
              onPress={handleSave}
              title="Save Changes"
              type="solid"
              isLoading={loading}
            />
          </Box>
        </Box>
      </ScrollView>
    </PageWrapper>
  );
};

export default PersonalInfoScreen;
