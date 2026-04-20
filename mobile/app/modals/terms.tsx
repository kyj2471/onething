import { useTranslation } from "react-i18next";
import { WebViewModal } from "@/components/layout/WebViewModal";
import { LEGAL_PATHS } from "@/constants/config";

export default function TermsModal() {
  const { t } = useTranslation();
  return <WebViewModal title={t("settings.terms")} path={LEGAL_PATHS.terms} />;
}
