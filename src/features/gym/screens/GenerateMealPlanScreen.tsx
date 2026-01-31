import BottomSheet from "@gorhom/bottom-sheet";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Keyboard, TouchableOpacity, View } from "react-native";
import { ArrowLeft, ArrowRight, Search } from "lucide-react-native";

import { store } from "@/store";
import PageWrapper, { SCREEN_HEIGHT } from "@components/app/PageWrapper";
import PageHeader from "@components/app/header/PageHeader";
import Box from "@components/atoms/Box";
import SearchBar from "@components/atoms/SearchBar";
import { MyStackNavigatorScreenProps } from "@navigation/types";
import {
  createMealPlan,
  getCurrentMealPlan,
  getMealItems,
  updateMealPlan,
} from "@utils/services/mealPlanService";
import { constants, theme } from "@utils/styles/theme";
import {
  CreateMealPlanDto,
  MealItem,
  MealItemDto,
  MealType,
} from "@utils/types/mealPlanTypes";
import { StyleSheet } from "react-native";
import { Modal, Button } from "react-native-paper";
import Toast from "react-native-toast-message";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import AddMealCard from "../components/AddMealSheet";
import MealCalorieInfoCard, {
  MealCalorieSection,
} from "../components/MealCalorieInfoCard";
import MealsListItem from "../components/MealsListItem";
import { gymActions } from "../context/slice";
import Text from "@components/atoms/Text";

const GenerateMealPlanScreen: React.FC<
  MyStackNavigatorScreenProps<"GenerateMealPlan">
