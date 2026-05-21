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
      refreshUnreadCount(),
    );

    const sub2 = DeviceEventEmitter.addListener(IN_APP_MARKED_READ_EVENT, () =>
      refreshUnreadCount(),
    );

    const sub3 = DeviceEventEmitter.addListener(IN_APP_DELETED_EVENT, () =>
      refreshUnreadCount(),
    );

    return () => {
      sub.remove();
      sub2.remove();
      sub3.remove();
    };
  }, [refreshUnreadCount]);
  const { height: screenHeight } = useWindowDimensions();
  const HEADER_OFFSET = 220;
  const availableHeight = screenHeight - HEADER_OFFSET;
  const TILE_MIN_HEIGHT = 120;
  const TILE_COUNT = 3;
  const needsScroll = availableHeight < TILE_MIN_HEIGHT * TILE_COUNT + 60;
  const topTileHeight = needsScroll ? TILE_MIN_HEIGHT * 1.4 : undefined;
  const bottomTileHeight = needsScroll ? TILE_MIN_HEIGHT * 1.4 : undefined;

  return (
    <Tab.Navigator
      initialRouteName="FitnessGuru"
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarAllowFontScaling: false,
        tabBarActiveTintColor: theme.colors.PrimaryGreen,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.backgroundPrimary,
          // borderTopWidth: 1.5,
          // borderTopColor: theme.colors.borderSecondary,
          // paddingTop: theme.spacing.xs,
          // paddingBottom: theme.spacing.xs + insets.bottom,
          // height: 60 + insets.bottom,
        },
        tabBarItemStyle: {
          // margin: 0,
          // padding: 0,
          // paddingTop: theme.spacing.sm,
        },
        tabBarLabelStyle: {
          //paddingTop: theme.spacing.xs,
          fontSize: theme.textVariants.xs.fontSize,
          fontWeight: "600",
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
