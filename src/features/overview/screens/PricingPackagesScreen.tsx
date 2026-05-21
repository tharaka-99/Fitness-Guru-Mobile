import { MyStackNavigatorScreenProps } from "@navigation/types";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { store } from "@/store";
import PageWrapper from "@components/app/PageWrapper";
import PageHeader from "@components/app/header/PageHeader";
import Box from "@components/atoms/Box";
import PaginationDots from "@components/atoms/PaginationDots";
import { authActions } from "@features/auth/context/slice";
import { gymActions } from "@features/gym/context/slice";
import { setClientProfileInfo } from "@utils/services/authServices";
import { createMealPlan } from "@utils/services/mealPlanService";
import {
  activeNewPackage,
  getClientPackages,
} from "@utils/services/packageService";
import { createWorkout } from "@utils/services/workoutService";
import env from "@utils/env";
import { MealItemDto } from "@utils/types/mealPlanTypes";
import {
  SubscriptionPlan,
  SubscriptionPlans,
} from "@utils/types/subscriptionTypes";
import {
  ExerciseDay,
  Exercises,
  Workout,
  WorkoutType,
} from "@utils/types/types";
import { hasPremiumAccess } from "@utils/helpers";
import Toast from "react-native-toast-message";
import PricingPackageCard from "../components/PricingPackageCard";
import UserNameWithAvatar from "../components/onboard/UserNameWithAvatar";
import { overviewActions } from "../context/slice";
import Purchases from "react-native-purchases";
import { ArrowLeft } from "lucide-react-native";
import { theme } from "@utils/styles/theme";
import useSubscription from "@features/subscription/hooks/useSubscription";
import Text from "@components/atoms/Text";

const { height: screenHeight } = Dimensions.get("window");

const PricingPackagesScreen: React.FC<
  MyStackNavigatorScreenProps<"PricingPackages">
> = ({ navigation }) => {
  const { profile } = store.getState()["feature/overview"];
  const { user } = store.getState()["feature/auth"];
  const { days, mealDetails, selectedWorkout } =
    store.getState()["feature/gym"];
  const { pendingApplication } = store.getState()["feature/trainer"];

  const [currentPackage, setCurrentPackage] = useState<string>("Premium");
  const [packages, setPackages] = useState<SubscriptionPlans>([]);

  const { offerings, purchasePackage, isSubscribed } = useSubscription();

  useEffect(() => {
    if (isSubscribed) {
      store.dispatch(authActions.setSubscription({ status: true }));
    }
  }, [isSubscribed]);

  useEffect(() => {
    const getPackages = async () => {
      const clientPackages = await getClientPackages();
      setPackages(clientPackages);
    };
    getPackages();
  }, []);

  const onChangePackage = (id: string) => {
    setCurrentPackage(id);
  };

  const onActionPress = async (id: string) => {
    if (!offerings?.current || !offerings.current.availablePackages.length) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No subscription packages available.",
      });
      return;
    }

    const packageIdentifier = id === "Premium" ? "$rc_monthly" : "";

    const selectedPackage = offerings.current.availablePackages.find(
      (pkg) => pkg.identifier === packageIdentifier,
    );

    if (!selectedPackage) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Selected package not found.",
      });
      return;
    }

    try {
      await purchasePackage(selectedPackage);

      if (user?.isInjured) {
        store.dispatch(authActions.setIsInjured(true));
        navigation.navigate("Tab", { screen: "FitnessGuru" });
        return;
      }

      if (selectedWorkout?.WorkoutType === WorkoutType.Default) {
        await setClientProfileInfo(profile);
        navigation.navigate("Tab", { screen: "FitnessGuru" });
        return;
      }

      const currentUser = (store.getState() as any)["feature/auth"].user;
      const hasSubscription = hasPremiumAccess(currentUser);

      if (hasSubscription) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Activated subscription successfully!",
        });
      }

      if (!hasSubscription) {
        const transformedDays: Workout = {
          type: WorkoutType.SelfCreated,
          exerciseDays: days.exerciseDays.map((exerciseDay: ExerciseDay) => ({
            day: exerciseDay.day,
            exercises: exerciseDay.exercises.map((exercise: Exercises) => ({
              order: exercise.order,
              exercise: {
                _id: exercise.exercise._id,
                name: exercise.exercise.name,
              },
              sets: exercise.sets,
              reps: exercise.reps,
              rest: exercise.rest,
            })),
          })),
        };

        const omitCalPerUnit = (mealArray: MealItemDto[]) =>
          mealArray.map(({ calPerUnit, ...rest }) => rest);

        const mealDetailsWithoutCalPerUnit = {
          ...mealDetails,
          breakfast: omitCalPerUnit(mealDetails.breakfast),
          lunch: omitCalPerUnit(mealDetails.lunch),
          snack: omitCalPerUnit(mealDetails.snack),
          dinner: omitCalPerUnit(mealDetails.dinner),
        };

        try {
          if (user?.subscription?.status) {
            await Promise.all([
              createWorkout(transformedDays),
              createMealPlan(mealDetailsWithoutCalPerUnit),
            ]);
          }
          await setClientProfileInfo(profile);
          store.dispatch(gymActions.resetWorkouts());
          store.dispatch(gymActions.resetMeals());
          Toast.show({
            type: "success",
            text1: "Success",
            text2: "Profile setup and workout created successfully!",
          });
        } catch (error) {
          console.error("Error during API calls:", error);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Failed to complete setup. Please try again.",
          });
          return;
        }
      } else {
        Toast.show({
          type: "info",
          text1: "Info",
          text2: "Subscription already active.",
        });
      }

      if (pendingApplication) {
        setTimeout(() => {
          store.dispatch(authActions.setSubscription({ status: true }));
          navigation.goBack();
        }, 1000);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Trainer subscription activated successfully, waiting for approval!",
        });
      } else {
        navigation.navigate("Tab", { screen: "FitnessGuru" });
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error("Error during purchase or setup:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to complete purchase or setup. Please try again.",
        });
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={30} color={theme.colors.PrimaryGreen} />
      </TouchableOpacity>
      <View style={styles.imageContainer}>
        <Image
          source={
            // currentPackage === "Standard"
            //   ? require("../../../../assets/images/pricing-img1.jpg")
            //   :
            require("../../../../assets/images/pricing-img2.jpg")
          }
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.cardContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <PricingPackageCard
            packages={packages}
            offerings={offerings ?? undefined}
            onActionPress={(id: string) => onActionPress(id)}
            onChangePackage={(id: string) => onChangePackage(id)}
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default PricingPackagesScreen;

const styles = StyleSheet.create({
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
});
