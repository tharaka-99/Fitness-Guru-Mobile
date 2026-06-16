import { MyStackNavigatorScreenProps } from "@navigation/types";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import Toast from "react-native-toast-message";
import { ArrowLeft } from "lucide-react-native";

import PageWrapper from "@components/app/PageWrapper";
import PricingPackageCard from "../components/PricingPackageCard";
import { theme } from "@utils/styles/theme";
import useSubscription from "@features/subscription/hooks/useSubscription";
import Text from "@components/atoms/Text";
import { useQueryClient } from "@tanstack/react-query";

import { authActions } from "@features/auth/context/slice";
import { gymActions } from "@features/gym/context/slice";
import { RootState, store } from "@/store";

import { setClientProfileInfo } from "@utils/services/authServices";
import { createMealPlan } from "@utils/services/mealPlanService";
import { getClientPackages } from "@utils/services/packageService";
import { createWorkout } from "@utils/services/workoutService";
import { MealItemDto } from "@utils/types/mealPlanTypes";
import { SubscriptionPlans } from "@utils/types/subscriptionTypes";
import {
  ExerciseDay,
  Exercises,
  Workout,
  WorkoutType,
} from "@utils/types/types";
import { hasPremiumAccess } from "@utils/helpers";

const { height: screenHeight } = Dimensions.get("window");

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Hook for fetching subscription packages
 */
