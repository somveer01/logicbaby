// ==========================================================================
// Question Bank — Visual Puzzles with Inline SVG & Procedural Generators
// 6 Categories × 4 Age Groups + Dynamic Infinite Generation
// ==========================================================================

import { generateProceduralQuestion } from './questionGenerator.js';
import { getSeenQuestions } from '../services/storageService.js';

// Runtime cache for dynamically generated questions
const RUNTIME_QUESTIONS_CACHE = new Map();

// ── SVG Helper Generators ──────────────────────────────────────────────────
// These functions generate reusable SVG shapes to keep the file manageable

function circle(cx, cy, r, fill, animClass = '') {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" class="${animClass}"/>`;
}
function rect(x, y, w, h, fill, rx = 6, animClass = '') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${rx}" class="${animClass}"/>`;
}
function tri(cx, cy, size, fill, animClass = '') {
  const h = size * 0.866;
  return `<polygon points="${cx},${cy - h / 1.5} ${cx - size / 2},${cy + h / 3} ${cx + size / 2},${cy + h / 3}" fill="${fill}" class="${animClass}"/>`;
}
function star(cx, cy, r, fill, animClass = '') {
  const pts = [];
  for (let i = 0; i < 5; i++) {
    const a1 = (i * 72 - 90) * Math.PI / 180;
    const a2 = ((i * 72) + 36 - 90) * Math.PI / 180;
    pts.push(`${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)}`);
    pts.push(`${cx + r * 0.42 * Math.cos(a2)},${cy + r * 0.42 * Math.sin(a2)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}" class="${animClass}"/>`;
}
function diamond(cx, cy, size, fill, animClass = '') {
  return `<polygon points="${cx},${cy - size} ${cx + size * 0.65},${cy} ${cx},${cy + size} ${cx - size * 0.65},${cy}" fill="${fill}" class="${animClass}"/>`;
}
function svgWrap(w, h, content) {
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${content}</svg>`;
}
function optionSvg(content) {
  return svgWrap(80, 80, content);
}
function questionSvg(content, w = 400, h = 140) {
  return svgWrap(w, h, content);
}

// Colors palette
const C = {
  red: '#EF4444', blue: '#3B82F6', green: '#22C55E', yellow: '#EAB308',
  purple: '#A855F7', orange: '#F97316', pink: '#EC4899', cyan: '#06B6D4',
  lime: '#84CC16', rose: '#F43F5E', indigo: '#6366F1', teal: '#14B8A6',
  gray: '#94A3B8', darkGray: '#475569', lightGray: '#CBD5E1'
};

// ==========================================================================
// PATTERNS & SEQUENCES
// ==========================================================================

const patternsQuestions = [
  // ── Ages 3-4 ──
  {
    id: 'pat-3-001', category: 'patterns', ageGroup: '3-4', difficulty: 1,
    questionText: 'What comes next? Red, Blue, Red, Blue, ...?',
    questionSVG: questionSvg(`
      ${circle(40, 70, 25, C.red)} ${circle(110, 70, 25, C.blue)}
      ${circle(180, 70, 25, C.red)} ${circle(250, 70, 25, C.blue)}
      <text x="330" y="82" font-size="40" fill="${C.gray}">?</text>
    `),
    options: [
      { id: 'a', svg: optionSvg(circle(40, 40, 28, C.red)), label: 'Red' },
      { id: 'b', svg: optionSvg(circle(40, 40, 28, C.blue)), label: 'Blue' },
      { id: 'c', svg: optionSvg(circle(40, 40, 28, C.green)), label: 'Green' },
      { id: 'd', svg: optionSvg(circle(40, 40, 28, C.yellow)), label: 'Yellow' }
    ],
    correctOptionId: 'a',
    hint: 'Look at the colors — they go back and forth!',
    explanation: 'The pattern alternates: Red, Blue, Red, Blue — so next is Red!'
  },
  {
    id: 'pat-3-002', category: 'patterns', ageGroup: '3-4', difficulty: 1,
    questionText: 'What shape comes next? Circle, Circle, Square, Circle, Circle, ...?',
    questionSVG: questionSvg(`
      ${circle(35, 70, 22, C.orange)} ${circle(95, 70, 22, C.orange)}
      ${rect(133, 48, 44, 44, C.orange)}
      ${circle(225, 70, 22, C.orange)} ${circle(285, 70, 22, C.orange)}
      <text x="340" y="82" font-size="40" fill="${C.gray}">?</text>
    `),
    options: [
      { id: 'a', svg: optionSvg(rect(18, 18, 44, 44, C.orange)), label: 'Square' },
      { id: 'b', svg: optionSvg(circle(40, 40, 26, C.orange)), label: 'Circle' },
      { id: 'c', svg: optionSvg(tri(40, 40, 48, C.orange)), label: 'Triangle' },
      { id: 'd', svg: optionSvg(diamond(40, 40, 28, C.orange)), label: 'Diamond' }
    ],
    correctOptionId: 'a',
    hint: 'Count the circles before each square!',
    explanation: 'Two circles then one square repeats. After two circles comes a square!'
  },
  {
    id: 'pat-3-003', category: 'patterns', ageGroup: '3-4', difficulty: 1,
    questionText: 'What color comes next? Green, Green, Yellow, Green, Green, ...?',
    questionSVG: questionSvg(`
      ${rect(10, 45, 50, 50, C.green, 8)} ${rect(75, 45, 50, 50, C.green, 8)}
      ${rect(140, 45, 50, 50, C.yellow, 8)} ${rect(205, 45, 50, 50, C.green, 8)}
      ${rect(270, 45, 50, 50, C.green, 8)}
      <text x="345" y="82" font-size="40" fill="${C.gray}">?</text>
    `),
    options: [
      { id: 'a', svg: optionSvg(rect(15, 15, 50, 50, C.yellow, 8)), label: 'Yellow' },
      { id: 'b', svg: optionSvg(rect(15, 15, 50, 50, C.green, 8)), label: 'Green' },
      { id: 'c', svg: optionSvg(rect(15, 15, 50, 50, C.red, 8)), label: 'Red' },
      { id: 'd', svg: optionSvg(rect(15, 15, 50, 50, C.blue, 8)), label: 'Blue' }
    ],
    correctOptionId: 'a',
    hint: 'Two greens, then what?',
    explanation: 'The pattern is Green, Green, Yellow — so after two greens comes Yellow!'
  },

  // ── Ages 5-6 ──
  {
    id: 'pat-5-001', category: 'patterns', ageGroup: '5-6', difficulty: 1,
    questionText: 'Complete the pattern: Triangle, Square, Circle, Triangle, Square, ...?',
    questionSVG: questionSvg(`
      ${tri(40, 70, 40, C.purple)} ${rect(73, 48, 40, 40, C.blue)}
      ${circle(155, 68, 22, C.green)} ${tri(210, 70, 40, C.purple)}
      ${rect(243, 48, 40, 40, C.blue)}
      <text x="330" y="82" font-size="40" fill="${C.gray}">?</text>
    `),
    options: [
      { id: 'a', svg: optionSvg(circle(40, 40, 26, C.green)), label: 'Circle' },
      { id: 'b', svg: optionSvg(tri(40, 40, 44, C.purple)), label: 'Triangle' },
      { id: 'c', svg: optionSvg(rect(16, 16, 48, 48, C.blue)), label: 'Square' },
      { id: 'd', svg: optionSvg(star(40, 40, 26, C.yellow)), label: 'Star' }
    ],
    correctOptionId: 'a',
    hint: 'Three shapes repeat: Triangle, Square, then...?',
    explanation: 'The ABC pattern is Triangle, Square, Circle — so Circle comes next!'
  },
  {
    id: 'pat-5-002', category: 'patterns', ageGroup: '5-6', difficulty: 2,
    questionText: 'What comes next? The shapes are getting bigger!',
    questionSVG: questionSvg(`
      ${circle(40, 70, 10, C.cyan)} ${circle(100, 70, 18, C.cyan)}
      ${circle(170, 70, 26, C.cyan)} ${circle(250, 70, 34, C.cyan)}
      <text x="335" y="82" font-size="40" fill="${C.gray}">?</text>
    `, 400, 140),
    options: [
      { id: 'a', svg: optionSvg(circle(40, 40, 36, C.cyan)), label: 'Biggest' },
      { id: 'b', svg: optionSvg(circle(40, 40, 10, C.cyan)), label: 'Tiny' },
      { id: 'c', svg: optionSvg(circle(40, 40, 20, C.cyan)), label: 'Medium' },
      { id: 'd', svg: optionSvg(circle(40, 40, 28, C.cyan)), label: 'Same' }
    ],
    correctOptionId: 'a',
    hint: 'Each circle is bigger than the last one!',
    explanation: 'The circles grow by 8 each time: 10, 18, 26, 34 — next is even bigger!'
  },
  {
    id: 'pat-5-003', category: 'patterns', ageGroup: '5-6', difficulty: 2,
    questionText: 'What comes next in the color pattern?',
    questionSVG: questionSvg(`
      ${circle(30, 70, 20, C.red)} ${circle(80, 70, 20, C.yellow)} ${circle(130, 70, 20, C.blue)}
      ${circle(190, 70, 20, C.red)} ${circle(240, 70, 20, C.yellow)} ${circle(290, 70, 20, C.blue)}
      ${circle(350, 70, 20, C.red)}
      <text x="385" y="80" font-size="32" fill="${C.gray}">?</text>
    `, 420, 140),
    options: [
      { id: 'a', svg: optionSvg(circle(40, 40, 26, C.yellow)), label: 'Yellow' },
      { id: 'b', svg: optionSvg(circle(40, 40, 26, C.blue)), label: 'Blue' },
      { id: 'c', svg: optionSvg(circle(40, 40, 26, C.red)), label: 'Red' },
      { id: 'd', svg: optionSvg(circle(40, 40, 26, C.green)), label: 'Green' }
    ],
    correctOptionId: 'a',
    hint: 'The colors repeat every three: Red, Yellow, Blue...',
    explanation: 'Red, Yellow, Blue repeats. After Red comes Yellow!'
  },

  // ── Ages 7-8 ──
  {
    id: 'pat-7-001', category: 'patterns', ageGroup: '7-8', difficulty: 2,
    questionText: 'What number comes next: 2, 4, 6, 8, ...?',
    questionSVG: questionSvg(`
      <text x="20" y="85" font-size="48" font-weight="bold" fill="${C.indigo}">2</text>
      <text x="90" y="85" font-size="48" font-weight="bold" fill="${C.indigo}">4</text>
      <text x="160" y="85" font-size="48" font-weight="bold" fill="${C.indigo}">6</text>
      <text x="230" y="85" font-size="48" font-weight="bold" fill="${C.indigo}">8</text>
      <text x="310" y="85" font-size="48" font-weight="bold" fill="${C.gray}">?</text>
    `),
    options: [
      { id: 'a', svg: optionSvg(`<text x="22" y="58" font-size="48" font-weight="bold" fill="${C.indigo}">10</text>`), label: '10' },
      { id: 'b', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${C.indigo}">9</text>`), label: '9' },
      { id: 'c', svg: optionSvg(`<text x="22" y="58" font-size="48" font-weight="bold" fill="${C.indigo}">12</text>`), label: '12' },
      { id: 'd', svg: optionSvg(`<text x="22" y="58" font-size="48" font-weight="bold" fill="${C.indigo}">11</text>`), label: '11' }
    ],
    correctOptionId: 'a',
    hint: 'Each number goes up by the same amount.',
    explanation: 'Adding 2 each time: 2, 4, 6, 8, 10!'
  },
  {
    id: 'pat-7-002', category: 'patterns', ageGroup: '7-8', difficulty: 3,
    questionText: 'What comes next: 1, 1, 2, 3, 5, ...?',
    questionSVG: questionSvg(`
      <text x="15" y="85" font-size="44" font-weight="bold" fill="${C.purple}">1</text>
      <text x="75" y="85" font-size="44" font-weight="bold" fill="${C.purple}">1</text>
      <text x="135" y="85" font-size="44" font-weight="bold" fill="${C.purple}">2</text>
      <text x="195" y="85" font-size="44" font-weight="bold" fill="${C.purple}">3</text>
      <text x="255" y="85" font-size="44" font-weight="bold" fill="${C.purple}">5</text>
      <text x="325" y="85" font-size="44" font-weight="bold" fill="${C.gray}">?</text>
    `),
    options: [
      { id: 'a', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${C.purple}">8</text>`), label: '8' },
      { id: 'b', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${C.purple}">6</text>`), label: '6' },
      { id: 'c', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${C.purple}">7</text>`), label: '7' },
      { id: 'd', svg: optionSvg(`<text x="22" y="58" font-size="48" font-weight="bold" fill="${C.purple}">10</text>`), label: '10' }
    ],
    correctOptionId: 'a',
    hint: 'Add the last two numbers together!',
    explanation: 'Fibonacci! Each number is the sum of the two before it: 3 + 5 = 8'
  },

  // ── Ages 9+ ──
  {
    id: 'pat-9-001', category: 'patterns', ageGroup: '9+', difficulty: 3,
    questionText: 'What comes next: 3, 6, 12, 24, ...?',
    questionSVG: questionSvg(`
      <text x="15" y="85" font-size="44" font-weight="bold" fill="${C.teal}">3</text>
      <text x="85" y="85" font-size="44" font-weight="bold" fill="${C.teal}">6</text>
      <text x="155" y="85" font-size="44" font-weight="bold" fill="${C.teal}">12</text>
      <text x="235" y="85" font-size="44" font-weight="bold" fill="${C.teal}">24</text>
      <text x="325" y="85" font-size="44" font-weight="bold" fill="${C.gray}">?</text>
    `),
    options: [
      { id: 'a', svg: optionSvg(`<text x="18" y="58" font-size="44" font-weight="bold" fill="${C.teal}">48</text>`), label: '48' },
      { id: 'b', svg: optionSvg(`<text x="18" y="58" font-size="44" font-weight="bold" fill="${C.teal}">36</text>`), label: '36' },
      { id: 'c', svg: optionSvg(`<text x="18" y="58" font-size="44" font-weight="bold" fill="${C.teal}">30</text>`), label: '30' },
      { id: 'd', svg: optionSvg(`<text x="18" y="58" font-size="44" font-weight="bold" fill="${C.teal}">42</text>`), label: '42' }
    ],
    correctOptionId: 'a',
    hint: 'Each number is multiplied by something!',
    explanation: 'Each number is doubled (×2): 3→6→12→24→48'
  },
  {
    id: 'pat-9-002', category: 'patterns', ageGroup: '9+', difficulty: 3,
    questionText: 'What comes next: 1, 4, 9, 16, 25, ...?',
    questionSVG: questionSvg(`
      <g class="anim-float">
        <text x="8" y="85" font-size="40" font-weight="bold" fill="${C.rose}">1</text>
        <text x="68" y="85" font-size="40" font-weight="bold" fill="${C.rose}">4</text>
        <text x="128" y="85" font-size="40" font-weight="bold" fill="${C.rose}">9</text>
        <text x="195" y="85" font-size="40" font-weight="bold" fill="${C.rose}">16</text>
        <text x="268" y="85" font-size="40" font-weight="bold" fill="${C.rose}">25</text>
        <text x="345" y="85" font-size="40" font-weight="bold" fill="${C.gray}">?</text>
      </g>
    `),
    options: [
      { id: 'a', svg: optionSvg(`<text x="18" y="58" font-size="44" font-weight="bold" fill="${C.rose}">36</text>`), label: '36' },
      { id: 'b', svg: optionSvg(`<text x="18" y="58" font-size="44" font-weight="bold" fill="${C.rose}">30</text>`), label: '30' },
      { id: 'c', svg: optionSvg(`<text x="18" y="58" font-size="44" font-weight="bold" fill="${C.rose}">35</text>`), label: '35' },
      { id: 'd', svg: optionSvg(`<text x="18" y="58" font-size="44" font-weight="bold" fill="${C.rose}">49</text>`), label: '49' }
    ],
    correctOptionId: 'a',
    hint: 'These are special numbers — try 1×1, 2×2, 3×3...',
    explanation: 'Perfect squares! 1², 2², 3², 4², 5², 6² = 36'
  },
  {
    id: 'pat-3-004', category: 'patterns', ageGroup: '3-4', difficulty: 2,
    questionText: 'What cute emoji comes next?',
    questionSVG: questionSvg(`
      <g class="anim-float">
        <text x="30" y="85" font-size="50">⭐ 🌸 ⭐ 🌸 ⭐</text>
        <text x="330" y="80" font-size="44" font-weight="bold" fill="${C.gray}">?</text>
      </g>
    `, 400, 130),
    options: [
      { id: 'a', svg: optionSvg(`<text x="15" y="58" font-size="52">🌸</text>`), label: 'Flower' },
      { id: 'b', svg: optionSvg(`<text x="15" y="58" font-size="52">⭐</text>`), label: 'Star' },
      { id: 'c', svg: optionSvg(`<text x="15" y="58" font-size="52">🚗</text>`), label: 'Car' },
      { id: 'd', svg: optionSvg(`<text x="15" y="58" font-size="52">🍎</text>`), label: 'Apple' }
    ],
    correctOptionId: 'a',
    hint: 'Star, Flower, Star, Flower, Star... what is next?',
    explanation: 'The pattern is Star then Flower — so Flower comes next! 🌸'
  },
  {
    id: 'pat-5-004', category: 'patterns', ageGroup: '5-6', difficulty: 3,
    questionText: 'Shapes are growing more corners! 3 corners ➔ 4 corners ➔ 5 corners ➔ ?',
    questionSVG: questionSvg(`
      <g class="anim-pulse">
        ${tri(60, 65, 45, C.purple)}
        <text x="105" y="72" font-size="28" fill="${C.gray}">➔</text>
        ${rect(130, 42, 45, 45, C.blue, 6)}
        <text x="195" y="72" font-size="28" fill="${C.gray}">➔</text>
        <polygon points="255,42 278,56 269,82 241,82 232,56" fill="${C.green}"/>
        <text x="300" y="72" font-size="28" fill="${C.gray}">➔</text>
        <text x="340" y="78" font-size="44" font-weight="bold" fill="${C.gray}">?</text>
      </g>
    `, 400, 130),
    options: [
      { id: 'a', svg: optionSvg(`<polygon points="40,15 65,28 65,58 40,71 15,58 15,28" fill="${C.orange}"/>`), label: 'Hexagon (6 Corners)' },
      { id: 'b', svg: optionSvg(tri(40, 40, 44, C.purple)), label: 'Triangle (3 Corners)' },
      { id: 'c', svg: optionSvg(rect(18, 18, 44, 44, C.blue, 4)), label: 'Square (4 Corners)' },
      { id: 'd', svg: optionSvg(circle(40, 40, 26, C.red)), label: 'Circle (0 Corners)' }
    ],
    correctOptionId: 'a',
    hint: 'Count corners: Triangle (3), Square (4), Pentagon (5)... what has 6?',
    explanation: 'Corners increase by 1 each time! Next is a 6-sided Hexagon! ⬡'
  },
  {
    id: 'pat-7-003', category: 'patterns', ageGroup: '7-8', difficulty: 3,
    questionText: 'Look at the 2×2 shape grid. What shape completes the grid?',
    questionSVG: questionSvg(`
      <g class="anim-float">
        <!-- 2x2 grid boxes -->
        <rect x="110" y="20" width="80" height="45" rx="8" fill="#F3E8FF" stroke="${C.purple}" stroke-width="2"/>
        <circle cx="150" cy="42" r="14" fill="${C.purple}"/>
        <rect x="200" y="20" width="80" height="45" rx="8" fill="#DBEAFE" stroke="${C.blue}" stroke-width="2"/>
        <rect x="236" y="28" width="28" height="28" rx="4" fill="${C.blue}"/>
        
        <rect x="110" y="72" width="80" height="45" rx="8" fill="#FCE7F3" stroke="${C.pink}" stroke-width="2"/>
        <polygon points="150,80 164,106 136,106" fill="${C.pink}"/>
        <rect x="200" y="72" width="80" height="45" rx="8" fill="#FEF3C7" stroke="${C.amber}" stroke-width="2"/>
        <text x="232" y="105" font-size="36" font-weight="bold" fill="${C.amber}">❓</text>
      </g>
    `, 400, 135),
    options: [
      { id: 'a', svg: optionSvg(star(40, 40, 24, C.amber)), label: 'Yellow Star' },
      { id: 'b', svg: optionSvg(circle(40, 40, 20, C.purple)), label: 'Purple Circle' },
      { id: 'c', svg: optionSvg(tri(40, 40, 36, C.pink)), label: 'Pink Triangle' },
      { id: 'd', svg: optionSvg(rect(20, 20, 40, 40, C.blue, 4)), label: 'Blue Square' }
    ],
    correctOptionId: 'a',
    hint: 'Each quadrant has a distinct unique shape and color!',
    explanation: 'The yellow star completes the 4-element logic matrix! ⭐'
  },
  {
    id: 'pat-9-003', category: 'patterns', ageGroup: '9+', difficulty: 3,
    questionText: 'Tripling pattern: 2, 6, 18, 54, ... what comes next?',
    questionSVG: questionSvg(`
      <g class="anim-glow">
        <rect x="30" y="25" width="340" height="85" rx="16" fill="#EDE9FE" stroke="${C.indigo}" stroke-width="2"/>
        <text x="45" y="80" font-size="38" font-weight="bold" fill="${C.indigo}">2, 6, 18, 54, <tspan fill="${C.rose}">?</tspan></text>
      </g>
    `, 400, 130),
    options: [
      { id: 'a', svg: optionSvg(`<text x="12" y="56" font-size="38" font-weight="bold" fill="${C.indigo}">162</text>`), label: '162' },
      { id: 'b', svg: optionSvg(`<text x="12" y="56" font-size="38" font-weight="bold" fill="${C.indigo}">108</text>`), label: '108' },
      { id: 'c', svg: optionSvg(`<text x="12" y="56" font-size="38" font-weight="bold" fill="${C.indigo}">150</text>`), label: '150' },
      { id: 'd', svg: optionSvg(`<text x="12" y="56" font-size="38" font-weight="bold" fill="${C.indigo}">180</text>`), label: '180' }
    ],
    correctOptionId: 'a',
    hint: 'Multiply each number by 3: 54 × 3 = ?',
    explanation: 'Geometric sequence where ratio is 3: 54 × 3 = 162!'
  }
];

// ==========================================================================
// ODD ONE OUT
// ==========================================================================

const oddOneOutQuestions = [
  // ── Ages 3-4 ──
  {
    id: 'odd-3-001', category: 'oddOneOut', ageGroup: '3-4', difficulty: 1,
    questionText: 'Which one is different? Find the odd one out!',
    questionSVG: questionSvg(`
      <text x="80" y="90" font-size="60" fill="${C.gray}">🍎 🍎 🍎 🐶</text>
    `, 400, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="18" y="56" font-size="50">🍎</text>`), label: 'Apple' },
      { id: 'b', svg: optionSvg(`<text x="18" y="56" font-size="50">🍎</text>`), label: 'Apple' },
      { id: 'c', svg: optionSvg(`<text x="18" y="56" font-size="50">🍎</text>`), label: 'Apple' },
      { id: 'd', svg: optionSvg(`<text x="18" y="56" font-size="50">🐶</text>`), label: 'Dog' }
    ],
    correctOptionId: 'd',
    hint: 'Three are fruits and one is an animal!',
    explanation: 'The dog is not a fruit — it\'s the odd one out!'
  },
  {
    id: 'odd-3-002', category: 'oddOneOut', ageGroup: '3-4', difficulty: 1,
    questionText: 'Which shape is different from the others?',
    questionSVG: questionSvg(`
      ${circle(55, 70, 28, C.blue)} ${circle(145, 70, 28, C.blue)}
      ${rect(210, 42, 56, 56, C.blue, 4)}
      ${circle(325, 70, 28, C.blue)}
    `),
    options: [
      { id: 'a', svg: optionSvg(circle(40, 40, 28, C.blue)), label: 'Circle' },
      { id: 'b', svg: optionSvg(circle(40, 40, 28, C.blue)), label: 'Circle' },
      { id: 'c', svg: optionSvg(rect(12, 12, 56, 56, C.blue, 4)), label: 'Square' },
      { id: 'd', svg: optionSvg(circle(40, 40, 28, C.blue)), label: 'Circle' }
    ],
    correctOptionId: 'c',
    hint: 'Look at the shapes — most are round!',
    explanation: 'Three circles and one square. The square is different!'
  },
  {
    id: 'odd-3-003', category: 'oddOneOut', ageGroup: '3-4', difficulty: 1,
    questionText: 'Which color doesn\'t match?',
    questionSVG: questionSvg(`
      ${circle(55, 70, 28, C.red)} ${circle(145, 70, 28, C.red)}
      ${circle(235, 70, 28, C.green)} ${circle(325, 70, 28, C.red)}
    `),
    options: [
      { id: 'a', svg: optionSvg(circle(40, 40, 30, C.red)), label: 'Red' },
      { id: 'b', svg: optionSvg(circle(40, 40, 30, C.red)), label: 'Red' },
      { id: 'c', svg: optionSvg(circle(40, 40, 30, C.green)), label: 'Green' },
      { id: 'd', svg: optionSvg(circle(40, 40, 30, C.red)), label: 'Red' }
    ],
    correctOptionId: 'c',
    hint: 'Most circles are the same color!',
    explanation: 'Three red and one green — green is the odd one!'
  },

  // ── Ages 5-6 ──
  {
    id: 'odd-5-001', category: 'oddOneOut', ageGroup: '5-6', difficulty: 1,
    questionText: 'Which one doesn\'t belong? Think about what they are!',
    questionSVG: questionSvg(`
      <text x="40" y="90" font-size="56">🚗 🚌 🚁 🚒</text>
    `, 400, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="15" y="56" font-size="50">🚗</text>`), label: 'Car' },
      { id: 'b', svg: optionSvg(`<text x="15" y="56" font-size="50">🚌</text>`), label: 'Bus' },
      { id: 'c', svg: optionSvg(`<text x="15" y="56" font-size="50">🚁</text>`), label: 'Helicopter' },
      { id: 'd', svg: optionSvg(`<text x="15" y="56" font-size="50">🚒</text>`), label: 'Fire Truck' }
    ],
    correctOptionId: 'c',
    hint: 'Three go on roads, one flies!',
    explanation: 'The helicopter flies — the others drive on roads!'
  },
  {
    id: 'odd-5-002', category: 'oddOneOut', ageGroup: '5-6', difficulty: 2,
    questionText: 'Which shape is different? Look carefully at the sizes!',
    questionSVG: questionSvg(`
      ${circle(55, 70, 30, C.pink)} ${circle(145, 70, 30, C.pink)}
      ${circle(235, 70, 15, C.pink)} ${circle(325, 70, 30, C.pink)}
    `),
    options: [
      { id: 'a', svg: optionSvg(circle(40, 40, 30, C.pink)), label: 'Big' },
      { id: 'b', svg: optionSvg(circle(40, 40, 30, C.pink)), label: 'Big' },
      { id: 'c', svg: optionSvg(circle(40, 40, 15, C.pink)), label: 'Small' },
      { id: 'd', svg: optionSvg(circle(40, 40, 30, C.pink)), label: 'Big' }
    ],
    correctOptionId: 'c',
    hint: 'One circle is not the same size!',
    explanation: 'Three big circles and one small one — the small one is different!'
  },
  {
    id: 'odd-5-003', category: 'oddOneOut', ageGroup: '5-6', difficulty: 2,
    questionText: 'Which one doesn\'t belong to the group?',
    questionSVG: questionSvg(`
      <text x="40" y="90" font-size="56">🍌 🍊 🥕 🍇</text>
    `, 400, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="15" y="56" font-size="50">🍌</text>`), label: 'Banana' },
      { id: 'b', svg: optionSvg(`<text x="15" y="56" font-size="50">🍊</text>`), label: 'Orange' },
      { id: 'c', svg: optionSvg(`<text x="15" y="56" font-size="50">🥕</text>`), label: 'Carrot' },
      { id: 'd', svg: optionSvg(`<text x="15" y="56" font-size="50">🍇</text>`), label: 'Grapes' }
    ],
    correctOptionId: 'c',
    hint: 'Three are fruits, one is a vegetable!',
    explanation: 'Carrot is a vegetable — the others are fruits!'
  },

  // ── Ages 7-8 ──
  {
    id: 'odd-7-001', category: 'oddOneOut', ageGroup: '7-8', difficulty: 2,
    questionText: 'Which number doesn\'t fit the pattern?',
    questionSVG: questionSvg(`
      <text x="20" y="85" font-size="48" font-weight="bold" fill="${C.indigo}">2</text>
      <text x="90" y="85" font-size="48" font-weight="bold" fill="${C.indigo}">4</text>
      <text x="155" y="85" font-size="48" font-weight="bold" fill="${C.indigo}">7</text>
      <text x="225" y="85" font-size="48" font-weight="bold" fill="${C.indigo}">8</text>
      <text x="295" y="85" font-size="48" font-weight="bold" fill="${C.indigo}">10</text>
    `),
    options: [
      { id: 'a', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${C.indigo}">2</text>`), label: '2' },
      { id: 'b', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${C.indigo}">4</text>`), label: '4' },
      { id: 'c', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${C.rose}">7</text>`), label: '7' },
      { id: 'd', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${C.indigo}">8</text>`), label: '8' }
    ],
    correctOptionId: 'c',
    hint: 'Most numbers are even...',
    explanation: '2, 4, 8, 10 are even numbers. 7 is odd — it doesn\'t belong!'
  },
  {
    id: 'odd-7-002', category: 'oddOneOut', ageGroup: '7-8', difficulty: 3,
    questionText: 'Which shape doesn\'t belong? Look at sides AND color!',
    questionSVG: questionSvg(`
      ${tri(55, 70, 48, C.blue)} ${tri(150, 70, 48, C.blue)}
      ${tri(245, 70, 48, C.red)} ${tri(340, 70, 48, C.blue)}
    `),
    options: [
      { id: 'a', svg: optionSvg(tri(40, 40, 44, C.blue)), label: 'Blue' },
      { id: 'b', svg: optionSvg(tri(40, 40, 44, C.blue)), label: 'Blue' },
      { id: 'c', svg: optionSvg(tri(40, 40, 44, C.red)), label: 'Red' },
      { id: 'd', svg: optionSvg(tri(40, 40, 44, C.blue)), label: 'Blue' }
    ],
    correctOptionId: 'c',
    hint: 'Same shapes but check the colors!',
    explanation: 'All triangles, but one is red while the others are blue!'
  },

  // ── Ages 9+ ──
  {
    id: 'odd-9-001', category: 'oddOneOut', ageGroup: '9+', difficulty: 3,
    questionText: 'Which doesn\'t fit? Think about what makes numbers special!',
    questionSVG: questionSvg(`
      <text x="15" y="85" font-size="44" font-weight="bold" fill="${C.teal}">2</text>
      <text x="75" y="85" font-size="44" font-weight="bold" fill="${C.teal}">3</text>
      <text x="135" y="85" font-size="44" font-weight="bold" fill="${C.teal}">5</text>
      <text x="195" y="85" font-size="44" font-weight="bold" fill="${C.teal}">9</text>
      <text x="260" y="85" font-size="44" font-weight="bold" fill="${C.teal}">11</text>
    `),
    options: [
      { id: 'a', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${C.teal}">2</text>`), label: '2' },
      { id: 'b', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${C.teal}">5</text>`), label: '5' },
      { id: 'c', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${C.rose}">9</text>`), label: '9' },
      { id: 'd', svg: optionSvg(`<text x="18" y="58" font-size="48" font-weight="bold" fill="${C.teal}">11</text>`), label: '11' }
    ],
    correctOptionId: 'c',
    hint: 'Prime numbers can only be divided by 1 and themselves...',
    explanation: '2, 3, 5, 11 are prime. 9 = 3×3, so it\'s NOT prime!'
  },
  {
    id: 'odd-3-003', category: 'oddOneOut', ageGroup: '3-4', difficulty: 2,
    questionText: 'Which one travels in water, while the others drive on roads?',
    questionSVG: questionSvg(`
      <g class="anim-float">
        <text x="35" y="85" font-size="52">🚗  🚌  ⛵  🚕</text>
      </g>
    `, 400, 130),
    options: [
      { id: 'a', svg: optionSvg(`<text x="15" y="58" font-size="52">⛵</text>`), label: 'Sailboat' },
      { id: 'b', svg: optionSvg(`<text x="15" y="58" font-size="52">🚗</text>`), label: 'Car' },
      { id: 'c', svg: optionSvg(`<text x="15" y="58" font-size="52">🚌</text>`), label: 'Bus' },
      { id: 'd', svg: optionSvg(`<text x="15" y="58" font-size="52">🚕</text>`), label: 'Taxi' }
    ],
    correctOptionId: 'a',
    hint: 'One floats on water with a sail!',
    explanation: 'The sailboat sails in water — all the others drive on roads! ⛵'
  },
  {
    id: 'odd-5-004', category: 'oddOneOut', ageGroup: '5-6', difficulty: 3,
    questionText: 'Which shape has NO straight edges or corners?',
    questionSVG: questionSvg(`
      <g class="anim-pulse">
        ${tri(60, 65, 42, C.blue)}
        ${rect(120, 44, 42, 42, C.green, 4)}
        ${circle(215, 65, 22, C.pink)}
        ${diamond(300, 65, 24, C.purple)}
      </g>
    `, 400, 130),
    options: [
      { id: 'a', svg: optionSvg(circle(40, 40, 26, C.pink)), label: 'Pink Circle' },
      { id: 'b', svg: optionSvg(tri(40, 40, 42, C.blue)), label: 'Blue Triangle' },
      { id: 'c', svg: optionSvg(rect(18, 18, 44, 44, C.green, 4)), label: 'Green Square' },
      { id: 'd', svg: optionSvg(diamond(40, 40, 24, C.purple)), label: 'Purple Diamond' }
    ],
    correctOptionId: 'a',
    hint: 'Triangles, squares, and diamonds have sharp corners. Which is curved all around?',
    explanation: 'The circle is curved with 0 corners — the others all have straight edges!'
  },
  {
    id: 'odd-9-002', category: 'oddOneOut', ageGroup: '9+', difficulty: 3,
    questionText: 'Which letter lacks vertical mirror symmetry?',
    questionSVG: questionSvg(`
      <g class="anim-glow">
        <text x="35" y="85" font-size="50" font-weight="bold" fill="${C.indigo}">A   M   T   F</text>
      </g>
    `, 400, 130),
    options: [
      { id: 'a', svg: optionSvg(`<text x="24" y="58" font-size="52" font-weight="bold" fill="${C.indigo}">F</text>`), label: 'F' },
      { id: 'b', svg: optionSvg(`<text x="24" y="58" font-size="52" font-weight="bold" fill="${C.indigo}">A</text>`), label: 'A' },
      { id: 'c', svg: optionSvg(`<text x="20" y="58" font-size="52" font-weight="bold" fill="${C.indigo}">M</text>`), label: 'M' },
      { id: 'd', svg: optionSvg(`<text x="24" y="58" font-size="52" font-weight="bold" fill="${C.indigo}">T</text>`), label: 'T' }
    ],
    correctOptionId: 'a',
    hint: 'Split each letter down the middle: A, M, and T have matching left and right halves!',
    explanation: 'A, M, and T are vertically symmetrical. F is asymmetrical!'
  }
];

// ==========================================================================
// SPATIAL & SHAPES
// ==========================================================================

const spatialQuestions = [
  // ── Ages 3-4 ──
  {
    id: 'spa-3-001', category: 'spatial', ageGroup: '3-4', difficulty: 1,
    questionText: 'Which shadow matches the star?',
    questionSVG: questionSvg(`
      ${star(80, 70, 35, C.yellow)}
      <text x="160" y="85" font-size="36" fill="${C.gray}">→ ?</text>
    `, 300, 140),
    options: [
      { id: 'a', svg: optionSvg(star(40, 40, 30, C.darkGray)), label: 'Star' },
      { id: 'b', svg: optionSvg(circle(40, 40, 28, C.darkGray)), label: 'Circle' },
      { id: 'c', svg: optionSvg(rect(12, 12, 56, 56, C.darkGray, 4)), label: 'Square' },
      { id: 'd', svg: optionSvg(tri(40, 42, 50, C.darkGray)), label: 'Triangle' }
    ],
    correctOptionId: 'a',
    hint: 'A shadow has the same shape but is dark!',
    explanation: 'The star\'s shadow is also a star shape — just dark!'
  },
  {
    id: 'spa-3-002', category: 'spatial', ageGroup: '3-4', difficulty: 1,
    questionText: 'Which shape is a circle?',
    questionSVG: questionSvg(`
      <text x="80" y="90" font-size="44" font-weight="bold" fill="${C.purple}">Find the circle!</text>
    `, 400, 120),
    options: [
      { id: 'a', svg: optionSvg(rect(14, 14, 52, 52, C.green, 4)), label: 'Square' },
      { id: 'b', svg: optionSvg(circle(40, 40, 28, C.blue)), label: 'Circle' },
      { id: 'c', svg: optionSvg(tri(40, 42, 50, C.red)), label: 'Triangle' },
      { id: 'd', svg: optionSvg(diamond(40, 40, 28, C.orange)), label: 'Diamond' }
    ],
    correctOptionId: 'b',
    hint: 'A circle is perfectly round!',
    explanation: 'The blue shape is a circle — it\'s round with no corners!'
  },
  {
    id: 'spa-3-003', category: 'spatial', ageGroup: '3-4', difficulty: 1,
    questionText: 'Which is the biggest shape?',
    questionSVG: questionSvg(`
      ${circle(60, 70, 12, C.orange)} ${circle(150, 70, 24, C.orange)}
      ${circle(260, 70, 40, C.orange)} ${circle(360, 70, 18, C.orange)}
    `),
    options: [
      { id: 'a', svg: optionSvg(circle(40, 40, 12, C.orange)), label: 'Tiny' },
      { id: 'b', svg: optionSvg(circle(40, 40, 24, C.orange)), label: 'Medium' },
      { id: 'c', svg: optionSvg(circle(40, 40, 36, C.orange)), label: 'Biggest!' },
      { id: 'd', svg: optionSvg(circle(40, 40, 18, C.orange)), label: 'Small' }
    ],
    correctOptionId: 'c',
    hint: 'Which circle takes up the most space?',
    explanation: 'The third circle is the biggest one!'
  },

  // ── Ages 5-6 ──
  {
    id: 'spa-5-001', category: 'spatial', ageGroup: '5-6', difficulty: 1,
    questionText: 'If you flip this shape in a mirror, what does it look like?',
    questionSVG: questionSvg(`
      <polygon points="40,30 120,30 120,110 80,110 80,70 40,70" fill="${C.blue}" opacity="0.8"/>
      <line x1="180" y1="20" x2="180" y2="120" stroke="${C.gray}" stroke-width="3" stroke-dasharray="8,4"/>
      <text x="200" y="80" font-size="36" fill="${C.gray}">?</text>
    `, 320, 140),
    options: [
      { id: 'a', svg: optionSvg(`<polygon points="60,10 60,50 20,50 20,70 60,70 60,10" fill="${C.blue}" opacity="0.8" transform="scale(-1,1) translate(-80,0)"/>`), label: 'Flipped' },
      { id: 'b', svg: optionSvg(`<polygon points="10,10 70,10 70,70 10,70" fill="${C.blue}" opacity="0.8"/>`), label: 'Square' },
      { id: 'c', svg: optionSvg(`<polygon points="10,10 70,10 70,50 40,50 40,70 10,70" fill="${C.blue}" opacity="0.8"/>`), label: 'Same' },
      { id: 'd', svg: optionSvg(circle(40, 40, 28, C.blue)), label: 'Circle' }
    ],
    correctOptionId: 'a',
    hint: 'A mirror flips left and right!',
    explanation: 'The mirror reflection swaps left and right sides!'
  },
  {
    id: 'spa-5-002', category: 'spatial', ageGroup: '5-6', difficulty: 2,
    questionText: 'How many triangles do you see?',
    questionSVG: questionSvg(`
      ${tri(60, 55, 50, C.green)}
      ${tri(140, 70, 40, C.green)}
      ${tri(210, 50, 55, C.green)}
      ${tri(290, 75, 35, C.green)}
    `, 380, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${C.green}">3</text>`), label: '3' },
      { id: 'b', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${C.green}">4</text>`), label: '4' },
      { id: 'c', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${C.green}">5</text>`), label: '5' },
      { id: 'd', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${C.green}">2</text>`), label: '2' }
    ],
    correctOptionId: 'b',
    hint: 'Count each triangle carefully!',
    explanation: 'There are exactly 4 triangles!'
  },

  // ── Ages 7-8 ──
  {
    id: 'spa-7-001', category: 'spatial', ageGroup: '7-8', difficulty: 2,
    questionText: 'Which shape has the most sides?',
    questionSVG: questionSvg(`
      <text x="60" y="85" font-size="36" fill="${C.purple}">Find the shape with the most sides!</text>
    `, 440, 120),
    options: [
      { id: 'a', svg: optionSvg(tri(40, 42, 48, C.red)), label: '3 sides' },
      { id: 'b', svg: optionSvg(rect(12, 12, 56, 56, C.blue, 0)), label: '4 sides' },
      { id: 'c', svg: optionSvg(`<polygon points="40,8 68,28 60,62 20,62 12,28" fill="${C.green}"/>`), label: '5 sides' },
      { id: 'd', svg: optionSvg(`<polygon points="40,8 62,18 68,42 52,64 28,64 12,42 18,18" fill="${C.purple}"/>`), label: '7 sides' }
    ],
    correctOptionId: 'd',
    hint: 'Count the edges on each shape!',
    explanation: 'The heptagon has 7 sides — the most of all the options!'
  },

  // ── Ages 9+ ──
  {
    id: 'spa-9-001', category: 'spatial', ageGroup: '9+', difficulty: 3,
    questionText: 'If you unfold a cube, which pattern do you get?',
    questionSVG: questionSvg(`
      <g transform="translate(120,20)">
        <rect x="0" y="0" width="40" height="40" fill="${C.indigo}" stroke="white" stroke-width="2" transform="skewY(-30) skewX(0)"/>
        <rect x="40" y="0" width="40" height="40" fill="${C.purple}" stroke="white" stroke-width="2" transform="skewY(30) translate(0,-20)"/>
        <rect x="0" y="-20" width="40" height="40" fill="${C.blue}" stroke="white" stroke-width="2" transform="skewX(-30) translate(0,-7)"/>
      </g>
    `, 300, 140),
    options: [
      { id: 'a', svg: optionSvg(`
        <rect x="22" y="2" width="16" height="16" fill="${C.indigo}" stroke="white" stroke-width="1"/>
        <rect x="6" y="18" width="16" height="16" fill="${C.purple}" stroke="white" stroke-width="1"/>
        <rect x="22" y="18" width="16" height="16" fill="${C.blue}" stroke="white" stroke-width="1"/>
        <rect x="38" y="18" width="16" height="16" fill="${C.indigo}" stroke="white" stroke-width="1"/>
        <rect x="54" y="18" width="16" height="16" fill="${C.purple}" stroke="white" stroke-width="1"/>
        <rect x="22" y="34" width="16" height="16" fill="${C.indigo}" stroke="white" stroke-width="1"/>
      `), label: 'Cross' },
      { id: 'b', svg: optionSvg(`
        <rect x="10" y="10" width="15" height="15" fill="${C.indigo}" stroke="white" stroke-width="1"/>
        <rect x="25" y="10" width="15" height="15" fill="${C.purple}" stroke="white" stroke-width="1"/>
        <rect x="40" y="10" width="15" height="15" fill="${C.blue}" stroke="white" stroke-width="1"/>
        <rect x="55" y="10" width="15" height="15" fill="${C.indigo}" stroke="white" stroke-width="1"/>
        <rect x="10" y="25" width="15" height="15" fill="${C.purple}" stroke="white" stroke-width="1"/>
        <rect x="25" y="25" width="15" height="15" fill="${C.blue}" stroke="white" stroke-width="1"/>
      `), label: 'L-shape' },
      { id: 'c', svg: optionSvg(`
        <rect x="10" y="10" width="12" height="12" fill="${C.indigo}" stroke="white" stroke-width="1"/>
        <rect x="22" y="10" width="12" height="12" fill="${C.purple}" stroke="white" stroke-width="1"/>
        <rect x="34" y="10" width="12" height="12" fill="${C.blue}" stroke="white" stroke-width="1"/>
        <rect x="46" y="10" width="12" height="12" fill="${C.indigo}" stroke="white" stroke-width="1"/>
        <rect x="58" y="10" width="12" height="12" fill="${C.purple}" stroke="white" stroke-width="1"/>
        <rect x="10" y="22" width="12" height="12" fill="${C.blue}" stroke="white" stroke-width="1"/>
      `), label: 'Row' },
      { id: 'd', svg: optionSvg(`
        <rect x="14" y="14" width="52" height="52" fill="${C.indigo}" stroke="white" stroke-width="1" rx="4"/>
      `), label: 'One big' }
    ],
    correctOptionId: 'a',
    hint: 'A cube has 6 faces that fold into a cross shape!',
    explanation: 'A cube unfolded makes a cross/plus pattern of 6 squares!'
  },
  {
    id: 'spa-9-002', category: 'spatial', ageGroup: '9+', difficulty: 3,
    questionText: 'Which 3D shape has 1 circular base and 1 pointed vertex?',
    questionSVG: questionSvg(`
      <text x="30" y="80" font-size="40" font-weight="bold" fill="${C.cyan}">📐 1 Circle Base + 1 Point = ?</text>
    `, 400, 120),
    options: [
      { id: 'a', svg: optionSvg(`
        <polygon points="40,12 18,65 62,65" fill="${C.cyan}"/>
        <ellipse cx="40" cy="65" rx="22" ry="7" fill="${C.cyan}" stroke="white" stroke-width="1.5"/>
      `), label: 'Cone' },
      { id: 'b', svg: optionSvg(`
        <rect x="20" y="20" width="40" height="45" fill="${C.blue}"/>
        <ellipse cx="40" cy="20" rx="20" ry="6" fill="${C.blue}" stroke="white" stroke-width="1.5"/>
        <ellipse cx="40" cy="65" rx="20" ry="6" fill="${C.blue}" stroke="white" stroke-width="1.5"/>
      `), label: 'Cylinder' },
      { id: 'c', svg: optionSvg(circle(40, 40, 26, C.purple)), label: 'Sphere' },
      { id: 'd', svg: optionSvg(rect(18, 18, 44, 44, C.indigo)), label: 'Cube' }
    ],
    correctOptionId: 'a',
    hint: 'Think of an ice cream cone!',
    explanation: 'A cone has a circular base and tapers to a single vertex!'
  },
  {
    id: 'spa-3-004', category: 'spatial', ageGroup: '3-4', difficulty: 2,
    questionText: 'Which piece completes the colorful butterfly wing?',
    questionSVG: questionSvg(`
      <g class="anim-float">
        <!-- Left Wing -->
        <path d="M 190 70 C 130 20, 110 90, 190 85 Z" fill="${C.purple}"/>
        <circle cx="150" cy="55" r="8" fill="${C.yellow}"/>
        <!-- Body -->
        <ellipse cx="200" cy="70" rx="6" ry="24" fill="${C.darkGray}"/>
        <!-- Right Wing outline -->
        <path d="M 210 70 C 270 20, 290 90, 210 85 Z" fill="none" stroke="${C.purple}" stroke-width="2" stroke-dasharray="4,4"/>
        <text x="240" y="65" font-size="28" fill="${C.purple}">❓</text>
      </g>
    `, 400, 130),
    options: [
      { id: 'a', svg: optionSvg(`
        <path d="M 20 50 C 65 10, 80 70, 20 65 Z" fill="${C.purple}"/>
        <circle cx="45" cy="40" r="7" fill="${C.yellow}"/>
      `), label: 'Matching Wing' },
      { id: 'b', svg: optionSvg(circle(40, 40, 24, C.green)), label: 'Green Circle' },
      { id: 'c', svg: optionSvg(rect(20, 20, 40, 40, C.red, 4)), label: 'Red Square' },
      { id: 'd', svg: optionSvg(tri(40, 40, 40, C.blue)), label: 'Blue Triangle' }
    ],
    correctOptionId: 'a',
    hint: 'Butterflies have matching wings on both sides!',
    explanation: 'The matching purple wing completes the symmetrical butterfly! 🦋'
  },
  {
    id: 'spa-7-003', category: 'spatial', ageGroup: '7-8', difficulty: 3,
    questionText: 'Count the blocks: How many cubes are in this 2×2×2 block stack?',
    questionSVG: questionSvg(`
      <g class="anim-pulse" transform="translate(140, 20)">
        <!-- Top layer -->
        <rect x="0" y="0" width="30" height="30" fill="${C.teal}" stroke="white" stroke-width="2"/>
        <rect x="30" y="0" width="30" height="30" fill="${C.teal}" stroke="white" stroke-width="2"/>
        <rect x="0" y="30" width="30" height="30" fill="${C.teal}" stroke="white" stroke-width="2"/>
        <rect x="30" y="30" width="30" height="30" fill="${C.teal}" stroke="white" stroke-width="2"/>
        <text x="75" y="45" font-size="22" font-weight="bold" fill="${C.darkGray}">× 2 Layers</text>
      </g>
    `, 400, 125),
    options: [
      { id: 'a', svg: optionSvg(`<text x="26" y="58" font-size="50" font-weight="bold" fill="${C.teal}">8</text>`), label: '8 Cubes' },
      { id: 'b', svg: optionSvg(`<text x="26" y="58" font-size="50" font-weight="bold" fill="${C.teal}">6</text>`), label: '6 Cubes' },
      { id: 'c', svg: optionSvg(`<text x="26" y="58" font-size="50" font-weight="bold" fill="${C.teal}">4</text>`), label: '4 Cubes' },
      { id: 'd', svg: optionSvg(`<text x="22" y="58" font-size="50" font-weight="bold" fill="${C.teal}">10</text>`), label: '10 Cubes' }
    ],
    correctOptionId: 'a',
    hint: '4 blocks on top layer + 4 blocks on bottom layer = ?',
    explanation: '2 × 2 × 2 = 8 cubes in a full 2x2x2 cube stack! 🧊'
  }
];

// ==========================================================================
// MATH & NUMBERS
// ==========================================================================

const mathQuestions = [
  // ── Ages 3-4 ──
  {
    id: 'math-3-001', category: 'math', ageGroup: '3-4', difficulty: 1,
    questionText: 'How many stars do you see?',
    questionSVG: questionSvg(`
      ${star(60, 60, 22, C.yellow)} ${star(130, 60, 22, C.yellow)} ${star(200, 60, 22, C.yellow)}
    `, 300, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.yellow}">2</text>`), label: '2' },
      { id: 'b', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.yellow}">3</text>`), label: '3' },
      { id: 'c', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.yellow}">4</text>`), label: '4' },
      { id: 'd', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.yellow}">1</text>`), label: '1' }
    ],
    correctOptionId: 'b',
    hint: 'Point to each star and count!',
    explanation: 'There are 3 stars!'
  },
  {
    id: 'math-3-002', category: 'math', ageGroup: '3-4', difficulty: 1,
    questionText: 'Which group has MORE circles?',
    questionSVG: questionSvg(`
      <text x="70" y="30" font-size="18" fill="${C.gray}" font-weight="bold">Group A</text>
      ${circle(50, 70, 15, C.red)} ${circle(100, 70, 15, C.red)}
      <line x1="170" y1="20" x2="170" y2="110" stroke="${C.lightGray}" stroke-width="2"/>
      <text x="240" y="30" font-size="18" fill="${C.gray}" font-weight="bold">Group B</text>
      ${circle(220, 70, 15, C.blue)} ${circle(260, 70, 15, C.blue)} ${circle(300, 70, 15, C.blue)} ${circle(340, 70, 15, C.blue)}
    `, 400, 110),
    options: [
      { id: 'a', svg: optionSvg(`<text x="4" y="56" font-size="28" font-weight="bold" fill="${C.red}">Group A</text>`), label: 'Group A (2)' },
      { id: 'b', svg: optionSvg(`<text x="4" y="56" font-size="28" font-weight="bold" fill="${C.blue}">Group B</text>`), label: 'Group B (4)' },
      { id: 'c', svg: optionSvg(`<text x="10" y="56" font-size="28" font-weight="bold" fill="${C.gray}">Same!</text>`), label: 'Same' },
      { id: 'd', svg: optionSvg(`<text x="6" y="56" font-size="28" font-weight="bold" fill="${C.gray}">None</text>`), label: 'Neither' }
    ],
    correctOptionId: 'b',
    hint: 'Count each group!',
    explanation: 'Group B has 4 circles, Group A has only 2. More = B!'
  },
  {
    id: 'math-3-003', category: 'math', ageGroup: '3-4', difficulty: 1,
    questionText: 'Which animal is BIGGER?',
    questionSVG: questionSvg(`
      <text x="50" y="90" font-size="64">🐘</text>
      <text x="180" y="70" font-size="30" fill="${C.gray}" font-weight="bold">vs</text>
      <text x="240" y="90" font-size="64">🐭</text>
    `, 360, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="15" y="60" font-size="52">🐘</text>`), label: 'Elephant' },
      { id: 'b', svg: optionSvg(`<text x="15" y="60" font-size="52">🐭</text>`), label: 'Mouse' },
      { id: 'c', svg: optionSvg(`<text x="8" y="56" font-size="28" font-weight="bold" fill="${C.gray}">Same</text>`), label: 'Same' },
      { id: 'd', svg: optionSvg(`<text x="15" y="60" font-size="52">🐶</text>`), label: 'Dog' }
    ],
    correctOptionId: 'a',
    hint: 'Think about real life — which is huge?',
    explanation: 'An elephant is MUCH bigger than a mouse!'
  },

  // ── Ages 5-6 ──
  {
    id: 'math-5-001', category: 'math', ageGroup: '5-6', difficulty: 1,
    questionText: 'What is 2 + 3?',
    questionSVG: questionSvg(`
      ${circle(30, 60, 16, C.blue)} ${circle(70, 60, 16, C.blue)}
      <text x="105" y="72" font-size="36" font-weight="bold" fill="${C.gray}">+</text>
      ${circle(150, 60, 16, C.green)} ${circle(190, 60, 16, C.green)} ${circle(230, 60, 16, C.green)}
      <text x="265" y="72" font-size="36" font-weight="bold" fill="${C.gray}">=</text>
      <text x="305" y="72" font-size="36" font-weight="bold" fill="${C.gray}">?</text>
    `, 360, 110),
    options: [
      { id: 'a', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.indigo}">4</text>`), label: '4' },
      { id: 'b', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.indigo}">5</text>`), label: '5' },
      { id: 'c', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.indigo}">6</text>`), label: '6' },
      { id: 'd', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.indigo}">3</text>`), label: '3' }
    ],
    correctOptionId: 'b',
    hint: 'Count all the dots together!',
    explanation: '2 blue + 3 green = 5 total!'
  },
  {
    id: 'math-5-002', category: 'math', ageGroup: '5-6', difficulty: 2,
    questionText: 'Which number is between 5 and 7?',
    questionSVG: questionSvg(`
      <text x="40" y="85" font-size="52" font-weight="bold" fill="${C.purple}">5</text>
      <text x="130" y="85" font-size="52" font-weight="bold" fill="${C.gray}">?</text>
      <text x="220" y="85" font-size="52" font-weight="bold" fill="${C.purple}">7</text>
    `, 300, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.purple}">6</text>`), label: '6' },
      { id: 'b', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.purple}">4</text>`), label: '4' },
      { id: 'c', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.purple}">8</text>`), label: '8' },
      { id: 'd', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.purple}">3</text>`), label: '3' }
    ],
    correctOptionId: 'a',
    hint: 'Count from 5 — what comes after?',
    explanation: '5, 6, 7 — so 6 is between 5 and 7!'
  },

  // ── Ages 7-8 ──
  {
    id: 'math-7-001', category: 'math', ageGroup: '7-8', difficulty: 2,
    questionText: 'What is 7 × 3?',
    questionSVG: questionSvg(`
      <text x="50" y="90" font-size="56" font-weight="bold" fill="${C.teal}">7 × 3 = ?</text>
    `, 350, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="18" y="58" font-size="44" font-weight="bold" fill="${C.teal}">21</text>`), label: '21' },
      { id: 'b', svg: optionSvg(`<text x="18" y="58" font-size="44" font-weight="bold" fill="${C.teal}">24</text>`), label: '24' },
      { id: 'c', svg: optionSvg(`<text x="18" y="58" font-size="44" font-weight="bold" fill="${C.teal}">18</text>`), label: '18' },
      { id: 'd', svg: optionSvg(`<text x="18" y="58" font-size="44" font-weight="bold" fill="${C.teal}">28</text>`), label: '28' }
    ],
    correctOptionId: 'a',
    hint: '7 + 7 + 7 = ?',
    explanation: '7 × 3 = 21. Or think: 7+7+7 = 21!'
  },
  {
    id: 'math-7-002', category: 'math', ageGroup: '7-8', difficulty: 3,
    questionText: 'If you have 15 candies and give away 8, how many are left?',
    questionSVG: questionSvg(`
      <text x="30" y="85" font-size="48" font-weight="bold" fill="${C.pink}">15 - 8 = ?</text>
    `, 350, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${C.pink}">7</text>`), label: '7' },
      { id: 'b', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${C.pink}">6</text>`), label: '6' },
      { id: 'c', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${C.pink}">8</text>`), label: '8' },
      { id: 'd', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${C.pink}">9</text>`), label: '9' }
    ],
    correctOptionId: 'a',
    hint: 'Take away 8 from 15!',
    explanation: '15 - 8 = 7 candies left!'
  },

  // ── Ages 9+ ──
  {
    id: 'math-9-001', category: 'math', ageGroup: '9+', difficulty: 3,
    questionText: 'What is 12 × 12?',
    questionSVG: questionSvg(`
      <text x="40" y="85" font-size="52" font-weight="bold" fill="${C.indigo}">12 × 12 = ?</text>
    `, 380, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="10" y="55" font-size="38" font-weight="bold" fill="${C.indigo}">144</text>`), label: '144' },
      { id: 'b', svg: optionSvg(`<text x="10" y="55" font-size="38" font-weight="bold" fill="${C.indigo}">124</text>`), label: '124' },
      { id: 'c', svg: optionSvg(`<text x="10" y="55" font-size="38" font-weight="bold" fill="${C.indigo}">132</text>`), label: '132' },
      { id: 'd', svg: optionSvg(`<text x="10" y="55" font-size="38" font-weight="bold" fill="${C.indigo}">156</text>`), label: '156' }
    ],
    correctOptionId: 'a',
    hint: '12 × 10 = 120, then add 12 × 2!',
    explanation: '12 × 12 = 144. A perfect square!'
  },
  {
    id: 'math-9-002', category: 'math', ageGroup: '9+', difficulty: 3,
    questionText: 'Find the missing number in the balance scale: 45 + ? = 100',
    questionSVG: questionSvg(`
      <text x="30" y="80" font-size="44" font-weight="bold" fill="${C.teal}">45 + ❓ = 100</text>
    `, 380, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="18" y="56" font-size="42" font-weight="bold" fill="${C.teal}">55</text>`), label: '55' },
      { id: 'b', svg: optionSvg(`<text x="18" y="56" font-size="42" font-weight="bold" fill="${C.teal}">65</text>`), label: '65' },
      { id: 'c', svg: optionSvg(`<text x="18" y="56" font-size="42" font-weight="bold" fill="${C.teal}">45</text>`), label: '45' },
      { id: 'd', svg: optionSvg(`<text x="18" y="56" font-size="42" font-weight="bold" fill="${C.teal}">50</text>`), label: '50' }
    ],
    correctOptionId: 'a',
    hint: '100 - 45 = ?',
    explanation: '100 - 45 = 55. 45 + 55 = 100!'
  },
  {
    id: 'math-3-004', category: 'math', ageGroup: '3-4', difficulty: 2,
    questionText: 'Count the floating balloons 🎈: 2 purple + 2 yellow = ?',
    questionSVG: questionSvg(`
      <g class="anim-float">
        <text x="50" y="85" font-size="44">🎈 🎈  +  🎈 🎈</text>
        <text x="280" y="80" font-size="44" font-weight="bold" fill="${C.gray}"> = ?</text>
      </g>
    `, 400, 130),
    options: [
      { id: 'a', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.purple}">4</text>`), label: '4' },
      { id: 'b', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.purple}">3</text>`), label: '3' },
      { id: 'c', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.purple}">5</text>`), label: '5' },
      { id: 'd', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.purple}">2</text>`), label: '2' }
    ],
    correctOptionId: 'a',
    hint: 'Count all 4 balloons one by one!',
    explanation: '2 + 2 = 4 balloons floating high in the sky! 🎈'
  },
  {
    id: 'math-7-003', category: 'math', ageGroup: '7-8', difficulty: 3,
    questionText: 'Clock Logic: The clock shows 3:00. What angle do the hands form?',
    questionSVG: questionSvg(`
      <g class="anim-pulse" transform="translate(140, 15)">
        <circle cx="50" cy="50" r="46" fill="white" stroke="${C.indigo}" stroke-width="3"/>
        <!-- 12 marker and 3 marker -->
        <text x="44" y="20" font-size="14" font-weight="bold" fill="${C.darkGray}">12</text>
        <text x="80" y="55" font-size="14" font-weight="bold" fill="${C.darkGray}">3</text>
        <!-- Hands: minute hand up to 12, hour hand right to 3 -->
        <line x1="50" y1="50" x2="50" y2="16" stroke="${C.indigo}" stroke-width="4" stroke-linecap="round"/>
        <line x1="50" y1="50" x2="80" y2="50" stroke="${C.pink}" stroke-width="4" stroke-linecap="round"/>
        <!-- Right angle square marker -->
        <rect x="50" y="38" width="12" height="12" fill="none" stroke="${C.amber}" stroke-width="2"/>
      </g>
    `, 400, 130),
    options: [
      { id: 'a', svg: optionSvg(`<text x="14" y="56" font-size="34" font-weight="bold" fill="${C.indigo}">90° (Right)</text>`), label: '90° Right Angle' },
      { id: 'b', svg: optionSvg(`<text x="14" y="56" font-size="34" font-weight="bold" fill="${C.indigo}">180°</text>`), label: '180° Flat' },
      { id: 'c', svg: optionSvg(`<text x="14" y="56" font-size="34" font-weight="bold" fill="${C.indigo}">45°</text>`), label: '45° Acute' },
      { id: 'd', svg: optionSvg(`<text x="14" y="56" font-size="34" font-weight="bold" fill="${C.indigo}">360°</text>`), label: '360° Full' }
    ],
    correctOptionId: 'a',
    hint: 'A corner of a square is a right angle (90 degrees)!',
    explanation: 'At 3:00, the hands are perpendicular, forming a 90° right angle! ⏰'
  },
  {
    id: 'math-9-003', category: 'math', ageGroup: '9+', difficulty: 3,
    questionText: 'Algebra Balance: If 3★ = 24, what is the value of 1★?',
    questionSVG: questionSvg(`
      <g class="anim-glow">
        <rect x="40" y="25" width="320" height="80" rx="16" fill="#F0FDF4" stroke="${C.green}" stroke-width="2"/>
        <text x="80" y="78" font-size="44" font-weight="bold" fill="${C.green}">3⭐ = 24 ➔ 1⭐ = ?</text>
      </g>
    `, 400, 130),
    options: [
      { id: 'a', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.green}">8</text>`), label: '8' },
      { id: 'b', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.green}">6</text>`), label: '6' },
      { id: 'c', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.green}">7</text>`), label: '7' },
      { id: 'd', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.green}">9</text>`), label: '9' }
    ],
    correctOptionId: 'a',
    hint: 'Divide 24 by 3!',
    explanation: '24 ÷ 3 = 8. So each star ⭐ is worth 8! 🌟'
  }
];

// ==========================================================================
// SORTING & GROUPING
// ==========================================================================

const sortingQuestions = [
  // ── Ages 3-4 ──
  {
    id: 'sort-3-001', category: 'sorting', ageGroup: '3-4', difficulty: 1,
    questionText: 'Which one is a fruit?',
    questionSVG: questionSvg(`
      <text x="60" y="85" font-size="40" fill="${C.green}" font-weight="bold">Pick the fruit! 🍽️</text>
    `, 360, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="15" y="58" font-size="52">🍕</text>`), label: 'Pizza' },
      { id: 'b', svg: optionSvg(`<text x="15" y="58" font-size="52">🍓</text>`), label: 'Strawberry' },
      { id: 'c', svg: optionSvg(`<text x="15" y="58" font-size="52">🧀</text>`), label: 'Cheese' },
      { id: 'd', svg: optionSvg(`<text x="15" y="58" font-size="52">🍞</text>`), label: 'Bread' }
    ],
    correctOptionId: 'b',
    hint: 'Fruits grow on plants and are sweet!',
    explanation: 'Strawberry is a fruit! 🍓'
  },
  {
    id: 'sort-3-002', category: 'sorting', ageGroup: '3-4', difficulty: 1,
    questionText: 'Which one is an animal?',
    questionSVG: questionSvg(`
      <text x="50" y="85" font-size="40" fill="${C.orange}" font-weight="bold">Find the animal! 🌿</text>
    `, 380, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="15" y="58" font-size="52">🌺</text>`), label: 'Flower' },
      { id: 'b', svg: optionSvg(`<text x="15" y="58" font-size="52">🌳</text>`), label: 'Tree' },
      { id: 'c', svg: optionSvg(`<text x="15" y="58" font-size="52">🐱</text>`), label: 'Cat' },
      { id: 'd', svg: optionSvg(`<text x="15" y="58" font-size="52">🪨</text>`), label: 'Rock' }
    ],
    correctOptionId: 'c',
    hint: 'Animals are alive and can move!',
    explanation: 'The cat is the animal! 🐱'
  },
  {
    id: 'sort-3-003', category: 'sorting', ageGroup: '3-4', difficulty: 1,
    questionText: 'Put these in order: smallest to biggest!',
    questionSVG: questionSvg(`
      <text x="60" y="85" font-size="36" fill="${C.blue}" font-weight="bold">🐜  🐕  🐘  Which is in the middle?</text>
    `, 460, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="15" y="58" font-size="52">🐜</text>`), label: 'Ant' },
      { id: 'b', svg: optionSvg(`<text x="15" y="58" font-size="52">🐕</text>`), label: 'Dog' },
      { id: 'c', svg: optionSvg(`<text x="15" y="58" font-size="52">🐘</text>`), label: 'Elephant' },
      { id: 'd', svg: optionSvg(`<text x="15" y="58" font-size="52">🐛</text>`), label: 'Bug' }
    ],
    correctOptionId: 'b',
    hint: 'The ant is smallest, the elephant is biggest. What\'s in between?',
    explanation: 'Order: Ant → Dog → Elephant. Dog is in the middle!'
  },

  // ── Ages 5-6 ──
  {
    id: 'sort-5-001', category: 'sorting', ageGroup: '5-6', difficulty: 1,
    questionText: 'Which lives in water?',
    questionSVG: questionSvg(`
      <text x="50" y="85" font-size="38" fill="${C.blue}" font-weight="bold">Which animal lives in water? 🌊</text>
    `, 440, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="15" y="58" font-size="52">🦁</text>`), label: 'Lion' },
      { id: 'b', svg: optionSvg(`<text x="15" y="58" font-size="52">🐟</text>`), label: 'Fish' },
      { id: 'c', svg: optionSvg(`<text x="15" y="58" font-size="52">🦅</text>`), label: 'Eagle' },
      { id: 'd', svg: optionSvg(`<text x="15" y="58" font-size="52">🐻</text>`), label: 'Bear' }
    ],
    correctOptionId: 'b',
    hint: 'One of these swims all day!',
    explanation: 'Fish live in water! 🐟'
  },
  {
    id: 'sort-5-002', category: 'sorting', ageGroup: '5-6', difficulty: 2,
    questionText: 'Which comes FIRST in the alphabet?',
    questionSVG: questionSvg(`
      <text x="80" y="85" font-size="46" font-weight="bold" fill="${C.purple}">D  B  A  C</text>
    `, 350, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="24" y="58" font-size="52" font-weight="bold" fill="${C.purple}">A</text>`), label: 'A' },
      { id: 'b', svg: optionSvg(`<text x="24" y="58" font-size="52" font-weight="bold" fill="${C.purple}">B</text>`), label: 'B' },
      { id: 'c', svg: optionSvg(`<text x="24" y="58" font-size="52" font-weight="bold" fill="${C.purple}">C</text>`), label: 'C' },
      { id: 'd', svg: optionSvg(`<text x="24" y="58" font-size="52" font-weight="bold" fill="${C.purple}">D</text>`), label: 'D' }
    ],
    correctOptionId: 'a',
    hint: 'Sing the alphabet song!',
    explanation: 'A, B, C, D — A comes first!'
  },

  // ── Ages 7-8 ──
  {
    id: 'sort-7-001', category: 'sorting', ageGroup: '7-8', difficulty: 2,
    questionText: 'Arrange from lightest to heaviest. Which is second?',
    questionSVG: questionSvg(`
      <text x="30" y="85" font-size="42">🪶  🐘  🍎  🚗</text>
    `, 380, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="15" y="58" font-size="52">🍎</text>`), label: 'Apple' },
      { id: 'b', svg: optionSvg(`<text x="15" y="58" font-size="52">🪶</text>`), label: 'Feather' },
      { id: 'c', svg: optionSvg(`<text x="15" y="58" font-size="52">🚗</text>`), label: 'Car' },
      { id: 'd', svg: optionSvg(`<text x="15" y="58" font-size="52">🐘</text>`), label: 'Elephant' }
    ],
    correctOptionId: 'a',
    hint: 'Feather is lightest. What\'s next?',
    explanation: 'Lightest → Heaviest: Feather, Apple, Car, Elephant. Apple is second!'
  },

  // ── Ages 9+ ──
  {
    id: 'sort-9-001', category: 'sorting', ageGroup: '9+', difficulty: 3,
    questionText: 'Which month comes right after June?',
    questionSVG: questionSvg(`
      <text x="30" y="80" font-size="42" font-weight="bold" fill="${C.green}">... May → June → ?</text>
    `, 420, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="8" y="50" font-size="26" font-weight="bold" fill="${C.green}">July</text>`), label: 'July' },
      { id: 'b', svg: optionSvg(`<text x="4" y="50" font-size="24" font-weight="bold" fill="${C.green}">August</text>`), label: 'August' },
      { id: 'c', svg: optionSvg(`<text x="10" y="50" font-size="26" font-weight="bold" fill="${C.green}">May</text>`), label: 'May' },
      { id: 'd', svg: optionSvg(`<text x="6" y="50" font-size="24" font-weight="bold" fill="${C.green}">March</text>`), label: 'March' }
    ],
    correctOptionId: 'a',
    hint: 'Think about summer months!',
    explanation: 'The month after June is July!'
  },
  {
    id: 'sort-9-002', category: 'sorting', ageGroup: '9+', difficulty: 3,
    questionText: 'Arrange temperatures from COLDEST to HOTTEST: Which comes FIRST?',
    questionSVG: questionSvg(`
      <text x="30" y="80" font-size="36" font-weight="bold" fill="${C.blue}">❄️ -5°C, 30°C, 0°C, 15°C</text>
    `, 400, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="12" y="56" font-size="34" font-weight="bold" fill="${C.cyan}">-5°C</text>`), label: '-5°C' },
      { id: 'b', svg: optionSvg(`<text x="18" y="56" font-size="34" font-weight="bold" fill="${C.blue}">0°C</text>`), label: '0°C' },
      { id: 'c', svg: optionSvg(`<text x="14" y="56" font-size="34" font-weight="bold" fill="${C.green}">15°C</text>`), label: '15°C' },
      { id: 'd', svg: optionSvg(`<text x="14" y="56" font-size="34" font-weight="bold" fill="${C.orange}">30°C</text>`), label: '30°C' }
    ],
    correctOptionId: 'a',
    hint: 'Negative numbers are below freezing and the coldest!',
    explanation: '-5°C is below zero, so it is the coldest temperature!'
  }
];

