// tools/log-metrics.js
const FitnessDatabase = require('../lib/database');

module.exports = async function logMetrics(args, context) {
  const { metricType, value, unit, notes } = args;
  const telegramId = context?.session?.user?.id || context?.userId || 'test_user';

  const db = new FitnessDatabase();

  try {
    // 保存到共享数据库
    db.saveBodyMetric(telegramId, metricType, value, unit, 'fitness', notes);

    // 获取最近历史数据进行对比
    const history = db.getBodyMetrics(telegramId, metricType, 2);

    let comparison = null;
    if (history.length >= 2) {
      const previous = history[1].value;
      const change = value - previous;
      const direction = change > 0 ? '↑' : change < 0 ? '↓' : '→';
      comparison = `${direction} ${Math.abs(change).toFixed(1)} ${unit}`;
    }

    db.close();

    const labels = {
      weight: '体重',
      body_fat: '体脂率',
      muscle_mass: '肌肉量',
      bmi: 'BMI'
    };

    const label = labels[metricType] || metricType;

    let message = `✅ ${label}记录成功\n\n`;
    message += `📊 当前：${value} ${unit}\n`;

    if (comparison) {
      message += `📈 变化：${comparison}\n`;
    }

    return {
      success: true,
      message,
      data: {
        metricType,
        value,
        unit,
        comparison
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
