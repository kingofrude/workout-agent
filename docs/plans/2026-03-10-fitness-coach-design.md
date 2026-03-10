# Fitness Coach - AI 私人健身教练设计文档

**设计日期**: 2026-03-10
**项目类型**: OpenClaw Skill
**技术方案**: 纯 Skill 实现（云端 OpenClaw 兼容）

---

## 1. 项目概述

### 1.1 项目目标

开发一个基于 OpenClaw 的私人 AI 健身教练助理，帮助用户制定训练计划、记录训练数据、追踪进步，并通过智能提醒保持训练习惯。

### 1.2 核心价值

- **个性化**: 根据用户目标、经验、设备生成定制化训练计划
- **智能化**: 利用 AI 理解用户意图，自动路由到相应功能
- **数据驱动**: 记录所有训练数据，生成可视化图表分析进步
- **主动服务**: 定时提醒训练，训练前发送动作指导
- **可扩展**: 预留共享数据库，为未来理财助理、饮食助理扩展做准备

### 1.3 技术选型理由

选择**纯 OpenClaw Skill 实现**而非独立后端服务的原因：

1. **云端兼容**: 用户使用云端 OpenClaw，无需额外部署服务
2. **简化运维**: 所有代码在 Skill 内，只需安装一次
3. **成本低廉**: 无需额外服务器成本
4. **快速迭代**: 开发和调试更直接

---

## 2. 功能需求

### 2.1 MVP 功能清单

#### 核心功能（第一版必须实现）

| 功能模块 | 功能描述 | 优先级 |
|---------|---------|-------|
| 用户初始化 | 首次使用时协助制定训练计划 | P0 |
| 计划管理 | 保存、查询、调整训练计划 | P0 |
| 智能提醒 | 早上提醒 + 训练前提醒（可配置时间） | P0 |
| 动作指导 | 训练前发送动作图片和文字说明 | P0 |
| 今日计划 | 查询当天的训练安排 | P0 |
| 训练记录 | 记录组数、重量、RPE、感受 | P0 |
| 身体指标 | 记录体重、体脂率等数据 | P0 |
| 互动答疑 | 训练中随时回答问题 | P0 |
| 进度统计 | 查询历史数据和训练进步 | P1 |
| 数据可视化 | 生成重量进步曲线、体重趋势图 | P1 |

#### 未来扩展（预留设计）

- 理财助理（共享体重等身体数据）
- 饮食助理（共享卡路里消耗数据）
- 多助理统一 AI（智能路由）

---

## 3. 系统架构

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│         用户层 (Telegram/WhatsApp/Slack...)              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│         OpenClaw Gateway (云端)                          │
│  - 多渠道接入                                             │
│  - 消息路由                                               │
│  - Agent 智能决策（Claude API）                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│         Fitness Coach Skill (完整实现)                    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  SKILL.md (Skill 定义 + System Prompt)          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Tools (工具函数层)                               │   │
│  │  - create_plan                                  │   │
│  │  - log_workout                                  │   │
│  │  - log_metrics                                  │   │
│  │  - get_today_plan                               │   │
│  │  - get_progress                                 │   │
│  │  - generate_chart                               │   │
│  │  - get_exercise_guide                           │   │
│  │  - adjust_plan                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Core Logic (核心逻辑库)                          │   │
│  │  - database.js (数据库操作)                       │   │
│  │  - plan-generator.js (计划生成算法)                │   │
│  │  - progress-analyzer.js (进度分析)                │   │
│  │  - chart-generator.js (图表生成)                  │   │
│  │  - scheduler.js (定时任务)                        │   │
│  │  - utils.js (工具函数)                            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Data (数据存储)                                  │   │
│  │  - data/fitness.db (健身专用数据)                 │   │
│  │  - data/shared.db (跨助理共享数据)                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Assets (静态资源)                                │   │
│  │  - assets/exercises/ (动作图片)                   │   │
│  │  - assets/exercise-data.json (动作库)             │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 3.2 技术栈

