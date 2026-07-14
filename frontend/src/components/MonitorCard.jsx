import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleMonitor, deleteMonitor } from "../api/monitors";
import StatusBadge from "./StatusBadge";

function MonitorCard({ monitor }) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: () => toggleMonitor(monitor._id, !monitor.isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteMonitor(monitor._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
    },
  });

  const handleDelete = () => {
    if (confirm(`Delete monitor "${monitor.name}"?`)) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <Link
          to={`/monitors/${monitor._id}`}
          className="font-semibold text-gray-800 hover:underline"
        >
          {monitor.name}
        </Link>
        <StatusBadge status={monitor.lastStatus} />
      </div>

      <p className="text-sm text-gray-500 truncate">{monitor.url}</p>

      <p className="text-xs text-gray-400">
        {monitor.method} · every {monitor.interval} min
      </p>

      <div className="flex justify-between items-center mt-2">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={monitor.isActive}
            onChange={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
          />
          {monitor.isActive ? "Active" : "Paused"}
        </label>

        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="text-xs text-red-600 hover:underline disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default MonitorCard;