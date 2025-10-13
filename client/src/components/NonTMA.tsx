import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useTranslation } from "react-i18next";

function NonTMA() {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 flex justify-center items-center p-4 z-50 bg-[var(--color-background)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[var(--color-grey-2)]/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center border border-[var(--color-grey)]"
      >
        <h1
          className="text-2xl font-extrabold mb-4"
          style={{ color: "var(--color-white)", fontFamily: "Inter" }}
        >
          {t("non_tma_title")}
        </h1>

        <p
          className="mb-6 leading-relaxed text-sm"
          style={{ color: "var(--color-light)" }}
        >
          {t("non_tma_text")}{" "}
          <span
            className="font-semibold"
            style={{ color: "var(--color-primary)" }}
          >
            Telegram
          </span>
          . {t("non_tma_continue")}
        </p>
        <a
          href="https://web.telegram.org/a/#7661408038"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-regular text-base font-bold flex items-center justify-center mx-auto"
        >
          <Send className="w-5 h-5 mr-2" />
          {t("non_tma_button")}
        </a>
      </motion.div>
    </div>
  );
}

export default NonTMA;
