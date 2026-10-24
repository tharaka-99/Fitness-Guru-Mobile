import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  Platform,
} from "react-native";
import PagerView from "react-native-pager-view";
import { useDispatch } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";

import Box from "@components/atoms/Box";

import { constants, theme } from "@utils/styles/theme";
import { getStartedActions } from "../context/slice";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "@components/atoms/Button";
import {
  Accessibility,
  Activity,
  CalendarDays,
  ClipboardList,
  Crosshair,
  Dumbbell,
  Flame,
  Leaf,
  Sparkles,
  Target,
  TrendingUp,
  Utensils,
  PersonStanding,
  Goal,
  Repeat,
  ChartLine,
  SlidersVertical,
} from "lucide-react-native";
import PageWrapper from "@components/app/PageWrapper";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SLIDES = [
  {
    image: require("assets/images/FG_Onbaord01.png"),
    titleParts: [
      { text: "YOUR ", color: theme.colors.PrimaryWhite },
      { text: "BODY\n", color: theme.colors.PrimaryGreen },
      { text: "YOUR ", color: theme.colors.PrimaryWhite },
      { text: "WORKOUT", color: theme.colors.PrimaryGreen },
    ],
    features: [
      { text: "Tailored to\nyour physique", icon: PersonStanding },
      { text: "Designed for\nyour goals", icon: Goal },
      { text: "Built for\nyour fitness", icon: Dumbbell },
    ],
  },
  {
    image: require("assets/images/FG_Onbaord02.png"),
    titleParts: [
      { text: "BUILT ", color: theme.colors.PrimaryGreen },
      { text: "AROUND\n", color: theme.colors.PrimaryWhite },
      { text: "LOCAL ", color: theme.colors.PrimaryWhite },
      { text: "FOODS", color: theme.colors.PrimaryGreen },
    ],
    features: [
      { text: "Sri Lankan\nNutrition", icon: Utensils },
      { text: "Built for\nyour goals", icon: Goal },
      { text: "Practical and\nsustainable", icon: Repeat },
    ],
  },
  {
    image: require("assets/images/FG_Onbaord03.png"),
    titleParts: [
      { text: "LOG ", color: theme.colors.PrimaryGreen },
      { text: "SETS\n", color: theme.colors.PrimaryWhite },
      { text: "TRACK ", color: theme.colors.PrimaryWhite },
      { text: "PROGRESS", color: theme.colors.PrimaryGreen },
    ],
    features: [
      { text: "Simple\nworkout loggins", icon: ClipboardList },
      { text: "Performance\nInsights", icon: TrendingUp },
      { text: "Consistency into\nlasting results.", icon: Flame },
    ],
  },
  {
    image: require("assets/images/FG_Onbaord04.png"),
    titleParts: [
      { text: "NEW ", color: theme.colors.PrimaryWhite },
      { text: "MONTH\n", color: theme.colors.PrimaryGreen },
      { text: "NEW ", color: theme.colors.PrimaryWhite },
      { text: "PLAN", color: theme.colors.PrimaryGreen },
    ],
    features: [
      { text: "New plan\nevery month", icon: CalendarDays },
      { text: "Dream physique\ncontinues", icon: ChartLine },
      { text: "Adjusting plans\non progress", icon: SlidersVertical },
    ],
  },
];

const SlideImage = ({ source, style, resizeMode }: any) => {
  const [loading, setLoading] = useState(true);

  return (
    <View style={{ height: SCREEN_HEIGHT }}>
      <Image
        source={source}
        style={style}
        resizeMode="cover"
        onLoadEnd={() => setLoading(false)}
      />
      {loading && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              height: SCREEN_HEIGHT * 0.7,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 0,
            },
          ]}
        >
          <ActivityIndicator size="small" color={theme.colors.PrimaryGreen} />
        </View>
      )}
    </View>
  );
};

