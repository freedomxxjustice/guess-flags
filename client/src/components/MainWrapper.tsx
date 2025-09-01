import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import request from "../utils/api";
import type { IUser } from "../interfaces/IUser";
import type { ITrainingGame } from "../interfaces/ITrainingGame";
import type { IGame } from "../interfaces/IGame";
import BottomMenu from "./BottomMenu";
import BuyTries from "./BuyTries";
import Leaderboard from "./Leaderboard";
import Profile from "./Profile";
// import PreGame from "./PreGame";
import PreTrainingGame from "./PreTrainingGame";
import PreCasualGame from "./PreCasualGame";
import { backButton, isFullscreen } from "@telegram-apps/sdk";
import LoadingSpinner from "./LoadingSpinner";
import * as fuzzball from "fuzzball";
import { AnimatePresence, motion } from "framer-motion";
// import Tournaments from "./Tournaments";
import BottomModal from "./BottomModal";
import GameScreen from "./GameScreen";
import GameOverScreen from "./GameOverScreen";
import { useTranslation } from "react-i18next";
import HomeScreen from "./HomeScreen";

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
  const [selectedTags, setSelectedTags] = useState<string[] | null>(null);
  // CASUAL GAME STATES
  const [casualGameStarted, setCasualGameStarted] = useState(false);
  const [casualGame, setCasualGame] = useState<IGame | null>(null);
  const [casualGameLoading, setCasualGameLoading] = useState(false);
  const [casualGameError, setCasualGameError] = useState<string | null>(null);
  const [casualSummary, setCasualSummary] = useState<any | null>(null);
  const [isAwaiting, setIsAwaiting] = useState(false);
  // TOURNAMENT GAME STATES
  const [tournamentGameStarted, setTournamentGameStarted] = useState(false);
  const [tournamentGame, setTournamentGame] = useState<IGame | null>(null);
  const [tournamentSummary, setTournamentSummary] = useState<any>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // TIMER
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiredRef = useRef(false);

  // UI
  const [isFullscreenState, setIsFullscreenState] = useState<boolean>(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const { t } = useTranslation();

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
  } = useQuery<IGame | null>({
    queryKey: ["casual", "active-match"],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      try {
        const res = await request("games/match/active");
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
    queryKey: [
      "game",
      numQuestions,
      selectedCategory,
      selectedGamemode,
      selectedTags,
    ],
    queryFn: async () => {
      let tagQuery = "";
      if (selectedTags !== null) {
        tagQuery =
          selectedTags.length > 0 ? `&tags=${selectedTags.join(",")}` : "";
      }

      return (
        await request(
          `games/training/create?num_questions=${numQuestions}&category=${selectedCategory}&gamemode=${selectedGamemode}${tagQuery}`
        )
      ).data.game;
    },
    enabled: trainingGameStarted,
    retry: false,
  });

  useEffect(() => {
    if (casualGameStarted && casualGame) {
      backButton.show();
      backButton.onClick(() => setShowExitModal(true));
    }
  }, [casualGameStarted, casualGame]);

  useEffect(() => {
    if (tournamentGameStarted && tournamentGame) {
      backButton.show();
      backButton.onClick(() => setShowExitModal(true));
    }
  }, [tournamentGameStarted, tournamentGame]);

  useEffect(() => {
    if (casualSummary) backButton.hide();
  }, [casualSummary]);

  useEffect(() => {
    if (
      trainingGameStarted &&
      game &&
      currentQuestionIndex >= game.questions.length
    ) {
      request("games/training/submit-score", "POST", {
        score,
        numQuestions,
      }).catch(console.error);
    }
  }, [trainingGameStarted, currentQuestionIndex, game, score]);

  const handleStartTrainingGame = (
    numQuestions: number,
    category: string,
    gamemode: string,
    tags: string[]
  ) => {
    setNumQuestions(numQuestions);
    setSelectedCategory(category);
    setSelectedGamemode(gamemode);
    setSelectedTags(tags);
    setShowTrainingFilter(false);
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
        num_questions: res.data.num_questions,
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
    if (!casualGame || isAwaiting) return;
    setSelectedOption(answer);
    setIsAwaiting(true);
    setHasSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await request(
        `games/match/${casualGame.match_id}/answer`,
        "POST",
        { answer }
      );

      setIsCorrect(res.data.correct);
      setCorrectAnswer(res.data.correct_answer);
      setTimeout(async () => {
        setIsCorrect(null);
        setHasSubmitted(false);
        setIsAwaiting(false);
        setTypedAnswer("");
        setSelectedOption(null);

        if (res.data.finished) {
          const summary = await fetchCasualSummary(casualGame.match_id);
          setCasualSummary(summary);
          setCasualGame(null);
          setCasualGameStarted(false);
          refetchUser();
        } else {
          setCasualGame({
            match_id: casualGame.match_id,
            num_questions: casualGame.num_questions,
            current_question: res.data.current_question,
          });
        }
      }, 1250);
    } catch (err) {
      console.error("Answer error", err);
      setIsAwaiting(false);
      setHasSubmitted(false);
    }
  };

  const handleSubmitCasualMatch = async () => {
    try {
      if (casualGame) {
        await request(`games/match/${casualGame?.match_id}/submit`, "POST");
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
    expiredRef.current = false;

    const isGameActive =
      (casualGameStarted && casualGame) ||
      (tournamentGameStarted && tournamentGame);

    if (isGameActive) {
      setTimeLeft(15);
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            if (!expiredRef.current) {
              expiredRef.current = true;

              if (casualGameStarted && casualGame) {
                handleCasualAnswer("Time expired");
              } else if (tournamentGameStarted && tournamentGame) {
                handleTournamentAnswer("Time expired");
              }
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
  }, [casualGameStarted, casualGame, tournamentGameStarted, tournamentGame]);

  const fetchCasualSummary = async (matchId: string) => {
    try {
      const res = await request(`games/match/${matchId}/summary`, "GET");
      return res.data;
    } catch (err) {
      console.error("Summary error", err);
      return null;
    }
  };

  // TOURNAMENTS

  const handleTournamentAnswer = async (answer: string) => {
    if (!tournamentGame || isAwaiting) return;
    setSelectedOption(answer);
    setIsAwaiting(true);
    setHasSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await request(
        `games/match/${tournamentGame.match_id}/answer`,
        "POST",
        { answer }
      );

      setIsCorrect(res.data.correct);
      setCorrectAnswer(res.data.correct_answer);

      setTimeout(async () => {
        setIsCorrect(null);
        setHasSubmitted(false);
        setIsAwaiting(false);
        setTypedAnswer("");
        setSelectedOption(null);
        if (res.data.finished) {
          const summary = await fetchTournamentSummary(tournamentGame.match_id);
          setTournamentSummary(summary);
          setTournamentGame(null);
          setTournamentGameStarted(false);
          refetchUser();
        } else {
          setTournamentGame({
            match_id: tournamentGame.match_id,
            num_questions: tournamentGame.num_questions,
            current_question: res.data.current_question,
          });
        }
      }, 1250);
    } catch (err) {
      console.error("Answer error", err);
      setIsAwaiting(false);
      setHasSubmitted(false);
    }
  };

  const handleSubmitTournamentMatch = async () => {
    try {
      if (tournamentGame) {
        await request(`games/match/${tournamentGame?.match_id}/submit`, "POST");
        const summary = await fetchTournamentSummary(tournamentGame.match_id);
        setTournamentSummary(summary);
        setTournamentGame(null);
        setTournamentGameStarted(false);
        setTypedAnswer("");
        refetchUser();
      } else {
        return null;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTournamentSummary = async (matchId: string) => {
    try {
      const res = await request(`games/match/${matchId}/summary`, "GET");
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
      // case "tournaments":
      //   return renderTournamentsScreen();
      default:
        return renderHomeScreen();
    }
  };

  const headerStyleFullscreen =
    "relative min-w-screen min-h-36 md:min-h-24 border-b-1 border-grey-2 bg-background top-0 flex flex-col justify-center items-center";
  const headerStyle =
    "relative min-w-screen min-h-18 border-b-1 border-grey-2 bg-background top-0 flex flex-row justify-between items-center";

  const renderHomeScreen = () => {
    return (
      <HomeScreen
        user={user}
        showModal={showModal}
        setShowModal={setShowModal}
        setShowBuyTries={setShowBuyTries}
        setShowCasualFilter={setShowCasualFilter}
        setShowTrainingFilter={setShowTrainingFilter}
        openCommunity={openCommunity}
        isFullscreenState={isFullscreenState}
        headerStyle={headerStyle}
        headerStyleFullscreen={headerStyleFullscreen}
      />
    );
  };

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

  // const renderTournamentsScreen = () => {
  //   return (
  //     <Tournaments
  //       isFullscreen={isFullscreenState}
  //       headerStyle={headerStyle}
  //       headerStyleFullscreen={headerStyleFullscreen}
  //       userId={user.id}
  //       setTournamentGame={setTournamentGame}
  //       setTournamentGameStarted={setTournamentGameStarted}
  //     />
  //   );
  // };

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
            // buttons
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
                  } else {
                    btnClass = "bg-primary/10";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={!!selectedOption}
                    onClick={() => handleTrainingAnswer(opt)}
                    className={`btn rounded-md  ${btnClass}`}
                  >
                    {t(opt)}
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
                placeholder={t("type_your_answer")}
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
      btn
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

  const renderCasualGameScreen = () => {
    return (
      <GameScreen
        game={casualGame}
        timeLeft={timeLeft}
        selectedOption={selectedOption}
        typedAnswer={typedAnswer}
        setTypedAnswer={setTypedAnswer}
        isCorrect={isCorrect}
        correctAnswer={correctAnswer}
        showExitModal={showExitModal}
        setShowExitModal={setShowExitModal}
        onAnswer={handleCasualAnswer}
        onSubmit={handleSubmitCasualMatch}
        hasSubmitted={hasSubmitted}
        setHasSubmitted={setHasSubmitted}
      />
    );
  };

  const renderCasualGameOverScreen = () => {
    return (
      <GameOverScreen
        title="Game Over!"
        score={casualSummary.score}
        baseScore={casualSummary.base_score}
        difficultyMultiplier={casualSummary.difficulty_multiplier}
        numQuestions={casualSummary.num_questions}
        answers={casualSummary.answers}
        onBack={() => {
          setCasualSummary(null);
          setCasualGame(null);
          setCasualGameStarted(false);
          refetchUser();
        }}
      />
    );
  };

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
          Playing in this mode haven't affected anything! But you did good!
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
          <PreTrainingGame
            onStart={handleStartTrainingGame}
            onBack={() => {
              setShowTrainingFilter(false);
              refetchUser();
              backButton.hide();
            }}
            isFullscreen={isFullscreenState}
            headerStyle={headerStyle}
            headerStyleFullscreen={headerStyleFullscreen}
            note={t("training_note")}
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
          <PreCasualGame
            onStart={handleStartCasualGame}
            onBack={() => {
              setShowCasualFilter(false);
              refetchUser();
              backButton.hide();
            }}
            isFullscreen={isFullscreenState}
            headerStyle={headerStyle}
            headerStyleFullscreen={headerStyleFullscreen}
            note={t("casual_note")}
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

  if (tournamentGameStarted && tournamentGame) {
    return (
      <GameScreen
        game={tournamentGame}
        timeLeft={timeLeft}
        selectedOption={selectedOption}
        typedAnswer={typedAnswer}
        setTypedAnswer={setTypedAnswer}
        isCorrect={isCorrect}
        correctAnswer={correctAnswer}
        showExitModal={showExitModal}
        setShowExitModal={setShowExitModal}
        onAnswer={handleTournamentAnswer}
        onSubmit={handleSubmitTournamentMatch}
        hasSubmitted={hasSubmitted}
        setHasSubmitted={setHasSubmitted}
      />
    );
  }

  if (tournamentSummary) {
    return (
      <GameOverScreen
        title="Game Over!"
        score={tournamentSummary.score}
        baseScore={tournamentSummary.base_score}
        difficultyMultiplier={tournamentSummary.difficulty_multiplier}
        numQuestions={tournamentSummary.num_questions}
        answers={tournamentSummary.answers}
        onBack={() => {
          setTournamentSummary(null);
        }}
      />
    );
  }

  return renderStartScreen();
};

export default MainWrapper;
