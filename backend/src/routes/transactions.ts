import { Router, Request, Response } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { authenticate } from '../middleware/auth';
import db from '../database';
import { BankConnectionService } from '../services/BankConnectionService';
import { CategorizationService } from '../services/CategorizationService';

const router = Router();
const bankService = new BankConnectionService();
const categorizer = new CategorizationService();

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({ dest: uploadsDir });

router.get('/', authenticate, (req: Request, res: Response): void => {
  const { limit = '50', offset = '0', category, from, to } = req.query;

  let query = 'SELECT * FROM transactions WHERE user_id = ?';
  const params: (string | number)[] = [req.user!.userId];

  if (category) {
    query += ' AND category = ?';
    params.push(category as string);
  }
  if (from) {
    query += ' AND date >= ?';
    params.push(from as string);
  }
  if (to) {
    query += ' AND date <= ?';
    params.push(to as string);
  }

  query += ' ORDER BY date DESC, id DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const transactions = db.prepare(query).all(...params);
  const countResult = db
    .prepare('SELECT COUNT(*) as count FROM transactions WHERE user_id = ?')
    .get(req.user!.userId) as any;

  res.json({ transactions, total: countResult.count });
});

router.post('/', authenticate, (req: Request, res: Response): void => {
  const { date, description, amount, category } = req.body;
  if (!date || !description || amount === undefined) {
    res.status(400).json({ error: 'Datum, omschrijving en bedrag zijn verplicht.' });
    return;
  }
  const cat = category || categorizer.categorize(description);
  const result = db
    .prepare(
      'INSERT INTO transactions (user_id, date, description, amount, category, source) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(req.user!.userId, date, description, Number(amount), cat, 'manual');
  res.status(201).json({ id: result.lastInsertRowid });
});

router.post('/sync-bank', authenticate, (req: Request, res: Response): void => {
  const existing = db
    .prepare(
      "SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND source = 'mock_bank'"
    )
    .get(req.user!.userId) as any;

  if (existing.count > 0) {
    res.json({ message: 'Bank al gesynchroniseerd.', imported: 0 });
    return;
  }

  const mockTxs = bankService.getMockTransactions(req.user!.userId);
  const insert = db.prepare(
    'INSERT INTO transactions (user_id, date, description, amount, category, source) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const insertMany = db.transaction(
    (txs: typeof mockTxs) => {
      for (const tx of txs) {
        insert.run(tx.user_id, tx.date, tx.description, tx.amount, tx.category, tx.source);
      }
    }
  );

  insertMany(mockTxs);
  res.json({
    message: `${mockTxs.length} transacties geïmporteerd uit de mock-bank.`,
    imported: mockTxs.length,
  });
});

router.post(
  '/upload-csv',
  authenticate,
  upload.single('file'),
  (req: Request, res: Response): void => {
    if (!req.file) {
      res.status(400).json({ error: 'Geen bestand geüpload.' });
      return;
    }

    try {
      const content = fs.readFileSync(req.file.path, 'utf-8');
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as Array<{ date: string; description: string; amount: string }>;

      const insert = db.prepare(
        'INSERT INTO transactions (user_id, date, description, amount, category, source) VALUES (?, ?, ?, ?, ?, ?)'
      );

      const insertMany = db.transaction(
        (rows: typeof records) => {
          for (const row of rows) {
            const amount = parseFloat(row.amount.replace(',', '.'));
            if (isNaN(amount)) continue;
            const cat = categorizer.categorize(row.description);
            insert.run(req.user!.userId, row.date, row.description, amount, cat, 'csv');
          }
        }
      );

      insertMany(records);
      fs.unlinkSync(req.file.path);

      res.json({
        message: `${records.length} transacties geïmporteerd uit CSV.`,
        imported: records.length,
      });
    } catch {
      res.status(400).json({
        error:
          'Fout bij verwerking van het CSV-bestand. Verwacht formaat: date,description,amount',
      });
    }
  }
);

router.put('/:id/category', authenticate, (req: Request, res: Response): void => {
  const { category } = req.body;
  db.prepare(
    'UPDATE transactions SET category = ? WHERE id = ? AND user_id = ?'
  ).run(category, req.params.id, req.user!.userId);
  res.json({ message: 'Categorie bijgewerkt.' });
});

router.delete('/:id', authenticate, (req: Request, res: Response): void => {
  db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(
    req.params.id,
    req.user!.userId
  );
  res.json({ message: 'Transactie verwijderd.' });
});

export default router;
