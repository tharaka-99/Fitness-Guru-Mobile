import PageHeader from '@components/app/header/PageHeader';
import PageWrapper from '@components/app/PageWrapper';
import { theme } from '@utils/styles/theme';
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface FullScreenLoaderProps {
  message?: string;
  header?: string;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  message = 'Loading...',
  header,
}) => {
  return (
    <PageWrapper>
      <PageHeader title={header} />
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.PrimaryGreen} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </PageWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 20,
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
});

export default FullScreenLoader;
