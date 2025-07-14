import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import request from "../utils/api";
import type { IUser } from "../interfaces/IUser";
import type { ITrainingGame } from "../interfaces/ITrainingGame";
import type { ICasualGame } from "../interfaces/ICasualGame";
import BottomMenu from "./BottomMenu";
import BuyTries from "./BuyTries";
import Leaderboard from "./Leaderboard";
import Profile from "./Profile";
import PreGame from "./PreGame";
import { backButton, isFullscreen } from "@telegram-apps/sdk";
import LoadingSpinner from "./LoadingSpinner";
import * as fuzzball from "fuzzball";
import { AnimatePresence, motion } from "framer-motion";
import Tournaments from "./Tournaments";
import Header from "./Header";
import BottomModal from "./BottomModal";

const TRANSITION_DURATION = 0.2;

const MainWrapper = () => {
  // PAGE STATES
  const [showModal, setShowModal] = useState<
    false | "error" | "notEnoughTries"
  >(false);
  const [showBuyTries, setShowBuyTries] = useState(false);
  const [showTrainingFilter, setShowTrainingFilter] = useState(false);
  const [showCasualFilter, setShowCasualFilter] = useState(false);
  const [page, setPage] = useState<
    "home" | "profile" | "leaderboard" | "tournaments"
  >("home");
  // TRAINING GAME STATES
  const [trainingGameStarted, setTrainingGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  // FILTER STATES
  const [numQuestions, setNumQuestions] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGamemode, setSelectedGamemode] = useState<string | null>(null);
  // CASUAL GAME STATES
  const [casualGameStarted, setCasualGameStarted] = useState(false);
  const [casualGame, setCasualGame] = useState<ICasualGame | null>(null);
  const [casualGameLoading, setCasualGameLoading] = useState(false);
  const [casualGameError, setCasualGameError] = useState<string | null>(null);
  const [casualSummary, setCasualSummary] = useState<any | null>(null);
  const [isAwaiting, setIsAwaiting] = useState(false);
  // TIMER
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // UI
  const [isFullscreenState, setIsFullscreenState] = useState<boolean>(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // GET USER INFO
  const {
    data: user,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user"],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await request("users/get");
      return response.data;
    },
    select: (data) => data.user as IUser,
  });

  // CHECK ACTIVE MATCH
  const {
    data: activeCasualMatch,
    isLoading: isActiveCasualLoading,
    error: activeCasualError,
  } = useQuery<ICasualGame | null>({
    queryKey: ["casual", "active-match"],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      try {
        const res = await request("games/casual/match/active");
        if (res.data.status == "Match not found!") {
          return null;
        }
        return res.data;
      } catch (error: any) {
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
  });

  useEffect(() => {
    if (activeCasualMatch) {
      setCasualGame(activeCasualMatch);
      setCasualGameStarted(true);
    } else {
      setCasualGame(null);
    }
  }, [activeCasualMatch]);

  // GET LEADERS
  const {
    data,
    isLoading: isLeadersLoading,
    refetch: refetchLeaders,
  } = useQuery({
    queryKey: ["leaders"],
    refetchOnWindowFocus: false,
    enabled: !!user,
    queryFn: async () => {
      if (user) {
        const response = await request(
          `users/get-casual-leaders?user_id=${user?.id}`
        );
        return response.data;
      }
    },
    select: (data) => ({
      leaders: data.leaders,
      today_leaders: data.today_leaders,
      userRank: data.user_rank,
      userTodayRank: data.user_today_rank,
    }),
  });

  // TRAINING GAME
  const {
    data: game,
    isLoading: isGameLoading,
    isFetching: isGameFetching,
    error: gameError,
  } = useQuery<ITrainingGame>({
    queryKey: ["game", numQuestions, selectedCategory, selectedGamemode],
    queryFn: async () => {
      return (
        await request(
          `games/training/create?num_questions=${numQuestions}&category=${selectedCategory}&gamemode=${selectedGamemode}`
        )
      ).data.game;
    },
    enabled: trainingGameStarted,
    retry: false,
  });

  const submittedRef = useRef(false);

  useEffect(() => {
    if (
      trainingGameStarted &&
      game &&
      currentQuestionIndex >= game.questions.length &&
      !submittedRef.current
    ) {
      submittedRef.current = true;
      request("games/training/submit-score", "POST", {
        score,
        numQuestions,
      }).catch(console.error);
    }
  }, [trainingGameStarted, currentQuestionIndex, game, score]);

  const handleStartTrainingGame = (
    numQuestions: number,
    category: string,
    gamemode: string
  ) => {
    setNumQuestions(numQuestions);
    setSelectedCategory(category);
    setSelectedGamemode(gamemode);
    setShowTrainingFilter(false);
    submittedRef.current = false;
    setTrainingGameStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
  };

  const handleTrainingAnswer = (opt: string) => {
    if (selectedOption) return;

    const answer = game?.questions[currentQuestionIndex].answer ?? "";

    // Normalize
    const normalizedOpt = opt.trim().toLowerCase();
    const normalizedAnswer = answer.trim().toLowerCase();

    // Compute similarity ratio (0 to 100)
    const similarity = fuzzball.ratio(normalizedOpt, normalizedAnswer);

    const correct = similarity > 75;

    setSelectedOption(opt);
    setIsCorrect(correct);
    if (correct) setScore((prev) => prev + 1);

    setTimeout(() => {
      setSelectedOption(null);
      setIsCorrect(null);
      setTypedAnswer("");
      setCurrentQuestionIndex((prev) => prev + 1);
    }, 2000);
  };

  useEffect(() => {
    if (trainingGameStarted) {
      backButton.onClick(() => {
        setTrainingGameStarted(false);
      });
    }
  }, [trainingGameStarted]);

  useEffect(() => {
    const checkFullscreen = () => {
      if (isFullscreen()) {
        setIsFullscreenState(true);
      } else {
        setIsFullscreenState(false);
      }
    };

    // Initial check
    checkFullscreen();

    // Listen to resize and fullscreen changes
    window.addEventListener("resize", checkFullscreen);
    document.addEventListener("fullscreenchange", checkFullscreen);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkFullscreen);
      document.removeEventListener("fullscreenchange", checkFullscreen);
    };
  }, []);
  // ERROR HANDLING
  useEffect(() => {
    if (gameError) {
      const status = (gameError as any)?.response?.status;

      if (status === 403) {
        setShowModal("notEnoughTries");
      } else {
        setShowModal("error");
      }
      setTrainingGameStarted(false); // prevent UI from progressing if error occurs
    }
  }, [gameError]);

  // CASUAL GAME

  const handleStartCasualGame = async (
    numQuestions: number,
    category: string,
    gamemode: string
  ) => {
    if (!user || user.tries_left <= 0) {
      setShowModal("notEnoughTries");
      return;
    }
    setCasualGameLoading(true);
    setCasualGameError(null);
    try {
      const res = await request(
        `games/casual/start?num_questions=${numQuestions}&category=${category}&gamemode=${gamemode}`,
        "POST"
      );
      setCasualGame({
        match_id: res.data.match_id,
        current_question: res.data.current_question,
      });
      setCasualGameStarted(true);
      setShowCasualFilter(false);
    } catch (err: any) {
      setCasualGameError(err?.response?.data?.message || "Unknown error");
    } finally {
      setCasualGameLoading(false);
    }
  };

  const handleCasualAnswer = async (answer: string) => {
    if (!casualGame || isAwaiting) return; // prevent double-click
    setIsAwaiting(true);
    setSelectedOption(answer);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await request(
        `games/casual/match/${casualGame.match_id}/answer`,
        "POST",
        { answer }
      );

      setIsCorrect(res.data.correct);
      setCorrectAnswer(res.data.correct_answer);
      setTimeout(async () => {
        setSelectedOption(null);
        setIsCorrect(null);
        setIsAwaiting(false); // allow next answer

        if (res.data.finished) {
          const summary = await fetchCasualSummary(casualGame.match_id);
          setCasualSummary(summary);
          setCasualGame(null);
          setCasualGameStarted(false);
          setTypedAnswer("");
          refetchUser();
        } else {
          setCasualGame({
            match_id: casualGame.match_id,
            current_question: res.data.current_question,
          });
          setTypedAnswer("");
        }
      }, 1250);
    } catch (err) {
      console.error("Answer error", err);
      setIsAwaiting(false);
    }
  };
  const expiredSubmittedRef = useRef(false);

  const handleSubmitCasualMatch = async () => {
    try {
      if (casualGame) {
        await request(
          `games/casual/match/${casualGame?.match_id}/submit`,
          "POST"
        );
        const summary = await fetchCasualSummary(casualGame.match_id);
        setCasualSummary(summary);
        setCasualGame(null);
        setCasualGameStarted(false);
        setTypedAnswer("");
        refetchUser();
      } else {
        return null;
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    expiredSubmittedRef.current = false; // reset when new question arrives
    if (casualGameStarted && casualGame) {
      setTimeLeft(15);
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            if (!expiredSubmittedRef.current) {
              expiredSubmittedRef.current = true;
              handleCasualAnswer("Time expired");
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [casualGameStarted, casualGame]);

  const fetchCasualSummary = async (matchId: string) => {
    try {
      const res = await request(`games/casual/match/${matchId}/summary`, "GET");
      return res.data;
    } catch (err) {
      console.error("Summary error", err);
      return null;
    }
  };

  const openCommunity = () => {
    window.open("https://t.me/guessflags", "_blank");
  };

  // RENDER (PAGINATION)

  const renderPage = () => {
    switch (page) {
      case "home":
        return renderHomeScreen();
      case "profile":
        return renderProfileScreen();
      case "leaderboard":
        return renderLeaderboardScreen();
      case "tournaments":
        return renderTournamentsScreen();
      default:
        return renderHomeScreen();
    }
  };

  const headerStyleFullscreen =
    "relative min-w-screen min-h-36 md:min-h-24 border-b-1 border-grey-2 bg-background top-0 flex flex-col justify-center items-center";
  const headerStyle =
    "relative min-w-screen min-h-18 border-b-1 border-grey-2 bg-background top-0 flex flex-row justify-between items-center";

  const renderHomeScreen = () => (
    <div className="min-h-screen h-50 overflow-auto pb-20">
      <Header
        isFullscreen={isFullscreenState}
        headerStyle={headerStyle}
        headerStyleFullscreen={headerStyleFullscreen}
        title="Home"
      >
        <p className="bg-primary border-0 rounded-2xl py-1.5 px-3 text-xs">
          Tries left: {user?.tries_left}
        </p>
      </Header>
      <div className="flex flex-col justify-center items-center w-full px-4 py-6 flex-grow content-center">
        <div className="mb-12">
          <h1 className="text-xs font-semibold text-center mb-6">
            {user?.name}, welcome to <br />
            <span className="text-3xl font-bold">GuessFlags</span>
          </h1>
          <img
            src="/placeholder.png"
            className="mx-auto w-77 object-contain rounded-lg"
            alt="Guess Flags"
          />
        </div>
        <div className="flex flex-col items-center gap-3 mb-6 w-90">
          <button
            type="button"
            disabled={!!casualGame}
            className={`btn-regular btn-big btn-click-animation`}
            onClick={() => setShowCasualFilter(true)}
          >
            Casual
          </button>
          <button
            type="button"
            className={`btn-regular btn-big btn-click-animation`}
            onClick={() => setShowTrainingFilter(true)}
          >
            Training
          </button>
          <button
            onClick={() => setShowModal("error")}
            type="button"
            className={`btn-regular btn-big btn-click-animation`}
          >
            Rating
          </button>
          <button
            type="button"
            className={`btn-regular btn-big btn-click-animation`}
            onClick={openCommunity}
          >
            Community
          </button>
          <p className="text-xs text-gray-500 select-none mt-4">Early access</p>
        </div>
      </div>

      {/* Modals */}
      {showModal === "notEnoughTries" && (
        <BottomModal
          title="Not enough tries!"
          text="Unfortunately you have run out of tries. You can buy more or wait 24 hours."
          actionLabel="Buy tries"
          onAction={() => {
            setShowBuyTries(true);
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}

      {showModal === "error" && (
        <BottomModal
          title="Error 404"
          text="Unfortunately this feature isn't available yet!"
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );

  if (!user) return null;

  const renderProfileScreen = () => {
    return (
      <Profile
        user={user}
        isFullscreen={isFullscreenState}
        headerStyle={headerStyle}
        headerStyleFullscreen={headerStyleFullscreen}
      />
    );
  };

  const renderTournamentsScreen = () => {
    return (
      <Tournaments
        isFullscreen={isFullscreenState}
        headerStyle={headerStyle}
        headerStyleFullscreen={headerStyleFullscreen}
      />
    );
  };

  const renderLeaderboardScreen = () => {
    return (
      <Leaderboard
        leaders={data?.leaders}
        today_leaders={data?.today_leaders}
        user={user}
        userRank={data?.userRank}
        userTodayRank={data?.userTodayRank}
        isFullscreen={isFullscreenState}
        headerStyle={headerStyle}
        headerStyleFullscreen={headerStyleFullscreen}
      />
    );
  };

  // RENDER: Start Screen
  const renderStartScreen = () => (
    <div>
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

  // RENDER: Game Screenr
  const renderTrainingGameScreen = () => {
    const question = game?.questions[currentQuestionIndex];
    if (!question) return null;
    return (
      <div className="min-h-screen w-full h-50 overflow-auto py-6 content-center">
        <div className="flex flex-col items-center justify-center text-white px-4">
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
            <div className="flex flex-col gap-2 w-90 justify-center items-center">
              {question.options.map((opt: string, idx: number) => {
                const isCorrectAnswer = opt === question.answer;
                const isSelected = selectedOption === opt;

                let btnClass = `btn-big bg-primary/10`;
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
                    onClick={() => handleTrainingAnswer(opt)}
                    className={`btn-click-animation rounded-md btn-big ${btnClass}`}
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
      px-4 py-3 rounded-lg w-full transition-all bg-primary/10
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
                onClick={() => handleTrainingAnswer(typedAnswer.trim())}
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
      btn-click-animation
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
      </div>
    );
  };

  if (casualGame) {
    backButton.onClick(() => setShowExitModal(true));
  }

  const renderCasualGameScreen = () => {
    if (!casualGame) return null;

    const question = casualGame.current_question;
    if (!question) return null;
    backButton.show();
    return (
      <div className="min-h-screen w-full h-50 overflow-auto py-6 content-center">
        <div className="flex flex-col items-center justify-center text-white px-4">
          <h2 className="text-2xl font-bold mb-4">
            Question {question.index + 1}
          </h2>
          <p className="text-lg mb-4">Time left: {timeLeft ?? "--"}s</p>

          <div className="w-44 h-22 flex flex-col items-center justify-center my-12">
            <img
              src={question.image}
              alt="Flag"
              className="w-120 h-67.5 object-contain py-12"
            />
          </div>
          {question.mode === "choose" && (
            <div className="flex flex-col justify-center items-center gap-2 w-full">
              {question.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;

                let btnClass = `bg-primary/10`;

                if (selectedOption && isCorrect !== null) {
                  if (isSelected) {
                    btnClass = isCorrect ? "bg-green-600" : "bg-red-600";
                  } else if (
                    !isCorrect &&
                    opt.toLowerCase() === correctAnswer
                  ) {
                    btnClass = "bg-green-600";
                  } else {
                    btnClass = "bg-primary/10";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={!!selectedOption}
                    onClick={() => handleCasualAnswer(opt)}
                    className={`btn-click-animation py-4 px-2 rounded-md w-90 ${btnClass}`}
                  >
                    {opt}
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
                disabled={!!selectedOption}
                className={`
    px-4 py-3 rounded-lg w-full transition-all bg-primary/10
    ${
      selectedOption
        ? isCorrect
          ? "border-green-500 bg-green-100 text-black"
          : "text-black"
        : "border-gray-300"
    }
  `}
                placeholder="Type your answer..."
              />

              <button
                onClick={() => handleCasualAnswer(typedAnswer.trim())}
                disabled={!!selectedOption || !typedAnswer.trim()}
                className={`
    font-medium rounded-lg text-sm px-6 py-3 text-center transition-all
    ${
      selectedOption && isCorrect !== null
        ? isCorrect
          ? "bg-green-600 hover:bg-green-700"
          : "bg-red-600 hover:bg-red-700"
        : "bg-primary hover:bg-blue-700"
    }
    btn-click-animation
  `}
              >
                {isCorrect !== null
                  ? isCorrect
                    ? "✅ Correct!"
                    : `❌ Right answer: ${
                        correctAnswer
                          ? correctAnswer.charAt(0).toUpperCase() +
                            correctAnswer.slice(1)
                          : ""
                      }`
                  : "Submit"}
              </button>
            </div>
          )}
        </div>
        {showExitModal && (
          <BottomModal
            title="Are you sure you want to exit?"
            text="The game will be submitted and finished!"
            actionLabel="Submit match & exit"
            onAction={() => {
              handleSubmitCasualMatch();
              setShowExitModal(false);
            }}
            onClose={() => setShowExitModal(false)}
          />
        )}
      </div>
    );
  };

  const renderCasualGameOverScreen = () => {
    if (!casualSummary) return null;

    backButton.hide();

    return (
      <div className="flex flex-col items-center justify-center h-screen text-white px-4">
        <h2 className="text-2xl font-bold mb-4">Casual Game Over!</h2>
        <p className="text-lg mb-2">
          Your score: {casualSummary.score} / {casualSummary.num_questions}
        </p>
        <div className="max-w-md text-left">
          <h3 className="font-semibold mb-2">Summary of answers:</h3>
          <ul className="list-disc pl-5 space-y-2">
            {casualSummary.answers.map((ans: any, idx: number) => (
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
        <button
          onClick={() => {
            setCasualSummary(null);
            setCasualGame(null);
            setCasualGameStarted(false);
            refetchUser();
          }}
          className="mt-6 bg-primary/10 backdrop-blur-2xl px-4 py-2 rounded"
        >
          Back to Home
        </button>
      </div>
    );
  };

  // RENDER: Game Over Screen
  const renderTrainingGameOverScreen = () => (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
      <p className="text-lg">
        Your score: {score} / {game?.questions.length}
      </p>
      <button
        onClick={() => {
          if (trainingGameStarted) {
            setTrainingGameStarted(false);
          }

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
          Playing in this mode have only affected casual score. Anyway rating is
          in development, so stay tuned.
        </p>
      </div>
    </div>
  );

  // RETURN LOGIC
  if (isUserLoading || isLeadersLoading) {
    return <LoadingSpinner />;
  }

  if (
    isGameLoading ||
    isGameFetching ||
    isActiveCasualLoading ||
    casualGameLoading
  ) {
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

  {
    (gameError || activeCasualError || casualGameError) && (
      <BottomModal
        title="Error!"
        text={
          gameError instanceof Error
            ? gameError.message
            : activeCasualError instanceof Error
            ? activeCasualError.message
            : casualGameError
            ? casualGameError
            : "Unknown error"
        }
        onClose={() => setShowModal(false)}
      />
    );
  }

  if (showTrainingFilter) {
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
          <PreGame
            onStart={handleStartTrainingGame}
            onBack={() => {
              setShowTrainingFilter(false);
              refetchUser();
              backButton.hide();
            }}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (showCasualFilter) {
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
          <PreGame
            onStart={handleStartCasualGame}
            onBack={() => {
              setShowCasualFilter(false);
              refetchUser();
              backButton.hide();
            }}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (
    trainingGameStarted &&
    game &&
    currentQuestionIndex >= game.questions.length
  ) {
    return renderTrainingGameOverScreen();
  }

  if (trainingGameStarted && game) {
    return renderTrainingGameScreen();
  }

  if (casualGameStarted && casualGame) {
    return renderCasualGameScreen();
  }

  if (casualSummary) {
    return renderCasualGameOverScreen();
  }

  return renderStartScreen();
};

export default MainWrapper;
