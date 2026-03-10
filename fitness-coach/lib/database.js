// lib/database.js
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class FitnessDatabase {
  constructor(dbPath = null) {
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.dbPath = dbPath || path.join(dataDir, 'fitness.db');
    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initTables();
  }

  initTables() {
    this.db.exec(`
      -- 用户表
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id TEXT UNIQUE NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- 用户档案
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        goal TEXT NOT NULL,
        experience TEXT NOT NULL,
        available_days TEXT NOT NULL,
        equipment TEXT NOT NULL,
        training_time TEXT DEFAULT '08:00',
        reminder_advance_minutes INTEGER DEFAULT 30,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- 用户设置
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        reminder_enabled INTEGER DEFAULT 1,
        morning_reminder_time TEXT DEFAULT '08:00',
        training_reminder_advance INTEGER DEFAULT 30,
        timezone TEXT DEFAULT 'Asia/Shanghai',
        language TEXT DEFAULT 'zh-CN',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- 训练计划
      CREATE TABLE IF NOT EXISTS workout_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT,
        week_day TEXT NOT NULL,
        muscle_group TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- 计划动作详情
      CREATE TABLE IF NOT EXISTS plan_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plan_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        sets INTEGER NOT NULL,
        reps_min INTEGER NOT NULL,
        reps_max INTEGER NOT NULL,
        rest_seconds INTEGER DEFAULT 90,
        notes TEXT,
        order_index INTEGER NOT NULL,
        FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id)
      );

      -- 动作库
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        name_en TEXT,
        category TEXT NOT NULL,
        equipment TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        description TEXT NOT NULL,
        image_path TEXT,
        video_url TEXT,
        muscle_primary TEXT NOT NULL,
        muscle_secondary TEXT,
        tips TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- 训练记录
      CREATE TABLE IF NOT EXISTS workout_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        plan_id INTEGER,
        exercise_id INTEGER NOT NULL,
        logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON DELETE SET NULL,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id)
      );

      -- 训练组数
      CREATE TABLE IF NOT EXISTS workout_sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        log_id INTEGER NOT NULL,
        set_number INTEGER NOT NULL,
        weight REAL NOT NULL,
        reps INTEGER NOT NULL,
        rpe REAL,
        FOREIGN KEY (log_id) REFERENCES workout_logs(id) ON DELETE CASCADE
      );

      -- 训练感受
      CREATE TABLE IF NOT EXISTS workout_feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        log_id INTEGER NOT NULL UNIQUE,
        feeling TEXT,
        notes TEXT,
        FOREIGN KEY (log_id) REFERENCES workout_logs(id) ON DELETE CASCADE
      );

      -- 索引
      CREATE INDEX IF NOT EXISTS idx_workout_plans_user_day ON workout_plans(user_id, week_day, status);
      CREATE INDEX IF NOT EXISTS idx_plan_exercises_plan ON plan_exercises(plan_id, order_index);
      CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category, difficulty);
      CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises(equipment);
      CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON workout_logs(user_id, logged_at DESC);
      CREATE INDEX IF NOT EXISTS idx_workout_logs_exercise ON workout_logs(exercise_id, logged_at DESC);
    `);
  }

  close() {
    this.db.close();
  }
}

module.exports = FitnessDatabase;
