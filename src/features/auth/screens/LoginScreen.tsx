import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
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
      {/* <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? SCREEN_HEIGHT*0.15 : SCREEN_HEIGHT*0.15}
      > */}
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        <Box backgroundColor="backgroundPrimary" flex={1}>
          <Box style={{ height: SCREEN_HEIGHT * 0.5 }}>
            <ImageBackground
              source={require("assets/images/background.png")}
              style={styles.backgroundImage}
            >
              <Box mb="sm" pb="md">
                <Image
                  resizeMode="cover"
                  style={{ width: 125, height: 125 }}
                  source={require("assets/logo_white.png")}
                />
              </Box>
              <Text fontWeight="500" style={{ fontSize: 20 }}>
                WELCOME TO
              </Text>
              <Text fontWeight="700" style={{ fontSize: 40 }} mb="md">
                FITNESS GURU
              </Text>
            </ImageBackground>
          </Box>

          <Box padding="md" style={{ flex: 1 }}>
            <Box gap="base">
              <TextInput
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
                onChangeText={(text) => handleInputChange("email", text)}
              />
              <TextInput
                secureTextEntry
                label="Password"
                placeholder="Enter your password"
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
                mt="md"
                flexDirection="row"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="textSecondary">Not a member yet ?</Text>
                <Text onPress={() => navigation.navigate("Register")} py="md">
                  Sign in
                </Text>
              </Box>
            )}
          </Box>
        </Box>
      </KeyboardAwareScrollView>
      {/* </KeyboardAvoidingView> */}
    </PageWrapper>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
});
