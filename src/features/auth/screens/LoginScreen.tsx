import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
} from "react-native";
import Toast from "react-native-toast-message";
import PageWrapper, { SCREEN_HEIGHT } from "@components/app/PageWrapper";
import Box from "@components/atoms/Box";
import Button from "@components/atoms/Button";
import Text from "@components/atoms/Text";
import TextInput from "@components/molecules/TextInput";
import { MyAuthStackNavigatorScreenProps } from "@navigation/types";
import { Credentials } from "@utils/types/types";
import { clientUserLogin } from "@utils/services/authServices";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { theme } from "@utils/styles/theme";
import { Mail, Lock } from "lucide-react-native";

type InputKey = keyof Credentials;

const LoginScreen: React.FC<MyAuthStackNavigatorScreenProps<"Login">> = ({
  navigation,
}) => {
  const [credentials, setCredentials] = useState<Credentials>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (key: InputKey, value: string) => {
    setCredentials((prevUserData) => ({
      ...prevUserData,
      [key]: value,
    }));
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      if (credentials.email !== "" || credentials.password !== "") {
        const response = await clientUserLogin(credentials);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: response.message,
        });
        setIsLoading(false);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Enter your credentials!",
        });
        setIsLoading(false);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Login failed. Please try again later.",
      });
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper noPadding>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        <Box style={{ flex: 1 }}>
          <Box style={{ position: "absolute", width: "100%", height: SCREEN_HEIGHT }}>
            <Image
              source={require("assets/images/LoginBackgound.png")}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </Box>
          {/* Spacer to push card to the bottom */}
          <Box flex={1} minHeight={SCREEN_HEIGHT * 0.45} />

          <Box style={styles.cardWrapper}>
            <Box style={styles.cardContainer}>
              <Box style={styles.logoCircle}>
                <Image
                  resizeMode="contain"
                  style={{ width: 40, height: 40, tintColor: theme.colors.PrimaryGreen }}
                  source={require("assets/logo_white.png")}
                />
              </Box>

              <Box alignItems="center" mt="md" mb="lg">
                <Text variant="2xlBold" color="textPrimary">
                  Welcome back
                </Text>
                <Text variant="sm" color="textSecondary" mt="xs">
                  Log in to continue your fitness journey
                </Text>
              </Box>

              <Box gap="base">
                <TextInput
                  placeholder="Email"
                  keyboardType="email-address"
                  leftIcon={<Mail color={theme.colors.PrimaryGreen} size={20} />}
                  onChangeText={(text) => handleInputChange("email", text)}
                />
                <TextInput
                  secureTextEntry
                  placeholder="Password"
                  leftIcon={<Lock color={theme.colors.PrimaryGreen} size={20} />}
                  onChangeText={(text) => handleInputChange("password", text)}
                />
              </Box>

              <Box mt="lg">
                <Button
                  title="Login"
                  onPress={handleLogin}
                  isLoading={isLoading}
                />
              </Box>

              {new Date() >= new Date("2026-03-28T17:00:00") && (
                <Box
                  gap="sm"
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="center"
                  pb="lg"
                >
                  <Text color="textSecondary">Not a member yet?</Text>
                  <Text onPress={() => navigation.navigate("Register")} fontWeight="bold" color="textPrimary">
                    Create Account
                  </Text>
                </Box>
              )}
            </Box>
          </Box>

        </Box>
      </KeyboardAwareScrollView>
    </PageWrapper>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  cardWrapper: {
    marginHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.PrimaryGreen,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 3,
  },
  cardContainer: {
    backgroundColor: "rgba(17, 17, 17, 1)",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: theme.spacing.lg,
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
