import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMonitor } from "../api/monitors";
import { monitorSchema } from "../validators/monitorSchema";

function EditMonitorModal({ isOpen, onClose, monitor }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(monitorSchema),
  });

  useEffect(() => {
    if (monitor) {
      reset({
        name: monitor.name,
        url: monitor.url,
        method: monitor.method,
        interval: monitor.interval,
      });
    }
  }, [monitor, reset]);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const mutation = useMutation({
    mutationFn: (formData) => updateMonitor(monitor._id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
      queryClient.invalidateQueries({ queryKey: ["monitor-analytics", monitor._id] });
      queryClient.invalidateQueries({ queryKey: ["global-analytics"] });
      onClose();
    },
  });

  const onSubmit = (formData) => {
    mutation.mutate({ ...formData, interval: Number(formData.interval) });
  };

  if (!isOpen || !monitor) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 id="edit-modal-title" className="text-lg font-bold mb-4 dark:text-gray-100">
          Edit Monitor
        </h3>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label htmlFor="edit-name" className="block text-sm font-medium mb-1 dark:text-gray-200">
              Name
            </label>
            <input
              id="edit-name"
              {...register("name")}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="edit-url" className="block text-sm font-medium mb-1 dark:text-gray-200">
              URL
            </label>
            <input
              id="edit-url"
              {...register("url")}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2"
            />
            {errors.url && (
              <p className="text-red-500 text-xs mt-1">{errors.url.message}</p>
            )}
          </div>

          <div className="mb-3 flex gap-3">
            <div className="flex-1">
              <label htmlFor="edit-method" className="block text-sm font-medium mb-1 dark:text-gray-200">
                Method
              </label>
              <select
                id="edit-method"
                {...register("method")}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2"
              >
                {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].map(
                  (m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="flex-1">
              <label htmlFor="edit-interval" className="block text-sm font-medium mb-1 dark:text-gray-200">
                Interval (min)
              </label>
              <input
                id="edit-interval"
                type="number"
                {...register("interval", { valueAsNumber: true })}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2"
              />
              {errors.interval && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.interval.message}
                </p>
              )}
            </div>
          </div>

          {mutation.isError && (
            <p className="text-red-600 text-sm mb-3">
              {mutation.error?.response?.data?.message || "Failed to update monitor"}
            </p>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="px-4 py-2 text-sm rounded-md bg-gray-900 text-white disabled:opacity-50"
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditMonitorModal;