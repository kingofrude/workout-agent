// server.js - OpenClaw Skill 后台服务
const ReminderScheduler = require('./lib/reminder-scheduler');
const WeComNotifier = require('./lib/wecom-notifier');

// 初始化企业微信通知器
const notifier = new WeComNotifier({
  webhookUrl: process.env.WECOM_WEBHOOK_URL
});

// 初始化提醒调度器
const scheduler = new ReminderScheduler(notifier);

// 启动提醒系统
console.log('🚀 启动 Fitness Coach 提醒服务...');
scheduler.startAll();

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('\n📴 收到 SIGTERM 信号，正在关闭服务...');
  scheduler.stopAll();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n📴 收到 SIGINT 信号，正在关闭服务...');
  scheduler.stopAll();
  process.exit(0);
});

// 导出调度器，供工具函数调用
module.exports = {
  scheduler,
  notifier
};

// 如果直接运行此文件，保持进程运行
if (require.main === module) {
  console.log('✅ 提醒服务已启动');
  console.log('📝 按 Ctrl+C 停止服务');

  // 保持进程运行
  setInterval(() => {
    // 每小时输出一次心跳日志
  }, 3600000);
}
