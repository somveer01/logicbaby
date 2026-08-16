// Test runner for logicbaby question bank and generator
import {
  getQuestions,
  getQuestionsForLevel,
  getQuestionById,
  getAvailableCategories,
  getTotalQuestionCount,
  prepareQuestionForPlay
} from './js/data/questionBank.js';

import { generateProceduralQuestion } from './js/data/questionGenerator.js';

let pass = 0, fail = 0;

function assert(label, condition) {
  if (condition) {
    console.log(`✅ PASS: ${label}`);
    pass++;
  } else {
    console.error(`❌ FAIL: ${label}`);
    fail++;
  }
}

console.log('--- Running Question Bank & Generator Tests ---');

// 1. Total count
const total = getTotalQuestionCount();
assert(`Total static questions: ${total} (expect >= 50)`, total >= 50);

// 2. Check all 6 categories exist
const cats = ['patterns', 'oddOneOut', 'spatial', 'math', 'sorting', 'memory'];
const ageGroups = ['3-4', '5-6', '7-8', '9+'];

for (const cat of cats) {
  const qs = getQuestions(cat, '5-6');
  assert(`Category "${cat}" has questions for age 5-6: ${qs.length}`, qs.length > 0);
}

// 3. Check all age groups have content
for (const ag of ageGroups) {
  const available = getAvailableCategories(ag);
  assert(`Age group "${ag}" has categories: ${available.length}`, available.length > 0);
}

// 4. getQuestionsForLevel returns 5 questions
const level1 = getQuestionsForLevel('patterns', '5-6', 1, 5);
assert(`getQuestionsForLevel returns 5 questions: ${level1.length}`, level1.length === 5);
assert('Returned questions are for patterns category', level1.every(q => q.category === 'patterns'));
assert('Every question has a valid correctOptionId', level1.every(q => q.options.some(o => o.id === q.correctOptionId)));

// 5. Procedural generation across categories and age tiers
for (const cat of ['math', 'patterns', 'oddOneOut', 'memory', 'sorting', 'spatial']) {
  for (const ag of ['3-4', '5-6', '7-8', '9+']) {
    for (let diff = 1; diff <= 3; diff++) {
      const q = generateProceduralQuestion(cat, ag, diff);
      assert(`Procedural generation: ${cat} [${ag}, diff=${diff}]`, 
        !!q && !!q.id && !!q.questionText && !!q.questionSVG && q.options.length === 4 && q.options.some(o => o.id === q.correctOptionId)
      );
    }
  }
}

// 6. Option shuffling & re-mapping
const rawQ = {
  id: 'test-01',
  category: 'math',
  ageGroup: '5-6',
  questionText: 'Test',
  questionSVG: '<svg></svg>',
  options: [
    { id: 'a', label: 'Correct', svg: 'svg1' },
    { id: 'b', label: 'Wrong 1', svg: 'svg2' },
    { id: 'c', label: 'Wrong 2', svg: 'svg3' },
    { id: 'd', label: 'Wrong 3', svg: 'svg4' }
  ],
  correctOptionId: 'a'
};

const prepared = prepareQuestionForPlay(rawQ);
assert('Prepared options have IDs a, b, c, d', JSON.stringify(prepared.options.map(o => o.id)) === JSON.stringify(['a', 'b', 'c', 'd']));
const matchedCorrect = prepared.options.find(o => o.id === prepared.correctOptionId);
assert('Correct option label preserved after remapping', matchedCorrect?.label === 'Correct');

// 8. Explicit difficulty tests (1, 2, 3)
for (const diff of [1, 2, 3]) {
  const diffQuestions = getQuestionsForLevel('math', '5-6', 1, 5, diff);
  assert(`getQuestionsForLevel with explicit diff=${diff} returns 5 questions`, diffQuestions.length === 5);
  assert(`All questions for diff=${diff} have valid correctOptionId`, diffQuestions.every(q => q.options.some(o => o.id === q.correctOptionId)));
}


console.log('\n========================================');
console.log(`Summary: ${pass} passed, ${fail} failed.`);

if (fail > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
