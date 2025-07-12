import { useCallback, useEffect, useState } from "react";
import Particles from "react-tsparticles";
import { loadStarsPreset } from "tsparticles-preset-stars";
import MainWrapper from "./MainWrapper";
import IntroScreen from "./IntroScreen";
import {
  init,
  viewport,
  themeParams,
  initData,
  backButton,
  mainButton,
  hapticFeedback,
} from "@telegram-apps/sdk";

// TELEGRAM INITIATION
init();
initData.restore();

if (viewport.bindCssVars.isAvailable()) {
  viewport.bindCssVars();
}

if (viewport.mount.isAvailable()) {
  viewport.mount();
}

themeParams.mountSync();
mainButton.mount();
backButton.mount();
mainButton.setParams({
  text: "CHECKOUT",
  isEnabled: true,
  isVisible: false,
  hasShineEffect: true,
  isLoaderVisible: false,
  textColor: "#FFFFFF",
});

if (viewport.expand.isAvailable()) {
  viewport.expand();
}

const App = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [showFullScreenModal, setShowFullScreenModal] =
    useState<boolean>(false);
  const btnClickAnimation = "transform active:scale-95 transition-transform";
  useEffect(() => {
    function handleClick(e: any) {
      if (e.target.tagName === "BUTTON") {
        hapticFeedback.impactOccurred("medium");
      }
    }

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (viewport.requestFullscreen.isAvailable()) {
      viewport.requestFullscreen();
    } else {
      setShowFullScreenModal(true);
    }
  }, []);

  useEffect(() => {
    if (!viewport.isFullscreen()) {
      setShowFullScreenModal(true);
    }
  }, [viewport.isFullscreen()]);

  const particlesInit = useCallback(async (engine: any) => {
    await loadStarsPreset(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: any) => {
    return container;
  }, []);

  const renderIntroScreen = () => {
    if (showIntro) {
      return <IntroScreen />;
    }
  };

  const renderShowFullScreenModal = () => {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-grey-2/60 backdrop-blur-xl p-6 max-w-sm w-full text-center">
          <h1 className="mb-6">It's recomended to play in fullscreen mode!</h1>
          <button
            onClick={() => setShowFullScreenModal(false)}
            className={`py-2 px-4 rounded-xl font-semibold transition-all ${btnClickAnimation}`}
            style={{
              backgroundColor: "var(--color-warning)",
              color: "white",
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex justify-center items-center text-white">
      {renderIntroScreen()}
      <div
        id="mainBackground"
        className="relative w-full h-full overflow-hidden"
      >
        {/* Particles */}

        <Particles
          id="tsparticles"
          className="absolute inset-0 z-0"
          init={particlesInit}
          loaded={particlesLoaded}
          options={{
            preset: "stars",
            background: {
              color: {
                value: "#131416",
              },
            },
            particles: {
              color: {
                value: "#f4f3f2",
              },
            },
          }}
        />

        {/* Top shadow */}
        <div
          className="pointer-events-none absolute top-0 left-0 w-full h-48 z-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
          }}
        />

        {/* Bottom shadow */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 w-full h-48 z-10"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
          }}
        />

        {/* Main content */}
        <div className="relative h-screen backdrop-blur-xs z-20 flex justify-center items-center text-white">
          {showFullScreenModal ? renderShowFullScreenModal() : ""}
          <MainWrapper />
        </div>
      </div>
    </div>
  );
};

export default App;
