import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function ResponseTimeChart({ results }) {
  const chartData = [...results]
    .reverse()
    .map((r) => ({
      time: new Date(r.checkedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      responseTime: r.responseTime,
      status: r.status,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No data yet — check back after the first health check runs.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="time" tick={{ fontSize: 11 }} />
        <YAxis
          tick={{ fontSize: 11 }}
          label={{ value: "ms", angle: -90, position: "insideLeft", fontSize: 11 }}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="responseTime"
          stroke="#111827"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default ResponseTimeChart;