// ==========================================================================
// MEMORY & ATTENTION
// ==========================================================================

const memoryQuestions = [
  // ── Ages 3-4 ──
  {
    id: 'mem-3-001', category: 'memory', ageGroup: '3-4', difficulty: 1,
    questionText: 'Which two are exactly the same?',
    questionSVG: questionSvg(`
      <text x="50" y="85" font-size="36" fill="${C.purple}" font-weight="bold">Find the matching pair!</text>
    `, 380, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="15" y="58" font-size="52">🌸</text>`), label: 'Flower' },
      { id: 'b', svg: optionSvg(`<text x="15" y="58" font-size="52">🌻</text>`), label: 'Sunflower' },
      { id: 'c', svg: optionSvg(`<text x="15" y="58" font-size="52">🌸</text>`), label: 'Flower' },
      { id: 'd', svg: optionSvg(`<text x="15" y="58" font-size="52">🌹</text>`), label: 'Rose' }
    ],
    correctOptionId: 'a',
    hint: 'Look for two that look identical!',
    explanation: 'The cherry blossoms 🌸 match — they\'re the same!'
  },
  {
    id: 'mem-3-002', category: 'memory', ageGroup: '3-4', difficulty: 1,
    questionText: 'How many red hearts do you see?',
    questionSVG: questionSvg(`
      <text x="30" y="80" font-size="50">❤️ 💙 ❤️ 💚 ❤️</text>
    `, 380, 110),
    options: [
      { id: 'a', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.red}">2</text>`), label: '2' },
      { id: 'b', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.red}">3</text>`), label: '3' },
      { id: 'c', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.red}">4</text>`), label: '4' },
      { id: 'd', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.red}">1</text>`), label: '1' }
    ],
    correctOptionId: 'b',
    hint: 'Only count the RED ones!',
    explanation: 'There are 3 red hearts ❤️!'
  },
  {
    id: 'mem-3-003', category: 'memory', ageGroup: '3-4', difficulty: 1,
    questionText: 'Which emoji was shown twice?',
    questionSVG: questionSvg(`
      <text x="30" y="80" font-size="50">⭐ 🌙 ⭐ ☀️</text>
    `, 350, 110),
    options: [
      { id: 'a', svg: optionSvg(`<text x="15" y="58" font-size="52">⭐</text>`), label: 'Star' },
      { id: 'b', svg: optionSvg(`<text x="15" y="58" font-size="52">🌙</text>`), label: 'Moon' },
      { id: 'c', svg: optionSvg(`<text x="15" y="58" font-size="52">☀️</text>`), label: 'Sun' },
      { id: 'd', svg: optionSvg(`<text x="15" y="58" font-size="52">🌈</text>`), label: 'Rainbow' }
    ],
    correctOptionId: 'a',
    hint: 'Which one appears more than once?',
    explanation: 'The star ⭐ appears twice!'
  },

  // ── Ages 5-6 ──
  {
    id: 'mem-5-001', category: 'memory', ageGroup: '5-6', difficulty: 2,
    questionText: 'What is missing from the second row?',
    questionSVG: questionSvg(`
      <text x="15" y="26" font-size="14" fill="${C.gray}" font-weight="bold">Row 1:</text>
      <text x="20" y="58" font-size="36">🍎 🍌 🍊 🍇</text>
      <text x="15" y="82" font-size="14" fill="${C.gray}" font-weight="bold">Row 2:</text>
      <text x="20" y="115" font-size="36">🍎 🍌 ❓ 🍇</text>
    `, 300, 130),
    options: [
      { id: 'a', svg: optionSvg(`<text x="15" y="58" font-size="52">🍊</text>`), label: 'Orange' },
      { id: 'b', svg: optionSvg(`<text x="15" y="58" font-size="52">🍎</text>`), label: 'Apple' },
      { id: 'c', svg: optionSvg(`<text x="15" y="58" font-size="52">🍌</text>`), label: 'Banana' },
      { id: 'd', svg: optionSvg(`<text x="15" y="58" font-size="52">🍓</text>`), label: 'Strawberry' }
    ],
    correctOptionId: 'a',
    hint: 'Compare both rows — what\'s replaced by ❓?',
    explanation: 'The orange 🍊 is missing from the second row!'
  },
  {
    id: 'mem-5-002', category: 'memory', ageGroup: '5-6', difficulty: 2,
    questionText: 'How many BLUE shapes are there?',
    questionSVG: questionSvg(`
      ${circle(35, 60, 18, C.blue)} ${rect(65, 42, 36, 36, C.red, 4)}
      ${tri(135, 60, 36, C.blue)} ${circle(185, 60, 18, C.green)}
      ${rect(215, 42, 36, 36, C.blue, 4)} ${circle(275, 60, 18, C.red)}
      ${tri(325, 60, 36, C.yellow)}
    `, 370, 110),
    options: [
      { id: 'a', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.blue}">2</text>`), label: '2' },
      { id: 'b', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.blue}">3</text>`), label: '3' },
      { id: 'c', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.blue}">4</text>`), label: '4' },
      { id: 'd', svg: optionSvg(`<text x="28" y="58" font-size="52" font-weight="bold" fill="${C.blue}">1</text>`), label: '1' }
    ],
    correctOptionId: 'b',
    hint: 'Only look at the blue ones!',
    explanation: 'There are 3 blue shapes: 1 circle, 1 triangle, 1 square!'
  },

  // ── Ages 7-8 ──
  {
    id: 'mem-7-001', category: 'memory', ageGroup: '7-8', difficulty: 2,
    questionText: 'Which sequence was shown? Look carefully then pick!',
    questionSVG: questionSvg(`
      ${circle(40, 60, 18, C.red)} ${rect(75, 42, 36, 36, C.blue, 4)}
      ${tri(145, 60, 38, C.green)} ${star(200, 58, 18, C.yellow)}
    `, 280, 110),
    options: [
      { id: 'a', svg: optionSvg(`
        ${circle(12, 25, 9, C.red)} ${rect(28, 16, 18, 18, C.blue, 2)}
        ${tri(60, 25, 18, C.green)} ${star(78, 24, 9, C.yellow)}
      `), label: '🔴🟦🔺⭐' },
      { id: 'b', svg: optionSvg(`
        ${rect(8, 16, 18, 18, C.blue, 2)} ${circle(38, 25, 9, C.red)}
        ${tri(60, 25, 18, C.green)} ${star(78, 24, 9, C.yellow)}
      `), label: '🟦🔴🔺⭐' },
      { id: 'c', svg: optionSvg(`
        ${circle(12, 25, 9, C.red)} ${tri(35, 25, 18, C.green)}
        ${rect(48, 16, 18, 18, C.blue, 2)} ${star(78, 24, 9, C.yellow)}
      `), label: '🔴🔺🟦⭐' },
      { id: 'd', svg: optionSvg(`
        ${circle(12, 25, 9, C.green)} ${rect(28, 16, 18, 18, C.blue, 2)}
        ${tri(60, 25, 18, C.red)} ${star(78, 24, 9, C.yellow)}
      `), label: '🟢🟦🔺⭐' }
    ],
    correctOptionId: 'a',
    hint: 'Remember the order: Circle, Square, Triangle, Star!',
    explanation: 'The sequence was: Red Circle, Blue Square, Green Triangle, Yellow Star!'
  },

  // ── Ages 9+ ──
  {
    id: 'mem-9-001', category: 'memory', ageGroup: '9+', difficulty: 3,
    questionText: 'Count ALL shapes. How many are there in total?',
    questionSVG: questionSvg(`
      ${circle(25, 35, 14, C.blue)} ${rect(50, 22, 26, 26, C.red, 2)}
      ${tri(105, 35, 28, C.green)} ${circle(140, 35, 14, C.purple)}
      ${star(175, 33, 14, C.yellow)} ${rect(200, 22, 26, 26, C.orange, 2)}
      ${circle(250, 35, 14, C.pink)} ${tri(290, 35, 28, C.cyan)}
      ${diamond(330, 35, 16, C.indigo)} ${circle(365, 35, 14, C.lime)}
      ${rect(25, 85, 26, 26, C.teal, 2)} ${star(70, 95, 14, C.rose)}
    `, 400, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="18" y="58" font-size="48" font-weight="bold" fill="${C.purple}">10</text>`), label: '10' },
      { id: 'b', svg: optionSvg(`<text x="18" y="58" font-size="48" font-weight="bold" fill="${C.purple}">12</text>`), label: '12' },
      { id: 'c', svg: optionSvg(`<text x="18" y="58" font-size="48" font-weight="bold" fill="${C.purple}">11</text>`), label: '11' },
      { id: 'd', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${C.purple}">9</text>`), label: '9' }
    ],
    correctOptionId: 'b',
    hint: 'Count very carefully — there are shapes on two rows!',
    explanation: 'There are 12 shapes total: 4 circles, 3 rectangles, 2 triangles, 2 stars, 1 diamond!'
  },
  {
    id: 'sort-3-004', category: 'sorting', ageGroup: '3-4', difficulty: 2,
    questionText: 'Which one is HOT 🔥?',
    questionSVG: questionSvg(`
      <g class="anim-pulse">
        <text x="50" y="85" font-size="44">🔥 Pick what is HOT!</text>
      </g>
    `, 380, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="15" y="58" font-size="52">☀️</text>`), label: 'Sun' },
      { id: 'b', svg: optionSvg(`<text x="15" y="58" font-size="52">⛄</text>`), label: 'Snowman' },
      { id: 'c', svg: optionSvg(`<text x="15" y="58" font-size="52">🍦</text>`), label: 'Ice Cream' },
      { id: 'd', svg: optionSvg(`<text x="15" y="58" font-size="52">🧊</text>`), label: 'Ice Cube' }
    ],
    correctOptionId: 'a',
    hint: 'The sun shines in the sky and keeps us warm!',
    explanation: 'The Sun ☀️ is hot! Snowmen and ice cream are cold!'
  },
  {
    id: 'sort-7-002', category: 'sorting', ageGroup: '7-8', difficulty: 3,
    questionText: 'Timeline of a Day: What happens FIRST when morning begins?',
    questionSVG: questionSvg(`
      <g class="anim-float">
        <text x="35" y="80" font-size="44">🌅  ☀️  🌇  🌙</text>
      </g>
    `, 400, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="15" y="58" font-size="52">🌅</text>`), label: 'Sunrise' },
      { id: 'b', svg: optionSvg(`<text x="15" y="58" font-size="52">☀️</text>`), label: 'Noon' },
      { id: 'c', svg: optionSvg(`<text x="15" y="58" font-size="52">🌇</text>`), label: 'Sunset' },
      { id: 'd', svg: optionSvg(`<text x="15" y="58" font-size="52">🌙</text>`), label: 'Night' }
    ],
    correctOptionId: 'a',
    hint: 'The sun comes up in the morning!',
    explanation: 'Order of the day: Sunrise 🌅 ➔ Noon ☀️ ➔ Sunset 🌇 ➔ Night 🌙'
  },
  {
    id: 'mem-3-004', category: 'memory', ageGroup: '3-4', difficulty: 2,
    questionText: 'Find the two matching sparkling diamonds 💎!',
    questionSVG: questionSvg(`
      <g class="anim-glow">
        <text x="35" y="80" font-size="48">💎  ⭐  💎  🎈</text>
      </g>
    `, 380, 120),
    options: [
      { id: 'a', svg: optionSvg(`<text x="15" y="58" font-size="52">💎</text>`), label: 'Diamond' },
      { id: 'b', svg: optionSvg(`<text x="15" y="58" font-size="52">⭐</text>`), label: 'Star' },
      { id: 'c', svg: optionSvg(`<text x="15" y="58" font-size="52">🎈</text>`), label: 'Balloon' },
      { id: 'd', svg: optionSvg(`<text x="15" y="58" font-size="52">🍎</text>`), label: 'Apple' }
    ],
    correctOptionId: 'a',
    hint: 'Look for the emoji that was shown two times!',
    explanation: 'The diamond 💎 appears twice in the row!'
  }
];


