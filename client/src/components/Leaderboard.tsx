import { useState, useEffect, useRef } from "react";
import ToggleSwitch from "./ToggleSwitch";
type LeaderboardProps = {
  leaders: {
    [id: string]: {
      name: string;
      casual_score: number;
    };
  };
  user: {
    id: number;
    created_at: DataTransfer;
    name: string;
    tries_left: number;
    rating: number;
    games_played: number;
    games_won: number;
    total_score: number;
    best_score: number;
    casual_score: number;
  };
  userRank: number;
};
export default function Leaderboard({
  leaders,
  user,
  userRank,
}: LeaderboardProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [isUserVisible, setIsUserVisible] = useState(true);
  const [ratingType, setRatingType] = useState<"global" | "daily">("global");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsUserVisible(entry.isIntersecting),
      { root: listRef.current, threshold: 0.1 }
    );

    const userRow = document.getElementById(`leader-${user.id}`);
    if (userRow && listRef.current) {
      observer.observe(userRow);
    }

    return () => observer.disconnect();
  }, [leaders, user.id]);

  // Sort entries descending by casual_score
  const entries = Object.entries(leaders).sort(
    (a, b) => b[1].casual_score - a[1].casual_score
  );
  const userIdStr = user.id.toString();
  const isUserInLeaders = entries.some(([id]) => id === userIdStr);
  console.log(leaders);

  return (
    <div className="flex flex-col items-center">
      <div id="upperPanel" className="w-max z-50 mb-6 mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-white">Leaderboard</h1>
        <p className="text-gray-300 max-w-xl mx-auto">
          It's never late to improve yourself!
        </p>
      </div>
      <ToggleSwitch value={ratingType} onChange={setRatingType} />
      {ratingType === "global" && (
        <div>
          <div className="w-full max-w-4xl h-[60vh] relative mx-auto">
            <div
              ref={listRef}
              className="overflow-y-auto h-full space-y-2 px-4 hide-scrollbar"
            >
              {entries.map(([id, data], index) => {
                const isCurrentUser = id === user.id.toString();
                return (
                  <div
                    key={id}
                    id={`leader-${id}`}
                    className={`w-full flex bg-grey/10 backdrop-blur justify-between gap-14 items-center rounded-xl px-5 py-2 border transition-colors duration-300 cursor-pointer ${
                      isCurrentUser
                        ? "bg-primary border-primary text-white shadow-lg"
                        : "bg-grey-2 border-grey hover:bg-gray-700 hover:border-gray-500"
                    }`}
                  >
                    <span className="text-base font-semibold truncate max-w-[75%]">
                      #{index + 1}{" "}
                      {data.name.length > 20
                        ? data.name.slice(0, 20) + "…"
                        : data.name}
                    </span>
                    <span
                      className={`font-bold text-base ${
                        isCurrentUser ? "text-white" : "text-primary"
                      }`}
                    >
                      {data.casual_score} pts
                    </span>
                  </div>
                );
              })}
              {!isUserInLeaders && (
                <div className="text-white text-xl mb-18 text-center">…</div>
              )}
            </div>

            {/* Sticky user row (shows if user row not visible) */}
            {(!isUserInLeaders || !isUserVisible) && (
              <div className="absolute bottom-0 left-0 right-0 bg-grey-2 shadow-inner rounded-xl border border-grey px-6 py-3 flex flex-col items-center mx-auto max-w-4xl">
                <div className="w-full flex justify-between items-center">
                  <p className="text-base font-semibold text-warning truncate max-w-[75%]">
                    #{userRank}
                  </p>
                  <span className="text-base font-semibold text-warning truncate max-w-[75%]">
                    You
                    {user.name.length > 20
                      ? ` (${user.name.slice(0, 20)}…)`
                      : ` (${user.name})`}
                  </span>
                  <span className="text-warning font-bold text-base">
                    {user.casual_score} pts
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
