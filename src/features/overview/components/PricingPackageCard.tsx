import React, { useEffect, useState } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  Modal,
  TextInput,
  View,
} from "react-native";
import {
  Check,
  CheckCircle2,
  Tag,
  X,
  ExternalLink,
} from "lucide-react-native";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import Button from "@components/atoms/Button";
import { theme } from "@utils/styles/theme";
import { store } from "@/store";
import {
  PurchasesOfferings,
  INTRO_ELIGIBILITY_STATUS,
} from "react-native-purchases";
import useSubscription from "@features/subscription/hooks/useSubscription";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";

interface Props {
  packages: any;
  offerings?: PurchasesOfferings;
  onActionPress: (id: string, discount?: any) => void;
  onChangePackage: (id: string) => void;
}

const PricingPackageCard: React.FC<Props> = ({
  packages,
  offerings,
  onActionPress,
  onChangePackage,
}) => {
  const { user } = store.getState()["feature/auth"];
  const {
    restorePurchases,
    trialEligibility,
    presentCodeRedemption,
    refreshCustomerInfo,
  } = useSubscription();
  const navigation = useNavigation();

  const [selectedPlan, setSelectedPlan] = useState("Premium");
  const [isPromoModalVisible, setIsPromoModalVisible] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    setSelectedPlan("Premium");
  }, [user?.isInjured]);

  const filteredPackages = packages?.filter(
    (p: any) => p.name === selectedPlan
  );

  const getPackageData = () => {
    if (!offerings?.current?.availablePackages)
      return {
        price: null,
        hasTrial: false,
        trialDuration: null,
        discountTrial: null,
      };

    const monthlyPackage = offerings.current.availablePackages.find(
      (pkg) => pkg.identifier === "$rc_monthly"
    );

    if (!monthlyPackage)
      return {
        price: null,
        hasTrial: false,
        trialDuration: null,
        discountTrial: null,
      };

    const price = monthlyPackage.product.priceString ?? null;

    const introPrice = monthlyPackage.product.introPrice;
    const introTrial = introPrice && introPrice.price === 0 ? introPrice : null;

    const isEligible =
      trialEligibility.status ===
        INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE ||
      trialEligibility.status ===
        INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_UNKNOWN;

    const hasAndroidTrial =
      Platform.OS === "android" &&
      (!!monthlyPackage.product.defaultOption?.freePhase ||
        introPrice?.price === 0);

    const hasiOSTrial = Platform.OS === "ios" && isEligible && !!introTrial;

    const hasTrial = hasAndroidTrial || hasiOSTrial;

    return {
      price,
      hasTrial,
    };
  };

  const { price: revenueCatPrice, hasTrial } = getPackageData();

  const formattedTrialInfo = hasTrial ? "14 days free" : null;

  const buttonTitle = () => {
    if (trialEligibility.isLoading) return "Loading...";
    if (hasTrial) return "Start 14-Day Free Trial";
    return "Subscribe";
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL", err)
    );
  };

  const handleRedeemPress = async () => {
    if (Platform.OS === "ios") {
      try {
        setIsRedeeming(true);
        await presentCodeRedemption();
        const updated = await refreshCustomerInfo();
        if (
          updated?.activeSubscriptions &&
          updated.activeSubscriptions.length > 0
        ) {
          Toast.show({
            type: "success",
            text1: "Success",
            text2: "Promotional code applied successfully!",
          });
          navigation.goBack();
        }
      } catch (error: any) {
        if (!error?.userCancelled) {
          console.error("Error presenting Apple offer code sheet:", error);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: error?.message || "Failed to present code redemption sheet.",
          });
        }
      } finally {
        setIsRedeeming(false);
      }
    } else {
      setIsPromoModalVisible(true);
    }
  };

  const handleAndroidRedeemSubmit = async () => {
    try {
      setIsRedeeming(true);
      setIsPromoModalVisible(false);
      await presentCodeRedemption(promoCodeInput);
      setPromoCodeInput("");
      Toast.show({
        type: "info",
        text1: "Opening Google Play",
        text2:
          "Complete redemption in Play Store, then return here to enjoy Premium.",
      });
    } catch (error: any) {
      console.error("Error opening Google Play redemption:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Failed to open Google Play redemption.",
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      const restoredInfo = await restorePurchases();
      if (
        restoredInfo?.activeSubscriptions &&
        restoredInfo.activeSubscriptions.length > 0
      ) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Purchases restored successfully!",
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: "info",
          text1: "Info",
          text2: "No purchases to restore.",
        });
      }
    } catch (error: any) {
      console.error("Error restoring purchases:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to restore purchases.",
      });
    }
  };

  return (
    <Box
      flex={1}
      width="100%"
      px="base"
      style={{ justifyContent: "space-between" }}
    >
      <Box>
        <Box style={styles.headerTextContainer}>
          <Text variant="2xlBold" style={styles.headerText} mt="base">
            Get started with our{"\n"}
            {selectedPlan} Plan
          </Text>
        </Box>

        {/* Benefits */}
        <Box mt="lg" style={styles.benefitsContainer}>
          {filteredPackages[0]?.benefits?.map((ben: any, index: number) => (
            <Box key={index} flexDirection="row" alignItems="center" mb="md">
              <Check
                size={18}
                color={theme.colors.PrimaryGreen}
                style={{ marginRight: 8 }}
              />
              <Text variant="md" style={styles.benefitText}>
                {ben}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Plan Selection */}
        <Box mt="sm" style={styles.planCard}>
          <CheckCircle2 size={20} color={theme.colors.PrimaryGreen} />
          <Box flex={1} ml="sm">
            <Text variant="lg" style={styles.planTitle}>
              Monthly
            </Text>
            <Text variant="sm" style={styles.planSubtitle}>
              {hasTrial
                ? `${formattedTrialInfo}, then ${revenueCatPrice}/month`
                : `Full access for just ${revenueCatPrice}/month`}
            </Text>
          </Box>
        </Box>
      </Box>

      <Box mt="sm">
        <Button
          title={buttonTitle()}
          isLoading={trialEligibility.isLoading}
          onPress={() => onActionPress(selectedPlan)}
        />

        {/* Promotional Code & Restore Actions */}
        <Box
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          mt="xs"
          style={styles.actionRow}
        >
          <TouchableOpacity
            onPress={handleRedeemPress}
            disabled={isRedeeming}
            style={styles.actionLink}
            activeOpacity={0.7}
          >
            <Box flexDirection="row" alignItems="center">
              <Tag
                size={15}
                color={theme.colors.PrimaryGreen}
                style={{ marginRight: 5 }}
              />
              <Text variant="md" color="PrimaryGreen" fontWeight="600">
                Redeem Code
              </Text>
            </Box>
          </TouchableOpacity>

          <Text variant="sm" color="textSecondary" style={styles.actionDivider}>
            •
          </Text>

          <TouchableOpacity
            onPress={handleRestorePurchases}
            style={styles.actionLink}
            activeOpacity={0.7}
          >
            <Box flexDirection="row" justifyContent="center" alignItems="center">
              <Text variant="md" color="PrimaryGreen">
                Restore Purchases
              </Text>
            </Box>
          </TouchableOpacity>
        </Box>

        <Box style={styles.footer}>
          <TouchableOpacity
            onPress={() =>
              openLink("https://www.fitnessgurulk.com/term-conditions")
            }
          >
            <Text variant="sm">Terms</Text>
          </TouchableOpacity>
          <Text variant="sm">•</Text>
          <TouchableOpacity
            onPress={() =>
              openLink("https://www.fitnessgurulk.com/privacy-policy")
            }
          >
            <Text variant="sm">Privacy</Text>
          </TouchableOpacity>
        </Box>
      </Box>

      {/* Android Promotional Code Modal */}
      <Modal
        visible={isPromoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPromoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Tag
                  size={20}
                  color={theme.colors.PrimaryGreen}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.modalTitle}>Redeem Promo Code</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsPromoModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Enter your Google Play promotional code below or proceed to Google
              Play to redeem your subscription offer.
            </Text>

            <TextInput
              style={[
                styles.promoInput,
                isInputFocused && styles.promoInputFocused,
              ]}
              placeholder="e.g. FITGURU2026"
              placeholderTextColor={theme.colors.SecondaryGrey}
              value={promoCodeInput}
              onChangeText={setPromoCodeInput}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleAndroidRedeemSubmit}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.redeemConfirmButton}
                onPress={handleAndroidRedeemSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.redeemConfirmText}>Redeem on Google Play</Text>
                <ExternalLink size={16} color={theme.colors.PrimaryBlack} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsPromoModalVisible(false)}
              >
                <Text color="textSecondary" variant="sm">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Box>
  );
};

