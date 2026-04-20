# OneThing 모바일 앱 (React Native) — Claude Code 최종 프롬프트

너는 시니어 React Native 엔지니어야. OneThing이라는 개인 목표 달성 앱의 iOS + Android 앱을 만든다.
React Native + Expo + TypeScript + Supabase 기반으로 프로덕션급 모바일 앱을 빌드해.

**중요: 이 프로젝트는 독립 저장소(`onething-mobile`)야. 별도의 `onething-web` (Next.js) 저장소가 있고, 두 프로젝트는 같은 Supabase 인스턴스를 공유하지만 코드는 완전 독립이야. DB 스키마/RLS는 웹 프로젝트에서 이미 생성되어 있어.**

---

# 1. 프로젝트 컨텍스트

**앱 이름:** OneThing
**한 줄 설명:** 딱 하나의 목표에만 집중하게 만드는 앱 (OKR 정통 방식)
**사업자:** 너드 스테이션 (Nerd Station)
**번들 ID:** `com.nerdstation.onething`
**타겟:** 자기계발 목적의 개인 유저 (전 세계 + 한국)
**수익 모델:**

- iOS/Android: RevenueCat 인앱결제 ($4.99/월 또는 $34.99/년)
- Apple Small Business Program 적용 → 15% 수수료
- Google Play 구독 → 15% 수수료
  **핵심 철학:** Goal은 항상 1개만 허용. OKR 정통 구조.

**OKR 용어 (웹과 동일):**

- Objective → **Goal** (동시 1개)
- Key Result → **Target** (수치 필수)
- Initiative → **Action** (매일 실행)

---

# 2. 기술 스택

- **프레임워크:** React Native + Expo SDK 52+ (관리형)
- **라우팅:** Expo Router v4 (file-based)
- **언어:** TypeScript (strict)
- **스타일링:** NativeWind v4 (Tailwind for RN)
- **애니메이션:** React Native Reanimated 3 + Moti
- **아이콘:** Lucide React Native
- **상태 관리:** Zustand + TanStack Query
- **폼:** React Hook Form + Zod
- **백엔드:** Supabase (@supabase/supabase-js)
- **인앱결제:** RevenueCat (react-native-purchases)
- **푸시 알림:** Expo Notifications
- **i18n:** expo-localization + i18next
- **저장소:** expo-secure-store (민감), @react-native-async-storage (일반)
- **차트:** Victory Native 또는 react-native-skia
- **WebView:** react-native-webview (법적 페이지만)
- **빌드:** EAS Build + EAS Submit
- **햅틱:** Expo Haptics

**WebView 사용 범위 (최소한):**

- ✅ Privacy Policy, Terms of Service, Refund Policy (onething.app URL 로드)
- ✅ Help/FAQ 페이지 (onething.app/help)
- ❌ 결제: 반드시 RevenueCat 네이티브 → WebView 결제 절대 X
- ❌ 주요 화면: 전부 네이티브

---

# 3. Supabase 연결

**웹 프로젝트에서 이미 생성된 테이블/RLS를 그대로 공유.** 앱에서는 연결만 설정.

```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
```

**공유하는 DB 테이블:** profiles, goals, targets, actions, action_logs, subscriptions, deletion_requests
**공유하는 RPC 함수:** get_heatmap_data(), get_streak(), get_goal_progress()

---

# 4. 진행률 계산 (웹과 동일)

- Target %: `Math.min((current_value / target_value) * 100, 100)`
- Goal %: 모든 Target %의 단순 평균
- Streak: Supabase RPC `get_streak()` 호출
- 잔디: Supabase RPC `get_heatmap_data()` 호출 → Level 0~4 매핑

---

# 5. 인앱결제 (RevenueCat)

## 5.1 설정

1. RevenueCat 계정 → 프로젝트 생성
2. iOS: App Store Connect에 구독 상품 등록
   - `onething_monthly`: $4.99/월
   - `onething_annual`: $34.99/년
3. Android: Google Play Console에 동일 상품 등록
4. RevenueCat Entitlement: `pro`
5. Apple Small Business Program 신청 (15% 수수료)

## 5.2 구현

```typescript
// lib/revenuecat.ts
import Purchases from "react-native-purchases";
import { Platform } from "react-native";

export async function initRevenueCat(userId: string) {
  await Purchases.configure({
    apiKey:
      Platform.OS === "ios"
        ? process.env.EXPO_PUBLIC_RC_IOS_KEY!
        : process.env.EXPO_PUBLIC_RC_ANDROID_KEY!,
    appUserID: userId,
  });
}

export async function checkProStatus(): Promise<boolean> {
  const info = await Purchases.getCustomerInfo();
  return info.entitlements.active.pro !== undefined;
}

export async function purchasePackage(pkg: any) {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo.entitlements.active.pro !== undefined;
}

export async function restorePurchases() {
  const info = await Purchases.restorePurchases();
  return info.entitlements.active.pro !== undefined;
}
```

