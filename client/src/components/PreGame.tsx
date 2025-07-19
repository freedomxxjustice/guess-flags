import { useState } from "react";
import { backButton } from "@telegram-apps/sdk";
import Header from "./Header";

type GameFilterProps = {
  onStart: (
    numQuestions: number,
    category: string,
    gamemode: string,
    tags: string[]
  ) => void;
  onBack: () => void;
  isFullscreen: boolean;
  headerStyle: string;
  headerStyleFullscreen: string;
};

const possibleNumQuestions = [5, 10, 15];
const possibleCategories = ["country", "frenzy"];
const possibleGamemodes = ["choose", "enter"];
const possibleTags = ["UN", "Europe", "Asia", "landlocked"];

function PreGame({
  onBack,
  onStart,
  isFullscreen,
  headerStyle,
  headerStyleFullscreen,
}: GameFilterProps) {
  const [selectedNumQuestions, setSelectedNumQuestions] = useState<
    number | null
  >(possibleNumQuestions[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    possibleCategories[0]
  );
  const [selectedGamemode, setSelectedGamemode] = useState<string>(
    possibleGamemodes[0]
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  backButton.onClick(onBack);

  return (
    <div className="min-h-screen h-50 overflow-auto">
      <Header
        isFullscreen={isFullscreen}
        headerStyle={headerStyle}
        headerStyleFullscreen={headerStyleFullscreen}
        title="Filters"
      >
        <h1 className="text-md font-bold text-center">
          Customize your gameplay
        </h1>
      </Header>
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
                selectedNumQuestions === num ? "btn-regular" : "btn-disabled"
              } ${"btn-click-animation"}`}
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
                selectedCategory === category ? "btn-regular" : "btn-disabled"
              } ${"btn-click-animation"}`}
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
                selectedGamemode === mode ? "btn-regular" : "btn-disabled"
              } ${"btn-click-animation"}`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        <h1 className="text-2xl font-bold text-center">Filter by Tags</h1>

        <div className="flex flex-wrap gap-4 justify-center">
          {possibleTags.map((tag) => (
            <label key={tag} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={() => {
                  setSelectedTags((prev) =>
                    prev.includes(tag)
                      ? prev.filter((t) => t !== tag)
                      : [...prev, tag]
                  );
                }}
              />
              <span className="text-sm">
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </span>
            </label>
          ))}
        </div>

        <button
          onClick={() =>
            selectedNumQuestions &&
            onStart(
              selectedNumQuestions,
              selectedCategory,
              selectedGamemode,
              selectedTags
            )
          }
          disabled={!selectedNumQuestions}
          className={` ${"btn-regular"} ${"btn-big"} ${"btn-click-animation"} ${
            selectedNumQuestions && selectedCategory
              ? "btn-regular"
              : "btn-disabled"
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
