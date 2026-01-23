import { ArrowLeft, Calendar, Users } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";

import InfoCard from "@components/app/InfoCard";
import PageHeader from "@components/app/header/PageHeader";
import PageWrapper from "@components/app/PageWrapper";
import ProfileHeaderCard from "@components/app/ProfileHeaderCard";
import Box from "@components/atoms/Box";
import { MyStackNavigatorScreenProps } from "@navigation/types";
import PricingPlanCard from "../components/PricingPlanCard";
import { useQuery } from "react-query";
import {
  getTrainerPackagesById,
  getTrainerRequestById,
} from "@utils/services/trainersService";
import { ActivityIndicator, Icon } from "react-native-paper";
import { useSelector } from "react-redux";
import { capitalizeString } from "@utils/helpers";
import { getClientWorkoutsForTrainerView } from "@utils/services/workoutService";
import PlanCategoryCard from "@features/overview/components/PlanCategoryCard";
import { getClientMealForTrainerView } from "@utils/services/mealPlanService";
import { store } from "@/store";
import { gymActions } from "@features/gym/context/slice";
import { WorkoutType } from "@utils/types/types";
import { MealPlanType, MealType } from "@utils/types/mealPlanTypes";
import { FlatList } from "react-native-gesture-handler";
import { theme } from "@utils/styles/theme";
import FullScreenLoader from "@components/atoms/FullScreenLoader";
import Text from "@components/atoms/Text";
import ErrorDisplay from "@components/atoms/ErrorDisplay";

const TrainerProfileScreen: React.FC<
  MyStackNavigatorScreenProps<"TrainerProfile">