// ==========================================================================
// COMBINED BANK + QUERY API
// ==========================================================================

export const ALL_QUESTIONS = [
  ...patternsQuestions,
  ...oddOneOutQuestions,
  ...spatialQuestions,
  ...mathQuestions,
  ...sortingQuestions,
  ...memoryQuestions
];


/**
 * Get questions filtered by category and age group.
 * @param {string} category - Category key
 * @param {string} ageGroup - Age group string ('3-4', '5-6', '7-8', '9+')
 * @param {number} [difficulty] - Max difficulty level (1-3). If given, only questions with difficulty <= this value.
 * @returns {Array} Filtered questions
 */
export function getQuestions(category, ageGroup, difficulty = 3) {
  return ALL_QUESTIONS.filter(q =>
    q.category === category &&
    q.ageGroup === ageGroup &&
    q.difficulty <= difficulty
  );
}

/**
 * Prepare a question for gameplay:
 * 1. Deep clones the question object
 * 2. Shuffles the options dynamically so the correct answer isn't always in position 'a'
 * 3. Re-maps option IDs to standard 'a', 'b', 'c', 'd'
 * 4. Updates correctOptionId to match the new location
 * 5. Caches in runtime cache for error/mistake lookup
 * @param {Object} rawQuestion
 * @returns {Object}
 */
