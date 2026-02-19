import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Dimensions,
  Pressable,
  FlatList,
  TouchableOpacity,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const { height } = Dimensions.get("window");
const videoHeight = height * 0.65;

const videoData = [
  { id: "1", videoId: "5kAngoBPm1g", titleKey: "videoTitle1", descKey: "videoDesc1", categoryKey: "videoCategory1" },
  { id: "2", videoId: "XrKEtEzqZ7g", titleKey: "videoTitle2", descKey: "videoDesc2", categoryKey: "videoCategory2" },
  { id: "3", videoId: "X14B37hYm1k", titleKey: "videoTitle3", descKey: "videoDesc3", categoryKey: "videoCategory3" },
  { id: "4", videoId: "VTQn0ogo4ms", titleKey: "videoTitle4", descKey: "videoDesc4", categoryKey: "videoCategory4" },
  { id: "5", videoId: "9_M4bNOxsYs", titleKey: "videoTitle5", descKey: "videoDesc5", categoryKey: "videoCategory5" },
];

export default function Awareness({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useTranslation();
  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 80 };

  const videos = videoData.map((v) => ({
    ...v,
    title: t(v.titleKey),
    description: t(v.descKey),
    category: t(v.categoryKey),
  }));

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderItem = useCallback(
    ({ item, index }) => {
      const isActive = index === currentIndex;

      return (
        <View className="mx-4 mt-4 rounded-xl overflow-hidden bg-black"
          style={{ height: videoHeight }}
        >
          {/* YouTube Player */}
          <YoutubePlayer
            height={500}
            play={isActive}
            videoId={item.videoId}
            webViewProps={{
              allowsFullscreenVideo: true,
            }}
          />

          {/* Category Badge */}
          <View className="absolute top-4 left-4 bg-primary px-3 py-1 rounded-full">
            <Text className="text-[10px] font-bold text-white uppercase">
              {item.category}
            </Text>
          </View>

          {/* Language Badge */}
          <View className="absolute top-4 right-4 bg-white/30 px-3 py-1 rounded-full">
            <View className="flex-row items-center gap-1">
              <MaterialIcons name="translate" size={14} color="white" />
              <Text className="text-[10px] font-bold text-white uppercase">
                {t("videoLanguage")}
              </Text>
            </View>
          </View>

          {/* Right Interaction Stack */}
          <View className="absolute right-4 bottom-24 items-center">
            <Pressable className="items-center">
              <View className="w-12 h-12 rounded-full bg-white/30 items-center justify-center">
                <MaterialIcons name="favorite-border" size={22} color="white" />
              </View>
              <Text className="text-[10px] font-semibold text-white mt-1">
                2.4k
              </Text>
            </Pressable>

            <Pressable className="items-center mt-6">
              <View className="w-12 h-12 rounded-full bg-white/30 items-center justify-center">
                <MaterialIcons name="bookmark-border" size={22} color="white" />
              </View>
              <Text className="text-[10px] font-semibold text-white mt-1">
                850
              </Text>
            </Pressable>

            <Pressable className="items-center mt-6">
              <View className="w-12 h-12 rounded-full bg-white/30 items-center justify-center">
                <MaterialIcons name="share" size={22} color="white" />
              </View>
              <Text className="text-[10px] font-semibold text-white mt-1">
                {t("awarenessShare")}
              </Text>
            </Pressable>
          </View>

          {/* Bottom Info Card */}
          <View className="absolute bottom-6 left-4 right-20 bg-white/20 p-4 rounded-lg">
            <Text className="text-white font-bold text-base mb-1">
              {item.title}
            </Text>
            <Text className="text-white text-xs">
              {item.description}
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
            <View className="h-full bg-primary w-2/3" />
          </View>
        </View>
      );
    },
    [currentIndex]
  );

  return (
    <View className="flex-1 bg-background-light">

      {/* Header */}
      <View className="mt-14 pb-4 px-6 border-b border-slate-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back-ios" size={20} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-900 ml-2">
            {t("awarenessHeader")}
          </Text>
        </View>
        <Text className="text-sm text-slate-500 font-medium">
          {t("awarenessTagline")}
        </Text>
      </View>

      {/* Vertical Reels */}
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
    </View>
  );
}
