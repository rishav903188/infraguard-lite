import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMonitor } from "../api/monitors";
import { monitorSchema } from "../validators/monitorSchema";

function CreateMonitorModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(monitorSchema),
    defaultValues: { method: "GET", interval: 5 },
  });

  const mutation = useMutation({
    mutationFn: createMonitor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
      reset();
      onClose();
    },
  });

  const onSubmit = (formData) => {
    mutation.mutate({ ...formData, interval: Number(formData.interval) });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-bold mb-4">Create Monitor</h3>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              {...register("name")}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="My API"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">URL</label>
            <input
              {...register("url")}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="https://api.example.com/health"
            />
            {errors.url && (
              <p className="text-red-500 text-xs mt-1">{errors.url.message}</p>
            )}
          </div>

          <div className="mb-3 flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Method</label>
              <select
                {...register("method")}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
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
              <label className="block text-sm font-medium mb-1">
                Interval (min)
              </label>
              <input
                type="number"
                {...register("interval", { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
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
              {mutation.error?.response?.data?.message || "Failed to create monitor"}
            </p>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md border border-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="px-4 py-2 text-sm rounded-md bg-gray-900 text-white disabled:opacity-50"
            >
              {mutation.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateMonitorModal;