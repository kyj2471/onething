# OneThing 웹 프로젝트 — Claude Code 최종 프롬프트

너는 시니어 풀스택 엔지니어야. OneThing이라는 개인 목표 달성 앱의 웹 버전을 만든다.
Next.js 14 App Router + TypeScript + Supabase + Cloudflare Pages 기반으로 프로덕션급 웹앱을 빌드해.

**중요: 이 프로젝트는 독립 저장소(`onething-web`)야. 별도의 `onething-mobile` (React Native) 저장소가 있고, 두 프로젝트는 같은 Supabase 인스턴스를 공유하지만 코드는 완전 독립이야.**

---

# 1. 프로젝트 컨텍스트

**앱 이름:** OneThing
**한 줄 설명:** 딱 하나의 목표에만 집중하게 만드는 앱 (OKR 정통 방식)
**사업자:** 너드 스테이션 (Nerd Station) — 한국 개인사업자
**타겟:** 자기계발 목적의 개인 유저 (전 세계 + 한국)
**수익 모델:** 14일 무료 체험 → $4.99/월 또는 $34.99/년 (자동 결제, 카드 등록 필수)
**핵심 철학:** Goal은 항상 1개만 허용. OKR 정통 구조를 유지하되 용어만 친숙하게.

**OKR 용어 매핑 (절대 OKR 원어를 UI에 노출하지 마):**

| OKR 원어   | OneThing 용어 | 의미                               |
| ---------- | ------------- | ---------------------------------- |
| Objective  | **Goal**      | 이루고 싶은 것 (동시에 1개만)      |
| Key Result | **Target**    | 달성을 측정하는 정량적 수치 (필수) |
| Initiative | **Action**    | 매일 실행하는 행동                 |

---

# 2. 기술 스택

- **프레임워크:** Next.js 14 (App Router, not Pages Router)
- **언어:** TypeScript (strict mode)
- **스타일링:** Tailwind CSS + shadcn/ui
- **애니메이션:** Framer Motion
- **아이콘:** Lucide React
- **상태 관리:** Zustand (클라이언트) + TanStack Query (서버 상태)
- **폼:** React Hook Form + Zod
- **백엔드:** Supabase (@supabase/supabase-js, @supabase/ssr)
- **결제:** Lemon Squeezy JS SDK (@lemonsqueezy/lemonsqueezy.js)
- **이메일:** Resend (@resend/node + react-email)
- **분석:** Plausible (script tag만)
- **에러 트래킹:** Sentry
- **i18n:** next-intl (영어/한국어, 향후 확장 가능)
- **배포:** Cloudflare Pages (무제한 대역폭)
- **도메인:** Cloudflare Registrar

**❌ 쓰지 않는 것:**

- PWA (next-pwa) — 모바일은 React Native 별도 앱으로 제공
- 모노레포 (Turborepo 등) — 웹과 앱은 독립 저장소

---

# 3. 데이터 모델 (Supabase Schema) — 최적화 완료

아래 스키마를 `supabase/migrations/` 폴더에 SQL 파일로 생성해. 인덱스, RLS, 트리거 전부 포함.

