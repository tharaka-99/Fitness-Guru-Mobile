import React, { useRef, useState, useEffect } from "react";
import {
  Image,
  ImageSourcePropType,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";

import Box from "@components/atoms/Box";
import PaginationDots from "@components/atoms/PaginationDots";

export interface PromoBannerItem {
  id: string;
  image: ImageSourcePropType;
}

interface WorkflowPromoBannerProps {
  height?: number;
}

const WorkflowPromoBanner: React.FC<WorkflowPromoBannerProps> = ({
  height = 175,
}) => {
  const pagerRef = useRef<PagerView>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const promoItems: PromoBannerItem[] = [
    {
      id: "workout-workflow",
      image: require("assets/images/banners/FG_App_Banner_1.jpeg"),
    },
    {
      id: "nutrition-workflow",
      image: require("assets/images/banners/FG_App_Banner_2.jpeg"),
    },
    {
      id: "analytics-workflow",
      image: require("assets/images/banners/FG_App_Banner_3.jpeg"),
    },
    {
      id: "pro-promo",
      image: require("assets/images/banners/FG_App_Banner_4.jpeg"),
    },
  ];

  // Auto-scroll carousel every 5 seconds
  useEffect(() => {
    if (promoItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % promoItems.length;
        pagerRef.current?.setPage(nextIndex);
        return nextIndex;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [promoItems.length]);

  return (
    <Box width="100%" height={height} mb="xl">
      <Box
        width="100%"
        height={height}
        borderRadius="sm"
        overflow="hidden"
        backgroundColor="backgroundSecondary"
        style={{
          borderWidth: 1,
          borderColor: "rgba(160, 226, 32, 0.3)",
        }}
      >
        <PagerView
          ref={pagerRef}
          style={{ width: "100%", height: height }}
          initialPage={0}
          onPageSelected={(e) => setCurrentIndex(e.nativeEvent.position)}
        >
          {promoItems.map((item) => (
            <View key={item.id} style={{ width: "100%", height: height }}>
              <Image
                source={item.image}
                style={{
                  width: "100%",
                  height: height,
                }}
                resizeMode="cover"
              />
            </View>
          ))}
        </PagerView>
      </Box>

      {/* <Box alignItems="center" mt="xs">
        <PaginationDots
          currentPage={currentIndex}
          dotsCount={promoItems.length}
        />
      </Box> */}
    </Box>
  );
};

export default WorkflowPromoBanner;
