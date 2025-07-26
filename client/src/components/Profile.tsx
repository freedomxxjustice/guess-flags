import { useEffect, useState } from "react";

import type { IUser } from "../interfaces/IUser";
import Header from "./Header";
import { useTranslation } from "react-i18next";

type ProfileProps = {
  user: IUser;
  isFullscreen: boolean;
  headerStyle: string;
  headerStyleFullscreen: string;
};

export default function Profile({
  user,
  isFullscreen,
  headerStyle,
  headerStyleFullscreen,
}: ProfileProps) {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    // Telegram WebApp SDK profile photo fetch
    // @ts-ignore
    if (window.Telegram && window.Telegram.WebApp) {
      // Access Telegram user info
      // @ts-ignore
      const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;

      if (tgUser?.photo_url) {
        setProfilePhoto(tgUser.photo_url);
      } else {
        setProfilePhoto(null);
      }
    }
  }, []);

  return (
    <div className="min-h-screen overflow-y-auto h-50 pb-32">
      <Header
        isFullscreen={isFullscreen}
        headerStyle={headerStyle}
        headerStyleFullscreen={headerStyleFullscreen}
        title={t("profile")}
      />
      <div className="bg-grey-2 rounded-2xl p-4 mx-auto shadow-md text-white flex w-95 justify-between gap-4 mt-6 items-center">
        <div className="flex items-center gap-4">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={`${user.name}'s profile`}
              className="w-14 h-14 rounded-full object-cover border-2 border-primary shadow"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-lg font-bold shadow border-2 border-primary">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-lg font-semibold">{user.name}</h1>
            <p className="text-xs text-grey">{t("active_player")}</p>
          </div>
        </div>
        <div className="flex flex-col text-right">
          <p className="text-sm text-grey">{t("joined")}</p>
          <p className="text-sm font-medium">
            {new Date(user.created_at).toLocaleDateString()}
          </p>
          <p className="text-sm mt-1 text-grey">{t("rating")}</p>
          <p className="text-base font-semibold">{user.rating}</p>
        </div>
      </div>

      {/* CASUAL */}
      <div className="bg-grey-2 rounded-2xl p-4 mx-auto shadow-md text-white flex w-95 justify-between gap-4 mt-6 items-center">
        <div>
          <h1 className="text-lg font-semibold">{t("casual")}</h1>
          <p className="text-xs text-grey">{t("statistics")}</p>
        </div>
        <div className="flex flex-col text-right">
          <p className="text-sm text-grey">{t("total_score")}</p>
          <p className="text-base font-semibold">{user.casual_score}</p>
          <p className="text-sm mt-1 text-grey">{t("games_played")}</p>
          <p className="text-base font-semibold">{user.casual_games_played}</p>
        </div>
      </div>

      {/* RATING */}
      <div className="bg-grey-2 rounded-2xl p-4 mx-auto shadow-md text-white flex w-95 justify-between gap-4 mt-6 items-center">
        <div>
          <h1 className="text-lg font-semibold">{t("rating_mode")}</h1>
          <p className="text-xs text-grey">{t("statistics")}</p>
        </div>
        <div className="flex flex-col text-right">
          <p className="text-sm text-grey">{t("games_played")}</p>
          <p className="text-base font-semibold">{user.rating_games_played}</p>
          <p className="text-sm text-grey">{t("games_won")}</p>
          <p className="text-base font-semibold">{user.rating_games_won}</p>
        </div>
      </div>

      {/* TRAINING */}
      <div className="bg-grey-2 rounded-2xl p-4 mx-auto shadow-md text-white flex w-95 justify-between gap-4 mt-6 items-center">
        <div>
          <h1 className="text-lg font-semibold">{t("training")}</h1>
          <p className="text-xs text-grey">{t("statistics")}</p>
        </div>
        <div className="flex flex-col text-right">
          <p className="text-sm text-grey">{t("score")}</p>
          <p className="text-base font-semibold">{user.training_score}</p>
        </div>
      </div>

      <div className="bg-grey-2 rounded-2xl p-4 mx-auto shadow-md text-white flex w-95 gap-4 mt-6 items-center justify-center">
        <p className="text-xs text-center text-grey">{t("the_best_stats")}</p>
      </div>
    </div>
  );
}
