'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#C5A059', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#F59E0B'];

export interface CategoryItem {
  name: string;
  value: number;
}

export function CategoryPieChart({ data }: { data: CategoryItem[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#161A22',
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '0.75rem',
              color: '#F9FAFB',
              fontSize: '12px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export const FormatPieChart = CategoryPieChart;

interface PriceItem {
  range: string;
  count: number;
}

export function PriceDistributionBarChart({ data }: { data: PriceItem[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(125,125,125,0.1)" />
          <XAxis dataKey="range" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#161A22',
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '0.75rem',
              color: '#F9FAFB',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="count" fill="#C5A059" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PublisherCountItem {
  name: string;
  count: number;
}

export function PublisherVolumeBarChart({ data }: { data: PublisherCountItem[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(125,125,125,0.1)" />
          <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#161A22',
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '0.75rem',
              color: '#F9FAFB',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
