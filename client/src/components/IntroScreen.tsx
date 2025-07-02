export default function IntroScreen() {
  return (
    <div className="fixed h-screen w-screen inset-0 z-51 flex items-center justify-center bg-black">
      <video
        src="/intro.mp4"
        autoPlay
        muted
        playsInline
        onEnded={() => {
          // Optionally do something when video finishes
        }}
        className="max-w-full max-h-full object-fill"
      />
    </div>
  );
}
