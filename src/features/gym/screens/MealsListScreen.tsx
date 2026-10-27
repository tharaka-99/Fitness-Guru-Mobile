import React, { useMemo, useState } from "react";
import { FlatList, TouchableOpacity, StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Utensils } from "lucide-react-native";

import PageHeader from "@components/app/header/PageHeader";
import PageWrapper from "@components/app/PageWrapper";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { MyStackNavigatorScreenProps } from "@navigation/types";
import {
  getMealPlan,
  calculateMealItemsNutrition,
} from "@utils/services/mealPlanService";
import { theme } from "@utils/styles/theme";
import {
  MealItem,
  MealPlan,
  MealPlanType,
  MealType,
} from "@utils/types/mealPlanTypes";
import MealsListItem from "../components/MealsListItem";
import MealCalorieBreakdownCard from "../components/MealCalorieBreakdownCard";
import { gymActions } from "../context/slice";

interface MealTabOption {
  label: string;
  type: MealType;
}

const MEAL_TABS: MealTabOption[] = [
  { label: "Breakfast", type: MealType.Breakfast },
  { label: "Lunch", type: MealType.Lunch },
  { label: "Snack", type: MealType.Snack },
  { label: "Dinner", type: MealType.Dinner },
];

const MealsListScreen: React.FC<MyStackNavigatorScreenProps<"MealsList">> = ({
  navigation,
}) => {
  const dispatch = useDispatch();

  const {
    selectedMealPlan,
    selectedMealType = MealType.Breakfast,
    selectedMealPlanType = MealPlanType.FitnessGuruCreated,
  } = useSelector((state: any) => state["feature/gym"]);

  // Local state for active meal tab, initialized from redux
  const [activeMealType, setActiveMealType] = useState<MealType>(
    selectedMealType || MealType.Breakfast
  );

  // Fetch or retrieve cached meal plans
  const { data: mealPlans } = useQuery<MealPlan[]>({
    queryKey: ["mealPlan"],
    queryFn: getMealPlan,
  });

  // Find the meal plan corresponding to the selected plan type
  const activePlan = useMemo(() => {
    if (!mealPlans || mealPlans.length === 0) return null;
    return (
      mealPlans.find((plan) => plan.type === selectedMealPlanType) ||
      mealPlans.find((plan) => plan.type === MealPlanType.FitnessGuruCreated) ||
      mealPlans[0]
    );
  }, [mealPlans, selectedMealPlanType]);

  // Extract items for the currently active meal tab
  const currentMealItems: MealItem[] = useMemo(() => {
    if (activePlan && activePlan[activeMealType]) {
      return activePlan[activeMealType];
    }
    // Fallback to redux selectedMealPlan if active tab matches initial
    if (activeMealType === selectedMealType && selectedMealPlan?.length) {
      return selectedMealPlan;
    }
    return [];
  }, [activePlan, activeMealType, selectedMealType, selectedMealPlan]);

  // Calculate nutrition breakdown for the current single meal
  const mealNutrition = useMemo(() => {
    return calculateMealItemsNutrition(currentMealItems);
  }, [currentMealItems]);

  const handleTabPress = (type: MealType) => {
    setActiveMealType(type);
    dispatch(gymActions.setSelectedMealType(type));
    if (activePlan && activePlan[type]) {
      dispatch(gymActions.setselectedMealPlanType(activePlan[type]));
    }
  };

  const getMealDisplayName = (type: MealType): string => {
    switch (type) {
      case MealType.Breakfast:
        return "Breakfast";
      case MealType.Lunch:
        return "Lunch";
      case MealType.Snack:
        return "Snack";
      case MealType.Dinner:
        return "Dinner";
      default:
        return String(type);
    }
  };

  return (
    <PageWrapper>
      <PageHeader
        title={getMealDisplayName(activeMealType)}
        leftComponent={
          <Box flexDirection="row" alignItems="center" gap="md">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={28} color={theme.colors.PrimaryGreen} />
            </TouchableOpacity>
            <Text color="PrimaryGreen" variant="xlBold" numberOfLines={1}>
              {getMealDisplayName(activeMealType)}
            </Text>
          </Box>
        }
      />

      <FlatList
        data={currentMealItems}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) =>
          item._id ? String(item._id) : String(index)
        }
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Box gap="md" mb="md">
            {/* SINGLE MEAL CALORIE BAR BREAKDOWN */}
            <MealCalorieBreakdownCard
              nutrition={mealNutrition}
              title={`${getMealDisplayName(activeMealType)} Calories`}
              mealBadge={activeMealType}
            />

            {/* SECTION TITLE ROW */}
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              pt="xs"
            >
              <Text variant="mdBold" color="PrimaryWhite">
                Meal Items
              </Text>
              <Box
                backgroundColor="PrimaryGrey"
                px="sm"
                py="xs"
                borderRadius="full"
              >
                <Text variant="xs" color="textSecondary">
                  {currentMealItems.length}{" "}
                  {currentMealItems.length === 1 ? "item" : "items"}
                </Text>
              </Box>
            </Box>
          </Box>
        }
        ListEmptyComponent={
          <Box
            p="xl"
            alignItems="center"
            justifyContent="center"
            backgroundColor="PrimaryGrey"
            borderRadius="md"
            borderWidth={1}
            borderColor="PrimaryGreyDark"
            my="lg"
          >
            <Box
              width={54}
              height={54}
              borderRadius="full"
              backgroundColor="PrimaryGreyDark"
              alignItems="center"
              justifyContent="center"
              mb="md"
            >
              <Utensils size={24} color={theme.colors.SecondaryGrey} />
            </Box>
            <Text variant="mdBold" color="PrimaryWhite" mb="xs">
              No items in this meal
            </Text>
            <Text variant="sm" color="textSecondary" textAlign="center">
              No food items planned for {getMealDisplayName(activeMealType)}.
            </Text>
          </Box>
        }
        renderItem={({ item, index }) => {
          const { count = 0 } = item || {};
          const mealItemId =
            item &&
            typeof item.mealItemId === "object" &&
            item.mealItemId !== null
              ? item.mealItemId
              : null;

          const unit = mealItemId?.unit || item?.unit || "";
          const name = mealItemId?.name || item?.name || "Unknown Item";
          const url =
            mealItemId?.imageUrl || mealItemId?.url || item?.url || "";
          const id = mealItemId?._id || item?._id || String(index);
          const description = `${count} ${unit}`;

          // Calculate item-specific calories
          const rawUnitAmount = Number(
            mealItemId?.unitAmount ?? item?.unitAmount
          );
          const unitAmount = rawUnitAmount > 0 ? rawUnitAmount : 100;
          const multiplier = (Number(count) || 0) / unitAmount;
          const itemCarbs = (Number(mealItemId?.carbs) || 0) * multiplier;
          const itemFats = (Number(mealItemId?.fats) || 0) * multiplier;
          const itemProtein = (Number(mealItemId?.protein) || 0) * multiplier;
          const calculatedCals = itemCarbs * 4 + itemFats * 9 + itemProtein * 4;
          const calPerUnit =
            Number(mealItemId?.calPerUnit ?? item?.calPerUnit) || 0;
          const itemCalories =
            calculatedCals > 0 ? calculatedCals : calPerUnit * multiplier;

          return (
            <MealsListItem
              key={id}
              title={name}
              image={url}
              description={description}
              unitCount={
                itemCalories > 0
                  ? `${Math.round(itemCalories).toLocaleString()} kcal`
                  : undefined
              }
            />
          );
        }}
      />
    </PageWrapper>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    gap: theme.spacing.base,
    paddingBottom: 32,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.PrimaryGrey,
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.PrimaryGreyDark,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTabButton: {
    backgroundColor: theme.colors.PrimaryGreen,
  },
  tabText: {
    fontSize: 12,
  },
  activeTabText: {
    fontWeight: "700",
    color: theme.colors.PrimaryBlack,
  },
  inactiveTabText: {
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
});

export default MealsListScreen;
