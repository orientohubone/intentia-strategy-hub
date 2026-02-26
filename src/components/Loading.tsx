export const Loading = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-muted overflow-hidden">
      <div className="h-full bg-primary animate-progress origin-left" />
      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 90%; }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
