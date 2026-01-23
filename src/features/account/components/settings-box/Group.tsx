import React from "react";

import Box from "@components/atoms/Box";
import { ItemProps } from "./Item";

interface GroupProps {
  children?: React.ReactElement<ItemProps> | React.ReactElement<ItemProps>[];
}

const Group: React.FC<GroupProps> = ({ children }) => {
  return (
    <Box
      borderRadius="sm"
      overflow="hidden"
      backgroundColor="backgroundSecondary"
    >
      {children}
    </Box>
  );
};

export default Group;
