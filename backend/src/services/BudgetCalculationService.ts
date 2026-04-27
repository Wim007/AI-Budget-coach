import db from '../database';
import { WeekBudget, CategorySummary } from '../types';

export class BudgetCalculationService {
  getWeekBudget(userId: number): WeekBudget {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    const fixedResult = db
      .prepare('SELECT COALESCE(SUM(amount), 0) as total FROM fixed_costs WHERE user_id = ?')
      .get(userId) as any;

    const monthlyIncome: number = user?.monthly_income ?? 0;
    const totalFixed: number = fixedResult?.total ?? 0;

    // ZZP: gebruik 70% van inkomen als conservatieve schatting (buffer voor belasting/pensioen)
    const effectiveIncome =
      user?.profile_type === 'zzp' ? monthlyIncome * 0.7 : monthlyIncome;

    const weeklyBudget = Math.max(0, (effectiveIncome - totalFixed) / 4.33);

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = zondag
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - daysFromMonday);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const spentResult = db
      .prepare(
        `SELECT COALESCE(SUM(ABS(amount)), 0) as total
         FROM transactions
         WHERE user_id = ? AND date >= ? AND date <= ? AND amount < 0`
      )
      .get(userId, weekStartStr, weekEndStr) as any;

    const spentThisWeek: number = spentResult?.total ?? 0;
    const remaining = weeklyBudget - spentThisWeek;
    const percentageUsed =
      weeklyBudget > 0 ? (spentThisWeek / weeklyBudget) * 100 : 0;

    return {
      weekly_budget: Math.round(weeklyBudget * 100) / 100,
      spent_this_week: Math.round(spentThisWeek * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      week_start: weekStartStr,
      week_end: weekEndStr,
      percentage_used: Math.round(percentageUsed * 10) / 10,
    };
  }

  getCategorySummary(
    userId: number,
    weekStart?: string,
    weekEnd?: string
  ): CategorySummary[] {
    if (weekStart && weekEnd) {
      return db
        .prepare(
          `SELECT category,
                  ROUND(ABS(SUM(amount)), 2) as total,
                  COUNT(*) as count
           FROM transactions
           WHERE user_id = ? AND date >= ? AND date <= ? AND amount < 0
           GROUP BY category
           ORDER BY total DESC`
        )
        .all(userId, weekStart, weekEnd) as CategorySummary[];
    }

    return db
      .prepare(
        `SELECT category,
                ROUND(ABS(SUM(amount)), 2) as total,
                COUNT(*) as count
         FROM transactions
         WHERE user_id = ? AND amount < 0
         GROUP BY category
         ORDER BY total DESC`
      )
      .all(userId) as CategorySummary[];
  }
}
