import { useEffect, useState } from "react";

interface IntroScreenProps {
  onFinish: () => void;
}

export default function IntroScreen({ onFinish }: IntroScreenProps) {
  const [closing, setClosing] = useState(false);

  const handleEnd = () => {
    setClosing(true);
  };

  useEffect(() => {
    if (closing) {
      const timer = setTimeout(() => {
        onFinish();
      }, 500); // animation duration in ms
      return () => clearTimeout(timer);
    }
  }, [closing, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black ${
        closing ? "animate-fadeOutIntro" : "animate-fadeInIntro"
      }`}
    >
      <video
        src="/intro.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleEnd}
        className="max-w-full max-h-full object-fill"
      />
    </div>
  );
}
