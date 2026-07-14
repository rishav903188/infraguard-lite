function StatusBadge({ status }) {
  const styles = {
    up: "bg-green-100 text-green-700",
    down: "bg-red-100 text-red-700",
    unknown: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        styles[status] || styles.unknown
      }`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;