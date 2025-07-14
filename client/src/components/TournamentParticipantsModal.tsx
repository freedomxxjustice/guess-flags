import { useEffect, useState } from "react";

import type { ITournamentParticipant } from "../interfaces/ITournament";

interface TournamentParticipantsModalProps {
  title: string;
  participants: ITournamentParticipant[];
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export default function TournamentParticipantsModal({
  title,
  participants,
  onClose,
  actionLabel,
  onAction,
}: TournamentParticipantsModalProps) {
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
  };

  useEffect(() => {
    if (closing) {
      const timer = setTimeout(() => {
        onClose();
      }, 300);
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
        className={`relative bg-background w-full max-w-lg rounded-t-2xl p-6 shadow-xl overflow-auto ${
          closing ? "animate-slideDown" : "animate-slideUp"
        }`}
        style={{
          minHeight: "50vh",
          maxHeight: "80vh", // keep modal scrollable but max height limited
        }}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            {/* Participants list */}
            <ul className="divide-y divide-gray-600 max-h-[60vh] overflow-auto">
              {participants.length === 0 && (
                <li className="text-center text-gray-400 py-4">
                  No participants yet
                </li>
              )}
              {participants.map(
                ({ user_id, username, score, place, prize }) => (
                  <li
                    key={user_id}
                    className="flex justify-between items-center py-2"
                  >
                    <div>
                      <span className="font-semibold">{username}</span>
                      {place != null && (
                        <span className="ml-2 text-sm text-gray-400">
                          #{place}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-300 flex gap-4 items-center">
                      <span>Score: {score}</span>
                      {prize && (
                        <span className="bg-primary/20 text-primary rounded px-2 py-0.5 text-xs">
                          {prize.type}
                        </span>
                      )}
                    </div>
                  </li>
                )
              )}
            </ul>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            {actionLabel && onAction && (
              <button
                onClick={onAction}
                className="w-full py-3 px-4 rounded-xl font-semibold btn-click-animation bg-primary text-white"
              >
                {actionLabel}
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-full py-3 bg-primary px-4 rounded-xl font-semibold btn-click-animation"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