const GetStartedScreen: React.FC = () => {
  const dispatch = useDispatch();
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const insets = useSafeAreaInsets();

  const isLastSlide = currentPage === SLIDES.length - 1;

  const handleNext = () => {
    if (!isLastSlide) {
      pagerRef.current?.setPage(currentPage + 1);
    }
  };

  const handleFinish = () => {
    dispatch(getStartedActions.markGetStartedSeen());
  };

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {SLIDES.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentPage ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );

  const renderFeatures = (
    features: { text: string; icon: React.ElementType }[]
  ) => (
    <View style={styles.featuresRow}>
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <React.Fragment key={index}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconCircle}>
                <Icon size={25} color={theme.colors.PrimaryGreen} />
              </View>
              <Text
                style={[
                  styles.featureText,
                  {
                    fontSize: 12,
                    color: theme.colors.SecondaryGrey,
                    textAlign: "center",
                    fontFamily: "Jost_400Regular",
                  },
                ]}
              >
                {feature.text}
              </Text>
            </View>
            {index < features.length - 1 && (
              <View style={styles.featureDivider} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );

  const renderSlide = (slideIndex: number) => {
    const slide = SLIDES[slideIndex];
    return (
      <View key={slideIndex} style={[styles.slide]}>
        <SlideImage
          source={slide.image}
          style={[styles.backgroundImage, { height: SCREEN_HEIGHT }]}
          resizeMode="cover"
        />

        {/* <LinearGradient
          colors={["transpate", "rgba(13,13,13,0.85)", "#0D0D0D"]}
          locations={[0.0, 0.45, 0.75]}
          style={[styles.gradient, { height: SCREEN_HEIGHT }]}
        /> */}

        <View
          style={[
            styles.topBar,
            { top: Platform.OS === "ios" ? insets.top + 30 : 50 },
          ]}
        >
          {renderDots()}
          <TouchableOpacity
            onPress={handleFinish}
            activeOpacity={constants.activeOpacity}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={{ fontSize: 16, color: theme.colors.PrimaryWhite }}>
              Skip
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.bottomContent,
            { bottom: Platform.OS === "ios" ? insets.bottom + 20 : 0 },
          ]}
        >
          <Text
            style={[
              styles.title,
              {
                fontSize: 30, // 2xlBold
                // fontWeight: "bold",
                textAlign: "center",
              },
            ]}
          >
            {slide.titleParts.map((part, i) => (
              <Text
                key={i}
                style={{
                  fontSize: 32, // 3xlBold
                  // fontWeight: "bold",
                  color: part.color,
                  fontFamily: "Jost_900Black",
                  textShadowColor: "black",
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                {part.text}
              </Text>
            ))}
          </Text>

          {renderFeatures(slide.features)}

          <Box width={"100%"}>
            <Button
              title={isLastSlide ? "Get Started" : "Next"}
              onPress={isLastSlide ? handleFinish : handleNext}
            />
          </Box>
        </View>
      </View>
    );
  };

  return (
    <PageWrapper noPadding noTopPadding noBottomPadding>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        scrollEnabled={true}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {SLIDES.map((_, index) => renderSlide(index))}
      </PagerView>
    </PageWrapper>
  );
};

export default GetStartedScreen;

const styles = StyleSheet.create({
  pager: {
    flex: 1,
    backgroundColor: "#000000",
  },

  slide: {
    flex: 1,
    // paddingTop: 15,
    backgroundColor: "#000000",
  },

  backgroundImage: {
    position: "absolute",
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },

  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT * 0.55,
  },

  topBar: {
    position: "absolute",
    left: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },

  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  dot: {
    height: 4,
    borderRadius: 2,
  },

  dotActive: {
    width: 20,
    backgroundColor: theme.colors.PrimaryGreen,
  },

  dotInactive: {
    width: 20,
    backgroundColor: theme.colors.SecondaryGrey,
    opacity: 0.5,
  },

  bottomContent: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
  },

  title: {
    marginBottom: 10,
    textTransform: "uppercase",
    lineHeight: 42,
    fontFamily: "Jost_700Bold",
  },

  featuresRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: 10,
    width: "100%",
    paddingHorizontal: theme.spacing.sm,
  },

  featureItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },

  featureIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#455721",
    alignItems: "center",
    justifyContent: "center",
  },

  featureText: {
    lineHeight: 15,
  },

  featureDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.SecondaryGrey,
    opacity: 0.3,
    marginTop: 8,
  },
});
