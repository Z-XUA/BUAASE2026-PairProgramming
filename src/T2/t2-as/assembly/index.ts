// 统计A-G的出现次数
function countLetters(s: string): Int32Array {
  const c = new Int32Array(7);
  for (let i: i32 = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    if (ch >= 65 && ch <= 71) {
      c[ch - 65]++;
    }
  }
  return c;
}

// 批量给对应玩家加牌
function addToPlayer(player: i32, counts: Int32Array, my: Int32Array, opp: Int32Array): void {
  const arr = player == 0 ? my : opp;
  for (let i: i32 = 0; i < 7; i++) {
    arr[i] += counts[i];
  }
}

// 按照字符串给对应玩家逐个加牌
function addLettersString(player: i32, s: string, my: Int32Array, opp: Int32Array): void {
  for (let i: i32 = 0; i < s.length; i++) {
    const idx = s.charCodeAt(i) - 65;
    if (player == 0) {
      my[idx]++;
    } else {
      opp[idx]++;
    }
  }
}

// 判断两个双字符组合是否等价
function sameMultiset2(a: string, b: string): bool {
  if (a.length != 2 || b.length != 2) return false;
  const c0 = a.charCodeAt(0);
  const c1 = a.charCodeAt(1);
  const d0 = b.charCodeAt(0);
  const d1 = b.charCodeAt(1);
  return (c0 == d0 && c1 == d1) || (c0 == d1 && c1 == d0);
}

// 处理赠送类行动
function applyGift(offers: string, offerer: i32, choice: string, my: Int32Array, opp: Int32Array): void {
  const pickIdx = choice.charCodeAt(0) - 65;
  const picker = 1 - offerer;

  const counts = countLetters(offers);
  counts[pickIdx]--;
  addToPlayer(offerer, counts, my, opp);
  if (picker == 0) {
    my[pickIdx]++;
  } else {
    opp[pickIdx]++;
  }
}

// 处理竞争类行动
function applyContest(cards: string, offerer: i32, choice: string, my: Int32Array, opp: Int32Array): void {
  // 分组：前两张一组，后两张一组
  const g0 = cards.slice(0, 2);
  const g1 = cards.slice(2, 4);

  const picker = 1 - offerer;
  if (sameMultiset2(choice, g0)) {
    addLettersString(picker, g0, my, opp);
    addLettersString(offerer, g1, my, opp);
  } else {
    addLettersString(picker, g1, my, opp);
    addLettersString(offerer, g0, my, opp);
  }
}

// 根据空格切分字符串
function splitBySpace(history: string): Array<string> {
  const result = new Array<string>();
  let start: i32 = 0;
  for (let i: i32 = 0; i <= history.length; i++) {
    const atEnd = i == history.length;
    const isSpace = !atEnd && history.charCodeAt(i) == 32;
    if (atEnd || isSpace) {
      if (i > start) {
        result.push(history.slice(start, i));
      }
      start = i + 1;
    }
  }
  return result;
}

// 单独处理每一条行动
function processSegment(seg: string, player: i32, my: Int32Array, opp: Int32Array): void {
  // 活动类型
  const type = seg.charCodeAt(0) - 48;
  const dash = seg.indexOf("-");

  let body: string;
  let tail: string = "";
  if (dash >= 0) {
    body = seg.slice(1, dash);
    tail = seg.slice(dash + 1);
  } else {
    body = seg.slice(1);
  }

  if (type == 1) {
    addLettersString(player, body, my, opp);
  } else if (type == 2) {
    // 取舍：弃牌，不计入双方区域
  } else if (type == 3) {
    applyGift(body, player, tail, my, opp);
  } else if (type == 4) {
    applyContest(body, player, tail, my, opp);
  }
}

export function calc_current_state(history: string, board: Int8Array): Int32Array {
  const my = new Int32Array(7);
  const opp = new Int32Array(7);

  // 处理输入
  const segments = splitBySpace(history);
  for (let si: i32 = 0; si < segments.length; si++) {
    const seg = segments[si];
    const player = si % 2;
    processSegment(seg, player, my, opp);
  }

  // 输出
  const out = new Int32Array(21);
  for (let i: i32 = 0; i < 7; i++) {
    out[i] = my[i];
    out[i + 7] = opp[i];
  }
  for (let i: i32 = 0; i < 7; i++) {
    if (my[i] > opp[i]) {
      out[i + 14] = 1;
    } else if (opp[i] > my[i]) {
      out[i + 14] = -1;
    } else {
      out[i + 14] = board[i];
    }
  }
  return out;
}
