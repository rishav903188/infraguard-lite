function StatCard({ label, value, suffix = "", color = "text-gray-800" }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {value ?? "—"}
        {value !== null && value !== undefined ? suffix : ""}
      </p>
    </div>
  );
}

export default StatCard;