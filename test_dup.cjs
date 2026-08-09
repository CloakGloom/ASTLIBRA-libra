const fs = require('fs');

// 直接读源码，模拟引擎的 applyRules
const { Category, Grade } = { Grade: { White: 0, Yellow: 1, Red: 2, Green: 3 } };

// 模拟砂糖和草莓酱的 effect
const psE = { id: 'ps', name: '猛毒极', grade: 2, value: 50, category: 'PSN_RES' };
const snE = { id: 'sn', name: '石化极', grade: 2, value: 50, category: 'STONE_RES' };
const bdE = { id: 'bd', name: '暗闇极', grade: 2, value: 50, category: 'BLIND_RES' };
const blE = { id: 'bl', name: '出血极', grade: 2, value: 50, category: 'BLD_RES' };
const paE = { id: 'pa', name: '麻痹极', grade: 2, value: 50, category: 'PARA_RES' };

// 砂糖: sn_E, ps_E, bd_E
// 草莓酱: ps_E, bl_E, pa_E
const shatang = { 
  name: '砂糖', 
  effects: [snE, psE, bdE].map(e => ({ ...e, effective: e.value, sourceName: '砂糖', sourceLocked: false }))
};
const caomei = { 
  name: '草莓酱', 
  effects: [psE, blE, paE].map(e => ({ ...e, effective: e.value, sourceName: '草莓酱', sourceLocked: false }))
};

const left = [...shatang.effects, ...caomei.effects];
const right = []; // empty right side

console.log('=== Left side items: 砂糖 + 草莓酱 ===');
console.log('砂糖 effects:', shatang.effects.map(e => e.name + '(' + e.category + ')'));
console.log('草莓酱 effects:', caomei.effects.map(e => e.name + '(' + e.category + ')'));

// Simulate keepMax with category grouping (new code)
const g = new Map();
for (const e of left) {
  const k = e.category;
  if (!g.has(k)) g.set(k, []);
  g.get(k).push(e);
}

console.log('\n=== Category groups ===');
let dc = 0;
for (const [cat, arr] of g) {
  console.log(cat + ': ' + arr.length + ' effects');
  if (arr.length > 1) {
    let max = arr[0];
    for (const e of arr) if (e.value > max.value) max = e;
    for (const e of arr) {
      if (e !== max) {
        e.effective = 0;
        e.duplicate = true;
        dc++;
        console.log('  DUPLICATE: ' + e.sourceName + '.' + e.name + ' (value=' + e.value + ')');
      } else {
        console.log('  KEPT: ' + e.sourceName + '.' + e.name + ' (value=' + e.value + ')');
      }
    }
  }
}
console.log('Total duplicates (dc):', dc);
