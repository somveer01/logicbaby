// ==========================================================================
// Procedural Question Generator — Dynamic SVG Puzzle Engine with Rich Shapes & Animations
// Generates unlimited, non-repeating visual puzzles across all categories,
// age tiers (3-4, 5-6, 7-8, 9+), and difficulty levels (1: Easy, 2: Medium, 3: Hard).
// Every question includes a deterministic semantic `signature` to prevent duplicates.
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

function numberOptionSvg(val, color = C.purple) {
  const str = String(val);
  let fontSize = 42;
  if (str.length >= 5) fontSize = 22;
  else if (str.length === 4) fontSize = 26;
  else if (str.length === 3) fontSize = 32;
  else if (str.length === 2) fontSize = 38;
  else fontSize = 44;

  return optionSvg(`<text x="40" y="49" font-size="${fontSize}" font-weight="bold" fill="${color}" text-anchor="middle" dominant-baseline="central">${str}</text>`);
}

function renderSequenceCardSvg(seq, nextValColor = C.rose, cardColor = C.purple) {
  const seqStr = seq.join(', ');
  let fontSize = 36;
  if (seqStr.length > 25) fontSize = 22;
  else if (seqStr.length > 20) fontSize = 26;
  else if (seqStr.length > 15) fontSize = 30;

  return questionSvg(`
    <g class="anim-float">
      <rect x="20" y="22" width="360" height="88" rx="18" fill="${cardColor}15" stroke="${cardColor}" stroke-width="2.5"/>
      <text x="200" y="70" font-size="${fontSize}" font-weight="bold" fill="${cardColor}" text-anchor="middle" dominant-baseline="central">
        ${seqStr}, <tspan fill="${nextValColor}">?</tspan>
      </text>
    </g>
  `, 400, 130);
}

function questionSvg(content, w = 400, h = 140) {
  return svgWrap(w, h, content);
}

function matrix2x2(cardA, cardB, cardC) {
  return `
    <g class="anim-float">
      <!-- Row 1: Card A -->
      <rect x="70" y="10" width="105" height="52" rx="12" fill="#FFFBEB" stroke="#F59E0B" stroke-width="2.5" filter="drop-shadow(0 4px 6px rgba(245, 158, 11, 0.15))"/>
      <text x="122" y="47" font-size="34" text-anchor="middle">${cardA}</text>
      
      <!-- Arrow 1 -->
      <text x="195" y="45" font-size="24" fill="#9880FF" font-weight="bold" class="anim-pulse">➔</text>
      
      <!-- Row 1: Card B -->
      <rect x="225" y="10" width="105" height="52" rx="12" fill="#FFFBEB" stroke="#F59E0B" stroke-width="2.5" filter="drop-shadow(0 4px 6px rgba(245, 158, 11, 0.15))"/>
      <text x="277" y="47" font-size="34" text-anchor="middle">${cardB}</text>

      <!-- Row 2: Card C -->
      <rect x="70" y="74" width="105" height="52" rx="12" fill="#F0F9FF" stroke="#0284C7" stroke-width="2.5" filter="drop-shadow(0 4px 6px rgba(2, 132, 199, 0.15))"/>
      <text x="122" y="111" font-size="34" text-anchor="middle">${cardC}</text>

      <!-- Arrow 2 -->
      <text x="195" y="109" font-size="24" fill="#9880FF" font-weight="bold" class="anim-pulse">➔</text>

      <!-- Row 2: Target Box D (Dashed Animated Glow) -->
      <rect x="225" y="74" width="105" height="52" rx="12" fill="#ECFEFF" stroke="#06B6D4" stroke-width="3" stroke-dasharray="6,6" class="anim-glow"/>
      <text x="277" y="113" font-size="36" font-weight="bold" fill="#0891B2" text-anchor="middle" class="anim-pulse">?</text>
    </g>
  `;
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
  const offsets = [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5, 10, -10, 6, -6, 7, -7];
  shuffle(offsets);

  for (const offset of offsets) {
    const val = correctNum + offset;
    if (val >= minVal && val !== correctNum) {
      distractors.add(val);
      if (distractors.size >= count) break;
    }
  }

  while (distractors.size < count) {
    const fallback = Math.max(minVal, correctNum + randInt(-12, 12));
    if (fallback !== correctNum) distractors.add(fallback);
  }

  return Array.from(distractors);
}

// ==========================================================================
// 1. MATH & NUMBERS
// ==========================================================================

const EMOJI_THEMES = [
  { emoji: '⭐', name: 'Stars' }, { emoji: '🍎', name: 'Apples' }, { emoji: '🐱', name: 'Kittens' },
  { emoji: '🎈', name: 'Balloons' }, { emoji: '🍓', name: 'Strawberries' }, { emoji: '🚗', name: 'Cars' },
  { emoji: '🐻', name: 'Teddy Bears' }, { emoji: '🍭', name: 'Lollipops' }, { emoji: '🦋', name: 'Butterflies' },
  { emoji: '⚽', name: 'Footballs' }, { emoji: '🚀', name: 'Rockets' }, { emoji: '🌺', name: 'Flowers' },
  { emoji: '🐥', name: 'Chicks' }, { emoji: '🧁', name: 'Cupcakes' }, { emoji: '🍪', name: 'Cookies' },
  { emoji: '💎', name: 'Gems' }, { emoji: '🪙', name: 'Coins' }, { emoji: '🦁', name: 'Lions' },
  { emoji: '🐸', name: 'Frogs' }, { emoji: '🍩', name: 'Donuts' }
];

