import { setRequestLocale } from "next-intl/server";
import { LegalPageShell } from "@/components/layout/LegalPageShell";

type Faq = { q: string; a: string };

const FAQS_EN: Faq[] = [
  {
    q: "How do I cancel my subscription?",
    a: "Go to Settings → Subscription and tap Cancel. Your access continues until the end of the current billing period.",
  },
  {
    q: "Can I get a refund?",
    a: "Yes. Refunds are full and no-questions-asked within 7 days of payment. Email support@onething.app to request one.",
  },
  {
    q: "Why can I only have one Goal?",
    a: "OneThing is built around the idea that focus beats breadth. Having one Goal at a time makes progress visible and honest.",
  },
  {
    q: "How do I update my Target numbers?",
    a: "Open the Goal tab, tap the Target card, and tap Update value. Your new current value will recalculate your Goal progress immediately.",
  },
  {
    q: "What happens when I complete my Goal?",
    a: "Your Goal is archived with its history intact. You can start a new Goal right away — onboarding reopens so you can define a fresh one.",
  },
  {
    q: "How is my progress calculated?",
    a: "Each Target's progress is capped at 100%. Your Goal progress is the simple average of all Target progress (OKR convention).",
  },
  {
    q: "Does OneThing work offline?",
    a: "The web app requires a connection. Offline support is on our roadmap for the mobile app.",
  },
  {
    q: "Can I use it on multiple devices?",
    a: "Yes — sign in with the same account on any device. Your data syncs automatically.",
  },
  {
    q: "How do I delete my account and data?",
    a: "Settings → Delete account. We remove all personal data within 30 days, except where law requires retention.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your entries are yours. We never sell data and we don't use it to train models. See the Privacy Policy for details.",
  },
];

const FAQS_KO: Faq[] = [
  {
    q: "구독은 어떻게 해지하나요?",
    a: "설정 → 구독에서 해지할 수 있습니다. 해지 후에도 현재 결제 기간 종료 시까지 계속 이용할 수 있어요.",
  },
  {
    q: "환불이 가능한가요?",
    a: "결제 후 7일 이내에는 이유 불문 전액 환불해 드립니다. support@onething.app 으로 요청하세요.",
  },
  {
    q: "왜 목표(Goal)를 하나만 설정할 수 있나요?",
    a: "집중이 넓이보다 중요하다는 철학 때문입니다. 한 번에 하나의 Goal만 두면 진전이 눈에 잘 보이고, 스스로에게도 정직해집니다.",
  },
  {
    q: "지표(Target) 수치는 어떻게 업데이트하나요?",
    a: "목표 탭에서 지표 카드를 탭하고 '수치 업데이트'를 누르세요. 새 수치는 즉시 목표 진행률에 반영됩니다.",
  },
  {
    q: "목표를 완료하면 어떻게 되나요?",
    a: "목표는 기록과 함께 아카이브되고, 새 목표를 바로 설정할 수 있도록 온보딩이 다시 열립니다.",
  },
  {
    q: "진행률은 어떻게 계산되나요?",
    a: "각 지표의 진행률은 최대 100%로 제한되고, 목표 전체 진행률은 모든 지표 진행률의 단순 평균입니다(OKR 방식).",
  },
  {
    q: "오프라인에서도 사용할 수 있나요?",
    a: "웹은 인터넷 연결이 필요합니다. 모바일 앱의 오프라인 지원은 로드맵에 있습니다.",
  },
  {
    q: "여러 기기에서 사용할 수 있나요?",
    a: "네. 동일 계정으로 로그인하면 데이터가 자동 동기화됩니다.",
  },
  {
    q: "계정과 데이터를 삭제하려면?",
    a: "설정 → 계정 삭제에서 요청할 수 있습니다. 법이 보존을 요구하는 경우를 제외하고 30일 이내에 모두 파기합니다.",
  },
  {
    q: "제 데이터는 안전한가요?",
    a: "네. 귀하의 기록은 귀하의 것입니다. 데이터를 판매하지 않으며 모델 학습에도 사용하지 않습니다. 자세한 내용은 개인정보처리방침을 확인하세요.",
  },
];

export default function HelpPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const ko = params.locale === "ko";
  const faqs = ko ? FAQS_KO : FAQS_EN;

  return (
    <LegalPageShell
      locale={params.locale}
      title={ko ? "도움말·FAQ" : "Help & FAQ"}
      lastUpdated="2026-04-19"
    >
      <p className="text-muted">
        {ko ? "아직 답을 못 찾으셨나요? " : "Didn't find your answer? "}
        <a
          href="mailto:support@onething.app"
          className="text-accent underline"
        >
          support@onething.app
        </a>
      </p>
      <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
        {faqs.map((faq, i) => (
          <details key={i} className="group px-4 py-3">
            <summary className="flex cursor-pointer items-center justify-between gap-4 font-body text-sm font-medium text-accent">
              <span>{faq.q}</span>
              <span
                aria-hidden
                className="text-muted transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-2 font-body text-sm leading-relaxed text-muted">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </LegalPageShell>
  );
}