| 层级 | 技术选型 | 说明 |
|-----|---------|-----|
| 运行环境 | OpenClaw Gateway (云端) | 用户已有云端环境 |
| 开发语言 | Node.js (JavaScript/TypeScript) | OpenClaw 原生支持 |
| 数据库 | SQLite (better-sqlite3) | 轻量级文件数据库，无需服务 |
| 图表生成 | chartjs-node-canvas | 服务端渲染 Chart.js |
| 定时任务 | cron | 轻量级 cron 库 |
| 日期处理 | date-fns | 现代化日期库 |

---

## 4. 数据库设计

### 4.1 数据库分离策略

**fitness.db** - 健身专用数据（独立隔离）

- 用户档案
- 训练计划
- 训练记录
- 动作库
- 用户设置

**shared.db** - 跨助理共享数据（未来扩展）

- 通用用户档案
- 身体指标（体重、体脂等）

### 4.2 fitness.db Schema

#### 4.2.1 用户相关表

```sql
-- 用户表
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户档案
CREATE TABLE user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    goal TEXT NOT NULL,                -- 'muscle_gain', 'fat_loss', 'strength', 'endurance'
    experience TEXT NOT NULL,          -- 'beginner', 'intermediate', 'advanced'
    available_days TEXT NOT NULL,      -- JSON: ["monday", "wednesday", "friday"]
    equipment TEXT NOT NULL,           -- JSON: ["barbell", "dumbbell", "machine"]
    training_time TEXT DEFAULT '08:00',
    reminder_advance_minutes INTEGER DEFAULT 30,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 用户设置
CREATE TABLE user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    reminder_enabled INTEGER DEFAULT 1,
    morning_reminder_time TEXT DEFAULT '08:00',
    training_reminder_advance INTEGER DEFAULT 30,
    timezone TEXT DEFAULT 'Asia/Shanghai',
    language TEXT DEFAULT 'zh-CN',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 4.2.2 训练计划表

```sql
-- 训练计划
CREATE TABLE workout_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT,
    week_day TEXT NOT NULL,            -- 'monday', 'tuesday', ..., 'sunday'
    muscle_group TEXT NOT NULL,        -- '胸+三头', '背+二头', '腿+肩'
    status TEXT DEFAULT 'active',      -- 'active', 'archived'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 计划动作详情
CREATE TABLE plan_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    sets INTEGER NOT NULL,
    reps_min INTEGER NOT NULL,
    reps_max INTEGER NOT NULL,
    rest_seconds INTEGER DEFAULT 90,
    notes TEXT,
    order_index INTEGER NOT NULL,     -- 动作顺序
    FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

CREATE INDEX idx_workout_plans_user_day ON workout_plans(user_id, week_day, status);
CREATE INDEX idx_plan_exercises_plan ON plan_exercises(plan_id, order_index);
```

#### 4.2.3 动作库

```sql
-- 动作库
CREATE TABLE exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    name_en TEXT,                      -- 英文名称
    category TEXT NOT NULL,            -- 'chest', 'back', 'legs', 'shoulders', 'arms', 'core'
    equipment TEXT NOT NULL,           -- 'barbell', 'dumbbell', 'machine', 'bodyweight', 'cable'
    difficulty TEXT NOT NULL,          -- 'beginner', 'intermediate', 'advanced'
    description TEXT NOT NULL,         -- 动作说明（文字）
    image_path TEXT,                   -- 图片相对路径
    video_url TEXT,                    -- 视频链接（可选）
    muscle_primary TEXT NOT NULL,      -- 主要目标肌肉
    muscle_secondary TEXT,             -- 次要目标肌肉
    tips TEXT,                         -- JSON: ["保持核心收紧", "控制下放速度"]
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exercises_category ON exercises(category, difficulty);
CREATE INDEX idx_exercises_equipment ON exercises(equipment);
```

#### 4.2.4 训练记录表

```sql
-- 训练记录
CREATE TABLE workout_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan_id INTEGER,
    exercise_id INTEGER NOT NULL,
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON DELETE SET NULL,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