function generateMathQuestion(ageGroup, difficulty = 1) {
  const theme = pickOne(EMOJI_THEMES);
  const color = pickOne(COLOR_NAMES);
  const uid = Math.random().toString(36).slice(2, 8);

  if (ageGroup === '3-4') {
    const model = (difficulty === 1) ? 'count' : pickOne(['count-more', 'add-visual', 'dice-dots']);

    if (model === 'count') {
      const count = randInt(1, 6);
      const signature = `math:3-4:d1:count:${count}:${theme.emoji}`;
      const id = `gen-math-3-4-d1-count-${count}-${theme.emoji}-${uid}`;

      const items = [];
      const spacing = Math.min(55, Math.floor(300 / count));
      const startX = 40 + (320 - (count * spacing)) / 2;
      for (let i = 0; i < count; i++) {
        items.push(`<g class="anim-float" style="animation-delay: ${i * 0.15}s;"><text x="${startX + i * spacing}" y="85" font-size="44">${theme.emoji}</text></g>`);
      }
      const wrongNums = generateNumberDistractors(count, 3, 1);

      return {
        id, signature, category: 'math', ageGroup, difficulty: 1,
        questionText: `How many ${theme.name} ${theme.emoji} do you see?`,
        questionSVG: questionSvg(items.join(' '), 380, 130),
        options: [
          { id: 'a', svg: numberOptionSvg(count, color.hex), label: String(count) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], color.hex), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], color.hex), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], color.hex), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Touch and count each ${theme.emoji} one by one!`,
        explanation: `There are ${count} ${theme.name}! Great counting! 🎉`
      };
    } else if (model === 'dice-dots') {
      const dots = randInt(2, 6);
      const signature = `math:3-4:d${difficulty}:dice:${dots}`;
      const id = `gen-math-3-4-d${difficulty}-dice-${dots}-${uid}`;
      const wrongNums = generateNumberDistractors(dots, 3, 1);

      return {
        id, signature, category: 'math', ageGroup, difficulty,
        questionText: `How many glowing dots are on this rolling die?`,
        questionSVG: questionSvg(`
          <g class="anim-float">
            <rect x="150" y="20" width="100" height="90" rx="16" fill="#EDE9FE" stroke="${C.purple}" stroke-width="3"/>
            <text x="200" y="72" font-size="48" font-weight="bold" fill="${C.purple}" text-anchor="middle" dominant-baseline="central">${dots}</text>
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: numberOptionSvg(dots, C.purple), label: String(dots) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], C.purple), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], C.purple), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], C.purple), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Count the dots!`,
        explanation: `There are ${dots} dots! Great eye! 🎲`
      };
    } else {
      // Visual addition
      const a = randInt(1, 5);
      const b = randInt(1, 4);
      const sum = a + b;
      const signature = `math:3-4:d${difficulty}:add-vis:${a}+${b}:${sum}:${theme.emoji}`;
      const id = `gen-math-3-4-d${difficulty}-add-${a}-${b}-${theme.emoji}-${uid}`;

      const groupA = [];
      for (let i = 0; i < a; i++) groupA.push(circle(45 + i * 28, 65, 12, color.hex, 'anim-pulse'));
      const groupB = [];
      for (let i = 0; i < b; i++) groupB.push(circle(210 + i * 28, 65, 12, C.teal, 'anim-pulse'));

      const wrongNums = generateNumberDistractors(sum, 3, 1);
      return {
        id, signature, category: 'math', ageGroup, difficulty,
        questionText: `Count all together! ${a} + ${b} = ?`,
        questionSVG: questionSvg(`
          ${groupA.join(' ')}
          <text x="${50 + a * 28}" y="76" font-size="34" font-weight="bold" fill="${C.darkGray}">+</text>
          ${groupB.join(' ')}
          <text x="${220 + b * 28}" y="76" font-size="34" font-weight="bold" fill="${C.darkGray}"> = ❓</text>
        `, 400, 130),
        options: [
          { id: 'a', svg: numberOptionSvg(sum, color.hex), label: String(sum) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], color.hex), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], color.hex), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], color.hex), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Add both groups together!`,
        explanation: `${a} + ${b} = ${sum} circles altogether! 🌟`
      };
    }
  } else if (ageGroup === '5-6') {
    const model = (difficulty === 1) 
      ? pickOne(['add', 'sub', 'shape-corners'])
      : pickOne(['add', 'sub', 'missing-add', 'triple-add', 'shape-corners', 'skip-count']);

    if (model === 'add') {
      const maxA = (difficulty === 1) ? 6 : (difficulty === 2 ? 10 : 14);
      const maxB = (difficulty === 1) ? 5 : (difficulty === 2 ? 8 : 10);
      const a = randInt(1, maxA);
      const b = randInt(1, maxB);
      const sum = a + b;
      const signature = `math:5-6:d${difficulty}:add:${a}+${b}:${sum}`;
      const id = `gen-math-5-6-d${difficulty}-add-${a}-${b}-${uid}`;
      const wrongNums = generateNumberDistractors(sum, 3, 1);

      return {
        id, signature, category: 'math', ageGroup, difficulty,
        questionText: `Solve the addition puzzle: ${a} + ${b} = ?`,
        questionSVG: questionSvg(`
          <g class="anim-float">
            <rect x="15" y="20" width="370" height="90" rx="18" fill="${color.hex}18" stroke="${color.hex}" stroke-width="2.5"/>
            <text x="200" y="68" font-size="44" font-weight="bold" fill="${color.hex}" text-anchor="middle" dominant-baseline="central">${a} + ${b} = ❓</text>
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: numberOptionSvg(sum, color.hex), label: String(sum) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], color.hex), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], color.hex), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], color.hex), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Start at ${a} and count forward ${b} more!`,
        explanation: `${a} + ${b} = ${sum}! Excellent math skills! 🌟`
      };
    } else if (model === 'sub') {
      const maxSub = (difficulty === 1) ? 5 : (difficulty === 2 ? 8 : 10);
      const b = randInt(1, maxSub);
      const sum = randInt(b + 1, (difficulty === 1 ? 10 : (difficulty === 2 ? 16 : 20)));
      const diff = sum - b;
      const signature = `math:5-6:d${difficulty}:sub:${sum}-${b}:${diff}:${theme.name}`;
      const id = `gen-math-5-6-d${difficulty}-sub-${sum}-${b}-${uid}`;
      const wrongNums = generateNumberDistractors(diff, 3, 0);

      return {
        id, signature, category: 'math', ageGroup, difficulty,
        questionText: `You have ${sum} ${theme.name} ${theme.emoji} and give ${b} to friends. How many are left?`,
        questionSVG: questionSvg(`
          <g class="anim-pulse">
            <rect x="15" y="20" width="370" height="90" rx="18" fill="#FCE7F3" stroke="${C.pink}" stroke-width="2.5"/>
            <text x="200" y="68" font-size="44" font-weight="bold" fill="${C.pink}" text-anchor="middle" dominant-baseline="central">${sum} - ${b} = ❓</text>
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: numberOptionSvg(diff, C.pink), label: String(diff) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], C.pink), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], C.pink), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], C.pink), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Count backwards ${b} steps from ${sum}!`,
        explanation: `${sum} - ${b} = ${diff}! You got it right! 🍬`
      };
    } else if (model === 'missing-add') {
      const maxTotal = (difficulty <= 2) ? 10 : 16;
      const total = randInt(4, maxTotal);
      const a = randInt(1, total - 1);
      const missing = total - a;
      const signature = `math:5-6:d${difficulty}:miss:${a}+x=${total}:${missing}`;
      const id = `gen-math-5-6-d${difficulty}-miss-${a}-${missing}-${uid}`;
      const wrongNums = generateNumberDistractors(missing, 3, 1);

      return {
        id, signature, category: 'math', ageGroup, difficulty,
        questionText: `What missing number completes the equation? ${a} + ❓ = ${total}`,
        questionSVG: questionSvg(`
          <g class="anim-float">
            <rect x="15" y="20" width="370" height="90" rx="18" fill="#DCFCE7" stroke="${C.green}" stroke-width="2.5"/>
            <text x="200" y="68" font-size="42" font-weight="bold" fill="${C.green}" text-anchor="middle" dominant-baseline="central">${a} + ❓ = ${total}</text>
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: numberOptionSvg(missing, C.green), label: String(missing) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], C.green), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], C.green), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], C.green), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `How many more to go from ${a} up to ${total}?`,
        explanation: `${a} + ${missing} = ${total}! Awesome algebra intuition! 🌟`
      };
    } else if (model === 'triple-add') {
      const a = randInt(1, 6);
      const b = randInt(1, 6);
      const c = randInt(1, 6);
      const sum = a + b + c;
      const signature = `math:5-6:d${difficulty}:triple:${a}+${b}+${c}:${sum}`;
      const id = `gen-math-5-6-d${difficulty}-triple-${a}-${b}-${c}-${uid}`;
      const wrongNums = generateNumberDistractors(sum, 3, 1);

      return {
        id, signature, category: 'math', ageGroup, difficulty,
        questionText: `Add all three numbers: ${a} + ${b} + ${c} = ?`,
        questionSVG: questionSvg(`
          <g class="anim-float">
            <rect x="15" y="20" width="370" height="90" rx="18" fill="#EDE9FE" stroke="${C.purple}" stroke-width="2.5"/>
            <text x="200" y="68" font-size="40" font-weight="bold" fill="${C.purple}" text-anchor="middle" dominant-baseline="central">${a} + ${b} + ${c} = ❓</text>
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: numberOptionSvg(sum, C.purple), label: String(sum) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], C.purple), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], C.purple), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], C.purple), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `First add ${a} + ${b}, then add ${c}!`,
        explanation: `${a} + ${b} + ${c} = ${sum}! 🚀`
      };
    } else if (model === 'skip-count') {
      const step = pickOne([2, 5, 10]);
      const count = 4;
      const start = step * randInt(1, 4);
      const seq = [];
      for (let i = 0; i < count; i++) seq.push(start + i * step);
      const nextVal = start + count * step;
      const signature = `math:5-6:d${difficulty}:skipcount:${start}+${step}:${nextVal}`;
      const id = `gen-math-5-6-d${difficulty}-skip-${start}-${step}-${uid}`;
      const wrongNums = generateNumberDistractors(nextVal, 3, 1);

      return {
        id, signature, category: 'math', ageGroup, difficulty,
        questionText: `Counting by ${step}s: What comes next?`,
        questionSVG: renderSequenceCardSvg(seq, C.rose, C.blue),
        options: [
          { id: 'a', svg: numberOptionSvg(nextVal, C.blue), label: String(nextVal) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], C.blue), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], C.blue), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], C.blue), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Keep counting up by ${step}!`,
        explanation: `${seq[seq.length - 1]} + ${step} = ${nextVal}! Excellent counting! 🎯`
      };
    } else {
      // Shape corners
      const shapeType = pickOne([
        { name: 'Triangles', corners: 3, emoji: '📐' },
        { name: 'Squares', corners: 4, emoji: '🟦' },
        { name: 'Stars', corners: 5, emoji: '⭐' }
      ]);
      const qty = randInt(2, 4);
      const totalCorners = qty * shapeType.corners;
      const signature = `math:5-6:d${difficulty}:corners:${qty}x${shapeType.name}:${totalCorners}`;
      const id = `gen-math-5-6-d${difficulty}-corners-${qty}-${shapeType.name}-${uid}`;
      const wrongNums = generateNumberDistractors(totalCorners, 3, 2);

      return {
        id, signature, category: 'math', ageGroup, difficulty,
        questionText: `How many total corners do ${qty} ${shapeType.name} have?`,
        questionSVG: questionSvg(`
          <g class="anim-float">
            <text x="200" y="70" font-size="44" text-anchor="middle" dominant-baseline="central">${shapeType.emoji.repeat(qty)}</text>
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: numberOptionSvg(totalCorners, C.indigo), label: String(totalCorners) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], C.indigo), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], C.indigo), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], C.indigo), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Each ${shapeType.name.slice(0, -1)} has ${shapeType.corners} corners. Count them all!`,
        explanation: `${qty} × ${shapeType.corners} = ${totalCorners} total corners! 📐`
      };
    }
  } else if (ageGroup === '7-8') {
    const model = pickOne(['mult', 'div', 'scale-bal', 'double-half', 'mult-wheel', 'fact-triangle']);

    if (model === 'mult') {
      const a = randInt(2, 12);
      const b = randInt(2, 12);
      const prod = a * b;
      const signature = `math:7-8:d${difficulty}:mult:${a}x${b}:${prod}`;
      const id = `gen-math-7-8-d${difficulty}-mult-${a}-${b}-${uid}`;
      const wrongNums = generateNumberDistractors(prod, 3, 2);

      return {
        id, signature, category: 'math', ageGroup, difficulty,
        questionText: `What is ${a} × ${b}?`,
        questionSVG: questionSvg(`
          <g class="anim-float">
            <rect x="15" y="20" width="370" height="90" rx="18" fill="#EDE9FE" stroke="${C.purple}" stroke-width="2.5"/>
            <text x="200" y="68" font-size="44" font-weight="bold" fill="${C.purple}" text-anchor="middle" dominant-baseline="central">${a} × ${b} = ❓</text>
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: numberOptionSvg(prod, C.purple), label: String(prod) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], C.purple), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], C.purple), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], C.purple), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Think: ${b} groups of ${a}!`,
        explanation: `${a} × ${b} = ${prod}! 🚀`
      };
    } else if (model === 'div') {
      const divisor = randInt(2, 9);
      const quotient = randInt(2, 12);
      const dividend = divisor * quotient;
      const signature = `math:7-8:d${difficulty}:div:${dividend}/${divisor}:${quotient}`;
      const id = `gen-math-7-8-d${difficulty}-div-${dividend}-${divisor}-${uid}`;
      const wrongNums = generateNumberDistractors(quotient, 3, 1);

      return {
        id, signature, category: 'math', ageGroup, difficulty,
        questionText: `Share ${dividend} gems equally among ${divisor} treasure chests: ${dividend} ÷ ${divisor} = ?`,
        questionSVG: questionSvg(`
          <g class="anim-float">
            <rect x="15" y="20" width="370" height="90" rx="18" fill="#FEF3C7" stroke="${C.amber}" stroke-width="2.5"/>
            <text x="200" y="68" font-size="44" font-weight="bold" fill="${C.amber}" text-anchor="middle" dominant-baseline="central">${dividend} ÷ ${divisor} = ❓</text>
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: numberOptionSvg(quotient, C.amber), label: String(quotient) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], C.amber), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], C.amber), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], C.amber), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `How many times does ${divisor} fit into ${dividend}?`,
        explanation: `${dividend} ÷ ${divisor} = ${quotient}! 💎`
      };
    } else if (model === 'mult-wheel') {
      // Multiplication Flower / Petal Puzzle
      const factor = pickOne([3, 4, 5, 6, 7, 8, 9]);
      const petalA = randInt(2, 5);
      const targetPetal = randInt(3, 8);
      const prod = targetPetal * factor;
      const signature = `math:7-8:d${difficulty}:wheel:${factor}x${targetPetal}:${prod}`;
      const id = `gen-math-7-8-d${difficulty}-wheel-${factor}-${targetPetal}-${uid}`;
      const wrongNums = generateNumberDistractors(prod, 3, factor);

      return {
        id, signature, category: 'math', ageGroup, difficulty,
        questionText: `Multiply by the center number (×${factor})! What replaces the ❓?`,
        questionSVG: questionSvg(`
          <g class="anim-float">
            <!-- Center Node -->
            <circle cx="200" cy="65" r="32" fill="#EDE9FE" stroke="${C.purple}" stroke-width="3"/>
            <text x="200" y="66" font-size="24" font-weight="bold" fill="${C.purple}" text-anchor="middle" dominant-baseline="central">× ${factor}</text>
            <!-- Left Petal: petalA -->
            <rect x="40" y="40" width="90" height="50" rx="12" fill="#F0FDF4" stroke="${C.green}" stroke-width="2"/>
            <text x="85" y="65" font-size="18" font-weight="bold" fill="${C.green}" text-anchor="middle" dominant-baseline="central">${petalA} ➔ ${petalA * factor}</text>
            <!-- Right Petal: Target -->
            <rect x="270" y="40" width="90" height="50" rx="12" fill="#FFF1F2" stroke="${C.rose}" stroke-width="2"/>
            <text x="315" y="65" font-size="18" font-weight="bold" fill="${C.rose}" text-anchor="middle" dominant-baseline="central">${targetPetal} ➔ ❓</text>
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: numberOptionSvg(prod, C.rose), label: String(prod) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], C.rose), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], C.rose), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], C.rose), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Multiply ${targetPetal} by the center number ${factor}!`,
        explanation: `${targetPetal} × ${factor} = ${prod}! Fantastic multiplication! 🌸`
      };
    } else if (model === 'fact-triangle') {
      // Multiplication fact family triangle
      const a = randInt(3, 9);
      const b = randInt(3, 12);
      const prod = a * b;
      const signature = `math:7-8:d${difficulty}:facttri:${a}x${b}:${prod}`;
      const id = `gen-math-7-8-d${difficulty}-facttri-${a}-${b}-${uid}`;
      const wrongNums = generateNumberDistractors(prod, 3, 4);

      return {
        id, signature, category: 'math', ageGroup, difficulty,
        questionText: `Math Triangle: Top number is the product of the bottom two numbers. Find ❓!`,
        questionSVG: questionSvg(`
          <g class="anim-float">
            <!-- Triangle Outline -->
            <polygon points="200,18 100,105 300,105" fill="#FEF3C7" stroke="${C.amber}" stroke-width="3" stroke-linejoin="round"/>
            <!-- Top Product Circle -->
            <circle cx="200" cy="35" r="22" fill="white" stroke="${C.amber}" stroke-width="2.5"/>
            <text x="200" y="36" font-size="22" font-weight="bold" fill="${C.rose}" text-anchor="middle" dominant-baseline="central">❓</text>
            <!-- Bottom Left Circle -->
            <circle cx="125" cy="95" r="20" fill="white" stroke="${C.amber}" stroke-width="2.5"/>
            <text x="125" y="96" font-size="18" font-weight="bold" fill="${C.amber}" text-anchor="middle" dominant-baseline="central">${a}</text>
            <!-- Bottom Right Circle -->
            <circle cx="275" cy="95" r="20" fill="white" stroke="${C.amber}" stroke-width="2.5"/>
            <text x="275" y="96" font-size="18" font-weight="bold" fill="${C.amber}" text-anchor="middle" dominant-baseline="central">${b}</text>
            <!-- Center Multiply Sign -->
            <text x="200" y="78" font-size="26" font-weight="bold" fill="${C.darkGray}" text-anchor="middle">×</text>
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: numberOptionSvg(prod, C.amber), label: String(prod) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], C.amber), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], C.amber), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], C.amber), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Multiply the two bottom numbers (${a} × ${b})!`,
        explanation: `${a} × ${b} = ${prod}! The top of the fact triangle is ${prod}! 📐`
      };
    } else if (model === 'double-half') {
      const isDouble = Math.random() > 0.5;
      const base = pickOne([15, 20, 25, 30, 35, 40, 45, 50, 75, 100, 125, 150]);
      const answer = isDouble ? base * 2 : base;
      const questionNum = isDouble ? base : base * 2;
      const promptText = isDouble ? `What is DOUBLE of ${questionNum}?` : `What is HALF of ${questionNum}?`;
      const signature = `math:7-8:d${difficulty}:${isDouble ? 'double' : 'half'}:${questionNum}:${answer}`;
      const id = `gen-math-7-8-d${difficulty}-dh-${isDouble ? 'dbl' : 'hlf'}-${questionNum}-${uid}`;
      const wrongNums = generateNumberDistractors(answer, 3, 2);

      return {
        id, signature, category: 'math', ageGroup, difficulty,
        questionText: promptText,
        questionSVG: questionSvg(`
          <g class="anim-pulse">
            <rect x="15" y="20" width="370" height="90" rx="18" fill="${isDouble ? '#F0F9FF' : '#FEF3C7'}" stroke="${isDouble ? C.blue : C.amber}" stroke-width="2.5"/>
            <text x="200" y="68" font-size="44" font-weight="bold" fill="${isDouble ? C.blue : C.amber}" text-anchor="middle" dominant-baseline="central">
              ${isDouble ? `${questionNum} × 2 = ❓` : `${questionNum} ÷ 2 = ❓`}
            </text>
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: numberOptionSvg(answer, C.blue), label: String(answer) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], C.blue), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], C.blue), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], C.blue), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: isDouble ? `Add ${questionNum} to itself!` : `Divide ${questionNum} by 2!`,
        explanation: isDouble ? `Double of ${questionNum} is ${answer}! ⚡` : `Half of ${questionNum} is ${answer}! ✂️`
      };
    } else {
      const a = randInt(14, 85);
      const missing = randInt(12, 75);
      const total = a + missing;
      const signature = `math:7-8:d${difficulty}:scale:${a}+x=${total}:${missing}`;
      const id = `gen-math-7-8-d${difficulty}-scale-${a}-${missing}-${uid}`;
      const wrongNums = generateNumberDistractors(missing, 3, 5);

      return {
        id, signature, category: 'math', ageGroup, difficulty,
        questionText: `Balance the scale: ${a} + ❓ = ${total}`,
        questionSVG: questionSvg(`
          <g class="anim-pulse">
            <rect x="60" y="70" width="280" height="8" rx="4" fill="${C.darkGray}"/>
            <polygon points="200,70 185,110 215,110" fill="${C.gray}"/>
            <rect x="70" y="30" width="100" height="40" rx="8" fill="#DCFCE7" stroke="${C.green}" stroke-width="2"/>
            <text x="120" y="52" font-size="20" font-weight="bold" fill="${C.green}" text-anchor="middle" dominant-baseline="central">${a} + ❓</text>
            <rect x="230" y="30" width="100" height="40" rx="8" fill="#DCFCE7" stroke="${C.green}" stroke-width="2"/>
            <text x="280" y="52" font-size="22" font-weight="bold" fill="${C.green}" text-anchor="middle" dominant-baseline="central">${total}</text>
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: numberOptionSvg(missing, C.green), label: String(missing) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], C.green), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], C.green), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], C.green), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Subtract ${a} from ${total}!`,
        explanation: `${total} - ${a} = ${missing}. So ${a} + ${missing} = ${total}!`
      };
    }
  } else {
    // 9+
    const model = pickOne(['frac', 'alg', 'mult-3digit', 'div-3digit', 'double-half']);

    if (model === 'mult-3digit') {
      const a = pickOne([12, 13, 14, 15, 16, 18, 20, 25, 30, 50]);
      const b = randInt(11, 20);
      const prod = a * b;
      const signature = `math:9+:d${difficulty}:mult3d:${a}x${b}:${prod}`;
      const id = `gen-math-9-d${difficulty}-mult3d-${a}-${b}-${uid}`;
      const wrongNums = generateNumberDistractors(prod, 3, 50);

      return {
        id, signature, category: 'math', ageGroup, difficulty,
        questionText: `Solve the multi-digit multiplication: ${a} × ${b} = ?`,
        questionSVG: questionSvg(`
          <g class="anim-glow">
            <rect x="15" y="20" width="370" height="90" rx="18" fill="#EDE9FE" stroke="${C.purple}" stroke-width="2.5"/>
            <text x="200" y="68" font-size="42" font-weight="bold" fill="${C.purple}" text-anchor="middle" dominant-baseline="central">${a} × ${b} = ❓</text>
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: numberOptionSvg(prod, C.purple), label: String(prod) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], C.purple), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], C.purple), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], C.purple), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Break it down: ${a} × ${Math.floor(b / 10) * 10} + ${a} × ${b % 10}!`,
        explanation: `${a} × ${b} = ${prod}! Masterful mental calculation! 🧠`
      };
    } else if (model === 'div-3digit') {
      const quotient = randInt(15, 45);
      const divisor = pickOne([4, 5, 6, 8, 10, 12, 15, 20]);
      const dividend = quotient * divisor;
      const signature = `math:9+:d${difficulty}:div3d:${dividend}/${divisor}:${quotient}`;
      const id = `gen-math-9-d${difficulty}-div3d-${dividend}-${divisor}-${uid}`;
      const wrongNums = generateNumberDistractors(quotient, 3, 5);

      return {
        id, signature, category: 'math', ageGroup, difficulty,
        questionText: `Divide: ${dividend} ÷ ${divisor} = ?`,
        questionSVG: questionSvg(`
          <g class="anim-float">
            <rect x="15" y="20" width="370" height="90" rx="18" fill="#FEF3C7" stroke="${C.amber}" stroke-width="2.5"/>
            <text x="200" y="68" font-size="42" font-weight="bold" fill="${C.amber}" text-anchor="middle" dominant-baseline="central">${dividend} ÷ ${divisor} = ❓</text>
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: numberOptionSvg(quotient, C.amber), label: String(quotient) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], C.amber), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], C.amber), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], C.amber), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Think: how many times does ${divisor} go into ${dividend}?`,
        explanation: `${dividend} ÷ ${divisor} = ${quotient}! (Since ${quotient} × ${divisor} = ${dividend})! 🎯`
      };
    } else if (model === 'frac') {
      const totalSlices = pickOne([3, 4, 5, 6, 8, 10, 12]);
      const shadedSlices = randInt(1, totalSlices - 1);
      const sliceAngle = 360 / totalSlices;
      const signature = `math:9+:d${difficulty}:frac:${shadedSlices}/${totalSlices}`;
      const id = `gen-math-9-d${difficulty}-frac-${shadedSlices}-${totalSlices}-${uid}`;

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
        id, signature, category: 'math', ageGroup, difficulty,
        questionText: `What fraction of the circle is shaded in indigo?`,
        questionSVG: questionSvg(`
          <g class="anim-float">
            <circle cx="200" cy="65" r="52" fill="none" stroke="${C.darkGray}" stroke-width="2"/>
            ${slices.join(' ')}
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: numberOptionSvg(fractionLabel, C.indigo), label: fractionLabel },
          { id: 'b', svg: numberOptionSvg(wrongOpts[0], C.indigo), label: wrongOpts[0] },
          { id: 'c', svg: numberOptionSvg(wrongOpts[1], C.indigo), label: wrongOpts[1] },
          { id: 'd', svg: numberOptionSvg(wrongOpts[2], C.indigo), label: wrongOpts[2] }
        ],
        correctOptionId: 'a',
        hint: `Count the shaded slices over total slices!`,
        explanation: `${shadedSlices} out of ${totalSlices} slices are shaded: ${fractionLabel}!`
      };
    } else if (model === 'double-half') {
      const base = pickOne([125, 150, 175, 225, 250, 350, 450]);
      const isDouble = Math.random() > 0.5;
      const answer = isDouble ? base * 2 : base;
      const questionNum = isDouble ? base : base * 2;
      const promptText = isDouble ? `What is DOUBLE of ${questionNum}?` : `What is HALF of ${questionNum}?`;
      const signature = `math:9+:d${difficulty}:${isDouble ? 'double' : 'half'}:${questionNum}:${answer}`;
      const id = `gen-math-9-d${difficulty}-dh-${questionNum}-${uid}`;
      const wrongNums = generateNumberDistractors(answer, 3, 10);

      return {
        id, signature, category: 'math', ageGroup, difficulty,
        questionText: promptText,
        questionSVG: questionSvg(`
          <g class="anim-pulse">
            <rect x="15" y="20" width="370" height="90" rx="18" fill="${isDouble ? '#F0FDF4' : '#FEF3C7'}" stroke="${isDouble ? C.green : C.amber}" stroke-width="2.5"/>
            <text x="200" y="68" font-size="44" font-weight="bold" fill="${isDouble ? C.green : C.amber}" text-anchor="middle" dominant-baseline="central">
              ${isDouble ? `${questionNum} × 2 = ❓` : `${questionNum} ÷ 2 = ❓`}
            </text>
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: numberOptionSvg(answer, C.green), label: String(answer) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], C.green), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], C.green), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], C.green), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: isDouble ? `Multiply ${questionNum} by 2!` : `Divide ${questionNum} by 2!`,
        explanation: isDouble ? `Double of ${questionNum} is ${answer}! ⚡` : `Half of ${questionNum} is ${answer}! ✂️`
      };
    } else {
      const starVal = randInt(3, 25);
      const k = randInt(2, 20);
      const coeff = pickOne([2, 3, 4, 5]);
      const total = coeff * starVal + k;
      const signature = `math:9+:d${difficulty}:alg:${coeff}s+${k}=${total}:${starVal}`;
      const id = `gen-math-9-d${difficulty}-alg-${coeff}-${starVal}-${k}-${uid}`;
      const wrongNums = generateNumberDistractors(starVal, 3, 1);

      return {
        id, signature, category: 'math', ageGroup, difficulty,
        questionText: `Find the secret value of the star: ${coeff}★ + ${k} = ${total}`,
        questionSVG: questionSvg(`
          <g class="anim-glow">
            <rect x="15" y="20" width="370" height="90" rx="18" fill="#FEF3C7" stroke="${C.amber}" stroke-width="2.5"/>
            <text x="200" y="68" font-size="38" font-weight="bold" fill="${C.amber}" text-anchor="middle" dominant-baseline="central">${coeff}⭐ + ${k} = ${total}</text>
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: numberOptionSvg(starVal, C.amber), label: String(starVal) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], C.amber), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], C.amber), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], C.amber), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `First subtract ${k} from ${total}, then divide by ${coeff}!`,
        explanation: `${total} - ${k} = ${coeff * starVal}, so 1 star ⭐ = ${starVal}!`
      };
    }
  }
}