export function prepareQuestionForPlay(rawQuestion) {
  if (!rawQuestion) return null;
  const q = { ...rawQuestion };
  const originalCorrectId = rawQuestion.correctOptionId;

  // Mark which option was originally correct
  const taggedOptions = (rawQuestion.options || []).map(opt => ({
    ...opt,
    _isCorrect: (opt.id === originalCorrectId)
  }));

  // Shuffle options using Fisher-Yates
  for (let i = taggedOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [taggedOptions[i], taggedOptions[j]] = [taggedOptions[j], taggedOptions[i]];
  }

  // Re-map IDs to standard 'a', 'b', 'c', 'd' and track new correct ID
  const letters = ['a', 'b', 'c', 'd', 'e', 'f'];
  let newCorrectId = 'a';
  const finalOptions = taggedOptions.map((opt, idx) => {
    const newId = letters[idx] || `opt-${idx}`;
    if (opt._isCorrect) {
      newCorrectId = newId;
    }
    const { _isCorrect, ...rest } = opt;
    return { ...rest, id: newId };
  });

  q.options = finalOptions;
  q.correctOptionId = newCorrectId;

  // Register in runtime cache for mistake reviews
  RUNTIME_QUESTIONS_CACHE.set(q.id, q);

  return q;
}

/**
 * Get a smart, non-repeating set of questions for a game level.
 * Features:
 * - Prioritizes unseen questions from child's history cooldown
 * - Supplements with procedural generation so questions never run out
 * - Shuffles and remaps options uniformly
 * @param {string} category
 * @param {string} ageGroup
 * @param {number} level - Level number (affects difficulty filtering)
 * @param {number} [count=5] - Number of questions to return
 * @returns {Array} Shuffled, prepared questions
 */
