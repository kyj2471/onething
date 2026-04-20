import { useQuery } from "@tanstack/react-query";
import Purchases from "react-native-purchases";
import { supabase } from "@/lib/supabase";
import { PRO_ENTITLEMENT } from "@/lib/revenuecat";
import type { Database } from "@/types/supabase";

export type SubscriptionTier = "pro" | "trial" | "free";

export type SubscriptionState = {
  tier: SubscriptionTier;
  source: "ios" | "android" | "web" | null;
  trialEndsAt: string | null;
  expiresAt: string | null;
  isPro: boolean;
  isTrial: boolean;
};

type ProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "subscription_status" | "trial_ends_at"
>;
type SubscriptionRow = Pick<
  Database["public"]["Tables"]["subscriptions"]["Row"],
  "source" | "status" | "current_period_end"
>;

export function subscriptionQueryKey(userId: string) {
  return ["subscription", userId] as const;
}

export function useSubscription(userId: string | undefined) {
  return useQuery({
    queryKey: subscriptionQueryKey(userId ?? "_"),
    enabled: !!userId,
    queryFn: async (): Promise<SubscriptionState> => {
      if (!userId) throw new Error("No user");

      // 1. RevenueCat
      try {
        const info = await Purchases.getCustomerInfo();
        const ent = info.entitlements.active[PRO_ENTITLEMENT];
        if (ent) {
          return {
            tier: "pro",
            source: ent.store === "PLAY_STORE" ? "android" : "ios",
            trialEndsAt: null,
            expiresAt: ent.expirationDate ?? null,
            isPro: true,
            isTrial: false,
          };
        }
      } catch {
        // RC not configured / offline — fall through to Supabase
      }

      // 2. Supabase web subscription
      const { data: subRows } = await supabase
        .from("subscriptions")
        .select("source, status, current_period_end")
        .eq("user_id", userId)
        .eq("source", "web")
        .eq("status", "active")
        .order("current_period_end", { ascending: false })
        .limit(1);
      const webSub = (subRows as SubscriptionRow[] | null)?.[0];
      if (webSub) {
        return {
          tier: "pro",
          source: "web",
          trialEndsAt: null,
          expiresAt: webSub.current_period_end,
          isPro: true,
          isTrial: false,
        };
      }

      // 3. Profile trial / status
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status, trial_ends_at")
        .eq("id", userId)
        .maybeSingle();
      const p = profile as ProfileRow | null;
      const trialEnds = p?.trial_ends_at ? new Date(p.trial_ends_at) : null;
      const trialActive =
        p?.subscription_status === "trial" &&
        !!trialEnds &&
        trialEnds.getTime() > Date.now();
      if (trialActive) {
        return {
          tier: "trial",
          source: null,
          trialEndsAt: p?.trial_ends_at ?? null,
          expiresAt: null,
          isPro: false,
          isTrial: true,
        };
      }

      return {
        tier: "free",
        source: null,
        trialEndsAt: p?.trial_ends_at ?? null,
        expiresAt: null,
        isPro: false,
        isTrial: false,
      };
    },
  });
}
