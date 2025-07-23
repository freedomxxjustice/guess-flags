import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import request from "../utils/api";
import type {
  ITournament,
  ITournamentParticipant,
} from "../interfaces/ITournament";
import { backButton, invoice } from "@telegram-apps/sdk";
import Header from "./Header";
import TournamentParticipantsModal from "./TournamentParticipantsModal";
import BottomModal from "./BottomModal";
import { FaCrown } from "react-icons/fa";
import GameOverScreen from "./GameOverScreen";
import GameScreen from "./GameScreen";

// Props
interface TournamentsProps {
  isFullscreen: boolean;
  headerStyle: string;
  headerStyleFullscreen: string;
  userId: number;
}

const Tournaments = ({
  isFullscreen,
  headerStyle,
  headerStyleFullscreen,
  userId,
}: TournamentsProps) => {
  const [infoModalMessage, setInfoModalMessage] = useState<string | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<
    ITournamentParticipant[] | null
  >(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [tournamentGame, setTournamentGame] = useState<any>(null);
  const [tournamentGameStarted, setTournamentGameStarted] = useState(false);
  const [tournamentSummary, setTournamentSummary] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showExitModal, setShowExitModal] = useState(false);
  const [tournamentGameError, setTournamentGameError] = useState<string | null>(
    null
  );
  const [tournamentGameLoading, setTournamentGameLoading] =
    useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isAwaiting, setIsAwaiting] = useState(false);
  const expiredSubmittedRef = useRef(false);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);

  useEffect(() => {
    expiredSubmittedRef.current = false;

    if (tournamentGameStarted && tournamentGame) {
      setTimeLeft(15);
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null) return 15;
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            if (!expiredSubmittedRef.current) {
              expiredSubmittedRef.current = true;
              handleTournamentAnswer("Time expired");
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
  }, [tournamentGameStarted, tournamentGame]);

  const {
    data: todayTournament,
    isLoading: loadingToday,
    isError: errorToday,
    refetch: refetchToday,
  } = useQuery({
    queryKey: ["todayTournament"],
    queryFn: async () => (await request("tournaments/today")).data,
    select: (data) => data as ITournament,
    refetchOnWindowFocus: false,
  });

  const {
    data: tournaments,
    isLoading: loadingAll,
    isError: errorAll,
    refetch: refetchAll,
  } = useQuery<ITournament[]>({
    queryKey: ["tournaments"],
    queryFn: async () => (await request("tournaments/all")).data,
    refetchOnWindowFocus: false,
  });

  if (loadingToday || loadingAll) return <div>Loading...</div>;
  if (errorToday || errorAll || !todayTournament || !tournaments)
    return <div>No active tournaments.</div>;

  const handleParticipate = async (id: number) => {
    const response = await request(`tournaments/${id}/participate`, "POST");
    const msg = response.data.message;
    if (msg === "You are already participating.") setInfoModalMessage(msg);
    else if (response.data.invoice_link)
      invoice.open(response.data.invoice_link.replace("https://t.me/$", ""));
    else setInfoModalMessage(msg || "Participation successful!");
    refetchToday();
    refetchAll();
  };
  useEffect(() => {
    if (tournamentGameStarted && tournamentGame) {
      backButton.show();
      backButton.onClick(() => setShowExitModal(true));
    }
  }, [tournamentGameStarted, tournamentGame]);

  useEffect(() => {
    if (tournamentSummary) backButton.hide();
  }, [tournamentSummary]);

  const hasUserParticipated = (t: ITournament) =>
    t.participants.some((p) => p.user_id === userId);
  const openParticipantsModal = (list: ITournamentParticipant[]) => {
    setSelectedParticipants(list);
    setShowParticipantsModal(true);
  };

  const handleStartTournamentGame = async (tournamentId: number) => {
    setTournamentGameLoading(true);
    setTournamentGameError(null);

    try {
      const res = await request(`tournaments/${tournamentId}/start`, "POST");
      setTournamentGame({
        match_id: res.data.match_id,
        current_question: res.data.current_question,
      });
      setTournamentGameStarted(true);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || "Unknown error";

      // Show special modal or UI for tries error
      if (errorMsg === "No tries left in this tournament.") {
        setInfoModalMessage("You've used all your tries for this tournament.");
      } else {
        setTournamentGameError(errorMsg);
      }
    } finally {
      setTournamentGameLoading(false);
    }
  };

  const handleTournamentAnswer = async (answer: string) => {
    if (!tournamentGame || isAwaiting) return;
    setIsAwaiting(true);
    setSelectedOption(answer);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await request(
        `games/tournament/match/${tournamentGame.match_id}/answer`,
        "POST",
        { answer }
      );

      setIsCorrect(res.data.correct);
      setCorrectAnswer(res.data.correct_answer);

      setTimeout(async () => {
        setSelectedOption(null);
        setIsCorrect(null);
        setIsAwaiting(false);

        if (res.data.finished) {
          const summary = await fetchTournamentSummary(tournamentGame.match_id);
          setTournamentSummary(summary);
          setTournamentGame(null);
          setTournamentGameStarted(false);
          setTypedAnswer("");
        } else {
          setTournamentGame({
            match_id: tournamentGame.match_id,
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

  const handleSubmitTournamentMatch = async () => {
    try {
      if (tournamentGame) {
        await request(
          `games/casual/match/${tournamentGame?.match_id}/submit`,
          "POST"
        );
        const summary = await fetchTournamentSummary(tournamentGame.match_id);
        setTournamentSummary(summary);
        setTournamentGame(null);
        setTournamentGameStarted(false);
        setTypedAnswer("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTournamentSummary = async (matchId: string) => {
    try {
      const res = await request(
        `games/tournament/match/${matchId}/summary`,
        "GET"
      );
      return res.data;
    } catch (err) {
      console.error("Summary error", err);
      return null;
    }
  };

  const TournamentCard = ({ tournament }: { tournament: ITournament }) => {
    const isDaily = tournament.type === "casual_daily";

    const getCountdown = (endTime: string) => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) return "Finished";
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
      const days = Math.floor(diff / 1000 / 60 / 60 / 24);
      return `${days}d ${hours}h ${minutes}m left`;
    };

    return (
      <div
        className={`${
          isDaily ? "bg-green-900 text-green-100" : "bg-grey-2 text-white"
        } w-full max-w-sm rounded-xl p-4 shadow-md flex flex-col justify-between`}
      >
        <div>
          <h2
            className={`text-lg font-semibold mb-1 ${
              isDaily ? "text-green-300" : "text-white"
            }`}
          >
            {tournament.tournament_name}
          </h2>

          {tournament.started_at && (
            <p
              className={`text-xs mb-1 ${
                isDaily ? "text-green-300" : "text-grey"
              }`}
            >
              Started: {new Date(tournament.started_at).toLocaleString()}
            </p>
          )}

          {tournament.will_finish_at && (
            <p
              className={`text-xs mb-1 ${
                isDaily ? "text-green-300" : "text-grey"
              }`}
            >
              End: {getCountdown(tournament.will_finish_at)}
            </p>
          )}

          <div
            className={`grid grid-cols-2 gap-y-1 text-xs p-2 rounded mt-2 ${
              isDaily ? "bg-green-950" : "bg-grey-3"
            }`}
          >
            <div className="font-semibold">Tries</div>
            <div>{tournament.tries}</div>

            <div className="font-semibold">Questions</div>
            <div>{tournament.num_questions}</div>

            <div className="font-semibold">Gamemode</div>
            <div>{tournament.gamemode}</div>

            {tournament.category && (
              <>
                <div className="font-semibold">Category</div>
                <div>{tournament.category}</div>
              </>
            )}

            {tournament.tags.length > 0 && (
              <>
                <div className="font-semibold">Tags</div>
                <div>{tournament.tags.join(", ")}</div>
              </>
            )}
          </div>

          <div className="mt-3 text-xs">
            <p className="font-semibold mb-1">Prizes:</p>
            {tournament.prizes.length > 0 ? (
              <ul className="space-y-1">
                {tournament.prizes.map((prize, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {index < 3 && (
                      <FaCrown
                        className={`w-4 h-4 ${
                          index === 0
                            ? "text-yellow-400"
                            : index === 1
                            ? "text-gray-300"
                            : "text-amber-600"
                        }`}
                      />
                    )}
                    <span className={isDaily ? "text-green-200" : "text-white"}>
                      <strong>Place {prize.place}</strong>: {prize.type} -{" "}
                      {prize.type.toLowerCase() === "nft" && prize.link ? (
                        <a
                          href={prize.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-blue-300 hover:text-blue-400"
                        >
                          View NFT
                        </a>
                      ) : prize.amount ? (
                        <span>{prize.amount}</span>
                      ) : (
                        <span>?</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={isDaily ? "text-green-300" : "text-grey"}>
                No prizes listed
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <button
            disabled={hasUserParticipated(tournament)}
            onClick={() => handleParticipate(tournament.tournament_id)}
            className={`py-2 px-4 rounded-xl font-semibold transition ${
              hasUserParticipated(tournament)
                ? "bg-gray-500 cursor-not-allowed text-white"
                : isDaily
                ? "bg-green-600 text-white hover:bg-green-500"
                : "bg-primary text-white hover:bg-grey-3"
            }`}
          >
            {hasUserParticipated(tournament) ? "Already Joined" : "Participate"}
          </button>

          {hasUserParticipated(tournament) &&
            tournament.started_at &&
            tournament.participants.length >= tournament.min_participants && (
              <button
                onClick={() =>
                  handleStartTournamentGame(tournament.tournament_id)
                }
                className="bg-yellow-500 text-white py-2 px-4 rounded-xl hover:bg-yellow-400 transition"
              >
                Play
              </button>
            )}

          <button
            onClick={() => openParticipantsModal(tournament.participants)}
            className={`py-2 px-4 rounded-xl transition ${
              isDaily
                ? "bg-green-600 text-white hover:bg-green-500"
                : "bg-primary text-white hover:bg-grey-3"
            }`}
          >
            Show Participants
          </button>
        </div>
      </div>
    );
  };

  const dailyTournaments = tournaments.filter((t) => t.type === "casual_daily");
  const otherTournaments = tournaments.filter((t) => t.type !== "casual_daily");

  if (tournamentGameStarted && tournamentGame) {
    return (
      <GameScreen
        game={tournamentGame}
        timeLeft={timeLeft}
        selectedOption={selectedOption}
        typedAnswer={typedAnswer}
        setTypedAnswer={setTypedAnswer}
        isCorrect={isCorrect}
        correctAnswer={tournamentGame.current_question.correct_answer}
        showExitModal={showExitModal}
        setShowExitModal={setShowExitModal}
        onAnswer={handleTournamentAnswer}
        onSubmit={handleSubmitTournamentMatch}
      />
    );
  }

  if (tournamentSummary) {
    return (
      <GameOverScreen
        title="Tournament Finished!"
        score={tournamentSummary.score}
        numQuestions={tournamentSummary.num_questions}
        answers={tournamentSummary.answers}
        onBack={() => {
          setTournamentSummary(null);
          refetchToday();
          refetchAll();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <Header
        isFullscreen={isFullscreen}
        headerStyle={headerStyle}
        headerStyleFullscreen={headerStyleFullscreen}
        title="Tournaments"
      />

      <div className="p-4 space-y-8">
        {dailyTournaments.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-green-400 mb-4">
              Daily Tournaments
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {dailyTournaments.map((t) => (
                <TournamentCard key={t.tournament_id} tournament={t} />
              ))}
            </div>
          </section>
        )}

        {otherTournaments.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-green-100 mb-4">
              Casual Tournaments
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {otherTournaments.map((t) => (
                <TournamentCard key={t.tournament_id} tournament={t} />
              ))}
            </div>
          </section>
        )}
      </div>

      {infoModalMessage && (
        <BottomModal
          title="Info"
          text={infoModalMessage}
          onClose={() => setInfoModalMessage(null)}
          actionLabel="Close"
        />
      )}

      {showParticipantsModal && selectedParticipants && (
        <TournamentParticipantsModal
          title="Tournament Participants"
          participants={selectedParticipants}
          onClose={() => setShowParticipantsModal(false)}
        />
      )}
    </div>
  );
};

export default Tournaments;