## 5.3 웹 ↔ 앱 구독 동기화

**웹에서 Lemon Squeezy로 결제한 유저가 앱에서 로그인할 때:**

1. Supabase `subscriptions` 테이블 조회
2. `source = 'web'` + `status = 'active'` → Pro 권한 부여
3. RevenueCat에는 attribute로 기록만

**앱에서 RevenueCat으로 결제한 유저:**

1. RevenueCat webhook → Supabase Edge Function → `subscriptions` INSERT
2. `source = 'ios'` or `source = 'android'`
3. 웹에서도 Pro 인식됨

---

# 6. 화면 구조 (Expo Router)

```
app/
├── (auth)/
│   ├── _layout.tsx
│   ├── welcome.tsx
│   ├── login.tsx
│   └── signup.tsx
├── (onboarding)/
│   ├── _layout.tsx
│   ├── goal.tsx
│   ├── targets.tsx
│   ├── actions.tsx
│   ├── reminder.tsx
│   └── trial.tsx           # RevenueCat Paywall
├── (tabs)/
│   ├── _layout.tsx         # 하단 탭 네비게이션
│   ├── today.tsx
│   ├── goal.tsx
│   ├── progress.tsx
│   └── settings.tsx
├── modals/
│   ├── add-target.tsx
│   ├── add-action.tsx
│   ├── update-value.tsx
│   ├── complete-goal.tsx
│   ├── day-detail.tsx      # 잔디 날짜 탭 상세
│   ├── privacy.tsx         # WebView
│   ├── terms.tsx           # WebView
│   └── refund.tsx          # WebView
├── _layout.tsx             # 루트 (인증, 테마, RevenueCat 초기화)
└── +not-found.tsx
```

---

# 7. 화면 명세 (네이티브 구현)

## 7.1 Today (모든 인터랙션에 Haptics)

- **원형 프로그레스:** react-native-skia 또는 react-native-svg + Reanimated
  - 값 변경 시 `withTiming` 애니메이션
- **잔디 (8주 미니):** Flex grid, 각 셀 Pressable → 모달
- **Action 체크리스트:** FlatList, 각 항목:
  - 체크 시 `Haptics.selectionAsync()` + Moti 체크 애니메이션
  - Optimistic UI
  - 전체 완료 시 `Haptics.notificationAsync(Success)` + confetti

## 7.2 My Goal

- Targets: FlatList, Accordion 펼침 (Reanimated layout animation)
- 수치 업데이트: 모달 (NumberInput + 키패드)

## 7.3 Progress

- 주간 바 차트: Victory Native 또는 커스텀
- 연간 잔디: ScrollView 가로 스크롤, Skia 렌더링 (성능)
- 통계 카드: 2x2 그리드

## 7.4 Settings

- 프로필, 알림, 테마, 언어
- 구독: RevenueCat UI
  - Paywall 화면 (RevenueCat UI 또는 커스텀)
  - "Restore Purchases" 버튼 (Apple 필수)
- 법적: WebView 모달
- Delete account: Alert 2번 확인 → GDPR 삭제

---

# 8. 네이티브 기능

## 8.1 푸시 알림

```typescript
// 로컬 알림 스케줄링 (매일 유저 설정 시간)
import * as Notifications from "expo-notifications";

await Notifications.scheduleNotificationAsync({
  content: {
    title: "Time for your Goal",
    body: "Check in on your daily actions",
    sound: true,
  },
  trigger: {
    type: "daily",
    hour: userReminderHour,
    minute: 0,
  },
});
```

## 8.2 햅틱

| 인터랙션     | 피드백                       |
| ------------ | ---------------------------- |
| Action 체크  | `selectionAsync()`           |
| Goal 완료    | `notificationAsync(Success)` |
| 에러         | `notificationAsync(Error)`   |
| 잔디 날짜 탭 | `impactAsync(Light)`         |

## 8.3 딥링크

- `onething://` 커스텀 스킴
- `https://onething.app/*` Universal/App Link
- 결제 완료 후 앱 복귀

---

# 9. 국제화 (i18n)

- expo-localization으로 기기 언어 감지
- i18next + react-i18next
- 영어 (기본) / 한국어
- Settings에서 수동 전환

---

# 10. 디자인 토큰

웹과 동일한 색상/폰트 체계. NativeWind config에 반영:

```javascript
// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#FAFAF7",
        card: "#FFFFFF",
        accent: "#1a1a1a",
        progress: "#E8FF5A",
        progressBg: "#F0F0EB",
        muted: "#999990",
        border: "#EDEDEA",
        check: "#4ADE80",
        warmGlow: "#FFF8E1",
        danger: "#EF4444",
      },
    },
  },
};
```

---

# 11. 파일 구조

