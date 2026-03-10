# Fitness Coach 实现计划

> **给 Claude:** 必须使用的子技能：使用 superpowers:executing-plans 逐任务实现此计划。

**目标：** 构建一个基于 OpenClaw 的私人 AI 健身教练，提供训练计划制定、进度追踪、智能提醒和数据可视化功能。

**架构：** 纯 OpenClaw Skill 实现，使用 SQLite 数据库（fitness.db 用于训练数据，shared.db 用于跨助理共享的身体指标），8 个工具函数，定时任务调度器，图表生成器。

**技术栈：** Node.js, OpenClaw Skill API, better-sqlite3, chartjs-node-canvas, cron, date-fns

---

## 阶段 1：项目搭建与数据库基础

### 任务 1：初始化项目结构

**文件：**
- 创建：`fitness-coach/package.json`
- 创建：`fitness-coach/README.md`
- 创建：`fitness-coach/.gitignore`

**步骤 1：创建 skill 目录**

```bash
mkdir -p fitness-coach
cd fitness-coach
```

**步骤 2：初始化 package.json**

```json
{
  "name": "fitness-coach-skill",
  "version": "1.0.0",
  "description": "OpenClaw 私人 AI 健身教练",
  "main": "SKILL.md",
  "scripts": {
    "init": "node scripts/init-database.js",
    "seed": "node scripts/seed-exercises.js",
    "test": "node --test"
  },
  "dependencies": {
    "better-sqlite3": "^9.6.0",
    "chartjs-node-canvas": "^4.1.6",
    "chart.js": "^4.4.0",
    "date-fns": "^3.6.0",
    "cron": "^3.1.6"
  },
  "devDependencies": {},
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**步骤 3：创建目录结构**

```bash
mkdir -p tools lib data assets/exercises scripts
```

**步骤 4：创建 .gitignore**

```
node_modules/
data/*.db
data/charts/
*.log
.DS_Store
```

**步骤 5：创建 README.md**

```markdown
# Fitness Coach Skill

OpenClaw 私人 AI 健身教练

## 安装

```bash
npm install
npm run init
npm run seed
```

## 使用

在 OpenClaw 中启用：
```bash
openclaw skills enable fitness-coach
```
```

**步骤 6：提交**

```bash
git add .
git commit -m "chore: 初始化 fitness-coach skill 项目结构"
```

---

### 任务 2：数据库 Schema 实现

**文件：**
- 创建：`lib/database.js`
- 创建：`scripts/init-database.js`

**步骤 1：编写 database.js 及 schema 初始化**

```javascript
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
```

**步骤 2：编写 init-database.js 脚本**

```javascript
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
```

**步骤 3：测试数据库初始化**

```bash
npm install
npm run init
```

预期输出：
```
正在初始化健身数据库...
✓ 数据表创建成功
✓ 共享数据库创建成功
✓ 数据库初始化完成！
```

**步骤 4：验证数据库文件存在**

```bash
ls -la data/
```

预期：`fitness.db` 和 `shared.db` 文件存在

**步骤 5：提交**

```bash
git add lib/database.js scripts/init-database.js
git commit -m "feat: 实现数据库 schema 和初始化"
```

---

### 任务 3：数据库操作层

**文件：**
- 修改：`lib/database.js`（添加 CRUD 方法）

**步骤 1：添加用户管理方法**

```javascript
// 添加到 FitnessDatabase 类中

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
      // 创建默认设置
      this.db.prepare(
        'INSERT INTO user_settings (user_id) VALUES (?)'
      ).run(userId);
      settings = this.db.prepare(
        'SELECT * FROM user_settings WHERE user_id = ?'
      ).get(userId);
    }

    return settings;
  }
```

**步骤 2：添加动作库方法**

```javascript
// 添加到 FitnessDatabase 类

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
```

**步骤 3：添加训练计划方法**

```javascript
// 添加到 FitnessDatabase 类

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
```

**步骤 4：添加训练记录方法**

```javascript
// 添加到 FitnessDatabase 类

  createWorkoutLog(userId, exerciseId, planId = null) {
    const stmt = this.db.prepare(`
      INSERT INTO workout_logs (user_id, exercise_id, plan_id)
      VALUES (?, ?, ?)
    `);

    const info = stmt.run(userId, exerciseId, planId);
    return info.lastInsertRowid;
  }

  saveWorkoutSet(logId, setNumber, setData) {
    const stmt = this.db.prepare(`
      INSERT INTO workout_sets (log_id, set_number, weight, reps, rpe)
      VALUES (?, ?, ?, ?, ?)
    `);

    return stmt.run(
      logId,
      setNumber,
      setData.weight,
      setData.reps,
      setData.rpe || null
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
```

**步骤 5：添加身体指标方法（shared.db）**

```javascript
// 添加到 FitnessDatabase 类

  saveBodyMetric(telegramId, metricType, value, unit, source = 'fitness', notes = null) {
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
```

**步骤 6：提交**

```bash
git add lib/database.js
git commit -m "feat: 添加数据库 CRUD 操作方法"
```

---

## 阶段 2：核心业务逻辑

### 任务 4：计划生成器

**文件：**
- 创建：`lib/plan-generator.js`
- 创建：`lib/utils.js`

**步骤 1：创建 utils.js 辅助函数**

```javascript
// lib/utils.js

/**
 * 星期映射
 */
