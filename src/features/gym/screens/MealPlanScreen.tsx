import React, { useCallback, useRef } from "react";
import { FlatList, TouchableOpacity } from "react-native";

import PageHeader from "@components/app/header/PageHeader";
import PageWrapper from "@components/app/PageWrapper";
import { MyStackNavigatorScreenProps } from "@navigation/types";
import { theme } from "@utils/styles/theme";
import WorkoutDayCard from "../components/WorkoutDayCard";
import { useQuery } from "@tanstack/react-query";
import { getMealPlan } from "@utils/services/mealPlanService";
import { getScheduleReRequestEligibility } from "@utils/services/trainersService";
import { store } from "@/store";
import { MealPlanType, MealType } from "@utils/types/mealPlanTypes";
import { gymActions } from "../context/slice";
import { Icon } from "react-native-paper";
import { WorkoutType } from "@utils/types/types";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import Button from "@components/atoms/Button";
import { ArrowLeft, Plus } from "lucide-react-native";
import Toast from "react-native-toast-message";
import useSubscription from "@features/subscription/hooks/useSubscription";
import FullScreenLoader from "@components/atoms/FullScreenLoader";
import { useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import MealReRequestSheet from "@features/trainer/components/MealReRequestSheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";

const MealPlanScreen: React.FC<MyStackNavigatorScreenProps<"MealPlan">> = ({
  navigation,
}) => {
  const { isSubscribed } = useSubscription();
  const selectedMealPlanType = useSelector(
    (state: any) => state["feature/gym"].selectedMealPlanType
  );
  const mealSheetRef = useRef<BottomSheetModalMethods | null>(null);

  const {
    isLoading: isMealPlanLoading,
    data: mealPlan,
    refetch: mealPlanRefetch,
  } = useQuery({
    queryKey: ["mealPlan"],
    queryFn: getMealPlan,
  });

  const { data: eligibility, refetch: eligibilityRefetch } = useQuery({
    queryKey: ["scheduleReRequestEligibility"],
    queryFn: getScheduleReRequestEligibility,
  });

  useFocusEffect(
    useCallback(() => {
      mealPlanRefetch();
      eligibilityRefetch();
    }, [mealPlanRefetch, eligibilityRefetch])
  );

  if (isMealPlanLoading) {
    return <FullScreenLoader />;
  }

  const handleAddMealPlan = () => {
    navigation.navigate("Onboard", { fromMealPlan: true });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const handleMealRequest = () => {
    if (!isSubscribed) {
      mealSheetRef.current?.dismiss();
      Toast.show({
        type: "info",
        text1: "Subscription Required",
        text2: "Please subscribe to request a meal plan.",
      });
      navigation.navigate("PricingPackages");
      return;
    }
    if (!eligibility?.meal?.canRequest) {
      mealSheetRef.current?.dismiss();
      Toast.show({
        type: "info",
        text1: "Request Not Available",
        text2: eligibility?.meal?.nextRequestAt
          ? `You can request again on ${formatDate(
            eligibility?.meal?.nextRequestAt
          )}`
          : "Meal plan from Fitness Guru is required",
      });
      return;
    }
    mealSheetRef.current?.present();
  };

  const getMealEligibilityText = () => {
    if (!eligibility?.meal) return null;
    if (eligibility.meal.canRequest) {
      return {
        text: "You are eligible to request a new meal plan now",
        isEligible: true,
      };
    }
    if (eligibility.meal.remainingDays && eligibility.meal.remainingDays > 0) {
      const days = eligibility.meal.remainingDays;
      const dateStr = formatDate(eligibility.meal.nextRequestAt);
      return {
        text: `Next request available in ${days} day${days > 1 ? "s" : ""}${dateStr ? ` (${dateStr})` : ""
          }`,
        isEligible: false,
      };
    }
    if (eligibility.meal.nextRequestAt) {
      return {
        text: `Next request available on ${formatDate(
          eligibility.meal.nextRequestAt
        )}`,
        isEligible: false,
      };
    }
    return {
      text: "A meal plan from Fitness Guru is required to request an update",
      isEligible: false,
    };
  };

  let selectedMeal;

  if (selectedMealPlanType === MealPlanType.TrainerCreated) {
    selectedMeal = mealPlan?.filter(
      (item) => item.type === selectedMealPlanType
    );
  } else {
    selectedMeal = mealPlan?.filter((item, index) => {
      return item.type === selectedMealPlanType;
    });
  }

  const canRequestMeal = !!eligibility?.meal?.canRequest;

  return (
    <PageWrapper>
      <PageHeader
        rightComponent={
          selectedMealPlanType === MealPlanType.SelfCreated ? (
            <TouchableOpacity onPress={handleAddMealPlan}>
              <Plus size={30} color={theme.colors.PrimaryGreen} />
            </TouchableOpacity>
          ) : null
        }
        title="Meal Plan"
        leftComponent={
          <Box flexDirection="row" alignItems="center" gap="md">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={30} color={theme.colors.PrimaryGreen} />
            </TouchableOpacity>
            <Text color="PrimaryGreen" variant="xlBold" numberOfLines={1}>
              Meal Plan
            </Text>
          </Box>
        }
      />

      <FlatList
        data={selectedMeal}
        keyExtractor={(item, index) =>
          item._id ? String(item._id) : String(index)
        }
        contentContainerStyle={{ gap: theme.spacing.sm, flexGrow: 1 }}
        ListEmptyComponent={
          <Box flex={1} justifyContent="center" alignItems="center" px="xl">
            <Text variant="lgBold" color="textSecondary" textAlign="center">
              No meal plans found
            </Text>
          </Box>
        }
        renderItem={({ item }) => {
          const { breakfast = [], dinner = [], lunch = [], snack = [] } = item;

          const breakfastItems = breakfast.map((meal) => {
            return meal.mealItemId?.name || meal.name || "Unknown Item";
          });
          const lunchItems = lunch.map((meal) => {
            return meal.mealItemId?.name || meal.name || "Unknown Item";
          });
          const dinnerItems = dinner.map((meal) => {
            return meal.mealItemId?.name || meal.name || "Unknown Item";
          });
          const snackItems = snack.map((meal) => {
            return meal.mealItemId?.name || meal.name || "Unknown Item";
          });

          return (
            <>
              <WorkoutDayCard
                title={"Breakfast"}
                description={
                  breakfastItems?.length
                    ? breakfastItems.join(", ")
                    : "No breakfast"
                }
                onPress={() => {
                  store.dispatch(gymActions.setselectedMealPlanType(breakfast));
                  store.dispatch(
                    gymActions.setSelectedMealType(MealType.Breakfast)
                  );
                  navigation.push("MealsList");
                }}
              />
              <WorkoutDayCard
                title={"Lunch"}
                description={
                  lunchItems?.length ? lunchItems.join(", ") : "No lunch"
                }
                onPress={() => {
                  store.dispatch(gymActions.setselectedMealPlanType(lunch));
                  store.dispatch(
                    gymActions.setSelectedMealType(MealType.Lunch)
                  );
                  navigation.push("MealsList");
                }}
              />
              <WorkoutDayCard
                title={"Snack"}
                description={
                  snackItems?.length ? snackItems.join(", ") : "No snacks"
                }
                onPress={() => {
                  store.dispatch(gymActions.setselectedMealPlanType(snack));
                  store.dispatch(
                    gymActions.setSelectedMealType(MealType.Snack)
                  );
                  navigation.push("MealsList");
                }}
              />
              <WorkoutDayCard
                title={"Dinner"}
                description={
                  dinnerItems?.length ? dinnerItems.join(", ") : "No dinner"
                }
                onPress={() => {
                  store.dispatch(gymActions.setselectedMealPlanType(dinner));
                  store.dispatch(
                    gymActions.setSelectedMealType(MealType.Dinner)
                  );
                  navigation.push("MealsList");
                }}
              />
            </>
          );
        }}
      />

      {selectedMealPlanType !== MealPlanType.SelfCreated && (
        <Box pt="sm">
          <Button
            // type="outline"
            disabled={!canRequestMeal}
            title="Request New Meal Plan"
            onPress={handleMealRequest}
          />
          {(() => {
            const info = getMealEligibilityText();
            if (!info) return null;
            return (
              <Text
                variant="xs"
                color={"textSecondary"}
                textAlign="center"
                style={{ marginTop: -12 }}
                mb="sm"
              >
                {info.text}
              </Text>
            );
          })()}
        </Box>
      )}

      <MealReRequestSheet
        bottomSheetRef={mealSheetRef}
        onSuccess={() => {
          eligibilityRefetch();
        }}
      />
    </PageWrapper>
  );
};

export default MealPlanScreen;
