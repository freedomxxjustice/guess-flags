import { useState, useEffect, useRef } from "react";
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
};
export default function Leaderboard({ leaders, user }: LeaderboardProps) {
  const listRef = useRef(null);
  const [isUserVisible, setIsUserVisible] = useState(true);

  // Detect if user's actual row is visible in scroll container
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

  const entries = Object.entries(leaders);

  return (
    <div className="w-full flex flex-col items-center px-4">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-8 mb-2">
        Leaderboard
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl text-center">
        It's never late to improve yourself!
      </p>

      <div className="w-full max-w-2xl h-[70vh] relative">
        <div className="overflow-y-auto space-y-4 pb-4 pr-2 h-full">
          {entries.map(([id, data], index) => {
            const isCurrentUser = id == user.id.toString();
            return (
              <div
                key={id}
                id={`leader-${id}`}
                className={`w-full flex justify-between items-center rounded-2xl px-6 py-4 border shadow-md transition-colors duration-300 ${
                  isCurrentUser
                    ? "bg-yellow-100 border-yellow-400 dark:bg-yellow-900 dark:border-yellow-600"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
              >
                <span className="text-lg font-semibold text-gray-800 dark:text-white truncate max-w-[70%]">
                  #{index + 1}{" "}
                  {data.name.length > 15
                    ? data.name.slice(0, 15) + "…"
                    : data.name}
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-bold text-md">
                  {data.casual_score} pts
                </span>
              </div>
            );
          })}
        </div>

        {/* Sticky user row (only shows if their actual row is not visible) */}
        {!isUserVisible && (
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-inner rounded-t-2xl border-t border-gray-300 dark:border-gray-600 px-6 py-4 flex justify-between items-center">
            <span className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 truncate max-w-[70%]">
              {`You (${
                user.name.length > 15 ? user.name.slice(0, 15) + "…" : user.name
              })`}
            </span>
            <span className="text-yellow-600 dark:text-yellow-300 font-bold text-md">
              {leaders[user.id]?.casual_score ?? 0} pts
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
