'use client';
import { useEffect, useState, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { FixedCost } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profile_type: 'particulier',
    monthly_income: 0,
  });
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [newCost, setNewCost] = useState({ name: '', amount: '', category: 'wonen' });

  const loadProfile = useCallback(async () => {
    try {
      const data = await api.profile.get();
      setProfile({
        name: data.name,
        email: data.email,
        profile_type: data.profile_type,
        monthly_income: data.monthly_income,
      });
      setFixedCosts(data.fixed_costs || []);
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
    loadProfile();
  }, [loadProfile, router]);

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.profile.update(profile);
      setMessage('Profiel opgeslagen.');
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddCost(e: FormEvent) {
    e.preventDefault();
    try {
      await api.profile.addFixedCost({
        name: newCost.name,
        amount: Number(newCost.amount),
        category: newCost.category,
      });
      setNewCost({ name: '', amount: '', category: 'wonen' });
      loadProfile();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDeleteCost(id: number) {
    if (!confirm('Vaste last verwijderen?')) return;
    await api.profile.deleteFixedCost(id);
    loadProfile();
  }

  const totalFixed = fixedCosts.reduce((sum, c) => sum + c.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Laden…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Profiel & instellingen</h2>

        {/* Profile form */}
        <form
          onSubmit={handleSaveProfile}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
        >
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Persoonlijke gegevens
          </p>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
              {message}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mailadres</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type gebruiker</label>
            <select
              value={profile.profile_type}
              onChange={(e) => setProfile((p) => ({ ...p, profile_type: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="particulier">Particulier (vast salaris)</option>
              <option value="zzp">ZZP / Freelancer (wisselend inkomen)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maandelijks netto inkomen (€)
            </label>
            <input
              type="number"
              min="0"
              step="50"
              value={profile.monthly_income}
              onChange={(e) =>
                setProfile((p) => ({ ...p, monthly_income: Number(e.target.value) }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {profile.profile_type === 'zzp' && (
              <p className="text-xs text-gray-400 mt-1">
                Als ZZP'er rekenen we met 70% (€
                {(profile.monthly_income * 0.7).toFixed(0)}) als effectief maandinkomen.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2 px-5 rounded-lg text-sm transition-colors"
          >
            {saving ? 'Opslaan…' : 'Opslaan'}
          </button>
        </form>

        {/* Fixed costs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Vaste lasten
            </p>
            <span className="text-sm font-semibold text-gray-700">
              Totaal: €{totalFixed.toFixed(2)}/mnd
            </span>
          </div>

          {fixedCosts.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {fixedCosts.map((cost) => (
                <li key={cost.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <span className="text-gray-800">{cost.name}</span>
                    <span className="ml-2 text-xs text-gray-400">{cost.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-700">€{cost.amount.toFixed(2)}</span>
                    <button
                      onClick={() => handleDeleteCost(cost.id)}
                      className="text-gray-300 hover:text-red-400 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">Nog geen vaste lasten ingevoerd.</p>
          )}

          {/* Add fixed cost */}
          <form onSubmit={handleAddCost} className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-xs font-medium text-gray-600">Vaste last toevoegen</p>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Huur"
                value={newCost.name}
                onChange={(e) => setNewCost((p) => ({ ...p, name: e.target.value }))}
                required
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm col-span-1"
              />
              <input
                type="number"
                placeholder="800"
                min="0"
                step="0.01"
                value={newCost.amount}
                onChange={(e) => setNewCost((p) => ({ ...p, amount: e.target.value }))}
                required
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              />
              <select
                value={newCost.category}
                onChange={(e) => setNewCost((p) => ({ ...p, category: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
              >
                <option value="wonen">Wonen</option>
                <option value="vervoer">Vervoer</option>
                <option value="gezondheid">Gezondheid</option>
                <option value="entertainment">Entertainment</option>
                <option value="overig">Overig</option>
              </select>
            </div>
            <button
              type="submit"
              className="text-xs bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg"
            >
              + Toevoegen
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
