import { View, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function DocumentViewer({ route }) {
  const { url, name } = route.params || {};

  if (!url) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-slate-700">No document URL provided.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <WebView
        source={{ uri: url }}
        startInLoadingState
        renderLoading={() => (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
            {name ? (
              <Text className="mt-2 text-slate-600 text-sm">{name}</Text>
            ) : null}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

