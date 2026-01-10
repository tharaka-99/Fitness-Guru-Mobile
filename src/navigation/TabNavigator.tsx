import { Home, Bell, User } from "lucide-react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";

import AccountScreen from "@features/account/screens/AccountScreen";
import NotificationScreen from "@features/notification/screens/NotificationScreen";
import OverviewScreen from "@features/overview/screens/OverviewScreen";
import MyTrainersScreen from "@features/trainer/screens/MyTrainersScreen";
import { TabParamList } from "./types";
import FitnessGuruScreen from "@features/trainer/screens/FitnessGuruScreen";
import { Image } from "react-native";

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarAllowFontScaling: false,
        tabBarItemStyle: { paddingVertical: 3 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={OverviewScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="FitnessGuru"
        component={FitnessGuruScreen}
        options={{
          title: "Fitness Guru",
          tabBarIcon: ({ color, size, focused }) => (
            // <Entypo name="google-play" color={color} size={size - 2} />
            <Image
              resizeMode="cover"
              style={{ width: size, height: size }}
              source={
                focused
                  ? require("assets/images/FG_tab_icon_active.png")
                  : require("assets/images/FG_tab_icon_inactive.png")
              }
            />
          ),
        }}
      />
      {/* <Tab.Screen
        name="MyTrainer"
        component={MyTrainersScreen}
        options={{
          title: 'My Trainers',
          tabBarIcon: ({ color, size }) => (
            <Entypo name="users" color={color} size={size - 2} />
          ),
        }}
      /> */}
      <Tab.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