const usePackageService = () => {
  const [packages, setPackages] = useState<SubscriptionPlans>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getClientPackages();
        setPackages(data);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to fetch packages");
        setError(error);
        console.error("Error fetching packages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, []);

  return { packages, isLoading, error };
};

/**
 * Hook for handling profile and workout setup
 */
const useProfileSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const setupProfile = useCallback(
    async (profile: any, gymData: any, user: any) => {
      try {
        setIsLoading(true);

        // Only create workout and meal plan if user has subscription
        if (user?.subscription?.status) {
          // Transform workout data - match the exact structure expected by API
          const transformedDays: Workout = {
            type: WorkoutType.SelfCreated,
            exerciseDays:
              gymData.days?.exerciseDays?.map((exerciseDay: ExerciseDay) => ({
                day: exerciseDay.day,
                exercises:
                  exerciseDay.exercises?.map((exercise: Exercises) => ({
                    order: exercise.order,
                    exercise: {
                      _id: exercise.exercise?._id,
                      name: exercise.exercise?.name,
                    },
                    sets: exercise.sets,
                    reps: exercise.reps,
                    rest: exercise.rest,
                  })) || [],
              })) || [],
          };

          // Remove calPerUnit from meal items
          const omitCalPerUnit = (mealArray: MealItemDto[]) =>
            mealArray?.map(({ calPerUnit, ...rest }) => rest) || [];

          const mealDetailsWithoutCalPerUnit = {
            ...gymData.mealDetails,
            breakfast: omitCalPerUnit(gymData.mealDetails?.breakfast || []),
            lunch: omitCalPerUnit(gymData.mealDetails?.lunch || []),
            snack: omitCalPerUnit(gymData.mealDetails?.snack || []),
            dinner: omitCalPerUnit(gymData.mealDetails?.dinner || []),
          };

          try {
            await createWorkout(transformedDays);
            queryClient.invalidateQueries({ queryKey: ["workout"] });
            queryClient.invalidateQueries({ queryKey: ["currentWorkout"] });
          } catch (workoutError) {
            console.error("❌ Workout creation failed:", workoutError);
            throw workoutError;
          }

          try {
            await createMealPlan(mealDetailsWithoutCalPerUnit);
            queryClient.invalidateQueries({ queryKey: ["mealPlan"] });
            queryClient.invalidateQueries({ queryKey: ["currentMealPlan"] });
          } catch (mealError) {
            console.error("❌ Meal plan creation failed:", mealError);
            throw mealError;
          }
        }

        // Always set profile info
        try {
          await setClientProfileInfo(profile);
          queryClient.invalidateQueries({ queryKey: ["profile"] });
        } catch (profileError) {
          console.error("❌ Profile setup failed:", profileError);
          throw profileError;
        }

        return { success: true };
      } catch (error) {
        console.error("Error during profile setup:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { setupProfile, isLoading };
};

/**
 * Hook for handling purchase and post-purchase actions
 */
const usePurchaseHandler = (options: any) => {
  const [isLoading, setIsLoading] = useState(false);

  const executePurchase = useCallback(
    async (packageId: string) => {
      try {
        // Validate offerings
        if (!options.offerings?.current?.availablePackages.length) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "No subscription packages available.",
          });
          return;
        }

        // Map package ID to RevenueCat identifier
        const packageIdentifier = packageId === "Premium" ? "$rc_monthly" : "";

        // Find selected package
        const selectedPackage =
          options.offerings.current.availablePackages.find(
            (pkg: any) => pkg.identifier === packageIdentifier
          );

        if (!selectedPackage) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Selected package not found.",
          });
          return;
        }

        setIsLoading(true);

        // Execute purchase
        await options.purchasePackage(selectedPackage);

        // Handle injured user
        if (options.user?.isInjured) {
          options.dispatch(authActions.setIsInjured(true));
          options.navigation.navigate("Tab", { screen: "FitnessGuru" });
          return;
        }

        // Handle default workout
        if (
          options.gymData?.selectedWorkout?.WorkoutType === WorkoutType.Default
        ) {
          try {
            await setClientProfileInfo(options.profile);
          } catch (err) {
            console.error("Error setting profile for default workout:", err);
          }
          options.navigation.navigate("Tab", { screen: "FitnessGuru" });
          return;
        }

        // Get fresh subscription status
        const currentUser = (store.getState() as any)["feature/auth"].user;
        const hasSubscription = hasPremiumAccess(currentUser);

        console.log("options.pendingApplication", options.pendingApplication);

        if (options.pendingApplication) {
          Toast.show({
            type: "success",
            text1: "Success",
            text2:
              "Trainer subscription activated successfully, waiting for approval!",
          });
          setTimeout(() => {
            options.dispatch(authActions.setSubscription({ status: true }));
          }, 1000);
        } else {
          options.navigation.navigate("Tab", { screen: "FitnessGuru" });
        }

        if (hasSubscription) {
          // Check if user has complete workout data
          const hasWorkoutData =
            options.gymData?.days?.exerciseDays &&
            options.gymData.days.exerciseDays.length > 0;

          const hasMealData =
            options.gymData?.mealDetails &&
            Object.keys(options.gymData.mealDetails).length > 0;

          // If user has both workout AND meal data, setup them
          if (hasWorkoutData && hasMealData) {
            try {
              await options.setupProfile(
                options.profile,
                options.gymData,
                options.user
              );

              options.dispatch(gymActions.resetWorkouts());
              options.dispatch(gymActions.resetMeals());

              Toast.show({
                type: "success",
                text1: "Success",
                text2: "Profile setup and workout created successfully!",
              });
              options.navigation.navigate("Tab", { screen: "FitnessGuru" });
            } catch (setupError: any) {
              console.error("Error during setup:", setupError);

              if (setupError?.response?.status === 400) {
                Toast.show({
                  type: "error",
                  text1: "Validation Error",
                  text2:
                    "Invalid data format. Please check your profile information.",
                });
              } else {
                Toast.show({
                  type: "error",
                  text1: "Setup Error",
                  text2: "Failed to complete setup. Please try again.",
                });
              }
              return;
            }
          } else {
            Toast.show({
              type: "success",
              text1: "Success",
              text2: "Activated subscription successfully!",
            });
            options.navigation.navigate("Tab", { screen: "FitnessGuru" });
            return;
          }
        }
      } catch (error: any) {
        if (!error?.userCancelled) {
          console.error("Error during purchase:", error);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Failed to complete purchase. Please try again.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  return { executePurchase, isLoading };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PricingPackagesScreen: React.FC<
  MyStackNavigatorScreenProps<"PricingPackages">
> = ({ navigation }) => {
  const dispatch = useDispatch();

  // Redux selectors
  const pendingApplication = useSelector(
    (state: RootState) => state["feature/trainer"].pendingApplication
  );

  const { profile } = store.getState()["feature/overview"];

  const { user } = useSelector((state: RootState) => state["feature/auth"]);
  const gymData = useSelector((state: RootState) => state["feature/gym"]);

  // Custom hooks
  const { offerings, purchasePackage, isSubscribed } = useSubscription();
  const {
    packages,
    isLoading: isPackagesLoading,
    error: packagesError,
  } = usePackageService();
  const { setupProfile } = useProfileSetup();

  const { executePurchase, isLoading: isPurchaseLoading } = usePurchaseHandler({
    offerings,
    purchasePackage,
    user,
    profile,
    gymData,
    pendingApplication,
    navigation,
    dispatch,
    setupProfile,
  });

  // Local state
  const [currentPackage, setCurrentPackage] = useState<string>("Premium");

  // Effects
  useEffect(() => {
    console.log("isSubscribed--------", isSubscribed);
    if (isSubscribed) {
      dispatch(authActions.setSubscription({ status: true }));
    }
  }, [isSubscribed, dispatch]);

  // Handlers
  const handleChangePackage = useCallback((id: string) => {
    setCurrentPackage(id);
  }, []);

  const handleActionPress = useCallback(
    async (id: string) => {
      await executePurchase(id);
    },
    [executePurchase]
  );

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Computed values
  const isLoading = isPurchaseLoading || isPackagesLoading;

  // Error state
  if (packagesError) {
    return (
      <View style={styles.errorContainer}>
        <Text color="PrimaryRed" variant="md" fontWeight="bold" mb="md">
          Failed to load packages
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleBackPress}>
          <Text color="PrimaryWhite" fontWeight="bold">
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackPress}
        activeOpacity={0.7}
        disabled={isLoading}
      >
        <ArrowLeft size={30} color={theme.colors.PrimaryGreen} />
      </TouchableOpacity>

      {/* Hero Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../../../../assets/images/pricing-img2.jpg")}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Pricing Cards Section */}
      <View style={styles.cardContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isLoading}
          overScrollMode="never"
        >
          {isLoading && !packages.length ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={theme.colors.PrimaryGreen}
              />
              <Text mt="md" color="textSecondary">
                Loading packages...
              </Text>
            </View>
          ) : (
            <PricingPackageCard
              packages={packages}
              offerings={offerings ?? undefined}
              onActionPress={handleActionPress}
              onChangePackage={handleChangePackage}
            />
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default PricingPackagesScreen;

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundPrimary,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 20 : 10,
    left: 10,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 5,
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  cardContainer: {
    flex: 3,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: theme.colors.PrimaryGreen,
    borderRadius: 8,
  },
});
