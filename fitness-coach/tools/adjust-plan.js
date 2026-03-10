// tools/adjust-plan.js
const FitnessDatabase = require('../lib/database');

module.exports = async function adjustPlan(args, context) {
  const { planId, adjustments } = args;

  const db = new FitnessDatabase();

  try {
    // 更新计划动作
    for (const adj of adjustments) {
      const { exerciseId, newSets, newReps, newRest } = adj;

      let updateQuery = 'UPDATE plan_exercises SET ';
      const updates = [];
      const params = [];

      if (newSets !== undefined) {
        updates.push('sets = ?');
        params.push(newSets);
      }
      if (newReps && newReps.min !== undefined) {
        updates.push('reps_min = ?');
        params.push(newReps.min);
      }
      if (newReps && newReps.max !== undefined) {
        updates.push('reps_max = ?');
        params.push(newReps.max);
      }
      if (newRest !== undefined) {
        updates.push('rest_seconds = ?');
        params.push(newRest);
      }

      if (updates.length === 0) continue;

      updateQuery += updates.join(', ');
      updateQuery += ' WHERE plan_id = ? AND exercise_id = ?';
      params.push(planId, exerciseId);

      db.db.prepare(updateQuery).run(...params);
    }

    db.close();

    return {
      success: true,
      message: '训练计划已更新！'
    };

  } catch (error) {
    db.close();
    return {
      success: false,
      error: error.message
    };
  }
};
