import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleMonitor, deleteMonitor } from "../api/monitors";
import StatusBadge from "./StatusBadge";
import EditMonitorModal from "./EditMonitorModal";
import toast from "react-hot-toast";

function MonitorCard({ monitor }) {
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const toggleMutation = useMutation({
    mutationFn: () => toggleMonitor(monitor._id, !monitor.isActive),

    // Optimistic update: API call se PEHLE hi UI update kar do
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["monitors"] });

      const previousData = queryClient.getQueriesData({ queryKey: ["monitors"] });

      queryClient.setQueriesData({ queryKey: ["monitors"] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          monitors: old.monitors.map((m) =>
            m._id === monitor._id ? { ...m, isActive: !m.isActive } : m
          ),
        };
      });

      return { previousData };
    },

    // Agar API call fail ho jaye, purani state wapas laga do
    onError: (err, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Failed to update monitor status");
    },

    // Success ho ya fail, end me ek baar real data se sync kar lo
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteMonitor(monitor._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
      toast.success("Monitor deleted");
    },
    onError: () => {
      toast.error("Failed to delete monitor");
    },
  });

  const handleDelete = () => {
    if (confirm(`Delete monitor "${monitor.name}"?`)) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <Link
          to={`/monitors/${monitor._id}`}
          className="font-semibold text-gray-800 dark:text-gray-100 hover:underline"
        >
          {monitor.name}
        </Link>
        <StatusBadge status={monitor.lastStatus} />
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{monitor.url}</p>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        {monitor.method} · every {monitor.interval} min
      </p>

      <div className="flex justify-between items-center mt-2">
        <label className="flex items-center gap-2 text-sm cursor-pointer dark:text-gray-200">
          <input
            type="checkbox"
            checked={monitor.isActive}
            onChange={() => toggleMutation.mutate()}
          />
          {monitor.isActive ? "Active" : "Paused"}
        </label>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditOpen(true)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      <EditMonitorModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        monitor={monitor}
      />
    </div>
  );
}

export default MonitorCard;