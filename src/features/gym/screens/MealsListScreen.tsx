import React from "react";
import { FlatList, TouchableOpacity } from "react-native";

import PageHeader from "@components/app/header/PageHeader";
import PageWrapper from "@components/app/PageWrapper";
import { MyStackNavigatorScreenProps } from "@navigation/types";
import { theme } from "@utils/styles/theme";
import MealsListItem from "../components/MealsListItem";
import { store } from "@/store";
import Box from "@components/atoms/Box";
import { Icon } from "react-native-paper";
import Text from "@components/atoms/Text";
import { ArrowLeft } from "lucide-react-native";

const MealsListScreen: React.FC<MyStackNavigatorScreenProps<"MealsList">> = ({
  navigation,
}) => {
  const { selectedMealPlan, selectedMealType } =
    store.getState()["feature/gym"];

  return (
    <PageWrapper>
      <PageHeader
        title={selectedMealType.toUpperCase()}
        leftComponent={
          <Box flexDirection="row" alignItems="center" gap="md">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={30} color={theme.colors.PrimaryGreen} />
            </TouchableOpacity>
            <Text color="PrimaryGreen" variant="xlBold" numberOfLines={1}>
              {selectedMealType.toUpperCase()}
            </Text>
          </Box>
        }
      />
      <FlatList
        data={selectedMealPlan}
        showsVerticalScrollIndicator={false}
        keyExtractor={({ _id }) => String(_id)}
        contentContainerStyle={{ gap: theme.spacing.base }}
        renderItem={({ item, index }) => {
          const { mealItemId, count } = item;
          const description = `${count} ${mealItemId.unit}`;

          return (
            <MealsListItem
              key={mealItemId._id}
              title={mealItemId.name ?? ""}
              image={mealItemId.url ?? ""}
              description={description ?? ""}
            />
          );
        }}
      />
    </PageWrapper>
  );
};

export default MealsListScreen;
