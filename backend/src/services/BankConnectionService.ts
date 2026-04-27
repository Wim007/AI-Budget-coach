import { CategorizationService } from './CategorizationService';

const categorizer = new CategorizationService();

const MOCK_TEMPLATES = [
  { description: 'Albert Heijn Supermarkt', amount: -67.45 },
  { description: 'Jumbo Boodschappen', amount: -43.20 },
  { description: 'Lidl Nederland', amount: -28.90 },
  { description: 'NS Treinreis', amount: -18.50 },
  { description: 'Shell Tankstation A10', amount: -85.00 },
  { description: 'Thuisbezorgd.nl', amount: -32.50 },
  { description: 'Netflix', amount: -15.99 },
  { description: 'Spotify Premium', amount: -10.99 },
  { description: 'Restaurant De Kleine Keuken', amount: -54.80 },
  { description: 'Apotheek de Gaper', amount: -12.40 },
  { description: 'H&M Online', amount: -79.95 },
  { description: 'GVB OV-chipkaart', amount: -20.00 },
  { description: 'Pathé Cinema Amsterdam', amount: -22.50 },
  { description: 'Kruidvat', amount: -15.30 },
  { description: 'Albert Heijn Supermarkt', amount: -58.20 },
  { description: 'Uber Eats', amount: -28.90 },
  { description: 'Zalando', amount: -89.90 },
  { description: 'BP Benzine', amount: -72.00 },
  { description: 'Tandarts Centrum Amsterdam', amount: -45.00 },
  { description: 'Jumbo Boodschappen', amount: -52.30 },
  { description: "McDonald's Amsterdam", amount: -18.40 },
  { description: 'Steam Games', amount: -29.99 },
  { description: 'Etos Drogist', amount: -24.60 },
  { description: 'NS Dagkaart', amount: -35.00 },
  { description: 'Albert Heijn Supermarkt', amount: -71.80 },
];

interface MockTransaction {
  user_id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  source: string;
}

export class BankConnectionService {
  getMockTransactions(userId: number): MockTransaction[] {
    const today = new Date();
    const transactions: MockTransaction[] = [];

    MOCK_TEMPLATES.forEach((tpl) => {
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);

      const variance = (Math.random() - 0.5) * 8;
      const amount = Math.round((tpl.amount + variance) * 100) / 100;

      transactions.push({
        user_id: userId,
        date: date.toISOString().split('T')[0],
        description: tpl.description,
        amount,
        category: categorizer.categorize(tpl.description),
        source: 'mock_bank',
      });
    });

    return transactions.sort((a, b) => b.date.localeCompare(a.date));
  }
}