// ==========================================================================
// 2. ANALOGY & 2x2 TRANSFORMATION MATRIX PUZZLES (LogicLike Style)
// ==========================================================================

const ANALOGY_TRANSFORMATIONS = [
  {
    category: 'nature',
    theme: 'egg-banana',
    cardA: '🥚', cardB: '🍳',
    cardC: '🍌', cardD: '🍌',
    labelD: 'Peeled Banana',
    prompt: 'Look at how the egg opens. What happens to the banana?',
    explanation: 'Egg opens into shells; banana is peeled open to eat! 🍌',
    distractors: [{ emoji: '🍬', name: 'Candy' }, { emoji: '🍏', name: 'Apple Core' }, { emoji: '🍉', name: 'Watermelon' }]
  },
  {
    category: 'fruits',
    theme: 'apple-watermelon',
    cardA: '🍎', cardB: '🍏',
    cardC: '🍉', cardD: '🍉',
    labelD: 'Watermelon Slice',
    prompt: 'Whole apple turns into a core. What does a whole watermelon turn into?',
    explanation: 'An apple leaves a core; watermelon is sliced into juicy slices! 🍉',
    distractors: [{ emoji: '🧁', name: 'Cupcake' }, { emoji: '🥕', name: 'Carrot' }, { emoji: '🍞', name: 'Bread' }]
  },
  {
    category: 'metamorphosis',
    theme: 'caterpillar-tadpole',
    cardA: '🐛', cardB: '🦋',
    cardC: '🐟', cardD: '🐸',
    labelD: 'Green Frog',
    prompt: 'A caterpillar transforms into a butterfly. What does a tadpole transform into?',
    explanation: 'Caterpillar becomes a butterfly; a tadpole grows into a green frog! 🐸',
    distractors: [{ emoji: '🦅', name: 'Eagle' }, { emoji: '🦁', name: 'Lion' }, { emoji: '🐝', name: 'Bee' }]
  },
  {
    category: 'botany',
    theme: 'seed-sunflower',
    cardA: '🌱', cardB: '🌳',
    cardC: '🌰', cardD: '🌻',
    labelD: 'Sunflower',
    prompt: 'A little seed grows into a mighty tree. What does a sunflower seed grow into?',
    explanation: 'Sunflower seeds grow into tall yellow blooming sunflowers! 🌻',
    distractors: [{ emoji: '🍄', name: 'Mushroom' }, { emoji: '🌵', name: 'Cactus' }, { emoji: '🪨', name: 'Stone' }]
  },
  {
    category: 'crafts',
    theme: 'yarn-wood',
    cardA: '🧶', cardB: '🧣',
    cardC: '🪵', cardD: '🪑',
    labelD: 'Wooden Chair',
    prompt: 'Yarn is knitted into a warm scarf. What are wooden planks built into?',
    explanation: 'Yarn makes woven clothes; wood planks make wooden furniture! 🪑',
    distractors: [{ emoji: '📱', name: 'Smartphone' }, { emoji: '🚲', name: 'Bicycle' }, { emoji: '💎', name: 'Diamond' }]
  },
  {
    category: 'food-prep',
    theme: 'wheat-cocoa',
    cardA: '🌾', cardB: '🍞',
    cardC: '🫘', cardD: '🍫',
    labelD: 'Chocolate Bar',
    prompt: 'Wheat grains are baked into fresh bread. What are cocoa beans made into?',
    explanation: 'Wheat makes flour for bread; cocoa beans make delicious chocolate! 🍫',
    distractors: [{ emoji: '🍕', name: 'Pizza' }, { emoji: '🧀', name: 'Cheese' }, { emoji: '🍗', name: 'Drumstick' }]
  },
  {
    category: 'physics-state',
    theme: 'ice-candle',
    cardA: '🧊', cardB: '💧',
    cardC: '🕯️', cardD: '🪔',
    labelD: 'Melted Wax',
    prompt: 'Ice melts into water. What does a burning candle melt into?',
    explanation: 'Heating solid ice creates water; heating solid wax creates melted wax! 🕯️',
    distractors: [{ emoji: '🪨', name: 'Hard Rock' }, { emoji: '⚡', name: 'Lightning' }, { emoji: '❄️', name: 'Snow' }]
  },
  {
    category: 'opposites',
    theme: 'sun-summer',
    cardA: '☀️', cardB: '🌙',
    cardC: '🌳', cardD: '❄️',
    labelD: 'Winter Snowy Tree',
    prompt: 'Daytime sun changes to nighttime moon. Summer green tree changes to...?',
    explanation: 'Day turns to night; summer greenery turns to winter snow! ❄️',
    distractors: [{ emoji: '🔥', name: 'Fire' }, { emoji: '🌊', name: 'Wave' }, { emoji: '🌋', name: 'Volcano' }]
  },
  {
    category: 'discovery',
    theme: 'gift-envelope',
    cardA: '🎁', cardB: '🤖',
    cardC: '✉️', cardD: '📄',
    labelD: 'Open Letter',
    prompt: 'Opening a gift box reveals a toy. What does opening an envelope reveal?',
    explanation: 'Gifts open into toys; envelopes open into reading letters! 📄',
    distractors: [{ emoji: '🔑', name: 'Key' }, { emoji: '🎈', name: 'Balloon' }, { emoji: '📦', name: 'Box' }]
  },
  {
    category: 'baby-animals',
    theme: 'chick-calf',
    cardA: '🐣', cardB: '🐓',
    cardC: '🐮', cardD: '🐄',
    labelD: 'Big Cow',
    prompt: 'A baby chick grows into a rooster. What does a baby calf grow into?',
    explanation: 'Chicks grow into adult roosters; calves grow into full-grown cows! 🐄',
    distractors: [{ emoji: '🐴', name: 'Horse' }, { emoji: '🐑', name: 'Sheep' }, { emoji: '🐖', name: 'Pig' }]
  },
  {
    category: 'fruits-prep',
    theme: 'orange-lemon',
    cardA: '🍊', cardB: '🧃',
    cardC: '🍋', cardD: '🥤',
    labelD: 'Fresh Lemonade',
    prompt: 'Oranges are squeezed into orange juice. What are lemons squeezed into?',
    explanation: 'Oranges make orange juice; lemons make refreshing lemonade! 🥤',
    distractors: [{ emoji: '☕', name: 'Hot Coffee' }, { emoji: '🥛', name: 'Milk' }, { emoji: '🍵', name: 'Tea' }]
  },
  {
    category: 'actions',
    theme: 'dirty-clean',
    cardA: '🐾', cardB: '✨',
    cardC: '🚗', cardD: '🧼',
    labelD: 'Clean Shiny Car',
    prompt: 'Dirty paws are washed clean. What happens after washing a dusty car?',
    explanation: 'Washing things makes them sparkling clean and shiny! ✨',
    distractors: [{ emoji: '🛞', name: 'Flat Tire' }, { emoji: '⛽', name: 'Gas Pump' }, { emoji: '🚦', name: 'Traffic Light' }]
  }
];

