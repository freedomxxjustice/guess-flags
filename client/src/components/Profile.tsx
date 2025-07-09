import { useEffect, useState } from "react";

import type { IUser } from "../interfaces/IUser";

type ProfileProps = {
  user: IUser;
};

export default function Profile({ user }: ProfileProps) {
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
    <div className="flex flex-col items-center">
      <div id="upperPanel" className="w-max z-50 flex flex-col justify-center">
        <h1 className="text-4xl font-extrabold text-white text-center">
          Profile
        </h1>
        <p className="text-gray-300 max-w-2xl text-center">
          Take a look at your stats!
        </p>
      </div>
      <div className="w-85 mx-auto mt-6 p-6 bg-white/10 backdrop-blur rounded-3xl shadow-lg text-center">
        <div className="flex justify-center mb-6">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={`${user.name}'s profile`}
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-md"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-grey flex items-center justify-center text-white text-5xl font-bold shadow-md border-4 border-primary">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <h2 className="text-3xl font-semibold text-white mb-2">{user.name}</h2>
        <h3>
          <div className="text-primary">
            <h3 className="text-xl font-semibold">
              Rating — <span>{user.rating}</span>
            </h3>
          </div>
        </h3>

        <div className="flex flex-col gap-6 mt-6">
          <div>
            <h2>Rating Statistics</h2>
            <div className="grid grid-cols-2 gap-4 text-gray-300">
              <div>
                <h3 className="text-xl font-semibold">Games Played</h3>
                <p>{user.rating_games_played}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Games Won</h3>
                <p>{user.rating_games_won}</p>
              </div>
            </div>
          </div>
          <div>
            <h2>Casual Statistics</h2>
            <div className="grid grid-cols-2 gap-4 text-gray-300">
              <div>
                <h3 className="text-xl font-semibold">Games Played</h3>
                <p>{user.casual_games_played}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold">Score</h3>
                <p>{user.casual_score}</p>
              </div>
            </div>
          </div>
          <div>
            <h2>Training Statistics</h2>
            <div className="grid grid-cols-1 gap-4 text-gray-300">
              <div>
                <h3 className="text-xl font-semibold">Score</h3>
                <p>{user.training_score}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
