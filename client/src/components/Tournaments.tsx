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

// Props
interface TournamentsProps {
  isFullscreen: boolean;
  headerStyle: string;
  headerStyleFullscreen: string;
  userId: number;
  setTournamentGame: (game: any) => void;
  setTournamentGameStarted: (val: boolean) => void;
}

const Tournaments = ({
  isFullscreen,
  headerStyle,
  headerStyleFullscreen,
  userId,
  setTournamentGame,
  setTournamentGameStarted,
}: TournamentsProps) => {
  const [infoModalMessage, setInfoModalMessage] = useState<string | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<
    ITournamentParticipant[] | null
  >(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [tournamentGameLoading, setTournamentGameLoading] =
    useState<boolean>(false);
  const [tournamentGameError, setTournamentGameError] = useState<string | null>(
    null
  );

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

  if (loadingAll) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <p>Loading tournaments...</p>
      </div>
    );
  }

  if (errorAll) {
    return (
      <div className="h-screen flex items-center justify-center text-red-400">
        <p>Failed to load tournaments data.</p>
      </div>
    );
  }

  if (errorAll) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-yellow-300">
        <p>Failed to load full tournaments list.</p>
        <p className="text-sm text-gray-400">
          You may still join today's tournament below.
        </p>
      </div>
    );
  }

  if (!tournaments) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <p>No active tournaments available.</p>
      </div>
    );
  }

  const handleParticipate = async (id: number) => {
    const response = await request(`tournaments/${id}/participate`, "POST");
    const msg = response.data.message;
    if (msg === "You are already participating.") setInfoModalMessage(msg);
    else if (response.data.invoice_link)
      invoice.open(response.data.invoice_link.replace("https://t.me/$", ""));
    else setInfoModalMessage(msg || "Participation successful!");
    refetchAll();
  };

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
      backButton.show();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || "Unknown error";
      if (errorMsg === "No tries left in this tournament.") {
        setInfoModalMessage("You've used all your tries for this tournament.");
      } else {
        setTournamentGameError(errorMsg);
      }
    } finally {
      setTournamentGameLoading(false);
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
            className={`text-lg font-semibold relative mb-1 ${
              isDaily ? "text-green-300" : "text-white"
            }`}
          >
            {tournament.tournament_name}{" "}
            <span
              className={`absolute top-0 right-0 text-xs px-2 py-1 rounded-md shadow-md ${
                tournament.participation_cost === 0
                  ? "bg-green-500 text-white"
                  : "bg-yellow-400 text-black flex items-center gap-1"
              }`}
              title={
                tournament.participation_cost === 0
                  ? "Free to join"
                  : "Participation cost"
              }
            >
              {tournament.participation_cost === 0 ? (
                "FREE"
              ) : (
                <>
                  {tournament.participation_cost}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                  </svg>
                </>
              )}
            </span>
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
            <div>
              {tournament.gamemode.charAt(0).toUpperCase() +
                tournament.gamemode.slice(1)}
            </div>

            {tournament.category && (
              <>
                <div className="font-semibold">Category</div>
                <div>
                  {tournament.category.charAt(0).toUpperCase() +
                    tournament.category.slice(1)}
                </div>
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
                      <strong>Place {prize.place}</strong>:
                      {prize.type.toLowerCase() === "stars" && prize.amount ? (
                        <span className="inline-flex items-center gap-1 ml-1">
                          {prize.amount}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 fill-current text-yellow-300"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                          </svg>
                        </span>
                      ) : prize.type.toLowerCase() === "nft" && prize.link ? (
                        <span className="ml-1">
                          NFT -{" "}
                          <a
                            href={prize.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-blue-300 hover:text-blue-400"
                          >
                            View NFT
                          </a>
                        </span>
                      ) : prize.type.toLowerCase() === "ton" && prize.amount ? (
                        <span className="inline-flex items-center gap-1 ml-1">
                          {prize.amount}
                          <img
                            src="/ton.svg"
                            alt="TON"
                            className="w-4 h-4 inline-block"
                          />
                        </span>
                      ) : (
                        <span className="ml-1">?</span>
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

  return (
    <div className="h-screen overflow-auto pb-32">
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
