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
import "@ncdai/react-wheel-picker/style.css";
import WelcomeScreen from "./WelcomeScreen";

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
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("seenWelcome");
    if (!seen) {
      setShowWelcome(true);
    }
  }, []);

  const finishWelcome = () => {
    localStorage.setItem("seenWelcome", "true");
    setShowWelcome(false);
  };
  
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
    if (viewport.requestFullscreen.isAvailable()) {
      viewport.requestFullscreen();
    }
  }, []);

  const particlesInit = useCallback(async (engine: any) => {
    await loadStarsPreset(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: any) => {
    return container;
  }, []);

  return (
    <div className="h-screen flex justify-center items-center text-white">
      {showWelcome && <WelcomeScreen onFinish={finishWelcome} />}

      <div className="fixed top-0 left-0 w-full h-50 bg-background z-10 pointer-events-none" />

      {showIntro && <IntroScreen onFinish={() => setShowIntro(false)} />}

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
        <div className="relative min-h-screen backdrop-blur-xs z-20 flex justify-center items-center text-white">
          <MainWrapper />
        </div>
      </div>
    </div>
  );
};

export default App;
