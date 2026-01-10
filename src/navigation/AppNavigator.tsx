import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import GenerateMealPlanScreen from '@features/gym/screens/GenerateMealPlanScreen';
import GenerateWorkoutScreen from '@features/gym/screens/GenerateWorkoutScreen';
import MealPlanScreen from '@features/gym/screens/MealPlanScreen';
import MealsListScreen from '@features/gym/screens/MealsListScreen';
import WorkoutListScreen from '@features/gym/screens/WorkoutListScreen';
import WorkoutRoutineScreen from '@features/gym/screens/WorkoutRoutineScreen';
import InjuryScreen from '@features/overview/screens/InjuryScreen';
import OnboardScreen from '@features/overview/screens/OnboardScreen';
import PricingPackagesScreen from '@features/overview/screens/PricingPackagesScreen';
import TrainerApplicationScreen from '@features/trainer/screens/TrainerApplicationScreen';
import TrainerProfileScreen from '@features/trainer/screens/TrainerProfileScreen';
import TabNavigator from '@navigation/TabNavigator';
import { RootStackParamList } from '@navigation/types';
import GeneralWorkoutRoutineScreen from '@features/gym/screens/GeneralWorkoutRoutineScreen';
import AnalyticsScreen from '@features/gym/screens/AnalyticsScreen';
import MyDashboardScreen from '@features/dashboard/screens/MyDashboardScreen';
import PersonalInfoScreen from '@features/account/screens/PersonalInfoScreen';
import ExercisesAnalyticsScreen from '@features/gym/screens/ExercisesAnalyticsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => (
  <Stack.Navigator
    initialRouteName="Tab"
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="Tab" component={TabNavigator} />
    <Stack.Screen name="Onboard" component={OnboardScreen} />
    <Stack.Screen name="TrainerProfile" component={TrainerProfileScreen} />
    <Stack.Screen name="WorkoutRoutine" component={WorkoutRoutineScreen} />
    <Stack.Screen
      name="GeneralWorkoutRoutine"
      component={GeneralWorkoutRoutineScreen}
    />
    <Stack.Screen name="WorkoutList" component={WorkoutListScreen} />
    <Stack.Screen name="GenerateWorkout" component={GenerateWorkoutScreen} />
    <Stack.Screen name="MealPlan" component={MealPlanScreen} />
    <Stack.Screen name="MealsList" component={MealsListScreen} />
    <Stack.Screen name="GenerateMealPlan" component={GenerateMealPlanScreen} />
    <Stack.Screen name="Injury" component={InjuryScreen} />
    <Stack.Screen name="PricingPackages" component={PricingPackagesScreen} />
    <Stack.Screen
      name="TrainerApplication"
      component={TrainerApplicationScreen}
    />
    <Stack.Screen name="AnalyticsScreen" component={AnalyticsScreen} />
    <Stack.Screen name="MyDashboardScreen" component={MyDashboardScreen} />
    <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
    <Stack.Screen
      name="ExercisesAnalytics"
      component={ExercisesAnalyticsScreen}
    />
  </Stack.Navigator>
);

export default AppNavigator;
