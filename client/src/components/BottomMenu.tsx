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
    <div className="fixed bottom-0 left-0 z-50 w-full h-20 bg-grey-2 border-grey">
      <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
        <button
          type="button"
          className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-800 ${
            page == "leaderboard" ? "bg-primary" : "bg-grey-2"
          } group`}
          onClick={() => {
            onNavigate("leaderboard");
            refetchLeaders();
          }}
        >
          <MdLeaderboard />
          <span className="text-sm text-white group-hover:text-blue-600 dark:group-hover:text-blue-500">
            Leaderboard
          </span>
        </button>
        <button
          type="button"
          className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-800 ${
            page == "home" ? "bg-primary" : "bg-grey-2"
          } group`}
          onClick={() => onNavigate("home")}
        >
          <FaHome />
          <span className="text-sm text-white group-hover:text-blue-600 dark:group-hover:text-blue-500">
            Home
          </span>
        </button>

        <button
          type="button"
          className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-800 ${
            page == "profile" ? "bg-primary" : "bg-grey-2"
          } group`}
          onClick={() => onNavigate("profile")}
        >
          <CgProfile />
          <span className="text-sm text-white  group-hover:text-blue-600 dark:group-hover:text-blue-500">
            Profile
          </span>
        </button>
      </div>
    </div>
  );
}
