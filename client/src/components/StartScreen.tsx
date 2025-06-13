import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import request from "../utils/api";
import type { IUser } from "../interfaces/IUser";
import type { Game } from "../interfaces/IGame";

const StartScreen = () => {
  // STATES
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  // GET USER INFO
  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => (await request("users/get")).data,
    select: (data) => data.user as IUser,
  });

  // START GAME
  const {
    data: game,
    // isFetching: gameLoading,
    refetch,
  } = useQuery<Game>({
    queryKey: ["game"],
    queryFn: async () => (await request("games/create")).data.game,
    enabled: gameStarted, // don't fetch on mount
  });

  // EFFECTS
  useEffect(() => {
    if (gameStarted && game && currentQuestionIndex >= game.questions.length) {
      console.log({ score });
      request("games/submit-score", "POST", { score }).catch(console.error);
    }
  }, [gameStarted, currentQuestionIndex, game, score]);

  const handleStartGame = () => {
    setGameStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    refetch();
  };

  const handleAnswer = (opt: string) => {
    const correct = opt === game?.questions[currentQuestionIndex].answer;
    setSelectedOption(opt);
    setIsCorrect(correct);
    if (correct) setScore((prev) => prev + 1);

    setTimeout(() => {
      setSelectedOption(null);
      setIsCorrect(null);
      setCurrentQuestionIndex((prev) => prev + 1);
    }, 1000);
  };

  // Show final score screen
  if (gameStarted && game && currentQuestionIndex >= game.questions.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white">
        <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
        <p className="text-lg">
          Your score: {score} / {game.questions.length}
        </p>
        <button
          onClick={() => {
            setGameStarted(false);
          }}
          className="mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Play Again
        </button>
      </div>
    );
  }

  // Show game screen
  if (gameStarted && game) {
    const question = game.questions[currentQuestionIndex];

    return (
      <div className="flex flex-col items-center justify-center h-screen text-white px-4">
        <h2 className="text-2xl font-bold mb-4">
          Question {currentQuestionIndex + 1}
        </h2>
        <img
          src={question.image}
          alt="Flag"
          className="w-40 h-auto mb-4 border rounded"
        />
        <div className="flex flex-col gap-2 w-full max-w-xs">
          {question.options.map((opt: string, idx: number) => {
            const isSelected = selectedOption === opt;
            const correctAnswer = question.answer;

            return (
              <button
                key={idx}
                disabled={!!selectedOption}
                onClick={() => handleAnswer(opt)}
                className={`px-4 py-2 rounded transition-colors duration-300 ${
                  isSelected
                    ? opt === correctAnswer
                      ? "bg-green-600"
                      : "bg-red-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Show loading or start screen
  return (
    <div>
      {isLoading ? (
        <div className="animate-pulse text-white text-center mt-10">
          Loading...
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen flex-col">
          <h1 className="text-white text-center text-2xl mb-5 font-bold">
            {user?.name}, <br />
            Welcome to Flags Guess!
          </h1>
          <button
            type="button"
            className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
            onClick={handleStartGame}
          >
            Start
          </button>
        </div>
      )}
    </div>
  );
};

export default StartScreen;
