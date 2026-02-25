import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("invest.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    currency TEXT DEFAULT 'CNY',
    current_balance REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER,
    type TEXT NOT NULL, -- 'deposit', 'withdrawal', 'market_update'
    amount REAL DEFAULT 0,
    balance_after REAL NOT NULL,
    date DATE NOT NULL,
    note TEXT,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  );

  CREATE TABLE IF NOT EXISTS daily_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    total_assets REAL NOT NULL,
    total_profit REAL NOT NULL,
    return_rate REAL NOT NULL, -- Time-weighted return rate
    UNIQUE(date)
  );
`);

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API Routes
  app.get("/api/accounts", (req, res) => {
    const accounts = db.prepare("SELECT * FROM accounts").all();
    res.json(accounts);
  });

  app.post("/api/accounts", (req, res) => {
    const { name, currency, initial_balance } = req.body;
    const result = db.prepare("INSERT INTO accounts (name, currency, current_balance) VALUES (?, ?, ?)").run(name, currency, initial_balance);
    const accountId = result.lastInsertRowid;
    
    // Initial transaction
    db.prepare("INSERT INTO transactions (account_id, type, amount, balance_after, date) VALUES (?, 'deposit', ?, ?, ?)")
      .run(accountId, initial_balance, initial_balance, new Date().toISOString().split('T')[0]);
      
    res.json({ id: accountId });
  });

  app.get("/api/accounts/:id/transactions", (req, res) => {
    const transactions = db.prepare("SELECT * FROM transactions WHERE account_id = ? ORDER BY date DESC, id DESC").all(req.params.id);
    res.json(transactions);
  });

  app.post("/api/transactions", (req, res) => {
    const { account_id, type, amount, balance_after, date, note } = req.body;
    
    db.transaction(() => {
      db.prepare("INSERT INTO transactions (account_id, type, amount, balance_after, date, note) VALUES (?, ?, ?, ?, ?, ?)")
        .run(account_id, type, amount, balance_after, date, note);
      
      db.prepare("UPDATE accounts SET current_balance = ? WHERE id = ?")
        .run(balance_after, account_id);
    })();

    res.json({ success: true });
  });

  app.get("/api/summary", (req, res) => {
    const accounts = db.prepare("SELECT * FROM accounts").all();
    const totalAssets = accounts.reduce((sum: any, acc: any) => sum + acc.current_balance, 0);
    
    // Simple mock for cumulative profit and rates for now
    // In a real app, these would be calculated from transaction history
    res.json({
      totalAssets,
      cumulativeProfit: 736489.74, // Mocked based on screenshot
      annualizedReturn: 2.83,
      timeWeightedReturn: 9.15
    });
  });

  app.get("/api/history", (req, res) => {
    // Mock history for chart
    const history = [
      { date: '2023-01-01', rate: -4.00 },
      { date: '2023-06-01', rate: 12.50 },
      { date: '2024-01-01', rate: 5.20 },
      { date: '2024-06-01', rate: 18.30 },
      { date: '2025-01-01', rate: 8.40 },
      { date: '2026-02-22', rate: 9.15 },
    ];
    res.json(history);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
