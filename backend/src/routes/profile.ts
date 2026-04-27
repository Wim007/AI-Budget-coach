import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import db from '../database';

const router = Router();

router.get('/', authenticate, (req: Request, res: Response): void => {
  const user = db
    .prepare(
      'SELECT id, email, name, profile_type, monthly_income, created_at FROM users WHERE id = ?'
    )
    .get(req.user!.userId) as any;

  if (!user) {
    res.status(404).json({ error: 'Gebruiker niet gevonden.' });
    return;
  }

  const fixedCosts = db
    .prepare('SELECT * FROM fixed_costs WHERE user_id = ?')
    .all(req.user!.userId);

  res.json({ ...user, fixed_costs: fixedCosts });
});

router.put('/', authenticate, (req: Request, res: Response): void => {
  const { name, profile_type, monthly_income } = req.body;
  db.prepare(
    'UPDATE users SET name = ?, profile_type = ?, monthly_income = ? WHERE id = ?'
  ).run(name, profile_type, monthly_income, req.user!.userId);
  res.json({ message: 'Profiel bijgewerkt.' });
});

router.get('/fixed-costs', authenticate, (req: Request, res: Response): void => {
  const fixedCosts = db
    .prepare('SELECT * FROM fixed_costs WHERE user_id = ?')
    .all(req.user!.userId);
  res.json(fixedCosts);
});

router.post('/fixed-costs', authenticate, (req: Request, res: Response): void => {
  const { name, amount, category } = req.body;
  if (!name || amount === undefined) {
    res.status(400).json({ error: 'Naam en bedrag zijn verplicht.' });
    return;
  }
  const result = db
    .prepare(
      'INSERT INTO fixed_costs (user_id, name, amount, category) VALUES (?, ?, ?, ?)'
    )
    .run(req.user!.userId, name, Math.abs(Number(amount)), category || 'wonen');
  res.status(201).json({ id: result.lastInsertRowid, message: 'Vaste last toegevoegd.' });
});

router.delete('/fixed-costs/:id', authenticate, (req: Request, res: Response): void => {
  db.prepare('DELETE FROM fixed_costs WHERE id = ? AND user_id = ?').run(
    req.params.id,
    req.user!.userId
  );
  res.json({ message: 'Vaste last verwijderd.' });
});

export default router;
