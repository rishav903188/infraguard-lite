import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchGlobalAnalytics } from "../api/analytics";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import Skeleton from "../components/Skeleton";

function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["global-analytics"],
    queryFn: fetchGlobalAnalytics,
    refetchInterval: 30000,
  });

  if (isLoading) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
          <Skeleton className="h-3 w-1/2 mb-3" />
          <Skeleton className="h-6 w-1/3" />
        </div>
      ))}
    </div>
  );
}

  if (isError || !data) {
    return <p className="text-red-600">Failed to load dashboard data.</p>;
  }

  if (data.totalMonitors === 0) {
    return (
      <div className="text-center py-24">
        <h2 className="text-xl font-bold mb-2">Welcome to InfraGuard Lite</h2>
        <p className="text-gray-500 mb-6">
          You haven't created any monitors yet.
        </p>
        <Link
          to="/monitors"
          className="bg-gray-900 text-white px-5 py-2.5 rounded-md text-sm inline-block"
        >
          Create your first monitor
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Monitors" value={data.totalMonitors} />
        <StatCard label="Active" value={data.activeMonitors} />
        <StatCard
          label="Up"
          value={data.monitorsUp}
          color="text-green-600"
        />
        <StatCard
          label="Down"
          value={data.monitorsDown}
          color={data.monitorsDown > 0 ? "text-red-600" : "text-gray-800"}
        />
        <StatCard
          label="Unread Alerts"
          value={data.unreadAlerts}
          color={data.unreadAlerts > 0 ? "text-yellow-600" : "text-gray-800"}
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-700">
          Monitors Overview
        </h3>
        <Link to="/monitors" className="text-sm text-blue-600 hover:underline">
          View all →
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
        {data.monitors.slice(0, 8).map((m) => (
          <Link
            key={m.id}
            to={`/monitors/${m.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {m.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{m.url}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {m.stats?.uptimePercentage != null && (
                <span className="text-xs text-gray-500">
                  {m.stats.uptimePercentage}% uptime
                </span>
              )}
              <StatusBadge status={m.lastStatus} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;