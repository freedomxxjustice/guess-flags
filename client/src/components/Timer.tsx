import { useTranslation } from "react-i18next";

export default function Timer({ timeLeft }: { timeLeft: number | null }) {
  const { t } = useTranslation();

  return (
    <p className="text-lg mb-4">
      {t("time_left")}: {timeLeft ?? "--"} {t("s")}.
    </p>
  );
}
