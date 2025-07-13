import React from "react";
import { useQuery } from "@tanstack/react-query";
import request from "../utils/api";
import type { ITournament } from "../interfaces/ITournament";
import { invoice } from "@telegram-apps/sdk";

function Tournaments() {
  const {
    data: todayTournament,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["todayTournament"],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await request("tournaments/casual/everyday/today");
      return response.data;
    },
    select: (data) => data as ITournament,
  });

  const handleParticipate = async (tournament_id: number) => {
    const response = await request(
      `tournaments/casual/everyday/${tournament_id}/participate`,
      "POST"
    );
    if (response.data.invoice_link) {
      invoice.open(response.data.invoice_link.replace("https://t.me/$", ""));
    }
    console.log(response);
  };

  const btnClickAnimation = "transform active:scale-95 transition-transform";
  const btnDisabled = "text-grey backdrop-blur bg-grey/10 text-xl";
  const btnRegular =
    "text-white bg-gradient-to-b from-primary to-primary/70 backdrop-blur rounded-3xl text-xl shadow-xl";
  const btnBig = "py-4 w-75";

  if (isLoading) return <div>Loading...</div>;
  if (isError || !todayTournament) return <div>No active tournament.</div>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>🎯 {todayTournament.name}</h2>
      <p>Created: {new Date(todayTournament.created_at).toLocaleString()}</p>

      <h3>🏆 Prizes</h3>
      {(todayTournament.prizes ?? []).length > 0 ? (
        (todayTournament.prizes ?? []).map((prize, index) => (
          <li key={index}>
            Place {prize.place}: {prize.type}
            {prize.amount ? ` (${prize.amount})` : ""}
            {prize.link ? (
              <>
                {" "}
                - <a href={prize.link}>View</a>
              </>
            ) : null}
          </li>
        ))
      ) : (
        <p>No prizes listed.</p>
      )}

      <h3>👥 Participants</h3>
      {(todayTournament.participants ?? []).length > 0 ? (
        <ul>
          {(todayTournament.participants ?? []).map((participant) => (
            <li key={participant.user_id}>
              {participant.username} — Score: {participant.score}{" "}
              {participant.place && `(Place ${participant.place})`}
              {participant.prize && (
                <>
                  {" "}
                  - Prize: {participant.prize.type}
                  {participant.prize.amount
                    ? ` (${participant.prize.amount})`
                    : ""}
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No participants yet.</p>
      )}
      <button
        className={`${btnRegular} p-3 text-xs ${btnClickAnimation}`}
        onClick={() => handleParticipate(todayTournament.tournament_id)}
      >
        Participate
      </button>
    </div>
  );
}

export default Tournaments;