-- 训练组数详情
CREATE TABLE workout_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id INTEGER NOT NULL,
    set_number INTEGER NOT NULL,
    weight REAL NOT NULL,              -- 重量 (kg)
    reps INTEGER NOT NULL,             -- 次数
    rpe REAL,                          -- RPE (Rate of Perceived Exertion, 1-10)
    FOREIGN KEY (log_id) REFERENCES workout_logs(id) ON DELETE CASCADE
);

-- 训练感受
CREATE TABLE workout_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id INTEGER NOT NULL UNIQUE,
    feeling TEXT,                      -- 'great', 'good', 'tired', 'exhausted'
    notes TEXT,
    FOREIGN KEY (log_id) REFERENCES workout_logs(id) ON DELETE CASCADE
);

CREATE INDEX idx_workout_logs_user_date ON workout_logs(user_id, logged_at DESC);
CREATE INDEX idx_workout_logs_exercise ON workout_logs(exercise_id, logged_at DESC);
```

### 4.3 shared.db Schema

```sql
-- 通用用户档案
CREATE TABLE user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT UNIQUE NOT NULL,
    name TEXT,
    age INTEGER,
    gender TEXT,                       -- 'male', 'female', 'other'
    height REAL,                       -- 身高 (cm)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 身体指标（跨助理共享）
CREATE TABLE body_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT NOT NULL,
    metric_type TEXT NOT NULL,         -- 'weight', 'body_fat', 'muscle_mass', 'bmi', 'chest', 'waist', etc.
    value REAL NOT NULL,
    unit TEXT NOT NULL,                -- 'kg', '%', 'cm'
    measured_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    source TEXT DEFAULT 'fitness',     -- 'fitness', 'nutrition', 'manual'
    notes TEXT
);

