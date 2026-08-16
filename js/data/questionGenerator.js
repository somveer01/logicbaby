// ==========================================================================
// Procedural Question Generator — Dynamic SVG Puzzle Engine with Rich Shapes & Animations
// Generates unlimited, non-repeating visual puzzles across all categories,
// age tiers (3-4, 5-6, 7-8, 9+), and difficulty levels (1: Easy, 2: Medium, 3: Hard).
// ==========================================================================

const C = {
  red: '#EF4444', blue: '#3B82F6', green: '#22C55E', yellow: '#EAB308',
  purple: '#A855F7', orange: '#F97316', pink: '#EC4899', cyan: '#06B6D4',
  lime: '#84CC16', rose: '#F43F5E', indigo: '#6366F1', teal: '#14B8A6',
  amber: '#D97706', violet: '#7C3AED', fuchsia: '#C026D3', emerald: '#059669',
  gray: '#94A3B8', darkGray: '#334155', lightGray: '#E2E8F0'
};

const COLOR_NAMES = [
  { name: 'Red', hex: C.red },
  { name: 'Blue', hex: C.blue },
  { name: 'Green', hex: C.green },
  { name: 'Yellow', hex: C.yellow },
  { name: 'Purple', hex: C.purple },
  { name: 'Orange', hex: C.orange },
  { name: 'Pink', hex: C.pink },
  { name: 'Teal', hex: C.teal },
  { name: 'Indigo', hex: C.indigo },
  { name: 'Cyan', hex: C.cyan }
];

// ── SVG Helper Generators with Enhanced Shapes & Micro-Animations ───────────

function circle(cx, cy, r, fill, animClass = '') {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" class="${animClass}"/>`;
}

function rect(x, y, w, h, fill, rx = 6, animClass = '') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${rx}" class="${animClass}"/>`;
}

function tri(cx, cy, size, fill, animClass = '', rotation = 0) {
  const h = size * 0.866;
  const rotAttr = rotation ? `transform="rotate(${rotation} ${cx} ${cy})"` : '';
  return `<polygon points="${cx},${cy - h / 1.5} ${cx - size / 2},${cy + h / 3} ${cx + size / 2},${cy + h / 3}" fill="${fill}" ${rotAttr} class="${animClass}"/>`;
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

function hexagon(cx, cy, r, fill, animClass = '') {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (i * 60 - 30) * Math.PI / 180;
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}" class="${animClass}"/>`;
}

function gear(cx, cy, r, fill, animClass = '') {
  const teeth = 8;
  const pts = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i * Math.PI / teeth);
    const radius = (i % 2 === 0) ? r : r * 0.78;
    pts.push(`${cx + radius * Math.cos(a)},${cy + radius * Math.sin(a)}`);
  }
  return `<g class="${animClass}"><polygon points="${pts.join(' ')}" fill="${fill}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.35}" fill="#FAFAFE"/></g>`;
}

