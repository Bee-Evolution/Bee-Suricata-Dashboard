"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const LivePieChart: React.FC = () => {
  const [data, setData] = useState(() => [
    { name: "A", value: 400 },
    { name: "B", value: 300 },
    { name: "C", value: 300 },
    { name: "D", value: 200 },
  ]);

  useEffect(() => {
    const id = setInterval(() => {
      setData((d) =>
        d.map((seg) => ({
          ...seg,
          value: Math.max(
            10,
            Math.round(seg.value * (0.9 + Math.random() * 0.2)),
          ),
        })),
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          outerRadius={100}
          fill="#8884d8"
        >
          {data.map((entry, index) => (
            <Cell
              key={(entry as any).name || `cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default LivePieChart;
