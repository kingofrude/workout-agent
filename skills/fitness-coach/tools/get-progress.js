// tools/get-progress.js
const FitnessDatabase = require('../lib/database');
const ProgressAnalyzer = require('../lib/progress-analyzer');

module.exports = async function getProgress(args, context) {
  const { exerciseName, period = 'month', metricType } = args;
  const telegramId = context?.session?.user?.id || context?.userId || 'test_user';

  const db = new FitnessDatabase();

  try {
    const user = db.getOrCreateUser(telegramId);

    const analyzer = new ProgressAnalyzer(db);
    const analysis = analyzer.analyze(user.id, {
      exerciseName,
      period
    });

    // 如果指定了指标类型，也获取身体指标
    let bodyMetrics = null;
    if (metricType) {
      bodyMetrics = db.getBodyMetrics(telegramId, metricType, 30);
    }

    db.close();

    const periodLabels = {
      week: '本周',
      month: '本月',
      year: '本年',
      all: '全部'
    };

    const periodLabel = periodLabels[period] || period;

    let message = `📊 ${periodLabel}进度报告\n\n`;

    if (exerciseName) {
      message += `🎯 ${exerciseName}\n\n`;
    }

    message += `**训练统计**\n`;
    message += `- 训练次数：${analysis.stats.totalWorkouts} 次\n`;
    message += `- 总组数：${analysis.stats.totalSets} 组\n`;
    message += `- 总训练量：${analysis.stats.totalVolume} kg\n`;
    message += `- 最大重量：${analysis.stats.maxWeight} kg\n`;
    message += `- 平均每组：${analysis.stats.avgReps} 次\n\n`;

    if (analysis.improvement) {
      message += `**进步情况**\n`;
      message += `- 重量进步：${analysis.improvement.weightChange >= 0 ? '+' : ''}${analysis.improvement.weightChange} kg (${analysis.improvement.weightPercent >= 0 ? '+' : ''}${analysis.improvement.weightPercent}%)\n`;
      message += `- 训练量变化：${analysis.improvement.volumeChange >= 0 ? '+' : ''}${Math.round(analysis.improvement.volumeChange)} kg (${analysis.improvement.volumePercent >= 0 ? '+' : ''}${analysis.improvement.volumePercent}%)\n\n`;
    }

    if (bodyMetrics && bodyMetrics.length > 0) {
      message += `**身体指标**\n`;
      message += `- 最新：${bodyMetrics[0].value} ${bodyMetrics[0].unit}\n`;

      if (bodyMetrics.length >= 2) {
        const change = bodyMetrics[0].value - bodyMetrics[1].value;
        message += `- 变化：${change >= 0 ? '+' : ''}${change.toFixed(1)} ${bodyMetrics[0].unit}\n`;
      }
    }

    return {
      success: true,
      message,
      data: {
        stats: analysis.stats,
        trend: analysis.trend,
        improvement: analysis.improvement,
        bodyMetrics
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
