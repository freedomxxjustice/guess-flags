import { useEffect, useState } from "react";

import type { IUser } from "../interfaces/IUser";
import Header from "./Header";

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
        title="Profile"
      ></Header>
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
            <p className="text-xs text-grey">Active player</p>
          </div>
        </div>
        <div className="flex flex-col text-right">
          <p className="text-sm text-grey">Joined</p>
          <p className="text-sm font-medium">
            {new Date(user.created_at).toLocaleDateString()}
          </p>
          <p className="text-sm mt-1 text-grey">Rating</p>
          <p className="text-base font-semibold">{user.rating}</p>
        </div>
      </div>
      <div className="bg-grey-2 rounded-2xl p-4 mx-auto shadow-md text-white flex w-95 justify-between gap-4 mt-6 items-center">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold">CASUAL</h1>
            <p className="text-xs text-grey">Statistics</p>
          </div>
        </div>
        <div className="flex flex-col text-right">
          <p className="text-sm text-grey">Total Score</p>
          <p className="text-base font-semibold">{user.casual_score}</p>
          <p className="text-sm mt-1 text-grey">Games Played</p>
          <p className="text-base font-semibold">{user.casual_games_played}</p>
        </div>
      </div>
      <div className="bg-grey-2 rounded-2xl p-4 mx-auto shadow-md text-white flex w-95 justify-between gap-4 mt-6 items-center">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold">RATING</h1>
            <p className="text-xs text-grey">Statistics</p>
          </div>
        </div>
        <div className="flex flex-col text-right">
          <p className="text-sm text-grey">Games Played</p>
          <p className="text-base font-semibold">{user.rating_games_played}</p>
          <p className="text-sm text-grey">Games Won</p>
          <p className="text-base font-semibold">{user.rating_games_won}</p>
        </div>
      </div>
      <div className="bg-grey-2 rounded-2xl p-4 mx-auto shadow-md text-white flex w-95 justify-between gap-4 mt-6 items-center">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold">TRAINING</h1>
            <p className="text-xs text-grey">Statistics</p>
          </div>
        </div>
        <div className="flex flex-col text-right">
          <p className="text-sm text-grey">Score</p>
          <p className="text-base font-semibold">{user.training_score}</p>
        </div>
      </div>
      <div className="bg-grey-2 rounded-2xl p-4 mx-auto shadow-md text-white flex w-95 gap-4 mt-6 items-center just">
        <p className="text-xs text-center text-grey">
          For other statistics visit Leaderboard and Tournaments
        </p>
      </div>
    </div>
  );
}
