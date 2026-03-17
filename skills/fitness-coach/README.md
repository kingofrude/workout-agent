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

### 本地开发

```bash
cd fitness-coach
npm install

# 创建数据库表
npm run init

# 导入动作数据
npm run seed

# 运行测试
npm test
```

### 部署到云端 OpenClaw

#### 1. 上传 Skill

**方法 A：通过 CLI（推荐）**

```bash
# 登录 OpenClaw
openclaw login

# 上传 Skill
openclaw skills upload . --name fitness-coach
```

**方法 B：通过 Web 界面**

1. 登录 [OpenClaw 控制台](https://app.openclaw.ai)
2. 进入 Skills 管理页面
3. 点击"Upload Skill"
4. 上传整个 `fitness-coach` 文件夹（打包为 zip）

#### 2. 初始化云端数据库

```bash
# 在云端环境运行初始化
openclaw exec fitness-coach "npm run init"
openclaw exec fitness-coach "npm run seed"
```

或者通过对话界面告诉 AI：

```
请在 fitness-coach skill 中运行：
npm run init
npm run seed
```

#### 3. 配置企业微信提醒（可选）

如果需要通过企业微信接收训练提醒：

```bash
# 1. 获取企业微信机器人 webhook URL（见下方说明）
# 2. 设置环境变量
openclaw env set fitness-coach WECOM_WEBHOOK_URL="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY"

# 3. 启动提醒服务（后台运行）
openclaw exec fitness-coach "npm start" --background

# 或使用 PM2
openclaw exec fitness-coach "npm install -g pm2 && pm2 start server.js --name fitness-reminder"
```

**获取企业微信 Webhook URL：**
1. 在企业微信中创建群聊
2. 群设置 -> 群机器人 -> 添加机器人
3. 复制 Webhook 地址

详细配置请参考：[企业微信提醒配置指南](./docs/REMINDER_SETUP.md)

#### 4. 启用 Skill

```bash
openclaw skills enable fitness-coach
```

或通过 Web 界面点击"Enable"按钮。

#### 5. 验证部署

```bash
# 检查 Skill 状态
openclaw skills status fitness-coach

# 查看日志
openclaw logs fitness-coach

# 运行测试
openclaw exec fitness-coach "npm test"

# 测试企业微信连接（如已配置）
openclaw exec fitness-coach "node -e \"const W = require('./lib/wecom-notifier'); new W().test();\""
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

## 使用指南

### 与 AI 健身教练对话

启用 Skill 后，直接在 OpenClaw 对话界面与 AI 交流：

#### 创建训练计划

```
我想开始健身，目标是增肌，有哑铃和杠铃，每周能练 3 天（周一、周三、周五），我是中级水平
```

#### 查看今日计划

```
今天练什么？
```

#### 记录训练

**标准格式**：

```
卧推 4组：80kg x10, 80kg x9, 75kg x10, 75kg x9
感觉不错
```

**简化格式**：

```
卧推 4组 80kg x10
```

**自然语言**：

```
今天卧推做了 4 组，80 公斤 10 次，感觉很棒
```

#### 查看进度

```
我卧推进步了多少？显示最近一个月的
```

#### 生成图表

```
给我生成卧推的重量进步图表
生成最近 3 个月的训练量趋势图
```

#### 记录体重

```
记录体重 75.5kg
今天体重 76kg
```

#### 查看动作指导

```
深蹲怎么做？
引体向上的正确姿势
```

#### 调整计划

```
把周一的卧推改成 5 组 8-10 次
增加周三的训练组数
```

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

## 故障排查

### Skill 无法正常工作

```bash
# 查看详细日志
openclaw logs fitness-coach --tail 100

# 重新安装依赖
openclaw exec fitness-coach "npm install"

# 重新初始化数据库
openclaw exec fitness-coach "npm run init && npm run seed"

# 运行测试验证
openclaw exec fitness-coach "npm test"
```

### 常见问题

**Q: 找不到动作数据？**

```bash
# 重新导入动作数据
openclaw exec fitness-coach "npm run seed"
```

**Q: 图表生成失败？**

- 检查是否有足够的训练记录（至少 2 次）
- 确认 `data/charts/` 目录有写入权限

**Q: 数据库锁定错误？**

- SQLite 使用 WAL 模式，确保没有多个进程同时写入
- 检查 `data/*.db-shm` 和 `data/*.db-wal` 文件

**Q: 内存不足？**

- Chart.js 图表生成需要内存，考虑减少图表数据点

### 数据备份

```bash
# 备份训练数据
openclaw download fitness-coach data/fitness.db ./backup/

# 备份身体指标
openclaw download fitness-coach data/shared.db ./backup/

# 恢复数据
openclaw upload fitness-coach ./backup/fitness.db data/fitness.db
```

## 注意事项

1. **数据持久化**：云端的 `data/fitness.db` 和 `data/shared.db` 会持久化保存，不会因 Skill 重启而丢失

2. **共享数据库**：`shared.db` 可被其他助理（营养、财务）访问，实现数据联动

3. **权限要求**：确保 `data/` 和 `data/charts/` 目录有写入权限

4. **依赖自动安装**：OpenClaw 会自动运行 `npm install`

5. **定期备份**：建议定期备份数据库文件，避免数据丢失

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
