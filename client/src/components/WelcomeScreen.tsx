import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { CheckCircle, PlayCircle } from "lucide-react";

interface WelcomeScreenProps {
  onFinish: () => void;
}

export default function WelcomeScreen({ onFinish }: WelcomeScreenProps) {
  const { t } = useTranslation();

  const steps = [
    t("welcome_step1"),
    t("welcome_step2"),
    t("welcome_step3"),
    t("welcome_step4"),
  ];

  return (
    <div className="fixed inset-0 flex justify-center items-center p-6 z-50 bg-[var(--color-background)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[var(--color-grey-2)]/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center border border-[var(--color-grey)]"
      >
        <h1
          className="text-4xl font-extrabold mb-6"
          style={{ color: "var(--color-white)", fontFamily: "Inter" }}
        >
          {t("welcome_title")}
        </h1>

        <p
          className="mb-6 leading-relaxed"
          style={{ color: "var(--color-light)" }}
        >
          {t("welcome_text_line1")} <br />
          {t("welcome_text_line2")}
        </p>

        <ul className="text-left space-y-3 mb-8">
          {steps.map((step, index) => (
            <li
              key={index}
              className="flex items-center gap-3"
              style={{ color: "var(--color-white)" }}
            >
              <CheckCircle className="w-6 h-6 text-[var(--color-primary)] shrink-0" />
              <span className="text-lg">{step}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={onFinish}
          className="btn btn-regular text-lg font-bold"
        >
          <PlayCircle className="w-6 h-6 mr-2" />
          {t("welcome_button")}
        </button>
      </motion.div>
    </div>
  );
}
