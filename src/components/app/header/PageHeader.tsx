import React from "react";
import { Image } from "react-native";

import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import { PAGE_WIDTH } from "../PageWrapper";

interface PageHeaderProps {
  title?: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  leftComponent,
  rightComponent,
}) => {
  return (
    <Box
      pb="md"
      pt="base"
      width={PAGE_WIDTH}
      alignItems="center"
      flexDirection="row"
      justifyContent="space-between"
    >
      {leftComponent ? (
        leftComponent
      ) : (
        <Box width="65%">
          <Text color="PrimaryGreen" variant="xlBold" numberOfLines={1}>
            {title}
          </Text>
        </Box>
      )}

      {rightComponent ? (
        rightComponent
      ) : (
        <Image
          resizeMode="cover"
          style={{ width: 28, height: 28 }}
          source={require("assets/images/logo-2.png")}
        />
      )}
    </Box>
  );
};

export default PageHeader;
