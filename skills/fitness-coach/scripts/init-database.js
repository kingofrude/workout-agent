// scripts/init-database.js
const FitnessDatabase = require('../lib/database');
const path = require('path');

console.log('正在初始化健身数据库...');

const db = new FitnessDatabase();
console.log('✓ 数据表创建成功');

// 同时初始化共享数据库
const sharedDbPath = path.join(__dirname, '../data/shared.db');
const Database = require('better-sqlite3');
const sharedDb = new Database(sharedDbPath);

sharedDb.exec(`
  CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT UNIQUE NOT NULL,
    name TEXT,
    age INTEGER,
    gender TEXT,
    height REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS body_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    measured_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    source TEXT DEFAULT 'fitness',
    notes TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_body_metrics_user_type_date
    ON body_metrics(telegram_id, metric_type, measured_at DESC);
`);

sharedDb.close();
console.log('✓ 共享数据库创建成功');

db.close();
console.log('✓ 数据库初始化完成！');
