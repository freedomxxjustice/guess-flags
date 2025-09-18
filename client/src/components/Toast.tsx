import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  duration?: number; // в миллисекундах
  onClose?: () => void;
}

const Toast = ({ message, duration = 3000, onClose }: ToastProps) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = 50; // обновление прогресса каждые 50мс
    const decrement = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          if (onClose) onClose();
          return 0;
        }
        return prev - decrement;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50">
      <div className="flex flex-col">
        <span>{message}</span>
        <div className="h-1 bg-green-300 mt-2 rounded-full">
          <div
            className="h-1 bg-white rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Toast;
