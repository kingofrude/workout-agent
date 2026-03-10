// lib/progress-analyzer.js
const { subDays, startOfWeek, startOfMonth, startOfYear } = require('date-fns');

class ProgressAnalyzer {
  constructor(database) {
    this.db = database;
  }

  analyze(userId, options = {}) {
    const { exerciseName, period = 'month' } = options;

    // 获取日期范围
    const dateRange = this.getDateRange(period);

    // 获取训练记录
    const filters = {
      startDate: dateRange.start,
      endDate: dateRange.end
    };

    if (exerciseName) {
      const exercise = this.db.findExerciseByName(exerciseName);
      if (exercise) {
        filters.exerciseId = exercise.id;
      }
    }

    const logs = this.db.getWorkoutLogs(userId, filters);

    // 分析数据
    const stats = this.calculateStats(logs);
    const trend = this.generateTrend(logs);
    const improvement = this.calculateImprovement(logs);

    return {
      totalSessions: logs.length,
      stats,
      trend,
      improvement
    };
  }

  getDateRange(period) {
    const now = new Date();
    let start;

    switch (period) {
      case 'week':
        start = startOfWeek(now);
        break;
      case 'month':
        start = startOfMonth(now);
        break;
      case 'year':
        start = startOfYear(now);
        break;
      case 'all':
        start = new Date(0);
        break;
      default:
        start = startOfMonth(now);
    }

    return {
      start: start.toISOString(),
      end: now.toISOString()
    };
  }

  calculateStats(logs) {
    if (logs.length === 0) {
      return {
        totalWorkouts: 0,
        totalSets: 0,
        totalVolume: 0,
        maxWeight: 0,
        avgReps: 0
      };
    }

    let totalSets = 0;
    let totalVolume = 0;
    let maxWeight = 0;
    let totalReps = 0;

    logs.forEach(log => {
      const sets = this.db.getWorkoutSets(log.id);
      totalSets += sets.length;

      sets.forEach(set => {
        totalVolume += set.weight * set.reps;
        totalReps += set.reps;
        if (set.weight > maxWeight) {
          maxWeight = set.weight;
        }
      });
    });

    return {
      totalWorkouts: logs.length,
      totalSets,
      totalVolume: Math.round(totalVolume),
      maxWeight,
      avgReps: totalSets > 0 ? Math.round(totalReps / totalSets * 10) / 10 : 0
    };
  }

  generateTrend(logs) {
    const trend = [];

    logs.forEach(log => {
      const sets = this.db.getWorkoutSets(log.id);
      const maxWeight = Math.max(...sets.map(s => s.weight));
      const totalVolume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);

      trend.push({
        date: log.logged_at.split('T')[0],
        maxWeight,
        totalVolume,
        sets: sets.length
      });
    });

    // 反转获得时间顺序
    return trend.reverse();
  }

  calculateImprovement(logs) {
    if (logs.length < 2) {
      return null;
    }

    const firstLog = logs[logs.length - 1];
    const lastLog = logs[0];

    const firstSets = this.db.getWorkoutSets(firstLog.id);
    const lastSets = this.db.getWorkoutSets(lastLog.id);

    const firstMaxWeight = Math.max(...firstSets.map(s => s.weight));
    const lastMaxWeight = Math.max(...lastSets.map(s => s.weight));

    const firstVolume = firstSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
    const lastVolume = lastSets.reduce((sum, s) => sum + s.weight * s.reps, 0);

    const weightChange = lastMaxWeight - firstMaxWeight;
    const weightPercent = firstMaxWeight > 0
      ? Math.round((weightChange / firstMaxWeight) * 1000) / 10
      : 0;

    const volumeChange = lastVolume - firstVolume;
    const volumePercent = firstVolume > 0
      ? Math.round((volumeChange / firstVolume) * 1000) / 10
      : 0;

    return {
      weightChange,
      weightPercent,
      volumeChange,
      volumePercent,
      workoutCount: logs.length
    };
  }
}

module.exports = ProgressAnalyzer;
