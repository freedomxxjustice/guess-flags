// import { useEffect, useState } from "react";
// import CountUp from "react-countup";
// import { faStar } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadStarsPreset } from "tsparticles-preset-stars";
import { useQuery } from "@tanstack/react-query";
import request from "../utils/api";
import type { IUser } from "../interfaces/IUser";

import { init, viewport, themeParams, initData } from "@telegram-apps/sdk";

init();

initData.restore();

viewport.mount();
themeParams.mount();

viewport.expand();

const App = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      return (await request("users/get")).data;
    },
    select: (data) => data.user as IUser,
  });

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
        {isLoading ? (
          <div className="animate-pulse">Loading...</div>
        ) : (
          <div className="flex justify-center items-center h-screen flex-col">
            <h1 className="text-white text-center text-2xl mb-5 font-bold">
              {user?.name}, <br />
              Welcome to Flags Guess!
            </h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
