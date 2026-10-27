import React from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { ArrowUpCircle } from "lucide-react-native";
import { theme } from "@utils/styles/theme";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";

interface ForceUpdateModalProps {
  isVisible: boolean;
  storeUrl: string;
  currentVersion: string;
  latestVersion: string;
}

const ForceUpdateModal: React.FC<ForceUpdateModalProps> = ({
  isVisible,
  storeUrl,
  currentVersion,
  latestVersion,
}) => {
  const handleUpdate = () => {
    Linking.openURL(storeUrl).catch((err) =>
      console.error("Failed to open store link:", err)
    );
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => {
        // Force update: do nothing on hardware back button on Android
      }}
    >
      <Box style={styles.overlay}>
        <Box
          backgroundColor="PrimaryGrey"
          padding="xl"
          borderRadius="lg"
          alignItems="center"
          width="88%"
          style={styles.container}
        >
          <Box style={styles.iconContainer}>
            <ArrowUpCircle size={64} color={theme.colors.PrimaryGreen} />
          </Box>

          <Text
            variant="2xlBold"
            color="textPrimary"
            textAlign="center"
            style={styles.title}
          >
            Update Required
          </Text>

          <Text
            variant="sm"
            color="textSecondary"
            textAlign="center"
            style={styles.versionInfo}
          >
            v{currentVersion} → v{latestVersion}
          </Text>

          <Text
            variant="md"
            color="textPrimary"
            textAlign="center"
            style={styles.description}
          >
            We've introduced amazing new features and critical stability
            improvements. To continue working on the best version of yourself,
            please update Fitness Guru.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleUpdate}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Update Now</Text>
          </TouchableOpacity>
        </Box>
      </Box>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  iconContainer: {
    marginBottom: 8,
  },
  title: {
    marginTop: 16,
    letterSpacing: 0.5,
  },
  versionInfo: {
    marginTop: 4,
    marginBottom: 16,
    opacity: 0.8,
  },
  description: {
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: theme.colors.PrimaryGreen,
    paddingVertical: 15,
    borderRadius: 12,
    width: "100%",
    shadowColor: theme.colors.PrimaryGreen,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});

export default ForceUpdateModal;
