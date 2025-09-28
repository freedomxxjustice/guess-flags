import { FaHome } from "react-icons/fa";
import { MdLeaderboard, MdPerson } from "react-icons/md";
import { useTranslation } from "react-i18next";

type BottomMenuProps = {
  onNavigate: (
    page: "home" | "leaderboard" | "profile" | "tournaments"
  ) => void;
  refetchLeaders: () => void;
  page: "home" | "leaderboard" | "profile" | "tournaments";
};

export default function BottomMenu({
  onNavigate,
  refetchLeaders,
  page,
}: BottomMenuProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-25 bg-background">
      <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
        <button
          type="button"
          className={`inline-flex flex-col items-center justify-center px-5 ${
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
            } group-hover:text-primary`}
          >
            {t("leaderboard")}
          </span>
        </button>
        <button
          type="button"
          className={`inline-flex flex-col items-center justify-center px-5 ${
            page == "home" ? "text-primary" : ""
          } group`}
          onClick={() => onNavigate("home")}
        >
          <FaHome />
          <span
            className={`text-sm ${
              page == "home" ? "text-primary" : ""
            } group-hover:text-primary`}
          >
            {t("home")}
          </span>
        </button>

        <button
          type="button"
          className={`inline-flex flex-col items-center justify-center px-5 ${
            page == "profile" ? "text-primary" : ""
          } group`}
          onClick={() => onNavigate("profile")}
        >
          <MdPerson />
          <span
            className={`text-sm ${
              page == "profile" ? "text-primary" : ""
            } group-hover:text-primary`}
          >
            {t("profile")}
          </span>
        </button>
        {/* <button
          type="button"
          className={`inline-flex flex-col items-center justify-center px-5 ${
            page == "tournaments" ? "text-primary" : ""
          } group`}
          onClick={() => onNavigate("tournaments")}
        >
          <FaMedal />
          <span
            className={`text-sm ${
              page == "tournaments" ? "text-primary" : ""
            } group-hover:text-primary`}
          >
            {t("tournaments")}
          </span>
        </button> */}
      </div>
    </div>
  );
}
