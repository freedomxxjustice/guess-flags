import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface BottomModalProps {
  title: string;
  text: string;
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export default function BottomModal({
  title,
  text,
  onClose,
  actionLabel,
  onAction,
}: BottomModalProps) {
  const [closing, setClosing] = useState(false);
  const { t } = useTranslation();

  const handleClose = () => {
    setClosing(true);
  };

  useEffect(() => {
    if (closing) {
      const timer = setTimeout(() => {
        onClose();
      }, 300); // same duration as animations
      return () => clearTimeout(timer);
    }
  }, [closing, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black ${
          closing ? "animate-fadeOut" : "animate-fadeIn"
        }`}
      />
      {/* Modal */}
      <div
        className={`relative bg-background w-full max-w-lg rounded-t-2xl p-6 shadow-xl ${
          closing ? "animate-slideDown" : "animate-slideUp"
        }`}
        style={{ minHeight: "50vh" }}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            <h2 className="text-xl font-bold mb-4">{t(title)}</h2>
            <p className="text-base">{t(text)}</p>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            {actionLabel && onAction && (
              <button
                onClick={onAction}
                className="w-full py-3 px-4 rounded-xl font-semibold btn-click-animation bg-primary text-white"
              >
                {t(actionLabel)}
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-full py-3 bg-primary px-4 rounded-xl font-semibold btn-click-animation"
            >
              {t("close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
