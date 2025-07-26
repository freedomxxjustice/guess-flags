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
const possibleTags = [
  "UN",
  "Europe",
  "Asia",
  "landlocked",
  "Africa",
  "North America",
  "South America",
];

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
        <fieldset className="w-full max-w-md px-6 py-2 bg-background rounded-md border border-gray-700">
          <legend className="text-2xl font-bold text-center text-white">
            Choose Number of Questions
          </legend>
          <div className="flex justify-center gap-4 flex-wrap">
            {possibleNumQuestions.map((num) => (
              <button
                key={num}
                onClick={() => setSelectedNumQuestions(num)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                  selectedNumQuestions === num ? "btn-regular" : "btn-disabled"
                } btn-click-animation`}
              >
                {num}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="w-full max-w-md px-6 py-2 bg-background rounded-md border border-gray-700">
          <legend className="text-2xl font-bold text-center text-white">
            Choose Category
          </legend>
          <div className="flex justify-center gap-4 flex-wrap">
            {possibleCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                  selectedCategory === category ? "btn-regular" : "btn-disabled"
                } btn-click-animation`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="w-full max-w-md px-6 py-2 bg-background rounded-md border border-gray-700">
          <legend className="text-2xl font-bold text-center text-white">
            Choose Gamemode
          </legend>
          <div className="flex justify-center gap-4 flex-wrap">
            {possibleGamemodes.map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedGamemode(mode)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                  selectedGamemode === mode ? "btn-regular" : "btn-disabled"
                } btn-click-animation`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="w-full max-w-md px-4 py-2 bg-background rounded-md border border-gray-700">
          <legend className="text-2xl font-bold text-center text-white">
            Append Tags
          </legend>
          <div className="flex flex-col gap-3 items-start max-h-60 overflow-y-auto">
            {possibleTags.map((tag) => {
              const checked = selectedTags.includes(tag);
              return (
                <label
                  key={tag}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setSelectedTags((prev) =>
                        prev.includes(tag)
                          ? prev.filter((t) => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                    className="sr-only"
                  />
                  <div
                    className={`
              w-5 h-5 flex items-center justify-center border-2 rounded 
              ${checked ? "border-green-500 bg-green-100" : "border-gray-400"}
              transition-colors
              hover:border-green-400
            `}
                    aria-hidden="true"
                  >
                    {checked && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v12m6-6H6"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-white select-none">
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

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