function generateAnalogyTransformationQuestion(ageGroup, difficulty = 1) {
  const uid = Math.random().toString(36).slice(2, 8);
  const pair = pickOne(ANALOGY_TRANSFORMATIONS);
  const shuffledDistractors = shuffle(pair.distractors).slice(0, 3);
  const signature = `pat:${ageGroup}:d${difficulty}:matrix2x2:${pair.theme}:${pair.labelD}`;
  const id = `gen-mat-${ageGroup}-d${difficulty}-${pair.theme}-${uid}`;

  const options = [
    { id: 'a', svg: optionSvg(`<text x="15" y="58" font-size="52">${pair.cardD}</text>`), label: pair.labelD },
    { id: 'b', svg: optionSvg(`<text x="15" y="58" font-size="52">${shuffledDistractors[0].emoji}</text>`), label: shuffledDistractors[0].name },
    { id: 'c', svg: optionSvg(`<text x="15" y="58" font-size="52">${shuffledDistractors[1].emoji}</text>`), label: shuffledDistractors[1].name },
    { id: 'd', svg: optionSvg(`<text x="15" y="58" font-size="52">${shuffledDistractors[2].emoji}</text>`), label: shuffledDistractors[2].name }
  ];

  return {
    id, signature, category: 'patterns', ageGroup, difficulty,
    questionText: pair.prompt,
    questionSVG: questionSvg(matrix2x2(pair.cardA, pair.cardB, pair.cardC)),
    options,
    correctOptionId: 'a',
    hint: 'Look closely at the relationship in the top row and apply it to the bottom row!',
    explanation: pair.explanation
  };
}

// ==========================================================================
// 3. PATTERNS & SEQUENCES
// ==========================================================================

