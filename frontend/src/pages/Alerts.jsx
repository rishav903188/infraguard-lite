import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAlerts, markAllAlertsRead } from "../api/alerts";

function Alerts() {
  const [page, setPage] = useState(1);
  const limit = 15;
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["alerts", page, limit],
    queryFn: () => fetchAlerts({ page, limit }),
  });

  useEffect(() => {
    markAllAlertsRead().then(() => {
      queryClient.invalidateQueries({ queryKey: ["global-analytics"] });
    });
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Alerts</h2>

      {isLoading && <p className="text-gray-500">Loading alerts...</p>}
      {isError && <p className="text-red-600">Failed to load alerts.</p>}

      {data && data.alerts.length === 0 && (
        <p className="text-gray-500 text-center py-16">
          No alerts yet. You'll see updates here when a monitor goes down or
          recovers.
        </p>
      )}

      {data && data.alerts.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
            {data.alerts.map((alert) => (
              <div key={alert._id} className="flex items-start gap-3 px-4 py-3">
                <span
                  className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    alert.type === "down" ? "bg-red-500" : "bg-green-500"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-800">{alert.message}</p>
                  {alert.monitorId?.name && (
                    <p className="text-xs text-gray-400">
                      Monitor: {alert.monitorId.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                    alert.type === "down"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {alert.type}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(data.pagination.totalPages, p + 1))
              }
              disabled={page === data.pagination.totalPages}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Alerts;