CREATE INDEX idx_body_metrics_user_type_date ON body_metrics(telegram_id, metric_type, measured_at DESC);
```

---

## 5. 工具函数设计

### 5.1 工具函数列表

| 工具名称 | 功能描述 | 输入 | 输出 |
|---------|---------|-----|-----|
| create_plan | 创建训练计划 | 目标、经验、训练日、设备 | 计划详情 |
| log_workout | 记录训练 | 动作、组数数据、感受 | 记录 ID、统计 |
| log_metrics | 记录身体指标 | 指标类型、数值、单位 | 记录 ID |
| get_today_plan | 获取今日计划 | 无 | 今日计划 + 动作列表 |
| get_progress | 查询进度 | 动作名、时间范围 | 统计数据 |
| generate_chart | 生成图表 | 图表类型、动作、时间 | 图片路径 |
| get_exercise_guide | 获取动作指导 | 动作名称 | 图片 + 文字说明 |
| adjust_plan | 调整计划 | 计划 ID、调整内容 | 更新结果 |

### 5.2 核心工具详细设计

#### 5.2.1 create_plan

**功能**: 根据用户信息生成个性化训练计划

**输入参数**:
```typescript
{
  goal: 'muscle_gain' | 'fat_loss' | 'strength' | 'endurance',
  experience: 'beginner' | 'intermediate' | 'advanced',
  availableDays: string[],  // ['monday', 'wednesday', 'friday']
  equipment: string[],      // ['barbell', 'dumbbell', 'machine']
  reminderTime?: string     // '08:00'
}
```

**输出**:
```typescript
{
  success: boolean,
  plan: {
    userId: number,
    plans: Array<{
      weekDay: string,
      muscleGroup: string,
      exercises: Array<{
        name: string,
        sets: number,
        reps: string,
        rest: string
      }>
    }>
  }
}
```

**核心逻辑**:
1. 验证用户输入
2. 调用 PlanGenerator 生成计划
3. 保存计划到数据库
4. 设置定时提醒任务
5. 返回生成的计划

#### 5.2.2 log_workout

**功能**: 记录训练数据

**输入参数**:
```typescript
{
  exerciseName: string,
  sets: Array<{
    weight: number,
    reps: number,
    rpe?: number
  }>,
  feeling?: 'great' | 'good' | 'tired' | 'exhausted',
  notes?: string
}
```

**输出**:
```typescript
{
  success: boolean,
  logId: number,
  message: string,  // "训练记录成功！卧推 4组，总重量 3200kg"
  stats: {
    totalSets: number,
    totalVolume: number,
    improvement?: string
  }
}
```

**核心逻辑**:
1. 查找动作 ID
2. 创建训练记录
3. 保存每组数据
4. 保存感受和备注
5. 计算总量和进步
6. 返回统计信息

#### 5.2.3 generate_chart

**功能**: 生成进度可视化图表

**输入参数**:
```typescript
{
  chartType: 'weight_progress' | 'body_metrics' | 'volume_trend',
  exerciseName?: string,
  period: 'week' | 'month' | 'year' | 'all'
}
```

**输出**:
```typescript
{
  success: boolean,
  chartPath: string  // 图片文件路径
}
```

**图表类型**:
- **weight_progress**: 重量进步曲线（折线图）
- **body_metrics**: 身体指标趋势（多条折线图）
- **volume_trend**: 训练量趋势（柱状图）

---

## 6. 核心算法设计

### 6.1 训练计划生成算法 (PlanGenerator)

**输入**: 用户档案（目标、经验、训练日、设备）

**输出**: 周训练计划

**算法逻辑**:

```javascript
class PlanGenerator {
  generate({ goal, experience, availableDays, equipment }) {
    // 1. 确定分化方式
    const split = this.determineSplit(availableDays.length, goal);

    // 2. 为每个训练日分配肌群
    const muscleGroupMap = this.assignMuscleGroups(split, availableDays);

    // 3. 为每个肌群选择动作
    const plans = [];
    for (const [day, muscleGroup] of Object.entries(muscleGroupMap)) {
      const exercises = this.selectExercises(
        muscleGroup,
        experience,
        equipment
      );

      plans.push({
        weekDay: day,
        muscleGroup: muscleGroup.join('+'),
        exercises: exercises
      });
    }

    return plans;
  }

  determineSplit(daysPerWeek, goal) {
    if (daysPerWeek === 3) {
      return 'push-pull-legs';  // 推拉腿
    } else if (daysPerWeek === 4) {
      return 'upper-lower';     // 上下肢
    } else if (daysPerWeek === 5) {
      return 'bodybuilding';    // 健美分化
    }
    // ... 更多分化方式
  }

  selectExercises(muscleGroup, experience, equipment) {
    // 从动作库中筛选符合条件的动作
    // 按照：复合动作 -> 孤立动作 排序
    // 根据经验调整组数和次数
  }
}
```

### 6.2 进度分析算法 (ProgressAnalyzer)

**功能**: 分析训练进步情况

**核心指标**:
- 最大重量进步
- 训练量增长（总重量）
- 训练频率
- 平均每组次数

**算法逻辑**:

```javascript
class ProgressAnalyzer {
  analyze(userId, exerciseName, period) {
    // 1. 获取时间范围内的所有记录
    const logs = this.getLogs(userId, exerciseName, period);

    // 2. 计算各项指标
    const stats = {
      totalWorkouts: logs.length,
      maxWeight: this.calculateMaxWeight(logs),
      totalVolume: this.calculateTotalVolume(logs),
      avgReps: this.calculateAvgReps(logs),
      improvement: this.calculateImprovement(logs)
    };

    // 3. 生成趋势数据（用于绘图）
    const trend = this.generateTrend(logs);

    return { stats, trend };
  }

