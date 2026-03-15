import { Outlet } from "react-router";
import { ThemeProvider } from "next-themes";
import { Toaster } from "./ui/sonner";

export function Root() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
        <Outlet />
        <Toaster richColors position="top-right" />
      </div>
    </ThemeProvider>
  );
}