const WEEK_DAYS = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

/**
 * 分化配置
 */
const SPLIT_CONFIGS = {
  'push-pull-legs': {
    days: 3,
    split: ['push', 'pull', 'legs'],
    muscleGroups: {
      push: ['chest', 'shoulders', 'triceps'],
      pull: ['back', 'biceps'],
      legs: ['legs', 'core']
    }
  },
  'upper-lower': {
    days: 4,
    split: ['upper', 'lower', 'upper', 'lower'],
    muscleGroups: {
      upper: ['chest', 'back', 'shoulders', 'arms'],
      lower: ['legs', 'core']
    }
  },
  'bodybuilding': {
    days: 5,
    split: ['chest', 'back', 'legs', 'shoulders', 'arms'],
    muscleGroups: {
      chest: ['chest'],
      back: ['back'],
      legs: ['legs'],
      shoulders: ['shoulders'],
      arms: ['biceps', 'triceps']
    }
  }
};

function determineSplit(daysPerWeek, goal) {
  if (daysPerWeek === 3) {
    return 'push-pull-legs';
  } else if (daysPerWeek === 4) {
    return 'upper-lower';
  } else if (daysPerWeek >= 5) {
    return 'bodybuilding';
  }
  // 默认 3 天分化
  return 'push-pull-legs';
}

function getSetsAndReps(experience, goal) {
  const configs = {
    beginner: {
      muscle_gain: { sets: 3, repsMin: 8, repsMax: 12 },
      fat_loss: { sets: 3, repsMin: 12, repsMax: 15 },
      strength: { sets: 4, repsMin: 5, repsMax: 8 },
      endurance: { sets: 3, repsMin: 15, repsMax: 20 }
    },
    intermediate: {
      muscle_gain: { sets: 4, repsMin: 8, repsMax: 12 },
      fat_loss: { sets: 4, repsMin: 12, repsMax: 15 },
      strength: { sets: 5, repsMin: 3, repsMax: 6 },
      endurance: { sets: 4, repsMin: 15, repsMax: 20 }
    },
    advanced: {
      muscle_gain: { sets: 4, repsMin: 6, repsMax: 10 },
      fat_loss: { sets: 4, repsMin: 10, repsMax: 15 },
      strength: { sets: 5, repsMin: 1, repsMax: 5 },
      endurance: { sets: 4, repsMin: 20, repsMax: 30 }
    }
  };

  return configs[experience]?.[goal] || configs.beginner.muscle_gain;
}

