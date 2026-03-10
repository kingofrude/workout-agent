// lib/plan-generator.js
const { determineSplit, SPLIT_CONFIGS, getSetsAndReps } = require('./utils');

class PlanGenerator {
  constructor(database) {
    this.db = database;
  }

  generate({ goal, experience, availableDays, equipment }) {
    // 1. 确定分化类型
    const splitType = determineSplit(availableDays.length, goal);
    const splitConfig = SPLIT_CONFIGS[splitType];

    // 2. 为可用日期分配肌群
    const plans = [];
    const splitSequence = splitConfig.split;

    for (let i = 0; i < availableDays.length; i++) {
      const dayName = availableDays[i];
      const splitName = splitSequence[i % splitSequence.length];
      const muscleGroups = splitConfig.muscleGroups[splitName];

      // 3. 为当天选择动作
      const exercises = this.selectExercises(
        muscleGroups,
        experience,
        equipment,
        goal
      );

      plans.push({
        weekDay: dayName,
        muscleGroup: this.formatMuscleGroupName(muscleGroups),
        exercises: exercises
      });
    }

    return plans;
  }

  selectExercises(muscleGroups, experience, equipment, goal) {
    const exercises = [];
    const setsReps = getSetsAndReps(experience, goal);

    // 动作选择优先级：复合动作 -> 孤立动作
    for (const muscleGroup of muscleGroups) {
      const available = this.db.searchExercises({
        category: muscleGroup,
        equipment: equipment[0] // 简化处理，使用第一个器械
      });

      if (available.length === 0) continue;

      // 每个肌群选择 2-3 个动作
      const count = muscleGroups.length === 1 ? 3 : 2;
      const selected = available.slice(0, count);

      selected.forEach(ex => {
        exercises.push({
          exerciseId: ex.id,
          name: ex.name,
          sets: setsReps.sets,
          repsMin: setsReps.repsMin,
          repsMax: setsReps.repsMax,
          restSeconds: this.getRestTime(goal, experience)
        });
      });
    }

    return exercises;
  }

  formatMuscleGroupName(groups) {
    const names = {
      chest: '胸',
      back: '背',
      legs: '腿',
      shoulders: '肩',
      biceps: '二头',
      triceps: '三头',
      core: '核心',
      arms: '手臂'
    };

    return groups.map(g => names[g] || g).join('+');
  }

  getRestTime(goal, experience) {
    const restTimes = {
      muscle_gain: 90,
      fat_loss: 60,
      strength: 180,
      endurance: 45
    };

    return restTimes[goal] || 90;
  }
}

module.exports = PlanGenerator;
