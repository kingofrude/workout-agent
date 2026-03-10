// tests/basic.test.js
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const FitnessDatabase = require('../lib/database');
const PlanGenerator = require('../lib/plan-generator');
const ProgressAnalyzer = require('../lib/progress-analyzer');

describe('Fitness Coach 基础测试', () => {
  let db;

  before(() => {
    // 使用测试数据库
    process.env.DB_PATH = './data/test-fitness.db';
    db = new FitnessDatabase();
  });

  after(() => {
    db.close();
  });

  describe('数据库操作', () => {
    test('应该能创建用户', () => {
      const user = db.getOrCreateUser('test_user_001');
      assert.ok(user);
      assert.strictEqual(user.telegram_id, 'test_user_001');
    });

    test('应该能查找动作', () => {
      const exercise = db.findExerciseByName('杠铃卧推');
      assert.ok(exercise);
      assert.strictEqual(exercise.name, '杠铃卧推');
      assert.strictEqual(exercise.category, 'chest');
    });

    test('应该能搜索动作', () => {
      const exercises = db.searchExercises({ category: 'chest' });
      assert.ok(exercises.length > 0);
      assert.ok(exercises.every(ex => ex.category === 'chest'));
    });
  });

  describe('训练计划生成', () => {
    test('应该能生成 3 天训练计划', () => {
      const generator = new PlanGenerator(db);
      const plans = generator.generate({
        goal: 'muscle_gain',
        experience: 'intermediate',
        availableDays: ['monday', 'wednesday', 'friday'],
        equipment: ['barbell', 'dumbbell']
      });

      assert.strictEqual(plans.length, 3);
      assert.strictEqual(plans[0].weekDay, 'monday');
      assert.ok(plans[0].exercises.length > 0);
    });

    test('应该能生成 5 天训练计划', () => {
      const generator = new PlanGenerator(db);
      const plans = generator.generate({
        goal: 'strength',
        experience: 'advanced',
        availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        equipment: ['barbell']
      });

      assert.strictEqual(plans.length, 5);
    });
  });

  describe('训练记录', () => {
    test('应该能记录训练', () => {
      const user = db.getOrCreateUser('test_user_002');
      const exercise = db.findExerciseByName('杠铃卧推');

      const log = db.createWorkoutLog({
        userId: user.id,
        exerciseId: exercise.id,
        planId: null
      });

      assert.ok(log.lastInsertRowid);

      db.saveWorkoutSet({
        logId: log.lastInsertRowid,
        setNumber: 1,
        weight: 80,
        reps: 10,
        rpe: 7
      });

      const sets = db.getWorkoutSets(log.lastInsertRowid);
      assert.strictEqual(sets.length, 1);
      assert.strictEqual(sets[0].weight, 80);
    });
  });

  describe('进度分析', () => {
    test('应该能分析进度（需要历史数据）', () => {
      const user = db.getOrCreateUser('test_user_003');
      const analyzer = new ProgressAnalyzer(db);

      const analysis = analyzer.analyze(user.id, {
        exerciseName: '杠铃卧推',
        period: 'all'
      });

      assert.ok(analysis);
      assert.ok(typeof analysis.totalSessions === 'number');
      assert.ok(analysis.totalSessions >= 0);
    });
  });

  describe('身体指标', () => {
    test('应该能记录体重', () => {
      const telegramId = 'test_user_004';
      db.getOrCreateUser(telegramId);

      db.saveBodyMetric({
        telegramId,
        metricType: 'weight',
        value: 75.5,
        unit: 'kg'
      });

      const metrics = db.getBodyMetrics(telegramId, 'weight', 7);
      assert.ok(metrics.length > 0);
      assert.strictEqual(metrics[0].value, 75.5);
    });
  });
});
