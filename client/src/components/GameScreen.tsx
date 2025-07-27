import Timer from "./Timer";
import BottomModal from "./BottomModal";
import { useTranslation } from "react-i18next";

interface GameScreenProps {
  game: any;
  timeLeft: number;
  selectedOption: string | null;
  typedAnswer: string;
  setTypedAnswer: (val: string) => void;
  isCorrect: boolean | null;
  correctAnswer: string | null;
  showExitModal: boolean;
  setShowExitModal: (val: boolean) => void;
  onAnswer: (answer: string) => void;
  onSubmit: () => void;
  hasSubmitted: boolean;
  setHasSubmitted: (val: boolean) => void;
}

const GameScreen = ({
  game,
  timeLeft,
  selectedOption,
  typedAnswer,
  setTypedAnswer,
  isCorrect,
  correctAnswer,
  showExitModal,
  setShowExitModal,
  onAnswer,
  onSubmit,
  hasSubmitted,
  setHasSubmitted,
}: GameScreenProps) => {
  const { t } = useTranslation();

  if (!game) return null;

  const question = game.current_question;
  if (!question) return null;
  return (
    <div className="min-h-screen w-full h-50 overflow-auto py-6 content-center">
      <div className="flex flex-col items-center justify-center text-white px-4">
        <h2 className="text-2xl font-bold mb-4">
          {t("question")} {question.index + 1}
        </h2>
        <Timer timeLeft={timeLeft} />

        <div className="w-44 h-22 flex flex-col items-center justify-center my-12">
          <img
            src={question.image}
            alt="Flag"
            className="w-120 h-67.5 object-contain py-12"
          />
        </div>

        {question.mode === "choose" && (
          <div className="flex flex-col justify-center items-center gap-2 w-full">
            {question.options.map((opt: string, idx: number) => {
              let btnClass = `bg-primary/10`;

              if (isCorrect !== null && selectedOption) {
                const isUserPick = opt === selectedOption;
                const isRightAnswer =
                  opt.toLowerCase() === correctAnswer?.toLowerCase();

                if (isUserPick && isCorrect) {
                  btnClass = "bg-green-600";
                } else if (isUserPick && !isCorrect) {
                  btnClass = "bg-red-600";
                } else if (!isUserPick && !isCorrect && isRightAnswer) {
                  btnClass = "bg-green-600";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={!!selectedOption}
                  onClick={() => onAnswer(opt)}
                  className={`btn-click-animation py-4 px-2 rounded-md w-90 ${btnClass}`}
                >
                  {t(opt)}
                </button>
              );
            })}
          </div>
        )}

        {question.mode === "enter" && (
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <input
              type="text"
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              disabled={hasSubmitted}
              className={`px-4 py-3 rounded-lg w-full transition-all bg-primary/10 border-gray-300`}
              placeholder={t("type_your_answer") || "Type your answer..."}
            />

            <button
              onClick={() => {
                if (!hasSubmitted && typedAnswer.trim()) {
                  onAnswer(typedAnswer.trim());
                  setHasSubmitted(true); // Prevent double-submit here
                }
              }}
              disabled={hasSubmitted || !typedAnswer.trim()}
              className={`
        font-medium rounded-lg text-sm px-6 py-3 text-center transition-all
        ${
          hasSubmitted && isCorrect !== null
            ? isCorrect
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
            : "bg-primary hover:bg-blue-700"
        }
        btn-click-animation
      `}
            >
              {hasSubmitted && isCorrect !== null
                ? isCorrect
                  ? `✅ ${t("correct")}`
                  : `❌ ${t("right_answer")}: ${
                      correctAnswer
                        ? t(
                            correctAnswer.charAt(0).toUpperCase() +
                              correctAnswer.slice(1)
                          )
                        : ""
                    }`
                : t("submit") || "Submit"}
            </button>
          </div>
        )}
      </div>

      {showExitModal && (
        <div>
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
        </div>
      )}
    </div>
  );
};

export default GameScreen;
