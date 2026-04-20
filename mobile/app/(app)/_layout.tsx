import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useTranslation } from "react-i18next";
import { PaywallGate } from "@/components/layout/PaywallGate";
import { useSession } from "@/hooks/useSession";
import { useSubscription } from "@/hooks/useSubscription";
import { useTheme } from "@/hooks/useTheme";
import { typography } from "@/constants/typography";

type TabKey = "today" | "goal" | "progress" | "settings";

function TabIcon({ tab, color, focused }: { tab: TabKey; color: string; focused: boolean }) {
  const size = 22;
  const strokeWidth = focused ? 1.9 : 1.6;
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
  };
  const stroke = {
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (tab === "today") {
    return (
      <Svg {...common}>
        <Circle cx={12} cy={12} r={9} {...stroke} />
        <Path d="M12 7v5l3 2" {...stroke} />
      </Svg>
    );
  }
  if (tab === "goal") {
    return (
      <Svg {...common}>
        <Circle cx={12} cy={12} r={9} {...stroke} />
        <Circle cx={12} cy={12} r={5} {...stroke} />
        <Circle cx={12} cy={12} r={1.5} fill={color} />
      </Svg>
    );
  }
  if (tab === "progress") {
    return (
      <Svg {...common}>
        <Path d="M4 19V5" {...stroke} />
        <Path d="M4 19h16" {...stroke} />
        <Rect x={7} y={12} width={3} height={7} {...stroke} />
        <Rect x={12} y={8} width={3} height={11} {...stroke} />
        <Rect x={17} y={4} width={3} height={15} {...stroke} />
      </Svg>
    );
  }
  return (
    <Svg {...common}>
      <Circle cx={12} cy={8} r={4} {...stroke} />
      <Path d="M4 20c0-4 4-6 8-6s8 2 8 6" {...stroke} />
    </Svg>
  );
}

export default function AppLayout() {
  const { palette } = useTheme();
  const { session, loading } = useSession();
  const { t } = useTranslation();
  const { data: subscription, isLoading: subLoading } = useSubscription(
    session?.user.id,
  );

  if (loading || (session && subLoading)) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: palette.bg,
        }}
      >
        <ActivityIndicator color={palette.fg} />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/welcome" />;

  if (subscription && subscription.tier === "free") {
    return <PaywallGate userId={session.user.id} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: palette.bg },
        tabBarActiveTintColor: palette.fg,
        tabBarInactiveTintColor: palette.fgMuted,
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          ...typography.caption,
          textTransform: "none",
          letterSpacing: 0,
          fontSize: 11,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: t("tabs.today"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon tab="today" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="goal"
        options={{
          title: t("tabs.goal"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon tab="goal" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t("tabs.progress"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon tab="progress" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settings"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon tab="settings" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
