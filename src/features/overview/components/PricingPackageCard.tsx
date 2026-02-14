import React, { useEffect, useState } from "react";
import { TouchableOpacity, StyleSheet, Linking } from "react-native";
import { Check, CheckCircle2 } from "lucide-react-native";
import Box from "@components/atoms/Box";
import Text from "@components/atoms/Text";
import Button from "@components/atoms/Button";
import { theme } from "@utils/styles/theme";
import { store } from "@/store";
import { authActions } from "@features/auth/context/slice";
import { PurchasesOfferings } from "react-native-purchases";
import useSubscription from "@features/subscription/hooks/useSubscription";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";

interface Props {
  packages: any;
  offerings?: PurchasesOfferings;
  onActionPress: (id: string) => void;
  onChangePackage: (id: string) => void;
}


const PricingPackageCard: React.FC<Props> = ({
  packages,
  offerings,
  onActionPress,
  onChangePackage,
}) => {
  const { user } = store.getState()["feature/auth"];
  const { restorePurchases } = useSubscription();
  const navigation = useNavigation();


  // const [selectedPlan, setSelectedPlan] = useState(
  //   user?.isInjured ? 'Premium' : 'Standard'
  // );
  const [selectedPlan, setSelectedPlan] = useState("Premium");


  useEffect(() => {
    // user?.isInjured ? setSelectedPlan('Premium') : setSelectedPlan('Standard');
    setSelectedPlan("Premium");
  }, [user?.isInjured]);


  const filteredPackages = packages?.filter(
    (p: any) => p.name === selectedPlan
  );
  const getRevenueCatPrice = () => {
    if (!offerings?.current?.availablePackages) return null;

    const monthlyPackage = offerings.current.availablePackages.find(
      (pkg) => pkg.identifier === "$rc_monthly"
    );

    return monthlyPackage?.product?.priceString || null;
  };

  const revenueCatPrice = getRevenueCatPrice();

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL", err)
    );
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
            {selectedPlan} plan
          </Text>
        </Box>


        {/* Toggle Buttons - Hide if injured */}
        {/* {!user?.isInjured && (
          <Box
            flexDirection="row"
            alignSelf="center"
            mt="sm"
            style={styles.toggleContainer}
          > */}
        {/* <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedPlan === 'Standard' && styles.selectedButton,
              ]}
              onPress={() => {
                setSelectedPlan('Standard');
                onChangePackage('Standard');
              }}
            >
              <Text
                style={[
                  styles.toggleText,
                  selectedPlan === 'Standard' && styles.selectedText,
                ]}
              >
                Standard
              </Text>
            </TouchableOpacity> */}
        {/* <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedPlan === "Premium" && styles.selectedButton,
              ]}
              onPress={() => {
                setSelectedPlan("Premium");
                onChangePackage("Premium");
              }}
            >
              <Text
                style={[
                  styles.toggleText,
                  selectedPlan === "Premium" && styles.selectedText,
                ]}
              >
                Premium
              </Text>
            </TouchableOpacity> */}
        {/* </Box>
        )} */}

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
          <CheckCircle2
            size={20}
            color={theme.colors.PrimaryGreen}
          />
          <Box flex={1} ml="sm">
            <Text variant="lg" style={styles.planTitle}>
              Monthly
            </Text>
            <Text variant="sm" style={styles.planSubtitle}>
              Full access for just {revenueCatPrice || `LKR ${filteredPackages[0]?.price}.00`}/month
            </Text>
          </Box>
        </Box>
      </Box>


      {/* Continue Button */}
      <Box mt="sm">
        <Button
          title="Subscribe"
          isLoading={false}
          onPress={() => onActionPress(selectedPlan)}
        />

        <TouchableOpacity
          onPress={async () => {
            try {
              const restoredInfo = await restorePurchases();
              if (restoredInfo?.activeSubscriptions && restoredInfo.activeSubscriptions.length > 0) {
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
          }}
          style={{
            padding: 10,
            alignItems: "center",

          }}
        >
          <Box flexDirection="row" justifyContent="center" alignItems="center">
            <Text variant="md" color="PrimaryGreen">
              Restore Purchases
            </Text>
          </Box>
        </TouchableOpacity>

        {/* Free Trial Button
        <Button
          title="Start Free Trial (Testing)"
          isLoading={false}
          onPress={() => {
            // Set trial status to true for testing
            store.dispatch(authActions.setTrialStatus(true));
            // Also set subscription status to true to bypass premium checks
            store.dispatch(authActions.setSubscription({ status: true }));
            // Navigate to the next screen
            onActionPress(selectedPlan);
          }}
          style={styles.trialButton}
        /> */}


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
    </Box>
  );
};


// Styles
const styles = StyleSheet.create({
  headerTextContainer: {},
  headerText: {
    color: "white",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 2,
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
  footer: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    margin: 10,
  },
  trialButton: {
    backgroundColor: "#FF6B35", // Orange color for trial button
    marginTop: 10,
  },
});


export default PricingPackageCard;



