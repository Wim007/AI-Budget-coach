import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, profile_type, monthly_income } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ error: 'Naam, e-mail en wachtwoord zijn verplicht.' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Wachtwoord moet minimaal 6 tekens zijn.' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    res.status(409).json({ error: 'Dit e-mailadres is al in gebruik.' });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const result = db
    .prepare(
      'INSERT INTO users (email, password, name, profile_type, monthly_income) VALUES (?, ?, ?, ?, ?)'
    )
    .run(email, hashed, name, profile_type || 'particulier', monthly_income || 0);

  const token = jwt.sign(
    { userId: result.lastInsertRowid, email },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );

  res.status(201).json({ token, message: 'Account aangemaakt.' });
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'E-mail en wachtwoord zijn verplicht.' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user) {
    res.status(401).json({ error: 'Ongeldig e-mailadres of wachtwoord.' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: 'Ongeldig e-mailadres of wachtwoord.' });
    return;
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profile_type: user.profile_type,
    },
  });
});

export default router;
