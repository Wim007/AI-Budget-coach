import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { BudgetCalculationService } from '../services/BudgetCalculationService';
import { CoachService } from '../services/CoachService';
import db from '../database';

const router = Router();
const budgetService = new BudgetCalculationService();
const coachService = new CoachService();

router.get('/advice', authenticate, (req: Request, res: Response): void => {
  const user = db
    .prepare('SELECT profile_type FROM users WHERE id = ?')
    .get(req.user!.userId) as any;

  const budget = budgetService.getWeekBudget(req.user!.userId);
  const categories = budgetService.getCategorySummary(
    req.user!.userId,
    budget.week_start,
    budget.week_end
  );
  const advice = coachService.generateAdvice(
    budget,
    categories,
    user?.profile_type || 'particulier'
  );

  res.json(advice);
});

export default router;
