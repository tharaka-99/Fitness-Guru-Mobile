import { Home, Bell, User } from "lucide-react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useCallback, useEffect, useState } from "react";

import AccountScreen from "@features/account/screens/AccountScreen";
import NotificationScreen from "@features/notification/screens/NotificationScreen";
import OverviewScreen from "@features/overview/screens/OverviewScreen";
import MyTrainersScreen from "@features/trainer/screens/MyTrainersScreen";
import { TabParamList } from "./types";
import FitnessGuruScreen from "@features/trainer/screens/FitnessGuruScreen";
import { DeviceEventEmitter, Image, StyleSheet, Text, View } from "react-native";
import Request from "@utils/http/request";
import { theme } from "@utils/styles/theme";

const IN_APP_PUSH_RECEIVED_EVENT = 'notifications.in_app_push_received';
const IN_APP_MARKED_READ_EVENT = 'notifications.in_app_marked_read';

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  const [unreadCount, setUnreadCount] = useState(0);

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

    const sub = DeviceEventEmitter.addListener(
      IN_APP_PUSH_RECEIVED_EVENT,
      () => refreshUnreadCount(),
    );

    const sub2 = DeviceEventEmitter.addListener(
      IN_APP_MARKED_READ_EVENT,
      () => refreshUnreadCount(),
    );

    return () => {
      sub.remove();
      sub2.remove();
    };
  }, [refreshUnreadCount]);

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
          tabBarIcon: ({ color, size }) => (
            <View style={styles.bellWrap}>
              <Bell color={color} size={size} />
              {unreadCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? "9" : String(unreadCount)}
                  </Text>
                </View>
              ) : null}
            </View>
          ),
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

const styles = StyleSheet.create({
  bellWrap: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    right: -8,
    top: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.PrimaryRed,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },
});
