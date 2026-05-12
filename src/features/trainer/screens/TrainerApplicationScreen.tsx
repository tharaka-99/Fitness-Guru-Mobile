import React, { useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import PageHeader from "@components/app/header/PageHeader";
import PageWrapper, { SCREEN_HEIGHT } from "@components/app/PageWrapper";
import Box from "@components/atoms/Box";
import Button from "@components/atoms/Button";
import ImageInput from "@components/atoms/ImageInput";
import InputLabel from "@components/atoms/InputLabel";
import Select from "@components/atoms/Select";
import StepProgress from "@components/atoms/StepProgress";
import Text from "@components/atoms/Text";
import TextInput from "@components/molecules/TextInput";
import { MyStackNavigatorScreenProps } from "@navigation/types";
import { capitalizeString } from "@utils/helpers";
import {
  postFitnessGuruRequest,
  postTrainerRequest,
} from "@utils/services/trainersService";
import { theme } from "@utils/styles/theme";
import {
  ActivityLevel,
  Cardiovascular,
  CreateTrainerRequestDto,
  Gender,
  Goal,
  WorkoutPlace,
} from "@utils/types/trainersTypes";
import { Unit } from "@utils/types/types";
import { Text as PaperText, Icon } from "react-native-paper";
import { useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ArrowLeft } from "lucide-react-native";

const initialFormValues: CreateTrainerRequestDto = {
  trainerId: "",
  fullName: "",
  occupation: "",
  gender: Gender.Male,
  age: 0,
  unit: Unit.Metric,
  weight: 0,
  height: 0,
  workoutPlace: WorkoutPlace.Home,
  workoutDaysPerWeek: "",
  homeEquipments: "",
  isAnyFoodAllergies: false,
  foodAllergies: "",
  isAnyInjuries: false,
  injuries: "",
  isAnyPhysicalLimitations: false,
  physicalLimitations: "",
  isUsingAnyMedications: false,
  usingMedications: "",
  activityLevel: ActivityLevel.Sedentary,
  goal: Goal.WeightGain,
  weeklyMealBudget: 0,
  isUseAnySupplements: false,
  supplements: "",
  cardiovascular: Cardiovascular.Good,
  oneSetPushUpCount: 0,
  oneSetBodyWeightSquats: 0,
  oneSetPullUps: 0,
  canTouchToesKeepingLegsStraight: false,
  isPracticingAnyFlexibilityExercises: false,
};

const TrainerApplicationScreen: React.FC<
  MyStackNavigatorScreenProps<"TrainerApplication">
> = ({ route, navigation }) => {
  const { trainerId, packageId } = route.params;
  const [currentStep, setCurrentStep] = useState<number>(0);
  const pageViewRef = useRef<PagerView>(null);
  const { trainer } = useSelector((state: any) => state["feature/trainer"]);
  const [unit, setUnit] = useState(Unit.Metric);
  const [formValues, setFormValues] = useState<CreateTrainerRequestDto>({
    ...initialFormValues,
    trainerId: trainer._id,
  });
  const [imageUploads, setImageUploads] = useState<{
    frontView: string[];
    backView: string[];
    sideView: string[];
    lowerBodyView: string[];
    homeEquipments: string[];
  }>({
    frontView: [],
    backView: [],
    sideView: [],
    lowerBodyView: [],
    homeEquipments: [],
  });
  const [errors, setErrors] = useState<{
    [key in keyof CreateTrainerRequestDto]?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const requiredFieldsScreen1 = [
    "fullName",
    "occupation",
    "gender",
    "age",
    "unit",
    "weight",
    "height",
  ];

  const requiredFieldsScreen2 = [
    "workoutPlace",
    "workoutDaysPerWeek",
    "isAnyFoodAllergies",
  ];

  const requiredFieldsScreen3 = [
    "activityLevel",
    "goal",
    "weeklyMealBudget",
    "isUseAnySupplements",
  ];

  // const requiredFieldsScreen4 = ['cardiovascularEndurance', 'pushUps'];

  const getRequiredFieldsForStep = (step: number) => {
    switch (step) {
      case 0:
        return requiredFieldsScreen1;
      case 1:
        return requiredFieldsScreen2;
      case 2:
        return requiredFieldsScreen3;
      default:
        return [];
    }
  };
  //
  const validateForm = () => {
    const currentRequiredFields = getRequiredFieldsForStep(currentStep);
    const newErrors: { [key in keyof CreateTrainerRequestDto]?: string } = {};

    currentRequiredFields.forEach((field) => {
      const value = formValues[field as keyof CreateTrainerRequestDto];
      // Check specifically for null or undefined instead of "falsy" values
      if (value === undefined || value === null || value === "") {
        newErrors[field as keyof CreateTrainerRequestDto] =
          "This field is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //
  const handleNextStep = () => {
    if (validateForm()) {
      pageViewRef.current?.setPage(currentStep + 1);
    } else {
      Toast.show({
        type: "error",
        text1: "Form Incomplete",
        text2: "Please fill in all required fields",
      });
    }
  };
  //
  const handleBackStep = (index: number) => {

    pageViewRef.current?.setPage(index);
  };
  //
  const handleInputChange = <Name extends keyof CreateTrainerRequestDto>(
    name: Name,
    value: CreateTrainerRequestDto[Name],
  ) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
    }
  };
  //
  const handleImageUpload = (
    name: keyof typeof imageUploads,
    value: string | string[],
  ) => {
    setImageUploads((prevImages) => ({
      ...prevImages,
      [name]: value,
    }));
  };

  const logFormData = (formData: FormData) => {
    for (let [key, value] of (formData as any).entries()) {
      console.log(`${key}:`, value);
    }
  };


  const appendTrainerRequestData = (
    formValues: CreateTrainerRequestDto,
    imageUploads: any,
    trainerId: string,
  ) => {
    const formData = new FormData();

    // Append each field manually to FormData
    if (trainerId !== "fitness-guru") {
      formData.append("trainerId", trainerId.toString());
    }
    formData.append("fullName", formValues.fullName);
    formData.append("occupation", formValues.occupation);
    formData.append("gender", formValues.gender);
    formData.append("age", formValues.age.toString());
    formData.append("unit", formValues.unit);
    formData.append("weight", formValues.weight.toString());
    formData.append("height", formValues.height.toString());
    formData.append("workoutPlace", formValues.workoutPlace);
    formData.append("workoutDaysPerWeek", formValues.workoutDaysPerWeek);
    formData.append("homeEquipments", formValues.homeEquipments || "");
    formData.append(
      "isAnyFoodAllergies",
      formValues.isAnyFoodAllergies.toString(),
    );
    formData.append("foodAllergies", formValues.foodAllergies || "");
    formData.append("isAnyInjuries", formValues.isAnyInjuries.toString());
    formData.append("injuries", formValues.injuries || "");
    formData.append(
      "isAnyPhysicalLimitations",
      formValues.isAnyPhysicalLimitations.toString(),
    );
    formData.append(
      "physicalLimitations",
      formValues.physicalLimitations || "",
    );
    formData.append(
      "isUsingAnyMedications",
      formValues.isUsingAnyMedications.toString(),
    );
    formData.append("usingMedications", formValues.usingMedications || "");
    formData.append("activityLevel", formValues.activityLevel);
    formData.append("goal", formValues.goal);
    formData.append("weeklyMealBudget", formValues.weeklyMealBudget.toString());
    formData.append(
      "isUseAnySupplements",
      formValues.isUseAnySupplements.toString(),
    );
    formData.append("supplements", formValues.supplements || "");
    formData.append("cardiovascular", formValues.cardiovascular);
    formData.append(
      "oneSetPushUpCount",
      formValues.oneSetPushUpCount.toString(),
    );
    formData.append(
      "oneSetBodyWeightSquats",
      formValues.oneSetBodyWeightSquats.toString(),
    );
    formData.append("oneSetPullUps", formValues.oneSetPullUps.toString());
    formData.append(
      "canTouchToesKeepingLegsStraight",
      formValues.canTouchToesKeepingLegsStraight.toString(),
    );
    formData.append(
      "isPracticingAnyFlexibilityExercises",
      formValues.isPracticingAnyFlexibilityExercises.toString(),
    );
    // Handle image uploads
    if (imageUploads.homeEquipments.length) {
      imageUploads.homeEquipments.forEach(
        (homeEquipment: string, index: number) => {
          formData.append("homeEquipments", {
            uri: homeEquipment,
            name: `homeEquipment_${index + 1}.jpg`,
            type: "image/jpeg",
          });
        },
      );
    }

    formData.append("frontView", {
      uri: imageUploads.frontView[0],
      name: "frontView.jpg",
      type: "image/jpeg",
    });
    formData.append("backView", {
      uri: imageUploads.backView[0],
      name: "backView.jpg",
      type: "image/jpeg",
    });
    formData.append("sideView", {
      uri: imageUploads.sideView[0],
      name: "sideView.jpg",
      type: "image/jpeg",
    });
    formData.append("lowerBodyView", {
      uri: imageUploads.lowerBodyView[0],
      name: "lowerBodyView.jpg",
      type: "image/jpeg",
    });
    return formData;
  };
  //
  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Create a FormData instance
      const formData = appendTrainerRequestData(
        formValues,
        imageUploads,
        trainerId,
      );

      logFormData(formData);

      if (trainerId === "fitness-guru") {
        await postFitnessGuruRequest(formData); // Adjust the API method to accept FormData
        navigation.navigate("Tab", { screen: "FitnessGuru" });
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Fitness guru requested successfully!",
        });
        navigation.push("Tab", { screen: "FitnessGuru" });
      } else {
        await postTrainerRequest(formData); // Adjust the API method to accept FormData
        navigation.push("TrainerProfile");
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Trainer requested successfully!",
        });
      }

      setIsLoading(false);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Something went wrong!",
      });
      setIsLoading(false);
    }
  };

  //
  const toggleUnit = (unit: Unit) => {
    setUnit(unit);
    const convertedValues =
      unit === Unit.Imperial
        ? {
          weight: +(formValues.weight * 2.20462).toFixed(1), // kg to lbs
          height: +(formValues.height * 0.393701).toFixed(1), // cm to inches
        }
        : {
          weight: +(formValues.weight / 2.20462).toFixed(1), // lbs to kg
          height: +(formValues.height / 0.393701).toFixed(1), // inches to cm
        };

    setFormValues((prevValues) => ({
      ...prevValues,
      ...convertedValues,
      unit: unit,
    }));
  };

  const hasAllImages = Object.values(imageUploads).every(
    (images) => images.length > 0
  );

  return (
    <PageWrapper noPadding>
      <Box px="md">
        <PageHeader
          leftComponent={
            <Box flexDirection="row" alignItems="center" gap="md">
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <ArrowLeft size={30} color={theme.colors.PrimaryGreen} />
              </TouchableOpacity>
              <Text color="PrimaryGreen" variant="xlBold" numberOfLines={1}>
                {trainerId === "fitness-guru"
                  ? "Fitness guru"
                  : capitalizeString(trainer?.firstName) +
                  " " +
                  trainer?.lastName}
              </Text>
            </Box>
          }
        />
      </Box>

      <Box mb="base">
        <StepProgress
          currentStep={currentStep}
          stepsCount={5}
          handleBackStep={(index) => handleBackStep(index)}
        />
      </Box>

      <Box flex={1}>
        <PagerView
          initialPage={0}
          ref={pageViewRef}
          style={{ flex: 1 }}
          scrollEnabled={false}
          onPageSelected={(e) => setCurrentStep(e.nativeEvent.position)}
        >
          {/* NOTE: screen 1 */}
          <View key="1" style={{ flex: 1 }}>
            <KeyboardAwareScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              enableOnAndroid={true}
              extraScrollHeight={20}
            >
              <Box gap="base" px="md">
                <TextInput
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formValues.fullName}
                  onChangeText={(value) => handleInputChange("fullName", value)}
                  error={errors.fullName}
                />

                <TextInput
                  label="Occupation"
                  placeholder="Enter your occupation"
                  value={formValues.occupation}
                  onChangeText={(value) =>
                    handleInputChange("occupation", value)
                  }
                  error={errors.occupation}
                />

                <Select
                  label="Gender"
                  items={[
                    { id: "1", option: "Male", value: Gender.Male },
                    { id: "2", option: "Female", value: Gender.Female },
                  ]}
                  onSelect={(value) =>
                    handleInputChange("gender", value.value as Gender)
                  }
                  key={formValues.gender}
                />

                <TextInput
                  label="Age"
                  placeholder="Enter your age"
                  keyboardType="number-pad"
                  value={formValues.age.toString()}
                  onChangeText={(value) => handleInputChange("age", +value)}
                  error={errors.age}
                />

                {/* Toggle for Metric or Imperial */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    marginBottom: "-8%",
                    pointerEvents: "box-none",
                  }}
                >
                  <Box
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 2,
                      backgroundColor: theme.colors.SecondaryGrey,
                      borderRadius: 2,
                      pointerEvents: "box-none",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        if (unit !== Unit.Metric) toggleUnit(Unit.Metric);
                      }}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor:
                          unit === Unit.Metric
                            ? theme.colors.PrimaryGreen
                            : undefined,
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: theme.spacing.lg + 10,
                        minWidth: theme.spacing["3xl"] + 10,
                        paddingHorizontal: 10,
                        borderRadius: 4,
                        zIndex: 1,
                      }}
                      disabled={unit === Unit.Metric}
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
                      onPress={() => {
                        if (unit !== Unit.Imperial) toggleUnit(Unit.Imperial);
                      }}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor:
                          unit === Unit.Imperial
                            ? theme.colors.PrimaryGreen
                            : undefined,
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: theme.spacing.lg + 10,
                        minWidth: theme.spacing["3xl"] + 10,
                        paddingHorizontal: 10,
                        borderRadius: 4,
                        zIndex: 1,
                      }}
                      disabled={unit === Unit.Imperial}
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
                  label={`Weight in ${unit === Unit.Metric ? "kg" : "lbs"}`}
                  placeholder="Enter your weight"
                  keyboardType="number-pad"
                  value={formValues.weight.toString()}
                  onChangeText={(value) => handleInputChange("weight", +value)}
                  error={errors.weight}
                />

                <TextInput
                  label={`Height in ${unit === Unit.Metric ? "cm" : "inches"}`}
                  placeholder="Enter your height"
                  keyboardType="number-pad"
                  value={formValues.height.toString()}
                  onChangeText={(value) => handleInputChange("height", +value)}
                  error={errors.height}
                />

                <Box mt="sm">
                  <Button title="Next" onPress={handleNextStep} />
                </Box>
              </Box>
            </KeyboardAwareScrollView>
          </View>

          {/* NOTE: screen 2 */}
          <View key="2" style={{ flex: 1 }}>
            <KeyboardAwareScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              enableOnAndroid={true}
              extraScrollHeight={20}
            >
              <Box gap="base" px="md">
                <Select
                  label="Where do you typically work out?"
                  items={[
                    { id: "1", option: "Home", value: WorkoutPlace.Home },
                    { id: "2", option: "Gym", value: WorkoutPlace.Gym },
                  ]}
                  onSelect={(value) =>
                    handleInputChange(
                      "workoutPlace",
                      value.value as WorkoutPlace,
                    )
                  }
                  key={formValues.workoutPlace}
                />

                <TextInput
                  label="How many workout days per week do you plan to exercise?"
                  placeholder="Enter number of days (e.g., 3-5)"
                  keyboardType="number-pad"
                  value={formValues.workoutDaysPerWeek}
                  onChangeText={(value) =>
                    handleInputChange("workoutDaysPerWeek", value)
                  }
                  error={errors.workoutDaysPerWeek}
                />

                <TextInput
                  label="If working out at home, please list your equipment"
                  placeholder="Enter equipment names"
                  value={formValues.homeEquipments}
                  onChangeText={(value) =>
                    handleInputChange("homeEquipments", value)
                  }
                  error={errors.homeEquipments}
                />

                <ImageInput
                  selectionLimit={3}
                  label="Please upload images of your equipment"
                  onImageUpload={(value) =>
                    handleImageUpload("homeEquipments", value)
                  }
                />

                <Select
                  label="Do you have any food allergies?"
                  items={[
                    { id: "1", option: "Yes", value: true },
                    { id: "2", option: "No", value: false },
                  ]}
                  onSelect={(value) =>
                    handleInputChange(
                      "isAnyFoodAllergies",
                      value.value as boolean,
                    )
                  }
                />

                <TextInput
                  label="If yes, please mention them"
                  placeholder="Enter your allergies"
                  value={formValues.foodAllergies}
                  onChangeText={(value) =>
                    handleInputChange("foodAllergies", value)
                  }
                />

                <Select
                  label="Do you have any health issues or injuries?"
                  items={[
                    { id: "1", option: "Yes", value: true },
                    { id: "2", option: "No", value: false },
                  ]}
                  onSelect={(value) =>
                    handleInputChange("isAnyInjuries", value.value as boolean)
                  }
                />

                <TextInput
                  label="If yes, please mention them"
                  placeholder="Enter your health issues or injuries"
                  value={formValues.injuries}
                  onChangeText={(value) => handleInputChange("injuries", value)}
                  error={errors.injuries}
                />

                <Select
                  label="Do you have any physical limitations or disabilities?"
                  items={[
                    { id: "1", option: "Yes", value: true },
                    { id: "2", option: "No", value: false },
                  ]}
                  onSelect={(value) =>
                    handleInputChange(
                      "isAnyPhysicalLimitations",
                      value.value as boolean,
                    )
                  }
                />

                <TextInput
                  label="If yes, please mention them"
                  placeholder="Enter your limitations or disabilities"
                  value={formValues.physicalLimitations}
                  onChangeText={(value) =>
                    handleInputChange("physicalLimitations", value)
                  }
                />

                <Select
                  label="Are you currently taking any medications?"
                  items={[
                    { id: "1", option: "Yes", value: true },
                    { id: "2", option: "No", value: false },
                  ]}
                  onSelect={(value) =>
                    handleInputChange(
                      "isUsingAnyMedications",
                      value.value as boolean,
                    )
                  }
                />

                <TextInput
                  label="If yes, please mention them"
                  placeholder="Enter your medications"
                  value={formValues.usingMedications}
                  onChangeText={(value) =>
                    handleInputChange("usingMedications", value)
                  }
                />

                <Box mt="sm">
                  <Button title="Next" onPress={handleNextStep} />
                </Box>
              </Box>
            </KeyboardAwareScrollView>
          </View>

          {/* NOTE: screen 3 */}
          <View key="3" style={{ flex: 1 }}>
            <KeyboardAwareScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              enableOnAndroid={true}
              extraScrollHeight={20}
            >
              <Box gap="base" px="md">
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
                    handleInputChange(
                      "activityLevel",
                      value.value as ActivityLevel,
                    )
                  }
                />

                <Select
                  label="What is your fitness goal?"
                  items={[
                    { id: "1", option: "Weight Gain", value: Goal.WeightGain },
                    { id: "2", option: "Weight Loss", value: Goal.WeightLoss },
                    { id: "3", option: "Maintenance", value: Goal.Maintenance },
                    {
                      id: "4",
                      option: "Lean Muscle Gain",
                      value: Goal.LeanGaining,
                    },
                    { id: "5", option: "Fat Loss", value: Goal.FatLoss },
                  ]}
                  onSelect={(value) =>
                    handleInputChange("goal", value.value as Goal)
                  }
                />

                <TextInput
                  label="What is your weekly budget for meals?"
                  placeholder="Enter your budget"
                  keyboardType="number-pad"
                  value={formValues.weeklyMealBudget.toString()}
                  onChangeText={(value) =>
                    handleInputChange("weeklyMealBudget", +value)
                  }
                  error={errors.weeklyMealBudget}
                />

                <Select
                  label="Do you use any nutritional supplements?"
                  items={[
                    { id: "1", option: "Yes", value: true },
                    { id: "2", option: "No", value: false },
                  ]}
                  onSelect={(value) =>
                    handleInputChange(
                      "isUseAnySupplements",
                      value.value as boolean,
                    )
                  }
                />

                <TextInput
                  label="If yes, please mention them"
                  placeholder="Enter your supplement names"
                  value={formValues.supplements}
                  onChangeText={(value) =>
                    handleInputChange("supplements", value)
                  }
                  error={errors.supplements}
                />

                <Box mt="sm">
                  <Button title="Next" onPress={handleNextStep} />
                </Box>
              </Box>
            </KeyboardAwareScrollView>
          </View>

          {/* NOTE: screen 4 */}
          <View key="4" style={{ flex: 1 }}>
            <KeyboardAwareScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              enableOnAndroid={true}
              extraScrollHeight={20}
            >
              <Box gap="base" px="md">
                <Select
                  label="How would you rate your cardiovascular endurance?"
                  items={[
                    {
                      id: "1",
                      option: "Poor",
                      value: Cardiovascular.Poor,
                    },
                    {
                      id: "2",
                      option: "Fair",
                      value: Cardiovascular.Fair,
                    },
                    {
                      id: "3",
                      option: "Good",
                      value: Cardiovascular.Good,
                    },
                    {
                      id: "4",
                      option: "Excellent",
                      value: Cardiovascular.Excellent,
                    },
                  ]}
                  onSelect={(value) =>
                    handleInputChange(
                      "cardiovascular",
                      value.value as Cardiovascular,
                    )
                  }
                />

                <TextInput
                  keyboardType="number-pad"
                  label="How many push-ups can you perform in one set?"
                  placeholder="Leave blank if you don't know"
                  value={formValues.oneSetPushUpCount.toString()}
                  onChangeText={(value) =>
                    handleInputChange("oneSetPushUpCount", Number(value))
                  }
                />

                <TextInput
                  keyboardType="number-pad"
                  label="How many bodyweight squats can you perform in one set?"
                  placeholder="Leave blank if you don't know"
                  value={formValues.oneSetBodyWeightSquats.toString()}
                  onChangeText={(value) =>
                    handleInputChange("oneSetBodyWeightSquats", Number(value))
                  }
                />

                <TextInput
                  keyboardType="number-pad"
                  label="How many pull-ups can you perform in one set?"
                  placeholder="Leave blank if you don't know"
                  value={formValues.oneSetPullUps.toString()}
                  onChangeText={(value) =>
                    handleInputChange("oneSetPullUps", Number(value))
                  }
                />

                <Select
                  label="Can you touch your toes while keeping your legs straight?"
                  items={[
                    {
                      id: "1",
                      option: "Yes",
                      value: true,
                    },
                    {
                      id: "2",
                      option: "No",
                      value: false,
                    },
                  ]}
                  onSelect={(value) =>
                    handleInputChange(
                      "canTouchToesKeepingLegsStraight",
                      value.value as boolean,
                    )
                  }
                />

                <Select
                  label="Do you practice any flexibility exercises (e.g., stretching, yoga)?"
                  items={[
                    {
                      id: "1",
                      option: "Yes",
                      value: true,
                    },
                    {
                      id: "2",
                      option: "No",
                      value: false,
                    },
                  ]}
                  onSelect={(value) =>
                    handleInputChange(
                      "isPracticingAnyFlexibilityExercises",
                      value.value as boolean,
                    )
                  }
                />

                <Box mt="sm">
                  <Button title="Next" onPress={handleNextStep} />
                </Box>
              </Box>
            </KeyboardAwareScrollView>
          </View>

          {/* NOTE: screen 5 */}
          <View key="5" style={{ flex: 1 }}>
            <KeyboardAwareScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              enableOnAndroid={true}
              extraScrollHeight={20}
            >
              <Box gap="base" px="md">
                <InputLabel label="Please upload 4 images of your body in a clear background." />

                <ImageInput
                  label="Front View"
                  onImageUpload={(value) =>
                    handleImageUpload("frontView", value)
                  }
                />
                <ImageInput
                  label="Back View"
                  onImageUpload={(value) =>
                    handleImageUpload("backView", value)
                  }
                />
                <ImageInput
                  label="Side View"
                  onImageUpload={(value) =>
                    handleImageUpload("sideView", value)
                  }
                />
                <ImageInput
                  label="Lower Body View"
                  onImageUpload={(value) =>
                    handleImageUpload("lowerBodyView", value)
                  }
                />

                <Box mt="sm">
                  <Button
                    title="Submit"
                    onPress={handleSubmit}
                    isLoading={isLoading}
                    disabled={
                      imageUploads.frontView.length === 0 ||
                      imageUploads.backView.length === 0 ||
                      imageUploads.sideView.length === 0 ||
                      imageUploads.lowerBodyView.length === 0
                    }
                  />
                </Box>
              </Box>
            </KeyboardAwareScrollView>
          </View>
        </PagerView>
      </Box>
    </PageWrapper>
  );
};

export default TrainerApplicationScreen;
