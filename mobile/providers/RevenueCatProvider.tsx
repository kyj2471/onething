import { ReactNode, useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import { configureRevenueCat, logOutRevenueCat } from "@/lib/revenuecat";

export function RevenueCatProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const userId = session?.user.id;

  useEffect(() => {
    if (userId) {
      configureRevenueCat(userId);
    } else {
      logOutRevenueCat();
    }
  }, [userId]);

  return <>{children}</>;
}