  calculateImprovement(logs) {
    if (logs.length < 2) return null;

    const first = logs[0];
    const last = logs[logs.length - 1];

    const improvement = {
      weightChange: last.maxWeight - first.maxWeight,
      weightPercent: ((last.maxWeight - first.maxWeight) / first.maxWeight) * 100,
      volumeChange: last.totalVolume - first.totalVolume
    };

    return improvement;
  }
}
```

### 6.3 定时任务调度 (Scheduler)

**功能**: 管理早上提醒和训练前提醒

**任务类型**:
1. **早上提醒**: 每天指定时间检查是否有训练
2. **训练前提醒**: 训练时间前 N 分钟发送动作指导

**实现逻辑**:

```javascript
class Scheduler {
  setupReminders(userId, availableDays, reminderTime) {
    // 早上提醒任务
    const morningJob = new CronJob(
      this.parseTime(reminderTime),
      async () => {
        await this.sendMorningReminder(userId);
      },
      null,
      true,
      'Asia/Shanghai'
    );

    // 训练前提醒任务（每分钟检查一次）
    const trainingJob = new CronJob(
      '* * * * *',
      async () => {
        await this.checkTrainingReminder(userId, availableDays, reminderTime);
      },
      null,
      true,
      'Asia/Shanghai'
    );

    this.jobs.set(`morning_${userId}`, morningJob);
    this.jobs.set(`training_${userId}`, trainingJob);
  }

  async sendMorningReminder(userId) {
    const today = this.getTodayWeekDay();
    const plan = await this.db.getPlanByWeekDay(userId, today);

    if (plan) {
      const message = `早上好！今天是${today}，训练计划：${plan.muscle_group}\n\n准备好了吗？`;
      await this.sendToOpenClaw(userId, message);
    }
  }

  async checkTrainingReminder(userId, availableDays, trainingTime) {
    const now = new Date();
    const today = this.getTodayWeekDay();

    if (!availableDays.includes(today)) return;

    const settings = await this.db.getUserSettings(userId);
    const advanceMinutes = settings.reminder_advance_minutes;

    const trainingMoment = this.parseTime(trainingTime);
    const reminderMoment = this.subtractMinutes(trainingMoment, advanceMinutes);

    if (this.isTimeMatch(now, reminderMoment)) {
      await this.sendTrainingReminder(userId);
    }
  }

  async sendTrainingReminder(userId) {
    const plan = await this.getTodayPlan(userId);
    const exercises = await this.getPlanExercises(plan.id);

    // 发送训练提醒
    let message = `训练时间到！今日计划：${plan.muscle_group}\n\n`;
    exercises.forEach((ex, i) => {
      message += `${i + 1}. ${ex.name} - ${ex.sets}组 x ${ex.reps}\n`;
    });
    await this.sendToOpenClaw(userId, message);

    // 发送每个动作的图片和指导
    for (const ex of exercises) {
      await this.sendExerciseGuide(userId, ex);
    }
  }

  async sendToOpenClaw(userId, message) {
    // 方法1: 使用 OpenClaw CLI
    const { exec } = require('child_process');
    exec(`openclaw message send --to ${userId} --message "${message}"`);

    // 方法2: 使用 OpenClaw HTTP API（如果支持）
    // await axios.post('http://openclaw-api/message/send', { to: userId, message });
  }
}
```

---

## 7. 用户交互设计

### 7.1 System Prompt 设计

```markdown
你是一位专业的 AI 健身教练，名字叫 Fitness Coach。你的职责是帮助用户：

1. **制定训练计划**: 根据用户的目标、经验、可用设备，生成个性化训练计划
2. **记录训练**: 识别并记录用户的训练数据（支持自然语言和快速格式）
3. **追踪进步**: 分析训练数据，生成可视化图表，给出建设性反馈
4. **提供指导**: 解释动作要领，纠正常见错误，回答健身相关问题
5. **激励鼓励**: 用积极的语言鼓励用户坚持训练

