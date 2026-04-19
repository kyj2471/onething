import { setRequestLocale } from "next-intl/server";
import { LegalPageShell } from "@/components/layout/LegalPageShell";
import { Section, Bullets } from "@/components/layout/LegalBlocks";

const LAST_UPDATED = "2026-04-19";

export default function RefundPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const ko = params.locale === "ko";

  return (
    <LegalPageShell
      locale={params.locale}
      title={ko ? "환불 정책" : "Refund Policy"}
      lastUpdated={LAST_UPDATED}
    >
      <Section heading={ko ? "7일 무조건 환불" : "7-day no-questions-asked refund"}>
        <p>
          {ko
            ? "결제 후 7일 이내에 환불을 요청하면 이유를 불문하고 전액 환불해 드립니다."
            : "Request a refund within 7 days of payment and we will refund you in full — no questions asked."}
        </p>
      </Section>

      <Section heading={ko ? "환불 요청 방법" : "How to request"}>
        <Bullets
          items={
            ko
              ? [
                  "support@onething.app 으로 환불 요청 이메일 전송",
                  "가입 시 사용한 이메일 주소로 보내주세요",
                  "결제 일시와 결제 수단을 함께 알려주시면 처리가 빠릅니다",
                ]
              : [
                  "Email support@onething.app",
                  "Use the address you signed up with",
                  "Include the payment date and method for fastest processing",
                ]
          }
        />
      </Section>

      <Section heading={ko ? "처리 일정" : "Processing time"}>
        <Bullets
          items={
            ko
              ? [
                  "요청 접수 후 24시간 이내에 환불 처리",
                  "카드사 반영까지 일반적으로 3~5 영업일 소요",
                  "처리 수수료(5%)도 함께 반환됩니다",
                ]
              : [
                  "We process refunds within 24 hours of receiving your email",
                  "Funds typically appear in your account within 3–5 business days",
                  "Payment processing fees (5%) are also returned",
                ]
          }
        />
      </Section>

      <Section heading={ko ? "7일 이후" : "After 7 days"}>
        <p>
          {ko
            ? "7일 이후의 환불은 회사 재량으로 검토합니다. 대부분의 경우 합리적 사유가 있으면 승인합니다."
            : "Refunds after 7 days are at our discretion. We generally approve reasonable requests."}
        </p>
      </Section>

      <Section heading={ko ? "연간 플랜 해지" : "Annual plan cancellation"}>
        <p>
          {ko
            ? "연간 플랜 해지 시 남은 기간 동안 계속 이용할 수 있으며, 일할 계산에 의한 부분 환불은 제공되지 않습니다."
            : "When you cancel an annual plan, access continues until the end of the current period. Pro-rated partial refunds are not provided."}
        </p>
      </Section>

      <Section heading={ko ? "앱스토어 결제" : "App Store / Google Play purchases"}>
        <p>
          {ko
            ? "iOS/Android 앱 내 결제는 Apple 또는 Google이 직접 처리합니다. 각 스토어의 환불 안내 페이지를 통해 요청해 주세요."
            : "Purchases made inside the iOS or Android app are processed by Apple or Google. Please request refunds through their refund policies."}
        </p>
      </Section>
    </LegalPageShell>
  );
}