```
onething-mobile/
├── app/                     # Expo Router
│   ├── (auth)/
│   ├── (onboarding)/
│   ├── (tabs)/
│   ├── modals/
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── goal/
│   │   ├── CircleProgress.tsx
│   │   ├── Heatmap.tsx
│   │   ├── MiniHeatmap.tsx
│   │   ├── ActionCheckbox.tsx
│   │   ├── TargetCard.tsx
│   │   └── WeeklyChart.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── WebViewModal.tsx
│   └── shared/
│       ├── StreakBadge.tsx
│       └── EmotionalMessage.tsx
├── lib/
│   ├── supabase.ts
│   ├── revenuecat.ts
│   ├── notifications.ts
│   ├── calculations.ts
│   └── utils.ts
├── hooks/
│   ├── useGoal.ts
│   ├── useTargets.ts
│   ├── useActions.ts
│   ├── useStreak.ts
│   ├── useHeatmap.ts
│   └── useSubscription.ts
├── store/
│   └── appStore.ts
├── i18n/
│   ├── en.json
│   ├── ko.json
│   └── index.ts
├── constants/
│   ├── colors.ts
│   └── config.ts
├── assets/
│   ├── fonts/
│   ├── images/
│   └── icon.png
├── app.json
├── eas.json
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

# 12. 환경변수

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_RC_IOS_KEY=
EXPO_PUBLIC_RC_ANDROID_KEY=
EXPO_PUBLIC_APP_URL=https://onething.app
```

---

# 13. app.json

```json
{
  "expo": {
    "name": "OneThing",
    "slug": "onething",
    "scheme": "onething",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "ios": {
      "bundleIdentifier": "com.nerdstation.onething",
      "supportsTablet": true,
      "associatedDomains": ["applinks:onething.app"],
      "infoPlist": {
        "NSUserTrackingUsageDescription": "This is used to provide a better experience."
      }
    },
    "android": {
      "package": "com.nerdstation.onething",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FAFAF7"
      },
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": { "scheme": "https", "host": "onething.app" },
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "plugins": [
      "expo-router",
      "expo-notifications",
      "expo-localization",
      "expo-haptics",
      "expo-secure-store"
    ]
  }
}
```

---

# 14. 단계별 실행

**Phase 1: 프로젝트 셋업**

1. `npx create-expo-app@latest onething-mobile` (TypeScript, Expo Router)
2. 패키지 설치 (NativeWind, Reanimated, Supabase, RevenueCat, Zustand, TanStack Query, RHF, Zod, Lucide RN, Moti, Expo Notifications/Haptics/SecureStore, i18next)
3. NativeWind + tailwind.config.js
4. app.json 설정
5. 폴더 구조

**Phase 2: 기반** 6. Supabase 클라이언트 (SecureStore 어댑터) 7. RevenueCat 초기화 8. Zustand 스토어 9. i18n 설정 (en/ko) 10. 테마/색상 상수

**Phase 3: 인증 + 온보딩** 11. Welcome/Login/Signup (Google/Apple OAuth via Expo AuthSession) 12. 온보딩 5단계 (goal → targets → actions → reminder → trial) 13. RevenueCat Paywall (체험 시작)

**Phase 4: 메인 화면** 14. 탭 레이아웃 (하단 4탭) 15. Today 화면 (원형 프로그레스, 잔디, 체크리스트, 감정 메시지, 햅틱) 16. My Goal (Targets, 수치 업데이트 모달) 17. Progress (주간 차트, 연간 잔디, 통계) 18. Settings

**Phase 5: 인앱결제** 19. RevenueCat 상품 조회 + 구매 플로우 20. Restore Purchases 21. 웹 구독 동기화 (Supabase 조회) 22. Pro 상태에 따른 기능 잠금/해제

**Phase 6: 네이티브 기능** 23. 푸시 알림 권한 + 로컬 스케줄링 24. 햅틱 피드백 25. 딥링크

**Phase 7: 법적 (WebView)** 26. Privacy/Terms/Refund WebView 모달 (onething.app URL) 27. Delete Account 기능

**Phase 8: 빌드 + 배포** 28. EAS Build 설정 29. TestFlight / Internal Testing 30. 스토어 메타데이터 (스크린샷, 설명) 31. 앱 심사 제출

---

# 15. 코드 원칙

- **Expo Router file-based routing** 100% 사용
- **Expo SDK 우선** (react-native- 패키지 최소)
- **TypeScript strict, any 금지**
- **FlatList** 리스트 렌더링 (ScrollView에 map 금지)
- **Reanimated 3** UI 스레드 애니메이션
- **WebView 최소** 법적 페이지만
- **에러 처리** 모든 비동기에 try-catch + Alert
- **접근성** accessibilityLabel, accessibilityRole

---

# 주의사항

**웹 프로젝트(`onething-web`)가 먼저 완성되어 Supabase 스키마가 존재해야 함.** 웹 프로젝트 미완성 시, 이 프로젝트에서는 Supabase 연결 테스트까지만 진행하고 화면 구현부터 시작.

# 지금 시작

Phase 1부터. Expo 프로젝트 초기화, 패키지 설치, NativeWind 설정까지 하고 보고해.
