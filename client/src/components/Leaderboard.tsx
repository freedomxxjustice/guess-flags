import { useState, useEffect, useRef } from "react";
import ToggleSlider from "./ToggleSlider";
import type { IUser } from "../interfaces/IUser";
import Header from "./Header";
import { FaBolt, FaCrown, FaMedal, FaStar } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import type { ISeason } from "../interfaces/ISeason";
import dayjs from "dayjs"; // для удобной работы с датами
import { motion } from "framer-motion";

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
  season?: ISeason;
  isSeasonLoading?: boolean;
  seasonError?: any;
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
  season,
  isSeasonLoading,
  seasonError,
}: LeaderboardProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [isUserVisible, setIsUserVisible] = useState(true);
  const [period, setPeriod] = useState<"Today" | "Season">("Season");

  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!season) return;

    const interval = setInterval(() => {
      const now = dayjs();
      const end = dayjs(season.end_date);
      const diff = end.diff(now);

      if (diff <= 0) {
        setTimeLeft("0d 0h 0m 0s");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [season]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsUserVisible(entry.isIntersecting),
      { root: listRef.current, threshold: 0.1 }
    );

    const userRow = document.getElementById(`leader-${period}-${user.id}`);
    if (userRow && listRef.current) {
      observer.observe(userRow);
    }

    return () => observer.disconnect();
  }, [period, user.id, leaders, today_leaders]);

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
        title={t("leaderboard")}
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
                    const place = index + 1;
                    const isCurrentUser = id === user.id.toString();

                    let prizeContent: React.ReactNode = null;

                    if (season && place >= 4 && place <= 10) {
                      // Найти приз для этого места в season.prizes
                      const prize = season.prizes.find(
                        (p) => p.place === place
                      );

                      if (prize) {
                        prizeContent = (
                          <div className="flex flex-row items-center ml-4">
                            <FaStar
                              className="w-5 h-5 object-contain text-yellow-300"
                              title={prize.title}
                            />
                            {prize.quantity > 1 && (
                              <span className="text-xs ml-1 text-yellow-300 mt-1">
                                x{prize.quantity}
                              </span>
                            )}
                          </div>
                        );
                      }
                    } else if (place >= 11 && place <= 50) {
                      // бесплатные попытки
                      const freeAttempts = Math.max(
                        1,
                        5 - Math.floor((place - 1) / 10)
                      );
                      prizeContent = (
                        <div className="flex flex-row items-center ml-4">
                          <FaBolt className="w-5 h-5 object-contain text-primary" />
                          <span className="text-xs text-gray-300 mt-1">
                            x{freeAttempts}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={id}
                        id={`leader-Season-${id}`}
                        className={`w-full flex items-center rounded-xl px-5 py-2 border transition-colors duration-300 cursor-pointer ${
                          isCurrentUser
                            ? "bg-primary border-primary text-white shadow-lg"
                            : "bg-grey-2 border-grey hover:bg-gray-700 hover:border-gray-500"
                        }`}
                      >
                        {/* Место и имя */}
                        <span className="flex items-center gap-2 text-base font-semibold truncate w-1/3">
                          #{place}
                          {place <= 3 && (
                            <FaCrown
                              className={`mx-1 ${
                                place === 1
                                  ? "text-yellow-400"
                                  : place === 2
                                  ? "text-gray-300"
                                  : "text-amber-600"
                              }`}
                            />
                          )}
                          <span className="truncate">{data.name}</span>
                        </span>

                        {/* Счет */}
                        <span
                          className={`font-bold text-base text-center w-1/3 ${
                            isCurrentUser ? "text-white" : "text-primary"
                          }`}
                        >
                          {data.casual_score} {t("pts")}
                        </span>

                        {/* Приз */}
                        <span className="flex justify-end w-1/3">
                          {prizeContent}
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
                  <div className="absolute bottom-0 left-0 right-0 bg-grey-2 shadow-inner rounded-xl border border-grey px-6 py-3 flex flex-col items-center mx-auto max-w-4xl">
                    {" "}
                    <div className="w-full flex justify-between items-center">
                      <p className="text-base font-semibold text-warning truncate max-w-[75%]">
                        #{userRank}
                      </p>
                      <span className="text-base font-semibold text-warning truncate max-w-[75%]">
                        {t("you")}
                        {user.name.length > 20
                          ? ` (${user.name.slice(0, 20)}…)`
                          : ` (${user.name})`}
                      </span>
                      <span className="text-warning font-bold text-base">
                        {user.casual_score} {t("pts")}
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
                        id={`leader-Today-${id}`}
                        className={`w-full flex bg-grey-2 justify-between gap-14 items-center rounded-xl px-5 py-2 border transition-colors duration-300 cursor-pointer ${
                          isCurrentUser
                            ? "bg-primary border-primary text-white shadow-lg"
                            : "bg-grey-2 border-grey hover:bg-gray-700 hover:border-gray-500"
                        }`}
                      >
                        <span className="flex items-center gap-2 text-base font-semibold truncate max-w-[75%]">
                          #{index + 1}
                          {index < 3 && (
                            <FaMedal
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
                          {data.today_casual_score} {t("pts")}
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
                        {t("you")}
                        {user.name.length > 20
                          ? ` (${user.name.slice(0, 20)}…)`
                          : ` (${user.name})`}
                      </span>
                      <span className="text-warning font-bold text-base">
                        {user.today_casual_score} {t("pts")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {period == "Season" && (
          <motion.div
            style={{ transformOrigin: "center" }}
            animate={{
              y: [0, -3, 0, 3, 0],
              scale: [1, 1.05, 1, 1.05, 1],
              rotate: [0, -2, 0, 2, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-full px-4">
              <div className="bg-grey-2 rounded-xl p-4 max-w-2xl mx-auto shadow text-white flex flex-col items-center text-center gap-2">
                <h2 className="text-3xl font-bold text-white">
                  {season ? season.title : t("pre_season")}
                </h2>
                <p className="text-grey text-sm">{t("leaderboards_note")}</p>

                {isSeasonLoading && (
                  <div className="rounded-lg py-1 px-4 mt-1 text-lg font-semibold text-white">
                    {t("loading")}...
                  </div>
                )}

                {seasonError && (
                  <div className="rounded-lg py-1 px-4 mt-1 text-lg font-semibold text-red-500">
                    {t("failed_to_load")}
                  </div>
                )}

                {season && new Date(season.start_date) > new Date() ? (
                  // === Будущий сезон ===
                  <div className="mt-4 text-center">
                    <div className="text-lg font-semibold text-white">
                      {t("next_season_in")}: {timeLeft}
                    </div>
                    <div className="text-sm text-gray-300 mt-1">
                      {t("season_start")}: {season.start_date}
                    </div>
                  </div>
                ) : (
                  // === Текущий сезон ===
                  season && (
                    <>
                      <div className="flex justify-center items-center gap-6 mt-4">
                        {season.prizes
                          .sort((a, b) => a.place - b.place)
                          .slice(0, 3)
                          .map((prize) => {
                            const crownColor =
                              prize.place === 1
                                ? "text-yellow-400"
                                : prize.place === 2
                                ? "text-gray-300"
                                : "text-amber-600";

                            return (
                              <div
                                key={prize.id}
                                className="flex flex-col items-center"
                              >
                                <FaCrown
                                  className={`${crownColor} text-xl mb-1`}
                                />

                                {/* Заглушка GIF вместо реального NFT */}
                                <a
                                  href={prize.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <img
                                    src="/nft.png"
                                    alt={prize.title}
                                    className="w-12 h-12 object-contain rounded cursor-pointer hover:scale-105 transition-transform"
                                  />
                                </a>

                                <span className="text-xs text-white mt-1">
                                  {prize.place === 1
                                    ? t("1st")
                                    : prize.place === 2
                                    ? t("2nd")
                                    : t("3rd")}
                                </span>

                                {prize.quantity > 1 && (
                                  <span className="text-xs text-gray-300">
                                    x{prize.quantity}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                      </div>

                      <div className="text-xs text-white mt-1">
                        {t("season_start")}: {season.start_date} |{" "}
                        {t("season_end")}: {season.end_date}
                        <br />
                        {t("time_left")}: {timeLeft}
                      </div>
                    </>
                  )
                )}

                {!season && !isSeasonLoading && (
                  <div className="rounded-lg py-1 px-4 mt-1 text-lg font-semibold text-white">
                    {t("not_started_yet")}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {period === "Today" && (
          <motion.div
            className=""
            style={{ transformOrigin: "center" }}
            animate={{
              y: [0, -3, 0, 3, 0],
              scale: [1, 1.05, 1, 1.05, 1],
              rotate: [0, -2, 0, 2, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-full px-4 mt-4">
              <div className="bg-grey-2 rounded-xl p-4 max-w-2xl mx-auto shadow text-white flex flex-col items-center text-center gap-2">
                <h2 className="text-2xl font-bold text-white">
                  {t("today_rewards")}
                </h2>

                <div className="flex justify-center items-center gap-6 mt-4">
                  {[9, 6, 3].map((attempts, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <FaMedal
                        className={`${
                          index === 0
                            ? "text-yellow-400"
                            : index === 1
                            ? "text-gray-300"
                            : "text-amber-600"
                        } text-xl mb-1`}
                      />
                      <span className="text-xs text-white mt-1">
                        {index === 0
                          ? t("1st")
                          : index === 1
                          ? t("2nd")
                          : t("3rd")}
                      </span>
                      <span className="text-xs text-gray-300 mt-1">
                        x{attempts}{" "}
                        <FaBolt className="text-primary text-xl mb-1" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
