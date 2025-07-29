import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import request from "../utils/api";
import type {
  ITournament,
  ITournamentParticipant,
  ITournamentPrize,
} from "../interfaces/ITournament";
import { backButton, invoice } from "@telegram-apps/sdk";
import Header from "./Header";
import TournamentParticipantsModal from "./TournamentParticipantsModal";
import BottomModal from "./BottomModal";
import { FaCrown } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import GiftPreview from "./GiftPreview"; // Make sure the path is correct

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
  const [tournamentGameLoading, setTournamentGameLoading] = useState(false);
  const [tournamentGameError, setTournamentGameError] = useState<string | null>(
    null
  );
  const { t } = useTranslation();

  const {
    data: tournaments,
    isLoading: loadingAll,
    isError: errorAll,
    refetch,
  } = useQuery<ITournament[]>({
    queryKey: ["tournaments"],
    queryFn: async () => (await request("tournaments/all")).data,
    refetchOnWindowFocus: false,
  });

  const handleParticipate = async (id: number) => {
    const response = await request(`tournaments/${id}/participate`, "POST");
    const msg = response.data.message;
    if (msg === "You are already participating.")
      setInfoModalMessage(t("already_joined"));
    else if (response.data.invoice_link)
      invoice.open(response.data.invoice_link.replace("https://t.me/$", ""));
    else setInfoModalMessage(t("participation_successful"));
    refetch();
  };

  const handleStartTournamentGame = async (tournamentId: number) => {
    setTournamentGameLoading(true);
    setTournamentGameError(null);
    try {
      const res = await request(`tournaments/${tournamentId}/start`, "POST");
      setTournamentGame({
        match_id: res.data.match_id,
        num_questions: res.data.num_questions,
        current_question: res.data.current_question,
      });
      setTournamentGameStarted(true);
      backButton.show();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || "Unknown error";
      if (errorMsg === "No tries left in this tournament.") {
        setInfoModalMessage(t("no_tries"));
      } else {
        setTournamentGameError(errorMsg);
      }
    } finally {
      setTournamentGameLoading(false);
    }
  };

  const hasUserParticipated = (t: ITournament) =>
    t.participants.some((p) => p.user_id === userId);

  const openParticipantsModal = (list: ITournamentParticipant[]) => {
    setSelectedParticipants(list);
    setShowParticipantsModal(true);
  };

  const getCountdown = (endTime: string) => {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return t("finished");
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);
    return t("ends_in", { days, hours, minutes });
  };

  if (tournamentGameLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <p>{t("loading")}</p>
      </div>
    );
  }

  if (tournamentGameError) {
    return (
      <div className="h-screen flex items-center justify-center text-red-400">
        <p>{t("error_loading")}</p>
      </div>
    );
  }

  if (loadingAll) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <p>{t("loading")}</p>
      </div>
    );
  }

  if (errorAll) {
    return (
      <div className="h-screen flex items-center justify-center text-red-400">
        <p>{t("error_loading")}</p>
      </div>
    );
  }

  if (!tournaments || tournaments.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <p>{t("no_tournaments")}</p>
      </div>
    );
  }

  const TournamentCard = ({ tournament }: { tournament: ITournament }) => {
    const isDaily = tournament.type === "casual_daily";
    return (
      <div
        className={`${
          isDaily ? "bg-green-900 text-green-100" : "bg-grey-2 text-white"
        } w-full max-w-sm rounded-xl p-4 shadow-md flex flex-col justify-between`}
      >
        <div>
          <h2 className="text-lg font-semibold relative mb-1">
            {tournament.tournament_name}{" "}
            <span
              className={`absolute top-0 right-0 text-xs px-2 py-1 rounded-md shadow-md ${
                tournament.participation_cost === 0
                  ? "bg-green-500 text-white"
                  : "bg-yellow-400 text-black flex items-center gap-1"
              }`}
              title={
                tournament.participation_cost === 0
                  ? t("free_to_join")
                  : t("participation_cost")
              }
            >
              {tournament.participation_cost === 0 ? (
                t("free")
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
            <p className="text-xs mb-1">
              {t("started")}: {new Date(tournament.started_at).toLocaleString()}
            </p>
          )}

          {tournament.will_finish_at && (
            <p className="text-xs mb-1">
              {getCountdown(tournament.will_finish_at)}
            </p>
          )}

          <div
            className={`grid grid-cols-2 gap-y-1 text-xs p-2 rounded mt-2 ${
              isDaily ? "bg-green-950" : "bg-grey-3"
            }`}
          >
            <div className="font-semibold">{t("tries")}</div>
            <div>{tournament.tries}</div>

            <div className="font-semibold">{t("questions")}</div>
            <div>{tournament.num_questions}</div>

            <div className="font-semibold">{t("gamemode")}</div>
            <div>{t(tournament.gamemode)}</div>

            {tournament.category && (
              <>
                <div className="font-semibold">{t("category")}</div>
                <div>{t(tournament.category)}</div>
              </>
            )}

            {tournament.tags.length > 0 && (
              <>
                <div className="font-semibold">{t("tags")}</div>
                <div>
                  {tournament.tags.map((tag, index) => (
                    <span key={index}>
                      {t(tag)}
                      {index < tournament.tags.length - 1 && ", "}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="mt-3 text-md">
            <p className="font-semibold mb-1">{t("prizes")}:</p>
            {tournament.prizes.length > 0 ? (
              <ul className="space-y-1">
                {tournament.prizes.map((prize, index) => {
                  const prizeAmount = prize.amount ?? prize.metadata?.amount;
                  return (
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
                      <span>
                        <strong>{t("place", { place: prize.place })}</strong>:
                        {prize.type.toLowerCase() === "stars" ? (
                          <span className="ml-1 inline-flex items-center gap-1">
                            <span>{prizeAmount}</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4 fill-yellow-400"
                              viewBox="0 0 20 20"
                              aria-hidden="true"
                            >
                              <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                            </svg>
                          </span>
                        ) : prize.type.toLowerCase() === "nft" && prize.link ? (
                          <span className="ml-1">
                            {t("nft")} -{" "}
                            <a
                              href={prize.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline text-blue-300 hover:text-blue-400"
                            >
                              {t("view_nft")}
                            </a>
                          </span>
                        ) : prize.type.toLowerCase() === "ton" ? (
                          <span className="inline-flex items-center gap-1 ml-1">
                            {prizeAmount}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 56 56"
                              className="w-5 h-5"
                            >
                              <circle cx="28" cy="28" r="28" fill="#0098EA" />
                              <path
                                d="M37.6,15.6H18.4c-3.5,0-5.7,3.8-4,6.9l11.8,20.5c0.8,1.3,2.7,1.3,3.5,0l11.8-20.5
        C43.3,19.4,41.1,15.6,37.6,15.6L37.6,15.6z M26.3,36.8l-2.6-5l-6.2-11.1c-0.4-0.7,0.1-1.6,1-1.6h7.8L26.3,36.8L26.3,36.8z
        M38.5,20.7l-6.2,11.1l-2.6,5V19.1h7.8C38.4,19.1,38.9,20,38.5,20.7z"
                                fill="#FFFFFF"
                              />
                            </svg>
                          </span>
                        ) : (
                          <span className="ml-1">{prize.title || "?"}</span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>{t("no_prizes")}</p>
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
            {hasUserParticipated(tournament)
              ? t("already_joined")
              : t("participate")}
          </button>

          {hasUserParticipated(tournament) &&
            tournament.started_at &&
            tournament.participants.length >= tournament.min_participants && (
              <button
                onClick={() =>
                  handleStartTournamentGame(tournament.tournament_id)
                }
                className="bg-yellow-400 text-white py-2 px-4 rounded-xl hover:bg-yellow-400 transition"
              >
                {t("play")}
              </button>
            )}

          <button
            onClick={() => openParticipantsModal(tournament.participants)}
            className={`py-2 px-4 rounded-xl transition ${
              isDaily ? "bg-green-600 text-white" : "bg-primary text-white"
            }`}
          >
            {t("show_participants")}
          </button>
        </div>
      </div>
    );
  };

  const dailyTournaments =
    tournaments?.filter((t) => t.type === "casual_daily") || [];
  const otherTournaments =
    tournaments?.filter((t) => t.type !== "casual_daily") || [];

  return (
    <div className="h-screen overflow-auto pb-32">
      <Header
        isFullscreen={isFullscreen}
        headerStyle={headerStyle}
        headerStyleFullscreen={headerStyleFullscreen}
        title={t("tournaments")}
      />

      <div className="p-4 space-y-8">
        {dailyTournaments.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-green-400 mb-4">
              {t("daily_tournaments")}
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
              {t("casual_tournaments")}
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
          title={t("info")}
          text={infoModalMessage}
          onClose={() => setInfoModalMessage(null)}
          actionLabel={t("close")}
        />
      )}

      {showParticipantsModal && selectedParticipants && (
        <TournamentParticipantsModal
          title={t("tournament_participants")}
          participants={selectedParticipants}
          onClose={() => setShowParticipantsModal(false)}
        />
      )}
    </div>
  );
};

export default Tournaments;
