import { useState } from "react";
import { useTranslation } from "react-i18next";
import { backButton } from "@telegram-apps/sdk";
import Header from "./Header";
import {
  WheelPicker,
  WheelPickerWrapper,
  type WheelPickerOption,
} from "@ncdai/react-wheel-picker";

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
  note: string;
};

const possibleNumQuestions = ["5", "10", "15"];
const possibleCategories = [
  "country",
  "ru_regions",
  "cis",
  "us_state",
  "frenzy",
];
const possibleGamemodes = ["choose", "enter"];
// const possibleTags = [
//   "UN",
//   "Europe",
//   "Asia",
//   "landlocked",
//   "Africa",
//   "North America",
//   "South America",
// ];

function PreTrainingGame({
  onBack,
  onStart,
  isFullscreen,
  headerStyle,
  headerStyleFullscreen,
  note,
}: GameFilterProps) {
  const { t } = useTranslation();

  const [selectedNumQuestions, setSelectedNumQuestions] = useState<string>(
    possibleNumQuestions[0]
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    possibleCategories[0]
  );
  const [selectedGamemode, setSelectedGamemode] = useState<string>(
    possibleGamemodes[0]
  );
  const [selectedTags, _] = useState<string[]>([]);

  const numQuestionsOptions: WheelPickerOption[] = [
    {
      label: "5",
      value: "5",
    },
    {
      label: "10",
      value: "10",
    },
    {
      label: "15",
      value: "15",
    },
  ];
  const categoryOptions: WheelPickerOption[] = [
    {
      label: t("country"),
      value: "country",
    },
    {
      label: t("frenzy"),
      value: "frenzy",
    },
    {
      label: t("ru_regions"),
      value: "ru_regions",
    },
    {
      label: t("cis"),
      value: "cis",
    },
    {
      label: t("us_state"),
      value: "us_state",
    },
  ];
  const gamemodeOptions: WheelPickerOption[] = [
    {
      label: t("choose"),
      value: "choose",
    },
    {
      label: t("enter"),
      value: "enter",
    },
  ];
  backButton.onClick(onBack);

  return (
    <div className="min-h-screen h-50 overflow-auto">
      <Header
        isFullscreen={isFullscreen}
        headerStyle={headerStyle}
        headerStyleFullscreen={headerStyleFullscreen}
        title={t("filters")}
      >
        <h1 className="text-md font-bold text-center">
          {t("customize_gameplay")}
        </h1>
      </Header>
      <div className="flex justify-center items-center flex-col gap-6 p-6 text-white">
        <fieldset className="w-full max-w-md px-6 py-2 bg-background rounded-md border border-grey-2">
          <legend className="text-2xl font-bold text-center text-white">
            {t("choose_number_of_questions")}
          </legend>
          <WheelPickerWrapper className="w-16 rounded-md bg-background">
            <WheelPicker
              options={numQuestionsOptions}
              value={selectedNumQuestions}
              onValueChange={setSelectedNumQuestions}
              classNames={{
                optionItem: "text-zinc-400 dark:text-zinc-500",
                highlightWrapper: "bg-primary",
              }}
            />
          </WheelPickerWrapper>
        </fieldset>
        <fieldset className="w-full max-w-md px-6 py-2 bg-background rounded-md border border-grey-2">
          <legend className="text-2xl font-bold text-center text-white">
            {t("choose_category")}
          </legend>
          <WheelPickerWrapper className="w-16 rounded-md bg-background">
            <WheelPicker
              options={categoryOptions}
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              classNames={{
                optionItem: "text-zinc-400 dark:text-zinc-500",
                highlightWrapper: "bg-primary",
              }}
            />
          </WheelPickerWrapper>
        </fieldset>
        <fieldset className="w-full max-w-md px-6 py-2 bg-background rounded-md border border-grey-2">
          <legend className="text-2xl font-bold text-center text-white">
            {t("choose_gamemode")}
          </legend>
          <WheelPickerWrapper className="w-16 rounded-md bg-background">
            <WheelPicker
              options={gamemodeOptions}
              value={selectedGamemode}
              onValueChange={setSelectedGamemode}
              classNames={{
                optionItem: "text-zinc-400 dark:text-zinc-500",
                highlightWrapper: "bg-primary",
              }}
            />
          </WheelPickerWrapper>
        </fieldset>
        {/* {selectedCategory == "country" && (
          <fieldset className="w-full max-w-md px-4 py-2 bg-background rounded-md border border-grey-2">
            <legend className="text-2xl font-bold text-center text-white">
              {t("append_tags")}
            </legend>c x x-60 overflow-y-auto">
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
                        setSelectedTags((prev) => {
                          const updated = prev.includes(tag)
                            ? prev.filter((t) => t !== tag)
                            : [...prev, tag];
                          return updated;
                        });
                      }}
                      className="sr-only"
                    />
                    <div
                      className={`
                    w-5 h-5 flex items-center justify-center border-2 rounded 
                    ${checked ? "bg-primary/10" : "border-grey"}
                    transition-colors
                    hover:border-green-400
                    `}
                      aria-hidden="true"
                    >
                      {checked && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 text-primary"
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
                      {t(tag)}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )} */}
        <div id="note" className="py-3 px-4 bg-grey-2/10 backdrop-blur-md">
          <h1 className="text-grey text-left text-xs">{t("note")}</h1>
          <p className="text-white text-xs text-justify">
            {t("casual_mode_rules")}
          </p>
        </div>
        <div id="note" className="py-3 px-4 bg-grey-2/10 backdrop-blur-md">
          <h1 className="text-grey text-left text-xs">{t("note")}</h1>
          <p className="text-white text-xs text-justify">{note}</p>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 w-full bg-background border-t border-grey-2 p-3 flex justify-center z-50 shadow-lg">
        <button
          onClick={() =>
            selectedNumQuestions &&
            onStart(
              Number(selectedNumQuestions),
              selectedCategory,
              selectedGamemode,
              selectedTags
            )
          }
          disabled={!selectedNumQuestions}
          className={`btn btn-action w-full max-w-md`}
        >
          {t("start_game")}
        </button>
      </div>
    </div>
  );
}

export default PreTrainingGame;
