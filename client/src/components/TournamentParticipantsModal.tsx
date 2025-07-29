import { useEffect, useState } from "react";
import { FaCrown } from "react-icons/fa";

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

  // Sort participants by score descending
  const sortedParticipants = [...participants].sort(
    (a, b) => b.score - a.score
  );

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
          maxHeight: "80vh",
        }}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            <h2 className="text-xl font-bold mb-4">{title}</h2>

            <div className="max-h-[60vh] overflow-auto hide-scrollbar">
              <ul className="divide-y divide-gray-600">
                {sortedParticipants.length === 0 && (
                  <li className="text-center text-gray-400 py-4">
                    No participants yet
                  </li>
                )}
                {sortedParticipants.map((p, index) => (
                  <li
                    key={p.user_id}
                    className="flex justify-between items-center py-3"
                  >
                    <div className="flex items-center gap-2">
                      {index < 3 && (
                        <FaCrown
                          className={`${
                            index === 0
                              ? "text-yellow-400"
                              : index === 1
                              ? "text-gray-300"
                              : "text-amber-700"
                          }`}
                          title={`Place #${index + 1}`}
                        />
                      )}
                      <span className="font-semibold">{p.username}</span>
                      {typeof p.place === "number" && (
                        <span className="ml-1 text-sm text-gray-400">
                          #{p.place}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-300 flex gap-3 items-center">
                      <span>Score: {p.score}</span>
                      {p.prize && (
                        <span className="bg-primary/20 text-primary rounded px-2 py-0.5 text-xs">
                          {p.prize.type}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {actionLabel && onAction && (
              <button
                onClick={onAction}
                className="w-full py-3 px-4 rounded-xl font-semibold btn bg-primary text-white"
              >
                {actionLabel}
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-full py-3 bg-primary px-4 rounded-xl font-semibold btn"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
