// tools/create-plan.js
const FitnessDatabase = require('../lib/database');
const PlanGenerator = require('../lib/plan-generator');

module.exports = async function createPlan(args, context) {
  const { goal, experience, availableDays, equipment, reminderTime } = args;

  // 从上下文获取用户 ID
  const telegramId = context?.session?.user?.id || context?.userId || 'test_user';

  const db = new FitnessDatabase();

  try {
    // 1. 获取或创建用户
    const user = db.getOrCreateUser(telegramId);

    // 2. 保存用户档案
    db.saveUserProfile(user.id, {
      goal,
      experience,
      availableDays,
      equipment,
      trainingTime: reminderTime || '08:00',
      reminderAdvanceMinutes: 30
    });

    // 3. 生成训练计划
    const generator = new PlanGenerator(db);
    const plans = generator.generate({
      goal,
      experience,
      availableDays,
      equipment
    });

    // 4. 保存计划到数据库
    const savedPlans = [];
    for (const plan of plans) {
      const info = db.savePlan(user.id, plan);
      const planId = info.lastInsertRowid;

      db.savePlanExercises(planId, plan.exercises);

      savedPlans.push({
        id: planId,
        weekDay: plan.weekDay,
        muscleGroup: plan.muscleGroup,
        exercises: plan.exercises
      });
    }

    db.close();

    // 5. 重新加载提醒设置（如果提醒服务正在运行）
    try {
      const { scheduler } = require('../server');
      if (scheduler) {
        scheduler.reload(telegramId);
      }
    } catch (error) {
      // 提醒服务未运行，忽略错误
      console.log('⚠️  提醒服务未运行，跳过提醒设置');
    }

    return {
      success: true,
      message: `训练计划创建成功！已为你生成 ${savedPlans.length} 天的训练安排。`,
      plan: {
        userId: user.id,
        plans: savedPlans
      }
    };

  } catch (error) {
    db.close();
    return {
      success: false,
      error: error.message
    };
  }
};
