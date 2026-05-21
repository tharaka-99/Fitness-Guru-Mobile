import React, { useRef, useState, useCallback, useMemo } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import PagerView from "react-native-pager-view";
import Toast from "react-native-toast-message";
import { Check, Circle, X, ArrowLeft } from "lucide-react-native";

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
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const pageViewRef = useRef<PagerView>(null);

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

  const handleNext = () => {
    if (currentStep === 0) {
      if (
        !userData.firstName ||
        !userData.lastName ||
        !userData.email ||
        !userData.password ||
        !userData.confirmPassword
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
    }
    pageViewRef.current?.setPage(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      pageViewRef.current?.setPage(currentStep - 1);
    }
  };

  const handleRegister = async () => {
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

  // Optimized Footer logic
  const renderFooter = () => {
    return (
      <Box mt="lg">
        <Button
          onPress={currentStep === 0 ? handleNext : handleRegister}
          title={currentStep === 0 ? "Continue" : "Register"}
          isLoading={isLoading}
        />
        <Box
          gap="sm"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          mt="md"
        >
          <Text color="textSecondary">Already a member?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text py="md" fontWeight="bold">
              Login
            </Text>
          </TouchableOpacity>
        </Box>
      </Box>
    );
  };

  return (
    <PageWrapper>
      <PageHeader title="REGISTER" />
      <PagerView
        initialPage={0}
        ref={pageViewRef}
        style={{ flex: 1 }}
        scrollEnabled={false}
        onPageSelected={(e) => setCurrentStep(e.nativeEvent.position)}
      >
        {/* STEP 1 */}
        <KeyboardAwareScrollView
          key="1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          extraScrollHeight={20}
        >
          <Box gap="base">
            <TextInput
              label="First Name"
              autoCapitalize="sentences"
              placeholder="Enter Your First Name"
              onChangeText={(t) => handleInputChange("firstName", t)}
            />
            <TextInput
              label="Last Name"
              autoCapitalize="sentences"
              placeholder="Enter Your Last Name"
              onChangeText={(t) => handleInputChange("lastName", t)}
            />
            <TextInput
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Enter Your Email"
              onChangeText={(t) => handleInputChange("email", t)}
            />
            <TextInput
              secureTextEntry
              label="Password"
              autoCapitalize="none"
              placeholder="Enter Your Password"
              onChangeText={(t) => {
                handleInputChange("password", t);
                validatePasswordRealtime(t);
                // Check password match when password changes
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
              label="Confirm Password"
              autoCapitalize="none"
              placeholder="Enter Your Confirm Password"
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
        </KeyboardAwareScrollView>

        {/* STEP 2 */}
        <KeyboardAwareScrollView
          key="2"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          extraScrollHeight={20}
        >
          <Box gap="base">
            <TouchableOpacity
              onPress={handleBack}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <ArrowLeft size={20} color={theme.colors.PrimaryGreen} />
              <Text color="PrimaryGreen" ml="sm">
                Back
              </Text>
            </TouchableOpacity>

            <TextInput
              label="Mobile Number"
              keyboardType="phone-pad"
              placeholder="Your Mobile Number"
              onChangeText={(t) => handleInputChange("mobileNumber", t)}
            />
            <TextInput
              label="City"
              placeholder="Your City"
              autoCapitalize="sentences"
              onChangeText={(t) => handleInputChange("city", t)}
            />
            <Select
              label="Gender"
              items={[
                { id: "1", option: "Male", value: "Male" },
                { id: "2", option: "Female", value: "Female" },
              ]}
              onSelect={(val) =>
                handleInputChange("gender", val.value.toString())
              }
            />
            {renderFooter()}
          </Box>
        </KeyboardAwareScrollView>
      </PagerView>
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
