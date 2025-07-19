export default function Timer({ timeLeft }: { timeLeft: number | null }) {
    return (
      <p className="text-lg mb-4">
        Time left: {timeLeft ?? "--"}s
      </p>
    );
  }