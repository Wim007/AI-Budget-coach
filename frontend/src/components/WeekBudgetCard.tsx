import { WeekBudget } from '@/types';

interface Props {
  budget: WeekBudget;
}

function formatEuro(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
  });
}

export default function WeekBudgetCard({ budget }: Props) {
  const pct = Math.min(100, budget.percentage_used);
  const barColor =
    pct >= 100 ? 'bg-red-500' : pct >= 75 ? 'bg-orange-400' : 'bg-green-500';
  const remainingColor =
    budget.remaining < 0 ? 'text-red-600' : 'text-green-700';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-1">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Weekbudget
        </p>
        <span className="text-xs text-gray-400">
          {formatDate(budget.week_start)} – {formatDate(budget.week_end)}
        </span>
      </div>

      <p className={`text-4xl font-bold mt-1 mb-4 ${remainingColor}`}>
        {formatEuro(budget.remaining)}
        <span className="text-base font-normal text-gray-400 ml-1">resterend</span>
      </p>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
        <div
          className={`h-3 rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Budget</p>
          <p className="text-sm font-semibold text-gray-700">
            {formatEuro(budget.weekly_budget)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Uitgegeven</p>
          <p className="text-sm font-semibold text-gray-700">
            {formatEuro(budget.spent_this_week)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Verbruikt</p>
          <p className={`text-sm font-semibold ${pct >= 75 ? 'text-orange-500' : 'text-gray-700'}`}>
            {budget.percentage_used.toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  );
}
