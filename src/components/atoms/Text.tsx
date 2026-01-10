import { createText } from "@shopify/restyle";
import { Theme } from "@utils/styles/theme";

const Text = createText<Theme>();

if (Text.defaultProps == null) {
  Text.defaultProps = {};
  Text.defaultProps.allowFontScaling = false;
}

export default Text;
