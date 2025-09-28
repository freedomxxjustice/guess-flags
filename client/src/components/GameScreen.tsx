import Timer from "./Timer";
import BottomModal from "./BottomModal";
import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";
import Toast from "./Toast";
import confetti from "canvas-confetti";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [showToast, setShowToast] = useState<boolean>(false);
  const question = game.current_question;
  useEffect(() => {
    if (question.index == 0) {
      setShowToast(true);
    } else {
      setShowToast(false);
    }
  }, [question.index]);
  const glowColor =
    isCorrect === null
      ? "transparent"
      : isCorrect
      ? "rgba(0,255,0,0.3)"
      : "rgba(255,0,0,0.3)";

  function AnswerFeedback({ isCorrect }: { isCorrect: boolean | null }) {
    useEffect(() => {
      if (isCorrect) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }, [isCorrect]);

    return null;
  }

  if (!question) return null;
  return (
    <div className="min-h-screen w-full overflow-auto py-6 content-center flex justify-center items-center">
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none rounded"
        style={{
          boxShadow: `0 0 50px 20px ${glowColor} inset`,
          transition: "box-shadow 0.3s ease",
        }}
      />
      <div
        className={`flex flex-col items-center justify-center text-white px-4 bg-background w-98 py-4 border border-grey-2 rounded
  ${isCorrect === false ? "error-shake" : ""}`}
      >
        <div className="w-full h-2 bg-grey-2 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: `${((question.index + 1) / game.num_questions) * 100}%`,
            }}
          />
        </div>
        <AnswerFeedback isCorrect={isCorrect} />

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
                const normalizedOpt = opt.trim().toLowerCase();
                const normalizedUserPick = selectedOption?.trim().toLowerCase();
                const normalizedCorrect = correctAnswer?.trim().toLowerCase();

                const isUserPick = normalizedOpt === normalizedUserPick;
                const isRightAnswer = normalizedOpt === normalizedCorrect;

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
                  className={`py-4 px-2 rounded-md w-90 ${btnClass}`}
                >
                  {t(opt)}
                </button>
              );
            })}
          </div>
        )}

        {question.mode === "enter" && (
          <div className="fixed bottom-0 left-0 w-full bg-background border-t border-grey-2 p-4 flex flex-col gap-3">
            <input
              ref={inputRef}
              autoFocus
              type="text"
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              disabled={hasSubmitted}
              className={`px-4 py-3 rounded-lg w-full border 
  ${
    hasSubmitted
      ? isCorrect
        ? "border-green-600"
        : "border-red-600 animate-shake"
      : "border-gray-300"
  }`}
              placeholder={t("type_your_answer") || "Type your answer..."}
              onFocus={() =>
                inputRef.current?.scrollIntoView({ behavior: "smooth" })
              }
            />

            <button
              onClick={() => {
                if (!hasSubmitted && typedAnswer.trim()) {
                  onAnswer(typedAnswer.trim());
                  setHasSubmitted(true);
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
        btn
      `}
            >
              {hasSubmitted && isCorrect !== null
                ? isCorrect
                  ? `✅ ${t("correct")}`
                  : `❌ ${t("right_answer")}: ${
                      correctAnswer
                        ? t(
                            correctAnswer
                              .split(" ")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(" ")
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
      {showToast && (
        <Toast
          message={t("attempt_consumed")}
          duration={4000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default GameScreen;
