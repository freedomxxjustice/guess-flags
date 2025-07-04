import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import request from "../utils/api";
import type { IUser } from "../interfaces/IUser";
import type { IGame } from "../interfaces/IGame";
import BottomMenu from "./BottomMenu";
import BuyTries from "./BuyTries";
import Leaderboard from "./Leaderboard";
import Profile from "./Profile";
import PreCasualGame from "./PreCasualGame";
import { backButton } from "@telegram-apps/sdk";
import LoadingSpinner from "./LoadingSpinner";
import * as fuzzball from "fuzzball";
import { AnimatePresence, motion } from "framer-motion";
import EventCarousel from "./Carousel";

const TRANSITION_DURATION = 0.2;

const MainWrapper = () => {
  // STATES
  const [showModal, setShowModal] = useState<
    false | "error" | "notEnoughTries"
  >(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showBuyTries, setShowBuyTries] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState<"home" | "profile" | "leaderboard">("home");
  const [numQuestions, setNumQuestions] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGamemode, setSelectedGamemode] = useState<string | null>(null);
  const [minDelayDone, setMinDelayDone] = useState(false);

  // CONSTANTS

  const btnClickAnimation = "transform active:scale-95 transition-transform";
  const btnDisabled = "text-grey backdrop-blur bg-grey/10 text-xl";
  const btnRegular =
    "text-white bg-primary backdrop-blur rounded-3xl text-xl shadow-xl";
  const btnBig = "py-4 w-75";

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

  const {
    data,
    isLoading: isLeadersLoading,
    refetch: refetchLeaders,
  } = useQuery({
    queryKey: ["leaders"],
    queryFn: async () => {
      if (user) {
        const response = await request(`users/get-leaders?user_id=${user?.id}`);
        return response.data;
      }
    },
    select: (data) => ({
      leaders: data.leaders,
      userRank: data.user_rank, // keep the rank as well
    }),
  });

  // START GAME
  const {
    data: game,
    isLoading: isGameLoading,
    isFetching: isGameFetching,
    error: gameError,
  } = useQuery<IGame>({
    queryKey: ["game", numQuestions, selectedCategory, selectedGamemode], // include in key for caching
    queryFn: async () =>
      (
        await request(
          `games/casual/create?num_questions=${numQuestions}&category=${selectedCategory}&gamemode=${selectedGamemode}`
        )
      ).data.game,
    enabled: gameStarted,
    retry: false,
  });

  // EFFECTS

  const submittedRef = useRef(false);
  // TIMER
  const timeoutRef = useRef<number | null>(null);

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
    const timeout = setTimeout(() => setMinDelayDone(true), 1500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (
      gameStarted &&
      game &&
      currentQuestionIndex >= game.questions.length &&
      !submittedRef.current
    ) {
      submittedRef.current = true;
      console.log(typeof numQuestions);
      request("games/casual/submit-score", "POST", {
        score,
        numQuestions,
      }).catch(console.error);
    }
  }, [gameStarted, currentQuestionIndex, game, score]);

  const handleStartGame = (
    numQuestions: number,
    category: string,
    gamemode: string
  ) => {
    if (!user || user.tries_left <= 0) {
      setShowFilter(false);
      setShowModal("notEnoughTries");
      return;
    }
    setNumQuestions(numQuestions);
    setSelectedCategory(category);
    setSelectedGamemode(gamemode);
    setShowFilter(false);
    submittedRef.current = false;
    setGameStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
  };
  const isLoading = isUserLoading || !minDelayDone;
  const openCommunity = () => {
    window.open("https://t.me/guessflags", "_blank");
  };

  const handleAnswer = (opt: string) => {
    if (selectedOption) return;

    const answer = game?.questions[currentQuestionIndex].answer ?? "";

    // Normalize
    const normalizedOpt = opt.trim().toLowerCase();
    const normalizedAnswer = answer.trim().toLowerCase();

    // Compute similarity ratio (0 to 100)
    const similarity = fuzzball.ratio(normalizedOpt, normalizedAnswer);

    console.log("Similarity:", similarity);

    // Example threshold: 70% similarity (adjust as needed)
    const correct = similarity >= 70;

    setSelectedOption(opt);
    setIsCorrect(correct);
    if (correct) setScore((prev) => prev + 1);

    setTimeout(() => {
      setSelectedOption(null);
      setIsCorrect(null);
      setTypedAnswer("");
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
        className="fixed top-14 left-1/2 -translate-x-1/2 w-max z-50 flex justify-center"
      >
        <div
          onClick={() => setShowBuyTries(true)}
          className={`rounded-xl py-1 px-3 text-center shadow-md cursor-pointer ${
            user?.tries_left === 0 ? "bg-warning" : "bg-primary"
          }`}
        >
          <h2 className="text-sm font-semibold">
            Tries left: {user?.tries_left}
          </h2>
        </div>
      </div>
      <div className="flex justify-center items-center h-screen flex-col gap-8 p-6">
        <div className="bg-grey-2/10 backdrop-blur py-4 px-5 shadow-2xl">
          <h1 className="text-white text-center text-2xl font-bold text-shadow-background text-shadow-md">
            {user?.name}, <br />
            Welcome to Guess Flags!
          </h1>
          {user?.tries_left === 0 && (
            <h2 className="text-center text-warning text-sm px-4">
              Come back tomorrow or buy more tries using stars!
            </h2>
          )}
        </div>
        <img className="rounded-xl object-cover w-75" src="/....png" />

        <div className="flex justify-center flex-col items-center gap-2">
          <button
            type="button"
            className={`${btnRegular} ${btnBig} font-medium rounded-lg text-sm px-20 py-3 text-center mb-2 ${btnClickAnimation}`}
            onClick={() => setShowFilter(true)}
          >
            Play Casual
          </button>
          <button
            onClick={() => setShowModal("error")}
            // onClick={() => joinMultiplayer()}
            type="button"
            className={`text-background ${btnBig} bg-gradient-to-r font-medium rounded-lg text-sm px-20 py-3 text-center mb-2 ${btnDisabled}`}
          >
            Play Rating
          </button>
          <button
            type="button"
            className={`${btnRegular} ${btnBig} font-medium rounded-lg text-sm px-20 py-3 text-center mb-2 ${btnClickAnimation}`}
            onClick={openCommunity}
          >
            Community
          </button>
          <div>
            <p className="text-accent text-shadow-2xs text-xs mt-8">
              Early Access
            </p>
          </div>
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
    return (
      <Leaderboard
        leaders={data?.leaders}
        user={user}
        userRank={data?.userRank}
      />
    );
  };

  // RENDER: Start Screen
  const renderStartScreen = () => (
    <div className="flex justify-center items-center h-screen flex-col">
      <BottomMenu
        onNavigate={setPage}
        page={page}
        refetchLeaders={refetchLeaders}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={page} // IMPORTANT: triggers animation on `page` change
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: TRANSITION_DURATION }}
          className="w-full"
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
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
            className="w-full h-full object-contain mb-4"
          />
        </div>
        {selectedGamemode === "choose" ? (
          // buttons
          <div className="flex flex-col gap-2 w-full max-w-xs">
            {question.options.map((opt: string, idx: number) => {
              const isCorrectAnswer = opt === question.answer;
              const isSelected = selectedOption === opt;

              let btnClass = `${btnBig} bg-primary/10`;
              if (selectedOption) {
                if (isCorrectAnswer) {
                  btnClass = "bg-green-600";
                } else if (isSelected) {
                  btnClass = "bg-red-600";
                } else {
                  btnClass = "bg-primary/10"; // dim unselected incorrect ones
                }
              }

              return (
                <button
                  key={idx}
                  disabled={!!selectedOption}
                  onClick={() => handleAnswer(opt)}
                  className={`${btnClickAnimation} rounded-md ${btnBig} ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          // input
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <input
              type="text"
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              disabled={!!selectedOption}
              className={`
      px-4 py-3 rounded-lg w-full border-2 transition-all
      focus:outline-none focus:ring-2 focus:ring-primary
      ${
        selectedOption
          ? isCorrect
            ? "border-green-500 bg-green-100 text-black"
            : "border-red-500 bg-red-100 text-black"
          : "border-gray-300"
      }
    `}
              placeholder="Type your answer..."
            />

            <button
              onClick={() => handleAnswer(typedAnswer.trim())}
              disabled={!!selectedOption || !typedAnswer.trim()}
              className={`
      font-medium rounded-lg text-sm px-6 py-3 text-center transition-all
      ${
        selectedOption
          ? isCorrect
            ? "bg-green-600 hover:bg-green-700"
            : "bg-red-600 hover:bg-red-700"
          : "bg-primary hover:bg-blue-700"
      }
      ${btnClickAnimation}
    `}
            >
              {selectedOption
                ? isCorrect
                  ? "✅ Correct!"
                  : `❌ Right answer: ${game?.questions[currentQuestionIndex].answer}`
                : "Submit"}
            </button>
          </div>
        )}
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
        className="mt-4 bg-primary/10 backdrop-blur-2xl px-4 py-2 rounded hover:bg-blue-700"
      >
        Home Page
      </button>
      <div
        id="note"
        className="py-3 px-4 w-75 mt-6 bg-grey-2/10 backdrop-blur-md"
      >
        <h1 className="text-grey text-left text-xs">Note</h1>
        <p className="text-white text-xs text-justify">
          Playing in this mode only have affected casual score. Anyway rating is
          in development, so stay tuned.
        </p>
      </div>
    </div>
  );

  // RETURN LOGIC
  if (isUserLoading || isLeadersLoading) {
    return <LoadingSpinner />;
  }

  if (isGameLoading || isGameFetching) {
    return <LoadingSpinner />;
  }

  if (showBuyTries) {
    backButton.show();

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="buyTries"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: TRANSITION_DURATION }}
          className="w-full h-full"
        >
          <div>
            <BuyTries
              onBack={() => {
                setShowBuyTries(false);
                refetchUser();
                backButton.hide();
              }}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (gameError) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background rounded-2xl p-6 max-w-sm w-full text-center">
          <h2 className="text-xl font-bold mb-4">Error!</h2>
          <p className="mb-6">
            {gameError instanceof Error ? gameError.message : "Unknown error"}
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
    );
  }

  if (showFilter) {
    backButton.show();

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="filter"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: TRANSITION_DURATION }}
          className="w-full h-full"
        >
          <PreCasualGame
            onStart={handleStartGame}
            onBack={() => {
              setShowFilter(false);
              refetchUser();
              backButton.hide();
            }}
          />
        </motion.div>
      </AnimatePresence>
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
