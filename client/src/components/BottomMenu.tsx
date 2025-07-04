import { FaHome } from "react-icons/fa";
import { MdLeaderboard } from "react-icons/md";
import { CgProfile } from "react-icons/cg";

type BottomMenuProps = {
  onNavigate: (page: "home" | "leaderboard" | "profile") => void;
  refetchLeaders: () => void;
  page: "home" | "leaderboard" | "profile";
};

export default function BottomMenu({
  onNavigate,
  refetchLeaders,
  page,
}: BottomMenuProps) {
  return (
    <div className="fixed bottom-0 left-0 z-51 w-full h-25 bg-white/10 backdrop-blur-md">
      <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
        <button
          type="button"
          className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-800 ${
            page == "leaderboard" ? "text-primary" : ""
          } group`}
          onClick={() => {
            onNavigate("leaderboard");
            refetchLeaders();
          }}
        >
          <MdLeaderboard />
          <span
            className={`text-sm ${
              page == "leaderboard" ? "text-primary" : ""
            } group-hover:text-blue-600 dark:group-hover:text-blue-500`}
          >
            Leaderboard
          </span>
        </button>
        <button
          type="button"
          className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-800 ${
            page == "home" ? "text-primary" : ""
          } group`}
          onClick={() => onNavigate("home")}
        >
          <FaHome />
          <span
            className={`text-sm ${
              page == "home" ? "text-primary" : ""
            } group-hover:text-blue-600 dark:group-hover:text-blue-500`}
          >
            Home
          </span>
        </button>

        <button
          type="button"
          className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-800 ${
            page == "profile" ? "text-primary" : ""
          } group`}
          onClick={() => onNavigate("profile")}
        >
          <CgProfile />
          <span
            className={`text-sm ${
              page == "profile" ? "text-primary" : ""
            } group-hover:text-blue-600 dark:group-hover:text-blue-500`}
          >
            Profile
          </span>
        </button>
      </div>
    </div>
  );
}
