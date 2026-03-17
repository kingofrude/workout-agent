# 企业微信提醒功能配置指南

## 功能说明

Fitness Coach 支持通过企业微信机器人发送以下提醒：

1. **早上提醒**：每天早上固定时间发送今日训练计划
2. **训练前提醒**：训练前 30 分钟发送动作清单和要点

## 快速开始

### 1. 获取企业微信 Webhook URL

#### 方法 A：群聊机器人（推荐）

1. 在企业微信中创建一个群聊
2. 进入群设置 -> **群机器人**
3. 点击 **添加机器人**
4. 设置机器人名称（例如：健身教练）
5. 复制生成的 **Webhook 地址**

格式类似：
```
https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=693axxx6-7aoc-4bc4-97a0-0ec2sifa5aaa
```

#### 方法 B：企业自建应用

1. 登录 [企业微信管理后台](https://work.weixin.qq.com/)
2. 应用管理 -> 创建应用
3. 配置回调 URL 和 Token
4. 获取企业 ID、应用 Secret

### 2. 配置环境变量

在 OpenClaw 云端环境中设置环境变量：

```bash
# 方法 A：通过 OpenClaw CLI
openclaw env set fitness-coach WECOM_WEBHOOK_URL="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY"

# 方法 B：通过 Web 界面
# 进入 Skill 设置 -> 环境变量 -> 添加
# 变量名：WECOM_WEBHOOK_URL
# 变量值：你的 webhook URL
```

或者在本地开发时创建 `.env` 文件：

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 webhook URL
```

### 3. 启动提醒服务

#### 在云端 OpenClaw

提醒服务需要作为后台进程运行：

```bash
# 方法 A：通过 OpenClaw 后台任务
openclaw exec fitness-coach "npm start" --background

# 方法 B：通过 PM2（如果云端支持）
openclaw exec fitness-coach "npm install -g pm2 && pm2 start server.js --name fitness-reminder"

# 查看日志
openclaw logs fitness-coach --tail 100
```

#### 在本地开发

```bash
cd fitness-coach
npm start

# 或使用 nodemon 开发模式
npm install -g nodemon
npm run dev
```

### 4. 测试提醒功能

```bash
# 测试企业微信连接
node -e "const WeComNotifier = require('./lib/wecom-notifier'); const n = new WeComNotifier(); n.test();"

# 查看提醒调度器日志
openclaw logs fitness-coach | grep "提醒"
```

## 提醒时间设置

### 在创建训练计划时设置

```javascript
// 通过对话
"我想开始健身，目标是增肌，每周练 3 天，早上 8 点提醒我"

// create_plan 工具会自动设置
{
  goal: 'muscle_gain',
  experience: 'intermediate',
  availableDays: ['monday', 'wednesday', 'friday'],
  equipment: ['barbell', 'dumbbell'],
  reminderTime: '08:00'  // 早上 8 点提醒
}
```

### 修改提醒时间

目前需要重新创建训练计划。未来版本会添加单独的 `update_reminder_settings` 工具。

## 提醒内容示例

### 早上提醒（训练日）

```
🌅 早安！今天是训练日！

📋 今日训练计划：胸+三头

1. 杠铃卧推
   4 组 × 8-10 次
   休息 90秒

2. 哑铃飞鸟
   3 组 × 12-15 次
   休息 60秒

3. 绳索下压
   3 组 × 12-15 次
   休息 60秒

💪 加油！今天也要突破自己！
```

### 早上提醒（休息日）

```
🌅 早安！今天是休息日！

🎉 今天是休息日，让肌肉好好恢复吧！

记得保持良好的睡眠和饮食 😊
```

### 训练前提醒

```
⏰ 训练提醒！

📍 胸+三头训练即将开始

📝 今日动作清单：
1. 杠铃卧推 - 4组
2. 哑铃飞鸟 - 3组
3. 绳索下压 - 3组

💡 训练要点：
• 充分热身 5-10 分钟
• 注意动作标准性
• 控制动作节奏
• 及时补充水分

🔥 准备好了吗？Let's go!
```

## 常见问题

### Q: 提醒没有发送？

**检查清单：**

1. 确认 webhook URL 已正确配置
   ```bash
   openclaw env get fitness-coach WECOM_WEBHOOK_URL
   ```

2. 确认提醒服务正在运行
   ```bash
   openclaw ps | grep fitness
   ```

3. 查看错误日志
   ```bash
   openclaw logs fitness-coach --tail 50 | grep "ERROR\|❌"
   ```

4. 测试 webhook 连接
   ```bash
   curl 'YOUR_WEBHOOK_URL' \
     -H 'Content-Type: application/json' \
     -d '{"msgtype":"text","text":{"content":"测试消息"}}'
   ```

### Q: 提醒时间不准确？

检查时区设置：

```bash
# 设置时区为中国时区
openclaw env set fitness-coach TZ="Asia/Shanghai"

# 重启提醒服务
openclaw restart fitness-coach
```

### Q: 想修改提醒时间？

目前需要重新创建训练计划：

```
帮我重新创建训练计划，早上 7:30 提醒我
```

### Q: 如何禁用提醒？

```bash
# 方法 A：停止提醒服务
openclaw exec fitness-coach "pm2 stop fitness-reminder"

# 方法 B：删除 webhook 配置
openclaw env delete fitness-coach WECOM_WEBHOOK_URL
```

### Q: 可以发送到多个群吗？

目前只支持单个 webhook URL。如需发送到多个群，可以：

1. 创建一个主群
2. 在主群中 @ 相关人员
3. 或者修改 `wecom-notifier.js` 支持多个 webhook

### Q: 提醒消息能自定义吗？

可以修改 `lib/reminder-scheduler.js` 中的消息模板：

```javascript
// 修改早上提醒消息
async sendMorningReminder(telegramId) {
  let message = '🌅 早安！今天是训练日！\n\n';
  // 自定义你的消息内容
}
```

## 高级配置

### 自定义提醒时间

编辑数据库中的用户设置：

```sql
UPDATE user_settings
SET morning_reminder_time = '07:00',
    training_reminder_advance = 60
WHERE user_id = 1;
```

### 添加 @ 功能

修改 `wecom-notifier.js` 发送时添加 `mentionedList`：

```javascript
await notifier.send(telegramId, message, ['@all']); // @ 所有人
await notifier.send(telegramId, message, ['userid1', 'userid2']); // @ 特定人
```

### 集成到 PM2

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'fitness-reminder',
    script: './server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '200M',
    env: {
      NODE_ENV: 'production',
      TZ: 'Asia/Shanghai'
    }
  }]
};
```

启动：
```bash
pm2 start ecosystem.config.js
pm2 save
```

## 架构说明

```
fitness-coach/
├── server.js                 # 后台服务入口
├── lib/
│   ├── reminder-scheduler.js # 提醒调度器（cron 任务）
│   └── wecom-notifier.js     # 企业微信通知器
└── tools/
    └── create-plan.js        # 创建计划时触发提醒重载
```

**工作流程：**

1. `server.js` 启动时初始化调度器
2. 调度器读取数据库中的用户设置
3. 为每个用户创建 cron 任务
4. 到时间时，调度器调用通知器发送消息
5. 通知器通过 HTTPS 调用企业微信 webhook API

## 性能优化

- 使用单个 cron 实例管理所有用户的提醒
- 每小时检查一次训练前提醒（避免频繁查询）
- 数据库连接复用和及时关闭
- 错误重试机制（待实现）

## 安全建议

1. **不要泄露 webhook URL**：它类似于 API 密钥
2. **使用环境变量**：不要在代码中硬编码
3. **限制群成员**：只邀请需要接收提醒的人
4. **定期轮换密钥**：在企业微信后台重新生成 webhook

## 未来改进

- [ ] 支持多个 webhook URL
- [ ] 添加提醒历史记录
- [ ] 支持用户自定义提醒消息模板
- [ ] 添加错误重试机制
- [ ] 支持钉钉、飞书等其他平台
- [ ] Web 界面管理提醒设置

## 反馈

如有问题，请提交 Issue 到 GitHub 仓库。
