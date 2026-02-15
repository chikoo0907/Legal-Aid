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

const { height } = Dimensions.get("window");
const videoHeight = height * 0.65;

const videos = [
  {
    id: "1",
    videoId: "5kAngoBPm1g",
    title: "Understanding Domestic Violence Act",
    description:
      "Learn about protection and legal remedies available for women under the 2005 Act.",
    category: "Women Rights",
    language: "Hindi",
  },
  {
    id: "2",
    videoId: "XrKEtEzqZ7g",
    title: "Know Your FIR Rights",
    description:
      "Understand how FIR works and your rights while filing a police complaint.",
    category: "Police Rights",
    language: "Hindi",
  },
  {
    id: "3",
    videoId: "X14B37hYm1k",
    title: "Legal Help for Tenants",
    description:
      "Know your rights as a tenant under Indian property laws.",
    category: "Property Law",
    language: "Hindi",
  },
  {
    id: "4",
    videoId: "VTQn0ogo4ms",
    title: "Cyber Crime Awareness",
    description:
      "Stay safe online and understand legal remedies against cyber fraud.",
    category: "Cyber Law",
    language: "Hindi",
  },
  {
    id: "5",
    videoId: "9_M4bNOxsYs",
    title: "Consumer Protection Act",
    description:
      "Know your rights as a consumer and how to file complaints.",
    category: "Consumer Law",
    language: "Hindi",
  },
];

export default function Awareness({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 80 };

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
                {item.language}
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
                Share
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
            Legal Awareness
          </Text>
        </View>
        <Text className="text-sm text-slate-500 font-medium">
          Know Your Rights in Simple Language
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
