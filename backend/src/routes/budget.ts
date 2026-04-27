import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { BudgetCalculationService } from '../services/BudgetCalculationService';

const router = Router();
const budgetService = new BudgetCalculationService();

router.get('/week', authenticate, (req: Request, res: Response): void => {
  const budget = budgetService.getWeekBudget(req.user!.userId);
  const categories = budgetService.getCategorySummary(
    req.user!.userId,
    budget.week_start,
    budget.week_end
  );
  res.json({ budget, categories });
});

router.get('/categories', authenticate, (req: Request, res: Response): void => {
  const { from, to } = req.query;
  const categories = budgetService.getCategorySummary(
    req.user!.userId,
    from as string | undefined,
    to as string | undefined
  );
  res.json(categories);
});

export default router;