```sql
-- ============================================================
-- 1. PROFILES (auth.users 확장)
-- ============================================================
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  display_name text,
  locale text DEFAULT 'en', -- 'en', 'ko' 등 i18n
  timezone text DEFAULT 'UTC',
  subscription_status text DEFAULT 'trial'
    CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired', 'free')),
  trial_ends_at timestamptz,
  lemon_squeezy_customer_id text,
  reminder_time time DEFAULT '09:00',
  theme text DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX idx_profiles_trial_ends_at ON profiles(trial_ends_at)
  WHERE subscription_status = 'trial';

-- ============================================================
-- 2. GOALS (OKR Objective — 유저당 active 1개 제약)
-- ============================================================
CREATE TABLE goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  status text DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'archived')),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- 핵심 제약: 유저당 active goal은 정확히 1개만 허용
CREATE UNIQUE INDEX one_active_goal_per_user
  ON goals(user_id)
  WHERE status = 'active';

-- 조회 최적화
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_user_status ON goals(user_id, status);

-- ============================================================
-- 3. TARGETS (OKR Key Result — 수치 필수)
-- ============================================================
CREATE TABLE targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  target_value numeric NOT NULL CHECK (target_value > 0),
  current_value numeric DEFAULT 0 CHECK (current_value >= 0),
  unit text, -- 선택: "명", "kg", "pages" 등
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 조회 최적화
CREATE INDEX idx_targets_goal_id ON targets(goal_id);
CREATE INDEX idx_targets_goal_order ON targets(goal_id, order_index);

-- ============================================================
-- 4. ACTIONS (OKR Initiative — 매일 실행)
-- ============================================================
CREATE TABLE actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id uuid REFERENCES targets(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  is_active boolean DEFAULT true, -- 비활성화 가능 (삭제 대신)
  created_at timestamptz DEFAULT now()
);

-- 조회 최적화
CREATE INDEX idx_actions_target_id ON actions(target_id);
CREATE INDEX idx_actions_active ON actions(target_id)
  WHERE is_active = true;

-- ============================================================
-- 5. ACTION_LOGS (매일 체크 기록 — 잔디/streak 데이터)
-- ============================================================
CREATE TABLE action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id uuid REFERENCES actions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  completed_date date NOT NULL,
  completed_at timestamptz DEFAULT now()
);

-- 중복 체크 방지 (같은 Action을 같은 날 2번 체크 불가)
CREATE UNIQUE INDEX idx_action_logs_unique
  ON action_logs(action_id, completed_date);

-- 잔디(히트맵) 쿼리 최적화 — 가장 빈번한 쿼리
CREATE INDEX idx_action_logs_user_date
  ON action_logs(user_id, completed_date DESC);

-- streak 계산 최적화
CREATE INDEX idx_action_logs_date_user
  ON action_logs(completed_date DESC, user_id);

-- ============================================================
-- 6. SUBSCRIPTIONS (Lemon Squeezy 동기화)
-- ============================================================
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  source text NOT NULL DEFAULT 'web'
    CHECK (source IN ('web', 'ios', 'android')),
  lemon_squeezy_subscription_id text UNIQUE,
  plan text CHECK (plan IN ('monthly', 'annual')),
  status text CHECK (status IN ('trialing', 'active', 'cancelled', 'expired', 'past_due')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(user_id, status);
CREATE INDEX idx_subscriptions_lemon ON subscriptions(lemon_squeezy_subscription_id);

-- ============================================================
-- 7. SUPPORT: 데이터 삭제 요청 추적 (GDPR 필수)
-- ============================================================
CREATE TABLE deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  email text NOT NULL,
  status text DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed')),
  requested_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- ============================================================
-- 8. 자동 업데이트 트리거 (updated_at)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER targets_updated_at
  BEFORE UPDATE ON targets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 9. 프로필 자동 생성 (가입 시)
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.email,
    now() + interval '14 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 10. ROW LEVEL SECURITY (모든 테이블)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;

-- profiles: 본인 것만
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- goals: 본인 것만
CREATE POLICY "Users can CRUD own goals"
  ON goals FOR ALL USING (auth.uid() = user_id);

-- targets: goal 소유자만
CREATE POLICY "Users can CRUD own targets"
  ON targets FOR ALL USING (
    goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid())
  );

-- actions: target → goal 소유자만
CREATE POLICY "Users can CRUD own actions"
  ON actions FOR ALL USING (
    target_id IN (
      SELECT t.id FROM targets t
      JOIN goals g ON t.goal_id = g.id
      WHERE g.user_id = auth.uid()
    )
  );

-- action_logs: 본인 것만
CREATE POLICY "Users can CRUD own action_logs"
  ON action_logs FOR ALL USING (auth.uid() = user_id);

-- subscriptions: 본인 것만 (읽기만, 쓰기는 서버)
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- deletion_requests: 본인 것만 (생성만)
CREATE POLICY "Users can create own deletion requests"
  ON deletion_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own deletion requests"
  ON deletion_requests FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- 11. 유용한 DB 함수 (Supabase RPC로 호출)
-- ============================================================

-- 잔디 데이터 조회 (최근 N일간 날짜별 완료율)
CREATE OR REPLACE FUNCTION get_heatmap_data(
  p_user_id uuid,
  p_days integer DEFAULT 365
)
RETURNS TABLE (
  completed_date date,
  completed_count bigint,
  total_actions bigint,
  completion_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH date_range AS (
    SELECT generate_series(
      current_date - (p_days - 1),
      current_date,
      '1 day'::interval
    )::date AS d
  ),
  daily_totals AS (
    SELECT COUNT(*) as total
    FROM actions a
    JOIN targets t ON a.target_id = t.id
    JOIN goals g ON t.goal_id = g.id
    WHERE g.user_id = p_user_id
      AND g.status = 'active'
      AND a.is_active = true
  ),
  daily_completions AS (
    SELECT
      al.completed_date AS d,
      COUNT(*) AS cnt
    FROM action_logs al
    WHERE al.user_id = p_user_id
      AND al.completed_date >= current_date - (p_days - 1)
    GROUP BY al.completed_date
  )
  SELECT
    dr.d,
    COALESCE(dc.cnt, 0),
    dt.total,
    CASE WHEN dt.total > 0
      THEN ROUND(COALESCE(dc.cnt, 0)::numeric / dt.total * 100, 1)
      ELSE 0
    END
  FROM date_range dr
  CROSS JOIN daily_totals dt
  LEFT JOIN daily_completions dc ON dr.d = dc.d
  ORDER BY dr.d;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- streak 계산
CREATE OR REPLACE FUNCTION get_streak(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  streak integer := 0;
  check_date date := current_date;
  has_log boolean;
BEGIN
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM action_logs
      WHERE user_id = p_user_id AND completed_date = check_date
    ) INTO has_log;

    IF NOT has_log THEN
      -- 오늘 아직 체크 안 했으면 어제부터 체크
      IF check_date = current_date THEN
        check_date := check_date - 1;
        CONTINUE;
      ELSE
        EXIT;
      END IF;
    END IF;

    streak := streak + 1;
    check_date := check_date - 1;
  END LOOP;

  RETURN streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Goal 전체 진행률 계산 (OKR 정통: Target % 평균)
CREATE OR REPLACE FUNCTION get_goal_progress(p_goal_id uuid)
RETURNS numeric AS $$
DECLARE
  avg_progress numeric;
BEGIN
  SELECT COALESCE(
    AVG(
      LEAST(
        CASE WHEN target_value > 0
          THEN (current_value / target_value) * 100
          ELSE 0
        END,
        100
      )
    ),
    0
  ) INTO avg_progress
  FROM targets
  WHERE goal_id = p_goal_id;

  RETURN ROUND(avg_progress, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

# 4. 진행률 계산 로직 (OKR 정통 방식)

- **Target 진행률:** `LEAST((current_value / target_value) * 100, 100)` — 최대 100%
- **Goal 전체 진행률:** 모든 Target 진행률의 **단순 평균** (Google OKR 방식)
- **Streak:** 연속으로 Action 하나라도 체크한 날 수 (오늘 포함 or 불포함 자동 처리)
- **잔디 강도 (Level 0~4):** 해당 일자의 Action 완료율 기반
  - Level 0: 0% (회색 `#F0F0EB`)
  - Level 1: 1~25% (연한 `#FEF9C3`)
  - Level 2: 26~50% (`#FDE68A`)
  - Level 3: 51~99% (`#E8FF5A`)
  - Level 4: 100% (`#A3E635`)

