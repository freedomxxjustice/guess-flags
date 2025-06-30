import { useCallback, useEffect } from "react";
import Particles from "react-tsparticles";
import { loadStarsPreset } from "tsparticles-preset-stars";
import MainWrapper from "./MainWrapper";
import {
  init,
  viewport,
  themeParams,
  initData,
  backButton,
  mainButton,
} from "@telegram-apps/sdk";

init();
initData.restore();
if (viewport.bindCssVars.isAvailable()) {
  viewport.bindCssVars();
  // Creates CSS variables like:
  // --tg-viewport-height: 675px
  // --tg-viewport-width: 320px
  // --tg-viewport-stable-height: 675px
}
if (viewport.mount.isAvailable()) {
  viewport.mount();
}
themeParams.mount();

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
  useEffect(() => {
    if (viewport.requestFullscreen.isAvailable()) {
      viewport.requestFullscreen();
    }
  }, []);

  // PARTICLES

  const particlesInit = useCallback(async (engine: any) => {
    await loadStarsPreset(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: any) => {
    await console.log(container);
  }, []);

  return (
    <div className="h-screen flex justify-center items-center text-white">
      <div id="mainBackground" className="relative overflow-hidden">
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
        <div className="relative z-10flex justify-center items-center text-white">
          <MainWrapper />
        </div>
      </div>
    </div>
  );
};

export default App;
