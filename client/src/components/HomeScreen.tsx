import Header from "./Header";
import { useTranslation } from "react-i18next";
import BottomModal from "./BottomModal";
import type { IUser } from "../interfaces/IUser";

interface HomeScreenProps {
  user: IUser | undefined;
  showModal: false | "error" | "notEnoughTries";
  setShowModal: (value: false | "error" | "notEnoughTries") => void;
  setShowBuyTries: (value: boolean) => void;
  setShowCasualFilter: (value: boolean) => void;
  setShowTrainingFilter: (value: boolean) => void;
  openCommunity: () => void;
  isFullscreenState: boolean;
  headerStyle: string;
  headerStyleFullscreen: string;
}

export default function HomeScreen({
  user,
  showModal,
  setShowModal,
  setShowBuyTries,
  setShowCasualFilter,
  setShowTrainingFilter,
  openCommunity,
  isFullscreenState,
  headerStyle,
  headerStyleFullscreen,
}: HomeScreenProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen h-50 overflow-auto pb-20">
      <Header
        isFullscreen={isFullscreenState}
        headerStyle={headerStyle}
        headerStyleFullscreen={headerStyleFullscreen}
        title={t("home")}
      >
        <p
          className="bg-primary border-0 rounded-2xl py-1.5 px-3 text-xs"
          onClick={() => setShowBuyTries(true)}
        >
          {t("tries_left")}: {user?.tries_left}
        </p>
      </Header>

      <div className="flex flex-col justify-center items-center w-full px-4 py-6 flex-grow content-center">
        <div className="mb-12">
          <h1 className="text-center mb-6">
            <div className="text-xs font-semibold mb-2">
              {user?.name}, {t("welcome")}
            </div>
            <div className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight drop-shadow-lg py-5">
              Guess Flags
            </div>
          </h1>
          <img
            src="/placeholder.png"
            className="mx-auto w-77 object-contain rounded-lg"
            alt="Guess Flags"
          />
        </div>

        <div className="flex flex-col items-center gap-3 mb-6 w-90">
          <button
            type="button"
            className="btn btn-regular w-full"
            onClick={() => setShowCasualFilter(true)}
          >
            {t("casual")}
          </button>
          <button
            type="button"
            className="btn btn-regular w-full"
            onClick={() => setShowTrainingFilter(true)}
          >
            {t("training")}
          </button>
          <button
            onClick={() => setShowModal("error")}
            type="button"
            className="btn btn-regular w-full"
          >
            {t("rating")}
          </button>
          <button
            type="button"
            className="btn btn-regular w-full"
            onClick={openCommunity}
          >
            {t("community")}
          </button>
          <p className="text-xs text-gray-500 select-none mt-4">
            {t("early_access")}
          </p>
        </div>
      </div>

      {/* Modals */}
      {showModal === "notEnoughTries" && (
        <BottomModal
          title={t("not_enough_tries")}
          text={t("not_enough_tries_text")}
          actionLabel={t("buy_tries")}
          onAction={() => {
            setShowBuyTries(true);
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}

      {showModal === "error" && (
        <BottomModal
          title={t("error_404")}
          text={t("error_404_text")}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
