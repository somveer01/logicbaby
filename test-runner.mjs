// Test runner for LogicBaby question bank, procedural generator, and anti-duplication engine
import {
  getQuestions,
  getQuestionsForLevel,
  getQuestionById,
  getAvailableCategories,
  getTotalQuestionCount,
  prepareQuestionForPlay,
  getQuestionSignature
} from './js/data/questionBank.js';

import { generateProceduralQuestion } from './js/data/questionGenerator.js';
import {
  createProfile,
  switchProfile,
  markQuestionsAsSeen,
  getSeenQuestions,
  getSeenSignatures,
  hasQuestionBeenSeen,
  clearSeenQuestions,
  resetProgress
} from './js/services/storageService.js';

// Setup Mock LocalStorage for node environment
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

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

console.log('--- Running Question Bank & Anti-Duplication Tests ---');

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

// 4. Procedural generation across categories and age tiers (including dedicated sorting)
for (const cat of cats) {
  for (const ag of ageGroups) {
    for (let diff = 1; diff <= 3; diff++) {
      const q = generateProceduralQuestion(cat, ag, diff);
      assert(`Procedural generation: ${cat} [${ag}, diff=${diff}] with signature`, 
        !!q && !!q.id && !!q.signature && !!q.questionText && !!q.questionSVG && q.options.length === 4 && q.options.some(o => o.id === q.correctOptionId)
      );
    }
  }
}

// 5. Option shuffling & re-mapping preserves signature
const rawQ = {
  id: 'test-01',
  category: 'math',
  ageGroup: '5-6',
  signature: 'math:5-6:test-sig',
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
assert('Question signature preserved after preparation', prepared.signature === 'math:5-6:test-sig');

// 6. Profile Isolation & Anti-Duplication Simulation
console.log('\n--- Running Single-User Anti-Duplication Simulations ---');

// Create user profile for child A
const profileA = createProfile('Child A', '5-6', '🦊');
assert('Profile A created as active profile', !!profileA && profileA.name === 'Child A');

// Simulate Child A playing 30 consecutive levels (150 questions) in math
const servedQuestions = [];
const servedSignatures = new Set();
const servedIds = new Set();
let duplicatesFound = 0;

for (let lvl = 1; lvl <= 30; lvl++) {
  const levelQuestions = getQuestionsForLevel('math', '5-6', lvl, 5);
  assert(`Level ${lvl} returned exactly 5 questions`, levelQuestions.length === 5);

  // Check for duplicates within this level and against all previously served questions
  for (const q of levelQuestions) {
    const sig = q.signature || getQuestionSignature(q);
    if (servedIds.has(q.id) || servedSignatures.has(sig)) {
      duplicatesFound++;
      console.error(`Duplicate detected at level ${lvl}: id=${q.id}, sig=${sig}`);
    }
    servedIds.add(q.id);
    servedSignatures.add(sig);
    servedQuestions.push(q);
  }

  // Mark questions and signatures as seen for Profile A
  markQuestionsAsSeen(levelQuestions.map(q => q.id), levelQuestions.map(q => q.signature || q.id));
}

assert(`Child A played 30 levels (150 questions) with 0 duplicate questions: duplicates=${duplicatesFound}`, duplicatesFound === 0);
assert('Profile A seen question IDs retained fully (> 100 items, no 50-limit capping)', getSeenQuestions().length >= 150);
assert('Profile A seen signatures retained fully (> 100 items)', getSeenSignatures().length >= 150);

// 7. Test Anti-Duplication across all 6 categories
for (const testCat of ['patterns', 'oddOneOut', 'spatial', 'sorting', 'memory']) {
  let catDuplicates = 0;
  const catSignatures = new Set();
  for (let lvl = 1; lvl <= 15; lvl++) {
    const catQuestions = getQuestionsForLevel(testCat, '5-6', lvl, 5);
    for (const q of catQuestions) {
      const sig = q.signature || getQuestionSignature(q);
      if (catSignatures.has(sig)) {
        catDuplicates++;
      }
      catSignatures.add(sig);
    }
    markQuestionsAsSeen(catQuestions.map(q => q.id), catQuestions.map(q => q.signature || q.id));
  }
  assert(`Child A played 15 levels of ${testCat} with 0 duplicates: duplicates=${catDuplicates}`, catDuplicates === 0);
}

// 8. Test Profile Isolation (Child B gets fresh questions, unaffected by Child A)
console.log('\n--- Running Multi-Profile Isolation Tests ---');
const profileB = createProfile('Child B', '5-6', '🦁');
assert('Profile B created as active profile', !!profileB && profileB.name === 'Child B');
assert('Profile B starts with 0 seen questions', getSeenQuestions().length === 0);
assert('Profile B starts with 0 seen signatures', getSeenSignatures().length === 0);

const childBQuestions = getQuestionsForLevel('math', '5-6', 1, 5);
assert('Child B gets fresh curated questions for Level 1', childBQuestions.length === 5);

// Switch back to Child A and verify Child A still retains full history
switchProfile(profileA.id);
assert('Child A still has full seen question history after switching profiles', getSeenQuestions().length >= 250);

console.log('\n========================================');
console.log(`Summary: ${pass} passed, ${fail} failed.`);

if (fail > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
