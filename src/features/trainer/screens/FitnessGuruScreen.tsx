import React, { useEffect, useState } from "react";
import { View } from "react-native";

import { store } from "@/store";
import PageHeader from "@components/app/header/PageHeader";
import InfoCard from "@components/app/InfoCard";
import PageWrapper from "@components/app/PageWrapper";
import ProfileHeaderCard from "@components/app/ProfileHeaderCard";
import { Calendar, Users } from "lucide-react-native";
import { MyTabNavigatorScreenProps } from "@navigation/types";
import { ScrollView } from "react-native-gesture-handler";
import {
  Subscription,
  SubscriptionPlans,
} from "@utils/types/subscriptionTypes";
import { useQuery } from "react-query";
import { getFitnessGuruRequest } from "@utils/services/trainersService";
import { getClientWorkoutsForTrainerView } from "@utils/services/workoutService";
import { getClientMealForTrainerView } from "@utils/services/mealPlanService";
import PlanCategoryCard from "@features/overview/components/PlanCategoryCard";
import { gymActions } from "@features/gym/context/slice";
import { WorkoutType } from "@utils/types/types";
import { MealPlanType } from "@utils/types/mealPlanTypes";
import Box from "@components/atoms/Box";
import { hasPremiumAccess } from "@utils/helpers";

const cardsGap = 14;

const FitnessGuruScreen: React.FC<MyTabNavigatorScreenProps<"FitnessGuru">> = ({
  navigation,
}) => {
  const { user } = store.getState()["feature/auth"];
  const [subscription, setSubscription] = useState<any>(undefined);

  const {
    isLoading: isFitnessGuruRequestLoading,
    data: fitnessGuruRequest,
    error: fitnessGuruRequestError,
    refetch: fitnessGuruRequestRefetch,
  } = useQuery("fitnessGuruRequest", getFitnessGuruRequest);

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

  // Filter workouts to only include those with type 'FitnessGuruCreated'
  const filteredWorkout = workout?.filter(
    (w) => w.type === "FitnessGuruCreated"
  );

  // Filter meals to only include those with type 'FitnessGuruCreated'
  const filteredMeal = meal?.filter((m) => m.type === "FitnessGuruCreated");

  useEffect(() => {
    setSubscription(user?.subscription);
  }, [user]);

  useEffect(() => {
    fitnessGuruRequestRefetch();
    workoutRefetch();
    mealRefetch();
  }, [fitnessGuruRequestRefetch, workoutRefetch, mealRefetch]);

  return (
    <Box flex={1}>
      <PageWrapper>
        <PageHeader title="Fitness Guru" />

        <View style={{ marginBottom: cardsGap }}>
          <ProfileHeaderCard
            image={require("assets/logo-Icon-new.png")}
            name={"Fitness Guru"}
            details={[
              {
                icon: ({ color, size }) => (
                  <Calendar color={color} size={size} />
                ),
                value: "10 Years Experience",
              },
              {
                icon: ({ color, size }) => <Users color={color} size={size} />,
                value: "Men & Women",
              },
            ]}
            isDashboardLink={false}
          />
        </View>
        {fitnessGuruRequest?.status !== "Pending" &&
          // (subscription && subscription.status === true ? (

          //check if user has premium access - Testing Free Trial
          ((subscription && subscription?.status === true) ||
          user?.isTrialActive === true ? (
            <InfoCard
              description="By clicking start your journey button, you will be redirected to fill a form where your trainer will create custom workout routines and meal plans based on your input data."
              imageSource={require("assets/images/trainer-with-form.png")}
              buttonTitle="Start Your Journey"
              buttonOnPress={() =>
                navigation.push("TrainerApplication", {
                  trainerId: "fitness-guru",
                  packageId: "456",
                })
              }
            />
          ) : (
            <InfoCard
              title="Need Assistance in Your Training?"
              description="Get yourself a personal trainer at your fingertips."
              imageSource={require("assets/images/trainer-with-form.png")}
              buttonTitle="Invest in Yourself"
              buttonOnPress={() => navigation.navigate("PricingPackages")}
            />
          ))}

        {fitnessGuruRequest?.status === "Pending" &&
          (!filteredWorkout?.length || !filteredMeal?.length) && (
            <InfoCard
              title="Your Schedule is on the way"
              description="Your data have been shared with your fitnessguru. You will be displayed your workout routines and meal plans once the fitnessguru shared with you."
              imageSource={require("assets/images/green-tick.png")}
            />
          )}

        {/* Conditionally render PlanCategoryCard based on filteredWorkout presence */}
        <View style={{ display: "flex", gap: 10, paddingTop: 10 }}>
          {filteredWorkout && filteredWorkout.length > 0 && (
            <PlanCategoryCard
              category="workout"
              onPress={() => {
                store.dispatch(
                  gymActions.setSelectedWorkout({
                    WorkoutType: WorkoutType.FitnessGuruCreated,
                    createdBy: fitnessGuruRequest?.trainerId,
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
                    MealPlanType.FitnessGuruCreated
                  )
                );
                navigation.navigate("MealPlan");
              }}
            />
          )}
        </View>
      </PageWrapper>
    </Box>
  );
};

export default FitnessGuruScreen;
