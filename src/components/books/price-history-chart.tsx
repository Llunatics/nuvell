'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { formatIDR } from '@/lib/formatters';

interface PricePoint {
  date: string;
  price: number;
  source: string;
}

interface PriceHistoryChartProps {
  data: PricePoint[];
}

export function PriceHistoryChart({ data }: PriceHistoryChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="glass-card p-4 rounded-xl h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" stroke="#6B7280" fontSize={11} />
          <YAxis
            stroke="#6B7280"
            fontSize={11}
            domain={['auto', 'auto']}
            tickFormatter={(v) => `Rp${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#12151C',
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#F9FAFB',
            }}
            formatter={(val: any) => [formatIDR(Number(val)), 'Harga']}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#C5A059"
            strokeWidth={2}
            dot={{ fill: '#C5A059', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
