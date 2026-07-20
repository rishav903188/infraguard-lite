function StatCard({ label, value, suffix = "", color = "text-gray-800 dark:text-gray-100" }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {value ?? "—"}
        {value !== null && value !== undefined ? suffix : ""}
      </p>
    </div>
  );
}

export default StatCard;