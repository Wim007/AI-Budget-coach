'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TransactionList from '@/components/TransactionList';
import { api } from '@/lib/api';
import { Transaction } from '@/types';

const CATEGORIES = [
  'boodschappen', 'wonen', 'vervoer', 'gezondheid',
  'restaurants', 'entertainment', 'kleding', 'sparen', 'overig',
];

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [newTx, setNewTx] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: '',
  });

  const loadTransactions = useCallback(async () => {
    try {
      const data = await api.transactions.list({ limit: '100' });
      setTransactions(data.transactions);
      setTotal(data.total);
    } catch {
      localStorage.removeItem('token');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
      return;
    }
    loadTransactions();
  }, [loadTransactions, router]);

  async function handleSync() {
    setSyncing(true);
    try {
      const result = await api.transactions.syncBank();
      alert(result.message);
      loadTransactions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSyncing(false);
    }
  }

  async function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await api.transactions.uploadCsv(file);
    alert(result.message || result.error);
    if (fileRef.current) fileRef.current.value = '';
    loadTransactions();
  }

  async function handleAddTx(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.transactions.create({
        date: newTx.date,
        description: newTx.description,
        amount: Number(newTx.amount),
        category: newTx.category || undefined,
      });
      setNewTx({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: '' });
      setShowAddForm(false);
      loadTransactions();
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl font-semibold text-gray-800">
            Transacties <span className="text-sm font-normal text-gray-400">({total} totaal)</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              + Toevoegen
            </button>
            <label className="text-xs bg-white border border-gray-200 hover:border-green-400 text-gray-600 hover:text-green-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
              CSV uploaden
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCsvUpload}
              />
            </label>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="text-xs bg-white border border-gray-200 hover:border-green-400 text-gray-600 hover:text-green-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {syncing ? 'Bezig…' : '⟳ Bank sync'}
            </button>
          </div>
        </div>

        {/* CSV format hint */}
        <p className="text-xs text-gray-400">
          CSV-formaat: <code className="bg-gray-100 px-1 rounded">date,description,amount</code> (bijv.{' '}
          <code className="bg-gray-100 px-1 rounded">2024-01-15,Albert Heijn,-45.30</code>)
        </p>

        {/* Add form */}
        {showAddForm && (
          <form
            onSubmit={handleAddTx}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3"
          >
            <p className="text-sm font-medium text-gray-700">Transactie toevoegen</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Datum</label>
                <input
                  type="date"
                  value={newTx.date}
                  onChange={(e) => setNewTx((p) => ({ ...p, date: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Bedrag (negatief = uitgave)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newTx.amount}
                  onChange={(e) => setNewTx((p) => ({ ...p, amount: e.target.value }))}
                  required
                  placeholder="-45.00"
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Omschrijving</label>
              <input
                type="text"
                value={newTx.description}
                onChange={(e) => setNewTx((p) => ({ ...p, description: e.target.value }))}
                required
                placeholder="Albert Heijn"
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Categorie (optioneel — anders automatisch)</label>
              <select
                value={newTx.category}
                onChange={(e) => setNewTx((p) => ({ ...p, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
              >
                <option value="">Automatisch detecteren</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5"
              >
                Annuleren
              </button>
              <button
                type="submit"
                className="text-xs bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg"
              >
                Opslaan
              </button>
            </div>
          </form>
        )}

        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {loading ? (
            <p className="text-center text-gray-400 py-8 text-sm">Laden…</p>
          ) : (
            <TransactionList transactions={transactions} onUpdate={loadTransactions} />
          )}
        </div>
      </main>
    </div>
  );
}
