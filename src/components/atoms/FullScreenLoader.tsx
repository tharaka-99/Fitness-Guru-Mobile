import PageHeader from '@components/app/header/PageHeader';
import PageWrapper from '@components/app/PageWrapper';
import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

interface FullScreenLoaderProps {
  header?: string;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ header }) => {
  return (
    <PageWrapper>
      <PageHeader title={header} />
      <View style={styles.container}>
        <Image
          source={require('assets/Fitness_Guru_Loading.gif')}
          style={styles.image}
          resizeMode="contain"
        />
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
  image: {
    width: 35,
    height: 35,
  },
  message: {
    marginTop: 20,
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
});

export default FullScreenLoader;
