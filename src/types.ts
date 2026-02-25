export interface Account {
  id: number;
  name: string;
  currency: string;
  current_balance: number;
  created_at: string;
}

export interface Transaction {
  id: number;
  account_id: number;
  type: 'deposit' | 'withdrawal' | 'market_update';
  amount: number;
  balance_after: number;
  date: string;
  note?: string;
}

export interface Summary {
  totalAssets: number;
  cumulativeProfit: number;
  annualizedReturn: number;
  timeWeightedReturn: number;
}

export interface HistoryPoint {
  date: string;
  rate: number;
}
