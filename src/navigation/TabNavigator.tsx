import { Home, Bell, User, Dumbbell } from "lucide-react-native";
import { BottomTabBarProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useCallback, useEffect, useState } from "react";
import {
  DeviceEventEmitter,
  Platform,
  StyleSheet,
  View,
  Pressable,
} from "react-native";
import { BlurView } from "expo-blur";
import Animated, { useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";

import AccountScreen from "@features/account/screens/AccountScreen";
import NotificationScreen from "@features/notification/screens/NotificationScreen";
import OverviewScreen from "@features/overview/screens/OverviewScreen";
import FitnessGuruScreen from "@features/trainer/screens/FitnessGuruScreen";
import { TabParamList } from "./types";
import Request from "@utils/http/request";
import { theme } from "@utils/styles/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const IN_APP_PUSH_RECEIVED_EVENT = "notifications.in_app_push_received";
const IN_APP_MARKED_READ_EVENT = "notifications.in_app_marked_read";
const IN_APP_DELETED_EVENT = "notifications.in_app_deleted";

const Tab = createBottomTabNavigator<TabParamList>();

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CustomTabBar = ({ state, descriptors, navigation, insets }: BottomTabBarProps & { insets: any }) => {
  return (
    <View style={[styles.tabBarContainer, { paddingBottom: Platform.OS === 'ios' ? insets.bottom : insets.bottom + 10 }]}>
      <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint="dark" style={styles.blurView}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabItem
              key={route.key}
              isFocused={isFocused}
              onPress={onPress}
              options={options}
            />
          );
        })}
      </BlurView>
    </View>
  );
};

const TabItem = ({ isFocused, onPress, options }: { isFocused: boolean, onPress: () => void, options: any }) => {
  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(isFocused ? 1.2 : 1) }],
      opacity: withTiming(isFocused ? 1 : 0.6, { duration: 200 }),
    };
  });

  const animatedDotStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isFocused ? 1 : 0, { duration: 200 }),
      transform: [{ scale: withSpring(isFocused ? 1 : 0) }],
    };
  });

  return (
    <AnimatedPressable onPress={onPress} style={styles.tabItem}>
      <Animated.View style={animatedIconStyle}>
        {options.tabBarIcon && options.tabBarIcon({ color: isFocused ? theme.colors.PrimaryGreen : theme.colors.textSecondary, size: 24 })}

        {/* Badge handling */}
        {options.tabBarBadge !== undefined && (
          <View style={styles.badgeContainer}>
            <Animated.Text style={styles.badgeText}>
              {options.tabBarBadge}
            </Animated.Text>
          </View>
        )}
      </Animated.View>
    </AnimatedPressable>
  );
};


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
      tabBar={(props) => <CustomTabBar {...props} insets={insets} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
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
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 50,
    right: 50,
  },
  blurView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 35,
    overflow: 'hidden',
    paddingVertical: theme.spacing.md,
    backgroundColor: Platform.OS === 'android' ? 'rgba(30, 41, 59, 0.75)' : 'transparent',
    borderWidth: Platform.OS === 'android' ? 1 : 0,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  dot: {
    position: 'absolute',
    bottom: 12,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.PrimaryGreen,
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: theme.colors.PrimaryGreen,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  }
});

export default TabNavigator;
