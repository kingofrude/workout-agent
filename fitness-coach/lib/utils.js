// lib/utils.js

/**
 * 星期映射
 */
const WEEK_DAYS = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

/**
 * 分化配置
 */
const SPLIT_CONFIGS = {
  'push-pull-legs': {
    days: 3,
    split: ['push', 'pull', 'legs'],
    muscleGroups: {
      push: ['chest', 'shoulders', 'triceps'],
      pull: ['back', 'biceps'],
      legs: ['legs', 'core']
    }
  },
  'upper-lower': {
    days: 4,
    split: ['upper', 'lower', 'upper', 'lower'],
    muscleGroups: {
      upper: ['chest', 'back', 'shoulders', 'arms'],
      lower: ['legs', 'core']
    }
  },
  'bodybuilding': {
    days: 5,
    split: ['chest', 'back', 'legs', 'shoulders', 'arms'],
    muscleGroups: {
      chest: ['chest'],
      back: ['back'],
      legs: ['legs'],
      shoulders: ['shoulders'],
      arms: ['biceps', 'triceps']
    }
  }
};

function determineSplit(daysPerWeek, goal) {
  if (daysPerWeek === 3) {
    return 'push-pull-legs';
  } else if (daysPerWeek === 4) {
    return 'upper-lower';
  } else if (daysPerWeek >= 5) {
    return 'bodybuilding';
  }
  // 默认 3 天分化
  return 'push-pull-legs';
}

function getSetsAndReps(experience, goal) {
  const configs = {
    beginner: {
      muscle_gain: { sets: 3, repsMin: 8, repsMax: 12 },
      fat_loss: { sets: 3, repsMin: 12, repsMax: 15 },
      strength: { sets: 4, repsMin: 5, repsMax: 8 },
      endurance: { sets: 3, repsMin: 15, repsMax: 20 }
    },
    intermediate: {
      muscle_gain: { sets: 4, repsMin: 8, repsMax: 12 },
      fat_loss: { sets: 4, repsMin: 12, repsMax: 15 },
      strength: { sets: 5, repsMin: 3, repsMax: 6 },
      endurance: { sets: 4, repsMin: 15, repsMax: 20 }
    },
    advanced: {
      muscle_gain: { sets: 4, repsMin: 6, repsMax: 10 },
      fat_loss: { sets: 4, repsMin: 10, repsMax: 15 },
      strength: { sets: 5, repsMin: 1, repsMax: 5 },
      endurance: { sets: 4, repsMin: 20, repsMax: 30 }
    }
  };

  return configs[experience]?.[goal] || configs.beginner.muscle_gain;
}

module.exports = {
  WEEK_DAYS,
  SPLIT_CONFIGS,
  determineSplit,
  getSetsAndReps
};
