import { useTheme } from "next-themes";

export const Loading = () => {
  // Use a simple div that matches the background color to prevent jarring flashes
  // The 'bg-background' utility class ensures it respects light/dark mode
  return (
    <div className="fixed inset-0 z-50 bg-background w-full h-screen" />
  );
};
