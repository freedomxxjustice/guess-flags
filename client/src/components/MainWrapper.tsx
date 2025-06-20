import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import request from "../utils/api";
import type { IUser } from "../interfaces/IUser";
import type { IGame } from "../interfaces/IGame";
import BottomMenu from "./BottomMenu";
import BuyTries from "./BuyTries";
import Leaderboard from "./Leaderboard";
import Profile from "./Profile";

const MainWrapper = () => {
  // STATES
  const [showModal, setShowModal] = useState<
    false | "error" | "notEnoughTries"
  >(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [_, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showBuyTries, setShowBuyTries] = useState(false);
  const [page, setPage] = useState<"home" | "profile" | "leaderboard" | "game">(
    "home"
  );

  // CONSTANTS

  const btnClickAnimation = "transform active:scale-95 transition-transform";
  const btnDisabled = "text-background bg-gradient-to-r bg-darkest";
  const btnRegular =
    "text-white bg-deep-blue focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800";

  // GET USER INFO
  const {
    data: user,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await request("users/get");
      return response.data;
    },
    select: (data) => data.user as IUser,
  });

  // GET LEADERS
  const { data: leaders, isLoading: isLeadersLoading } = useQuery({
    queryKey: ["leaders"],
    queryFn: async () => {
      const response = await request("users/get-leaders");
      return response.data;
    },
    select: (data) => data.leaders,
  });
  // START GAME
  const {
    data: game,
    isLoading: isGameLoading,
    isFetching: isGameFetching,
    error: gameError,
  } = useQuery<IGame>({
    queryKey: ["game"],
    queryFn: async () => (await request("games/create")).data.game,
    enabled: gameStarted,
    retry: false,
  });

  // EFFECTS
  const submittedRef = useRef(false);

  useEffect(() => {
    if (gameError) {
      const status = (gameError as any)?.response?.status;

      if (status === 403) {
        setShowModal("notEnoughTries");
      } else {
        setShowModal("error");
      }
      setGameStarted(false); // prevent UI from progressing if error occurs
    }
  }, [gameError]);

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
    if (!user || user.tries_left <= 0) {
      setShowModal("notEnoughTries");
      return;
    }
    submittedRef.current = false;
    setGameStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
  };

  const openCommunity = () => {
    window.open("https://t.me/guessflags", "_blank");
  };

  const handleAnswer = (opt: string) => {
    if (selectedOption) return;
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
      case "profile":
        return renderProfileScreen();
      case "leaderboard":
        return renderLeaderboardScreen();
      default:
        return renderHomeScreen();
    }
  };

  const renderHomeScreen = () => (
    <div>
      <div
        id="upperPanel"
        className="absolute top-4 w-full flex justify-center z-10"
      >
        <div
          onClick={() => setShowBuyTries(true)}
          className={`rounded-xl py-1 px-3 text-center shadow-md ${
            user?.tries_left === 0 ? "bg-warning" : "bg-darker"
          }`}
        >
          <h2 className="text-sm font-semibold">
            Tries left: {user?.tries_left}
          </h2>
        </div>
      </div>
      <div className="flex justify-center items-center h-screen flex-col gap-8 p-6">
        <div>
          <h1 className="text-white text-center text-2xl mb-5 font-bold text-shadow-background text-shadow-md">
            {user?.name}, <br />
            Welcome to Flags Guess!
          </h1>
          {user?.tries_left === 0 && (
            <h2 className="text-center text-warning text-sm px-4">
              Come back tomorrow or buy more tries using stars!
            </h2>
          )}
        </div>
        <div className="flex justify-center flex-col items-center">
          <button
            type="button"
            className={`${btnRegular} font-medium rounded-lg text-sm px-20 py-3 text-center me-2 mb-2 ${btnClickAnimation}`}
            onClick={handleStartGame}
          >
            Play Casual
          </button>
          <button
            onClick={() => setShowModal("error")}
            type="button"
            className={`text-background bg-gradient-to-r bg-darkest focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-20 py-3 text-center me-2 mb-2 ${btnDisabled}`}
          >
            Play Rating
          </button>
          <button
            type="button"
            className={`${btnRegular} font-medium rounded-lg text-sm px-20 py-3 text-center me-2 mb-2 ${btnClickAnimation}`}
            onClick={openCommunity}
          >
            Community
          </button>
        </div>
        <div>
          <p className="text-accent text-shadow-2xs text-xs">Early Access</p>
        </div>
        {/* 404 Modal */}
        {showModal == "error" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-2xl p-6 max-w-sm w-full text-center">
              <h2 className="text-xl font-bold mb-4">A like 404</h2>
              <p className="mb-6">
                Unfortunately this feature isn't available yet!
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="py-2 px-4 rounded-xl font-semibold transition-all"
                style={{
                  backgroundColor: "var(--color-warning)",
                  color: "white",
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
        {/* Buy Tries Modal */}
        {showModal == "notEnoughTries" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-2xl p-6 max-w-sm w-full text-center">
              <h2 className="text-xl font-bold mb-4">Not enough tries!</h2>
              <p className="mb-6">
                Unfortunately you have run out of tries. Still, you can buy them
                using Telegram Stars or simply wait 24 hours!
              </p>
              <div className="flex flex-col gap-4">
                <button
                  className={`${btnRegular} py-2 px-4 rounded-xl font-semibold transition-all ${btnClickAnimation}`}
                  onClick={() => setShowBuyTries(true)}
                >
                  Buy tries!
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className={`py-2 px-4 rounded-xl font-semibold transition-all ${btnClickAnimation}`}
                  style={{
                    backgroundColor: "var(--color-warning)",
                    color: "white",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  if (!user) return null;

  const renderProfileScreen = () => {
    return <Profile user={user} />;
  };

  const renderLeaderboardScreen = () => {
    return <Leaderboard leaders={leaders} user={user} />;
  };

  // RENDER: Start Screen
  const renderStartScreen = () => (
    <div className="flex justify-center items-center h-screen flex-col">
      <BottomMenu onNavigate={setPage} />
      {renderPage()}
    </div>
  );

  // RENDER: Game Screen
  const renderCasualGameScreen = () => {
    const question = game?.questions[currentQuestionIndex];
    if (!question) return null;
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
                className={`${btnClickAnimation} ${btnRegular} font-medium rounded-lg text-sm px-20 py-3 text-center me-2 mb-2 ${btnClass}`}
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
        onClick={() => {
          setGameStarted(false);
          refetchUser();
        }}
        className="mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
      >
        Home Page
      </button>
    </div>
  );

  // RETURN LOGIC
  if (isUserLoading || isLeadersLoading) {
    return (
      <div className="animate-pulse text-white text-center mt-10">
        Loading...
      </div>
    );
  }

  if (isGameLoading || isGameFetching) {
    return (
      <div className="animate-pulse text-white text-center mt-10">
        Loading...
      </div>
    );
  }

  if (showBuyTries) {
    return (
      <div>
        <BuyTries
          onBack={() => {
            setShowBuyTries(false);
            refetchUser();
          }}
        />
      </div>
    );
  }

  if (gameStarted && game && currentQuestionIndex >= game.questions.length) {
    return renderGameOverScreen();
  }

  if (gameStarted && game) {
    return renderCasualGameScreen();
  }

  return renderStartScreen();
};

export default MainWrapper;