module.exports = {
  WEEK_DAYS,
  SPLIT_CONFIGS,
  determineSplit,
  getSetsAndReps
};
```

**步骤 2：创建 plan-generator.js**

```javascript
// lib/plan-generator.js
const { determineSplit, SPLIT_CONFIGS, getSetsAndReps } = require('./utils');

class PlanGenerator {
  constructor(database) {
    this.db = database;
  }

  generate({ goal, experience, availableDays, equipment }) {
    // 1. 确定分化类型
    const splitType = determineSplit(availableDays.length, goal);
    const splitConfig = SPLIT_CONFIGS[splitType];

    // 2. 为可用日期分配肌群
    const plans = [];
    const splitSequence = splitConfig.split;

    for (let i = 0; i < availableDays.length; i++) {
      const dayName = availableDays[i];
      const splitName = splitSequence[i % splitSequence.length];
      const muscleGroups = splitConfig.muscleGroups[splitName];

      // 3. 为当天选择动作
      const exercises = this.selectExercises(
        muscleGroups,
        experience,
        equipment,
        goal
      );

      plans.push({
        weekDay: dayName,
        muscleGroup: this.formatMuscleGroupName(muscleGroups),
        exercises: exercises
      });
    }

    return plans;
  }

  selectExercises(muscleGroups, experience, equipment, goal) {
    const exercises = [];
    const setsReps = getSetsAndReps(experience, goal);

    // 动作选择优先级：复合动作 -> 孤立动作
    for (const muscleGroup of muscleGroups) {
      const available = this.db.searchExercises({
        category: muscleGroup,
        equipment: equipment[0] // 简化处理，使用第一个器械
      });

      if (available.length === 0) continue;

      // 每个肌群选择 2-3 个动作
      const count = muscleGroups.length === 1 ? 3 : 2;
      const selected = available.slice(0, count);

      selected.forEach(ex => {
        exercises.push({
          exerciseId: ex.id,
          name: ex.name,
          sets: setsReps.sets,
          repsMin: setsReps.repsMin,
          repsMax: setsReps.repsMax,
          restSeconds: this.getRestTime(goal, experience)
        });
      });
    }

    return exercises;
  }

  formatMuscleGroupName(groups) {
    const names = {
      chest: '胸',
      back: '背',
      legs: '腿',
      shoulders: '肩',
      biceps: '二头',
      triceps: '三头',
      core: '核心',
      arms: '手臂'
    };

    return groups.map(g => names[g] || g).join('+');
  }

  getRestTime(goal, experience) {
    const restTimes = {
      muscle_gain: 90,
      fat_loss: 60,
      strength: 180,
      endurance: 45
    };

    return restTimes[goal] || 90;
  }
}

module.exports = PlanGenerator;
```

**步骤 3：提交**

```bash
git add lib/plan-generator.js lib/utils.js
git commit -m "feat: 实现训练计划生成算法"
```

---

由于实现计划非常长，我已经创建了完整的文档。现在让我提交并询问你的执行偏好。

**计划完成并保存到 `docs/plans/2026-03-10-fitness-coach-implementation.md`。**

这个实现计划包含 18 个详细任务，覆盖：
- 项目搭建和数据库基础（任务 1-3）
- 核心业务逻辑（任务 4-6）：计划生成器、进度分析器、图表生成器
- 8 个工具函数（任务 7-14）
- SKILL.md 定义（任务 15）
- 动作数据和种子脚本（任务 16-17）
- 测试和文档（任务 18）

**预计时间：** 8-10 天（遵循 TDD、DRY、YAGNI 原则）

---

现在有两种执行方式：

**1. 子 Agent 驱动（当前会话）** - 我为每个任务分派新的子 agent，任务间审查代码，快速迭代

**2. 并行会话（独立）** - 在新会话中使用 executing-plans，批量执行并设置检查点

**你选择哪种方式？**