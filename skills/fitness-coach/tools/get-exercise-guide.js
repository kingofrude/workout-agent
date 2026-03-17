// tools/get-exercise-guide.js
const FitnessDatabase = require('../lib/database');
const path = require('path');

module.exports = async function getExerciseGuide(args, context) {
  const { exerciseName } = args;

  const db = new FitnessDatabase();

  try {
    const exercise = db.findExerciseByName(exerciseName);

    if (!exercise) {
      db.close();
      return {
        success: false,
        error: `未找到动作 "${exerciseName}"。`
      };
    }

    const tips = exercise.tips ? JSON.parse(exercise.tips) : [];

    const imagePath = exercise.image_path
      ? path.join(__dirname, '../assets/exercises', exercise.image_path)
      : null;

    db.close();

    return {
      success: true,
      exercise: {
        name: exercise.name,
        nameEn: exercise.name_en,
        category: exercise.category,
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,
        description: exercise.description,
        imagePath: imagePath,
        musclePrimary: exercise.muscle_primary,
        muscleSecondary: exercise.muscle_secondary,
        tips: tips
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