> = ({ navigation }) => {
  const { user } = store.getState()["feature/auth"];
  const { profile } = store.getState()["feature/overview"];
  const goal = profile?.fitnessInfo?.goal;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedMealItem, setSelectedMealItem] = useState<MealItem>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [nextMealType, setNextMealType] = useState<MealType>(
    MealType.Breakfast,
  );
  const [readyToSubmit, setReadyToSubmit] = useState<boolean>(false);

  const {
    mealDetails,
    totalCalories,
    caloryRequirements,
    breakfastCalories,
    dinnerCalories,
    snackCalories,
    lunchCalories,
    selectedMealType,
  } = useSelector((state: any) => state["feature/gym"]);

  const {
    isLoading: isMealItemsLoading,
    data: mealItems,
    refetch: mealItemsRefetch,
  } = useQuery("mealItems", getMealItems);
  //
  const {
    isLoading: isCurrentMealPlan,
    data: currentMealPlan,
    refetch: currentMealPlanRefetch,
  } = useQuery("currentMealPlan", getCurrentMealPlan);
  //
  useEffect(() => {
    if (currentMealPlan?.length) {
      const selfCreatedMealPlan = currentMealPlan.filter(
        (mealPlan) => mealPlan.type === "SelfCreated",
      )[0];

      // Process breakfast items
      selfCreatedMealPlan.breakfast.forEach((item) => {
        const food = mealItems?.find((f) => f._id === item.mealItemId._id);
        if (food) {
          store.dispatch(
            gymActions.updateCurrentMealFood({
              mealItemId: food?._id ?? "",
              count: item?.count,
              calPerUnit: food?.calPerUnit,
              mealType: MealType.Breakfast,
              unitAmount: food?.unitAmount,
            }),
          );
        }
      });
      // Process lunch items
      selfCreatedMealPlan.lunch.forEach((item) => {
        const food = mealItems?.find((f) => f._id === item.mealItemId._id);
        if (food) {
          store.dispatch(
            gymActions.updateCurrentMealFood({
              mealItemId: food?._id ?? "",
              count: item?.count,
              calPerUnit: food?.calPerUnit,
              mealType: MealType.Lunch,
            }),
          );
        }
      });
      // Process snack items
      selfCreatedMealPlan.snack.forEach((item) => {
        const food = mealItems?.find((f) => f._id === item.mealItemId._id);
        if (food) {
          store.dispatch(
            gymActions.updateCurrentMealFood({
              mealItemId: food?._id ?? "",
              count: item?.count,
              calPerUnit: food?.calPerUnit,
              mealType: MealType.Snack,
            }),
          );
        }
      });
      // Process dinner items
      selfCreatedMealPlan.dinner.forEach((item) => {
        const food = mealItems?.find((f) => f._id === item.mealItemId._id);
        if (food) {
          store.dispatch(
            gymActions.updateCurrentMealFood({
              mealItemId: food?._id ?? "",
              count: item?.count,
              calPerUnit: food?.calPerUnit,
              mealType: MealType.Dinner,
            }),
          );
        }
      });
    } else {
      store.dispatch(gymActions.resetMeals());
    }
  }, [currentMealPlan]);

  useEffect(() => {
    console.log("caloryRequirements", caloryRequirements);
    console.log("Type:", typeof caloryRequirements);
    console.log("Value:", user);

    // ✅ Console log for perMealRequirement calculation
    if (user?.calculatedMetrics?.dci) {
      const dci = user.calculatedMetrics.dci;
      const perMealRequirement = dci;
      console.log("=== GenerateMealPlanScreen - Calorie Requirements ===");
      console.log("DCI (Daily Calorie Intake):", dci);
      console.log("Per Meal Requirement (DCI):", perMealRequirement);
      console.log(
        "Current perMealLowerLimit:",
        caloryRequirements.perMealLowerLimit,
      );
      console.log(
        "Current perMealUpperLimit:",
        caloryRequirements.perMealUpperLimit,
      );
      console.log("Goal:", goal);
      console.log("===================================================");
    }
  }, [caloryRequirements, user]);
  //
  const getMealCount = (mealType: MealType, mealItemId: string) => {
    const mealItems = mealDetails[mealType.toLowerCase()] || [];
    const mealItem = mealItems.find(
      (item: any) => item.mealItemId === mealItemId,
    );
    return mealItem ? mealItem.count : 0;
  };
  //
  const filteredData = useMemo(() => {
    return mealItems
      ?.map((item) => {
        const isSelected = getMealCount(selectedMealType, item._id || "") > 0;
        return {
          ...item,
          selected: isSelected,
          count: isSelected
            ? getMealCount(selectedMealType, item._id || "")
            : 0, // Default count to 1 if not selected
        };
      })
      ?.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      ?.sort((a, b) => {
        if (a.selected === b.selected) {
          return a.name.localeCompare(b.name);
        }
        return a.selected ? -1 : 1;
      });
  }, [mealItems, searchTerm, mealDetails, selectedMealType]);

  //
  const handleMealItemPress = (mealItem: MealItem) => {
    Keyboard.dismiss();
    setSelectedMealItem(mealItem);
    bottomSheetRef.current?.snapToIndex(0);
  };
  //
  const handleAddMealItem = (count: number) => {
    store.dispatch(
      gymActions.updateMealFood({
        mealItemId: selectedMealItem?._id ?? "",
        count: count,
        calPerUnit: selectedMealItem?.calPerUnit,
        unitAmount: selectedMealItem?.unitAmount ?? 100,
      }),
    );
    bottomSheetRef.current?.close();
  };
  //
  const getPlannedCalorieIntakeByMealType = () => {
    switch (selectedMealType) {
      case MealType.Breakfast:
        return breakfastCalories;
      case MealType.Lunch:
        return lunchCalories;
      case MealType.Snack:
        return snackCalories;
      case MealType.Dinner:
        return dinnerCalories;
      default:
        return breakfastCalories;
    }
  };
  //
  const handleMealWarnPopUp = () => {
    const selectedCalories = getPlannedCalorieIntakeByMealType();
    if (
      selectedCalories < caloryRequirements.perMealLowerLimit ||
      selectedCalories > caloryRequirements.perMealUpperLimit
    ) {
      return true;
    }
    return false;
  };
  //
  const handleSetMealType = () => {
    const nextMealType = getNextMealType();
    if (selectedMealType === MealType.Dinner && handleMealWarnPopUp()) {
      setNextMealType(nextMealType);
      setModalVisible(true);
    } else {
      if (readyToSubmit) {
        store.dispatch(gymActions.setSelectedMealType(nextMealType));

        handleSubmitMealPlan();
      } else {
        store.dispatch(gymActions.setSelectedMealType(nextMealType));
      }
    }
  };
  //
  const getNextMealType = () => {
    switch (selectedMealType) {
      case MealType.Breakfast:
        return MealType.Lunch;
      case MealType.Lunch:
        return MealType.Snack;
      case MealType.Snack:
        return MealType.Dinner;
      case MealType.Dinner:
        setReadyToSubmit(true);
        return MealType.Dinner;
      default:
        return MealType.Breakfast;
    }
  };
  //
  const formatUnitCount = (count: number, unit: string): string => {
    const match = unit.match(/^(\d+)(.*)$/);

    if (!match) return `${count} ${unit}`;

    const unitValue = parseFloat(match[1]);
    const unitLabel = match[2].trim();
    return `${count * unitValue} ${unitLabel}`;
  };

  //
  const handleSubmitMealPlan = async () => {
    // Helper function to omit `calPerUnit` from meal items
    const omitCalPerUnit = (mealArray: MealItemDto[]) => {
      return mealArray.map(({ calPerUnit, ...rest }) => rest);
    };

    // Creating a new mealDetails object without calPerUnit
    const mealDetailsWithoutCalPerUnit = {
      ...mealDetails,
      breakfast: omitCalPerUnit(mealDetails.breakfast),
      lunch: omitCalPerUnit(mealDetails.lunch),
      snack: omitCalPerUnit(mealDetails.snack),
      dinner: omitCalPerUnit(mealDetails.dinner),
    };
    //NOTE:
    if (user?.subscription?.status === true) {
      try {
        const selfCreatedMealPlan =
          currentMealPlan?.length &&
          currentMealPlan?.filter(
            (mealPlan) => mealPlan.type === "SelfCreated",
          )[0];
        if (selfCreatedMealPlan && selfCreatedMealPlan?._id) {
          await updateMealPlan(
            selfCreatedMealPlan?._id,
            mealDetailsWithoutCalPerUnit,
          );
        } else {
          await createMealPlan(mealDetailsWithoutCalPerUnit);
        }

        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Meal plan saved successfully!",
        });
        store.dispatch(gymActions.setSelectedMealType(MealType.Breakfast));
        store.dispatch(gymActions.resetMeals());
        navigation.navigate("Home");
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to save meal plan.",
        });
      } finally {
        setModalVisible(false);
      }
    } else {
      setModalVisible(false);
      navigation.push("PricingPackages");
    }
  };
  //
  const handleContinue = () => {
    setModalVisible(false);
    if (readyToSubmit) {
      store.dispatch(gymActions.setSelectedMealType(nextMealType));

      handleSubmitMealPlan();
    } else {
      store.dispatch(gymActions.setSelectedMealType(nextMealType));
    }
  };

  return (
    <PageWrapper>
      <Box mb="base">
        {/* Always render the container to keep the layout stable */}
        <Box height={55} justifyContent="center">
          {!showSearchBar ? (
            <PageHeader
              leftComponent={
                <Box flexDirection="row" alignItems="center" gap="md">
                  <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowLeft size={30} color={theme.colors.PrimaryGreen} />
                  </TouchableOpacity>
                  <Text color="PrimaryGreen" variant="xlBold" numberOfLines={1}>
                    Generate Meal Plans
                  </Text>
                </Box>
              }
              rightComponent={
                <TouchableOpacity
                  onPress={() => setShowSearchBar(true)}
                  activeOpacity={constants.activeOpacity}
                >
                  <Box px="sm" py="xs">
                    <Search size={23} color={theme.colors.PrimaryWhite} />
                  </Box>
                </TouchableOpacity>
              }
            />
          ) : (
            <SearchBar
              value={searchTerm}
              // onClear={() => setSearchTerm("")}
              onChangeText={(v) => setSearchTerm(v)}
              onCancel={() => {
                setSearchTerm("");
                setShowSearchBar(false);
              }}
            />
          )}
        </Box>
      </Box>

      {!showSearchBar && (
        <Box flexDirection="row" justifyContent="flex-end" mb="md">
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: theme.colors.PrimaryGreen,
              borderRadius: theme.borderRadii.xs,
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: theme.spacing.xs,
              backgroundColor: theme.colors.backgroundPrimary,
              gap: theme.spacing.xs,
            }}
            onPress={() => handleSetMealType()}
            activeOpacity={constants.activeOpacity}
          >
            <Text
              variant="lgBold"
              style={{
                color: theme.colors.PrimaryGreen,
              }}
            >
              Next
            </Text>
            <ArrowRight size={20} color={theme.colors.PrimaryGreen} />
          </TouchableOpacity>
        </Box>
      )}

      <Box height={SCREEN_HEIGHT}>
        <FlatList
          data={filteredData}
          style={{ flex: 1 }}
          stickyHeaderIndices={[0]}
          keyExtractor={({ _id }) => String(_id)}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponentStyle={{ marginBottom: theme.spacing.md }}
          contentContainerStyle={{ paddingBottom: theme.spacing.md, gap: 1 }}
          ListHeaderComponent={
            <>
              <MealCalorieInfoCard
                totalIntakeData={{
                  maxCalarieIntake: caloryRequirements.totalUpperLimit,
                  minCalorieIntake: caloryRequirements.totalLowerLimit,
                  yourPlannedCalorieIntake: totalCalories,
                }}
                summary={{
                  baseMetabolicRate:
                    `${user?.calculatedMetrics?.bmr.toFixed(2)}Cal` ||
                    "0.00Cal",
                  dailyCalorieIntake:
                    `${user?.calculatedMetrics?.dci.toFixed(2)}Cal` ||
                    "0.00Cal",
                }}
              />
              <MealCalorieSection
                intakeDataByMeal={{
                  mealName: selectedMealType || MealType.Breakfast,
                  minCalorieIntake: caloryRequirements.perMealLowerLimit,
                  maxCalorieIntake: caloryRequirements.perMealUpperLimit,
                  yourPlannedCalorieIntake: getPlannedCalorieIntakeByMealType(),
                }}
              />
            </>
          }
          renderItem={({ item }) => {
            const {
              _id,
              name,
              unit,
              calPerUnit,
              selected,
              count,
              unitAmount,
              url,
            } = item;

            return (
              <TouchableOpacity
                activeOpacity={constants.activeOpacity}
                onPress={() => handleMealItemPress(item)}
              >
                <Box
                  p="sm"
                  backgroundColor={selected ? "SecondaryGreen" : undefined}
                >
                  <MealsListItem
                    key={String(_id)}
                    title={name}
                    image={url || image}
                    unitCount={selected ? formatUnitCount(count, unit) : ""}
                    description={`${calPerUnit}Cal per unit (${unitAmount + unit
                      })`}
                    theme={selected ? "green" : undefined}
                  />
                </Box>
              </TouchableOpacity>
            );
          }}
        />
      </Box>

      <AddMealCard
        image={selectedMealItem?.url || image}
        mealName={selectedMealItem?.name || "Meal item"}
        unit={selectedMealItem?.unit || "Unit"}
        caloriesPerUnit={`${selectedMealItem?.calPerUnit}Cal per ${selectedMealItem?.unitAmount + " " + selectedMealItem?.unit
          }`}
        bottomSheetRef={bottomSheetRef}
        selectedMealItemcount={selectedMealItem?.count || 0}
        handleAddMealItem={handleAddMealItem}
      />

      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Text variant="xlBold" textAlign="center" mb="md">
          Calorie Intake Warning
        </Text>
        <Text variant="lgBold" mb="md">
          Calorie intake for this meal type is out of bounds. Are you sure you
          want to continue?
        </Text>

        <Box flexDirection="row" justifyContent="space-between" mt="md">
          <Button
            onPress={() => setModalVisible(false)}
            style={styles.modalCancleButton}
          >
            <Text
              style={{
                fontSize: theme.textVariants.mdBold.fontSize,
                color: theme.colors.PrimaryWhite,
              }}
            >
              Cancel
            </Text>
          </Button>
          <Button onPress={handleContinue} style={styles.modalContinueButton}>
            <Text
              style={{
                fontSize: theme.textVariants.mdBold.fontSize,
                color: theme.colors.PrimaryBlack,
              }}
            >
              Continue
            </Text>
          </Button>
        </Box>
      </Modal>
    </PageWrapper>
  );
};