function pieSlice(cx, cy, r, startAngle, endAngle, fill) {
  const x1 = cx + r * Math.cos(Math.PI * startAngle / 180);
  const y1 = cy + r * Math.sin(Math.PI * startAngle / 180);
  const x2 = cx + r * Math.cos(Math.PI * endAngle / 180);
  const y2 = cy + r * Math.sin(Math.PI * endAngle / 180);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${fill}"/>`;
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

// Utility helpers
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateNumberDistractors(correctNum, count = 3, minVal = 0) {
  const distractors = new Set();
  const offsets = [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5, 10, -10];
  shuffle(offsets);

  for (const offset of offsets) {
    const val = correctNum + offset;
    if (val >= minVal && val !== correctNum) {
      distractors.add(val);
      if (distractors.size >= count) break;
    }
  }

  while (distractors.size < count) {
    const fallback = Math.max(minVal, correctNum + randInt(-8, 8));
    if (fallback !== correctNum) distractors.add(fallback);
  }

  return Array.from(distractors);
}

// ==========================================================================
// 1. MATH & NUMBERS (Rich Shapes, Balances, Fractions, Clock Dials)
// ==========================================================================

function generateMathQuestion(ageGroup, difficulty = 1) {
  const id = `gen-math-${ageGroup}-d${difficulty}-${Date.now()}-${randInt(100, 999)}`;

  if (ageGroup === '3-4') {
    // Ages 3-4
    if (difficulty === 1) {
      // Diff 1: Floating Star / Apple Subitizing & Counting (1 to 4)
      const count = randInt(1, 4);
      const emojis = ['⭐', '🍎', '🐱', '🎈', '🍓', '🚗'];
      const emoji = pickOne(emojis);
      const color = pickOne(COLOR_NAMES);

      const items = [];
      const spacing = 65;
      const startX = 40 + (320 - (count * spacing)) / 2;
      for (let i = 0; i < count; i++) {
        items.push(`<g class="anim-float" style="animation-delay: ${i * 0.25}s;"><text x="${startX + i * spacing}" y="85" font-size="48">${emoji}</text></g>`);
      }

      const wrongNums = generateNumberDistractors(count, 3, 1);
      return {
        id, category: 'math', ageGroup, difficulty: 1,
        questionText: `How many ${emoji} do you see?`,
        questionSVG: questionSvg(items.join(' '), 380, 130),
        options: [
          { id: 'a', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${color.hex}">${count}</text>`), label: String(count) },
          { id: 'b', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${color.hex}">${wrongNums[0]}</text>`), label: String(wrongNums[0]) },
          { id: 'c', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${color.hex}">${wrongNums[1]}</text>`), label: String(wrongNums[1]) },
          { id: 'd', svg: optionSvg(`<text x="28" y="58" font-size="48" font-weight="bold" fill="${color.hex}">${wrongNums[2]}</text>`), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Touch and count each ${emoji} one by one!`,
        explanation: `There are ${count} ${emoji} in total! Great counting! 🎉`
      };
    } else {
      // Diff 2 & 3: Picture Addition with cute glowing shapes
      const a = randInt(1, 3);
      const b = randInt(1, 2);
      const sum = a + b;
      const colA = C.purple;
      const colB = C.teal;

      const groupA = [];
      for (let i = 0; i < a; i++) {
        groupA.push(circle(45 + i * 40, 65, 16, colA, 'anim-pulse'));
      }
      const groupB = [];
      for (let i = 0; i < b; i++) {
        groupB.push(circle(210 + i * 40, 65, 16, colB, 'anim-pulse'));
      }

      const wrongNums = generateNumberDistractors(sum, 3, 1);
      return {
        id, category: 'math', ageGroup, difficulty,
        questionText: `Count all the glowing circles together! ${a} + ${b} = ?`,
        questionSVG: questionSvg(`
          ${groupA.join(' ')}
          <text x="${50 + a * 40}" y="76" font-size="36" font-weight="bold" fill="${C.darkGray}">+</text>
          ${groupB.join(' ')}
          <text x="${220 + b * 40}" y="76" font-size="36" font-weight="bold" fill="${C.darkGray}"> = ❓</text>
        `, 400, 130),
        options: [
          { id: 'a', svg: optionSvg(`<text x="26" y="58" font-size="48" font-weight="bold" fill="${C.purple}">${sum}</text>`), label: String(sum) },
          { id: 'b', svg: optionSvg(`<text x="26" y="58" font-size="48" font-weight="bold" fill="${C.purple}">${wrongNums[0]}</text>`), label: String(wrongNums[0]) },
          { id: 'c', svg: optionSvg(`<text x="26" y="58" font-size="48" font-weight="bold" fill="${C.purple}">${wrongNums[1]}</text>`), label: String(wrongNums[1]) },
          { id: 'd', svg: optionSvg(`<text x="26" y="58" font-size="48" font-weight="bold" fill="${C.purple}">${wrongNums[2]}</text>`), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Count ${a} purple circles, then add ${b} teal circles!`,
        explanation: `${a} + ${b} = ${sum} circles altogether! 🌟`
      };
    }

  } else if (ageGroup === '5-6') {
    // Ages 5-6
    if (difficulty === 1) {
      // Diff 1: Friendly sums with animated stars
      const a = randInt(2, 5);
      const b = randInt(1, 4);
      const sum = a + b;
      const wrongNums = generateNumberDistractors(sum, 3, 1);
      const col = pickOne(COLOR_NAMES);

      return {
        id, category: 'math', ageGroup, difficulty: 1,
        questionText: `Solve: ${a} + ${b} = ?`,
        questionSVG: questionSvg(`
          <g class="anim-float">
            <rect x="30" y="30" width="340" height="75" rx="16" fill="${col.hex}18" stroke="${col.hex}" stroke-width="2"/>
            <text x="75" y="82" font-size="46" font-weight="bold" fill="${col.hex}">${a} + ${b} = ❓</text>
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: optionSvg(`<text x="26" y="58" font-size="48" font-weight="bold" fill="${col.hex}">${sum}</text>`), label: String(sum) },
          { id: 'b', svg: optionSvg(`<text x="26" y="58" font-size="48" font-weight="bold" fill="${col.hex}">${wrongNums[0]}</text>`), label: String(wrongNums[0]) },
          { id: 'c', svg: optionSvg(`<text x="26" y="58" font-size="48" font-weight="bold" fill="${col.hex}">${wrongNums[1]}</text>`), label: String(wrongNums[1]) },
          { id: 'd', svg: optionSvg(`<text x="26" y="58" font-size="48" font-weight="bold" fill="${col.hex}">${wrongNums[2]}</text>`), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Start at ${a} and count up by ${b}!`,
        explanation: `${a} + ${b} = ${sum}! Excellent math skills! 🌟`
      };
    } else {
      // Diff 2 & 3: Visual Subtraction / Balance missing box
      const b = randInt(2, 5);
      const sum = randInt(b + 2, 10);
      const diff = sum - b;
      const wrongNums = generateNumberDistractors(diff, 3, 0);

      return {
        id, category: 'math', ageGroup, difficulty,
        questionText: `If you have ${sum} candies 🍬 and share ${b}, how many are left?`,
        questionSVG: questionSvg(`
          <g class="anim-pulse">
            <rect x="40" y="25" width="320" height="85" rx="18" fill="#FCE7F3" stroke="${C.pink}" stroke-width="2"/>
            <text x="65" y="80" font-size="44" font-weight="bold" fill="${C.pink}">${sum} - ${b} = ❓</text>
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: optionSvg(`<text x="26" y="58" font-size="48" font-weight="bold" fill="${C.pink}">${diff}</text>`), label: String(diff) },
          { id: 'b', svg: optionSvg(`<text x="26" y="58" font-size="48" font-weight="bold" fill="${C.pink}">${wrongNums[0]}</text>`), label: String(wrongNums[0]) },
          { id: 'c', svg: optionSvg(`<text x="26" y="58" font-size="48" font-weight="bold" fill="${C.pink}">${wrongNums[1]}</text>`), label: String(wrongNums[1]) },
          { id: 'd', svg: optionSvg(`<text x="26" y="58" font-size="48" font-weight="bold" fill="${C.pink}">${wrongNums[2]}</text>`), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Count backwards ${b} steps from ${sum}!`,
        explanation: `${sum} - ${b} = ${diff}! You got it right! 🍬`
      };
    }

  } else if (ageGroup === '7-8') {
    // Ages 7-8
    if (difficulty === 1) {
      // Multiplication Arrays / Groups
      const a = randInt(2, 6);
      const b = randInt(2, 6);
      const prod = a * b;
      const wrongNums = generateNumberDistractors(prod, 3, 2);

      return {
        id, category: 'math', ageGroup, difficulty: 1,
        questionText: `What is ${a} × ${b}?`,
        questionSVG: questionSvg(`
          <g class="anim-float">
            <rect x="40" y="25" width="320" height="85" rx="16" fill="#EDE9FE" stroke="${C.purple}" stroke-width="2"/>
            <text x="75" y="80" font-size="48" font-weight="bold" fill="${C.purple}">${a} × ${b} = ❓</text>
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: optionSvg(`<text x="18" y="58" font-size="44" font-weight="bold" fill="${C.purple}">${prod}</text>`), label: String(prod) },
          { id: 'b', svg: optionSvg(`<text x="18" y="58" font-size="44" font-weight="bold" fill="${C.purple}">${wrongNums[0]}</text>`), label: String(wrongNums[0]) },
          { id: 'c', svg: optionSvg(`<text x="18" y="58" font-size="44" font-weight="bold" fill="${C.purple}">${wrongNums[1]}</text>`), label: String(wrongNums[1]) },
          { id: 'd', svg: optionSvg(`<text x="18" y="58" font-size="44" font-weight="bold" fill="${C.purple}">${wrongNums[2]}</text>`), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Think: ${b} groups of ${a}!`,
        explanation: `${a} × ${b} = ${prod}! 🚀`
      };
    } else {
      // Balance Scale Algebra: a + ❓ = total
      const a = randInt(14, 38);
      const missing = randInt(12, 35);
      const total = a + missing;
      const wrongNums = generateNumberDistractors(missing, 3, 5);

      return {
        id, category: 'math', ageGroup, difficulty,
        questionText: `Balance the scale: ${a} + ❓ = ${total}`,
        questionSVG: questionSvg(`
          <g class="anim-pulse">
            <!-- Balance scale beam -->
            <rect x="60" y="70" width="280" height="8" rx="4" fill="${C.darkGray}"/>
            <polygon points="200,70 185,110 215,110" fill="${C.gray}"/>
            <rect x="70" y="30" width="100" height="40" rx="8" fill="#DCFCE7" stroke="${C.green}" stroke-width="2"/>
            <text x="80" y="58" font-size="20" font-weight="bold" fill="${C.green}">${a} + ❓</text>
            <rect x="230" y="30" width="100" height="40" rx="8" fill="#DCFCE7" stroke="${C.green}" stroke-width="2"/>
            <text x="255" y="58" font-size="22" font-weight="bold" fill="${C.green}">${total}</text>
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: optionSvg(`<text x="18" y="56" font-size="42" font-weight="bold" fill="${C.green}">${missing}</text>`), label: String(missing) },
          { id: 'b', svg: optionSvg(`<text x="18" y="56" font-size="42" font-weight="bold" fill="${C.green}">${wrongNums[0]}</text>`), label: String(wrongNums[0]) },
          { id: 'c', svg: optionSvg(`<text x="18" y="56" font-size="42" font-weight="bold" fill="${C.green}">${wrongNums[1]}</text>`), label: String(wrongNums[1]) },
          { id: 'd', svg: optionSvg(`<text x="18" y="56" font-size="42" font-weight="bold" fill="${C.green}">${wrongNums[2]}</text>`), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Subtract ${a} from ${total}!`,
        explanation: `${total} - ${a} = ${missing}. So ${a} + ${missing} = ${total}!`
      };
    }

  } else {
    // Ages 9+ (Junior Logic Master)
    if (difficulty === 1) {
      // Fraction Visual Pie Chart
      const totalSlices = pickOne([4, 6, 8]);
      const shadedSlices = randInt(1, totalSlices - 1);
      const sliceAngle = 360 / totalSlices;

      const slices = [];
      for (let i = 0; i < totalSlices; i++) {
        const start = i * sliceAngle;
        const end = (i + 1) * sliceAngle;
        const isShaded = i < shadedSlices;
        slices.push(pieSlice(200, 65, 50, start, end, isShaded ? C.indigo : '#E2E8F0'));
      }

      const fractionLabel = `${shadedSlices}/${totalSlices}`;
      const wrongOpts = [
        `${Math.max(1, shadedSlices - 1)}/${totalSlices}`,
        `${Math.min(totalSlices - 1, shadedSlices + 1)}/${totalSlices}`,
        `${totalSlices - shadedSlices}/${totalSlices}`
      ];

      return {
        id, category: 'math', ageGroup, difficulty: 1,
        questionText: `What fraction of the circle is shaded in indigo?`,
        questionSVG: questionSvg(`
          <g class="anim-float">
            <circle cx="200" cy="65" r="52" fill="none" stroke="${C.darkGray}" stroke-width="2"/>
            ${slices.join(' ')}
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: optionSvg(`<text x="14" y="56" font-size="36" font-weight="bold" fill="${C.indigo}">${fractionLabel}</text>`), label: fractionLabel },
          { id: 'b', svg: optionSvg(`<text x="14" y="56" font-size="36" font-weight="bold" fill="${C.indigo}">${wrongOpts[0]}</text>`), label: wrongOpts[0] },
          { id: 'c', svg: optionSvg(`<text x="14" y="56" font-size="36" font-weight="bold" fill="${C.indigo}">${wrongOpts[1]}</text>`), label: wrongOpts[1] },
          { id: 'd', svg: optionSvg(`<text x="14" y="56" font-size="36" font-weight="bold" fill="${C.indigo}">${wrongOpts[2]}</text>`), label: wrongOpts[2] }
        ],
        correctOptionId: 'a',
        hint: `Count the shaded slices over total slices!`,
        explanation: `${shadedSlices} out of ${totalSlices} slices are shaded: ${fractionLabel}!`
      };
    } else {
      // Symbol Algebra Riddles: 2★ + k = total
      const starVal = randInt(4, 12);
      const k = randInt(3, 10);
      const total = 2 * starVal + k;
      const wrongNums = generateNumberDistractors(starVal, 3, 2);

      return {
        id, category: 'math', ageGroup, difficulty,
        questionText: `Find the secret value of the star: 2★ + ${k} = ${total}`,
        questionSVG: questionSvg(`
          <g class="anim-glow">
            <rect x="40" y="25" width="320" height="85" rx="18" fill="#FEF3C7" stroke="${C.amber}" stroke-width="2"/>
            <text x="60" y="80" font-size="42" font-weight="bold" fill="${C.amber}">2⭐ + ${k} = ${total}</text>
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: optionSvg(`<text x="20" y="56" font-size="44" font-weight="bold" fill="${C.amber}">${starVal}</text>`), label: String(starVal) },
          { id: 'b', svg: optionSvg(`<text x="20" y="56" font-size="44" font-weight="bold" fill="${C.amber}">${wrongNums[0]}</text>`), label: String(wrongNums[0]) },
          { id: 'c', svg: optionSvg(`<text x="20" y="56" font-size="44" font-weight="bold" fill="${C.amber}">${wrongNums[1]}</text>`), label: String(wrongNums[1]) },
          { id: 'd', svg: optionSvg(`<text x="20" y="56" font-size="44" font-weight="bold" fill="${C.amber}">${wrongNums[2]}</text>`), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `First subtract ${k} from ${total}, then divide by 2!`,
        explanation: `${total} - ${k} = ${2 * starVal}, so 1 star ⭐ = ${starVal}!`
      };
    }
  }
}

// ==========================================================================
// 2. PATTERNS & SEQUENCES (Gears, Growing Shapes, Matrix Grids)
// ==========================================================================

function generatePatternsQuestion(ageGroup, difficulty = 1) {
  const id = `gen-pat-${ageGroup}-d${difficulty}-${Date.now()}-${randInt(100, 999)}`;

  const shapes = [
    { name: 'Circle', render: (cx, cy, fill, anim) => circle(cx, cy, 22, fill, anim) },
    { name: 'Square', render: (cx, cy, fill, anim) => rect(cx - 20, cy - 20, 40, 40, fill, 6, anim) },
    { name: 'Triangle', render: (cx, cy, fill, anim) => tri(cx, cy, 44, fill, anim) },
    { name: 'Star', render: (cx, cy, fill, anim) => star(cx, cy, 22, fill, anim) },
    { name: 'Diamond', render: (cx, cy, fill, anim) => diamond(cx, cy, 24, fill, anim) },
    { name: 'Hexagon', render: (cx, cy, fill, anim) => hexagon(cx, cy, 22, fill, anim) }
  ];

  if (ageGroup === '3-4' || (ageGroup === '5-6' && difficulty === 1)) {
    // Repeating shape sequences with gentle floating animations
    const cList = shuffle(COLOR_NAMES);
    const colorA = cList[0];
    const colorB = cList[1];
    const shapeA = pickOne(shapes);
    let shapeB = pickOne(shapes);
    while (shapeB === shapeA) shapeB = pickOne(shapes);

    const patternType = (difficulty === 1) ? 'AB' : 'AAB';
    let seq = [];
    let answerShape, answerColor, answerLabel;

    if (patternType === 'AB') {
      seq = [
        { s: shapeA, c: colorA }, { s: shapeB, c: colorB },
        { s: shapeA, c: colorA }, { s: shapeB, c: colorB },
        { s: shapeA, c: colorA }
      ];
      answerShape = shapeB;
      answerColor = colorB;
      answerLabel = `${colorB.name} ${shapeB.name}`;
    } else {
      seq = [
        { s: shapeA, c: colorA }, { s: shapeA, c: colorA },
        { s: shapeB, c: colorB }, { s: shapeA, c: colorA },
        { s: shapeA, c: colorA }
      ];
      answerShape = shapeB;
      answerColor = colorB;
      answerLabel = `${colorB.name} ${shapeB.name}`;
    }

    const svgItems = [];
    const spacing = 55;
    const startX = 35;
    seq.forEach((item, idx) => {
      svgItems.push(`<g class="anim-float" style="animation-delay: ${idx * 0.2}s;">${item.s.render(startX + idx * spacing, 65, item.c.hex)}</g>`);
    });
    svgItems.push(`<text x="${startX + seq.length * spacing - 5}" y="78" font-size="44" font-weight="bold" fill="${C.gray}">?</text>`);

    const options = [
      { id: 'a', svg: optionSvg(answerShape.render(40, 40, answerColor.hex, 'anim-pulse')), label: answerLabel },
      { id: 'b', svg: optionSvg(shapeA.render(40, 40, colorA.hex)), label: `${colorA.name} ${shapeA.name}` },
      { id: 'c', svg: optionSvg(shapeB.render(40, 40, cList[2].hex)), label: `${cList[2].name} ${shapeB.name}` },
      { id: 'd', svg: optionSvg(shapeA.render(40, 40, cList[3].hex)), label: `${cList[3].name} ${shapeA.name}` }
    ];

    return {
      id, category: 'patterns', ageGroup, difficulty,
      questionText: 'What shape comes next in the rhythm?',
      questionSVG: questionSvg(svgItems.join(' '), 390, 130),
      options,
      correctOptionId: 'a',
      hint: 'Look at the repeating shapes and colors!',
      explanation: `The pattern alternates: next is ${answerLabel}!`
    };

  } else if (ageGroup === '5-6' && difficulty >= 2) {
    // Geometric Rotation Patterns (Pointing UP -> RIGHT -> DOWN -> ?)
    const shape = pickOne(shapes);
    const color = pickOne(COLOR_NAMES);
    const angles = [0, 90, 180];
    const nextAngle = 270;

    const svgItems = [];
    angles.forEach((deg, idx) => {
      svgItems.push(`<g class="anim-pulse" style="animation-delay: ${idx * 0.3}s;">${tri(70 + idx * 90, 65, 45, color.hex, '', deg)}</g>`);
      if (idx < angles.length - 1) {
        svgItems.push(`<text x="${120 + idx * 90}" y="72" font-size="28" fill="${C.gray}">➔</text>`);
      }
    });
    svgItems.push(`<text x="295" y="72" font-size="28" fill="${C.gray}">➔</text>`);
    svgItems.push(`<text x="335" y="78" font-size="44" font-weight="bold" fill="${C.gray}">?</text>`);

    const options = [
      { id: 'a', svg: optionSvg(tri(40, 40, 45, color.hex, '', nextAngle)), label: 'Pointing Left' },
      { id: 'b', svg: optionSvg(tri(40, 40, 45, color.hex, '', 0)), label: 'Pointing Up' },
      { id: 'c', svg: optionSvg(tri(40, 40, 45, color.hex, '', 90)), label: 'Pointing Right' },
      { id: 'd', svg: optionSvg(tri(40, 40, 45, color.hex, '', 180)), label: 'Pointing Down' }
    ];

    return {
      id, category: 'patterns', ageGroup, difficulty,
      questionText: 'The triangle is turning clockwise like a clock! Which way does it point next?',
      questionSVG: questionSvg(svgItems.join(' '), 390, 130),
      options,
      correctOptionId: 'a',
      hint: 'Up ➔ Right ➔ Down ➔ Next is Left!',
      explanation: 'Turning 90 degrees clockwise each step points it Left!'
    };

  } else {
    // 7-8 & 9+: Dynamic Numerical & Multi-Step Logic Sequences
    const color = pickOne(COLOR_NAMES);
    const step = pickOne([3, 4, 6, 7, 8, 12]);
    const start = randInt(2, 20);
    const seq = [start, start + step, start + step * 2, start + step * 3];
    const nextVal = start + step * 4;
    const wrongNums = generateNumberDistractors(nextVal, 3, 0);

    return {
      id, category: 'patterns', ageGroup, difficulty,
      questionText: `What number completes the logic sequence?`,
      questionSVG: questionSvg(`
        <g class="anim-float">
          <rect x="25" y="25" width="350" height="85" rx="16" fill="${color.hex}15" stroke="${color.hex}" stroke-width="2"/>
          <text x="40" y="80" font-size="38" font-weight="bold" fill="${color.hex}">
            ${seq.join(', ')}, <tspan fill="${C.rose}">?</tspan>
          </text>
        </g>
      `, 400, 130),
      options: [
        { id: 'a', svg: optionSvg(`<text x="20" y="56" font-size="42" font-weight="bold" fill="${color.hex}">${nextVal}</text>`), label: String(nextVal) },
        { id: 'b', svg: optionSvg(`<text x="20" y="56" font-size="42" font-weight="bold" fill="${color.hex}">${wrongNums[0]}</text>`), label: String(wrongNums[0]) },
        { id: 'c', svg: optionSvg(`<text x="20" y="56" font-size="42" font-weight="bold" fill="${color.hex}">${wrongNums[1]}</text>`), label: String(wrongNums[1]) },
        { id: 'd', svg: optionSvg(`<text x="20" y="56" font-size="42" font-weight="bold" fill="${color.hex}">${wrongNums[2]}</text>`), label: String(wrongNums[2]) }
      ],
      correctOptionId: 'a',
      hint: `Notice how much is added at each step (+${step})!`,
      explanation: `Add ${step} to ${seq[seq.length - 1]} to get ${nextVal}!`
    };
  }
}

// ==========================================================================
// 3. SPATIAL & SHAPES (Rotations, Symmetry, Shadow Matching)
// ==========================================================================

function generateSpatialQuestion(ageGroup, difficulty = 1) {
  const id = `gen-spa-${ageGroup}-d${difficulty}-${Date.now()}-${randInt(100, 999)}`;
  const col = pickOne(COLOR_NAMES);

  if (ageGroup === '3-4') {
    // Silhouette / Shadow Match
    const targetShape = pickOne([
      { name: 'Star', render: (f) => star(40, 40, 28, f) },
      { name: 'Heart', render: (f) => `<text x="15" y="58" font-size="52" fill="${f}">❤️</text>` },
      { name: 'Butterfly', render: (f) => `<text x="15" y="58" font-size="52">🦋</text>` },
      { name: 'Rocket', render: (f) => `<text x="15" y="58" font-size="52">🚀</text>` }
    ]);

    return {
      id, category: 'spatial', ageGroup, difficulty,
      questionText: `Which shadow belongs to this shape?`,
      questionSVG: questionSvg(`
        <g class="anim-float">
          <circle cx="200" cy="65" r="50" fill="${col.hex}22"/>
          <g transform="translate(160, 25)">${targetShape.render(col.hex)}</g>
        </g>
      `, 400, 130),
      options: [
        { id: 'a', svg: optionSvg(targetShape.render(C.darkGray)), label: 'Matching Shadow' },
        { id: 'b', svg: optionSvg(circle(40, 40, 25, C.darkGray)), label: 'Circle Shadow' },
        { id: 'c', svg: optionSvg(rect(18, 18, 44, 44, C.darkGray, 4)), label: 'Square Shadow' },
        { id: 'd', svg: optionSvg(tri(40, 40, 44, C.darkGray)), label: 'Triangle Shadow' }
      ],
      correctOptionId: 'a',
      hint: 'A shadow matches the exact outline shape!',
      explanation: 'The shadow has the exact same contour!'
    };
  } else {
    // Symmetrical Mirror Reflections & Shape Polygons
    return {
      id, category: 'spatial', ageGroup, difficulty,
      questionText: `Which shape is the perfect mirror reflection across the glowing line?`,
      questionSVG: questionSvg(`
        <g class="anim-pulse">
          <!-- Left side shape -->
          <polygon points="120,35 170,65 120,95" fill="${col.hex}"/>
          <!-- Mirror line -->
          <line x1="200" y1="20" x2="200" y2="110" stroke="${C.purple}" stroke-width="4" stroke-dasharray="6,6"/>
          <!-- Question mark -->
          <text x="240" y="78" font-size="44" font-weight="bold" fill="${C.gray}">?</text>
        </g>
      `, 400, 130),
      options: [
        { id: 'a', svg: optionSvg(`<polygon points="60,20 10,50 60,80" fill="${col.hex}"/>`), label: 'Reflected Right' },
        { id: 'b', svg: optionSvg(`<polygon points="20,20 70,50 20,80" fill="${col.hex}"/>`), label: 'Same Left' },
        { id: 'c', svg: optionSvg(`<polygon points="20,70 50,20 80,70" fill="${col.hex}"/>`), label: 'Pointing Up' },
        { id: 'd', svg: optionSvg(`<polygon points="20,20 50,70 80,20" fill="${col.hex}"/>`), label: 'Pointing Down' }
      ],
      correctOptionId: 'a',
      hint: 'Look into the mirror — points flip to face the other way!',
      explanation: 'Reflecting across the vertical axis flips the horizontal direction!'
    };
  }
}

// ==========================================================================
// 4. ODD ONE OUT GENERATORS
// ==========================================================================

const ODD_THEMES = [
  {
    theme: 'animals-fruit',
    majority: [{ emoji: '🐶', name: 'Dog' }, { emoji: '🐱', name: 'Cat' }, { emoji: '🐰', name: 'Rabbit' }],
    odd: { emoji: '🍎', name: 'Apple', reason: 'Apple is a fruit, all others are living animals! 🐾' }
  },
  {
    theme: 'fruits-vehicle',
    majority: [{ emoji: '🍌', name: 'Banana' }, { emoji: '🍓', name: 'Strawberry' }, { emoji: '🍇', name: 'Grapes' }],
    odd: { emoji: '🚗', name: 'Car', reason: 'Car is a vehicle, all others are delicious fruits! 🍓' }
  },
  {
    theme: 'space-ocean',
    majority: [{ emoji: '🚀', name: 'Rocket' }, { emoji: '🛸', name: 'UFO' }, { emoji: '🛰️', name: 'Satellite' }],
    odd: { emoji: '🐙', name: 'Octopus', reason: 'Octopus lives in the ocean, all others fly in outer space! 🚀' }
  },
  {
    theme: 'shapes-sides',
    majority: [{ emoji: '🟦', name: 'Square' }, { emoji: '🟩', name: 'Rectangle' }, { emoji: '🟨', name: 'Diamond' }],
    odd: { emoji: '🔴', name: 'Circle', reason: 'Circle has 0 straight corners, while all others have 4 corners! ⭕' }
  },
  {
    theme: 'flying-land',
    majority: [{ emoji: '🦅', name: 'Eagle' }, { emoji: '🦜', name: 'Parrot' }, { emoji: '🦉', name: 'Owl' }],
    odd: { emoji: '🦁', name: 'Lion', reason: 'Lion runs on land, while all others fly in the sky! 🦅' }
  }
];

function generateOddOneOutQuestion(ageGroup, difficulty = 1) {
  const id = `gen-odd-${ageGroup}-d${difficulty}-${Date.now()}-${randInt(100, 999)}`;
  const chosenTheme = pickOne(ODD_THEMES);

  const options = [
    { id: 'a', svg: optionSvg(`<text x="15" y="58" font-size="52">${chosenTheme.odd.emoji}</text>`), label: chosenTheme.odd.name },
    { id: 'b', svg: optionSvg(`<text x="15" y="58" font-size="52">${chosenTheme.majority[0].emoji}</text>`), label: chosenTheme.majority[0].name },
    { id: 'c', svg: optionSvg(`<text x="15" y="58" font-size="52">${chosenTheme.majority[1].emoji}</text>`), label: chosenTheme.majority[1].name },
    { id: 'd', svg: optionSvg(`<text x="15" y="58" font-size="52">${chosenTheme.majority[2].emoji}</text>`), label: chosenTheme.majority[2].name }
  ];

  return {
    id, category: 'oddOneOut', ageGroup, difficulty,
    questionText: 'Which one does NOT belong in the group?',
    questionSVG: questionSvg(`
      <g class="anim-float">
        <text x="40" y="80" font-size="46">
          ${chosenTheme.majority[0].emoji}  ${chosenTheme.majority[1].emoji}  ${chosenTheme.odd.emoji}  ${chosenTheme.majority[2].emoji}
        </text>
      </g>
    `, 380, 120),
    options,
    correctOptionId: 'a',
    hint: 'Find the one item that belongs to a different family!',
    explanation: chosenTheme.odd.reason
  };
}

// ==========================================================================
// 5. MEMORY & ATTENTION GENERATORS
// ==========================================================================

function generateMemoryQuestion(ageGroup, difficulty = 1) {
  const id = `gen-mem-${ageGroup}-d${difficulty}-${Date.now()}-${randInt(100, 999)}`;
  const targetColor = pickOne(COLOR_NAMES);
  let otherColor = pickOne(COLOR_NAMES);
  while (otherColor === targetColor) otherColor = pickOne(COLOR_NAMES);

  const targetCount = randInt(2, 4 + difficulty);
  const otherCount = randInt(2, 4);

  const items = [];
  for (let i = 0; i < targetCount; i++) items.push({ isTarget: true, fill: targetColor.hex });
  for (let i = 0; i < otherCount; i++) items.push({ isTarget: false, fill: otherColor.hex });
  shuffle(items);

  const svgShapes = items.map((item, idx) => {
    const x = 35 + (idx % 6) * 55;
    const y = idx >= 6 ? 90 : 45;
    return circle(x, y, 18, item.fill, 'anim-pulse');
  });

  const wrongNums = generateNumberDistractors(targetCount, 3, 1);

  return {
    id, category: 'memory', ageGroup, difficulty,
    questionText: `How many glowing ${targetColor.name} circles can you count?`,
    questionSVG: questionSvg(svgShapes.join(' '), 380, 130),
    options: [
      { id: 'a', svg: optionSvg(`<text x="26" y="58" font-size="50" font-weight="bold" fill="${targetColor.hex}">${targetCount}</text>`), label: String(targetCount) },
      { id: 'b', svg: optionSvg(`<text x="26" y="58" font-size="50" font-weight="bold" fill="${targetColor.hex}">${wrongNums[0]}</text>`), label: String(wrongNums[0]) },
      { id: 'c', svg: optionSvg(`<text x="26" y="58" font-size="50" font-weight="bold" fill="${targetColor.hex}">${wrongNums[1]}</text>`), label: String(wrongNums[1]) },
      { id: 'd', svg: optionSvg(`<text x="26" y="58" font-size="50" font-weight="bold" fill="${targetColor.hex}">${wrongNums[2]}</text>`), label: String(wrongNums[2]) }
    ],
    correctOptionId: 'a',
    hint: `Focus carefully only on the ${targetColor.name} ones!`,
    explanation: `There are exactly ${targetCount} ${targetColor.name} circles! Great visual focus! 🧠`
  };
}

// ==========================================================================
// MASTER PROCEDURAL GENERATOR
// ==========================================================================

export function generateProceduralQuestion(category, ageGroup, difficulty = 1) {
  switch (category) {
    case 'math':
      return generateMathQuestion(ageGroup, difficulty);
    case 'patterns':
      return generatePatternsQuestion(ageGroup, difficulty);
    case 'spatial':
      return generateSpatialQuestion(ageGroup, difficulty);
    case 'oddOneOut':
      return generateOddOneOutQuestion(ageGroup, difficulty);
    case 'memory':
      return generateMemoryQuestion(ageGroup, difficulty);
    case 'sorting':
    default:
      return generateOddOneOutQuestion(ageGroup, difficulty);
  }
}