function generatePatternsQuestion(ageGroup, difficulty = 1) {
  const uid = Math.random().toString(36).slice(2, 8);

  // 35% of the time, serve a 2x2 Transformation Matrix & Analogy puzzle!
  if (Math.random() < 0.35) {
    return generateAnalogyTransformationQuestion(ageGroup, difficulty);
  }

  const shapes = [
    { name: 'Circle', render: (cx, cy, fill, anim) => circle(cx, cy, 22, fill, anim) },
    { name: 'Square', render: (cx, cy, fill, anim) => rect(cx - 20, cy - 20, 40, 40, fill, 6, anim) },
    { name: 'Triangle', render: (cx, cy, fill, anim) => tri(cx, cy, 44, fill, anim) },
    { name: 'Star', render: (cx, cy, fill, anim) => star(cx, cy, 22, fill, anim) },
    { name: 'Diamond', render: (cx, cy, fill, anim) => diamond(cx, cy, 24, fill, anim) },
    { name: 'Hexagon', render: (cx, cy, fill, anim) => hexagon(cx, cy, 22, fill, anim) }
  ];

  if (ageGroup === '3-4') {
    const cList = shuffle(COLOR_NAMES);
    const colorA = cList[0];
    const colorB = cList[1];
    const shapeA = pickOne(shapes);
    let shapeB = pickOne(shapes);
    while (shapeB === shapeA) shapeB = pickOne(shapes);

    // Toddlers (3-4): single variable variation (only color changes OR only shape changes)
    const isColorPattern = Math.random() > 0.5;
    const pType = pickOne(['AB', 'AAB']);

    let seq = [];
    let answerShape, answerColor, answerLabel;

    if (isColorPattern) {
      // Shape stays constant, color alternates
      if (pType === 'AB') {
        seq = [{ s: shapeA, c: colorA }, { s: shapeA, c: colorB }, { s: shapeA, c: colorA }, { s: shapeA, c: colorB }, { s: shapeA, c: colorA }];
        answerShape = shapeA;
        answerColor = colorB;
        answerLabel = `${colorB.name} ${shapeA.name}`;
      } else {
        seq = [{ s: shapeA, c: colorA }, { s: shapeA, c: colorA }, { s: shapeA, c: colorB }, { s: shapeA, c: colorA }, { s: shapeA, c: colorA }];
        answerShape = shapeA;
        answerColor = colorB;
        answerLabel = `${colorB.name} ${shapeA.name}`;
      }
    } else {
      // Color stays constant, shape alternates
      if (pType === 'AB') {
        seq = [{ s: shapeA, c: colorA }, { s: shapeB, c: colorA }, { s: shapeA, c: colorA }, { s: shapeB, c: colorA }, { s: shapeA, c: colorA }];
        answerShape = shapeB;
        answerColor = colorA;
        answerLabel = `${colorA.name} ${shapeB.name}`;
      } else {
        seq = [{ s: shapeA, c: colorA }, { s: shapeA, c: colorA }, { s: shapeB, c: colorA }, { s: shapeA, c: colorA }, { s: shapeA, c: colorA }];
        answerShape = shapeB;
        answerColor = colorA;
        answerLabel = `${colorA.name} ${shapeB.name}`;
      }
    }

    const signature = `pat:3-4:d${difficulty}:${isColorPattern ? 'color' : 'shape'}:${pType}:${shapeA.name}-${colorA.name}:${shapeB.name}-${colorB.name}`;
    const id = `gen-pat-3-4-d${difficulty}-${pType}-${shapeA.name}-${shapeB.name}-${uid}`;

    const svgItems = [];
    const spacing = 54;
    const startX = 35;
    seq.forEach((item, idx) => {
      svgItems.push(`<g class="anim-float" style="animation-delay: ${idx * 0.2}s;">${item.s.render(startX + idx * spacing, 65, item.c.hex)}</g>`);
    });
    svgItems.push(`<text x="${startX + seq.length * spacing - 5}" y="78" font-size="44" font-weight="bold" fill="${C.gray}">?</text>`);

    const options = [
      { id: 'a', svg: optionSvg(answerShape.render(40, 40, answerColor.hex, 'anim-pulse')), label: answerLabel },
      { id: 'b', svg: optionSvg(shapeA.render(40, 40, isColorPattern ? colorA.hex : colorB.hex)), label: isColorPattern ? `${colorA.name} ${shapeA.name}` : `${colorB.name} ${shapeA.name}` },
      { id: 'c', svg: optionSvg(shapeB.render(40, 40, cList[2].hex)), label: `${cList[2].name} ${shapeB.name}` },
      { id: 'd', svg: optionSvg(shapeA.render(40, 40, cList[3].hex)), label: `${cList[3].name} ${shapeA.name}` }
    ];

    return {
      id, signature, category: 'patterns', ageGroup, difficulty,
      questionText: 'What comes next in the pattern?',
      questionSVG: questionSvg(svgItems.join(' '), 390, 130),
      options,
      correctOptionId: 'a',
      hint: 'Say the colors or shapes out loud to hear the rhythm!',
      explanation: `The pattern repeats! Next is ${answerLabel}! 🎉`
    };
  } else if (ageGroup === '5-6' && difficulty === 1) {
    const cList = shuffle(COLOR_NAMES);
    const colorA = cList[0];
    const colorB = cList[1];
    const colorC = cList[2];
    const shapeA = pickOne(shapes);
    let shapeB = pickOne(shapes);
    while (shapeB === shapeA) shapeB = pickOne(shapes);
    let shapeC = pickOne(shapes);
    while (shapeC === shapeA || shapeC === shapeB) shapeC = pickOne(shapes);

    const patternTypes = ['AB', 'AAB', 'ABB', 'ABC', 'AABB'];
    const pType = pickOne(patternTypes);

    let seq = [];
    let answerShape, answerColor, answerLabel;

    if (pType === 'AB') {
      seq = [{ s: shapeA, c: colorA }, { s: shapeB, c: colorB }, { s: shapeA, c: colorA }, { s: shapeB, c: colorB }, { s: shapeA, c: colorA }];
      answerShape = shapeB;
      answerColor = colorB;
      answerLabel = `${colorB.name} ${shapeB.name}`;
    } else if (pType === 'AAB') {
      seq = [{ s: shapeA, c: colorA }, { s: shapeA, c: colorA }, { s: shapeB, c: colorB }, { s: shapeA, c: colorA }, { s: shapeA, c: colorA }];
      answerShape = shapeB;
      answerColor = colorB;
      answerLabel = `${colorB.name} ${shapeB.name}`;
    } else if (pType === 'ABB') {
      seq = [{ s: shapeA, c: colorA }, { s: shapeB, c: colorB }, { s: shapeB, c: colorB }, { s: shapeA, c: colorA }, { s: shapeB, c: colorB }];
      answerShape = shapeB;
      answerColor = colorB;
      answerLabel = `${colorB.name} ${shapeB.name}`;
    } else if (pType === 'AABB') {
      seq = [{ s: shapeA, c: colorA }, { s: shapeA, c: colorA }, { s: shapeB, c: colorB }, { s: shapeB, c: colorB }, { s: shapeA, c: colorA }];
      answerShape = shapeA;
      answerColor = colorA;
      answerLabel = `${colorA.name} ${shapeA.name}`;
    } else {
      seq = [{ s: shapeA, c: colorA }, { s: shapeB, c: colorB }, { s: shapeC, c: colorC }, { s: shapeA, c: colorA }, { s: shapeB, c: colorB }];
      answerShape = shapeC;
      answerColor = colorC;
      answerLabel = `${colorC.name} ${shapeC.name}`;
    }

    const signature = `pat:5-6:d1:${pType}:${shapeA.name}-${colorA.name}:${shapeB.name}-${colorB.name}`;
    const id = `gen-pat-5-6-d1-${pType}-${shapeA.name}-${shapeB.name}-${uid}`;

    const svgItems = [];
    const spacing = 52;
    const startX = 35;
    seq.forEach((item, idx) => {
      svgItems.push(`<g class="anim-float" style="animation-delay: ${idx * 0.2}s;">${item.s.render(startX + idx * spacing, 65, item.c.hex)}</g>`);
    });
    svgItems.push(`<text x="${startX + seq.length * spacing - 5}" y="78" font-size="44" font-weight="bold" fill="${C.gray}">?</text>`);

    const options = [
      { id: 'a', svg: optionSvg(answerShape.render(40, 40, answerColor.hex, 'anim-pulse')), label: answerLabel },
      { id: 'b', svg: optionSvg(shapeA.render(40, 40, colorA.hex)), label: `${colorA.name} ${shapeA.name}` },
      { id: 'c', svg: optionSvg(shapeB.render(40, 40, cList[3].hex)), label: `${cList[3].name} ${shapeB.name}` },
      { id: 'd', svg: optionSvg(shapeA.render(40, 40, cList[4].hex)), label: `${cList[4].name} ${shapeA.name}` }
    ];

    return {
      id, signature, category: 'patterns', ageGroup: '5-6', difficulty: 1,
      questionText: 'What shape comes next in the rhythm?',
      questionSVG: questionSvg(svgItems.join(' '), 390, 130),
      options,
      correctOptionId: 'a',
      hint: 'Look at the repeating shapes and colors in order!',
      explanation: `The pattern alternates: next is ${answerLabel}!`
    };
  } else if (ageGroup === '5-6' && difficulty >= 2) {
    const isRot = Math.random() > 0.4;

    if (isRot) {
      const shape = pickOne(shapes);
      const color = pickOne(COLOR_NAMES);
      const rotType = pickOne(['90cw', '90ccw', '180flip']);
      const angles = (rotType === '90cw') ? [0, 90, 180] : (rotType === '90ccw') ? [180, 90, 0] : [0, 180, 0];
      const nextAngle = (rotType === '90cw') ? 270 : (rotType === '90ccw') ? 270 : 180;
      const nextLabel = (rotType === '90cw') ? 'Pointing Left' : (rotType === '90ccw') ? 'Pointing Left' : 'Pointing Down';

      const signature = `pat:5-6:d${difficulty}:rot:${shape.name}:${color.name}:${rotType}`;
      const id = `gen-pat-5-6-d${difficulty}-rot-${shape.name}-${rotType}-${uid}`;

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
        { id: 'a', svg: optionSvg(tri(40, 40, 45, color.hex, '', nextAngle)), label: nextLabel },
        { id: 'b', svg: optionSvg(tri(40, 40, 45, color.hex, '', 0)), label: 'Pointing Up' },
        { id: 'c', svg: optionSvg(tri(40, 40, 45, color.hex, '', 90)), label: 'Pointing Right' },
        { id: 'd', svg: optionSvg(tri(40, 40, 45, color.hex, '', 180)), label: 'Pointing Down' }
      ];

      return {
        id, signature, category: 'patterns', ageGroup, difficulty,
        questionText: `The shape is turning in order! Which direction comes next?`,
        questionSVG: questionSvg(svgItems.join(' '), 390, 130),
        options,
        correctOptionId: 'a',
        hint: 'Follow the turn direction step by step!',
        explanation: 'Following the rhythm points it to the next step!'
      };
    } else {
      // Growing count pattern / Skip counting
      const step = pickOne([2, 3, 4, 5, 10]);
      const start = randInt(1, 15);
      const seq = [start, start + step, start + step * 2, start + step * 3];
      const nextVal = start + step * 4;
      const signature = `pat:5-6:d${difficulty}:skip:${start}+${step}:${nextVal}`;
      const id = `gen-pat-5-6-d${difficulty}-skip-${start}-${step}-${uid}`;
      const wrongNums = generateNumberDistractors(nextVal, 3, 1);

      return {
        id, signature, category: 'patterns', ageGroup, difficulty,
        questionText: `Skip count pattern: What comes next?`,
        questionSVG: renderSequenceCardSvg(seq, C.rose, C.purple),
        options: [
          { id: 'a', svg: numberOptionSvg(nextVal, C.purple), label: String(nextVal) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], C.purple), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], C.purple), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], C.purple), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Each step adds ${step}!`,
        explanation: `Adding ${step} to ${seq[seq.length - 1]} gives ${nextVal}!`
      };
    }
  } else {
    // 7-8 & 9+: Rich Multi-Model Sequences (Geometric/Multiplication, Division, Times Tables, Growing Differences, Alternating, Squares, Fibonacci, Arithmetic)
    const color = pickOne(COLOR_NAMES);
    const model = pickOne([
      'geometric', 'division', 'mult-table', 'growing-diff', 'alternating-op', 'squares', 'fibonacci', 'arithmetic'
    ]);

    if (model === 'geometric') {
      // Multiplication / Geometric sequence
      const mult = pickOne([2, 3, 4, 5, 10]);
      let start;
      if (mult === 2) start = pickOne([1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20, 25]);
      else if (mult === 3) start = pickOne([1, 2, 3, 4, 5, 6]);
      else if (mult === 4) start = pickOne([1, 2, 3, 4]);
      else if (mult === 5) start = pickOne([1, 2, 3, 4, 5]);
      else start = pickOne([1, 2, 3, 5]);

      const seq = [start, start * mult, start * mult * mult, start * mult * mult * mult];
      const nextVal = start * mult * mult * mult * mult;
      const signature = `pat:${ageGroup}:d${difficulty}:geom:${start}x${mult}:${nextVal}`;
      const id = `gen-pat-${ageGroup}-d${difficulty}-geom-${start}-${mult}-${uid}`;
      const wrongNums = generateNumberDistractors(nextVal, 3, 1);

      return {
        id, signature, category: 'patterns', ageGroup, difficulty,
        questionText: `Multiplication sequence (×${mult}): What number comes next?`,
        questionSVG: renderSequenceCardSvg(seq, C.rose, color.hex),
        options: [
          { id: 'a', svg: numberOptionSvg(nextVal, color.hex), label: String(nextVal) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], color.hex), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], color.hex), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], color.hex), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Each step multiplies by ${mult}: ${seq[seq.length - 1]} × ${mult} = ?`,
        explanation: `Each number is multiplied by ${mult}: ${seq[seq.length - 1]} × ${mult} = ${nextVal}! 🚀`
      };
    } else if (model === 'division') {
      // Division / Halving shrinking sequence
      const div = pickOne([2, 3, 5, 10]);
      let endVal;
      if (div === 2) endVal = pickOne([2, 3, 4, 5, 6, 8, 10]);
      else if (div === 3) endVal = pickOne([1, 2, 3]);
      else if (div === 5) endVal = pickOne([1, 2, 4]);
      else endVal = pickOne([1, 2, 5]);

      const a4 = endVal;
      const a3 = a4 * div;
      const a2 = a3 * div;
      const a1 = a2 * div;
      const a0 = a1 * div;
      const seq = [a0, a1, a2, a3];
      const nextVal = a4;
      const signature = `pat:${ageGroup}:d${difficulty}:divseq:${a0}/${div}:${nextVal}`;
      const id = `gen-pat-${ageGroup}-d${difficulty}-divseq-${a0}-${div}-${uid}`;
      const wrongNums = generateNumberDistractors(nextVal, 3, 1);

      return {
        id, signature, category: 'patterns', ageGroup, difficulty,
        questionText: `Division pattern (÷${div}): What number completes the sequence?`,
        questionSVG: renderSequenceCardSvg(seq, C.rose, color.hex),
        options: [
          { id: 'a', svg: numberOptionSvg(nextVal, color.hex), label: String(nextVal) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], color.hex), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], color.hex), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], color.hex), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Divide by ${div} at each step: ${seq[seq.length - 1]} ÷ ${div} = ?`,
        explanation: `Each number is divided by ${div}: ${seq[seq.length - 1]} ÷ ${div} = ${nextVal}! 📉`
      };
    } else if (model === 'mult-table') {
      // Multiplication times table skip counting
      const table = pickOne([3, 4, 6, 7, 8, 9, 11, 12, 15, 25]);
      const kStart = randInt(1, 4);
      const seq = [table * kStart, table * (kStart + 1), table * (kStart + 2), table * (kStart + 3)];
      const nextVal = table * (kStart + 4);
      const signature = `pat:${ageGroup}:d${difficulty}:multtbl:${table}x${kStart}:${nextVal}`;
      const id = `gen-pat-${ageGroup}-d${difficulty}-tbl-${table}-${kStart}-${uid}`;
      const wrongNums = generateNumberDistractors(nextVal, 3, 1);

      return {
        id, signature, category: 'patterns', ageGroup, difficulty,
        questionText: `Times Table of ${table}: What comes next in the sequence?`,
        questionSVG: renderSequenceCardSvg(seq, C.rose, color.hex),
        options: [
          { id: 'a', svg: numberOptionSvg(nextVal, color.hex), label: String(nextVal) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], color.hex), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], color.hex), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], color.hex), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `These are multiples of ${table}. Add ${table} to ${seq[seq.length - 1]}!`,
        explanation: `${seq[seq.length - 1]} + ${table} = ${nextVal} (or ${table} × ${kStart + 4} = ${nextVal})! ⭐`
      };
    } else if (model === 'growing-diff') {
      // Step increases by 1 or 2 each time
      const diffType = pickOne(['plus1', 'plus2', 'triangular']);
      let seq = [];
      let nextVal = 0;
      let stepExplain = '';

      if (diffType === 'triangular') {
        seq = [1, 3, 6, 10, 15]; // +2, +3, +4, +5
        nextVal = 21; // +6
        stepExplain = 'Adding +2, +3, +4, +5, +6: 15 + 6 = 21';
      } else if (diffType === 'plus1') {
        const start = randInt(2, 8);
        const s1 = randInt(2, 4);
        seq = [start, start + s1, start + s1 + (s1 + 1), start + s1 + (s1 + 1) + (s1 + 2)];
        nextVal = seq[3] + (s1 + 3);
        stepExplain = `The difference grows by 1 (+${s1}, +${s1+1}, +${s1+2}, +${s1+3}): ${seq[3]} + ${s1+3} = ${nextVal}`;
      } else {
        const start = randInt(1, 5);
        seq = [start, start + 2, start + 2 + 4, start + 2 + 4 + 6, start + 2 + 4 + 6 + 8];
        nextVal = seq[4] + 10;
        stepExplain = `The difference grows by 2 (+2, +4, +6, +8, +10): ${seq[4]} + 10 = ${nextVal}`;
      }

      const signature = `pat:${ageGroup}:d${difficulty}:growdiff:${diffType}:${seq[0]}:${nextVal}`;
      const id = `gen-pat-${ageGroup}-d${difficulty}-growdiff-${diffType}-${seq[0]}-${uid}`;
      const wrongNums = generateNumberDistractors(nextVal, 3, 1);

      return {
        id, signature, category: 'patterns', ageGroup, difficulty,
        questionText: `Growing difference pattern: What number comes next?`,
        questionSVG: renderSequenceCardSvg(seq, C.rose, color.hex),
        options: [
          { id: 'a', svg: numberOptionSvg(nextVal, color.hex), label: String(nextVal) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], color.hex), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], color.hex), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], color.hex), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Look at the differences between each pair of numbers!`,
        explanation: `${stepExplain}! 🧩`
      };
    } else if (model === 'alternating-op') {
      // Alternating 2-step sequence (+a, -b or ×2, +1)
      const altType = pickOne(['add-sub', 'mult-add', 'add10-sub5']);
      let seq = [];
      let nextVal = 0;
      let explain = '';

      if (altType === 'add-sub') {
        const start = randInt(3, 15);
        const add = randInt(5, 8);
        const sub = randInt(2, 4);
        seq = [start, start + add, start + add - sub, start + add - sub + add, start + add - sub + add - sub];
        nextVal = seq[4] + add;
        explain = `Pattern alternates (+${add}, -${sub}, +${add}, -${sub}, +${add}): ${seq[4]} + ${add} = ${nextVal}`;
      } else if (altType === 'mult-add') {
        const start = randInt(2, 4);
        const v1 = start;
        const v2 = v1 * 2 + 1;
        const v3 = v2 * 2 + 1;
        const v4 = v3 * 2 + 1;
        seq = [v1, v2, v3, v4];
        nextVal = v4 * 2 + 1;
        explain = `Pattern is (×2 + 1): ${v4} × 2 + 1 = ${nextVal}`;
      } else {
        const start = randInt(4, 20);
        seq = [start, start + 10, start + 10 - 5, start + 10 - 5 + 10, start + 10 - 5 + 10 - 5];
        nextVal = seq[4] + 10;
        explain = `Pattern alternates (+10, -5): ${seq[4]} + 10 = ${nextVal}`;
      }

      const signature = `pat:${ageGroup}:d${difficulty}:alt:${altType}:${seq[0]}:${nextVal}`;
      const id = `gen-pat-${ageGroup}-d${difficulty}-alt-${altType}-${seq[0]}-${uid}`;
      const wrongNums = generateNumberDistractors(nextVal, 3, 1);

      return {
        id, signature, category: 'patterns', ageGroup, difficulty,
        questionText: `Alternating operations: What completes the pattern?`,
        questionSVG: renderSequenceCardSvg(seq, C.rose, color.hex),
        options: [
          { id: 'a', svg: numberOptionSvg(nextVal, color.hex), label: String(nextVal) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], color.hex), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], color.hex), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], color.hex), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Follow the alternating rhythm of operations!`,
        explanation: `${explain}! 🎯`
      };
    } else if (model === 'squares') {
      // Perfect squares series
      const startRoot = randInt(1, 6);
      const seq = [
        startRoot * startRoot,
        (startRoot + 1) * (startRoot + 1),
        (startRoot + 2) * (startRoot + 2),
        (startRoot + 3) * (startRoot + 3)
      ];
      const nextRoot = startRoot + 4;
      const nextVal = nextRoot * nextRoot;
      const signature = `pat:${ageGroup}:d${difficulty}:sq:${startRoot}:${nextVal}`;
      const id = `gen-pat-${ageGroup}-d${difficulty}-sq-${startRoot}-${uid}`;
      const wrongNums = generateNumberDistractors(nextVal, 3, 1);

      return {
        id, signature, category: 'patterns', ageGroup, difficulty,
        questionText: `Square numbers pattern: What number comes next?`,
        questionSVG: renderSequenceCardSvg(seq, C.rose, color.hex),
        options: [
          { id: 'a', svg: numberOptionSvg(nextVal, color.hex), label: String(nextVal) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], color.hex), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], color.hex), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], color.hex), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `These are square numbers: (${startRoot}², ${startRoot+1}², ${startRoot+2}²...)! Next is ${nextRoot}²!`,
        explanation: `Perfect square sequence: ${nextRoot}² (${nextRoot} × ${nextRoot}) = ${nextVal}! 🟥`
      };
    } else if (model === 'fibonacci') {
      // Add-previous-two numbers
      const a = randInt(1, 3);
      const b = randInt(1, 4);
      const c = a + b;
      const d = b + c;
      const e = c + d;
      const nextVal = d + e;
      const seq = [a, b, c, d, e];
      const signature = `pat:${ageGroup}:d${difficulty}:fib:${a}-${b}:${nextVal}`;
      const id = `gen-pat-${ageGroup}-d${difficulty}-fib-${a}-${b}-${uid}`;
      const wrongNums = generateNumberDistractors(nextVal, 3, 1);

      return {
        id, signature, category: 'patterns', ageGroup, difficulty,
        questionText: `Sum of previous two numbers: What completes the sequence?`,
        questionSVG: renderSequenceCardSvg(seq, C.rose, color.hex),
        options: [
          { id: 'a', svg: numberOptionSvg(nextVal, color.hex), label: String(nextVal) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], color.hex), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], color.hex), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], color.hex), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Add the last two numbers together: ${d} + ${e} = ?`,
        explanation: `Each number is the sum of the two before it: ${d} + ${e} = ${nextVal}! 🌀`
      };
    } else {
      // Arithmetic progression (constant step)
      const step = pickOne([2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 15, 20, 25, 50]);
      const start = randInt(1, 100);
      const isDecreasing = Math.random() > 0.7 && start > 40;
      const signedStep = isDecreasing ? -Math.min(step, 8) : step;
      const seq = [start, start + signedStep, start + signedStep * 2, start + signedStep * 3];
      const nextVal = start + signedStep * 4;
      const signature = `pat:${ageGroup}:d${difficulty}:seq:${start}+${signedStep}:${nextVal}`;
      const id = `gen-pat-${ageGroup}-d${difficulty}-seq-${start}-${signedStep}-${uid}`;
      const wrongNums = generateNumberDistractors(nextVal, 3, 0);

      return {
        id, signature, category: 'patterns', ageGroup, difficulty,
        questionText: `What number completes the logic sequence?`,
        questionSVG: renderSequenceCardSvg(seq, C.rose, color.hex),
        options: [
          { id: 'a', svg: numberOptionSvg(nextVal, color.hex), label: String(nextVal) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], color.hex), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], color.hex), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], color.hex), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: `Notice how much changes at each step (${signedStep >= 0 ? '+' : ''}${signedStep})!`,
        explanation: `${seq[seq.length - 1]} ${signedStep >= 0 ? '+' : '-'} ${Math.abs(signedStep)} = ${nextVal}!`
      };
    }
  }
}

