import Header from "./Header";
import { useTranslation } from "react-i18next";
import BottomModal from "./BottomModal";
import type { IUser } from "../interfaces/IUser";
import { FaBolt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import WelcomeScreen from "./WelcomeScreen";

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

function AttemptsDisplay({ attempts }: { attempts: number }) {
  const maxDisplay = 9;
  const freeTries = 5;

  const displayCount = Math.min(attempts, maxDisplay);
  const remaining = Math.max(0, attempts - maxDisplay);

  const filledBlue = Math.min(displayCount, freeTries);
  const filledGreen = Math.max(0, displayCount - freeTries);

  return (
    <div className="flex items-center gap-1">
      {/* Бесплатные синие */}
      {[...Array(filledBlue)].map((_, i) => (
        <FaBolt key={`b-${i}`} className="text-blue-400 w-4 h-4" />
      ))}

      {/* Купленные зеленые */}
      {[...Array(filledGreen)].map((_, i) => (
        <FaBolt key={`g-${i}`} className="text-green-400 w-4 h-4" />
      ))}

      {/* Остаток +N */}
      {remaining > 0 && (
        <span className="text-xs font-semibold text-white ml-1">
          +{remaining}
        </span>
      )}
    </div>
  );
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
  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(false);

  return (
    <div className="min-h-screen h-50 overflow-auto pb-20">
      {showWelcomeScreen && (
        <WelcomeScreen
          onFinish={() => setShowWelcomeScreen(false)}
        ></WelcomeScreen>
      )}
      <Header
        isFullscreen={isFullscreenState}
        headerStyle={headerStyle}
        headerStyleFullscreen={headerStyleFullscreen}
        title={t("home")}
      >
        <button
          className="border border-primary rounded-2xl py-1 px-3 flex items-center gap-2"
          onClick={() => setShowBuyTries(true)}
        >
          <motion.div
            className=""
            style={{ transformOrigin: "right" }}
            animate={{
              y: [0, -0.1, 0, 0.2, 0],
              x: [0, -0.2, 0, 0.1, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          >
            <AttemptsDisplay attempts={user?.tries_left ?? 0} />
          </motion.div>
        </button>
      </Header>

      <div className="flex flex-col justify-center items-center w-full px-4 py-6 flex-grow content-center">
        <div className="mb-12">
          <h1 className="text-center mb-6">
            <div className="text-xs font-semibold mb-2">
              <motion.div
                className=""
                style={{ transformOrigin: "right" }}
                animate={{
                  y: [0, -5, 0, 5, 0],
                  scale: [1, 1.05, 1, 1.05, 1],
                  rotate: [0, -2, 0, 2, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {user?.name}, {t("welcome")}
              </motion.div>
            </div>

            <div className="flex justify-center">
              <motion.div
                className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight drop-shadow-lg py-5"
                style={{ transformOrigin: "right" }}
                animate={{
                  y: [0, -5, 0, 5, 0],
                  scale: [1, 1.05, 1, 1.05, 1],
                  rotate: [0, -2, 0, 2, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Guess Flags
              </motion.div>
            </div>
          </h1>
          <motion.div
            className=""
            style={{ transformOrigin: "center" }}
            animate={{
              y: [0, -7, 0, 7, 0],
              scale: [1, 1.07, 1, 1.07, 1],
              rotate: [0, -2, 0, 2, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <img
              onClick={() => setShowWelcomeScreen(true)}
              src="/slide.png"
              className="mx-auto w-77 object-contain rounded-lg"
              alt="Guess Flags"
            />
          </motion.div>
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
            className="btn btn-regular w-full btn-disabled"
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
