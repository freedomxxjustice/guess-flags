import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  mainButton,
  hapticFeedback,
  invoice,
} from "@telegram-apps/sdk";
import request from "../utils/api";

mainButton.setParams({
  text: "SPEND",
  isEnabled: true,
  isVisible: false,
  hasShineEffect: true,
  isLoaderVisible: false,
  textColor: "#FFFFFF",
});

const DonationPage = () => {
  const [stars, setStars] = useState<number>(999);

  useEffect(() => {
    const handleClick = async () => {
      if (hapticFeedback.isSupported()) {
        hapticFeedback.impactOccurred("soft");
      }
      const response = await request("payment", "post", { amount: 4 });
      invoice.open(response.data.invoice_link.replace("https://t.me/$", ""));
    };

    mainButton.onClick(handleClick);
    return () => {
      mainButton.offClick(handleClick);
    };
  }, [stars]);

  const calcStars = (e: any) => {
    const userValue = e.target.value.trim();
    const starCost = userValue / (0.625 / 50);
    const prevParams = mainButton.state();

    if (userValue && !isNaN(userValue) && userValue > 0) {
      mainButton.setParams({ ...prevParams, isVisible: true });
      setStars(starCost);
    } else {
      mainButton.setParams({ ...prevParams, isVisible: false });
      setStars(0);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen flex-col">
      <h1 className="text-blue-500 text-4xl mb-5 font-semibold">
        <CountUp end={stars} />{" "}
        <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
      </h1>

      <input
        type="number"
        className="giest-mono text-2xl text-center w-[90%]"
        placeholder="$$$"
        inputMode="numeric"
        pattern="[0-9]*"
        onChange={calcStars}
        style={{
          background: "none",
          border: "2px solid var(--tg-theme-accent-text-color)",
          color: "white",
          outline: "none",
        }}
      />
    </div>
  );
};

export default DonationPage;