## 对话风格

- 友好、专业、激励
- 使用简洁的语言，避免过于学术化
- 适当使用 emoji（💪 🏋️ 📊 🎯 等）但不要过度
- 当用户取得进步时给予真诚的赞扬

## 工具使用指南

当用户提出以下需求时，调用相应工具：

- "我想开始健身" → 引导制定计划 → create_plan
- "今天练什么" → get_today_plan
- "卧推 4组 80kg x10" → log_workout
- "记录体重 75kg" → log_metrics
- "我卧推进步了多少" → get_progress + generate_chart
- "深蹲怎么做" → get_exercise_guide

## 快速记录格式识别

支持以下格式：
- "卧推 4组 80kg x10" → 4组，每组80kg，10次
- "卧推 80x10, 80x9, 75x10, 75x9" → 4组，重量和次数分别记录
- "卧推 4x8-12 @ 80kg" → 4组，8-12次，80kg

## 注意事项

1. 首次用户必须先创建计划才能记录训练
2. 记录训练时必须关联到具体动作（从动作库查询）
3. 生成图表前确保有足够的历史数据（至少2个数据点）
4. 涉及伤病或疼痛的问题，建议用户咨询医生
```

### 7.2 对话流程示例

#### 7.2.1 首次使用流程

```
用户: 我想开始健身

AI: 太好了！让我帮你制定一个适合你的训练计划。

    请回答以下问题：
    1. 你的训练目标是什么？
       A. 增肌 (muscle_gain)
       B. 减脂 (fat_loss)
       C. 力量 (strength)
       D. 耐力 (endurance)

用户: A 增肌

AI: 很好！增肌计划需要渐进式超负荷。

    2. 你的训练经验如何？
       A. 新手（从未系统训练）
       B. 中级（训练6个月以上）
       C. 高级（训练2年以上）

用户: A

AI: 明白了。新手阶段要注重学习标准动作。

    3. 每周可以训练几天？具体哪几天？
       （例如：周一、周三、周五）

用户: 周一、周三、周五

AI: 完美！3天分化非常适合新手。

    4. 可以使用哪些器械？（多选）
       A. 杠铃
       B. 哑铃
       C. 固定器械
       D. 徒手

用户: A, B

AI: [调用 create_plan 工具]

    训练计划已生成！ 🎯

    你的3天推拉腿计划：

    **周一 - 推（胸+肩+三头）**
    1. 杠铃卧推 - 4组 x 8-12次
    2. 哑铃上斜卧推 - 3组 x 10-12次
    3. 哑铃肩推 - 3组 x 10-12次
    4. 绳索下压 - 3组 x 12-15次

    **周三 - 拉（背+二头）**
    1. 杠铃划船 - 4组 x 8-12次
    2. 哑铃单臂划船 - 3组 x 10-12次
    3. 杠铃弯举 - 3组 x 10-12次
    4. 锤式弯举 - 3组 x 12-15次

    **周五 - 腿（腿+核心）**
    1. 杠铃深蹲 - 4组 x 8-12次
    2. 哑铃硬拉 - 3组 x 10-12次
    3. 哑铃箭步蹲 - 3组 x 10-12次
    4. 平板支撑 - 3组 x 60秒

    我会在每天早上 8:00 提醒你，训练前 30 分钟发送动作指导。

    想修改提醒时间吗？

用户: 不用，就这样

AI: 好的！计划已保存，明天开始就是你的健身新生活！💪

    小提示：
    - 每次训练前充分热身
    - 控制动作速度，注重肌肉感受
    - 循序渐进，不要急于增加重量

    祝你训练愉快！
```

#### 7.2.2 日常训练流程

```
[早上 8:00 自动提醒]