const styles = StyleSheet.create({
  headerTextContainer: {},
  headerText: {
    color: "white",
    textAlign: "center",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    padding: 4,
    width: "50%",
  },
  toggleButton: {
    flex: 4,
    alignItems: "center",
    paddingVertical: 5,
    borderRadius: 16,
  },
  selectedButton: {
    backgroundColor: theme.colors.PrimaryGreen,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  selectedText: {
    color: theme.colors.PrimaryBlack,
    fontWeight: "bold",
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.PrimaryGreen,
    padding: 10,
    borderRadius: 12,
  },
  planTitle: {
    fontWeight: "bold",
    color: "#ffff",
  },
  planSubtitle: {
    color: "white",
  },
  benefitsContainer: {
    paddingRight: 30,
  },
  benefitText: {
    color: "white",
    fontSize: 16,
  },
  actionRow: {
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  actionLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionDivider: {
    marginHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: theme.colors.borderSecondary,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalTitle: {
    color: theme.colors.PrimaryWhite,
    fontSize: 18,
    fontWeight: "bold",
  },
  modalDescription: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  promoInput: {
    backgroundColor: theme.colors.backgroundPrimary,
    borderWidth: 1,
    borderColor: theme.colors.borderSecondary,
    borderRadius: 12,
    color: theme.colors.PrimaryWhite,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: "center",
    letterSpacing: 2,
    fontWeight: "bold",
    marginBottom: 16,
  },
  promoInputFocused: {
    borderColor: theme.colors.PrimaryGreen,
  },
  modalActions: {
    gap: 8,
  },
  redeemConfirmButton: {
    backgroundColor: theme.colors.PrimaryGreen,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  redeemConfirmText: {
    color: theme.colors.PrimaryBlack,
    fontSize: 15,
    fontWeight: "bold",
    marginRight: 6,
  },
  cancelButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
  footer: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    margin: 10,
  },
  trialButton: {
    backgroundColor: "#FF6B35",
    marginTop: 10,
  },
});

export default PricingPackageCard;
