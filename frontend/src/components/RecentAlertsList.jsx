function RecentAlertsList({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return <p className="text-sm text-gray-400">No recent alerts.</p>;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {alerts.map((alert) => (
        <li key={alert._id} className="py-2 flex items-start gap-3">
          <span
            className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
              alert.type === "down" ? "bg-red-500" : "bg-green-500"
            }`}
          />
          <div>
            <p className="text-sm text-gray-800">{alert.message}</p>
            <p className="text-xs text-gray-400">
              {new Date(alert.createdAt).toLocaleString()}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default RecentAlertsList;