**Action 체크 ≠ Target 수치 자동 업데이트.** MVP에서는 유저가 Target 수치를 수동으로 업데이트. Action 체크는 Streak/잔디에만 반영.

---

# 5. 결제 시스템 (Lemon Squeezy — 한국 + 해외 통합)

## 5.1 왜 Lemon Squeezy 하나로 통합하는가

- Lemon Squeezy는 MoR(Merchant of Record)로 전 세계 세금(VAT/GST/소비세) 자동 처리
- 130+ 통화 지원, 한국 원화(KRW) 포함
- 유저는 자국 통화로 결제, 정산은 USD로 받음
- 한국 유저도 해외 유저도 동일한 결제 시스템으로 처리
- 별도의 한국 PG(포트원 등)를 연동할 필요 없음 (앱 인앱결제는 RevenueCat으로 별도 처리)

## 5.2 상품 구성

Lemon Squeezy에 등록할 상품:

| 상품                 | 가격      | Variant ID (환경변수)            |
| -------------------- | --------- | -------------------------------- |
| OneThing Pro Monthly | $4.99/월  | `NEXT_PUBLIC_LS_MONTHLY_VARIANT` |
| OneThing Pro Annual  | $34.99/년 | `NEXT_PUBLIC_LS_ANNUAL_VARIANT`  |

