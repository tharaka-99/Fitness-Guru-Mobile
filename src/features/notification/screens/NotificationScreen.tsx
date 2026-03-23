import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  DeviceEventEmitter,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import PageHeader from '@components/app/header/PageHeader';
import PageWrapper from '@components/app/PageWrapper';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { MyTabNavigatorScreenProps } from '@navigation/types';
import Request from '@utils/http/request';
import { theme } from '@utils/styles/theme';
import NotificationCard from '../components/NotificationCard';
import type { InAppNotificationDTO } from '../types';

const IN_APP_PUSH_RECEIVED_EVENT = 'notifications.in_app_push_received';
const IN_APP_MARKED_READ_EVENT = 'notifications.in_app_marked_read';
const IN_APP_DELETED_EVENT = 'notifications.in_app_deleted';

/** API returns { success, statusCode, message, data: InAppNotificationDTO[] } */
function extractInAppList(payload: unknown): InAppNotificationDTO[] {
  if (!payload || typeof payload !== 'object') return [];
  const body = payload as Record<string, unknown>;
  if (Array.isArray(body.data)) return body.data as InAppNotificationDTO[];
  // If something wraps again
  const inner = body.data as Record<string, unknown> | undefined;
  if (inner && Array.isArray(inner.data)) return inner.data as InAppNotificationDTO[];
  if (Array.isArray(body)) return body as InAppNotificationDTO[];
  return [];
}

async function fetchInAppNotifications(): Promise<InAppNotificationDTO[]> {
  const res = await Request.get('/notification/in-app', {
    params: { limit: 50 },
  });
  const list = extractInAppList(res.data);
  return list;
}

const NotificationScreen: React.FC<
  MyTabNavigatorScreenProps<'Notifications'>
> = () => {
  const [items, setItems] = useState<InAppNotificationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // If a push arrives while the user is browsing other tabs, refresh list when it lands.
  React.useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      IN_APP_PUSH_RECEIVED_EVENT,
      async () => {
        try {
          const list = await fetchInAppNotifications();
          setItems(list);
        } catch {
          // ignore; focus effect will retry on navigation
        }
      },
    );
    return () => sub.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          // Mark all as read when the user opens the tab.
          await Request.patch('/notification/in-app/mark-all-read');
          DeviceEventEmitter.emit(IN_APP_MARKED_READ_EVENT);

          const list = await fetchInAppNotifications();
          if (!cancelled) setItems(list);
        } catch (e) {
          if (!cancelled) {
            console.warn('Failed to load in-app notifications', e);
            setItems([]);
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const list = await fetchInAppNotifications();
      setItems(list);
    } catch (e) {
      console.warn('Failed to refresh notifications', e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await Request.delete(`/notification/in-app/${notificationId}`);
      const list = await fetchInAppNotifications();
      setItems(list);
      DeviceEventEmitter.emit(IN_APP_DELETED_EVENT);
    } catch (e) {
      console.warn('Failed to delete notification', e);
    }
  }, []);

  if (loading && items.length === 0) {
    return (
      <PageWrapper>
        <PageHeader title="Notifications" />
        <Box flex={1} justifyContent="center" alignItems="center" py="xl">
          <ActivityIndicator size="large" color={theme.colors.PrimaryGreen} />
        </Box>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageHeader title="Notifications" />
      <FlatList
        data={items}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          gap: theme.spacing.sm,
          flexGrow: 1,
          paddingBottom: theme.spacing.lg,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.PrimaryGreen}
            colors={[theme.colors.PrimaryGreen]}
          />
        }
        ListEmptyComponent={
          <Box px="base" py="xl">
            <Text variant="sm" color="textSecondary" textAlign="center">
              No notifications yet. Workout and meal plan updates from your
              trainer will appear here.
            </Text>
          </Box>
        }
        renderItem={({ item }) => {
          const createdAt = item.createdAt
            ? new Date(item.createdAt)
            : new Date();
          return (
            <NotificationCard
              title={item.title}
              body={item.body}
              date={createdAt}
              read={item.read}
              onDelete={() => deleteNotification(item.id)}
            />
          );
        }}
      />
    </PageWrapper>
  );
};

export default NotificationScreen;
