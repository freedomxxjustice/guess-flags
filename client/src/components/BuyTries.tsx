import { useState } from "react";
import { faStar, faBolt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { hapticFeedback, invoice, backButton } from "@telegram-apps/sdk";

import request from "../utils/api";
import { useTranslation } from "react-i18next";

const triesOptions = [
  { tries: 1, stars: 10 },
  { tries: 3, stars: 25 },
  { tries: 9, stars: 70 },
];

const BuyTries = ({ onBack }: { onBack: () => void }) => {
  const [selected, setSelected] = useState<{
    tries: number;
    stars: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  backButton.onClick(() => {
    onBack();
  });

  const handleBuy = async () => {
    if (!selected) return;
    if (hapticFeedback.isSupported()) {
      hapticFeedback.impactOccurred("soft");
    }

    try {
      setLoading(true);
      const response = await request("payment", "post", {
        amount: selected.stars,
        tries: selected.tries,
      });
      invoice.open(response.data.invoice_link.replace("https://t.me/$", ""));
    } catch (error) {
      console.error("Donation error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen flex-col gap-8 text-white px-6">
      <h1 className="text-white text-4xl font-extrabold">{t("buy_tries")}</h1>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {triesOptions.map((option) => {
          const isSelected = selected?.tries === option.tries;
          return (
            <button
              key={option.tries}
              onClick={() => setSelected(option)}
              className={`btn flex justify-between items-center px-6 py-4 text-lg font-semibold transition-all
                ${
                  isSelected
                    ? "btn-regular text-white"
                    : "btn-not-selected text-primary hover:bg-[var(--color-grey)]"
                }`}
            >
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faBolt} className="" />
                {option.tries}
              </span>
              <span className="flex items-center gap-2 m-4">=</span>
              <span className="flex items-center gap-1 text-yellow-400">
                {option.stars}
                <FontAwesomeIcon icon={faStar} />
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleBuy}
        disabled={!selected || loading}
        className={`btn btn-regular w-full max-w-md text-lg font-bold mt-6 ${
          !selected || loading ? "btn-disabled" : ""
        }`}
      >
        {loading ? t("loading") : t("buy_now")}
      </button>
    </div>
  );
};

export default BuyTries;