## 5.3 결제 플로우

```
유저 → Pricing 페이지 또는 Settings
  → "Start 14-day free trial" 클릭
  → Lemon Squeezy Checkout Overlay (JS SDK)
  → 카드 등록 + 14일 체험 시작
  → Lemon Squeezy → Webhook → /api/webhooks/lemon-squeezy
  → DB subscriptions 테이블 업데이트 (status: 'trialing')
  → 유저에게 welcome 이메일 (Resend)
```

## 5.4 Webhook 이벤트 처리

| Event                          | 처리                                                      |
| ------------------------------ | --------------------------------------------------------- |
| `subscription_created`         | subscriptions INSERT, profiles 업데이트                   |
| `subscription_updated`         | subscriptions UPDATE                                      |
| `subscription_cancelled`       | status → 'cancelled', cancel_at 기록                      |
| `subscription_expired`         | status → 'expired', profiles subscription_status 업데이트 |
| `subscription_payment_success` | current_period_end 갱신                                   |
| `subscription_payment_failed`  | 유저에게 결제 실패 이메일                                 |

**Webhook 서명 검증 필수.** Lemon Squeezy의 X-Signature 헤더 + HMAC SHA256으로 검증.

## 5.5 환불 정책 (코드에 반영)

- 결제 후 7일 이내: 무조건 전액 환불 (이유 불문)
- 7일 이후: 개발자 재량 (대부분 승인)
- 환불 처리: Lemon Squeezy 대시보드에서 원클릭
- 환불 시 수수료(5%)도 반환됨

---

# 6. 페이지 구조

## 6.1 퍼블릭 페이지 (비로그인)

| 경로       | 용도                     |
| ---------- | ------------------------ |
| `/`        | 랜딩페이지               |
| `/login`   | 로그인                   |
| `/signup`  | 가입                     |
| `/pricing` | 요금제 설명              |
| `/privacy` | 개인정보처리방침 (한/영) |
| `/terms`   | 이용약관 (한/영)         |
| `/refund`  | 환불 정책                |
| `/help`    | FAQ (10~15개)            |

## 6.2 앱 페이지 (로그인 필수)

| 경로            | 용도                       |
| --------------- | -------------------------- |
| `/app/today`    | Today 홈 (기본 리다이렉트) |
| `/app/goal`     | My Goal                    |
| `/app/progress` | Progress                   |
| `/app/settings` | Settings                   |

## 6.3 온보딩 (신규 유저)

| 경로                   | 용도                        |
| ---------------------- | --------------------------- |
| `/onboarding/welcome`  | 환영                        |
| `/onboarding/goal`     | Goal 입력                   |
| `/onboarding/targets`  | Target 3개 입력 (수치 필수) |
| `/onboarding/actions`  | 각 Target별 Action 입력     |
| `/onboarding/reminder` | 리마인더 시간 설정          |
| `/onboarding/trial`    | 카드 등록 + 14일 체험       |

---

# 7. 화면 상세 명세

## 7.1 Today 화면 (가장 중요)

레이아웃 (위→아래):

