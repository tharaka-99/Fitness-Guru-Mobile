import { MyStackNavigatorScreenProps } from "@navigation/types";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
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
import Purchases, {
  LOG_LEVEL,
  PurchasesOfferings,
} from "react-native-purchases";

const { height: screenHeight } = Dimensions.get("window");

const PricingPackagesScreen: React.FC<
  MyStackNavigatorScreenProps<"PricingPackages">
> = ({ navigation }) => {
  const { profile } = store.getState()["feature/overview"];
  const { user } = store.getState()["feature/auth"];
  const { days, mealDetails, selectedWorkout } =
    store.getState()["feature/gym"];
  const [currentPackage, setCurrentPackage] = useState<string>("Premium");
  const [packages, setPackages] = useState<SubscriptionPlans>([]);
  const [offerings, setOfferings] = useState<PurchasesOfferings>();

  //configure revenue cat
  useEffect(() => {
    const initializeRevenueCat = async () => {
      try {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);

        if (Platform.OS === "ios") {
          Purchases.configure({
            apiKey: "appl_xaIghnPYoNgfePDjSrzcubzjzqw",
            //apiKey: env.EXPO_PUBLIC_RC_IOS,
          });
        } else if (Platform.OS === "android") {
          Purchases.configure({
            //apiKey: env.EXPO_PUBLIC_RC_ANDROID,
            apiKey: "goog_oyzmPsavutQJnKUwqqOOEiSLioN",
          });
        }

        // Wait a bit for the SDK to initialize
        await new Promise((resolve) => setTimeout(resolve, 500));

        await getCustomerInfo();
        await fetchProducts();
      } catch (error) {
        console.error("RevenueCat configuration error:", error);
      }
    };

    initializeRevenueCat();
  }, []);

  // async function getCustomerInfo() {
  //   try {
  //     const customerInfo = await Purchases.getCustomerInfo();
  //     console.log("CUSTOMER INFO", JSON.stringify(customerInfo));
  //   } catch (error) {
  //     console.error("Error getting customer info:", error);
  //   }
  // }

  async function getCustomerInfo() {
    const customerInfo = await Purchases.getCustomerInfo();

    console.log("📢 customerInfo", JSON.stringify(customerInfo, null, 2));
  }

  const fetchProducts = async () => {
    try {
      const rcOfferings = await Purchases.getOfferings();
      console.log("rcOfferings:", rcOfferings);
      if (rcOfferings) {
        setOfferings(rcOfferings);

        // Iterate over offerings
        if (rcOfferings.current && rcOfferings.current.availablePackages) {
          console.log("Iterating over available packages:");
          rcOfferings.current.availablePackages.forEach((pkg, index) => {
            console.log(`Package ${index + 1}:`);
            console.log(`  - Identifier: ${pkg.identifier}`);
            console.log(`  - Package Type: ${pkg.packageType}`);
            console.log(`  - Product:`, pkg.product);
          });
        }
      } else {
        console.log("No offerings found.");
      }
    } catch (error) {
      console.error("Error fetching offerings:", JSON.stringify(error));
    }
  };

  const onChangePackage = (id: string) => {
    setCurrentPackage(id);
  };

  const onActionPress = async (id: string) => {
    console.log("onActionPress called with id:", id);
    console.log("offerings:", offerings?.current);
    console.log("availablePackages:", offerings?.current?.availablePackages);

    if (!offerings?.current || !offerings.current.availablePackages.length) {
      console.log("No offerings available");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No subscription packages available.",
      });
      return;
    }

    const packageIdentifier = id === "Premium" ? "$rc_monthly" : "";

    console.log("Looking for package with identifier:", packageIdentifier);
    console.log(
      "Available packages:",
      offerings.current.availablePackages.map((pkg) => ({
        identifier: pkg.identifier,
        packageType: pkg.packageType,
        productIdentifier: pkg.product.identifier,
        productTitle: pkg.product.title,
        productPrice: pkg.product.priceString,
      }))
    );

    // Find the selected package
    const selectedPackage = offerings.current.availablePackages.find(
      (pkg) => pkg.identifier === packageIdentifier
    );

    console.log(selectedPackage, "selectedPackage");

    if (!selectedPackage) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Selected package not found.",
      });
      return;
    }

    // Perform the purchase
    const purchaseResult = await Purchases.purchasePackage(selectedPackage);

    if (purchaseResult.customerInfo.activeSubscriptions.length > 0) {
      store.dispatch(authActions.setSubscription({ status: true }));
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Activated subscription successfully!",
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Payment failed.",
      });
      return;
    }

    // let paymentResult = null;
    // try {
    //   paymentResult = await activeNewPackage(id);
    //   store.dispatch(authActions.setSubscription(paymentResult));
    //   Toast.show({
    //     type: 'success',
    //     text1: 'Success',
    //     text2: 'Activated subscription successfully!',
    //   });
    // } catch (error) {

    // }
    try {
      console.log("came here!!!!!!!!!!!!!!!!!!!");
      // check if user clicked they have injury button
      if (user?.isInjured) {
        store.dispatch(authActions.setIsInjured(true));
        navigation.navigate("Tab", { screen: "FitnessGuru" });
        return;
      }

      if (selectedWorkout?.WorkoutType === WorkoutType.Default) {
        await setClientProfileInfo(profile), navigation.navigate("Home");
        return;
      }

      console.log("check has subscriptions", user?.subscription?.status);

      // Check if the user already has a subscription
      // const hasSubscription = user?.subscription?.status ?? false;

      //check if user has premium access - Testing Free Trial
      const hasSubscription = hasPremiumAccess(user);

      // Execute initial setup if this is the user's first time (no subscription data)
      if (!hasSubscription) {
        console.log(
          "User does not have an active subscription. Proceeding with setup."
        );

        // Prepare the workout data
        console.log("Transforming workout data...");
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
        console.log("Transformed workout data:", transformedDays);

        // Prepare meal details without `calPerUnit`
        console.log("Omitting calPerUnit from meal details...");
        const omitCalPerUnit = (mealArray: MealItemDto[]) => {
          return mealArray.map(({ calPerUnit, ...rest }) => rest);
        };
        const mealDetailsWithoutCalPerUnit = {
          ...mealDetails,
          breakfast: omitCalPerUnit(mealDetails.breakfast),
          lunch: omitCalPerUnit(mealDetails.lunch),
          snack: omitCalPerUnit(mealDetails.snack),
          dinner: omitCalPerUnit(mealDetails.dinner),
        };
        console.log(
          "Meal details without calPerUnit:",
          mealDetailsWithoutCalPerUnit
        );

        // Make API calls concurrently for better performance
        try {
          console.log("Making API calls...");
          await Promise.all([
            setClientProfileInfo(profile),
            createWorkout(transformedDays),
            createMealPlan(mealDetailsWithoutCalPerUnit),
          ]);
          console.log("API calls completed successfully.");

          store.dispatch(gymActions.resetWorkouts());
          store.dispatch(gymActions.resetMeals());
          console.log("Redux store reset for workouts and meals.");

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
        }
      } else {
        console.log("User already has an active subscription. Skipping setup.");
        Toast.show({
          type: "info",
          text1: "Info",
          text2: "Subscription already active. Skipping setup.",
        });
      }

      navigation.navigate("Home");
    } catch (error) {
      console.error("Error during profile setup:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to complete setup. Please try again.",
      });
    }
  };

  // const onActionPress = async (id: string) => {
  //   console.log('-------------in pricing page-------------');
  //   console.log(profile);
  //   console.log(days);
  //   console.log(mealDetails);
  //   console.log(days.type);
  // };

  useEffect(() => {
    const getPackages = async () => {
      const cilentPackages = await getClientPackages();
      console.log(cilentPackages);
      setPackages(cilentPackages);
    };

    getPackages();
  }, []);

  // Iterate over offerings when they change
  useEffect(() => {
    if (offerings?.current?.availablePackages) {
      console.log("=== ITERATING OVER OFFERINGS ===");
      offerings.current.availablePackages.forEach((pkg, index) => {
        console.log(`\nPackage ${index + 1}:`);
        console.log(`  Identifier: ${pkg.identifier}`);
        console.log(`  Package Type: ${pkg.packageType}`);
        console.log(`  Product Identifier: ${pkg.product.identifier}`);
        console.log(`  Product Title: ${pkg.product.title}`);
        console.log(`  Product Description: ${pkg.product.description}`);
        console.log(`  Product Price: ${pkg.product.priceString}`);
      });
      console.log("=== END OF OFFERINGS ===");
    }
  }, [offerings]);

  return (
    <View style={{ flex: 1 }}>
      {/* Top Image taking 1/3 of the screen */}
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

      {/* Bottom Pricing Card taking 2/3 of the screen */}
      <View style={styles.cardContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <PricingPackageCard
            packages={packages}
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
  imageContainer: {
    flex: 1, // Takes 1/3 of the screen
  },
  image: {
    width: "100%",
    height: "100%",
  },
  cardContainer: {
    flex: 3, // Takes 2/3 of the screen
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 20,
  },
});
