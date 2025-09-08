import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { faStar, faBolt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  mainButton,
  hapticFeedback,
  invoice,
  backButton,
} from "@telegram-apps/sdk";

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

  backButton.onClick(() => {
    onBack();
    mainButton.setParams({ isVisible: false });
  });

  const { t } = useTranslation();

  useEffect(() => {
    const handleClick = async () => {
      if (!selected) return;

      if (hapticFeedback.isSupported()) {
        hapticFeedback.impactOccurred("soft");
      }

      try {
        const response = await request("payment", "post", {
          amount: selected.stars,
          tries: selected.tries,
        });
        invoice.open(response.data.invoice_link.replace("https://t.me/$", ""));
      } catch (error) {
        console.error("Donation error", error);
      }
    };

    mainButton.onClick(handleClick);
    return () => mainButton.offClick(handleClick);
  }, [selected]);

  const handleSelect = (option: { tries: number; stars: number }) => {
    setSelected(option);
    mainButton.setParams({ ...mainButton.state(), isVisible: true });
  };

  return (
    <div className="flex justify-center items-center h-screen flex-col gap-8 mt-14 text-white">
      <h1 className="text-primary text-4xl font-semibold giest-mono">
        <CountUp end={selected?.stars || 0} />{" "}
        <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
      </h1>

      <div className="flex flex-col gap-4 w-[80%]">
        {triesOptions.map((option) => (
          <button
            key={option.tries}
            onClick={() => handleSelect(option)}
            className={`btn flex justify-center items-center gap-3 ${
              selected?.tries === option.tries
                ? "btn-regular text-white"
                : "btn-not-selected text-white hover:bg-grey"
            }`}
          >
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faBolt} className="text-blue-400" />
              {option.tries}
            </span>

            <span className="text-lg font-bold">=</span>

            <span className="flex items-center gap-1">
              {option.stars}
              <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BuyTries;
