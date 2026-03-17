// tools/get-today-plan.js
const FitnessDatabase = require('../lib/database');
const { getDay } = require('date-fns');

module.exports = async function getTodayPlan(args, context) {
  const telegramId = context?.session?.user?.id || context?.userId || 'test_user';

  const db = new FitnessDatabase();

  try {
    const user = db.getOrCreateUser(telegramId);

    // 获取今天是星期几
    const today = new Date();
    const weekDayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const weekDay = weekDayMap[getDay(today)];

    // 获取今日计划
    const plan = db.getPlanByWeekDay(user.id, weekDay);

    if (!plan) {
      db.close();
      return {
        success: true,
        todayPlan: null,
        message: `今天是${weekDay}，是休息日。好好恢复！💤`
      };
    }

    // 获取计划中的动作
    const exercises = db.getPlanExercises(plan.id);

    db.close();

    return {
      success: true,
      todayPlan: {
        weekDay: plan.week_day,
        muscleGroup: plan.muscle_group,
        exercises: exercises.map(ex => ({
          name: ex.name,
          sets: ex.sets,
          reps: `${ex.reps_min}-${ex.reps_max}`,
          rest: `${ex.rest_seconds}秒`,
          notes: ex.notes
        }))
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
