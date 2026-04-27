'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import WeekBudgetCard from '@/components/WeekBudgetCard';
import CategoryChart from '@/components/CategoryChart';
import CoachAdvice from '@/components/CoachAdvice';
import SignalBanner from '@/components/SignalBanner';
import TransactionList from '@/components/TransactionList';
import { api } from '@/lib/api';
import { WeekBudget, CategorySummary, CoachAdvice as CoachAdviceType, Transaction } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [budget, setBudget] = useState<WeekBudget | null>(null);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [advice, setAdvice] = useState<CoachAdviceType | null>(null);
  const [recentTxs, setRecentTxs] = useState<Transaction[]>([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [weekData, adviceData, profileData, txData] = await Promise.all([
        api.budget.getWeek(),
        api.coach.getAdvice(),
        api.profile.get(),
        api.transactions.list({ limit: '5' }),
      ]);
      setBudget(weekData.budget);
      setCategories(weekData.categories);
      setAdvice(adviceData);
      setUserName(profileData.name);
      setRecentTxs(txData.transactions);
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
    loadData();
  }, [loadData, router]);

  async function handleSyncBank() {
    setSyncing(true);
    try {
      const result = await api.transactions.syncBank();
      alert(result.message);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Dashboard laden…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Hoi {userName} 👋
          </h2>
          <button
            onClick={handleSyncBank}
            disabled={syncing}
            className="text-xs bg-white border border-gray-200 hover:border-green-400 text-gray-600 hover:text-green-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {syncing ? 'Synchroniseren…' : '⟳ Bank synchroniseren'}
          </button>
        </div>

        {/* Alert banner */}
        {budget && <SignalBanner budget={budget} />}

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budget && <WeekBudgetCard budget={budget} />}
          {advice && <CoachAdvice advice={advice} />}
        </div>

        {/* Category chart */}
        <CategoryChart
          categories={categories}
          title="Uitgaven deze week per categorie"
        />

        {/* Recent transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Recente transacties
            </p>
            <Link
              href="/transactions"
              className="text-xs text-green-700 font-medium hover:underline"
            >
              Alle transacties →
            </Link>
          </div>
          <TransactionList transactions={recentTxs} onUpdate={loadData} />
        </div>
      </main>
    </div>
  );
}
