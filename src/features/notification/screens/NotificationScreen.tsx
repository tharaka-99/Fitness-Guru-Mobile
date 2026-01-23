import React from 'react';
import { FlatList } from 'react-native';

import PageHeader from '@components/app/header/PageHeader';
import PageWrapper from '@components/app/PageWrapper';
import { MyTabNavigatorScreenProps } from '@navigation/types';
import { theme } from '@utils/styles/theme';
import NotificationCard from '../components/NotificationCard';

const NotificationScreen: React.FC<
  MyTabNavigatorScreenProps<'Notifications'>
> = () => {
  return (
    <PageWrapper>
      <PageHeader title="Notifications" />
      <FlatList
        data={notifications}
        showsVerticalScrollIndicator={false}
        keyExtractor={({ id }) => String(id)}
        contentContainerStyle={{ gap: theme.spacing.sm }}
        renderItem={({ item }) => {
          const { id, title, image, createdAt } = item;
          return (
            <NotificationCard
              key={String(id)}
              title={title}
              image={image}
              date={createdAt}
            />
          );
        }}
      />
    </PageWrapper>
  );
};

export default NotificationScreen;

const notifications = [
  {
    id: '1',
    title: 'Welcome to the No.1 Fitness App in Sri Lanka',
    image:
      'https://yt3.googleusercontent.com/ytc/AIf8zZR_gLoONvanEgUFQN6aj4jx_y1qUZcCCMJjihZ6DQ=s900-c-k-c0x00ffffff-no-rj',
    createdAt: new Date(),
  },
];
