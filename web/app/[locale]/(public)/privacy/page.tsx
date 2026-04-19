import { setRequestLocale } from "next-intl/server";
import { LegalPageShell } from "@/components/layout/LegalPageShell";
import { Section, Bullets } from "@/components/layout/LegalBlocks";

const LAST_UPDATED = "2026-04-19";

export default function PrivacyPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const ko = params.locale === "ko";

  return (
    <LegalPageShell
      locale={params.locale}
      title={ko ? "개인정보처리방침" : "Privacy Policy"}
      lastUpdated={LAST_UPDATED}
    >
      <p>
        {ko
          ? "너드 스테이션(이하 \"회사\")은 OneThing 서비스(이하 \"서비스\")를 운영하며, 이용자의 개인정보를 중요시하고 개인정보 보호법, GDPR, CCPA 등 관련 법령을 준수합니다."
          : "Nerd Station (\"we\", \"us\") operates the OneThing service (\"Service\"). We respect your privacy and comply with applicable laws including Korea's PIPA, the EU GDPR, and California's CCPA/CPRA."}
      </p>

      <Section heading={ko ? "1. 수집하는 개인정보 항목" : "1. Information we collect"}>
        <Bullets
          items={
            ko
              ? [
                  "계정: 이메일 주소, 암호화된 비밀번호, 표시 이름(선택)",
                  "결제: Lemon Squeezy를 통해 처리되며 회사는 카드번호를 저장하지 않습니다. 결제 메타데이터(구독 상태, 플랜)만 수신",
                  "서비스 이용 기록: 목표(Goal), 지표(Target), 행동(Action), 일일 체크 로그",
                  "기기 정보: 브라우저 종류, OS, 언어, 타임존 (로그 및 오류 분석 목적)",
                ]
              : [
                  "Account: email address, hashed password, display name (optional)",
                  "Payment: processed by Lemon Squeezy — we never store card numbers. We receive subscription metadata (status, plan) only",
                  "Service activity: your Goal, Targets, Actions, and daily check-in logs",
                  "Device info: browser, OS, language, timezone (for logs and error analysis)",
                ]
          }
        />
      </Section>

      <Section heading={ko ? "2. 수집 목적" : "2. How we use information"}>
        <Bullets
          items={
            ko
              ? [
                  "서비스 제공 및 계정 운영",
                  "결제 처리 및 구독 상태 관리",
                  "고객 지원 및 문의 응대",
                  "서비스 품질 개선 및 오류 추적",
                  "법적 의무 준수",
                ]
              : [
                  "Providing the Service and operating your account",
                  "Processing payments and managing subscription status",
                  "Responding to support requests",
                  "Improving quality and debugging",
                  "Complying with legal obligations",
                ]
          }
        />
      </Section>

      <Section heading={ko ? "3. 보유 및 이용 기간" : "3. Retention"}>
        <p>
          {ko
            ? "회사는 이용자가 계정을 유지하는 동안 개인정보를 보유합니다. 계정 삭제 요청이 접수되면 30일 이내에 모든 데이터를 파기합니다. 단, 관련 법령이 보존을 요구하는 경우(전자상거래법 등)에는 해당 기간 동안 분리 보관 후 파기합니다."
            : "We retain your data while your account is active. After a deletion request, we delete all data within 30 days, except where law requires longer retention (e.g. tax/payment records)."}
        </p>
      </Section>

      <Section heading={ko ? "4. 제3자 제공 및 처리 위탁" : "4. Sub-processors"}>
        <p>
          {ko
            ? "서비스 운영을 위해 다음 업체에 개인정보 처리를 위탁하며, 각 업체는 자체 개인정보처리방침을 따릅니다."
            : "We share data with the following sub-processors to run the Service. Each operates under its own privacy policy."}
        </p>
        <Bullets
          items={[
            "Supabase (DB hosting, US/Singapore)",
            "Lemon Squeezy (payment, US — Merchant of Record)",
            "Resend (transactional email, US)",
            "Plausible (analytics, EU — cookieless)",
            "Sentry (error tracking, US)",
            "Cloudflare (CDN/hosting, global)",
          ]}
        />
      </Section>

      <Section heading={ko ? "5. 국외 이전" : "5. International transfers"}>
        <p>
          {ko
            ? "위 업체의 서버가 미국, EU, 싱가포르 등에 위치함에 따라 개인정보가 국외로 이전됩니다. 이용자는 회원가입 시 본 방침에 동의함으로써 국외 이전에 동의한 것으로 간주됩니다."
            : "Because the sub-processors above operate servers in the US, EU, and Singapore, your data may be transferred internationally. By signing up, you consent to such transfers."}
        </p>
      </Section>

      <Section heading={ko ? "6. 이용자의 권리" : "6. Your rights"}>
        <Bullets
          items={
            ko
              ? [
                  "개인정보 열람 요청",
                  "정정 및 삭제 요청",
                  "처리 정지 요청",
                  "동의 철회 및 계정 해지",
                  "GDPR에 따른 이동권 (기계 가독 형식 내보내기)",
                ]
              : [
                  "Access your data",
                  "Correct or delete your data",
                  "Restrict processing",
                  "Withdraw consent and close your account",
                  "GDPR data portability (export in machine-readable form)",
                ]
          }
        />
        <p>
          {ko
            ? "위 권리는 설정 페이지 또는 support@onething.app 이메일로 행사할 수 있습니다."
            : "Exercise these rights via Settings or email support@onething.app."}
        </p>
      </Section>

      <Section heading={ko ? "7. 14세 미만 아동" : "7. Users under 14"}>
        <p>
          {ko
            ? "본 서비스는 만 14세 이상만 이용할 수 있으며, 가입 시 연령 확인 체크를 요구합니다. 14세 미만의 개인정보를 알게 된 경우 즉시 삭제합니다."
            : "The Service is only for users aged 14 and older. We ask for age confirmation at sign-up and promptly delete any data we learn belongs to a child under 14."}
        </p>
      </Section>

      <Section heading={ko ? "8. 쿠키" : "8. Cookies"}>
        <p>
          {ko
            ? "인증 세션 유지를 위한 필수 쿠키만 사용합니다. Plausible은 쿠키 없는 분석 도구로, 광고/추적 쿠키는 사용하지 않습니다."
            : "We use only essential cookies to keep you signed in. Plausible is cookieless; we do not use advertising or tracking cookies."}
        </p>
      </Section>

      <Section heading={ko ? "9. 개인정보 보호책임자" : "9. Data protection contact"}>
        <p>support@onething.app</p>
      </Section>

      <Section heading={ko ? "10. 방침 변경" : "10. Changes to this policy"}>
        <p>
          {ko
            ? "방침이 변경되는 경우 앱 내 공지 및 이메일로 고지합니다. 중대한 변경은 시행일 최소 7일 전 고지합니다."
            : "If this policy changes, we will notify you in-app and by email. Material changes are announced at least 7 days before taking effect."}
        </p>
      </Section>
    </LegalPageShell>
  );
}
