import { Home, Bell, User, Dumbbell } from "lucide-react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useCallback, useEffect, useState } from "react";

import AccountScreen from "@features/account/screens/AccountScreen";
import NotificationScreen from "@features/notification/screens/NotificationScreen";
import OverviewScreen from "@features/overview/screens/OverviewScreen";
import MyTrainersScreen from "@features/trainer/screens/MyTrainersScreen";
import { TabParamList } from "./types";
import FitnessGuruScreen from "@features/trainer/screens/FitnessGuruScreen";
import {
  DeviceEventEmitter,
  Image,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Request from "@utils/http/request";
import { theme } from "@utils/styles/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const IN_APP_PUSH_RECEIVED_EVENT = "notifications.in_app_push_received";
const IN_APP_MARKED_READ_EVENT = "notifications.in_app_marked_read";
const IN_APP_DELETED_EVENT = "notifications.in_app_deleted";

const Tab = createBottomTabNavigator<TabParamList>();


const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  const [unreadCount, setUnreadCount] = useState(0);

  const tabBarHeight = 48 + (Platform.OS === "ios" ? insets.bottom * 0.5 : 10);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await Request.get("/notification/in-app", {
        params: { limit: 20 },
      });
      const list = res.data?.data;
      if (!Array.isArray(list)) {
        setUnreadCount(0);
        return;
      }
      const unread = list.filter((i: any) => i?.read === false).length;
      setUnreadCount(unread);
    } catch (e) {
      console.warn("[Notifications] Failed to refresh unread count", e);
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();

    const sub = DeviceEventEmitter.addListener(IN_APP_PUSH_RECEIVED_EVENT, () =>
      refreshUnreadCount()
    );

    const sub2 = DeviceEventEmitter.addListener(IN_APP_MARKED_READ_EVENT, () =>
      refreshUnreadCount()
    );

    const sub3 = DeviceEventEmitter.addListener(IN_APP_DELETED_EVENT, () =>
      refreshUnreadCount()
    );

    return () => {
      sub.remove();
      sub2.remove();
      sub3.remove();
    };
  }, [refreshUnreadCount]);

  return (
    <Tab.Navigator
      initialRouteName="FitnessGuru"
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarAllowFontScaling: false,
        tabBarActiveTintColor: theme.colors.PrimaryGreen,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: [
          {
            //height: tabBarHeight,
            //paddingBottom: Platform.OS === "ios" ? insets.bottom * 0.5 : 12,
            backgroundColor: theme.colors.backgroundPrimary,
          },
        ],
        tabBarItemStyle: {
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontSize: theme.textVariants.xs.fontSize,
          fontWeight: "600",
          marginTop: 5,
          // paddingBottom: 5,
        },
      }}
    >
      <Tab.Screen
        name="FitnessGuru"
        component={FitnessGuruScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Home"
        component={OverviewScreen}
        options={{
          title: "My Fitness",
          tabBarIcon: ({ color, size }) => (
            <Dumbbell color={color} size={size} />
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
          tabBarBadge:
            unreadCount > 0
              ? unreadCount > 9
                ? "9+"
                : unreadCount
              : undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.colors.PrimaryRed,
            fontSize: 10,
            color: theme.colors.PrimaryWhite,
            fontWeight: 800,
          },
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

const styles = StyleSheet.create({
  badge: {
    fontSize: 9,
    fontWeight: "bold",
    lineHeight: 14,
    height: 15,
    minWidth: 15,
    borderRadius: 7.5,
    marginTop: 2,
  },
});

export default TabNavigator;
