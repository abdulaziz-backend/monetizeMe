import sqlite3 from 'sqlite3';
import { config } from './config.js';

export function setupDatabase(db) {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY,
        username TEXT,
        balance INTEGER DEFAULT 0,
        is_admin BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Initialize admin
    db.run(`
      INSERT OR IGNORE INTO users (user_id, username, is_admin)
      VALUES (?, 'admin', 1)
    `, [config.ADMIN_ID]);

    // Ads table
    db.run(`
      CREATE TABLE IF NOT EXISTS ads (
        ad_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        content TEXT,
        views_paid INTEGER,
        views_current INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `);

    // Channels table with revenue tracking
    db.run(`
      CREATE TABLE IF NOT EXISTS channels (
        channel_id INTEGER PRIMARY KEY,
        title TEXT,
        username TEXT,
        added_by INTEGER,
        total_revenue INTEGER DEFAULT 0,
        total_ads INTEGER DEFAULT 0,
        total_views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (added_by) REFERENCES users(user_id)
      )
    `);

    // Channel earnings table
    db.run(`
      CREATE TABLE IF NOT EXISTS channel_earnings (
        earning_id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel_id INTEGER,
        ad_id INTEGER,
        views INTEGER,
        amount INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (channel_id) REFERENCES channels(channel_id),
        FOREIGN KEY (ad_id) REFERENCES ads(ad_id)
      )
    `);

    // Transactions table
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        tx_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        amount INTEGER,
        type TEXT,
        status TEXT,
        payment_method TEXT,
        payment_details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `);

    // Withdrawals table
    db.run(`
      CREATE TABLE IF NOT EXISTS withdrawals (
        withdrawal_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        amount INTEGER,
        method TEXT,
        status TEXT,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `);

    // Payments table
    db.run(`
      CREATE TABLE IF NOT EXISTS payments (
        payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        amount INTEGER,
        method TEXT,
        status TEXT,
        payment_intent_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `);
  });
}