// lib/reminder-scheduler.js
const { CronJob } = require('cron');
const FitnessDatabase = require('./database');
const { getDay, format, addMinutes, parseISO } = require('date-fns');

class ReminderScheduler {
  constructor(notificationHandler) {
    this.db = new FitnessDatabase();
    this.notificationHandler = notificationHandler; // 企业微信通知处理器
    this.jobs = new Map(); // 存储所有 cron 任务
    this.WEEK_DAYS = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    };
  }

  /**
   * 启动所有用户的提醒任务
   */
  startAll() {
    console.log('🔔 启动提醒调度器...');

    // 获取所有启用提醒的用户
    const users = this.db.db.prepare(`
      SELECT DISTINCT u.telegram_id, us.morning_reminder_time, us.training_reminder_advance
      FROM users u
      JOIN user_settings us ON u.id = us.user_id
      WHERE us.reminder_enabled = 1
    `).all();

    users.forEach(user => {
      this.scheduleUserReminders(user.telegram_id);
    });

    console.log(`✅ 已为 ${users.length} 个用户启动提醒`);
  }

  /**
   * 为单个用户安排提醒
   */
  scheduleUserReminders(telegramId) {
    const user = this.db.getOrCreateUser(telegramId);
    const settings = this.db.getUserSettings(telegramId);

    if (!settings || !settings.reminderEnabled) {
      return;
    }

    // 1. 早上提醒（每天固定时间）
    this.scheduleMorningReminder(telegramId, settings.morningReminderTime);

    // 2. 训练前提醒（根据今日计划动态调整）
    this.scheduleWorkoutReminders(telegramId, settings.trainingReminderAdvance);
  }

  /**
   * 安排早上提醒
   */
  scheduleMorningReminder(telegramId, morningTime) {
    const [hour, minute] = morningTime.split(':').map(Number);

    // 每天早上固定时间发送
    const cronPattern = `${minute} ${hour} * * *`;
    const jobKey = `morning-${telegramId}`;

    if (this.jobs.has(jobKey)) {
      this.jobs.get(jobKey).stop();
    }

    const job = new CronJob(cronPattern, async () => {
      await this.sendMorningReminder(telegramId);
    }, null, true, 'Asia/Shanghai');

    this.jobs.set(jobKey, job);
    console.log(`📅 已为用户 ${telegramId} 设置早上提醒：${morningTime}`);
  }

  /**
   * 安排训练前提醒
   */
  scheduleWorkoutReminders(telegramId, advanceMinutes) {
    // 每小时检查一次是否有即将开始的训练
    const cronPattern = '0 * * * *'; // 每小时整点
    const jobKey = `workout-${telegramId}`;

    if (this.jobs.has(jobKey)) {
      this.jobs.get(jobKey).stop();
    }

    const job = new CronJob(cronPattern, async () => {
      await this.checkUpcomingWorkouts(telegramId, advanceMinutes);
    }, null, true, 'Asia/Shanghai');

    this.jobs.set(jobKey, job);
  }

  /**
   * 发送早上提醒
   */
  async sendMorningReminder(telegramId) {
    try {
      const user = this.db.getOrCreateUser(telegramId);
      const today = this.WEEK_DAYS[getDay(new Date())];

      // 查询今日计划
      const plan = this.db.getPlanByWeekDay(user.id, today);

      let message = '🌅 早安！今天是训练日！\n\n';

      if (plan) {
        const exercises = this.db.getPlanExercises(plan.id);
        message += `📋 今日训练计划：${plan.muscle_group}\n\n`;

        exercises.forEach((ex, index) => {
          message += `${index + 1}. ${ex.name}\n`;
          message += `   ${ex.sets} 组 × ${ex.reps_min}-${ex.reps_max} 次\n`;
          message += `   休息 ${ex.rest_seconds}秒\n\n`;
        });

        message += '💪 加油！今天也要突破自己！';
      } else {
        message += '🎉 今天是休息日，让肌肉好好恢复吧！\n\n';
        message += '记得保持良好的睡眠和饮食 😊';
      }

      await this.notificationHandler.send(telegramId, message);
      console.log(`✅ 已发送早上提醒给用户 ${telegramId}`);
    } catch (error) {
      console.error(`❌ 发送早上提醒失败:`, error);
    }
  }

  /**
   * 检查即将到来的训练
   */
  async checkUpcomingWorkouts(telegramId, advanceMinutes) {
    try {
      const user = this.db.getOrCreateUser(telegramId);
      const settings = this.db.getUserSettings(telegramId);

      if (!settings || !settings.trainingTime) {
        return;
      }

      const now = new Date();
      const [hour, minute] = settings.trainingTime.split(':').map(Number);

      const trainingTime = new Date();
      trainingTime.setHours(hour, minute, 0, 0);

      const reminderTime = addMinutes(trainingTime, -advanceMinutes);

      // 检查当前时间是否在提醒时间的前后 5 分钟内
      const timeDiff = Math.abs(now - reminderTime) / (1000 * 60);

      if (timeDiff <= 5) {
        await this.sendWorkoutReminder(telegramId);
      }
    } catch (error) {
      console.error(`❌ 检查训练提醒失败:`, error);
    }
  }

  /**
   * 发送训练前提醒
   */
  async sendWorkoutReminder(telegramId) {
    try {
      const user = this.db.getOrCreateUser(telegramId);
      const today = this.WEEK_DAYS[getDay(new Date())];
      const plan = this.db.getPlanByWeekDay(user.id, today);

      if (!plan) {
        return; // 今天没有训练计划
      }

      const exercises = this.db.getPlanExercises(plan.id);

      let message = '⏰ 训练提醒！\n\n';
      message += `📍 ${plan.muscle_group}训练即将开始\n\n`;
      message += '📝 今日动作清单：\n';

      exercises.forEach((ex, index) => {
        message += `${index + 1}. ${ex.name} - ${ex.sets}组\n`;
      });

      message += '\n💡 训练要点：\n';
      message += '• 充分热身 5-10 分钟\n';
      message += '• 注意动作标准性\n';
      message += '• 控制动作节奏\n';
      message += '• 及时补充水分\n\n';
      message += '🔥 准备好了吗？Let\'s go!';

      await this.notificationHandler.send(telegramId, message);
      console.log(`✅ 已发送训练提醒给用户 ${telegramId}`);
    } catch (error) {
      console.error(`❌ 发送训练提醒失败:`, error);
    }
  }

  /**
   * 停止所有提醒任务
   */
  stopAll() {
    console.log('🛑 停止所有提醒任务...');
    this.jobs.forEach((job, key) => {
      job.stop();
      console.log(`  停止任务: ${key}`);
    });
    this.jobs.clear();
    this.db.close();
  }

  /**
   * 重新加载用户的提醒设置
   */
  reload(telegramId) {
    // 停止该用户的现有任务
    const morningKey = `morning-${telegramId}`;
    const workoutKey = `workout-${telegramId}`;

    if (this.jobs.has(morningKey)) {
      this.jobs.get(morningKey).stop();
      this.jobs.delete(morningKey);
    }

    if (this.jobs.has(workoutKey)) {
      this.jobs.get(workoutKey).stop();
      this.jobs.delete(workoutKey);
    }

    // 重新安排
    this.scheduleUserReminders(telegramId);
    console.log(`🔄 已重新加载用户 ${telegramId} 的提醒设置`);
  }
}

module.exports = ReminderScheduler;