// ==========================================================================
// 3. SPATIAL & SHAPES
// ==========================================================================

const SPATIAL_SHAPES = [
  { name: 'Star', render: (f) => star(40, 40, 28, f) },
  { name: 'Heart', render: (f) => `<text x="15" y="58" font-size="52" fill="${f}">❤️</text>` },
  { name: 'Butterfly', render: (f) => `<text x="15" y="58" font-size="52">🦋</text>` },
  { name: 'Rocket', render: (f) => `<text x="15" y="58" font-size="52">🚀</text>` },
  { name: 'Fish', render: (f) => `<text x="15" y="58" font-size="52">🐟</text>` },
  { name: 'Crown', render: (f) => `<text x="15" y="58" font-size="52">👑</text>` },
  { name: 'Cat', render: (f) => `<text x="15" y="58" font-size="52">🐱</text>` },
  { name: 'Tree', render: (f) => `<text x="15" y="58" font-size="52">🌲</text>` },
  { name: 'Car', render: (f) => `<text x="15" y="58" font-size="52">🚗</text>` },
  { name: 'Airplane', render: (f) => `<text x="15" y="58" font-size="52">✈️</text>` },
  { name: 'House', render: (f) => `<text x="15" y="58" font-size="52">🏠</text>` },
  { name: 'Sun', render: (f) => `<text x="15" y="58" font-size="52">☀️</text>` },
  { name: 'Moon', render: (f) => `<text x="15" y="58" font-size="52">🌙</text>` },
  { name: 'Diamond', render: (f) => diamond(40, 40, 26, f) },
  { name: 'Hexagon', render: (f) => hexagon(40, 40, 26, f) },
  { name: 'Ship', render: (f) => `<text x="15" y="58" font-size="52">🚢</text>` }
];

