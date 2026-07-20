import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMonitors } from "../api/monitors";
import MonitorCard from "../components/MonitorCard";
import CreateMonitorModal from "../components/CreateMonitorModal";
import Skeleton from "../components/Skeleton";

function Monitors() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | up | down | paused
  const limit = 9;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["monitors", page, limit],
    queryFn: () => fetchMonitors({ page, limit }),
  });

  const filteredMonitors = useMemo(() => {
    if (!data?.monitors) return [];

    return data.monitors.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.url.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "paused" && !m.isActive) ||
        (statusFilter !== "paused" && m.lastStatus === statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [data?.monitors, searchTerm, statusFilter]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold dark:text-gray-100">Monitors</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
        >
          + New Monitor
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or URL..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-md px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="up">Up</option>
          <option value="down">Down</option>
          <option value="unknown">Unknown</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <Skeleton className="h-5 w-2/3 mb-3" />
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      )}

      {isError && <p className="text-red-600">Failed to load monitors.</p>}

      {data && data.monitors.length === 0 && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="mb-3">No monitors yet.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Create your first monitor
          </button>
        </div>
      )}

      {data && data.monitors.length > 0 && filteredMonitors.length === 0 && (
        <p className="text-center py-16 text-gray-500 dark:text-gray-400">
          No monitors match your search/filter.
        </p>
      )}

      {filteredMonitors.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMonitors.map((monitor) => (
              <MonitorCard key={monitor._id} monitor={monitor} />
            ))}
          </div>

          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-40 dark:border-gray-600 dark:text-gray-200"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(data.pagination.totalPages, p + 1))
              }
              disabled={page === data.pagination.totalPages}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-40 dark:border-gray-600 dark:text-gray-200"
            >
              Next
            </button>
          </div>
        </>
      )}

      <CreateMonitorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default Monitors;