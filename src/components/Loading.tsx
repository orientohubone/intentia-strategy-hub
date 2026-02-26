export const Loading = () => {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center animate-pulse">
      {/* Skeleton / Smoothed entry placeholder */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="h-8 bg-muted/50 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="h-32 bg-muted/30 rounded"></div>
           <div className="h-32 bg-muted/30 rounded"></div>
           <div className="h-32 bg-muted/30 rounded"></div>
        </div>
        <div className="h-64 bg-muted/20 rounded"></div>
      </div>
    </div>
  );
};
