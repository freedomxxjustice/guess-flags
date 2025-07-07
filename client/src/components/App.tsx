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

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2000);
    return () => clearTimeout(timer);
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

  const renderIntroScreen = () => {
    if (showIntro) {
      return <IntroScreen />;
    }
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
        <div className="relative backdrop-blur-xs z-20 flex justify-center items-center text-white">
          <MainWrapper />
        </div>
      </div>
    </div>
  );
};

export default App;
