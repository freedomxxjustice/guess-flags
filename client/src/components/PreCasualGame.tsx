import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { backButton } from "@telegram-apps/sdk";
import Header from "./Header";
import {
  WheelPicker,
  WheelPickerWrapper,
  type WheelPickerOption,
} from "@ncdai/react-wheel-picker";

type GameFilterProps = {
  onStart: (numQuestions: number, category: string, gamemode: string) => void;
  onBack: () => void;
  isFullscreen: boolean;
  headerStyle: string;
  headerStyleFullscreen: string;
  note: string;
};

const possibleNumQuestions = ["5", "10", "15"];
const possibleCategories = ["country", "frenzy"];
const possibleGamemodes = ["choose", "enter"];

function PreCasualGame({
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
      value: "countries",
    },
    {
      label: t("frenzy"),
      value: "frenzy",
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
                highlightWrapper:
                  "bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50",
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
                highlightWrapper:
                  "bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50",
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
                highlightWrapper:
                  "bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50",
              }}
            />
          </WheelPickerWrapper>
        </fieldset>

        <div id="note" className="py-3 px-4 bg-grey-2/10 backdrop-blur-md">
          <h1 className="text-grey text-left text-xs">{t("note")}</h1>
          <p className="text-white text-xs text-justify">
            {t("casual_mode_rules")}
          </p>
        </div>

        <button
          onClick={() =>
            selectedNumQuestions &&
            onStart(selectedNumQuestions, selectedCategory, selectedGamemode)
          }
          disabled={!selectedNumQuestions}
          className={`btn btn-regular w-80`}
        >
          {t("start_game")}
        </button>
        <div id="note" className="py-3 px-4 bg-grey-2/10 backdrop-blur-md">
          <h1 className="text-grey text-left text-xs">{t("note")}</h1>
          <p className="text-white text-xs text-justify">{note}</p>
        </div>
      </div>
    </div>
  );
}

export default PreCasualGame;