> = ({ navigation }) => {
  const [isSelectedPackage, setIsSelectedPackage] = useState<boolean>(false);
  const { trainer } = useSelector((state: any) => state["feature/trainer"]);

  const {
    isLoading: isTrainerPackagesLoading,
    data: trainerPackages,
    refetch: trainerPackagesRefetch,
    error,
  } = useQuery(["trainerPackages", trainer?._id], () =>
    getTrainerPackagesById(trainer?._id)
  );

  const {
    isLoading: isTrainerRequestLoading,
    data: trainerRequest,
    refetch: trainerRequestRefetch,
  } = useQuery(["getTrainerRequestById", trainer?._id], () =>
    getTrainerRequestById(trainer?._id)
  );
  const {
    isLoading: isWorkoutLoading,
    data: workout,
    error: workoutError,
    refetch: workoutRefetch,
  } = useQuery("workout", getClientWorkoutsForTrainerView);

  const {
    isLoading: isMealLoading,
    data: meal,
    error: mealError,
    refetch: mealRefetch,
  } = useQuery("meal", getClientMealForTrainerView);

  // Filter workouts to only include those with type 'TrainerCreated' and created by this trainer
  const filteredWorkout = workout?.filter(
    (w) => w.type === "TrainerCreated" && w.createdBy === trainer?._id
  );

  // Filter meals to only include those with type 'TrainerCreated' and created by this trainer
  const filteredMeal = meal?.filter(
    (m) => m.type === "TrainerCreated" && m.createdBy === trainer?._id
  );

  useEffect(() => {
    trainerPackagesRefetch();
    trainerRequestRefetch();
    workoutRefetch();
    mealRefetch();
  }, [
    trainerPackagesRefetch,
    trainerRequestRefetch,
    workoutRefetch,
    mealRefetch,
  ]);

  if (isTrainerPackagesLoading || isWorkoutLoading) {
    return (
      <FullScreenLoader
        message="Loading your trainer's profile..."
        header={capitalizeString(trainer?.firstName) + " " + trainer?.lastName}
      />
    );
  }

  if (error || workoutError) {
    return (
      <ErrorDisplay
        message="Error loading data. Please check your connection or try again."
        onRetry={() => {
          trainerPackagesRefetch();
          workoutRefetch();
        }}
      />
    );
  }

  return (
    <ScrollView>
      <PageWrapper>
        <PageHeader
          title={capitalizeString(trainer?.firstName) + " " + trainer?.lastName}
          leftComponent={
            <Box flexDirection="row" alignItems="center" gap="md">
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <ArrowLeft size={30} color={theme.colors.PrimaryGreen} />
              </TouchableOpacity>
              <Text color="PrimaryGreen" variant="xlBold" numberOfLines={1}>
                {capitalizeString(trainer?.firstName) + " " + trainer?.lastName}
              </Text>
            </Box>
          }
        />
        <Box gap="lg">
          <ProfileHeaderCard
            image={trainer?.profileImageFileUrl || null}
            name={
              capitalizeString(trainer?.firstName) + " " + trainer?.lastName
            }
            nameTextColor="textPrimary"
            details={[
              {
                icon: ({ color, size }) => (
                  <Calendar color={color} size={size} />
                ),
                value: `${trainer?.yearsOfExperience ?? 1} years experience`,
              },
              {
                icon: ({ color, size }) => <Users color={color} size={size} />,
                value: trainer?.trainingFor ?? "Men",
              },
            ]}
          />

          {/* Display PricingPlanCard if there's no workout and user isn't waiting for trainer response */}
          {!filteredWorkout?.length &&
            !filteredMeal?.length &&
            trainerRequest?.status !== "Pending" &&
            !isSelectedPackage && (
              <>
                <PricingPlanCard
                  packageInfo={trainerPackages ?? []}
                  onButtonPress={(selectedPackage) => {
                    setIsSelectedPackage(true);
                  }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                  }}
                >
                  {trainer?.portfolioFileData?.map((item: any) => (
                    <View
                      key={item?.portfolioFileKey}
                      style={{
                        width: "48%",
                        marginBottom: 10,
                        alignItems: "center",
                      }}
                    >
                      <Image
                        resizeMode="cover"
                        source={{ uri: item?.portfolioFileUrl }}
                        style={{
                          height: 180,
                          width: 180,
                          borderRadius: 10,
                        }}
                      />
                    </View>
                  ))}
                </View>
              </>
            )}

          {/* Display InfoCard for "Start Your Journey" if package is selected */}
          {isSelectedPackage && trainerRequest?.status !== "Pending" && (
            <InfoCard
              description="By clicking start your journey button, you will be redirected to fill a form where your trainer will create custom workout routines and meal plans based on your input data."
              imageSource={require("assets/images/trainer-with-form.png")}
              buttonTitle="Start Your Journey"
              buttonOnPress={() =>
                navigation.push("TrainerApplication", {
                  trainerId: trainer?._id,
                  packageId: "456",
                })
              }
            />
          )}

          {/* Display InfoCard for "Your Schedule is on the way" if waiting for trainer response */}
          {filteredMeal?.length === 0 &&
            filteredWorkout?.length === 0 &&
            trainerRequest?.status === "Pending" && (
              <InfoCard
                title="Your Schedule is on the way"
                description="Your data have been shared with your trainer. You will be displayed your workout routines and meal plans once the trainer shared with you."
                imageSource={require("assets/images/green-tick.png")}
              />
            )}

          {/* Conditionally render PlanCategoryCard based on filteredWorkout presence */}
          {filteredWorkout && filteredWorkout.length > 0 && (
            <PlanCategoryCard
              category="workout"
              onPress={() => {
                store.dispatch(
                  gymActions.setSelectedWorkout({
                    WorkoutType: WorkoutType.TrainerCreated,
                    createdBy: trainer?._id,
                  })
                );
                navigation.navigate("WorkoutRoutine");
              }}
            />
          )}

          {filteredMeal && filteredMeal.length > 0 && (
            <PlanCategoryCard
              category="meal"
              onPress={() => {
                store.dispatch(
                  gymActions.setSelectedMealPlanType(
                    MealPlanType.TrainerCreated
                  )
                );
                navigation.navigate("MealPlan");
              }}
            />
          )}
        </Box>
      </PageWrapper>
    </ScrollView>
  );
};

export default TrainerProfileScreen;
