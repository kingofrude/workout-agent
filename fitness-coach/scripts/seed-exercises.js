// scripts/seed-exercises.js
const fs = require('fs');
const path = require('path');
const FitnessDatabase = require('../lib/database');

function seedExercises() {
  console.log('开始导入动作数据...\n');

  // 读取 exercise-data.json
  const dataPath = path.join(__dirname, '../assets/exercise-data.json');
  const exerciseData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  const db = new FitnessDatabase();

  let insertedCount = 0;
  let skippedCount = 0;

  for (const exercise of exerciseData) {
    try {
      // 检查是否已存在
      const existing = db.findExerciseByName(exercise.name);

      if (existing) {
        console.log(`⏭️  跳过已存在的动作: ${exercise.name}`);
        skippedCount++;
        continue;
      }

      // 插入动作
      db.insertExercise({
        name: exercise.name,
        nameEn: exercise.nameEn,
        category: exercise.category,
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,
        description: exercise.description,
        imagePath: exercise.imagePath,
        musclePrimary: exercise.musclePrimary,
        muscleSecondary: exercise.muscleSecondary,
        tips: exercise.tips
      });

      console.log(`✅ 已插入: ${exercise.name} (${exercise.nameEn})`);
      insertedCount++;

    } catch (error) {
      console.error(`❌ 插入失败 ${exercise.name}:`, error.message);
    }
  }

  db.close();

  console.log('\n导入完成！');
  console.log(`- 新插入: ${insertedCount} 个动作`);
  console.log(`- 跳过: ${skippedCount} 个动作`);
  console.log(`- 总计: ${exerciseData.length} 个动作\n`);
}

// 执行导入
if (require.main === module) {
  seedExercises();
}

module.exports = seedExercises;
