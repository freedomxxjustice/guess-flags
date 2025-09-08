import BottomModal from "./BottomModal";
import { useTranslation } from "react-i18next";

interface TrainingGameScreenProps {
  game: any;
  currentQuestionIndex: number;
  selectedGamemode: string | null;
  selectedOption: string | null;
  typedAnswer: string;
  setTypedAnswer: (val: string) => void;
  isCorrect: boolean | null;
  showExitModal: boolean;
  setShowExitModal: (val: boolean) => void;
  onAnswer: (answer: string) => void;
  onSubmit: () => void;
  hasSubmitted: boolean;
  setHasSubmitted: (val: boolean) => void;
}

const TrainingGameScreen = ({
  game,
  currentQuestionIndex,
  selectedGamemode,
  selectedOption,
  typedAnswer,
  setTypedAnswer,
  isCorrect,
  showExitModal,
  setShowExitModal,
  onAnswer,
  onSubmit,
  hasSubmitted,
  setHasSubmitted,
}: TrainingGameScreenProps) => {
  const { t } = useTranslation();

  if (!game) return null;
  const question = game.questions[currentQuestionIndex];
  if (!question) return null;

  return (
    <div className="min-h-screen w-full h-50 overflow-auto py-6 content-center flex justify-center items-center">
      <div className="flex flex-col items-center justify-center text-white px-4 bg-background w-98 py-4 border border-grey-2 rounded">
        <h2 className="text-2xl font-bold mb-4">
          {t("question")} {currentQuestionIndex + 1}
        </h2>

        <div className="w-44 h-22 flex flex-col items-center justify-center my-4.5">
          <img
            src={question.image}
            alt="Flag"
            className="w-full h-full object-contain mb-4"
          />
        </div>

        {selectedGamemode === "choose" ? (
          <div className="flex flex-col gap-2 w-90 justify-center items-center">
            {question.options.map((opt: string, idx: number) => {
              const isCorrectAnswer = opt === question.answer;
              const isSelected = selectedOption === opt;

              let btnClass = `bg-primary/10`;
              if (selectedOption) {
                if (isCorrectAnswer) {
                  btnClass = "bg-green-600";
                } else if (isSelected) {
                  btnClass = "bg-red-600";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={!!selectedOption}
                  onClick={() => onAnswer(opt)}
                  className={`btn rounded-md ${btnClass}`}
                >
                  {t(opt)}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <input
              type="text"
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              disabled={hasSubmitted}
              className={`px-4 py-3 rounded-lg w-full transition-all bg-primary/10 border-gray-300`}
              placeholder={t("type_your_answer")}
            />
            <button
              onClick={() => {
                if (!hasSubmitted && typedAnswer.trim()) {
                  onAnswer(typedAnswer.trim());
                  setHasSubmitted(true);
                }
              }}
              disabled={hasSubmitted || !typedAnswer.trim()}
              className={`font-medium rounded-lg text-sm px-6 py-3 text-center transition-all ${
                hasSubmitted && isCorrect !== null
                  ? isCorrect
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                  : "bg-primary hover:bg-blue-700"
              } btn`}
            >
              {hasSubmitted && isCorrect !== null
                ? isCorrect
                  ? `✅ ${t("correct")}`
                  : `❌ ${t("right_answer")}: ${question.answer}`
                : t("submit")}
            </button>
          </div>
        )}
      </div>

      {showExitModal && (
        <BottomModal
          title={t("exit_confirm_title")}
          text={t("exit_confirm_text")}
          actionLabel={t("exit_confirm_action")}
          onAction={() => {
            onSubmit();
            setShowExitModal(false);
          }}
          onClose={() => setShowExitModal(false)}
        />
      )}
    </div>
  );
};

export default TrainingGameScreen;