1. **헤더:** "OneThing" 로고 (serif italic) + 오늘 날짜 (mono)
2. **Goal 제목:** "MY GOAL" 라벨 + Goal 제목 (italic serif)
3. **원형 프로그레스:**
   - SVG, size 200, stroke 12
   - 중앙: % 숫자 (mono 큰 크기)
   - 색: #E8FF5A (progress), #F0F0EB (bg)
   - 감정 메시지:
     - 0~10%: "Every journey begins with one step"
     - 11~25%: "You're building momentum"
     - 26~50%: "Halfway there!"
     - 51~75%: "You can see the finish line"
     - 76~99%: "So close. Don't stop now."
     - 100%: "🎉 You did it!"
4. **Streak 뱃지:** 🔥 N day streak (warmGlow 배경)
5. **미니 잔디 (8주 × 7일):**
   - 완료율 기반 Level 0~4 색상
   - 오늘 칸 테두리 강조
   - 날짜 탭 → 해당 날짜 상세 모달
6. **Today's Actions 체크리스트:**
   - "Today's actions (3/5)" 카운터
   - 각 Action: 체크박스 + 제목 + 소속 Target 이름 (muted)
   - 체크 시 optimistic UI + 애니메이션
   - 모두 완료 시 "All done! 🌙" 메시지

## 7.2 My Goal 화면

- Goal 제목 + 전체 진행률 %
- Targets 리스트:
  - 제목, 진행률 바 + %
  - "Current: 32 / Target: 100 명" 형태
  - 수치 업데이트 버튼 (탭 → 모달)
  - 탭 → 하위 Actions 펼침
- "+ Add Target" 버튼
- "Complete Goal" 버튼 (100% 시만 활성)

## 7.3 Progress 화면

- 주간 바 차트 (최근 7일)
- 풀 연간 잔디 (365일, 가로 스크롤)
- 통계 카드 4개: Current streak / Best streak / Completion rate / vs Last week
- Goal 진행률 추이 선형 그래프 (주별)

## 7.4 Settings 화면

- 계정: 이메일, 로그아웃
- 알림: Daily reminder 시간
- 앱: 테마 (Light/Dark/System), 언어 (English/한국어)
- 구독 정보: 현재 플랜, 업그레이드/해지
- 데이터: Export (Pro), Delete account (GDPR)
- 법적: Privacy, Terms, Refund, Help
- 앱 버전

---

# 8. 디자인 토큰

```typescript
export const colors = {
  bg: "#FAFAF7",
  card: "#FFFFFF",
  accent: "#1a1a1a",
  accentSoft: "#2d2d2d",
  progress: "#E8FF5A",
  progressBg: "#F0F0EB",
  muted: "#999990",
  border: "#EDEDEA",
  check: "#4ADE80",
  checkBg: "#ECFDF5",
  warmGlow: "#FFF8E1",
  danger: "#EF4444",
  dangerBg: "#FEF2F2",
} as const;

export const fonts = {
  display: "'Georgia', 'Times New Roman', serif",
  body: "'Helvetica Neue', 'Segoe UI', sans-serif",
  mono: "'SF Mono', 'Fira Code', monospace",
} as const;

// 잔디 색상 (Level 0~4)
export const heatmapColors = [
  "#F0F0EB", // Level 0: 0%
  "#FEF9C3", // Level 1: 1~25%
  "#FDE68A", // Level 2: 26~50%
  "#E8FF5A", // Level 3: 51~99%
  "#A3E635", // Level 4: 100%
] as const;
```

---

# 9. 국제화 (i18n — next-intl)

**지원 언어:** 영어 (기본), 한국어
**구현:** next-intl 사용
**라우팅:** `/en/app/today`, `/ko/app/today` 형태
**브라우저 언어 감지:** 첫 접속 시 자동 감지 → 해당 언어로 리다이렉트
**수동 전환:** Settings에서 변경 가능

**번역 파일 구조:**

```
messages/
├── en.json
└── ko.json
```

**번역 키 규칙:**

