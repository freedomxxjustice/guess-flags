import { useEffect, useRef } from "react";
import lottie from "lottie-web";
import type { AnimationItem } from "lottie-web";

interface GiftPreviewProps {
  animationUrl: string;
  width?: number;
  height?: number;
  loop?: boolean;
  autoplay?: boolean;
}

export default function GiftPreview({
  animationUrl,
  width = 200,
  height = 200,
  loop = true,
  autoplay = true,
}: GiftPreviewProps) {
  const container = useRef<HTMLDivElement>(null);
  const animationInstance = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!container.current) return;

    animationInstance.current = lottie.loadAnimation({
      container: container.current,
      renderer: "svg",
      loop,
      autoplay,
      path: animationUrl,
    });

    return () => {
      animationInstance.current?.destroy();
    };
  }, [animationUrl, loop, autoplay]);

  return <div ref={container} style={{ width, height }} />;
}
