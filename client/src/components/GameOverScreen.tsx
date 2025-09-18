import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import Toast from "./Toast";

interface AnswerSummary {
  question_idx: number;
  user_answer: string;
  is_correct: boolean;
  image?: string;
  points: number;
  correct_answer: string;
}

interface GameOverScreenProps {
  title?: string;
  score: number;
  baseScore: number;
  difficultyMultiplier: number;
  numQuestions: number;
  answers: AnswerSummary[];
  returnedAttempt?: boolean;
  onBack: () => void;
}

const GameOverScreen = ({
  title = "Game Over!",
  score,
  baseScore,
  difficultyMultiplier,
  numQuestions,
  answers,
  returnedAttempt = false,
  onBack,
}: GameOverScreenProps) => {
  const { t } = useTranslation();
  const correctCount = answers.filter((a) => a.is_correct).length;

  const [showToast, setShowToast] = useState(false);


  useEffect(() => {
    if (returnedAttempt) {
      setShowToast(true);
    }
  }, [returnedAttempt]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white px-4">
      {showToast && (
        <Toast
          message={t("attempt_returned")}
          duration={4000}
          onClose={() => setShowToast(false)}
        />
      )}

      <h2 className="text-2xl font-bold mb-4">{t(title)}</h2>
      <p className="text-lg mb-2">
        {t("correct_answers")}: {correctCount} / {numQuestions}
      </p>
      <p className="text-md mb-2 text-gray-300">
        {t("score")}: {baseScore} × {difficultyMultiplier} = {score}
      </p>
      <div className="max-w-md text-left">
        <h3 className="font-semibold mb-2">{t("summary")}</h3>
        <div className="max-h-64 overflow-y-auto border border-grey-2 rounded p-2">
          <ul className="list-disc pl-5 space-y-2">
            {answers.map((ans, idx) => (
              <li key={idx} className="flex items-center space-x-3">
                {ans.image && (
                  <img
                    src={ans.image}
                    alt={`Flag for question ${ans.question_idx + 1}`}
                    className="w-10 h-6 object-cover border rounded"
                  />
                )}
                <div>
                  <div>
                    {t("question")} #{ans.question_idx + 1}: {t("your_answer")}{" "}
                    "{ans.user_answer}" —{" "}
                    {ans.is_correct ? (
                      <span className="text-green-400">{t("correct")}</span>
                    ) : (
                      <span className="text-red-400">{t("incorrect")}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-300 ml-2">
                    {t("correct_answer")}: {t(ans.correct_answer)} |{" "}
                    {t("points")}: {ans.points}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button
        onClick={onBack}
        className="mt-6 bg-primary/10 backdrop-blur-2xl px-4 py-2 rounded"
      >
        {t("to_home")}
      </button>
    </div>
  );
};

export default GameOverScreen;
