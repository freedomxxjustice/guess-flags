const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
    <div className="w-16 h-16 border-4 border-t-transparent border-primary rounded-full animate-spin" />
  </div>
);

export default LoadingSpinner;