```json
{
  "common": {
    "goal": "Goal",
    "target": "Target",
    "action": "Action"
  },
  "today": {
    "title": "Today",
    "streak": "{count} day streak",
    "allDone": "All done! 🌙"
  },
  "progress": {
    "messages": {
      "0_10": "Every journey begins with one step",
      "11_25": "You're building momentum"
    }
  }
}
```

**법적 문서도 i18n 적용:**

- Privacy Policy: 한/영 각각 작성
- Terms of Service: 한/영 각각 작성

---

# 10. 법적 문서 (전문가 수준, 전부 작성해)

## 10.1 개인정보처리방침 (Privacy Policy)

**준수해야 할 법률:**

- 한국: 개인정보 보호법 (PIPA) — 제30조에 의거 필수 공개
- EU: GDPR — 유럽 유저 대상 필수
- 미국: CCPA/CPRA — 캘리포니아 유저
- 기타: 각국 법률에 대한 일반적 준수 선언

**필수 포함 내용:**

1. 수집하는 개인정보 항목: 이메일, 결제 정보 (Lemon Squeezy 처리), 서비스 이용 기록 (action_logs), 기기 정보 (브라우저, OS)
2. 수집 목적: 서비스 제공, 결제 처리, 고객지원, 서비스 개선
3. 보유 기간: 계정 유지 기간 + 삭제 요청 후 30일 이내 파기
4. 제3자 제공: Supabase (DB 호스팅, 미국/싱가포르), Lemon Squeezy (결제, 미국), Resend (이메일, 미국), Plausible (분석, EU), Sentry (에러 트래킹, 미국)
5. 국외 이전: 위 서비스 제공자의 서버 위치 명시
6. 유저 권리: 열람, 정정, 삭제, 처리 정지, 동의 철회
7. 14세 미만 아동: 이용 불가, 가입 시 확인 체크박스
8. 쿠키: Plausible는 쿠키 없는 분석, 기타 필수 쿠키만 사용
9. 개인정보 보호책임자: 이메일 (support@onething.app)
10. 변경 고지: 변경 시 앱 내 + 이메일 고지

## 10.2 이용약관 (Terms of Service)

**필수 포함 내용:**

1. 서비스 설명: OneThing은 OKR 기반 개인 목표 달성 웹/앱 서비스
2. 이용 자격: 14세 이상
3. 계정: 1인 1계정, 계정 보안은 유저 책임
4. 구독 및 결제:
   - 14일 무료 체험 (카드 등록 필수)
   - 체험 종료 시 자동 결제 전환 (체험 종료 24시간 전 이메일 알림)
   - 해지는 Settings에서 언제든 가능
   - 해지 후 현재 결제 기간 동안 계속 사용 가능
5. 환불: 결제 후 7일 이내 전액 환불 (이유 불문), 이후는 회사 재량
6. 금지 행위: 불법 목적 사용, 역공학, 자동화된 데이터 수집
7. 지적재산권: 서비스 콘텐츠는 Nerd Station 소유, 유저 데이터는 유저 소유
8. 서비스 중단/변경: 사전 고지 후 변경 가능
9. 면책: "있는 그대로" 제공, 데이터 손실에 대한 제한적 책임
10. 준거법: 대한민국법, 서울중앙지방법원 관할
11. 분쟁 해결: 먼저 이메일로 해결 시도, 불가 시 소송

## 10.3 환불 정책 (Refund Policy)

```
명확하고 짧게 작성. 영어/한국어 각각:

- 7일 이내: 무조건 전액 환불, 이유 불문
- 방법: support@onething.app 으로 이메일
- 처리: 24시간 이내 환불, 카드 반영 3~5영업일
- 앱스토어 결제: Apple/Google 직접 처리 (링크 안내)
- 연간 플랜 해지: 남은 기간 사용 가능, 일할 환불 X
```

## 10.4 Cookie Policy

Plausible는 쿠키 없는 분석 도구라 실제로 쿠키를 거의 안 써. 하지만 EU 규정상 최소한의 쿠키 고지는 필요:

- 필수 쿠키: 인증 세션 (Supabase Auth)
- 분석 쿠키: 없음 (Plausible는 쿠키 미사용)
- 광고 쿠키: 없음

