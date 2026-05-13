"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface FunnelChartProps {
  data: { name: string; value: number; fill: string }[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#2A3542" />
        <XAxis type="number" stroke="#AAB4BF" />
        <YAxis dataKey="name" type="category" stroke="#AAB4BF" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{fill: '#151D26'}}
          contentStyle={{ backgroundColor: '#111820', borderColor: '#2A3542', color: '#F4F7F8' }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
