'use client';
import { useState } from 'react';
import { Transaction } from '@/types';
import { api } from '@/lib/api';

interface Props {
  transactions: Transaction[];
  onUpdate: () => void;
}

const CATEGORIES = [
  'boodschappen', 'wonen', 'vervoer', 'gezondheid',
  'restaurants', 'entertainment', 'kleding', 'sparen', 'overig',
];

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

const CATEGORY_COLORS: Record<string, string> = {
  boodschappen: 'bg-green-100 text-green-800',
  wonen: 'bg-blue-100 text-blue-800',
  vervoer: 'bg-yellow-100 text-yellow-800',
  gezondheid: 'bg-pink-100 text-pink-800',
  restaurants: 'bg-orange-100 text-orange-800',
  entertainment: 'bg-purple-100 text-purple-800',
  kleding: 'bg-red-100 text-red-800',
  sparen: 'bg-teal-100 text-teal-800',
  overig: 'bg-gray-100 text-gray-700',
};

function formatEuro(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(Math.abs(amount));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
  });
}

export default function TransactionList({ transactions, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCategoryChange(id: number, category: string) {
    setSaving(true);
    try {
      await api.transactions.updateCategory(id, category);
      onUpdate();
    } finally {
      setSaving(false);
      setEditingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Transactie verwijderen?')) return;
    await api.transactions.delete(id);
    onUpdate();
  }

  if (transactions.length === 0) {
    return (
      <p className="text-center text-gray-400 py-12 text-sm">
        Geen transacties gevonden. Synchroniseer je bank of voeg er handmatig een toe.
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center gap-3 py-3 px-1">
          <div className="text-xs text-gray-400 w-14 shrink-0">{formatDate(tx.date)}</div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800 truncate">{tx.description}</p>
          </div>

          {/* Category badge / selector */}
          {editingId === tx.id ? (
            <select
              autoFocus
              defaultValue={tx.category}
              disabled={saving}
              onChange={(e) => handleCategoryChange(tx.id, e.target.value)}
              onBlur={() => setEditingId(null)}
              className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => setEditingId(tx.id)}
              title="Klik om te wijzigen"
              className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                CATEGORY_COLORS[tx.category] ?? CATEGORY_COLORS.overig
              }`}
            >
              {CATEGORY_LABELS[tx.category] ?? tx.category}
            </button>
          )}

          <div
            className={`text-sm font-semibold w-20 text-right shrink-0 ${
              tx.amount >= 0 ? 'text-green-600' : 'text-gray-800'
            }`}
          >
            {tx.amount >= 0 ? '+' : '-'}
            {formatEuro(tx.amount)}
          </div>

          <button
            onClick={() => handleDelete(tx.id)}
            className="text-gray-300 hover:text-red-400 transition-colors shrink-0 text-sm"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
