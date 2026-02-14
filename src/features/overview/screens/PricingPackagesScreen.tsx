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
  const [currentPackage, setCurrentPackage] = useState<string>("Premium");
  const [packages, setPackages] = useState<SubscriptionPlans>([]);

  const { offerings, purchasePackage, isSubscribed, restorePurchases } = useSubscription();


  useEffect(() => {
    if (isSubscribed) {
      store.dispatch(authActions.setSubscription({ status: true }));
    }
  }, [isSubscribed]);


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
      })),
    );


    const selectedPackage = offerings.current.availablePackages.find(
      (pkg) => pkg.identifier === packageIdentifier,
    );


    console.log(
      "selectedPackage .........>>>>>>>>>>",
      JSON.stringify(selectedPackage),
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
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Activated subscription successfully!",
      });


      if (user?.isInjured) {
        store.dispatch(authActions.setIsInjured(true));
        navigation.navigate("Tab", { screen: "FitnessGuru" });
        return;
      }


      if (selectedWorkout?.WorkoutType === WorkoutType.Default) {
        (await setClientProfileInfo(profile), navigation.navigate("Home"));
        return;
      }

      const currentUser = (store.getState() as any)["feature/auth"].user;
      console.log("check has subscriptions", currentUser?.subscription?.status);
      const hasSubscription = hasPremiumAccess(currentUser);
      console.log("hasSubscription......", hasSubscription);

      if (!hasSubscription) {
        console.log(
          "User does not have an active subscription. Proceeding with setup.",
        );


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
          mealDetailsWithoutCalPerUnit,
        );


        try {
          console.log("Making API calls...");
          await Promise.all([
            setClientProfileInfo(profile),
            createWorkout(transformedDays),
            createMealPlan(mealDetailsWithoutCalPerUnit),
          ]);
          // console.log("Calling setClientProfileInfo...");
          // await setClientProfileInfo(profile);
          // console.log("Calling createWorkout...");
          // await createWorkout(transformedDays);
          // console.log("Calling createMealPlan...");
          // await createMealPlan(mealDetailsWithoutCalPerUnit);
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
          text2: "Subscription already active.",
        });
      }

      navigation.navigate("Home");
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
      console.log(
        "cilentPackages ........./////",
        JSON.stringify(cilentPackages, null, 2),
      );
      setPackages(cilentPackages);
    };


    getPackages();
  }, []);


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



