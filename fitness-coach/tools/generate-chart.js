// tools/generate-chart.js
const FitnessDatabase = require('../lib/database');
const ProgressAnalyzer = require('../lib/progress-analyzer');
const ChartGenerator = require('../lib/chart-generator');

module.exports = async function generateChart(args, context) {
  const { chartType, exerciseName, period = 'month' } = args;
  const telegramId = context?.session?.user?.id || context?.userId || 'test_user';

  const db = new FitnessDatabase();

  try {
    const user = db.getOrCreateUser(telegramId);
    const chartGen = new ChartGenerator();

    let chartBuffer;
    let filename;

    if (chartType === 'weight_progress' && exerciseName) {
      // 重量进步图表
      const analyzer = new ProgressAnalyzer(db);
      const analysis = analyzer.analyze(user.id, { exerciseName, period });

      if (analysis.trend.length < 2) {
        db.close();
        return {
          success: false,
          error: '数据不足，至少需要 2 次训练记录才能生成图表。'
        };
      }

      chartBuffer = await chartGen.generateWeightChart(analysis.trend, exerciseName);
      filename = `weight_${exerciseName}_${Date.now()}.png`;

    } else if (chartType === 'volume_trend' && exerciseName) {
      // 训练量趋势图表
      const analyzer = new ProgressAnalyzer(db);
      const analysis = analyzer.analyze(user.id, { exerciseName, period });

      if (analysis.trend.length < 2) {
        db.close();
        return {
          success: false,
          error: '数据不足，至少需要 2 次训练记录才能生成图表。'
        };
      }

      chartBuffer = await chartGen.generateVolumeChart(analysis.trend, exerciseName);
      filename = `volume_${exerciseName}_${Date.now()}.png`;

    } else if (chartType === 'body_metrics') {
      // 身体指标图表
      const metricType = args.metricType || 'weight';
      const metrics = db.getBodyMetrics(telegramId, metricType, 30);

      if (metrics.length < 2) {
        db.close();
        return {
          success: false,
          error: '数据不足，至少需要 2 次记录才能生成图表。'
        };
      }

      chartBuffer = await chartGen.generateBodyMetricsChart(metrics.reverse(), metricType);
      filename = `metrics_${metricType}_${Date.now()}.png`;

    } else {
      db.close();
      return {
        success: false,
        error: '未知的图表类型或缺少参数。'
      };
    }

    // 保存图表
    const chartPath = await chartGen.saveChart(chartBuffer, filename);

    db.close();

    return {
      success: true,
      chartPath,
      message: '图表生成成功！📊'
    };

  } catch (error) {
    db.close();
    return {
      success: false,
      error: error.message
    };
  }
};
