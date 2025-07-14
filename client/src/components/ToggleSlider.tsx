interface ToggleSliderProps {
  options: [string, string];
  value: string;
  onChange: (value: any) => void;
}

export default function ToggleSlider({
  options,
  value,
  onChange,
}: ToggleSliderProps) {
  const [leftLabel, rightLabel] = options;
  const isRight = value === rightLabel;

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={() => onChange(isRight ? leftLabel : rightLabel)}
        className="relative flex w-48 h-12 bg-grey-2 rounded-full p-1 transition-colors duration-300 items-center"
      >
        {/* Absolutely positioned slider */}
        <span
          className={`pointer-events-none absolute inset-y-1 left-1 w-22 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
            isRight ? "translate-x-24" : ""
          }`}
        />

        {/* Labels */}
        <span
          className={`flex-1 z-10 flex items-center justify-center text-center font-medium transition-colors duration-300 ${
            !isRight ? "text-background" : "text-white"
          }`}
        >
          {leftLabel}
        </span>
        <span
          className={`flex-1 z-10 flex items-center justify-center text-center font-medium transition-colors duration-300 ${
            isRight ? "text-background" : "text-white"
          }`}
        >
          {rightLabel}
        </span>
      </button>
    </div>
  );
}