export function getQuestionsForLevel(category, ageGroup, level = 1, count = 5, difficulty = null) {
  const targetDifficulty = (difficulty !== null && difficulty !== undefined) ? Number(difficulty) : Math.min(level, 3);
  const seenIds = getSeenQuestions() || [];

  // 1. Get exact matching static questions for category + ageGroup + difficulty
  const staticMatches = getQuestions(category, ageGroup, targetDifficulty);

  // 2. Filter out questions already seen recently
  let unseenStatic = staticMatches.filter(q => !seenIds.includes(q.id));

  // If all static questions have been seen, refresh from full pool
  if (unseenStatic.length === 0) {
    unseenStatic = [...staticMatches];
  }

  // Shuffle candidate static questions
  const shuffledStatic = [...unseenStatic];
  for (let i = shuffledStatic.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledStatic[i], shuffledStatic[j]] = [shuffledStatic[j], shuffledStatic[i]];
  }

  // Pick static questions (take up to half of count, leaving room for procedural questions)
  const selectedQuestions = [];
  const staticTarget = Math.min(shuffledStatic.length, Math.max(1, Math.floor(count / 2)));
  for (let i = 0; i < staticTarget; i++) {
    selectedQuestions.push(shuffledStatic[i]);
  }

  // 3. Supplement remaining with fresh procedural questions at target difficulty
  let genAttempts = 0;
  while (selectedQuestions.length < count && genAttempts < 20) {
    genAttempts++;
    const generated = generateProceduralQuestion(category, ageGroup, targetDifficulty);
    if (generated && !selectedQuestions.some(sq => sq.id === generated.id)) {
      selectedQuestions.push(generated);
    }
  }

  // 4. If STILL short, supplement from other age groups in this category
  if (selectedQuestions.length < count) {
    const fallbackPool = ALL_QUESTIONS.filter(q => q.category === category && q.difficulty <= targetDifficulty);
    for (const fb of fallbackPool) {
      if (selectedQuestions.length >= count) break;
      if (!selectedQuestions.some(sq => sq.id === fb.id)) {
        selectedQuestions.push(fb);
      }
    }
  }

  // 5. Intermix and shuffle the final list of questions
  for (let i = selectedQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selectedQuestions[i], selectedQuestions[j]] = [selectedQuestions[j], selectedQuestions[i]];
  }

  const finalQuestions = selectedQuestions.slice(0, count);

  // 6. Prepare each question with option shuffling and ID remapping
  return finalQuestions.map(q => prepareQuestionForPlay(q));
}

/**
 * Get a question by its ID (supports static and dynamically generated questions)
 */
export function getQuestionById(id) {
  if (!id) return null;
  return ALL_QUESTIONS.find(q => q.id === id) || RUNTIME_QUESTIONS_CACHE.get(id) || null;
}

/**
 * Get all available categories that have questions for a given age group
 */
export function getAvailableCategories(ageGroup) {
  const cats = new Set();
  ALL_QUESTIONS.forEach(q => {
    if (q.ageGroup === ageGroup) cats.add(q.category);
  });
  return [...cats];
}

/**
 * Get total static question count
 */
export function getTotalQuestionCount() {
  return ALL_QUESTIONS.length;
}

