import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { fetchGlobalAnalytics } from "../api/analytics";
import { useTheme } from "../context/ThemeContext";

function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const { data } = useQuery({
    queryKey: ["global-analytics"],
    queryFn: fetchGlobalAnalytics,
    refetchInterval: 30000,
    enabled: !!user,
  });

  const unreadCount = data?.unreadAlerts || 0;

  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-xl"
          aria-label="Open navigation menu"
        >
          ☰
        </button>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          InfraGuard Lite
        </h1>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <Link
              to="/alerts"
              className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full hover:bg-yellow-200"
            >
              🔔 {unreadCount} unread
            </Link>
          )}
          <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">
            {user.name}
          </span>
          <button
            onClick={toggleTheme}
            className="text-sm px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Toggle theme"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
          <button
            onClick={logout}
            className="text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

export default Navbar;
