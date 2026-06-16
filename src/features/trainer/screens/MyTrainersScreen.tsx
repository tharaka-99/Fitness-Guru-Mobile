import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';

import PageHeader from '@components/app/header/PageHeader';
import PageWrapper, { PAGE_WIDTH } from '@components/app/PageWrapper';
import { MyTabNavigatorScreenProps } from '@navigation/types';
import ExploreTrainersCard from '../components/ExploreTrainersCard';
import { useQuery } from '@tanstack/react-query';
import { getTrainers } from '@utils/services/trainersService';
import { Role, Trainer } from '@utils/types/trainersTypes';
import { store } from '@/store';
import { trainerActions } from '../context/slice';
import ExploreMyTrainersCard from '../components/ExploreMyTrainersCard';
import FullScreenLoader from '@components/atoms/FullScreenLoader';

const cardsGap = 10;
const noOfColumns = 2;
const cardWidth = PAGE_WIDTH / noOfColumns - cardsGap / noOfColumns;

const MyTrainersScreen: React.FC<MyTabNavigatorScreenProps<'MyTrainer'>> = ({
  navigation,
}) => {
  const { user } = store.getState()['feature/auth'];
  const [myTrainers, setMyTrainers] = useState<Trainer[]>([]);
  const {
    isLoading: isTrainersLoading,
    data: trainers,
    refetch: trainersRefetch,
  } = useQuery(
    {
      queryKey: ["trainers"],
      queryFn: getTrainers
    }
  );

  const goToTrainerProfile = (trainer: Trainer) => {
    store.dispatch(trainerActions.setSelectedTrainer(trainer));
    navigation.navigate('TrainerProfile');
  };

  useEffect(() => {
    if (trainers && user) {
      const filteredTrainers = trainers.filter(
        (trainer) =>
          trainer?.clientIds.includes(user?._id) &&
          trainer?.role !== Role.FitnessGuru
      );
      setMyTrainers(filteredTrainers);
    }
  }, [trainers, user]);

  if (isTrainersLoading) {
    return (
      <FullScreenLoader
        message="Loading..."
        header="My Trainers"
      />
    );
  }

  return (
    <PageWrapper>
      <PageHeader title="My Trainers" />

      <View style={{ marginBottom: cardsGap }}>
        {myTrainers.map((trainer) => (
          <ExploreMyTrainersCard
            key={trainer._id}
            onPress={() => goToTrainerProfile(trainer)}
            name={`${trainer.firstName} ${trainer.lastName}`}
            image={trainer.profileImageFileUrl ?? null}
          />
        ))}
      </View>

      <FlatList
        numColumns={noOfColumns}
        data={trainers}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => String(item?.mobileNumber)}
        columnWrapperStyle={{ columnGap: cardsGap }}
        contentContainerStyle={{ rowGap: cardsGap }}
        renderItem={({ item }) => {
          const {
            firstName,
            lastName,
            trainingFor,
            yearsOfExperience,
            _id,
            profileImageFileUrl,
          } = item;
          return (
            <ExploreTrainersCard
              key={_id}
              name={`${firstName} ${lastName}`}
              width={cardWidth}
              image={profileImageFileUrl ?? null}
              genderOfClients={trainingFor}
              yearsOfExperience={yearsOfExperience ?? 1}
              onPress={() => goToTrainerProfile(item)}
            />
          );
        }}
      />
    </PageWrapper>
  );
};

export default MyTrainersScreen;
