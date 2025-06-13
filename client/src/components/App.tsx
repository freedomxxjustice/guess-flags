import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadStarsPreset } from "tsparticles-preset-stars";
import StartScreen from "./StartScreen";
import { init, viewport, themeParams, initData } from "@telegram-apps/sdk";

init();

initData.restore();

viewport.mount();
themeParams.mount();

viewport.expand();

const App = () => {
  // STATES

  // PARTICLES
  const particlesInit = useCallback(async (engine: any) => {
    await loadStarsPreset(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: any) => {
    await console.log(container);
  }, []);

  return (
    <div className="h-screen flex justify-center items-center text-white">
      <div id="mainBackground">
        <Particles
          id="tsparticles"
          init={particlesInit}
          loaded={particlesLoaded}
          options={{
            preset: "stars",
            background: {
              color: {
                value: "#0d47a1",
              },
            },
          }}
        />
        <StartScreen />
      </div>
    </div>
  );
};

export default App;
