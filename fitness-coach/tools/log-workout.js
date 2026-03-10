// tools/log-workout.js
const FitnessDatabase = require('../lib/database');

module.exports = async function logWorkout(args, context) {
  const { exerciseName, sets, feeling, notes } = args;
  const telegramId = context?.session?.user?.id || context?.userId || 'test_user';

  const db = new FitnessDatabase();

  try {
    const user = db.getOrCreateUser(telegramId);

    // 查找动作
    const exercise = db.findExerciseByName(exerciseName);
    if (!exercise) {
      db.close();
      return {
        success: false,
        error: `未找到动作 "${exerciseName}"。请检查动作名称。`
      };
    }

    // 创建训练记录
    const logId = db.createWorkoutLog(user.id, exercise.id);

    // 保存每组数据
    sets.forEach((set, index) => {
      db.saveWorkoutSet(logId, index + 1, set);
    });

    // 保存感受和备注
    if (feeling || notes) {
      db.saveWorkoutFeedback(logId, feeling, notes);
    }

    // 计算统计数据
    const totalVolume = sets.reduce((sum, set) => {
      return sum + (set.weight * set.reps);
    }, 0);

    const maxWeight = Math.max(...sets.map(s => s.weight));

    // 获取上次训练数据进行对比
    const previousLogs = db.getWorkoutLogs(user.id, {
      exerciseId: exercise.id,
      limit: 2
    });

    let improvement = null;
    if (previousLogs.length >= 2) {
      const previousLog = previousLogs[1];
      const previousSets = db.getWorkoutSets(previousLog.id);
      const previousMaxWeight = Math.max(...previousSets.map(s => s.weight));

      if (maxWeight > previousMaxWeight) {
        const diff = maxWeight - previousMaxWeight;
        const percent = Math.round((diff / previousMaxWeight) * 1000) / 10;
        improvement = `比上次增加 ${diff}kg (+${percent}%)`;
      }
    }

    db.close();

    let message = `太棒了！💪 训练记录成功\n\n`;
    message += `📊 ${exerciseName}\n`;
    message += `- 总组数：${sets.length} 组\n`;
    message += `- 最大重量：${maxWeight} kg\n`;
    message += `- 总训练量：${Math.round(totalVolume)} kg\n`;

    if (improvement) {
      message += `- ${improvement} 🔥\n`;
    }

    return {
      success: true,
      logId,
      message,
      stats: {
        totalSets: sets.length,
        maxWeight,
        totalVolume: Math.round(totalVolume),
        improvement
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
