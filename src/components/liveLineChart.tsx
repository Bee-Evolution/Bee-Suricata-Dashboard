"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { time: string; value: number };

const makePoint = (t: number) => ({
  time: new Date(t).toLocaleTimeString(),
  value: Math.round(Math.random() * 100),
});

const LiveLineChart: React.FC = () => {
  const [data, setData] = useState<Point[]>(() => {
    const now = Date.now();
    return Array.from({ length: 20 }).map((_, i) =>
      makePoint(now - (19 - i) * 1000),
    );
  });

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Simulate live updates every second. Replace with WebSocket or fetch to your API.
    intervalRef.current = window.setInterval(() => {
      setData((prev) => {
        const next = [...prev.slice(-19), makePoint(Date.now())];
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="time" minTickGap={20} />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#1976d2"
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LiveLineChart;
