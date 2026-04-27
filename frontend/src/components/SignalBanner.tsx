'use client';
import { useState } from 'react';
import { WeekBudget } from '@/types';

interface Props {
  budget: WeekBudget;
}

export default function SignalBanner({ budget }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || budget.percentage_used < 75) return null;

  const isOver = budget.percentage_used >= 100;

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium mb-4 ${
        isOver
          ? 'bg-red-50 border border-red-200 text-red-800'
          : 'bg-orange-50 border border-orange-200 text-orange-800'
      }`}
    >
      <span>
        {isOver
          ? `Je weekbudget is overschreden — je hebt €${Math.abs(budget.remaining).toFixed(2)} te veel uitgegeven.`
          : `Let op: je hebt al ${budget.percentage_used.toFixed(0)}% van je weekbudget gebruikt.`}
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-4 text-xs opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}
