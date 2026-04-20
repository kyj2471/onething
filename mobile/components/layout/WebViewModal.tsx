import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { WebView, type WebViewNavigation } from "react-native-webview";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";
import { APP_URL } from "@/constants/config";

function hostname(url: string): string {
  const match = /^https?:\/\/([^/?#]+)/i.exec(url);
  return match ? match[1].toLowerCase() : "";
}

const APP_HOST = hostname(APP_URL);

export function WebViewModal({
  title,
  path,
}: {
  title: string;
  path: string;
}) {
  const { palette } = useTheme();
  const [loading, setLoading] = useState(true);
  const url = `${APP_URL}${path}`;

  const handleNavigation = (req: WebViewNavigation): boolean => {
    const host = hostname(req.url);
    if (!host || host === APP_HOST) return true;
    Linking.openURL(req.url).catch(() => {});
    return false;
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: palette.bg }}
      edges={["top", "bottom"]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: palette.border,
        }}
      >
        <Text style={[typography.h2, { color: palette.fg }]}>{title}</Text>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={{ padding: 4 }}
        >
          <Text style={[typography.body, { color: palette.fgMuted }]}>✕</Text>
        </Pressable>
      </View>
      <View style={{ flex: 1, backgroundColor: palette.bg }}>
        <WebView
          source={{ uri: url }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onShouldStartLoadWithRequest={handleNavigation}
          style={{ flex: 1, backgroundColor: palette.bg }}
          startInLoadingState
          allowsBackForwardNavigationGestures
        />
        {loading ? (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: palette.bg,
            }}
            pointerEvents="none"
          >
            <ActivityIndicator color={palette.fg} />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
