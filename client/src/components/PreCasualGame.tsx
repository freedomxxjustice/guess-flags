import { useState } from "react";
import { backButton } from "@telegram-apps/sdk";

type GameFilterProps = {
  onStart: (numQuestions: number) => void;
  onBack: () => void;
};

function PreCasualGame({ onBack, onStart }: GameFilterProps) {
  const [selected, setSelected] = useState<number | null>(null);
  backButton.onClick(onBack);
  const btnClickAnimation = "transform active:scale-95 transition-transform";
  const btnBase = "font-medium rounded-lg text-sm px-20 py-3 text-center mb-2";
  const btnPrimary =
    "text-white bg-primary focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800";
  const btnDisabled = "text-background bg-grey";

  return (
    <div className="flex justify-center items-center h-screen flex-col gap-8 p-6 text-white">
      <h1 className="text-2xl font-bold text-center">
        Choose Number of Questions
      </h1>

      <div className="flex gap-4">
        {[5, 10, 15].map((num) => (
          <button
            key={num}
            onClick={() => setSelected(num)}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              selected === num ? "bg-blue-600 text-white" : "bg-grey text-white"
            } ${btnClickAnimation}`}
          >
            {num}
          </button>
        ))}
      </div>

      <button
        onClick={() => selected && onStart(selected)}
        disabled={!selected}
        className={`${btnBase} ${btnClickAnimation} ${
          selected ? btnPrimary : btnDisabled
        }`}
      >
        Start Game
      </button>
    </div>
  );
}

export default PreCasualGame;
