# Workout Agent

AI 驱动的健身助理系统，基于 [OpenClaw](https://docs.openclaw.ai/zh-CN) 构建。

## 项目结构

- **[fitness-coach/](./fitness-coach/)** - AI 健身教练 Skill
- **[docs/](./docs/)** - 设计文档和实现计划

## Fitness Coach - AI 健身教练

你的私人 AI 健身助理，提供：

- 🏋️ **个性化训练计划**：根据目标、经验和可用设备生成定制计划
- 📊 **训练记录追踪**：记录每组重量、次数、RPE（自觉疲劳度）
- 📈 **进度统计分析**：计算训练量、最大重量、平均次数等指标
- 📉 **数据可视化**：生成重量进步、训练量、身体指标趋势图表
- ⚖️ **身体指标管理**：记录体重、体脂等数据（跨助理共享）
- 🎯 **动作指导**：提供 15+ 动作的详细图文指导

### 训练分化方案

- **推拉腿（PPL）**：适合 3 天或 6 天训练
- **上下肢（Upper/Lower）**：适合 4 天训练
- **健美分化（Bro Split）**：适合 5 天训练

## 快速开始

### 在云端 OpenClaw 中使用

1. 在 OpenClaw Skill 管理页面添加 GitHub Skill
2. 输入仓库地址：`https://github.com/2474258962/workout-agent.git`
3. 选择 `fitness-coach` 目录
4. 等待自动安装依赖
5. 初始化数据库：
   ```
   请在 fitness-coach skill 中运行：
   npm run init
   npm run seed
   ```
6. 开始使用！

### 本地开发

```bash
git clone https://github.com/2474258962/workout-agent.git
cd workout-agent/fitness-coach
npm install
npm run init
npm run seed
npm test
```

## 使用示例

### 创建训练计划
```
我想开始健身，目标是增肌，有哑铃和杠铃，每周能练 3 天（周一、周三、周五），我是中级水平
```

### 记录训练
```
卧推 4组：80kg x10, 80kg x9, 75kg x10, 75kg x9
感觉不错
```

### 查看进度
```
我卧推进步了多少？显示最近一个月的
```

### 生成图表
```
给我生成卧推的重量进步图表
```

## 文档

- [Fitness Coach 详细文档](./fitness-coach/README.md)
- [设计文档](./docs/plans/2026-03-10-fitness-coach-design.md)
- [实现计划](./docs/plans/2026-03-10-fitness-coach-implementation.md)

## 技术栈

- **Node.js** 18+
- **better-sqlite3** - SQLite 数据库
- **Chart.js** + chartjs-node-canvas - 图表生成
- **date-fns** - 日期处理
- **OpenClaw** - AI 助理框架

## 未来计划

- [ ] 智能提醒系统（早上提醒 + 训练前发送指导）
- [ ] 营养助理 Skill（饮食记录、营养分析）
- [ ] 财务助理 Skill（健身花费追踪）
- [ ] 更多动作数据和视频指导
- [ ] 训练计划自动调整（基于进度）

## License

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
