import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import request from "../utils/api";
import type { IUser } from "../interfaces/IUser";
import type { IGame } from "../interfaces/IGame";
import BottomMenu from "./BottomMenu";

const MainWrapper = () => {
  // STATES
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [page, setPage] = useState<"home" | "profile" | "settings" | "game">(
    "home"
  );
  // GET USER INFO
  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await request("users/get");
      return response.data;
    },
    select: (data) => data.user as IUser,
  });

  // START GAME
  const {
    data: game,
    // isFetching: gameLoading,
    // refetch,
  } = useQuery<IGame>({
    queryKey: ["game"],
    queryFn: async () => (await request("games/create")).data.game,
    enabled: gameStarted, // don't fetch on mount
  });

  // EFFECTS
  const submittedRef = useRef(false);

  useEffect(() => {
    if (
      gameStarted &&
      game &&
      currentQuestionIndex >= game.questions.length &&
      !submittedRef.current
    ) {
      submittedRef.current = true;
      request("games/submit-score", "POST", { score }).catch(console.error);
    }
  }, [gameStarted, currentQuestionIndex, game, score]);
  const handleStartGame = () => {
    setGameStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    // refetch();
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

  const renderPage = () => {
    switch (page) {
      case "home":
        return renderHomeScreen();
      // case "profile":
      //   return <ProfileScreen />;
      // case "leaderboard":
      //   return <LeaderboardScreen />;
      default:
        return renderHomeScreen();
    }
  };

  const renderHomeScreen = () => (
    <div>
      <h1 className="text-white text-center text-2xl mb-5 font-bold">
        {user?.name}, <br />
        Welcome to Flags Guess!
      </h1>
      <button
        type="button"
        className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
        onClick={handleStartGame}
      >
        Play Casual
      </button>
    </div>
  );

  // RENDER: Start Screen
  const renderStartScreen = () => (
    <div className="flex justify-center items-center h-screen flex-col">
      <BottomMenu />
      {renderHomeScreen()}
    </div>
  );

  // RENDER: Game Screen
  const renderGameScreen = () => {
    const question = game?.questions[currentQuestionIndex];

    return (
      <div className="flex flex-col items-center justify-center h-screen text-white px-4">
        <h2 className="text-2xl font-bold mb-4">
          Question {currentQuestionIndex + 1}
        </h2>
        <div className="w-44 h-22 flex flex-col items-center justify-center my-4.5">
          <img
            src={question.image}
            alt="Flag"
            className="w-40 h-auto mb-4 border rounded"
          />
        </div>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          {question.options.map((opt: string, idx: number) => {
            const isCorrectAnswer = opt === question.answer;
            const isSelected = selectedOption === opt;

            let btnClass = "bg-blue-600 hover:bg-blue-700";
            if (selectedOption) {
              if (isCorrectAnswer) {
                btnClass = "bg-green-600";
              } else if (isSelected) {
                btnClass = "bg-red-600";
              } else {
                btnClass = "bg-gray-600"; // dim unselected incorrect ones
              }
            }

            return (
              <button
                key={idx}
                disabled={!!selectedOption}
                onClick={() => handleAnswer(opt)}
                className={`px-4 py-2 rounded transition-colors duration-300 ${btnClass}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // RENDER: Game Over Screen
  const renderGameOverScreen = () => (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
      <p className="text-lg">
        Your score: {score} / {game?.questions.length}
      </p>
      <button
        onClick={() => setGameStarted(false)}
        className="mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
      >
        Home Page
      </button>
    </div>
  );

  // RETURN LOGIC
  if (isLoading) {
    return (
      <div className="animate-pulse text-white text-center mt-10">
        Loading...
      </div>
    );
  }

  if (gameStarted && game && currentQuestionIndex >= game.questions.length) {
    return renderGameOverScreen();
  }

  if (gameStarted && game) {
    return renderGameScreen();
  }

  return renderStartScreen();
};

export default MainWrapper;
