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
    <div className="fixed inset-0 flex justify-center items-center p-4 z-50 bg-[var(--color-background)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[var(--color-grey-2)]/80 backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-6 max-w-md w-full text-center border border-[var(--color-grey)] max-h-[90vh] overflow-y-auto"
      >
        <h1
          className="text-2xl sm:text-4xl font-extrabold mb-4 sm:mb-6"
          style={{ color: "var(--color-white)", fontFamily: "Inter" }}
        >
          {t("welcome_title")}
        </h1>

        <p
          className="mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base"
          style={{ color: "var(--color-light)" }}
        >
          {t("welcome_text_line1")} <br />
          {t("welcome_text_line2")}
        </p>

        <ul className="text-left space-y-2 sm:space-y-3 mb-6 sm:mb-8">
          {steps.map((step, index) => (
            <li
              key={index}
              className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
              style={{ color: "var(--color-white)" }}
            >
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-primary)] shrink-0" />
              <span>{step}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={onFinish}
          className="btn btn-regular text-base sm:text-lg font-bold flex items-center justify-center mx-auto"
        >
          <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
          {t("welcome_button")}
        </button>
      </motion.div>
    </div>
  );
}
