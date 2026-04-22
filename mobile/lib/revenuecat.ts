import { Platform } from "react-native";
import Purchases, {
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from "react-native-purchases";

export const PRO_ENTITLEMENT = "pro";

let configured = false;

const isNative = Platform.OS === "ios" || Platform.OS === "android";

export function configureRevenueCat(userId: string) {
  if (!isNative) return;
  if (configured) {
    Purchases.logIn(userId).catch((err) => {
      console.warn("[revenuecat] logIn failed", err);
    });
    return;
  }

  const apiKey =
    Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_RC_IOS_KEY
      : process.env.EXPO_PUBLIC_RC_ANDROID_KEY;

  if (!apiKey) {
    console.warn(
      "[revenuecat] Missing EXPO_PUBLIC_RC_IOS_KEY / EXPO_PUBLIC_RC_ANDROID_KEY",
    );
    return;
  }

  Purchases.configure({ apiKey, appUserID: userId });
  configured = true;
}

export async function checkProStatus(): Promise<boolean> {
  if (!isNative || !configured) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return Boolean(info.entitlements.active[PRO_ENTITLEMENT]);
  } catch (err) {
    console.warn("[revenuecat] getCustomerInfo failed", err);
    return false;
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!isNative || !configured) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current ?? null;
}

export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

export async function logOutRevenueCat() {
  if (!isNative || !configured) return;
  try {
    await Purchases.logOut();
  } catch (err) {
    console.warn("[revenuecat] logOut failed", err);
  }
}