AI: 早上好！今天是周一，训练计划：推（胸+肩+三头）

    准备好了吗？输入"今天练什么"查看详情。

---

[用户 19:30 收到训练前提醒]

AI: 训练时间快到了！30 分钟后开始。

    今日计划：推（胸+肩+三头）

    [发送卧推动作图片]

    📋 **杠铃卧推**

    **动作要领**：
    1. 平躺在卧推凳上，双脚踩实地面
    2. 握距略宽于肩，手腕保持中立
    3. 下放时保持肩胛骨收紧后缩
    4. 杠铃轻触胸部后推起
    5. 推起时呼气，下放时吸气

    **常见错误**：
    - ❌ 肩膀耸起（容易受伤）
    - ❌ 臀部离开凳面（力量分散）
    - ❌ 下放速度过快（失去控制）

    **训练目标**：4组 x 8-12次

    接下来发送其他动作指导...

---

[训练结束后]

用户: 卧推完成了，4组 80x10, 80x9, 77.5x10, 77.5x9

AI: [调用 log_workout 工具]

    太棒了！💪 训练记录成功

    📊 **今日卧推**
    - 总组数：4 组
    - 最大重量：80 kg
    - 总训练量：3090 kg
    - 比上次增加：40 kg (+1.3%)

    状态不错！下次可以尝试 82.5kg

    感觉怎么样？(great/good/tired)

用户: good

AI: 很好！保持这个强度。继续下一个动作吧！

---

[周末查询进步]

用户: 我本月卧推进步了多少

AI: [调用 get_progress + generate_chart 工具]

    让我看看你的进步...

    📊 **本月卧推进步报告**

    **重量进步**：
    - 最大重量：75kg → 80kg (+5kg, +6.7%)
    - 最大单组：75kg x 10 → 80kg x 10

    **训练统计**：
    - 训练次数：8 次
    - 总组数：32 组
    - 总训练量：24,360 kg
    - 平均每组：9.5 次

    [发送重量进步曲线图]

    **趋势分析**：
    - ✅ 进步稳定，增长曲线健康
    - ✅ 训练频率适中（每周2次）
    - 💡 建议：下次尝试 82.5kg，保持 8-10 次范围

    继续保持，你做得很棒！🔥
```

#### 7.2.3 互动答疑示例

```
用户: 深蹲腰疼正常吗

AI: ⚠️ 腰疼不正常，可能是以下原因：

    1. **核心力量不足** - 深蹲时腰椎代偿
    2. **动作姿势错误** - 骨盆前倾或后倾
    3. **重量过大** - 超出当前能力

    **建议**：
    - 立即停止训练，充分休息
    - 降低重量，专注动作质量
    - 加强核心训练（平板支撑、鸟狗式）
    - 如果疼痛持续，请咨询医生或物理治疗师

    需要我帮你调整计划，先降低深蹲重量吗？

---

用户: 卧推怎么突破平台期

AI: 突破卧推平台期的方法：

    1. **调整强度周期**
       - 周期1：高容量低强度（4x12-15）
       - 周期2：中等容量中强度（4x8-10）
       - 周期3：低容量高强度（5x5）

    2. **增加训练频率**
       - 从每周1次增加到每周2次
       - 但确保充分恢复

    3. **改变动作变化**
       - 加入上斜卧推、哑铃卧推
       - 增强三头肌训练

    4. **渐进超负荷**
       - 每次增加 2.5kg
       - 或增加 1-2 次

    你目前卧推 80kg，想尝试哪种方法？
