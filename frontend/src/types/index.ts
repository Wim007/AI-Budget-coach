export interface User {
  id: number;
  email: string;
  name: string;
  profile_type: 'particulier' | 'zzp';
  monthly_income: number;
  fixed_costs?: FixedCost[];
}

export interface FixedCost {
  id: number;
  name: string;
  amount: number;
  category: string;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  source: string;
  created_at: string;
}

export interface WeekBudget {
  weekly_budget: number;
  spent_this_week: number;
  remaining: number;
  week_start: string;
  week_end: string;
  percentage_used: number;
}

export interface CategorySummary {
  category: string;
  total: number;
  count: number;
}

export interface CoachAdvice {
  summary: string;
  tips: string[];
  alert_level: 'green' | 'orange' | 'red';
}
