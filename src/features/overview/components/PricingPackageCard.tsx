import React, { useEffect, useState } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  Modal,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import {
  Check,
  CheckCircle2,
  Tag,
  X,
  Sparkles,
  AlertCircle,
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
  onRedeemPartnerPromo?: () => Promise<void>;
}

const PricingPackageCard: React.FC<Props> = ({
  packages,
  offerings,
  onActionPress,
  onChangePackage,
  onRedeemPartnerPromo,
}) => {
  const { user } = store.getState()["feature/auth"];
  const {
    restorePurchases,
    trialEligibility,
    purchasePartnerPromotion,
  } = useSubscription();
  const navigation = useNavigation();

  const [selectedPlan, setSelectedPlan] = useState("Premium");
  const [isPromoModalVisible, setIsPromoModalVisible] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [isCodeValidated, setIsCodeValidated] = useState(false);
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

  const handleRedeemPress = () => {
    setPromoCodeInput("");
    setPromoError("");
    setIsCodeValidated(false);
    setIsPromoModalVisible(true);
  };

  const validatePromoCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { isValid: false, message: "Please enter a promotional code." };
    }

    const validCodes = [
      "PARTNER",
      "PARTNER999",
      "PARTNER-OFFER",
      "FITPARTNER",
      "FITGURU999",
    ];

    if (
      validCodes.includes(cleanCode) ||
      cleanCode.startsWith("PARTNER") ||
      cleanCode.startsWith("FG")
    ) {
      return { isValid: true, message: "" };
    }

    return {
      isValid: false,
      message: "Invalid code. Please enter a valid partner promo code.",
    };
  };

  const handleValidateCode = () => {
    const validation = validatePromoCode(promoCodeInput);
    if (!validation.isValid) {
      setPromoError(validation.message);
      return;
    }
    setPromoError("");
    setIsCodeValidated(true);
  };

  const handlePromoSubmit = async () => {
    setPromoError("");
    setIsRedeeming(true);

    try {
      if (onRedeemPartnerPromo) {
        await onRedeemPartnerPromo();
      } else {
        await purchasePartnerPromotion();
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Promotional offer activated successfully!",
        });
        navigation.goBack();
      }
      setIsPromoModalVisible(false);
      setPromoCodeInput("");
      setIsCodeValidated(false);
    } catch (error: any) {
      const purchaseError = error as { userCancelled?: boolean };
      if (purchaseError?.userCancelled) {
        console.log("Partner promo purchase cancelled by user");
      } else {
        console.error("Error activating promo code:", error);
        setPromoError(
          error?.message ||
            "Failed to activate promotional offer. Please try again."
        );
      }
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
            <Box
              flexDirection="row"
              justifyContent="center"
              alignItems="center"
            >
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

      {/* In-App Partner Promotion Code Modal */}
      <Modal
        visible={isPromoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isRedeeming) {
            setIsPromoModalVisible(false);
            setIsCodeValidated(false);
          }
        }}
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
                <Text style={styles.modalTitle}>
                  {isCodeValidated
                    ? "Partner Offer Unlocked"
                    : "Redeem Promo Code"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (!isRedeeming) {
                    setIsPromoModalVisible(false);
                    setIsCodeValidated(false);
                  }
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={isRedeeming}
              >
                <X size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {!isCodeValidated ? (
              /* Step 1: Only show partner code entry until validated */
              <>
                <Text style={styles.modalDescription}>
                  Enter your partner promotional code below to access exclusive partner rates:
                </Text>

                <TextInput
                  style={[
                    styles.promoInput,
                    isInputFocused && styles.promoInputFocused,
                    !!promoError && styles.promoInputError,
                  ]}
                  placeholder="e.g. PARTNER999"
                  placeholderTextColor={theme.colors.SecondaryGrey}
                  value={promoCodeInput}
                  onChangeText={(text) => {
                    setPromoCodeInput(text);
                    if (promoError) setPromoError("");
                  }}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleValidateCode}
                  editable={!isRedeeming}
                />

                {promoError ? (
                  <View style={styles.errorContainer}>
                    <AlertCircle
                      size={14}
                      color={theme.colors.PrimaryRed}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.errorText}>{promoError}</Text>
                  </View>
                ) : null}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.redeemConfirmButton}
                    onPress={handleValidateCode}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.redeemConfirmText}>Continue</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsPromoModalVisible(false);
                      setIsCodeValidated(false);
                    }}
                  >
                    <Text color="textSecondary" variant="sm">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              /* Step 2: Show partner details & information with subscribe button only after correct partner code */
              <>
                {/* Code Applied Pill */}
                <View style={styles.appliedCodeRow}>
                  <View style={styles.appliedCodeLeft}>
                    <CheckCircle2
                      size={16}
                      color={theme.colors.PrimaryGreen}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.appliedCodeText}>
                      Code Applied:{" "}
                      <Text style={styles.appliedCodeHighlight}>
                        {promoCodeInput.trim().toUpperCase()}
                      </Text>
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setIsCodeValidated(false)}
                    disabled={isRedeeming}
                  >
                    <Text style={styles.changeCodeText}>Change</Text>
                  </TouchableOpacity>
                </View>

                {/* Offer Details Card */}
                <View style={styles.offerBanner}>
                  <View style={styles.offerBadge}>
                    <Sparkles
                      size={12}
                      color={theme.colors.PrimaryBlack}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.offerBadgeText}>PARTNER PROMOTION</Text>
                  </View>
                  <Text style={styles.offerHeadline}>1st Month for LKR 999</Text>
                  <Text style={styles.offerSubline}>
                    Enjoy full Premium access for LKR 999 for your first month,
                    followed by normal pricing thereafter.
                  </Text>

                  <View style={styles.offerBulletContainer}>
                    <View style={styles.offerBulletItem}>
                      <Check
                        size={14}
                        color={theme.colors.PrimaryGreen}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.offerBulletText}>
                        1st month discounted to LKR 999
                      </Text>
                    </View>
                    <View style={styles.offerBulletItem}>
                      <Check
                        size={14}
                        color={theme.colors.PrimaryGreen}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.offerBulletText}>
                        Standard monthly pricing thereafter
                      </Text>
                    </View>
                    <View style={styles.offerBulletItem}>
                      <Check
                        size={14}
                        color={theme.colors.PrimaryGreen}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.offerBulletText}>
                        Full personalized workout & AI meal plans
                      </Text>
                    </View>
                    <View style={styles.offerBulletItem}>
                      <Check
                        size={14}
                        color={theme.colors.PrimaryGreen}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.offerBulletText}>
                        Cancel anytime in store subscription settings
                      </Text>
                    </View>
                  </View>
                </View>

                {promoError ? (
                  <View style={styles.errorContainer}>
                    <AlertCircle
                      size={14}
                      color={theme.colors.PrimaryRed}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.errorText}>{promoError}</Text>
                  </View>
                ) : null}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[
                      styles.redeemConfirmButton,
                      isRedeeming && styles.buttonDisabled,
                    ]}
                    onPress={handlePromoSubmit}
                    activeOpacity={0.8}
                    disabled={isRedeeming}
                  >
                    {isRedeeming ? (
                      <ActivityIndicator
                        size="small"
                        color={theme.colors.PrimaryBlack}
                      />
                    ) : (
                      <Text style={styles.redeemConfirmText}>
                        Subscribe with Partner Offer • LKR 999
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      if (!isRedeeming) {
                        setIsPromoModalVisible(false);
                        setIsCodeValidated(false);
                      }
                    }}
                    disabled={isRedeeming}
                  >
                    <Text color="textSecondary" variant="sm">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  promoInputError: {
    borderColor: theme.colors.PrimaryRed,
  },
  appliedCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(160, 226, 32, 0.12)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(160, 226, 32, 0.3)",
  },
  appliedCodeLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  appliedCodeText: {
    color: theme.colors.PrimaryWhite,
    fontSize: 13,
  },
  appliedCodeHighlight: {
    color: theme.colors.PrimaryGreen,
    fontWeight: "bold",
  },
  changeCodeText: {
    color: theme.colors.PrimaryGreen,
    fontSize: 12,
    fontWeight: "600",
    textDecorationLine: "underline",
    marginLeft: 8,
  },
  offerBanner: {
    backgroundColor: "rgba(160, 226, 32, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(160, 226, 32, 0.25)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  offerBulletContainer: {
    marginTop: 10,
    gap: 6,
  },
  offerBulletItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  offerBulletText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  offerBadge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.PrimaryGreen,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  offerBadgeText: {
    color: theme.colors.PrimaryBlack,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  offerHeadline: {
    color: theme.colors.PrimaryWhite,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  offerSubline: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    marginTop: -8,
  },
  errorText: {
    color: theme.colors.PrimaryRed,
    fontSize: 12,
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
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
