import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// App Navigator Types
export type RootStackParamList = {
  Tab: NavigatorScreenParams<TabParamList>;
  TrainerProfile: undefined;
  WorkoutRoutine: undefined;
  WorkoutList: undefined;
  MealPlan: undefined;
  MealsList: undefined;
  TrainerApplication: { trainerId: string; packageId: string };
  GenerateMealPlan: undefined;
  Onboard: { fromMealPlan?: boolean } | undefined;
  Injury: undefined;
  GenerateWorkout: undefined;
  DayExercises: { day: number };
  PricingPackages: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  GeneralWorkoutRoutine: undefined;
  AnalyticsScreen: { hideTabs?: boolean } | undefined;
  MyDashboardScreen: undefined;
  PersonalInfo: undefined;
  ExercisesAnalytics: undefined;
};
export type MyStackNavigatorScreenProps<
  ScreenName extends keyof RootStackParamList
> = NativeStackScreenProps<RootStackParamList, ScreenName>;

// Tab Navigator Types
export type TabParamList = {
  Home: undefined;
  Account: undefined;
  Notifications: undefined;
  MyTrainer: undefined;
  Login: undefined;
  FitnessGuru: undefined;
};
export type MyTabNavigatorScreenProps<ScreenName extends keyof TabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<TabParamList, ScreenName>,
    NativeStackScreenProps<RootStackParamList>
  >;

// Auth Navigator Types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
};
export type MyAuthStackNavigatorScreenProps<
  ScreenName extends keyof AuthStackParamList
> = NativeStackScreenProps<AuthStackParamList, ScreenName>;
