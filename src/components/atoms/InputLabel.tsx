import React from "react";

import Text from "@components/atoms/Text";

export interface InputLabelProps {
  label?: string;
}

const InputLabel: React.FC<InputLabelProps> = ({ label }) => {
  return <Text>{label}</Text>;
};

export default InputLabel;