---

# 11. 고객지원 시스템

## 11.1 지원 채널

- **메인:** support@onething.app (Cloudflare Email Routing → Gmail 포워딩)
- **채팅 (v1.1):** Crisp 무료 티어
- **FAQ:** /help 페이지 (10~15개 질문)

## 11.2 자동 이메일 (Resend + react-email)

| 이벤트    | 이메일 제목                                |
| --------- | ------------------------------------------ |
| 가입 완료 | "Welcome to OneThing 🌱"                   |
| 체험 D-4  | "4 days left in your trial"                |
| 체험 D-2  | "2 days left"                              |
| 체험 D-1  | "Tomorrow we'll charge your card"          |
| 결제 성공 | "You're now OneThing Pro!"                 |
| 결제 실패 | "Payment failed — please update your card" |
| 환불 완료 | "Your refund has been processed"           |
| 계정 삭제 | "Your account has been deleted"            |

## 11.3 FAQ 페이지 필수 항목

1. How do I cancel my subscription?
2. Can I get a refund?
3. Why can I only have one Goal?
4. How do I update my Target numbers?
5. What happens when I complete my Goal?
6. How is my progress calculated?
7. Does OneThing work offline?
8. Can I use it on multiple devices?
9. How do I delete my account and data?
10. Is my data private?

---

# 12. 파일 구조

```
onething-web/
├── app/
│   ├── [locale]/              # next-intl 라우팅
│   │   ├── (public)/
│   │   │   ├── page.tsx       # 랜딩
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── pricing/
│   │   │   ├── privacy/
│   │   │   ├── terms/
│   │   │   ├── refund/
│   │   │   └── help/
│   │   ├── (app)/
│   │   │   ├── layout.tsx     # 인증 체크 + 탭 네비게이션
│   │   │   ├── today/page.tsx
│   │   │   ├── goal/page.tsx
│   │   │   ├── progress/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── onboarding/
│   │       ├── layout.tsx
│   │       ├── welcome/
│   │       ├── goal/
│   │       ├── targets/
│   │       ├── actions/
│   │       ├── reminder/
│   │       └── trial/
│   ├── api/
│   │   ├── webhooks/
│   │   │   └── lemon-squeezy/route.ts
│   │   ├── cron/
│   │   │   └── trial-reminder/route.ts
│   │   └── export/
│   │       └── csv/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                    # shadcn/ui
│   ├── goal/
│   │   ├── CircleProgress.tsx
│   │   ├── Heatmap.tsx
│   │   ├── MiniHeatmap.tsx
│   │   ├── ActionChecklist.tsx
│   │   ├── TargetCard.tsx
│   │   ├── WeeklyBarChart.tsx
│   │   └── ProgressLineChart.tsx
│   ├── layout/
│   │   ├── TabBar.tsx
│   │   ├── Header.tsx
│   │   └── CookieBanner.tsx
│   └── shared/
│       ├── StreakBadge.tsx
│       └── EmotionalMessage.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # 브라우저용
│   │   ├── server.ts          # 서버용
│   │   ├── middleware.ts      # 인증 미들웨어
│   │   └── types.ts           # 자동 생성
│   ├── lemon-squeezy.ts
│   ├── resend.ts
│   ├── calculations.ts       # 진행률, streak 계산 유틸
│   └── utils.ts
├── hooks/
│   ├── useGoal.ts
│   ├── useTargets.ts
│   ├── useActions.ts
│   ├── useStreak.ts
│   ├── useHeatmap.ts
│   └── useSubscription.ts
├── store/
│   └── appStore.ts            # Zustand
├── messages/
│   ├── en.json
│   └── ko.json
├── emails/                    # react-email 템플릿
│   ├── WelcomeEmail.tsx
│   ├── TrialReminderEmail.tsx
│   ├── PaymentSuccessEmail.tsx
│   └── RefundEmail.tsx
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/
│   └── icons/
├── middleware.ts              # next-intl + Supabase Auth
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

# 13. 환경변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Lemon Squeezy
LEMON_SQUEEZY_API_KEY=
LEMON_SQUEEZY_STORE_ID=
LEMON_SQUEEZY_WEBHOOK_SECRET=
NEXT_PUBLIC_LS_MONTHLY_VARIANT=
NEXT_PUBLIC_LS_ANNUAL_VARIANT=

# Resend
RESEND_API_KEY=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=

# Plausible
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=

# App
NEXT_PUBLIC_APP_URL=https://onething.app
NEXT_PUBLIC_SUPPORT_EMAIL=support@onething.app
```

