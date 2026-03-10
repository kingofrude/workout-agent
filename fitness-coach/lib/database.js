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

  // 用户操作
  getOrCreateUser(telegramId, name = null) {
    const existing = this.db.prepare(
      'SELECT * FROM users WHERE telegram_id = ?'
    ).get(telegramId);

    if (existing) return existing;

    const insert = this.db.prepare(
      'INSERT INTO users (telegram_id, name) VALUES (?, ?)'
    );
    const info = insert.run(telegramId, name);

    return this.db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  }

  getUserProfile(userId) {
    return this.db.prepare(
      'SELECT * FROM user_profiles WHERE user_id = ?'
    ).get(userId);
  }

  saveUserProfile(userId, profile) {
    const stmt = this.db.prepare(`
      INSERT INTO user_profiles (
        user_id, goal, experience, available_days, equipment, training_time, reminder_advance_minutes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        goal = excluded.goal,
        experience = excluded.experience,
        available_days = excluded.available_days,
        equipment = excluded.equipment,
        training_time = excluded.training_time,
        reminder_advance_minutes = excluded.reminder_advance_minutes,
        updated_at = CURRENT_TIMESTAMP
    `);

    return stmt.run(
      userId,
      profile.goal,
      profile.experience,
      JSON.stringify(profile.availableDays),
      JSON.stringify(profile.equipment),
      profile.trainingTime || '08:00',
      profile.reminderAdvanceMinutes || 30
    );
  }

  getUserSettings(userId) {
    let settings = this.db.prepare(
      'SELECT * FROM user_settings WHERE user_id = ?'
    ).get(userId);

    if (!settings) {
      this.db.prepare(
        'INSERT INTO user_settings (user_id) VALUES (?)'
      ).run(userId);
      settings = this.db.prepare(
        'SELECT * FROM user_settings WHERE user_id = ?'
      ).get(userId);
    }

    return settings;
  }

  // 动作库方法
  findExerciseByName(name) {
    return this.db.prepare(
      'SELECT * FROM exercises WHERE name = ? OR name_en = ?'
    ).get(name, name);
  }

  findExerciseById(id) {
    return this.db.prepare(
      'SELECT * FROM exercises WHERE id = ?'
    ).get(id);
  }

  searchExercises(filters = {}) {
    let query = 'SELECT * FROM exercises WHERE 1=1';
    const params = [];

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }
    if (filters.equipment) {
      query += ' AND equipment = ?';
      params.push(filters.equipment);
    }
    if (filters.difficulty) {
      query += ' AND difficulty = ?';
      params.push(filters.difficulty);
    }

    query += ' ORDER BY difficulty, name';

    return this.db.prepare(query).all(...params);
  }

  insertExercise(exercise) {
    const stmt = this.db.prepare(`
      INSERT INTO exercises (
        name, name_en, category, equipment, difficulty,
        description, image_path, muscle_primary, muscle_secondary, tips
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      exercise.name,
      exercise.nameEn,
      exercise.category,
      exercise.equipment,
      exercise.difficulty,
      exercise.description,
      exercise.imagePath,
      exercise.musclePrimary,
      exercise.muscleSecondary,
      JSON.stringify(exercise.tips || [])
    );
  }

  // 训练计划方法
  savePlan(userId, plan) {
    const stmt = this.db.prepare(`
      INSERT INTO workout_plans (user_id, name, week_day, muscle_group)
      VALUES (?, ?, ?, ?)
    `);

    return stmt.run(userId, plan.name, plan.weekDay, plan.muscleGroup);
  }

  savePlanExercises(planId, exercises) {
    const stmt = this.db.prepare(`
      INSERT INTO plan_exercises (
        plan_id, exercise_id, sets, reps_min, reps_max, rest_seconds, notes, order_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    exercises.forEach((ex, index) => {
      stmt.run(
        planId,
        ex.exerciseId,
        ex.sets,
        ex.repsMin,
        ex.repsMax,
        ex.restSeconds || 90,
        ex.notes || null,
        index
      );
    });
  }

  getPlanByWeekDay(userId, weekDay) {
    return this.db.prepare(`
      SELECT * FROM workout_plans
      WHERE user_id = ? AND week_day = ? AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `).get(userId, weekDay);
  }

  getPlanExercises(planId) {
    return this.db.prepare(`
      SELECT pe.*, e.name, e.description, e.image_path, e.tips
      FROM plan_exercises pe
      JOIN exercises e ON pe.exercise_id = e.id
      WHERE pe.plan_id = ?
      ORDER BY pe.order_index
    `).all(planId);
  }

  getUserPlans(userId, status = 'active') {
    return this.db.prepare(`
      SELECT * FROM workout_plans
      WHERE user_id = ? AND status = ?
      ORDER BY week_day
    `).all(userId, status);
  }

  // 训练记录方法
  createWorkoutLog({ userId, exerciseId, planId = null }) {
    const stmt = this.db.prepare(`
      INSERT INTO workout_logs (user_id, exercise_id, plan_id)
      VALUES (?, ?, ?)
    `);

    const info = stmt.run(userId, exerciseId, planId);
    return { lastInsertRowid: info.lastInsertRowid };
  }

  saveWorkoutSet({ logId, setNumber, weight, reps, rpe }) {
    const stmt = this.db.prepare(`
      INSERT INTO workout_sets (log_id, set_number, weight, reps, rpe)
      VALUES (?, ?, ?, ?, ?)
    `);

    return stmt.run(
      logId,
      setNumber,
      weight,
      reps,
      rpe || null
    );
  }

  saveWorkoutFeedback(logId, feeling, notes) {
    const stmt = this.db.prepare(`
      INSERT INTO workout_feedback (log_id, feeling, notes)
      VALUES (?, ?, ?)
    `);

    return stmt.run(logId, feeling, notes);
  }

  getWorkoutLogs(userId, filters = {}) {
    let query = `
      SELECT wl.*, e.name as exercise_name
      FROM workout_logs wl
      JOIN exercises e ON wl.exercise_id = e.id
      WHERE wl.user_id = ?
    `;
    const params = [userId];

    if (filters.exerciseId) {
      query += ' AND wl.exercise_id = ?';
      params.push(filters.exerciseId);
    }
    if (filters.startDate) {
      query += ' AND wl.logged_at >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ' AND wl.logged_at <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY wl.logged_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    return this.db.prepare(query).all(...params);
  }

  getWorkoutSets(logId) {
    return this.db.prepare(`
      SELECT * FROM workout_sets
      WHERE log_id = ?
      ORDER BY set_number
    `).all(logId);
  }

  // 身体指标方法（shared.db）
  saveBodyMetric({ telegramId, metricType, value, unit, source = 'fitness', notes = null }) {
    const sharedDbPath = this.dbPath.replace('fitness.db', 'shared.db');
    const sharedDb = new (require('better-sqlite3'))(sharedDbPath);

    const stmt = sharedDb.prepare(`
      INSERT INTO body_metrics (telegram_id, metric_type, value, unit, source, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(telegramId, metricType, value, unit, source, notes);
    sharedDb.close();
    return result;
  }

  getBodyMetrics(telegramId, metricType = null, limit = 100) {
    const sharedDbPath = this.dbPath.replace('fitness.db', 'shared.db');
    const sharedDb = new (require('better-sqlite3'))(sharedDbPath);

    let query = 'SELECT * FROM body_metrics WHERE telegram_id = ?';
    const params = [telegramId];

    if (metricType) {
      query += ' AND metric_type = ?';
      params.push(metricType);
    }

    query += ' ORDER BY measured_at DESC LIMIT ?';
    params.push(limit);

    const results = sharedDb.prepare(query).all(...params);
    sharedDb.close();
    return results;
  }

  close() {
    this.db.close();
  }
}

module.exports = FitnessDatabase;
