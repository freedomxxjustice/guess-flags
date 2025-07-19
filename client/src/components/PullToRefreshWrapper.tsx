import { useEffect, useRef, useState } from "react";

export default function PullToRefreshWrapper({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const [pulling, setPulling] = useState(false);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current !== null) {
        const deltaY = e.touches[0].clientY - startY.current;
        if (deltaY > 0) {
          e.preventDefault(); // prevent scrolling
          setPulling(true);
          setTranslateY(Math.min(deltaY, 100)); // max pull height
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pulling && translateY > 60) {
        await onRefresh();
      }
      setPulling(false);
      setTranslateY(0);
      startY.current = null;
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onRefresh, pulling, translateY]);

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto h-screen"
      style={{
        transform: `translateY(${translateY}px)`,
        transition: pulling ? "none" : "transform 0.3s ease",
      }}
    >
      {children}
    </div>
  );
}
