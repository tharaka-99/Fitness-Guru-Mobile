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
        keyExtractor={(item, index) => item._id ? String(item._id) : String(index)}
        contentContainerStyle={{ gap: theme.spacing.base }}
        renderItem={({ item, index }) => {
          const { mealItemId, count = 0 } = item || {};
          const unit = (mealItemId && typeof mealItemId === "object") ? mealItemId.unit : (item.unit || "");
          const name = (mealItemId && typeof mealItemId === "object") ? mealItemId.name : (item.name || "Unknown Item");
          const url = (mealItemId && typeof mealItemId === "object") ? mealItemId.url : (item.url || "");
          const id = (mealItemId && typeof mealItemId === "object") ? mealItemId._id : (item._id || String(index));
          const description = `${count} ${unit}`;

          return (
            <MealsListItem
              key={id}
              title={name ?? ""}
              image={url ?? ""}
              description={description ?? ""}
            />
          );
        }}
      />
    </PageWrapper>
  );
};

export default MealsListScreen;
