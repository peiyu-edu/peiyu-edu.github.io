// Original draft, no DOM or persistence. Cell IDs are r * cols + c, zero based.
export function board(rows, cols, holes = []) {
  if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 1 || cols < 1 || rows > 12 || cols > 12) throw new RangeError('边长须为 1–12 的整数');
  const removed = new Set(holes);
  if ([...removed].some(i => !Number.isInteger(i) || i < 0 || i >= rows * cols)) throw new RangeError('挖洞编号越界');
  return { rows, cols, cells: Array.from({ length: rows * cols }, (_, i) => i).filter(i => !removed.has(i)) };
}
export function color(b, i) { return (Math.floor(i / b.cols) + i % b.cols) % 2; }
export function neighbors(b, i) {
  const r = Math.floor(i / b.cols), c = i % b.cols, live = new Set(b.cells);
  return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([x,y]) => x >= 0 && x < b.rows && y >= 0 && y < b.cols).map(([x,y]) => x*b.cols+y).filter(j => live.has(j));
}
export function solve(b) {
  const black = b.cells.filter(i => color(b,i) === 0), white = b.cells.filter(i => color(b,i) === 1);
  const matchW = new Map();
  function augment(u, seen) {
    for (const v of neighbors(b,u)) {
      if (seen.has(v)) continue;
      seen.add(v);
      if (!matchW.has(v) || augment(matchW.get(v),seen)) { matchW.set(v,u); return true; }
    }
    return false;
  }
  for (const u of black) augment(u,new Set());
  const pairs = [...matchW].map(([v,u]) => [u,v]);
  const tileable = pairs.length*2 === b.cells.length;
  let certificate = null;
  if (!tileable) {
    if (black.length !== white.length) certificate = { type:'color', black:black.length, white:white.length };
    else {
      // Close all unmatched black roots under neighbors and matched partners.
      // No augmenting path leaves every reached white matched: |S| > |N(S)|.
      const matchB = new Map(pairs), S = new Set(black.filter(u => !matchB.has(u))), N = new Set(), queue = [...S];
      for (let k=0;k<queue.length;k++) for (const v of neighbors(b,queue[k])) {
        if (N.has(v)) continue;
        N.add(v);
        if (matchW.has(v) && !S.has(matchW.get(v))) { S.add(matchW.get(v)); queue.push(matchW.get(v)); }
      }
      certificate = { type:'hall', S:[...S], N:[...N] };
    }
  }
  return { tileable, pairs, black:black.length, white:white.length, certificate };
}
export function preset(name, rows=8, cols=8) {
  if (name === 'corners') return board(8,8,[0,63]);
  if (name === 'balanced') return board(4,4,Array.from({length:16},(_,i)=>i).filter(i=>![0,2,11,14].includes(i)));
  if (name === 'bottleneck') return board(4,4,Array.from({length:16},(_,i)=>i).filter(i=>![2,4,5,6,7,9].includes(i)));
  if (name === 'odd') return board(3,3);
  if (name === 'empty') return board(2,2,[0,1,2,3]);
  return board(rows,cols);
}
