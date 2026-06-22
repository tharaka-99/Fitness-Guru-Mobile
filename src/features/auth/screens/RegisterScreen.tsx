import React, { useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";
import { Check, Circle, X, ArrowLeft, User, Mail, Lock, Phone, MapPin } from "lucide-react-native";

import PageHeader from "@components/app/header/PageHeader";
import PageWrapper, { SCREEN_HEIGHT } from "@components/app/PageWrapper";
import Box from "@components/atoms/Box";
import Button from "@components/atoms/Button";
import Select from "@components/atoms/Select";
import Text from "@components/atoms/Text";
import TextInput from "@components/molecules/TextInput";
import { MyAuthStackNavigatorScreenProps } from "@navigation/types";
import { clientUserRegister } from "@utils/services/authServices";
import { Gender, UserData } from "@utils/types/types";
import { theme } from "@utils/styles/theme";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type InputKey = keyof UserData;

const RegisterScreen: React.FC<MyAuthStackNavigatorScreenProps<"Register">> = ({
  navigation,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNumber: "",
    city: "",
    gender: Gender.Male,
  });

  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    isValid: false,
  });

  const [passwordStrength, setPasswordStrength] = useState<
    "Poor" | "Medium" | "Strong"
  >("Poor");
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  // Helper Validations
  const isEmailValid = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneNumberValid = (phone: string) => /^[0-9]{10,15}$/.test(phone);

  const validatePasswordRealtime = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[@#$%^&*!&()_+\-=]/.test(password);

    const isValid =
      hasMinLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar;

    setPasswordValidation({
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      isValid,
    });

    if (!hasMinLength) setPasswordStrength("Poor");
    else if (isValid && password.length >= 12) setPasswordStrength("Strong");
    else if (isValid) setPasswordStrength("Medium");
    else setPasswordStrength("Poor");
  };

  const handleInputChange = (key: InputKey, value: string) => {
    setUserData((prev) => {
      const updated = { ...prev, [key]: value };

      if (key === "password" || key === "confirmPassword") {
        setPasswordsMatch(
          updated.password === updated.confirmPassword &&
          updated.confirmPassword.length > 0,
        );
      }

      return updated;
    });
  };

  const handleRegister = async () => {
    if (
      !userData.firstName ||
      !userData.lastName ||
      !userData.email ||
      !userData.password ||
      !userData.confirmPassword ||
      !userData.mobileNumber ||
      !userData.city
    ) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all fields.",
      });
      return;
    }
    if (!isEmailValid(userData.email)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Enter a valid email.",
      });
      return;
    }
    if (!passwordValidation.isValid) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Password requirements not met.",
      });
      return;
    }
    if (!passwordsMatch) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Passwords do not match.",
      });
      return;
    }
    if (!isPhoneNumberValid(userData.mobileNumber)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Enter a valid phone number.",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { confirmPassword, ...newUserData } = userData;
      const response = await clientUserRegister(newUserData);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: response.message,
      });
      setIsLoading(false);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Registration failed.",
      });
      setIsLoading(false);
    }
  };

  const renderFooter = () => {
    return (
      <Box mt="md">
        <Button
          onPress={handleRegister}
          title="Create Account"
          isLoading={isLoading}
        />
        <Box
          gap="sm"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          mb="lg"
        >
          <Text color="textSecondary">Already a member?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text fontWeight="bold">
              Login
            </Text>
          </TouchableOpacity>
        </Box>
      </Box>
    );
  };

  return (
    <PageWrapper>
      {/* <PageHeader
        leftComponent={
          <Box flexDirection="row" alignItems="center" gap="md">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={30} color={theme.colors.PrimaryGreen} />
            </TouchableOpacity>
            <Text color="PrimaryGreen" variant="xlBold" numberOfLines={1}>
              Create Account
            </Text>
          </Box>
        }
      /> */}
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        <Box gap="base">
          <Box>
            <Box alignItems="center" mt="2xl" mb="md">
              <Text variant="2xlBold" color="PrimaryGreen">
                Create Account
              </Text>
              <Text variant="md" color="textSecondary">
                Join Fitness Guru today
              </Text>
            </Box>

            <Box gap="base">
              {/* --- Personal Details --- */}
              <Text variant="lgBold" color="textPrimary">
                Personal Details
              </Text>

              <TextInput
                // label="First Name"
                autoCapitalize="sentences"
                placeholder="First Name"
                leftIcon={<User color={theme.colors.PrimaryGreen} size={20} />}
                onChangeText={(t) => handleInputChange("firstName", t)}
              />
              <TextInput
                // label="Last Name"
                autoCapitalize="sentences"
                placeholder="Last Name"
                leftIcon={<User color={theme.colors.PrimaryGreen} size={20} />}
                onChangeText={(t) => handleInputChange("lastName", t)}
              />
              <TextInput
                // label="Mobile Number"
                keyboardType="phone-pad"
                placeholder="Mobile Number"
                leftIcon={<Phone color={theme.colors.PrimaryGreen} size={20} />}
                onChangeText={(t) => handleInputChange("mobileNumber", t)}
              />
              <TextInput
                // label="City"
                placeholder="City"
                autoCapitalize="sentences"
                leftIcon={<MapPin color={theme.colors.PrimaryGreen} size={20} />}
                onChangeText={(t) => handleInputChange("city", t)}
              />
              <Select
                horizontal
                // label="Gender"
                items={[
                  { id: "1", option: "Male", value: "Male" },
                  { id: "2", option: "Female", value: "Female" },
                ]}
                onSelect={(val) =>
                  handleInputChange("gender", val.value.toString())
                }
              />

              {/* --- Account Details --- */}
              <Text variant="lgBold" color="textPrimary" mt="base">
                Account Details
              </Text>

              <TextInput
                // label="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Email"
                leftIcon={<Mail color={theme.colors.PrimaryGreen} size={20} />}
                onChangeText={(t) => handleInputChange("email", t)}
              />
              <TextInput
                secureTextEntry
                // label="Password"
                autoCapitalize="none"
                placeholder="Password"
                leftIcon={<Lock color={theme.colors.PrimaryGreen} size={20} />}
                onChangeText={(t) => {
                  handleInputChange("password", t);
                  validatePasswordRealtime(t);
                  setPasswordsMatch(
                    t === (userData.confirmPassword ?? "") &&
                    (userData.confirmPassword?.length ?? 0) > 0,
                  );
                }}
              />
              {userData.password.length > 0 && (
                <Box gap="xs" px="xs">
                  <RequirementItem
                    met={passwordValidation.hasMinLength}
                    label="At least 8 characters"
                  />
                  <RequirementItem
                    met={passwordValidation.hasUpperCase}
                    label="One uppercase letter"
                  />
                  <RequirementItem
                    met={passwordValidation.hasLowerCase}
                    label="One lowercase letter"
                  />
                  <RequirementItem
                    met={passwordValidation.hasNumber}
                    label="One number"
                  />
                  <RequirementItem
                    met={passwordValidation.hasSpecialChar}
                    label="One special character"
                  />
                  <Text variant="xs" mt="xs">
                    <Text variant="xs" color="SecondaryGrey">
                      Password Strength:{" "}
                    </Text>
                    <Text
                      variant="xs"
                      color={
                        passwordStrength === "Strong"
                          ? "PrimaryGreen"
                          : passwordStrength === "Medium"
                            ? "PrimaryOrange"
                            : "PrimaryRed"
                      }
                    >
                      {passwordStrength}
                    </Text>
                  </Text>
                </Box>
              )}

              <TextInput
                secureTextEntry
                // label="Re-enter Your Password"
                autoCapitalize="none"
                placeholder="Confirm Password"
                leftIcon={<Lock color={theme.colors.PrimaryGreen} size={20} />}
                onChangeText={(t) => handleInputChange("confirmPassword", t)}
              />
              {(userData.confirmPassword?.length ?? 0) > 0 && (
                <Box px="xs">
                  <RequirementItem
                    met={passwordsMatch}
                    label={
                      passwordsMatch
                        ? "Passwords match"
                        : "Passwords do not match"
                    }
                  />
                </Box>
              )}

              {renderFooter()}
            </Box>
          </Box>
        </Box>
      </KeyboardAwareScrollView>
    </PageWrapper>
  );
};

// Small Helper Component for cleaner code
const RequirementItem = ({ met, label }: { met: boolean; label: string }) => (
  <Box flexDirection="row" alignItems="center" gap="xs">
    {met ? (
      <Check size={14} color={theme.colors.PrimaryGreen} strokeWidth={3} />
    ) : (
      <Circle size={14} color={theme.colors.textSecondary} strokeWidth={2} />
    )}
    <Text variant="xs" color={met ? "PrimaryGreen" : "SecondaryGrey"}>
      {label}
    </Text>
  </Box>
);

export default RegisterScreen;

const styles = StyleSheet.create({
  backButton: {
    backgroundColor: "rgba(17,17,17,0.6)",
    borderRadius: 20,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  cardWrapper: {
    backgroundColor: theme.colors.PrimaryGreen,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 4,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: "rgba(17, 17, 17, 1)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 40,
  },
  logoCircle: {
    alignSelf: "center",
    marginTop: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.backgroundPrimary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: theme.colors.PrimaryGreen,
  },
});
