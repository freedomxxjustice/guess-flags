interface AnswerSummary {
  question_idx: number;
  user_answer: string;
  is_correct: boolean;
  image?: string;
}

interface GameOverScreenProps {
  title?: string;
  score: number;
  numQuestions: number;
  answers: AnswerSummary[];
  onBack: () => void;
}

const GameOverScreen = ({
  title = "Game Over!",
  score,
  numQuestions,
  answers,
  onBack,
}: GameOverScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-white px-4">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-lg mb-2">
        Your score: {score} / {numQuestions}
      </p>
      <div className="max-w-md text-left">
        <h3 className="font-semibold mb-2">Summary of answers:</h3>
        <div
          className="max-h-64 overflow-y-auto border border-grey-2 rounded p-2"
          // max-h-64 is 16rem (~256px), adjust as needed
        >
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
                <span>
                  Question #{ans.question_idx + 1}: Your answer "
                  {ans.user_answer.charAt(0).toUpperCase() +
                    ans.user_answer.slice(1)}
                  "{" — "}
                  {ans.is_correct ? (
                    <span className="text-green-400">Correct</span>
                  ) : (
                    <span className="text-red-400">Incorrect</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button
        onClick={onBack}
        className="mt-6 bg-primary/10 backdrop-blur-2xl px-4 py-2 rounded"
      >
        Back to Home
      </button>
    </div>
  );
};

export default GameOverScreen;
