import React from "react";

type ToggleSwitchProps = {
  value: "global" | "daily";
  onChange: (value: "global" | "daily") => void;
};

export default function ToggleSwitch({ value, onChange }: ToggleSwitchProps) {
  const isGlobal = value === "global";

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onChange("global")}
        className={`text-sm font-medium ${
          isGlobal ? "text-primary" : "text-gray-400"
        }`}
      >
        Global
      </button>
      <div
        onClick={() => onChange(isGlobal ? "daily" : "global")}
        className="relative w-14 h-7 bg-gray-700 rounded-full cursor-pointer transition-colors duration-300"
      >
        <div
          className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-primary transform transition-transform duration-300 ${
            isGlobal ? "translate-x-0" : "translate-x-7"
          }`}
        />
      </div>
      <button
        onClick={() => onChange("daily")}
        className={`text-sm font-medium ${
          !isGlobal ? "text-primary" : "text-gray-400"
        }`}
      >
        Daily
      </button>
    </div>
  );
}
