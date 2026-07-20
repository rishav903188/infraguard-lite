import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchMonitorAnalytics } from "../api/analytics";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import ResponseTimeChart from "../components/ResponseTimeChart";
import StatusTimeline from "../components/StatusTimeline";
import RecentAlertsList from "../components/RecentAlertsList";

function MonitorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["monitor-analytics", id],
    queryFn: () => fetchMonitorAnalytics(id),
    refetchInterval: 30000,
  });

  const previousStatus = useRef(null);

  useEffect(() => {
    if (!data?.monitor) return;

    const currentStatus = data.monitor.lastStatus;

    if (previousStatus.current && previousStatus.current !== currentStatus) {
      if (currentStatus === "down") {
        toast.error(`${data.monitor.name} is DOWN`);
      } else if (currentStatus === "up") {
        toast.success(`${data.monitor.name} is back UP`);
      }
    }

    previousStatus.current = currentStatus;
  }, [data?.monitor?.lastStatus, data?.monitor?.name]);

  if (isLoading) {
    return <p className="text-gray-500 dark:text-gray-400">Loading analytics...</p>;
  }

  if (isError || !data) {
    return (
      <div>
        <p className="text-red-600 mb-4">Failed to load monitor analytics.</p>
        <button
          onClick={() => navigate("/monitors")}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to Monitors
        </button>
      </div>
    );
  }

  const { monitor, stats, recentResults, recentAlerts } = data;

  return (
    <div>
      <button
        onClick={() => navigate("/monitors")}
        className="text-sm text-gray-500 dark:text-gray-400 hover:underline mb-4"
      >
        ← Back to Monitors
      </button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold dark:text-gray-100">{monitor.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{monitor.url}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {monitor.method} · every {monitor.interval} min
          </p>
        </div>
        <StatusBadge status={monitor.lastStatus} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Uptime"
          value={stats.uptimePercentage}
          suffix="%"
          color={
            stats.uptimePercentage >= 99
              ? "text-green-600 dark:text-green-400"
              : stats.uptimePercentage >= 95
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-red-600 dark:text-red-400"
          }
        />
        <StatCard label="Total Checks" value={stats.totalChecks} />
        <StatCard label="Total Failures" value={stats.totalFailures} />
        <StatCard
          label="Avg Response Time"
          value={stats.avgResponseTime}
          suffix=" ms"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
          Response Time (recent checks)
        </h3>
        <ResponseTimeChart results={recentResults} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
          Status Timeline
        </h3>
        <StatusTimeline results={recentResults} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
          Recent Alerts
        </h3>
        <RecentAlertsList alerts={recentAlerts} />
      </div>
    </div>
  );
}

export default MonitorDetail;