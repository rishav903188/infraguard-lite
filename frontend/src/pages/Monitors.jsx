import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMonitors } from "../api/monitors";
import MonitorCard from "../components/MonitorCard";
import CreateMonitorModal from "../components/CreateMonitorModal";
import Skeleton from "../components/Skeleton";

function Monitors() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 9;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["monitors", page, limit],
    queryFn: () => fetchMonitors({ page, limit }),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Monitors</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm"
        >
          + New Monitor
        </button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <Skeleton className="h-5 w-2/3 mb-3" />
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      )}
      {isError && <p className="text-red-600">Failed to load monitors.</p>}

      {data && data.monitors.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="mb-3">No monitors yet.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-blue-600 hover:underline"
          >
            Create your first monitor
          </button>
        </div>
      )}

      {data && data.monitors.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.monitors.map((monitor) => (
              <MonitorCard key={monitor._id} monitor={monitor} />
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

      <CreateMonitorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default Monitors;
