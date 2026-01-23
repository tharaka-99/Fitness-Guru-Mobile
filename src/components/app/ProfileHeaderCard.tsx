import React from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

import { PAGE_WIDTH } from "@components/app/PageWrapper";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { theme } from "@utils/styles/theme";
import { MyStackNavigatorScreenProps } from "@navigation/types";
import { UserAvatar } from "./UserAvatar";

interface ProfileHeaderCardProps {
  image: string | number; // Allow both string URIs and require() images
  name: string;
  details?: {
    icon: ({ color, size }: { color: string; size: number }) => React.ReactNode;
    value: string;
  }[];
  nameTextColor?: "PrimaryGreen" | "textPrimary";
  isDashboardLink?: boolean;
  isEditLink?: boolean;
}

const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  image,
  name,
  details,
  nameTextColor: nameColor = "PrimaryGreen",
  isDashboardLink = false,
  isEditLink = false,
}) => {
  const navigation =
    useNavigation<
      MyStackNavigatorScreenProps<"MyDashboardScreen">["navigation"]
    >();

  return (
    <Box
      gap="md"
      px="sm"
      py="sm"
      borderRadius="sm"
      width={PAGE_WIDTH}
      flexDirection="row"
      backgroundColor="backgroundSecondary"
      alignItems="center"
    >
      {image ? (
        <Image
          source={typeof image === "string" ? { uri: image } : image} // Handle both URI and require() format
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <Box>{UserAvatar(name)}</Box>
      )}

      <Box gap="xs" flex={1}>
        <Text
          color={nameColor}
          variant="xl"
          fontWeight="600"
          numberOfLines={2}
          style={{ textTransform: "capitalize" }}
        >
          {name}
        </Text>

        <Box gap="sm" mt="xs">
          {details?.map(({ icon, value }, idx) => (
            <Box
              gap="sm"
              pr="base"
              key={String(idx)}
              flexDirection="row"
              alignItems="center"
            >
              {icon({ color: theme.colors.textSecondary, size: 20 })}
              <Text numberOfLines={1} color="textSecondary" fontWeight="600">
                {value}
              </Text>
            </Box>
          ))}
        </Box>
        {isDashboardLink && (
          <TouchableOpacity
            onPress={() => navigation.navigate("MyDashboardScreen")}
          >
            <Box
              gap="sm"
              pt="sm"
              flexDirection="row"
              alignItems="center"
              justifyContent="flex-end"
            >
              <Text
                color={nameColor}
                variant="sm"
                fontWeight="600"
                numberOfLines={1}
              >
                My Dashboard
              </Text>
              <ArrowRight color={theme.colors.PrimaryGreen} size={20} />
            </Box>
          </TouchableOpacity>
        )}
        {isEditLink && (
          <TouchableOpacity onPress={() => console.log("account edit")}>
            <Box
              gap="sm"
              pt="sm"
              flexDirection="row"
              alignItems="center"
              justifyContent="flex-end"
            >
              {/* <Text
                color={nameColor}
                variant="sm"
                fontWeight="600"
                numberOfLines={1}
                mr="sm"
              >
                Edit
              </Text> */}
            </Box>
          </TouchableOpacity>
        )}
      </Box>
    </Box>
  );
};

export default ProfileHeaderCard;

const styles = StyleSheet.create({
  image: {
    width: 115,
    height: 130,
    borderRadius: theme.borderRadii.sm,
  },
});
