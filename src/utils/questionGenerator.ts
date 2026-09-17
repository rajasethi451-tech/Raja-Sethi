import { DifficultyLevel, GameMode, Question } from '../types';
import { ANIMALS } from '../data/animals';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomAnimal() {
  return ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
}

function getRandomDistinctAnimals(count: number) {
  const shuffled = [...ANIMALS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateOptions(targetAnswer: number, totalOptions: number, maxRange: number): number[] {
  const optionsSet = new Set<number>([targetAnswer]);

  const candidates = [
    targetAnswer + 1,
    targetAnswer - 1,
    targetAnswer + 2,
    targetAnswer - 2,
    targetAnswer + 3,
    targetAnswer - 3,
  ].filter((n) => n > 0 && n <= maxRange && n !== targetAnswer);

  // Shuffle candidates
  const shuffledCandidates = candidates.sort(() => 0.5 - Math.random());
  for (const c of shuffledCandidates) {
    if (optionsSet.size >= totalOptions) break;
    optionsSet.add(c);
  }

  // Fill up if still needed
  let fallback = 1;
  while (optionsSet.size < totalOptions) {
    if (fallback !== targetAnswer && fallback > 0) {
      optionsSet.add(fallback);
    }
    fallback++;
  }

  return Array.from(optionsSet).sort(() => 0.5 - Math.random());
}

export function generateQuestion(mode: GameMode, difficulty: DifficultyLevel): Question {
  const id = `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const [animalA, animalB] = getRandomDistinctAnimals(2);

  if (mode === 'counting') {
    let count = 3;
    let maxRange = 5;
    if (difficulty === 'toddler') {
      count = getRandomInt(1, 5);
      maxRange = 6;
    } else if (difficulty === 'kindergarten') {
      count = getRandomInt(3, 10);
      maxRange = 12;
    } else {
      count = getRandomInt(6, 16);
      maxRange = 18;
    }

    const optionsCount = difficulty === 'toddler' ? 3 : 4;
    const options = generateOptions(count, optionsCount, maxRange);

    return {
      id,
      mode: 'counting',
      difficulty,
      promptText: `How many ${animalA.name.split(' ')[0]}s are playing in the ${animalA.habitat}?`,
      speechText: `How many ${animalA.name.split(' ')[0]}s do you see? Tap each one to count them!`,
      storyContext: `Look! Friendly ${animalA.name.split(' ')[0]}s are enjoying the sunshine.`,
      leftGroup: {
        animal: animalA,
        count,
      },
      operation: 'count',
      targetAnswer: count,
      options,
      hint: `Tap each ${animalA.name.split(' ')[0]} one by one to hear the number count!`,
    };
  }

  if (mode === 'addition') {
    let count1 = 2;
    let count2 = 1;
    let maxRange = 6;

    if (difficulty === 'toddler') {
      // Sums 2 to 5
      count1 = getRandomInt(1, 3);
      count2 = getRandomInt(1, 5 - count1);
      maxRange = 6;
    } else if (difficulty === 'kindergarten') {
      // Sums 3 to 10
      count1 = getRandomInt(2, 6);
      count2 = getRandomInt(1, 10 - count1);
      maxRange = 12;
    } else {
      // Early Elementary: Sums 6 to 20
      count1 = getRandomInt(4, 11);
      count2 = getRandomInt(3, 20 - count1);
      maxRange = 22;
    }

    const sum = count1 + count2;
    const optionsCount = difficulty === 'toddler' ? 3 : 4;
    const options = generateOptions(sum, optionsCount, maxRange);

    const promptText = `${count1} ${animalA.name.split(' ')[0]}s + ${count2} ${animalB.name.split(' ')[0]}s = ?`;
    const speechText = `${count1} ${animalA.name.split(' ')[0]}s plus ${count2} ${animalB.name.split(' ')[0]}s. How many animal friends are there in total?`;

    return {
      id,
      mode: 'addition',
      difficulty,
      promptText,
      speechText,
      storyContext: `${count1} ${animalA.name.split(' ')[0]}s invite ${count2} friendly ${animalB.name.split(' ')[0]}s to their picnic!`,
      leftGroup: {
        animal: animalA,
        count: count1,
      },
      rightGroup: {
        animal: animalB,
        count: count2,
      },
      operation: '+',
      targetAnswer: sum,
      options,
      hint: `Start with ${count1} on the left, then count on ${count2} more: ${Array.from({ length: count2 }, (_, i) => count1 + i + 1).join(', ')}!`,
    };
  }

  if (mode === 'missing_number') {
    // e.g. count1 + ? = total
    let count1 = 2;
    let missing = 2;
    let maxRange = 6;

    if (difficulty === 'toddler') {
      count1 = getRandomInt(1, 3);
      missing = getRandomInt(1, 4 - count1);
      maxRange = 5;
    } else if (difficulty === 'kindergarten') {
      count1 = getRandomInt(2, 6);
      missing = getRandomInt(1, 9 - count1);
      maxRange = 10;
    } else {
      count1 = getRandomInt(4, 10);
      missing = getRandomInt(3, 16 - count1);
      maxRange = 18;
    }

    const total = count1 + missing;
    const optionsCount = difficulty === 'toddler' ? 3 : 4;
    const options = generateOptions(missing, optionsCount, maxRange);

    const promptText = `${count1} + ❓ = ${total} Animals`;
    const speechText = `There are ${count1} ${animalA.name.split(' ')[0]}s. How many more need to join to make ${total} animals altogether?`;

    return {
      id,
      mode: 'missing_number',
      difficulty,
      promptText,
      speechText,
      storyContext: `We want ${total} animal friends at the party! We already have ${count1} ${animalA.name.split(' ')[0]}s. Who is missing?`,
      leftGroup: {
        animal: animalA,
        count: count1,
      },
      rightGroup: {
        animal: animalB,
        count: missing,
      },
      operation: 'missing',
      missingPosition: 'right',
      targetAnswer: missing,
      options,
      hint: `Count up from ${count1} until you reach ${total}: how many steps did you take?`,
    };
  }

  // Which has more / comparison
  let countA = getRandomInt(1, difficulty === 'toddler' ? 4 : 8);
  let countB = getRandomInt(1, difficulty === 'toddler' ? 4 : 8);
  while (countA === countB) {
    countB = getRandomInt(1, difficulty === 'toddler' ? 4 : 8);
  }

  const targetAnswer = Math.max(countA, countB);
  const promptText = `Which group has MORE animals? Guess the bigger group!`;
  const speechText = `Look at the two animal groups. Which group has more animals?`;

  return {
    id,
    mode: 'which_has_more',
    difficulty,
    promptText,
    speechText,
    storyContext: `The ${animalA.name.split(' ')[0]}s and ${animalB.name.split(' ')[0]}s are having a friendly parade!`,
    leftGroup: {
      animal: animalA,
      count: countA,
    },
    rightGroup: {
      animal: animalB,
      count: countB,
    },
    operation: 'compare',
    targetAnswer,
    options: [countA, countB].sort(() => 0.5 - Math.random()),
    hint: `Compare the two groups: does ${countA} look bigger, or does ${countB}?`,
  };
}
