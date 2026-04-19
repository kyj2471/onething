import { setRequestLocale } from "next-intl/server";
import { LegalPageShell } from "@/components/layout/LegalPageShell";
import { Section, Bullets } from "@/components/layout/LegalBlocks";

const LAST_UPDATED = "2026-04-19";

export default function TermsPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const ko = params.locale === "ko";

  return (
    <LegalPageShell
      locale={params.locale}
      title={ko ? "이용약관" : "Terms of Service"}
      lastUpdated={LAST_UPDATED}
    >
      <p>
        {ko
          ? "본 약관은 너드 스테이션(이하 \"회사\")이 제공하는 OneThing 서비스의 이용 조건을 규정합니다. 가입 시 본 약관에 동의한 것으로 간주됩니다."
          : "These Terms govern your use of the OneThing service operated by Nerd Station (\"we\", \"us\"). By signing up you agree to these Terms."}
      </p>

      <Section heading={ko ? "1. 서비스" : "1. The Service"}>
        <p>
          {ko
            ? "OneThing은 OKR 방식에 기반하여 개인 목표 달성을 돕는 웹/앱 서비스입니다. 이용자는 하나의 활성 목표(Goal)와 측정 가능한 지표(Target), 일일 행동(Action)을 기록합니다."
            : "OneThing is a web and mobile service that helps individuals achieve personal goals using the OKR methodology. Users track one active Goal with measurable Targets and daily Actions."}
        </p>
      </Section>

      <Section heading={ko ? "2. 이용 자격" : "2. Eligibility"}>
        <p>
          {ko
            ? "만 14세 이상이어야 서비스를 이용할 수 있습니다. 가입 시 연령 확인 체크박스에 체크해야 합니다."
            : "You must be 14 years or older to use the Service. You will confirm your age at sign-up."}
        </p>
      </Section>

      <Section heading={ko ? "3. 계정" : "3. Your account"}>
        <Bullets
          items={
            ko
              ? [
                  "1인 1계정을 원칙으로 합니다.",
                  "계정 보안은 이용자 책임입니다. 비밀번호를 타인과 공유하지 마세요.",
                  "본인 명의 외의 계정 생성, 양도, 판매는 금지됩니다.",
                ]
              : [
                  "One account per person.",
                  "You are responsible for keeping your credentials secure. Do not share your password.",
                  "Creating, transferring, or selling accounts in another person's name is prohibited.",
                ]
          }
        />
      </Section>

      <Section heading={ko ? "4. 구독 및 결제" : "4. Subscription and billing"}>
        <Bullets
          items={
            ko
              ? [
                  "가입 시 14일 무료 체험이 제공되며, 체험 시작에는 카드 등록이 필수입니다.",
                  "체험 종료 24시간 전 이메일로 안내하며, 해지하지 않으면 자동으로 유료 구독으로 전환됩니다.",
                  "월간 $4.99 또는 연간 $34.99 플랜 중 선택할 수 있습니다.",
                  "해지는 언제든 설정에서 가능합니다. 해지 후 현재 결제 기간 종료 시까지 계속 사용할 수 있습니다.",
                  "결제는 Lemon Squeezy(Merchant of Record)를 통해 처리되며, 부가세/소비세는 자동으로 반영됩니다.",
                ]
              : [
                  "A 14-day free trial is included. A valid card is required to start the trial.",
                  "We email you 24 hours before the trial ends. If not cancelled, it automatically converts to a paid subscription.",
                  "Plans: $4.99/month or $34.99/year.",
                  "You can cancel anytime from Settings. Access continues until the end of the current billing period.",
                  "Payments are processed by Lemon Squeezy (Merchant of Record). Applicable taxes are applied automatically.",
                ]
          }
        />
      </Section>

      <Section heading={ko ? "5. 환불" : "5. Refunds"}>
        <p>
          {ko
            ? "결제 후 7일 이내에는 이유를 불문하고 전액 환불해 드립니다. 7일 이후의 환불은 회사 재량으로 검토합니다. 자세한 내용은 환불 정책 페이지를 참고하세요."
            : "Full refund within 7 days of payment, no questions asked. Refunds after 7 days are at our discretion. See the Refund Policy for details."}
        </p>
      </Section>

      <Section heading={ko ? "6. 금지 행위" : "6. Prohibited conduct"}>
        <Bullets
          items={
            ko
              ? [
                  "불법적 목적의 사용",
                  "서비스 및 하부 시스템에 대한 역공학, 해킹, 침투 시도",
                  "자동화된 수단을 통한 비정상적 데이터 수집 또는 접근",
                  "타인의 권리를 침해하는 콘텐츠 업로드",
                ]
              : [
                  "Using the Service for unlawful purposes",
                  "Reverse engineering, hacking, or probing the Service",
                  "Scraping or automated data collection without consent",
                  "Uploading content that infringes third-party rights",
                ]
          }
        />
      </Section>

      <Section heading={ko ? "7. 지적재산권" : "7. Intellectual property"}>
        <p>
          {ko
            ? "서비스의 소프트웨어, 디자인, 브랜드는 회사에 귀속됩니다. 이용자가 입력한 콘텐츠의 권리는 이용자에게 있으며, 회사는 서비스 제공에 필요한 범위 내에서만 사용합니다."
            : "The software, design, and brand of the Service belong to us. You retain rights to the content you create; we use it only as necessary to operate the Service for you."}
        </p>
      </Section>

      <Section heading={ko ? "8. 서비스 중단 및 변경" : "8. Changes and interruption"}>
        <p>
          {ko
            ? "회사는 기술적 유지보수를 위해 서비스를 일시 중단할 수 있으며, 기능을 추가·변경·중단할 수 있습니다. 중대한 변경은 사전 고지합니다."
            : "We may suspend the Service for maintenance and may add, change, or remove features. Material changes will be announced in advance."}
        </p>
      </Section>

      <Section heading={ko ? "9. 면책" : "9. Disclaimer and liability"}>
        <p>
          {ko
            ? "서비스는 \"있는 그대로\" 제공됩니다. 회사는 서비스 이용으로 인한 데이터 손실, 간접 손해, 특별 손해에 대해 법이 허용하는 최대 범위에서 책임을 제한합니다."
            : "The Service is provided \"as is\". To the maximum extent permitted by law, our liability for data loss, indirect, or consequential damages is limited."}
        </p>
      </Section>

      <Section heading={ko ? "10. 준거법 및 관할" : "10. Governing law"}>
        <p>
          {ko
            ? "본 약관은 대한민국법에 따릅니다. 분쟁 발생 시 서울중앙지방법원을 제1심 관할 법원으로 합니다."
            : "These Terms are governed by the laws of the Republic of Korea. The Seoul Central District Court has exclusive jurisdiction as the court of first instance."}
        </p>
      </Section>

      <Section heading={ko ? "11. 분쟁 해결" : "11. Dispute resolution"}>
        <p>
          {ko
            ? "분쟁이 발생할 경우 먼저 support@onething.app으로 연락하여 원만한 해결을 시도하며, 해결되지 않을 경우 위 관할 법원에서 소송으로 해결합니다."
            : "You agree to first contact support@onething.app to resolve disputes. Unresolved disputes are submitted to the court named above."}
        </p>
      </Section>
    </LegalPageShell>
  );
}
