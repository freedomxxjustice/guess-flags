import { useState } from "react";
import { backButton } from "@telegram-apps/sdk";

type GameFilterProps = {
  onStart: (numQuestions: number, category: string, gamemode: string) => void;
  onBack: () => void;
};

const possibleNumQuestions = [5, 10, 15];
const possibleCategories = ["country", "frenzy"];
const possibleGamemodes = ["choose", "enter"];

function PreGame({ onBack, onStart }: GameFilterProps) {
  const [selectedNumQuestions, setSelectedNumQuestions] = useState<
    number | null
  >(possibleNumQuestions[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    possibleCategories[0]
  );
  const [selectedGamemode, setSelectedGamemode] = useState<string>(
    possibleGamemodes[0]
  );

  backButton.onClick(onBack);
  const btnClickAnimation = "transform active:scale-95 transition-transform";
  const btnBase = "font-medium rounded-lg text-sm px-20 py-3 text-center mb-2";
  const btnBig = "py-4 w-75";
  const btnPrimary =
    "text-white bg-gradient-to-t from-primary to-primary/50 backdrop-blur rounded-3xl shadow-xl";
  const btnDisabled = "text-background bg-grey";

  return (
    <div className="flex justify-center items-center h-screen flex-col gap-8 p-6 text-white">
      <h1 className="text-4xl font-bold text-center">
        Customize your gameplay
      </h1>
      <div className="flex justify-center items-center flex-col gap-6 p-6 text-white">
        <h1 className="text-2xl font-bold text-center">
          Choose Number of Questions
        </h1>

        <div className="flex gap-4">
          {possibleNumQuestions.map((num) => (
            <button
              key={num}
              onClick={() => setSelectedNumQuestions(num)}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                selectedNumQuestions === num ? btnPrimary : btnDisabled
              } ${btnClickAnimation}`}
            >
              {num}
            </button>
          ))}
        </div>

        <h1 className="text-2xl font-bold text-center">Choose Category</h1>

        <div className="flex gap-4">
          {possibleCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                selectedCategory === category ? btnPrimary : btnDisabled
              } ${btnClickAnimation}`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <h1 className="text-2xl font-bold text-center">Choose Gamemode</h1>

        <div className="flex gap-4">
          {possibleGamemodes.map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedGamemode(mode)}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                selectedGamemode === mode ? btnPrimary : btnDisabled
              } ${btnClickAnimation}`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={() =>
            selectedNumQuestions &&
            onStart(selectedNumQuestions, selectedCategory, selectedGamemode)
          }
          disabled={!selectedNumQuestions}
          className={` ${btnBase} ${btnBig} ${btnClickAnimation} ${
            selectedNumQuestions && selectedCategory
              ? "bg-gradient-to-t from-primary to-primary/80"
              : btnDisabled
          }`}
        >
          Start Game
        </button>
        <div id="note" className="py-3 px-4 bg-grey-2/10 backdrop-blur-md">
          <h1 className="text-grey text-left text-xs">Note</h1>
          <p className="text-white text-xs text-justify">
            Playing in this mode will only affect casual score, thus to
            participate in casual tournaments, competitions or events you should
            go on. Anyway rating is in development, so stay tuned.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PreGame;
