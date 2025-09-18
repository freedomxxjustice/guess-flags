import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { backButton } from "@telegram-apps/sdk";
import Header from "./Header";
import {
  WheelPicker,
  WheelPickerWrapper,
  type WheelPickerOption,
} from "@ncdai/react-wheel-picker";
import { FaBolt } from "react-icons/fa";
import BottomModal from "./BottomModal";

type GameFilterProps = {
  onStart: (numQuestions: number, category: string, gamemode: string) => void;
  onBack: () => void;
  isFullscreen: boolean;
  headerStyle: string;
  headerStyleFullscreen: string;
  note: string;
  showModal: false | "error" | "notEnoughTries";
  setShowModal: (value: false | "error" | "notEnoughTries") => void;
  setShowBuyTries: (value: boolean) => void;
};

const possibleNumQuestions = ["10", "15", "20"];
const possibleCategories = [
  "country",
  "ru_regions",
  "cis",
  "us_state",
  "frenzy",
];
const possibleGamemodes = ["choose", "enter"];

function PreCasualGame({
  onBack,
  onStart,
  isFullscreen,
  headerStyle,
  headerStyleFullscreen,
  note,
  showModal,
  setShowModal,
  setShowBuyTries,
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
      label: "10",
      value: "10",
    },
    {
      label: "15",
      value: "15",
    },
    {
      label: "20",
      value: "20",
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
        <div id="note" className="py-3 px-4 bg-grey-2/10 backdrop-blur-md">
          <h1 className="text-grey text-left text-xs">{t("note")}</h1>
          <p className="text-white text-xs text-justify">
            {t("casual_mode_rules")}
          </p>
        </div>
        <button
          onClick={() =>
            selectedNumQuestions &&
            onStart(
              Number(selectedNumQuestions),
              selectedCategory,
              selectedGamemode
            )
          }
          disabled={!selectedNumQuestions}
          className={`btn btn-regular w-80`}
        >
          {t("start_game")} <FaBolt className="ml-2 mt-1"></FaBolt>
        </button>
        <div id="note" className="py-3 px-4 bg-grey-2/10 backdrop-blur-md">
          <h1 className="text-grey text-left text-xs">{t("note")}</h1>
          <p className="text-white text-xs text-justify">{note}</p>
        </div>
        {/* Modals */}
      </div>
      {showModal === "notEnoughTries" && (
        <BottomModal
          title={t("not_enough_tries")}
          text={t("not_enough_tries_text")}
          actionLabel={t("buy_tries")}
          onAction={() => {
            setShowBuyTries(true);
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
      {showModal === "error" && (
        <BottomModal
          title={t("error_404")}
          text={t("error_404_text")}
          onClose={() => setShowModal(false)}
        />
      )}{" "}
    </div>
  );
}

export default PreCasualGame;
