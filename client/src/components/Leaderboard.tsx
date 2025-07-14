import { useState, useEffect, useRef } from "react";
import ToggleSlider from "./ToggleSlider";
import type { IUser } from "../interfaces/IUser";
import Header from "./Header";
import { FaCrown } from "react-icons/fa";

type LeaderboardProps = {
  leaders: {
    [id: string]: {
      name: string;
      casual_score: number;
    };
  };
  today_leaders: {
    [id: string]: {
      name: string;
      today_casual_score: number;
    };
  };
  user: IUser;
  userRank: number;
  userTodayRank: number;
  isFullscreen: boolean;
  headerStyle: string;
  headerStyleFullscreen: string;
};

export default function Leaderboard({
  leaders,
  today_leaders,
  user,
  userRank,
  userTodayRank,
  isFullscreen,
  headerStyle,
  headerStyleFullscreen,
}: LeaderboardProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [isUserVisible, setIsUserVisible] = useState(true);
  const [period, setPeriod] = useState<"Today" | "Season">("Season");

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

  const todayEntries = Object.entries(today_leaders).sort(
    (a, b) => b[1].today_casual_score - a[1].today_casual_score
  );
  const isUserInAllTime = entries.some(([id]) => id === userIdStr);
  const isUserInToday = todayEntries.some(([id]) => id === userIdStr);
  return (
    <div className="min-h-screen h-50 overflow-auto pb-32">
      <Header
        isFullscreen={isFullscreen}
        headerStyle={headerStyle}
        headerStyleFullscreen={headerStyleFullscreen}
        title="Leaderboard"
      >
        <ToggleSlider
          options={["Today", "Season"]}
          value={period}
          onChange={setPeriod}
        />
      </Header>
      <div className="w-full flex flex-col gap-4 px-4">
        <div className="mt-6">
          {period === "Season" && (
            <div className="">
              <div className="w-full max-w-4xl overflow-x-hidden h-[40vh] relative mx-auto">
                <div
                  ref={listRef}
                  className="overflow-y-auto overflow-x-hidden h-full space-y-2 px-4 hide-scrollbar"
                >
                  {entries.map(([id, data], index) => {
                    const isCurrentUser = id === user.id.toString();
                    return (
                      <div
                        key={id}
                        id={`leader-${id}`}
                        className={`w-full flex bg-grey-2 justify-between gap-14 items-center rounded-xl px-5 py-2 border transition-colors duration-300 cursor-pointer ${
                          isCurrentUser
                            ? "bg-primary border-primary text-white shadow-lg"
                            : "bg-grey-2 border-grey hover:bg-gray-700 hover:border-gray-500"
                        }`}
                      >
                        <span className="flex items-center gap-2 text-base font-semibold truncate max-w-[75%]">
                          #{index + 1}
                          {index < 3 && (
                            <FaCrown
                              className={`mx-1 ${
                                index === 0
                                  ? "text-yellow-400"
                                  : index === 1
                                  ? "text-gray-300"
                                  : "text-amber-600"
                              }`}
                            />
                          )}
                          <span>
                            {data.name.length > 20
                              ? data.name.slice(0, 20) + "…"
                              : data.name}
                          </span>
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
                  {!isUserInAllTime && (
                    <div className="text-white text-xl mb-18 text-center">
                      …
                    </div>
                  )}
                </div>

                {/* Sticky user row (shows if user row not visible) */}
                {(!isUserInAllTime || !isUserVisible) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-grey-2 shadow-inner rounded-xl border border-grey px-6 py-3 flex flex-col items-center mx-auto w-99">
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
          {period === "Today" && (
            <div className="">
              <div className="w-full max-w-4xl overflow-x-hidden h-[40vh] relative mx-auto">
                <div
                  ref={listRef}
                  className="overflow-y-auto overflow-x-hidden h-full space-y-2 px-4 hide-scrollbar"
                >
                  {todayEntries.map(([id, data], index) => {
                    const isCurrentUser = id === user.id.toString();
                    return (
                      <div
                        key={id}
                        id={`leader-${id}`}
                        className={`w-full flex bg-grey-2 justify-between gap-14 items-center rounded-xl px-5 py-2 border transition-colors duration-300 cursor-pointer ${
                          isCurrentUser
                            ? "bg-primary border-primary text-white shadow-lg"
                            : "bg-grey-2 border-grey hover:bg-gray-700 hover:border-gray-500"
                        }`}
                      >
                        <span className="flex items-center gap-2 text-base font-semibold truncate max-w-[75%]">
                          #{index + 1}
                          {index < 3 && (
                            <FaCrown
                              className={`mx-1 ${
                                index === 0
                                  ? "text-yellow-400"
                                  : index === 1
                                  ? "text-gray-300"
                                  : "text-amber-600"
                              }`}
                            />
                          )}
                          <span>
                            {data.name.length > 20
                              ? data.name.slice(0, 20) + "…"
                              : data.name}
                          </span>
                        </span>
                        <span
                          className={`font-bold text-base ${
                            isCurrentUser ? "text-white" : "text-primary"
                          }`}
                        >
                          {data.today_casual_score} pts
                        </span>
                      </div>
                    );
                  })}
                  {!isUserInToday && (
                    <div className="text-white text-xl mb-18 text-center">
                      …
                    </div>
                  )}
                </div>

                {/* Sticky user row (shows if user row not visible) */}
                {(!isUserInToday || !isUserVisible) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-grey-2 shadow-inner rounded-xl border border-grey px-6 py-3 flex flex-col items-center mx-auto max-w-4xl">
                    {" "}
                    <div className="w-full flex justify-between items-center">
                      <p className="text-base font-semibold text-warning truncate max-w-[75%]">
                        #{userTodayRank}
                      </p>
                      <span className="text-base font-semibold text-warning truncate max-w-[75%]">
                        You
                        {user.name.length > 20
                          ? ` (${user.name.slice(0, 20)}…)`
                          : ` (${user.name})`}
                      </span>
                      <span className="text-warning font-bold text-base">
                        {user.today_casual_score} pts
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-full px-4">
          <div className="bg-grey-2 rounded-xl p-4 max-w-2xl mx-auto shadow text-white flex flex-col items-center text-center gap-2">
            <h2 className="text-3xl font-bold text-white">Season 1</h2>
            <p className="text-grey text-sm">
              Climb the leaderboard and prove your knowledge!
            </p>

            {/* Countdown Placeholder */}
            <div className="rounded-lg py-1 px-4 mt-1 text-lg font-semibold text-white">
              12d 03h 44m remaining
            </div>
            {/* Prize Container */}
            <div className="flex justify-center items-end gap-4 mt-2">
              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <FaCrown className="text-yellow-400 text-xl mb-1" />
                <img
                  src="/prize1.jpg"
                  alt="1st Prize"
                  className="w-12 h-12 object-contain rounded"
                />
                <span className="text-xs text-white mt-1">1st</span>
              </div>

              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <FaCrown className="text-gray-300 text-xl mb-1" />
                <img
                  src="/prize2.jpg"
                  alt="2nd Prize"
                  className="w-12 h-12 object-contain rounded"
                />
                <span className="text-xs text-white mt-1">2nd</span>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <FaCrown className="text-amber-600 text-xl mb-1" />
                <img
                  src="/prize3.jpg"
                  alt="3rd Prize"
                  className="w-12 h-12 object-contain rounded"
                />
                <span className="text-xs text-white mt-1">3rd</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
