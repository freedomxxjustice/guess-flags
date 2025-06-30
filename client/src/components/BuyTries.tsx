import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  mainButton,
  hapticFeedback,
  invoice,
  backButton,
} from "@telegram-apps/sdk";

import request from "../utils/api";

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

  backButton.onClick(onBack);

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
        console.log(response);
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
      <h1 className="text-blue-500 text-4xl font-semibold">
        <CountUp end={selected?.stars || 0} />{" "}
        <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
      </h1>

      <div className="flex flex-col gap-4 w-[80%]">
        {triesOptions.map((option) => (
          <button
            key={option.tries}
            onClick={() => handleSelect(option)}
            className={`py-3 px-6 rounded-xl text-lg font-medium transition-all ${
              selected?.tries === option.tries
                ? "bg-yellow-500 text-black"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            Buy {option.tries} {option.tries === 1 ? "try" : "tries"} –{" "}
            {option.stars}{" "}
            <FontAwesomeIcon icon={faStar} className="text-yellow-300" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default BuyTries;
