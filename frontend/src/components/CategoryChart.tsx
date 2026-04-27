'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CategorySummary } from '@/types';

interface Props {
  categories: CategorySummary[];
  title?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  boodschappen: 'Boodschappen',
  wonen: 'Wonen',
  vervoer: 'Vervoer',
  gezondheid: 'Gezondheid',
  restaurants: 'Uit eten',
  entertainment: 'Entertainment',
  kleding: 'Kleding',
  sparen: 'Sparen',
  overig: 'Overig',
};

const COLORS = [
  '#16a34a', '#22c55e', '#4ade80', '#86efac',
  '#f97316', '#fb923c', '#fbbf24', '#a78bfa', '#94a3b8',
];

const euroFormatter = (v: number) =>
  new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(v);

export default function CategoryChart({ categories, title = 'Uitgaven per categorie' }: Props) {
  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">{title}</p>
        <p className="text-gray-400 text-sm text-center py-8">
          Geen transacties gevonden voor deze periode.
        </p>
      </div>
    );
  }

  const data = categories.map((c) => ({
    name: CATEGORY_LABELS[c.category] ?? c.category,
    bedrag: c.total,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">{title}</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
          <XAxis
            type="number"
            tickFormatter={(v) => `€${v}`}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            tick={{ fontSize: 12, fill: '#374151' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => [euroFormatter(value), 'Uitgave']}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 13 }}
          />
          <Bar dataKey="bedrag" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
