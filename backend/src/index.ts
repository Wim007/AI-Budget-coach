import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import transactionRoutes from './routes/transactions';
import budgetRoutes from './routes/budget';
import coachRoutes from './routes/coach';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/coach', coachRoutes);

app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', message: 'AI Budgetcoach API draait.' })
);

app.listen(PORT, () => {
  console.log(`AI Budgetcoach backend draait op http://localhost:${PORT}`);
});

export default app;
