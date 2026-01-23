import React, { useRef, useState } from "react";
import {
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { store } from "@/store";
import PageWrapper from "@components/app/PageWrapper";
import PageHeader from "@components/app/header/PageHeader";
import Box from "@components/atoms/Box";
import Button from "@components/atoms/Button";
import Select from "@components/atoms/Select";
import Text from "@components/atoms/Text";
import TextInput from "@components/molecules/TextInput";
import { MyStackNavigatorScreenProps } from "@navigation/types";
import {
  ActivityLevel,
  ClientInfo,
  ExpertiseLevel,
  FitnessInfo,
  Goal,
  PersonalInfo,
  Unit,
  WorkoutType,
} from "@utils/types/types";
import Toast from "react-native-toast-message";
import HaveInjuryQuestion from "../components/onboard/HaveInjuryQuestion";
import UserNameWithAvatar from "../components/onboard/UserNameWithAvatar";
import WorkoutGenerateOptions from "../components/onboard/WorkoutGenerateOptions";
import { overviewActions } from "../context/slice";
import { setClientProfileInfo } from "@utils/services/authServices";
import { theme } from "@utils/styles/theme";
import { authActions } from "@features/auth/context/slice";
import { gymActions } from "@features/gym/context/slice";
import { Icon } from "react-native-paper";
import { ArrowLeft } from "lucide-react-native";
import { useIsFocused } from "@react-navigation/native";

const OnboardScreen: React.FC<MyStackNavigatorScreenProps<"Onboard">> = ({
  navigation,
}) => {
  const { user } = store.getState()["feature/auth"];
  const [currentStep, setCurrentStep] = useState<number>(0);
  const pageViewRef = useRef<PagerView>(null);

  const [age, setAge] = useState<number>(1);
  const [unit, setUnit] = useState(Unit.Metric);
  const [weight, setWeight] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    ActivityLevel.Active,
  );
  const [goal, setGoal] = useState<Goal>(Goal.FatLoss);
  const [expertiseLevel, setExpertiseLevel] = useState<ExpertiseLevel>(
    ExpertiseLevel.Beginner,
  );
  const [isProfileSaved, setIsProfileSaved] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const isFocused = useIsFocused();

  const goToNextStep = () => {
    if (currentStep === 1) {
      if (!age || !weight || !height) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please fill all fields.",
        });
        return;
      }
    } else if (currentStep === 2) {
      if (!activityLevel || !goal || !expertiseLevel) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please fill all fields.",
        });
        return;
      }
    }

    pageViewRef.current?.setPage(currentStep + 1);
  };
  //
  const handleHaveInjuryQuestion = (haveInjury: boolean) => {
    if (haveInjury) {
      navigation.replace("Injury");
    } else {
      goToNextStep();
    }
  };
  //
  const toggleUnit = (unit: Unit) => {
    setUnit(unit);
    const convertedValues =
      unit === Unit.Imperial
        ? {
            weight: +(weight * 2.20462).toFixed(1), // kg to lbs
            height: +(height * 0.393701).toFixed(1), // cm to inches
          }
        : {
            weight: +(weight / 2.20462).toFixed(1), // lbs to kg
            height: +(height / 0.393701).toFixed(1), // inches to cm
          };
    setHeight(convertedValues.height);
    setWeight(convertedValues.weight);
  };
  //
  const calculateBmrAndDci = (
    age: number,
    weight: number,
    height: number,
    unit: Unit,
    gender: string,
    activityLevel: ActivityLevel,
    goal: Goal,
  ) => {
    // Calculate BMR
    let bmr = 0;
    if (unit === Unit.Metric) {
      bmr =
        gender === "Male"
          ? 10 * weight + 6.25 * height - 5 * age + 5
          : 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      bmr =
        gender === "Male"
          ? 66 + 6.23 * weight + 12.7 * height - 6.8 * age
          : 655 + 4.35 * weight + 4.7 * height - 4.7 * age;
    }

    // Adjust for activity level
    let dci = bmr;
    switch (activityLevel) {
      case ActivityLevel.Sedentary:
        dci *= 1.2;
        break;
      case ActivityLevel.Light:
        dci *= 1.375;
        break;
      case ActivityLevel.Moderate:
        dci *= 1.55;
        break;
      case ActivityLevel.Active:
        dci *= 1.725;
        break;
      default:
        break;
    }

    // Adjust for goal
    switch (goal) {
      case Goal.WeightLoss:
        dci -= 500; // or adjust based on user choice
        break;
      case Goal.FatLoss:
        dci -= 250;
        break;
      case Goal.WeightGain:
        dci += 500;
        break;
      case Goal.LeanGaining:
        dci += 250;
        break;
      case Goal.Maintenance:
        // No adjustment
        break;
      default:
        break;
    }
    return { bmr: Math.round(bmr), dci: Math.round(dci) };
  };
  //
  const saveProfileInfo = async () => {
    if (
      !age ||
      !weight ||
      !height ||
      !activityLevel ||
      !goal ||
      !expertiseLevel
    ) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill all fields.",
      });
      return;
    }

    const personalInfo: PersonalInfo = {
      age,
      unit,
      weight,
      height,
    };

    const fitnessInfo: FitnessInfo = {
      activityLevel: activityLevel as ActivityLevel,
      goal: goal as Goal,
      expertiseLevel: expertiseLevel as ExpertiseLevel,
    };

    const clientInfo: ClientInfo = {
      personalInfo,
      fitnessInfo,
      isInjured: false,
    };

    try {
      setIsLoading(true);
      store.dispatch(overviewActions.setProfile(clientInfo));

      // Calculate BMR and DCI
      const { bmr, dci } = calculateBmrAndDci(
        age,
        weight,
        height,
        unit,
        user ? user.gender : "Male",
        activityLevel,
        goal,
      );

      // If the user's subscription is active, save the profile information
      if (user?.subscription?.status === true) {
        await setClientProfileInfo(clientInfo);
      }

      setIsLoading(false);

      // Dispatch BMR and DCI values to Redux store
      store.dispatch(
        authActions.setBmrAndDci({
          calculatedMetrics: { bmr, dci },
        }),
      );

      // Calculate per meal requirements based on DCI and goal
      let perMealRequirement = dci;

      // Adjust per meal requirement based on the goal
      let perMealLowerLimit;
      let perMealUpperLimit;

      switch (goal) {
        case Goal.WeightGain:
          perMealLowerLimit = perMealRequirement + 250;
          perMealUpperLimit = perMealRequirement + 500;
          break;
        case Goal.WeightLoss:
          perMealLowerLimit = perMealRequirement - 1000;
          perMealUpperLimit = perMealRequirement - 500;
          break;
        case Goal.FatLoss:
          perMealLowerLimit = perMealRequirement - 500;
          perMealUpperLimit = perMealRequirement - 250;
          break;
        case Goal.LeanGaining:
          perMealLowerLimit = perMealRequirement + 100;
          perMealUpperLimit = perMealRequirement + 250;
          break;
        default:
          // If no valid goal is set, keep the default per meal values
          perMealLowerLimit = perMealRequirement - 50;
          perMealUpperLimit = perMealRequirement + 50;
          break;
      }

      // ✅ Debugging logs
      console.log("=== Profile Submission Check ===");
      console.log("Age:", age);
      console.log("Unit:", unit);
      console.log("Weight:", weight);
      console.log("Height:", height);
      console.log("Activity Level:", activityLevel);
      console.log("Goal:", goal);
      console.log("Expertise Level:", expertiseLevel);
      console.log("Calculated BMR:", bmr);
      console.log("Calculated DCI:", dci);
      console.log("Per Meal Requirement:", perMealRequirement);
      console.log("Per Meal Lower Limit:", perMealLowerLimit);
      console.log("Per Meal Upper Limit:", perMealUpperLimit);
      console.log("================================");

      // Dispatch the updated calorie requirements to Redux store
      store.dispatch(
        gymActions.updateCaloriesRequirenment({
          perMealRequirement,
          perMealLowerLimit,
          perMealUpperLimit,
        }),
      );

      setIsProfileSaved(true);
      goToNextStep();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Error saving profile info",
      });
      setIsLoading(false);
    }
  };
  //
  const handleSubmit = async () => {
    console.log("handleSubmit");
    if (currentStep === 2 && !isProfileSaved) {
      saveProfileInfo();
      goToNextStep();
    }
  };
  //
  const handleWorkoutGeneteOptions = async (option: any) => {
    if (option === "generater") {
      gymActions.setSelectedWorkout({
        WorkoutType: WorkoutType.SelfCreated,
        createdBy: "",
      });
      saveProfileInfo();
      navigation.navigate("GenerateWorkout");
    } else if (option === "default") {
      // if (user?.subscription?.status === true) {
      // saveProfileInfo();
      //   navigation.navigate("GeneralWorkoutRoutine");
      // } else {
      //   gymActions.setSelectedWorkout({
      //     WorkoutType: WorkoutType.Default,
      //     createdBy: "",
      //   });
      //   saveProfileInfo();
      //   navigation.navigate("PricingPackages");
      // }
      saveProfileInfo();
      navigation.navigate("GenerateMealPlan");
    }
  };
  return (
    <PageWrapper>
      <PageHeader
        leftComponent={
          <Box flexDirection="row" alignItems="center" gap="md">
            <TouchableOpacity
              onPress={() => {
                if (currentStep > 0) {
                  pageViewRef.current?.setPage(currentStep - 1);
                  setCurrentStep((prev) => prev - 1);
                } else {
                  navigation.goBack();
                }
              }}
            >
              <ArrowLeft size={30} color={theme.colors.PrimaryGreen} />
            </TouchableOpacity>
            <UserNameWithAvatar />
          </Box>
        }
      />

      <Box flex={1} style={{ flexGrow: 1 }}>
        <PagerView
          //initialPage={0}
          ref={pageViewRef}
          key={isFocused ? "focused" : "none"}
          initialPage={currentStep}
          style={{ flex: 1 }}
          scrollEnabled={false}
          onPageSelected={(e) => setCurrentStep(e.nativeEvent.position)}
        >
          <KeyboardAwareScrollView
            key="1"
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={{ flex: 1 }}>
                <HaveInjuryQuestion onAnswer={handleHaveInjuryQuestion} />
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAwareScrollView>
          <KeyboardAwareScrollView
            key="2"
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            nestedScrollEnabled={true}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={{ flex: 1 }}>
                <Box gap="lg">
                  <Text
                    variant="xlBold"
                    textAlign="center"
                    color="PrimaryGreen"
                    textTransform="uppercase"
                  >
                    Personal Info
                  </Text>

                  <Box gap="base">
                    <TextInput
                      label="Age"
                      placeholder="Enter your age"
                      keyboardType="number-pad"
                      onChangeText={(text) => setAge(parseInt(text))}
                    />
                    {/* Toggle for Metric or Imperial */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        marginBottom: "-8%",
                        zIndex: 10,
                      }}
                    >
                      <Box
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: theme.colors.SecondaryGrey,
                          borderRadius: 6,
                          padding: 2,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() =>
                            unit !== Unit.Metric && toggleUnit(Unit.Metric)
                          }
                          activeOpacity={0.7}
                          style={{
                            backgroundColor:
                              unit === Unit.Metric
                                ? theme.colors.PrimaryGreen
                                : "transparent",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: theme.spacing.lg + 10,
                            minWidth: theme.spacing["3xl"] + 10,
                            paddingHorizontal: 10,

                            borderRadius: 4,
                            paddingVertical: 5,
                          }}
                        >
                          <Text
                            style={{
                              color:
                                unit === Unit.Metric
                                  ? theme.colors.PrimaryBlack
                                  : theme.colors.PrimaryWhite,
                            }}
                          >
                            Metric
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() =>
                            unit !== Unit.Imperial && toggleUnit(Unit.Imperial)
                          }
                          activeOpacity={0.7}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          style={{
                            backgroundColor:
                              unit === Unit.Imperial
                                ? theme.colors.PrimaryGreen
                                : "transparent",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: theme.spacing.lg + 10,
                            minWidth: theme.spacing["3xl"] + 10,
                            paddingHorizontal: 10,
                            borderRadius: 4,
                            paddingVertical: 5,
                          }}
                        >
                          <Text
                            style={{
                              color:
                                unit === Unit.Imperial
                                  ? theme.colors.PrimaryBlack
                                  : theme.colors.PrimaryWhite,
                            }}
                          >
                            Imperial
                          </Text>
                        </TouchableOpacity>
                      </Box>
                    </View>
                    <TextInput
                      value={weight ? weight.toString() : ""}
                      label={`Weight in ${unit === Unit.Metric ? "kg" : "lbs"}`}
                      keyboardType="number-pad"
                      placeholder="Enter your weight"
                      onChangeText={(text) =>
                        setWeight(text ? parseInt(text) : 0)
                      }
                    />
                    <TextInput
                      value={height ? height.toString() : ""}
                      label={`Height in ${
                        unit === Unit.Metric ? "cm" : "inches"
                      }`}
                      keyboardType="number-pad"
                      placeholder="Enter your height"
                      onChangeText={(text) =>
                        setHeight(text ? parseInt(text) : 0)
                      }
                    />
                  </Box>

                  <Button title="Continue" onPress={goToNextStep} />
                </Box>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAwareScrollView>
          <KeyboardAwareScrollView
            key="3"
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={{ flex: 1 }}>
                <Box gap="lg">
                  <Text
                    variant="xlBold"
                    textAlign="center"
                    color="PrimaryGreen"
                    textTransform="uppercase"
                  >
                    Fitness Info
                  </Text>

                  <Box gap="base">
                    <Select
                      label="Activity Level"
                      items={[
                        {
                          id: "1",
                          option: "Sedentary (No Exercise)",
                          value: ActivityLevel.Sedentary,
                        },
                        {
                          id: "2",
                          option: "Light (Exercise 1-2 days per week)",
                          value: ActivityLevel.Light,
                        },
                        {
                          id: "3",
                          option: "Moderate (Exercise 3-5 days per week)",
                          value: ActivityLevel.Moderate,
                        },
                        {
                          id: "4",
                          option: "Active (Exercise 6-7 days per week)",
                          value: ActivityLevel.Active,
                        },
                      ]}
                      onSelect={(value) =>
                        setActivityLevel(value.value as ActivityLevel)
                      }
                    />

                    <Select
                      label="What is your goal?"
                      items={[
                        {
                          id: "1",
                          option: "Weight Gain (250 - 500 Cal)",
                          value: Goal.WeightGain,
                        },
                        {
                          id: "2",
                          option: "Fat Loss (250 - 500 Cal)",
                          value: Goal.FatLoss,
                        },
                        {
                          id: "3",
                          option: "Maintenance (DCI)",
                          value: Goal.Maintenance,
                        },
                        {
                          id: "4",
                          option: "Lean Gaining (100 - 250 Cal)",
                          value: Goal.LeanGaining,
                        },
                        {
                          id: "5",
                          option: "Weight Loss (500 - 1000 Cal)",
                          value: Goal.WeightLoss,
                        },
                      ]}
                      onSelect={(value) => setGoal(value.value as Goal)}
                    />

                    <Select
                      label="Expertise Level"
                      items={[
                        {
                          id: "1",
                          option: "Beginner",
                          value: ExpertiseLevel.Beginner,
                        },
                        {
                          id: "2",
                          option: "Intermediate",
                          value: ExpertiseLevel.Intermediate,
                        },
                        {
                          id: "3",
                          option: "Advanced",
                          value: ExpertiseLevel.Advanced,
                        },
                      ]}
                      onSelect={(value) =>
                        setExpertiseLevel(value.value as ExpertiseLevel)
                      }
                    />
                  </Box>

                  <Button
                    title="Continue"
                    onPress={currentStep === 3 ? handleSubmit : goToNextStep}
                    isLoading={isLoading}
                  />
                </Box>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAwareScrollView>
          <View key="4" style={{ flex: 1 }}>
            <WorkoutGenerateOptions
              onOptionSelected={handleWorkoutGeneteOptions}
            />
          </View>
        </PagerView>
      </Box>
    </PageWrapper>
  );
};

export default OnboardScreen;
