import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import request from "../utils/api";
import type {
  ITournament,
  ITournamentParticipant,
} from "../interfaces/ITournament";
import { invoice } from "@telegram-apps/sdk";
import Header from "./Header";
import TournamentParticipantsModal from "./TournamentParticipantsModal";
import BottomModal from "./BottomModal";

type TournamentsProps = {
  isFullscreen: boolean;
  headerStyle: string;
  headerStyleFullscreen: string;
};

function Tournaments({
  isFullscreen,
  headerStyle,
  headerStyleFullscreen,
}: TournamentsProps) {
  const [infoModalMessage, setInfoModalMessage] = useState<string | null>(null);

  const {
    data: todayTournament,
    isLoading: isTodayTournamentLoading,
    isError: isTodayTournamentError,
  } = useQuery({
    queryKey: ["todayTournament"],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await request("tournaments/casual/everyday/today");
      return response.data;
    },
    select: (data) => data as ITournament,
  });

  const {
    data: tournaments,
    isLoading: isTournamentsLoading,
    isError: isTournamentsError,
  } = useQuery<ITournament[]>({
    queryKey: ["tournaments"],
    queryFn: async () => {
      const response = await request("tournaments/casual/everyday/all");
      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  const [selectedParticipants, setSelectedParticipants] = useState<
    ITournamentParticipant[] | null
  >(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);

  const handleParticipate = async (tournament_id: number) => {
    const response = await request(
      `tournaments/casual/everyday/${tournament_id}/participate`,
      "POST"
    );

    if (response.data.message === "You are already participating.") {
      setInfoModalMessage("You are already participating.");
    } else if (response.data.invoice_link) {
      invoice.open(response.data.invoice_link.replace("https://t.me/$", ""));
    } else if (response.data.message) {
      // Show any other success message returned
      setInfoModalMessage(response.data.message);
    } else {
      // Fallback generic message
      setInfoModalMessage("Participation successful!");
    }
  };

  const openParticipantsModal = (participants: ITournamentParticipant[]) => {
    setSelectedParticipants(participants);
    setShowParticipantsModal(true);
  };

  const dailyTournaments =
    tournaments?.filter((t) => t.type === "casual_daily") || [];
  const otherTournaments =
    tournaments?.filter((t) => t.type !== "casual_daily") || [];

  if (isTournamentsLoading || isTodayTournamentLoading)
    return <div>Loading...</div>;
  if (
    isTodayTournamentError ||
    isTournamentsError ||
    !todayTournament ||
    !tournaments
  )
    return <div>No active tournaments.</div>;

  return (
    <div className="min-h-screen overflow-auto pb-32">
      <Header
        isFullscreen={isFullscreen}
        headerStyle={headerStyle}
        headerStyleFullscreen={headerStyleFullscreen}
        title="Tournaments"
      />

      {dailyTournaments.length > 0 && (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4 text-green-400">
            Daily Tournament
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {dailyTournaments.map((tournament) => (
              <div
                key={tournament.tournament_id}
                className="bg-green-900 border border-green-600 rounded-xl p-4 shadow-md flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-lg font-semibold mb-2 text-green-300">
                    {tournament.tournament_name}
                  </h2>
                  <p className="text-sm text-green-200">
                    Created: {new Date(tournament.created_at).toLocaleString()}
                  </p>
                  {tournament.finished_at && (
                    <p className="text-sm text-green-200">
                      Finished:{" "}
                      {new Date(tournament.finished_at).toLocaleString()}
                    </p>
                  )}
                  <div className="mt-2">
                    <p className="text-sm font-medium">Prizes:</p>
                    {tournament.prizes.length > 0 ? (
                      <ul className="list-disc list-inside text-sm text-green-100">
                        {tournament.prizes.map((prize, index) => (
                          <li key={index}>
                            Place {prize.place}: {prize.type}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-green-300">No prizes listed</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => handleParticipate(tournament.tournament_id)}
                    className="bg-green-600 text-white font-semibold py-2 px-4 rounded hover:bg-green-500 transition"
                  >
                    Participate
                  </button>
                  <button
                    onClick={() =>
                      openParticipantsModal(tournament.participants)
                    }
                    className="bg-green-400 text-green-900 font-semibold py-2 px-4 rounded hover:bg-green-300 transition"
                  >
                    Show Participants
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {otherTournaments.length > 0 && (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Casual Tournaments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {otherTournaments.map((tournament) => (
              <div
                key={tournament.tournament_id}
                className="bg-background border border-gray-700 rounded-xl p-4 shadow-md flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-lg font-semibold mb-2">
                    {tournament.tournament_name}
                  </h2>
                  <p className="text-sm text-gray-400">
                    Created: {new Date(tournament.created_at).toLocaleString()}
                  </p>
                  {tournament.finished_at && (
                    <p className="text-sm text-gray-400">
                      Finished:{" "}
                      {new Date(tournament.finished_at).toLocaleString()}
                    </p>
                  )}
                  <div className="mt-2">
                    <p className="text-sm font-medium">Prizes:</p>
                    {tournament.prizes.length > 0 ? (
                      <ul className="list-disc list-inside text-sm text-gray-300">
                        {tournament.prizes.map((prize, index) => (
                          <li key={index}>
                            Place {prize.place}: {prize.type}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No prizes listed</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => handleParticipate(tournament.tournament_id)}
                    className="bg-primary text-white font-semibold py-2 px-4 rounded hover:bg-primary/80 transition"
                  >
                    Participate
                  </button>
                  <button
                    onClick={() =>
                      openParticipantsModal(tournament.participants)
                    }
                    className="bg-primary/80 text-white font-semibold py-2 px-4 rounded hover:bg-primary/60 transition"
                  >
                    Show Participants
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
}

export default Tournaments;