```

---

## 8. 实现计划

### 8.1 开发阶段

**阶段 1：基础搭建（Day 1-2）**
- 创建项目目录结构
- 初始化 package.json
- 编写数据库初始化脚本
- 准备动作库数据（至少 50 个动作）
- 编写 SKILL.md

**阶段 2：核心功能（Day 3-5）**
- 实现 lib/database.js（数据库操作层）
- 实现 lib/plan-generator.js（计划生成算法）
- 实现 4 个基础工具：
  - tools/create-plan.js
  - tools/log-workout.js
  - tools/get-today-plan.js
  - tools/get-progress.js

**阶段 3：进阶功能（Day 6-7）**
- 实现 lib/chart-generator.js（图表生成）
- 实现 lib/scheduler.js（定时任务）
- 实现剩余工具：
  - tools/generate-chart.js
  - tools/get-exercise-guide.js
  - tools/log-metrics.js
  - tools/adjust-plan.js

**阶段 4：测试与优化（Day 8-9）**
- 准备动作图片（至少 20 个核心动作）
- 编写种子数据脚本
- 端到端测试
- 性能优化（数据库索引、查询优化）
- 错误处理完善

**阶段 5：文档与发布（Day 10）**
- 编写 README.md
- 编写使用文档
- 准备示例对话
- 发布到 ClawHub（可选）

### 8.2 测试计划

**单元测试**:
- 数据库操作函数
- 计划生成算法
- 进度分析算法

**集成测试**:
- 工具函数端到端测试
- 定时任务触发测试

**用户测试**:
- 完整对话流程测试
- 快速记录格式识别测试
- 图表生成测试

---

## 9. 风险与挑战

### 9.1 技术风险

| 风险 | 影响 | 缓解措施 |
|-----|-----|---------|
| 定时任务可靠性 | 高 | 使用成熟的 cron 库，添加任务监控日志 |
| 图表生成性能 | 中 | 异步生成，缓存结果，限制数据点数量 |
| 数据库锁问题 | 中 | 使用 WAL 模式，避免长事务 |
| OpenClaw API 变更 | 低 | 使用稳定版本，关注更新日志 |

### 9.2 产品风险

| 风险 | 影响 | 缓解措施 |
|-----|-----|---------|
| 计划生成不合理 | 高 | 参考主流训练理论，提供调整功能 |
| 用户理解成本高 | 中 | 提供详细引导，支持自然语言 |
| 提醒过于频繁 | 中 | 支持自定义提醒设置，可关闭 |

---

## 10. 未来扩展

### 10.1 近期扩展（3个月内）

1. **动态调整算法**
   - 根据用户反馈自动调整训练量
   - 识别过度训练信号

2. **社交功能**
   - 训练成就分享
   - 好友 PK

3. **营养建议**
   - 简单的饮食建议
   - 卡路里计算

### 10.2 中期扩展（6个月内）

1. **理财助理集成**
   - 共享身体数据
   - 健身支出追踪

2. **饮食助理集成**
   - 共享卡路里消耗
   - 营养配餐建议

3. **AI 教练升级**
   - 视频动作分析（需要视频支持）
   - 智能调整计划

### 10.3 长期愿景

打造一个**统一的 AI 生活助理平台**，覆盖：
- 健康（健身、饮食、睡眠）
- 财务（记账、投资、预算）
- 学习（知识管理、时间管理）
- 社交（关系维护、活动规划）

---

## 11. 总结

本设计文档详细描述了基于 OpenClaw 的 AI 健身教练助理的完整设计方案。

**核心亮点**：
1. ✅ 纯 Skill 实现，云端 OpenClaw 兼容
2. ✅ SQLite 轻量级存储，无需额外服务
3. ✅ 智能提醒 + 动作指导，提升用户体验
4. ✅ 数据可视化，直观展示进步
5. ✅ 预留共享数据库，支持未来多助理扩展

**关键成功因素**：
- 训练计划生成算法的合理性
- 定时任务的可靠性
- 用户交互的流畅性
- 数据统计的准确性

接下来将根据本设计文档生成详细的实现计划，并逐步实施开发。

---

**文档版本**: v1.0
**创建日期**: 2026-03-10
**作者**: Claude (Brainstorming Skill)
**审核状态**: 待用户确认