---

# 14. 단계별 실행 지시

순서대로 진행해. 각 단계 완료 후 보고하고 다음으로 가.

**Phase 1: 프로젝트 셋업**

1. Next.js 14 프로젝트 초기화 (TypeScript, Tailwind, App Router, ESLint)
2. 필수 패키지 설치
3. Tailwind config + 디자인 토큰
4. 폴더 구조 생성
5. next-intl 초기 설정 (en/ko)

**Phase 2: Supabase 백엔드** 6. Supabase 클라이언트 (client, server, middleware) 7. Migration SQL (위 스키마 전체 + RLS + 함수 + 트리거) 8. TypeScript 타입 생성 9. 인증 미들웨어 (/app/\* 보호)

**Phase 3: 인증 + 온보딩** 10. 로그인/가입 (이메일 + Google OAuth) 11. 온보딩 6단계 12. 14세 확인, Privacy/ToS 동의

**Phase 4: 메인 화면** 13. 공통 레이아웃 + 하단 탭 14. Today 화면 (원형 프로그레스, 미니 잔디, 체크리스트, 감정 메시지) 15. My Goal 화면 (Targets, 수치 업데이트) 16. Progress 화면 (풀 잔디, 통계, 선형 그래프) 17. Settings 화면

**Phase 5: 결제 (Lemon Squeezy)** 18. Lemon Squeezy 체크아웃 연동 19. Webhook 엔드포인트 + 서명 검증 20. 구독 상태 동기화

**Phase 6: 이메일 시스템** 21. react-email 템플릿 작성 (환영, 체험 알림, 결제, 환불) 22. Resend 연동 23. 체험 만료 cron 작업

**Phase 7: 법적 문서** 24. Privacy Policy 페이지 (한/영, PIPA + GDPR + CCPA) 25. Terms of Service 페이지 (한/영) 26. Refund Policy 페이지 27. Cookie 배너

**Phase 8: FAQ + 고객지원** 28. /help FAQ 페이지 29. Contact support 이메일 링크 30. 데이터 삭제 기능 (Settings, GDPR 준수)

**Phase 9: 분석 + 최적화** 31. Plausible 스크립트 32. Sentry 연동 33. 주요 이벤트 트래킹 (signup, trial_start, subscribe, cancel)

**Phase 10: 랜딩페이지 + 배포** 34. 랜딩페이지 (SEO 최적화, OG 태그) 35. Cloudflare Pages 배포 설정 36. 도메인 연결

---

# 15. 코드 원칙

- **TypeScript strict. `any` 금지.** 모든 타입 명시.
- **Server Components 우선.** `'use client'`는 인터랙션 필요할 때만.
- **RLS 신뢰.** 클라이언트 쿼리 OK, 민감한 것만 API Route.
- **Optimistic UI.** 체크박스 등 즉시 반영 + 서버 싱크.
- **에러 처리.** 모든 Supabase/API 호출에 try-catch + 유저 피드백.
- **접근성.** ARIA labels, keyboard navigation.
- **모바일 퍼스트.** 작은 화면 먼저, 큰 화면 확장.
- **보안.** service_role key는 서버에서만. .env에 NEXT_PUBLIC 안 붙임.
- **성능.** 이미지는 next/image, 폰트는 next/font, 불필요한 리렌더링 방지.

---

# 지금 시작

Phase 1부터 시작해. 프로젝트 초기화, 패키지 설치, 폴더 구조 생성, 디자인 토큰 + Tailwind + next-intl 기본 설정까지 하고 보고해.
