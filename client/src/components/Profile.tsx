import { useEffect, useState } from "react";

type User = {
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
  // you can add more fields if you want
};

type ProfileProps = {
  user: User;
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
    <div className="w-full max-w-xl h-full mt-4 overflow-y-auto p-6">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-8 text-center">
        Profile
      </h1>
      <div className="max-w-xl mx-auto mt-12 p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-lg text-center">
        <div className="flex justify-center mb-6">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={`${user.name}'s profile`}
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-md"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-blue-400 flex items-center justify-center text-white text-5xl font-bold shadow-md border-4 border-blue-500">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
          {user.name}
        </h2>
        <h3>
          <div className="text-bold-blue">
            <h3 className="text-xl font-semibold">
              Rating — <span>{user.rating}</span>
            </h3>
          </div>
        </h3>

        <div className="flex flex-col gap-6 mt-6">
          <div>
            <h2>Rating Statistics</h2>
            <div className="grid grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="text-xl font-semibold">Games Played</h3>
                <p>{user.games_played}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Games Won</h3>
                <p>{user.games_won}</p>
              </div>
            </div>
          </div>
          <div>
            <h2>Casual Statistics</h2>
            <div className="grid grid-cols-3 gap-4 text-gray-700 dark:text-gray-300">
              <div></div>
              <div>
                <h3 className="text-xl font-semibold">Casual Score</h3>
                <p>{user.casual_score}</p>
              </div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
