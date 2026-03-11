# Fitness Coach - AI 健身教练

你的私人 AI 健身助理，基于 [OpenClaw](https://docs.openclaw.ai/zh-CN) 构建。

## 功能特性

### 核心功能
- **个性化训练计划**：根据目标、经验和可用设备生成定制计划
- **训练记录追踪**：记录每组重量、次数、RPE（自觉疲劳度）
- **进度统计分析**：计算训练量、最大重量、平均次数等指标
- **数据可视化**：生成重量进步、训练量、身体指标趋势图表
- **身体指标管理**：记录体重、体脂等数据（存储在共享数据库）
- **动作指导**：提供 15+ 动作的详细图文指导

### 训练分化方案
- **推拉腿（PPL）**：适合 3 天或 6 天训练
- **上下肢（Upper/Lower）**：适合 4 天训练
- **健美分化（Bro Split）**：适合 5 天训练

## 快速开始

### 安装

```bash
cd fitness-coach
npm install
```

### 初始化数据库

```bash
# 创建数据库表
npm run init

# 导入动作数据
npm run seed
```

### 在 OpenClaw 中启用

```bash
openclaw skills enable fitness-coach
```

### 运行测试

```bash
npm test
```

## 项目结构

```
fitness-coach/
├── SKILL.md              # OpenClaw Skill 定义
├── lib/
│   ├── database.js       # 数据库操作类
│   ├── utils.js          # 工具函数（分化选择、组数次数）
│   ├── plan-generator.js # 训练计划生成器
│   ├── progress-analyzer.js # 进度分析器
│   └── chart-generator.js   # 图表生成器
├── tools/
│   ├── create-plan.js    # 创建训练计划
│   ├── get-today-plan.js # 获取今日计划
│   ├── log-workout.js    # 记录训练
│   ├── log-metrics.js    # 记录身体指标
│   ├── get-progress.js   # 查询进度
│   ├── generate-chart.js # 生成图表
│   ├── get-exercise-guide.js # 获取动作指导
│   └── adjust-plan.js    # 调整计划
├── scripts/
│   ├── init-database.js  # 数据库初始化脚本
│   └── seed-exercises.js # 动作数据导入脚本
├── assets/
│   ├── exercise-data.json # 动作数据（15 个动作）
│   └── exercises/        # 动作图片目录
├── data/
│   ├── fitness.db        # 主数据库（训练数据）
│   ├── shared.db         # 共享数据库（身体指标）
│   └── charts/           # 生成的图表
└── tests/
    └── basic.test.js     # 基础功能测试
```

## 数据库架构

### fitness.db

- **users** - 用户信息
- **exercises** - 动作库（15 个预置动作）
- **workout_plans** - 训练计划
- **plan_exercises** - 计划中的动作
- **workout_logs** - 训练记录
- **workout_sets** - 训练组数详情

### shared.db

- **body_metrics** - 身体指标（跨助理共享）

## 工具函数

### create_plan
创建个性化训练计划

```javascript
{
  goal: 'muscle_gain' | 'fat_loss' | 'strength' | 'endurance',
  experience: 'beginner' | 'intermediate' | 'advanced',
  availableDays: ['monday', 'wednesday', 'friday'],
  equipment: ['barbell', 'dumbbell', 'machine', 'bodyweight'],
  reminderTime: '08:00' // 可选
}
```

### log_workout
记录训练数据

```javascript
{
  exerciseName: '杠铃卧推',
  sets: [
    { weight: 80, reps: 10, rpe: 7 },
    { weight: 80, reps: 9, rpe: 8 },
    { weight: 75, reps: 10, rpe: 7 }
  ],
  feeling: 'great' | 'good' | 'tired' | 'exhausted',
  notes: '感觉很好'
}
```

### get_progress
查询训练进度

```javascript
{
  exerciseName: '杠铃卧推', // 可选
  period: 'week' | 'month' | 'year' | 'all',
  metricType: 'weight' | 'body_fat' // 可选
}
```

### generate_chart
生成进度图表

```javascript
{
  chartType: 'weight_progress' | 'body_metrics' | 'volume_trend',
  exerciseName: '杠铃卧推', // weight_progress/volume_trend 需要
  period: 'week' | 'month' | 'year',
  metricType: 'weight' | 'body_fat' // body_metrics 需要
}
```

## 技术栈

- **Node.js** 18+
- **better-sqlite3** - SQLite 数据库
- **Chart.js** 3.9.1 + chartjs-node-canvas - 图表生成
- **date-fns** - 日期处理
- **cron** - 定时任务（未来功能）

## 动作库

包含 15 个预置动作：

**胸部**：杠铃卧推、哑铃卧推、哑铃飞鸟、俯卧撑

**背部**：杠铃硬拉、杠铃划船、引体向上

**腿部**：杠铃深蹲、箭步蹲

**肩部**：哑铃肩推、哑铃侧平举

**手臂**：哑铃弯举、杠铃弯举、绳索下压

**核心**：平板支撑

## 开发

### 运行测试

```bash
npm test              # 运行一次
npm run test:watch    # 监听模式
```

### 数据库管理

```bash
# 重新初始化数据库（会清空数据）
npm run init

# 重新导入动作数据
npm run seed
```

## 未来计划

- [ ] 智能提醒系统（早上提醒 + 训练前发送指导）
- [ ] 更多动作数据和图片
- [ ] 训练视频指导
- [ ] 与营养助理、财务助理的数据联动
- [ ] 训练计划自动调整（基于进度）
- [ ] 社交分享功能

## License

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
