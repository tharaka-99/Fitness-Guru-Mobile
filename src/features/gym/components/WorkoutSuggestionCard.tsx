import React, { useState, useCallback } from "react";
import {
  FlatList,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import Box from "@components/atoms/Box";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Text from "@components/atoms/Text";
import { SearchExercises } from "@utils/types/types";
import { SCREEN_HEIGHT } from "@components/app/PageWrapper";

interface WorkoutListItemProps {
  onPress: () => void;
  exercises: SearchExercises[];
  setSelectedExercise: (exercise: SearchExercises) => void;
}

interface WorkoutSuggestionItemProps {
  name: string;
  url?: string;
}

const WorkoutSuggestionCard: React.FC<WorkoutListItemProps> = ({
  onPress,
  exercises,
  setSelectedExercise,
}) => {
  const renderItem = useCallback(
    ({ item }: { item: SearchExercises }) => {
      const { name, url } = item;
      return (
        <TouchableOpacity
          onPress={() => {
            onPress();
            setSelectedExercise(item);
          }}
        >
          <WorkoutSuggestionItem name={name} url={url} />
        </TouchableOpacity>
      );
    },
    [onPress, setSelectedExercise]
  );

  return (
    <View style={{ flex: 1, maxHeight: 400 }}>
      <Box py="sm" px="md" borderRadius="sm" bg="PrimaryWhite" width="100%">
        {exercises.length > 0 ? (
          <FlatList
            data={exercises}
            keyExtractor={({ name }) => name}
            renderItem={renderItem}
            showsVerticalScrollIndicator={true}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={5}
            keyboardShouldPersistTaps="handled"
            getItemLayout={(data, index) => ({
              length: 80,
              offset: 80 * index,
              index,
            })}
          />
        ) : (
          <Box alignItems="center" justifyContent="center" py="lg">
            <Text variant="md" color="PrimaryBlack">
              No exercises found. Try a different search!
            </Text>
          </Box>
        )}
      </Box>
    </View>
  );
};

export default WorkoutSuggestionCard;

const WorkoutSuggestionItem: React.FC<WorkoutSuggestionItemProps> = React.memo(
  ({ name, url }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const handleImageError = useCallback(() => {
      setLoading(false);
      setError(true);
    }, []);

    const handleImageLoad = useCallback(() => {
      setLoading(false);
      setError(false);
    }, []);

    return (
      <Box flexDirection="row" alignItems="center" gap="base" py="sm">
        <Box
          borderWidth={1}
          overflow="hidden"
          borderRadius="xs"
          borderColor="PrimaryBlack"
          width={65}
          height={65}
          justifyContent="center"
          alignItems="center"
        >
          {loading && (
            <ActivityIndicator
              size="small"
              color="#cccccc"
              style={{ position: "absolute" }}
            />
          )}

          {error || !url ? (
            // <Image
            //   source={{ uri: sampleImage }}
            //   style={{ width: 65, height: 65 }}
            //   resizeMode="cover"
            // />

            <Box
              alignItems="center"
              justifyContent="center"
              style={{ width: 65, height: 65 }}
            >
              <ActivityIndicator size={"large"} color="PrimaryGreen" />
            </Box>
          ) : (
            <Image
              source={{ uri: url }}
              style={{ width: 65, height: 65 }}
              resizeMode="cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
              fadeDuration={300}
            />
          )}
        </Box>
        <Text
          variant="md"
          color="PrimaryBlack"
          numberOfLines={2}
          style={{ textTransform: "capitalize", width: "80%" }}
          ellipsizeMode="tail"
        >
          {name}
        </Text>
      </Box>
    );
  }
);

// const sampleImage = "https://gymvisual.com/img/p/2/0/3/0/7/20307.gif";
const sampleImage =
  "https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif";