export default GenerateMealPlanScreen;

const image =
  "https://s3-alpha-sig.figma.com/img/10aa/1eb1/2f1ee4b7bac921a2be64883946236e89?Expires=1710115200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=I0jSdjgwo1g54o3ooA7wbc2EQbyXHGRLcjIOi5K9NdixdUve9Ehn9HiNgprFv~8DkUMiekYYX2j3B~MVCPpyboB2MTMLpgpcKHm5bTL05KSJ21POS3QmgT5fxriTaOH4FEB0WKJumHVt99mnRHK444Qtr9h9gwm-4ClS9UUqxqFr9dN2ry~jjse1mhFi5YH-nlBkGyGLqPb4BZq6VTep7L6DQCahu6hFeRqLuj8bznjd5OW9Jtfq1vfLSnUeOOEZaN~jXBsfmsa1-nLC1xx00EDsd6GqkCMxa8pSk-~WGoCd2Tvg~X9glEeI~wZ9de2Dvc~Y-nEr-bexURKMXGAWMw__";

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "black",
    padding: 20,
    margin: 20,
    borderRadius: 8,
    shadowColor: "rgba(0,0,0,0.8)",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    borderColor: theme.colors.PrimaryGrey,
    borderWidth: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalContent: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalContinueButton: {
    marginHorizontal: 5,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: theme.colors.PrimaryGreen,
  },
  modalCancleButton: {
    marginHorizontal: 5,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderColor: theme.colors.PrimaryGreen,
    borderWidth: 1,
  },
  nextButtonContainer: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.md,
    zIndex: 10,
  },
  nextButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
});