function generateSpatialQuestion(ageGroup, difficulty = 1) {
  const uid = Math.random().toString(36).slice(2, 8);
  const col = pickOne(COLOR_NAMES);

  if (ageGroup === '3-4') {
    const targetShape = pickOne(SPATIAL_SHAPES);
    const signature = `spa:3-4:d${difficulty}:shadow:${targetShape.name}:${col.name}`;
    const id = `gen-spa-3-4-d${difficulty}-shadow-${targetShape.name}-${col.name}-${uid}`;

    return {
      id, signature, category: 'spatial', ageGroup, difficulty,
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
  } else if (ageGroup === '5-6') {
    const model = pickOne(['mirror', 'shadow', 'rotation', 'blocks']);

    if (model === 'mirror') {
      const shapeType = pickOne(['arrow-right', 'flag-triangle', 'l-bracket', 'star-wedge', 'wedge-arrow', 'trapezoid-flag', 'diamond-cut', 'chevron']);
      const signature = `spa:5-6:d${difficulty}:mirror:${shapeType}:${col.name}`;
      const id = `gen-spa-5-6-d${difficulty}-mirror-${shapeType}-${col.name}-${uid}`;

      return {
        id, signature, category: 'spatial', ageGroup, difficulty,
        questionText: `Which shape is the perfect mirror reflection across the glowing line?`,
        questionSVG: questionSvg(`
          <g class="anim-pulse">
            <polygon points="120,35 170,65 120,95" fill="${col.hex}"/>
            <line x1="200" y1="20" x2="200" y2="110" stroke="${C.purple}" stroke-width="4" stroke-dasharray="6,6"/>
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
        hint: 'Look into the mirror — points flip horizontally!',
        explanation: 'Reflecting across the vertical axis flips the horizontal direction!'
      };
    } else if (model === 'rotation') {
      const targetShape = pickOne(SPATIAL_SHAPES);
      const rotDeg = pickOne([90, 180, 270]);
      const signature = `spa:5-6:d${difficulty}:rot:${targetShape.name}:${rotDeg}:${col.name}`;
      const id = `gen-spa-5-6-d${difficulty}-rot-${targetShape.name}-${rotDeg}-${uid}`;

      return {
        id, signature, category: 'spatial', ageGroup, difficulty,
        questionText: `Which option shows this shape turned by ${rotDeg} degrees?`,
        questionSVG: questionSvg(`
          <g class="anim-float">
            <circle cx="200" cy="65" r="50" fill="${col.hex}22"/>
            <g transform="translate(160, 25)">${targetShape.render(col.hex)}</g>
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: optionSvg(`<g transform="rotate(${rotDeg} 40 40)">${targetShape.render(col.hex)}</g>`), label: `Rotated ${rotDeg}°` },
          { id: 'b', svg: optionSvg(`<g transform="rotate(${(rotDeg + 90) % 360} 40 40)">${targetShape.render(col.hex)}</g>`), label: `Rotated ${(rotDeg + 90) % 360}°` },
          { id: 'c', svg: optionSvg(`<g transform="rotate(${(rotDeg + 180) % 360} 40 40)">${targetShape.render(col.hex)}</g>`), label: `Rotated ${(rotDeg + 180) % 360}°` },
          { id: 'd', svg: optionSvg(`<g transform="rotate(${(rotDeg + 270) % 360} 40 40)">${targetShape.render(col.hex)}</g>`), label: `Rotated ${(rotDeg + 270) % 360}°` }
        ],
        correctOptionId: 'a',
        hint: `Follow how the shape spins clockwise!`,
        explanation: `Turning ${rotDeg} degrees matches this exact rotation!`
      };
    } else if (model === 'blocks') {
      const blockCount = randInt(3, 7);
      const signature = `spa:5-6:d${difficulty}:blocks:${blockCount}:${col.name}`;
      const id = `gen-spa-5-6-d${difficulty}-blocks-${blockCount}-${col.name}-${uid}`;
      const wrongNums = generateNumberDistractors(blockCount, 3, 1);

      const blocksSvg = [];
      for (let i = 0; i < blockCount; i++) {
        const colIdx = i % 3;
        const rowIdx = Math.floor(i / 3);
        const x = 150 + colIdx * 34 - rowIdx * 10;
        const y = 50 + rowIdx * 30;
        blocksSvg.push(`
          <g transform="translate(${x}, ${y})">
            <polygon points="15,0 30,8 15,16 0,8" fill="${col.hex}"/>
            <polygon points="0,8 15,16 15,32 0,24" fill="${col.hex}CC"/>
            <polygon points="15,16 30,8 30,24 15,32" fill="${col.hex}99"/>
          </g>
        `);
      }

      return {
        id, signature, category: 'spatial', ageGroup, difficulty,
        questionText: `How many 3D blocks are in this little stack?`,
        questionSVG: questionSvg(`
          <g class="anim-float">
            ${blocksSvg.join(' ')}
          </g>
        `, 400, 130),
        options: [
          { id: 'a', svg: numberOptionSvg(blockCount, col.hex), label: String(blockCount) },
          { id: 'b', svg: numberOptionSvg(wrongNums[0], col.hex), label: String(wrongNums[0]) },
          { id: 'c', svg: numberOptionSvg(wrongNums[1], col.hex), label: String(wrongNums[1]) },
          { id: 'd', svg: numberOptionSvg(wrongNums[2], col.hex), label: String(wrongNums[2]) }
        ],
        correctOptionId: 'a',
        hint: 'Count the tops of each block!',
        explanation: `There are ${blockCount} blocks in total!`
      };
    } else {
      const targetShape = pickOne(SPATIAL_SHAPES);
      const signature = `spa:5-6:d${difficulty}:shadow:${targetShape.name}:${col.name}`;
      const id = `gen-spa-5-6-d${difficulty}-shadow-${targetShape.name}-${col.name}-${uid}`;

      return {
        id, signature, category: 'spatial', ageGroup, difficulty,
        questionText: `Which shadow belongs to this ${targetShape.name}?`,
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
    }
  } else {
    // 7-8 & 9+: 3D Block Counting / Symmetry
    const blockCount = randInt(4, 14);
    const layout = pickOne(['stairs', 'tower', 'grid', 'bridge']);
    const signature = `spa:${ageGroup}:d${difficulty}:blocks:${layout}:${blockCount}:${col.name}`;
    const id = `gen-spa-${ageGroup}-d${difficulty}-blocks-${layout}-${blockCount}-${col.name}-${uid}`;
    const wrongNums = generateNumberDistractors(blockCount, 3, 2);

    const blocksSvg = [];
    for (let i = 0; i < blockCount; i++) {
      const colIdx = i % 4;
      const rowIdx = Math.floor(i / 4);
      const x = 140 + colIdx * 32 - rowIdx * 10;
      const y = 50 + rowIdx * 30;
      blocksSvg.push(`
        <g transform="translate(${x}, ${y})">
          <polygon points="15,0 30,8 15,16 0,8" fill="${col.hex}"/>
          <polygon points="0,8 15,16 15,32 0,24" fill="${col.hex}CC"/>
          <polygon points="15,16 30,8 30,24 15,32" fill="${col.hex}99"/>
        </g>
      `);
    }

    return {
      id, signature, category: 'spatial', ageGroup, difficulty,
      questionText: `How many 3D wooden blocks are stacked together in this tower?`,
      questionSVG: questionSvg(`
        <g class="anim-float">
          ${blocksSvg.join(' ')}
        </g>
      `, 400, 130),
      options: [
        { id: 'a', svg: numberOptionSvg(blockCount, col.hex), label: String(blockCount) },
        { id: 'b', svg: numberOptionSvg(wrongNums[0], col.hex), label: String(wrongNums[0]) },
        { id: 'c', svg: numberOptionSvg(wrongNums[1], col.hex), label: String(wrongNums[1]) },
        { id: 'd', svg: numberOptionSvg(wrongNums[2], col.hex), label: String(wrongNums[2]) }
      ],
      correctOptionId: 'a',
      hint: 'Count the top surfaces of each 3D cube!',
      explanation: `There are exactly ${blockCount} blocks stacked in the structure!`
    };
  }
}

// ==========================================================================
// 4. ODD ONE OUT
// ==========================================================================

const ODD_THEMES = [
  {
    theme: 'animals-fruit',
    majority: [{ emoji: '🐶', name: 'Dog' }, { emoji: '🐱', name: 'Cat' }, { emoji: '🐰', name: 'Rabbit' }, { emoji: '🐻', name: 'Bear' }],
    odd: [{ emoji: '🍎', name: 'Apple', reason: 'Apple is a fruit, all others are living animals! 🐾' }, { emoji: '🍌', name: 'Banana', reason: 'Banana is a fruit, not an animal! 🍌' }]
  },
  {
    theme: 'fruits-vehicle',
    majority: [{ emoji: '🍌', name: 'Banana' }, { emoji: '🍓', name: 'Strawberry' }, { emoji: '🍇', name: 'Grapes' }, { emoji: '🍉', name: 'Watermelon' }],
    odd: [{ emoji: '🚗', name: 'Car', reason: 'Car is a vehicle, all others are delicious fruits! 🍓' }, { emoji: '🚌', name: 'Bus', reason: 'Bus is a vehicle, not a fruit! 🚌' }]
  },
  {
    theme: 'space-ocean',
    majority: [{ emoji: '🚀', name: 'Rocket' }, { emoji: '🛸', name: 'UFO' }, { emoji: '🛰️', name: 'Satellite' }, { emoji: '👨‍🚀', name: 'Astronaut' }],
    odd: [{ emoji: '🐙', name: 'Octopus', reason: 'Octopus lives in the ocean, all others fly in outer space! 🚀' }, { emoji: '🐬', name: 'Dolphin', reason: 'Dolphin swims in water, not space! 🌊' }]
  },
  {
    theme: 'shapes-sides',
    majority: [{ emoji: '🟦', name: 'Square' }, { emoji: '🟩', name: 'Rectangle' }, { emoji: '🟨', name: 'Diamond' }, { emoji: '🟫', name: 'Rhombus' }],
    odd: [{ emoji: '🔴', name: 'Circle', reason: 'Circle has 0 straight corners, while all others have 4 corners! ⭕' }]
  },
  {
    theme: 'flying-land',
    majority: [{ emoji: '🦅', name: 'Eagle' }, { emoji: '🦜', name: 'Parrot' }, { emoji: '🦉', name: 'Owl' }, { emoji: '🕊️', name: 'Dove' }],
    odd: [{ emoji: '🦁', name: 'Lion', reason: 'Lion runs on land, while all others fly in the sky! 🦅' }, { emoji: '🐘', name: 'Elephant', reason: 'Elephant walks on land! 🐘' }]
  },
  {
    theme: 'hot-cold',
    majority: [{ emoji: '🔥', name: 'Fire' }, { emoji: '☀️', name: 'Sun' }, { emoji: '☕', name: 'Hot Tea' }, { emoji: '🌋', name: 'Volcano' }],
    odd: [{ emoji: '🍦', name: 'Ice Cream', reason: 'Ice cream is cold, while all others are hot! ❄️' }, { emoji: '🧊', name: 'Ice Cube', reason: 'Ice is cold! 🧊' }]
  },
  {
    theme: 'sea-creatures-land',
    majority: [{ emoji: '🐬', name: 'Dolphin' }, { emoji: '🦈', name: 'Shark' }, { emoji: '🐳', name: 'Whale' }, { emoji: '🐠', name: 'Fish' }],
    odd: [{ emoji: '🦒', name: 'Giraffe', reason: 'Giraffe lives on land, while all others swim in the ocean! 🌊' }]
  },
  {
    theme: 'music-tools',
    majority: [{ emoji: '🎸', name: 'Guitar' }, { emoji: '🎹', name: 'Piano' }, { emoji: '🎺', name: 'Trumpet' }, { emoji: '🥁', name: 'Drums' }],
    odd: [{ emoji: '🔨', name: 'Hammer', reason: 'Hammer is a workshop tool, all others play musical tunes! 🎵' }, { emoji: '🪚', name: 'Hand Saw', reason: 'Saw is a tool! 🪚' }]
  },
  {
    theme: 'sweets-veggies',
    majority: [{ emoji: '🥦', name: 'Broccoli' }, { emoji: '🥕', name: 'Carrot' }, { emoji: '🥒', name: 'Cucumber' }, { emoji: '🌽', name: 'Corn' }],
    odd: [{ emoji: '🍩', name: 'Donut', reason: 'Donut is a sweet pastry, all others are healthy vegetables! 🥕' }, { emoji: '🧁', name: 'Cupcake', reason: 'Cupcake is sweet! 🧁' }]
  },
  {
    theme: 'clothing-transport',
    majority: [{ emoji: '👕', name: 'Shirt' }, { emoji: '👖', name: 'Pants' }, { emoji: '🧦', name: 'Socks' }, { emoji: '👗', name: 'Dress' }],
    odd: [{ emoji: '🚲', name: 'Bicycle', reason: 'Bicycle is a rideable vehicle, all others are clothes to wear! 👕' }]
  },
  {
    theme: 'water-vehicles',
    majority: [{ emoji: '⛵', name: 'Sailboat' }, { emoji: '🚢', name: 'Ship' }, { emoji: '🚤', name: 'Speedboat' }, { emoji: '🛶', name: 'Canoe' }],
    odd: [{ emoji: '🚁', name: 'Helicopter', reason: 'Helicopter flies through the air, all others float on water! ⛵' }]
  },
  {
    theme: 'pets-wild',
    majority: [{ emoji: '🐅', name: 'Tiger' }, { emoji: '🐘', name: 'Elephant' }, { emoji: '🐻', name: 'Bear' }, { emoji: '🐆', name: 'Leopard' }],
    odd: [{ emoji: '🐹', name: 'Hamster', reason: 'Hamster is a gentle domestic pet, all others live in the wild jungle! 🐾' }]
  }
];

function generateOddOneOutQuestion(ageGroup, difficulty = 1) {
  const uid = Math.random().toString(36).slice(2, 8);
  const themeObj = pickOne(ODD_THEMES);
  const oddItem = pickOne(themeObj.odd);
  const shuffledMaj = shuffle(themeObj.majority).slice(0, 3);
  const signature = `odd:${ageGroup}:d${difficulty}:${themeObj.theme}:${oddItem.name}:${shuffledMaj.map(m => m.name).join('-')}`;
  const id = `gen-odd-${ageGroup}-d${difficulty}-${themeObj.theme}-${oddItem.name}-${uid}`;

  const options = [
    { id: 'a', svg: optionSvg(`<text x="15" y="58" font-size="52">${oddItem.emoji}</text>`), label: oddItem.name },
    { id: 'b', svg: optionSvg(`<text x="15" y="58" font-size="52">${shuffledMaj[0].emoji}</text>`), label: shuffledMaj[0].name },
    { id: 'c', svg: optionSvg(`<text x="15" y="58" font-size="52">${shuffledMaj[1].emoji}</text>`), label: shuffledMaj[1].name },
    { id: 'd', svg: optionSvg(`<text x="15" y="58" font-size="52">${shuffledMaj[2].emoji}</text>`), label: shuffledMaj[2].name }
  ];

  return {
    id, signature, category: 'oddOneOut', ageGroup, difficulty,
    questionText: 'Which one does NOT belong in the group?',
    questionSVG: questionSvg(`
      <g class="anim-float">
        <text x="40" y="80" font-size="46">
          ${shuffledMaj[0].emoji}  ${shuffledMaj[1].emoji}  ${oddItem.emoji}  ${shuffledMaj[2].emoji}
        </text>
      </g>
    `, 380, 120),
    options,
    correctOptionId: 'a',
    hint: 'Find the one item that belongs to a different category!',
    explanation: oddItem.reason
  };
}

// ==========================================================================
// 5. SORTING & GROUPING
// ==========================================================================

const SORTING_SETS = [
  {
    categoryName: 'Living Animals 🐾',
    targetItems: [
      { emoji: '🐶', name: 'Puppy', reason: 'Puppy is a living animal that grows and breathes!' },
      { emoji: '🐱', name: 'Kitten', reason: 'Kitten is a living animal!' },
      { emoji: '🐰', name: 'Bunny', reason: 'Bunny is a living animal!' },
      { emoji: '🐼', name: 'Panda', reason: 'Panda is a living animal!' }
    ],
    distractors: [
      { emoji: '🚗', name: 'Car' }, { emoji: '📱', name: 'Phone' }, { emoji: '🪑', name: 'Chair' }, { emoji: '📺', name: 'TV' }
    ]
  },
  {
    categoryName: 'Healthy Fruits 🍎',
    targetItems: [
      { emoji: '🍓', name: 'Strawberry', reason: 'Strawberry is a juicy fruit grown on plants!' },
      { emoji: '🍌', name: 'Banana', reason: 'Banana is a nutritious fruit!' },
      { emoji: '🍇', name: 'Grapes', reason: 'Grapes are healthy fruits!' },
      { emoji: '🍉', name: 'Watermelon', reason: 'Watermelon is a sweet natural fruit!' }
    ],
    distractors: [
      { emoji: '🍕', name: 'Pizza' }, { emoji: '🍦', name: 'Ice Cream' }, { emoji: '🧁', name: 'Cupcake' }, { emoji: '🍟', name: 'Fries' }
    ]
  },
  {
    categoryName: 'Vehicles that Fly ✈️',
    targetItems: [
      { emoji: '🚀', name: 'Rocket', reason: 'Rockets fly high into outer space!' },
      { emoji: '✈️', name: 'Airplane', reason: 'Airplanes cruise through the sky!' },
      { emoji: '🚁', name: 'Helicopter', reason: 'Helicopters fly in the air!' }
    ],
    distractors: [
      { emoji: '🚌', name: 'Bus' }, { emoji: '🚜', name: 'Tractor' }, { emoji: '⛵', name: 'Sailboat' }, { emoji: '🚗', name: 'Car' }
    ]
  },
  {
    categoryName: 'Ocean Animals 🌊',
    targetItems: [
      { emoji: '🐬', name: 'Dolphin', reason: 'Dolphins swim freely in the ocean!' },
      { emoji: '🐙', name: 'Octopus', reason: 'Octopuses dwell in the sea!' },
      { emoji: '🦈', name: 'Shark', reason: 'Sharks are sea creatures!' },
      { emoji: '🐳', name: 'Whale', reason: 'Whales are majestic marine giants!' }
    ],
    distractors: [
      { emoji: '🦁', name: 'Lion' }, { emoji: '🐒', name: 'Monkey' }, { emoji: '🐫', name: 'Camel' }, { emoji: '🦒', name: 'Giraffe' }
    ]
  },
  {
    categoryName: 'Things to Wear 👕',
    targetItems: [
      { emoji: '🧥', name: 'Jacket', reason: 'A jacket is cozy clothing you wear!' },
      { emoji: '👒', name: 'Hat', reason: 'A hat is worn on your head!' },
      { emoji: '🧦', name: 'Socks', reason: 'Socks keep your feet warm!' }
    ],
    distractors: [
      { emoji: '🎸', name: 'Guitar' }, { emoji: '⚽', name: 'Soccer Ball' }, { emoji: '🔦', name: 'Flashlight' }, { emoji: '💻', name: 'Laptop' }
    ]
  },
  {
    categoryName: 'Musical Instruments 🎵',
    targetItems: [
      { emoji: '🎻', name: 'Violin', reason: 'Violin makes beautiful musical sounds!' },
      { emoji: '🎺', name: 'Trumpet', reason: 'Trumpet plays lively brass tunes!' },
      { emoji: '🥁', name: 'Drums', reason: 'Drums keep the rhythmic beat!' }
    ],
    distractors: [
      { emoji: '🔨', name: 'Hammer' }, { emoji: '🪛', name: 'Screwdriver' }, { emoji: '🔑', name: 'Key' }, { emoji: '🪚', name: 'Saw' }
    ]
  },
  {
    categoryName: 'Natural Plants & Trees 🌿',
    targetItems: [
      { emoji: '🍃', name: 'Leaf', reason: 'Leaf is a natural part of a tree!' },
      { emoji: '🌻', name: 'Sunflower', reason: 'Sunflower is a flowering plant!' },
      { emoji: '🌲', name: 'Pine Tree', reason: 'Pine is a tall woodland tree!' }
    ],
    distractors: [
      { emoji: '💎', name: 'Diamond' }, { emoji: '🪙', name: 'Coin' }, { emoji: '⚙️', name: 'Gear' }, { emoji: '🔋', name: 'Battery' }
    ]
  }
];

function generateSortingQuestion(ageGroup, difficulty = 1) {
  const uid = Math.random().toString(36).slice(2, 8);
  const set = pickOne(SORTING_SETS);
  const targetItem = pickOne(set.targetItems);
  const chosenDistractors = shuffle(set.distractors).slice(0, 3);
  const signature = `sort:${ageGroup}:d${difficulty}:${set.categoryName}:${targetItem.name}:${chosenDistractors.map(d => d.name).join('-')}`;
  const id = `gen-sort-${ageGroup}-d${difficulty}-${set.categoryName}-${targetItem.name}-${uid}`;

  const options = [
    { id: 'a', svg: optionSvg(`<text x="15" y="58" font-size="52">${targetItem.emoji}</text>`), label: targetItem.name },
    { id: 'b', svg: optionSvg(`<text x="15" y="58" font-size="52">${chosenDistractors[0].emoji}</text>`), label: chosenDistractors[0].name },
    { id: 'c', svg: optionSvg(`<text x="15" y="58" font-size="52">${chosenDistractors[1].emoji}</text>`), label: chosenDistractors[1].name },
    { id: 'd', svg: optionSvg(`<text x="15" y="58" font-size="52">${chosenDistractors[2].emoji}</text>`), label: chosenDistractors[2].name }
  ];

  return {
    id, signature, category: 'sorting', ageGroup, difficulty,
    questionText: `Which item belongs in the "${set.categoryName}" box?`,
    questionSVG: questionSvg(`
      <g class="anim-pulse">
        <rect x="50" y="25" width="300" height="85" rx="16" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2"/>
        <text x="70" y="76" font-size="28" font-weight="bold" fill="#D97706">${set.categoryName}</text>
      </g>
    `, 400, 130),
    options,
    correctOptionId: 'a',
    hint: `Look for the item that matches ${set.categoryName}!`,
    explanation: targetItem.reason
  };
}

// ==========================================================================
// 6. MEMORY & ATTENTION
// ==========================================================================

function generateMemoryQuestion(ageGroup, difficulty = 1) {
  const uid = Math.random().toString(36).slice(2, 8);
  const targetColor = pickOne(COLOR_NAMES);
  let otherColor = pickOne(COLOR_NAMES);
  while (otherColor === targetColor) otherColor = pickOne(COLOR_NAMES);

  const targetCount = randInt(2, 6 + difficulty * 2);
  const otherCount = randInt(2, 6);

  const signature = `mem:${ageGroup}:d${difficulty}:count-${targetCount}-${targetColor.name}-${otherCount}-${otherColor.name}`;
  const id = `gen-mem-${ageGroup}-d${difficulty}-${targetCount}-${targetColor.name}-${uid}`;

  const items = [];
  for (let i = 0; i < targetCount; i++) items.push({ isTarget: true, fill: targetColor.hex });
  for (let i = 0; i < otherCount; i++) items.push({ isTarget: false, fill: otherColor.hex });
  shuffle(items);

  const svgShapes = items.map((item, idx) => {
    const x = 25 + (idx % 7) * 50;
    const y = idx >= 7 ? 95 : 45;
    return circle(x, y, 16, item.fill, 'anim-pulse');
  });

  const wrongNums = generateNumberDistractors(targetCount, 3, 1);

  return {
    id, signature, category: 'memory', ageGroup, difficulty,
    questionText: `How many glowing ${targetColor.name} circles can you count?`,
    questionSVG: questionSvg(svgShapes.join(' '), 380, 130),
    options: [
      { id: 'a', svg: numberOptionSvg(targetCount, targetColor.hex), label: String(targetCount) },
      { id: 'b', svg: numberOptionSvg(wrongNums[0], targetColor.hex), label: String(wrongNums[0]) },
      { id: 'c', svg: numberOptionSvg(wrongNums[1], targetColor.hex), label: String(wrongNums[1]) },
      { id: 'd', svg: numberOptionSvg(wrongNums[2], targetColor.hex), label: String(wrongNums[2]) }
    ],
    correctOptionId: 'a',
    hint: `Focus carefully only on the ${targetColor.name} ones!`,
    explanation: `There are exactly ${targetCount} ${targetColor.name} circles! Great visual focus! 🧠`
  };
}

// ==========================================================================
// MASTER PROCEDURAL GENERATOR
// ==========================================================================

/**
 * Generate a procedural question with automatic deduplication against seen signatures
 * @param {string} category
 * @param {string} ageGroup
 * @param {number} [difficulty=1]
 * @param {Array<string>} [seenSignatures=[]]
 * @returns {Object}
 */
export function generateProceduralQuestion(category, ageGroup, difficulty = 1, seenSignatures = []) {
  const maxAttempts = 50;
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt++;
    let q = null;
    switch (category) {
      case 'math':
        q = generateMathQuestion(ageGroup, difficulty);
        break;
      case 'patterns':
        q = generatePatternsQuestion(ageGroup, difficulty);
        break;
      case 'spatial':
        q = generateSpatialQuestion(ageGroup, difficulty);
        break;
      case 'oddOneOut':
        q = generateOddOneOutQuestion(ageGroup, difficulty);
        break;
      case 'sorting':
        q = generateSortingQuestion(ageGroup, difficulty);
        break;
      case 'memory':
        q = generateMemoryQuestion(ageGroup, difficulty);
        break;
      default:
        q = generateOddOneOutQuestion(ageGroup, difficulty);
        break;
    }

    if (q && (!seenSignatures || !seenSignatures.includes(q.signature))) {
      return q;
    }
  }

  // Fallback variant
  switch (category) {
    case 'math': return generateMathQuestion(ageGroup, difficulty);
    case 'patterns': return generatePatternsQuestion(ageGroup, difficulty);
    case 'spatial': return generateSpatialQuestion(ageGroup, difficulty);
    case 'oddOneOut': return generateOddOneOutQuestion(ageGroup, difficulty);
    case 'sorting': return generateSortingQuestion(ageGroup, difficulty);
    case 'memory': return generateMemoryQuestion(ageGroup, difficulty);
    default: return generateOddOneOutQuestion(ageGroup, difficulty);
  }
}
