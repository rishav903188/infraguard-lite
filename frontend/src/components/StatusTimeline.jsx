function StatusTimeline({ results }) {
  // Chronological order — oldest left, newest right
  const ordered = [...results].reverse().slice(-40); // last 40 blocks max

  if (ordered.length === 0) {
    return <p className="text-sm text-gray-400">No checks recorded yet.</p>;
  }

  return (
    <div className="flex gap-1 items-end overflow-x-auto py-2">
      {ordered.map((r, i) => (
        <div
          key={i}
          title={`${r.status.toUpperCase()} — ${new Date(
            r.checkedAt
          ).toLocaleString()}`}
          className={`w-2 h-8 rounded-sm shrink-0 ${
            r.status === "up" ? "bg-green-500" : "bg-red-500"
          }`}
        />
      ))}
    </div>
  );
}

export default StatusTimeline;