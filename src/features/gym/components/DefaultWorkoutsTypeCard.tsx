import { ArrowRight } from "lucide-react-native";
import React from "react";
import { Image, TouchableOpacity } from "react-native";

import { PAGE_WIDTH } from "@components/app/PageWrapper";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { constants, theme } from "@utils/styles/theme";

interface Props {
  title: string;
  description: string;
  image: any;
  onPress?: () => void;
}

const DefaultWorkoutsTypeCard: React.FC<Props> = ({
  title,
  description,
  image,
  onPress,
}) => {
  return (
    <TouchableOpacity activeOpacity={constants.activeOpacity} onPress={onPress}>
      <Box
        gap="xs"
        mb="sm"
        height={90}
        borderRadius="sm"
        overflow="hidden"
        width={PAGE_WIDTH}
        flexDirection="row"
        backgroundColor="backgroundSecondary"
        alignItems="center"
        justifyContent="space-between"
        p={"md"}
        borderWidth={1}
        borderColor={"PrimaryGreyDark"}
      >
        {/* <Box
          width="18%"
          height="100%"
          alignItems="center"
          justifyContent="center"
        >
          <Image style={{ width: 50, height: 50 }} source={image} />
        </Box> */}

        <Box gap="xs" flex={1} alignItems="flex-start" justifyContent="center">
          <Text variant="mdBold" numberOfLines={1} color="PrimaryWhite">
            {title}
          </Text>
          <Text color="textSecondary" variant="sm" fontWeight={"300"}>
            {description}
          </Text>
        </Box>
        <Box
          width={44}
          height={44}
          borderRadius="full"
          alignItems="center"
          justifyContent="center"
          backgroundColor={"PrimaryGreen"}
          style={{ backgroundColor: "rgba(160, 226, 32, 0.15)" }}
        >
          <ArrowRight size={22} color={theme.colors.PrimaryGreen} />
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

export default DefaultWorkoutsTypeCard;
