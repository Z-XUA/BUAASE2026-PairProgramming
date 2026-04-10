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

// 判断最后一步是否是待选择状态
function isChoiceModeLast(last: string): bool {
  if (last.length < 2) return false;
  const c0 = last.charCodeAt(0);
  if (c0 != 51 && c0 != 52) return false;
  return last.indexOf("-") < 0;
}

// 从 1密约 / 2取舍 推断行动者是谁
function actorFrom12(token: string, me: i32): i32 {
  const c0 = token.charCodeAt(0);
  
  // 1密约
  if (c0 == 49) {
    if (token == "1X") return 1 - me;
    return me;
  }
  
  // 2取舍
  if (c0 == 50) {
    if (token.length >= 3 && token.charCodeAt(1) == 88 && token.charCodeAt(2) == 88) return 1 - me;
    return me;
  }

  return -1;
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

// 回顾历史，判断目前的状态是否是合理的
function replayComplete(tokens: Array<string>, me: i32, startPlayer: i32): bool {
  let active = startPlayer;
  for (let ti: i32 = 0; ti < tokens.length; ti++) {
    const t = tokens[ti];
    const c0 = t.charCodeAt(0);

    if (c0 == 49 || c0 == 50) {
      const actor = actorFrom12(t, me);
      if (actor != active) return false;
      active = 1 - actor;
      continue;
    }

    if (c0 == 51) {
      if (t.indexOf("-") < 0) return false;
      const dash = t.indexOf("-");
      const offer = t.slice(1, dash);
      const choice = t.slice(dash + 1);
      if (offer.length != 3 || choice.length != 1) return false;
      const provider = active;
      const chooser = 1 - provider;
      if (offer.indexOf(choice) < 0) return false;
      active = chooser;
      continue;
    }

    if (c0 == 52) {
      if (t.indexOf("-") < 0) return false;
      const dash = t.indexOf("-");
      const four = t.slice(1, dash);
      const pick = t.slice(dash + 1);
      if (four.length != 4 || pick.length != 2) return false;
      const left = four.slice(0, 2);
      const right = four.slice(2, 4);
      const provider = active;
      if (!sameMultiset2(pick, left) && !sameMultiset2(pick, right)) return false;
      active = 1 - provider;
      continue;
    }

    return false;
  }

  return true;
}

// 从历史第一条判断谁是先手
function inferStartPlayer(tokens: Array<string>, me: i32): i32 {
  if (tokens.length == 0) return 0;
  const first = tokens[0];
  const c0 = first.charCodeAt(0);

  if (c0 == 49) {
    if (first == "1X") return 1 - me;
    return me;
  }

  if (c0 == 50) {
    if (first.length >= 3 && first.charCodeAt(1) == 88 && first.charCodeAt(2) == 88) return 1 - me;
    return me;
  }

  if (c0 == 51 || c0 == 52) {
    if (first.indexOf("-") < 0) return 1 - me;
    return me;
  }

  return 0;
}

// 统计自己已经用过哪些行动
function usedByMe(tokens: Array<string>, me: i32, startPlayer: i32): StaticArray<bool> {
  const u = new StaticArray<bool>(4);
  u[0] = false;
  u[1] = false;
  u[2] = false;
  u[3] = false;

  let active = startPlayer;

  for (let ti: i32 = 0; ti < tokens.length; ti++) {
    const t = tokens[ti];
    const c0 = t.charCodeAt(0);

    if (c0 == 49 || c0 == 50) {
      const actor = actorFrom12(t, me);
      if (actor == me) {
        if (c0 == 49) u[0] = true;
        else u[1] = true;
      }
      active = 1 - actor;
      continue;
    }

    if (c0 == 51) {
      if (active == me) u[2] = true;
      active = 1 - active;
      continue;
    }

     if (c0 == 52) {
      if (active == me) u[3] = true;
      active = 1 - active;
      continue;
    }
  }

  return u;
}

// 记录标记分值
function scoreId(id: i32): i32 {
  if (id < 0 || id > 6) return 0;
  if (id <= 2) return 2;
  if (id <= 4) return 3;
  if (id == 5) return 4;
  return 5;
}

function charId(ch: string): i32 {
  const c = ch.charCodeAt(0);
  if (c < 65 || c > 71) return -1;
  return c - 65;
}

// 某花色上我方落后或平局时，提高出该花色牌的权重！！进行战斗
function boardWeightForCard(id: i32, board: Int8Array): i32 {
  if (id < 0 || id > 6) return 0;
  const b = board[id];
  if (b <= 0) return 3;
  return 2;
}

// 减少出牌偶然性，相同分值情况下用字典序判断
function lexLess(a: string, b: string): bool {
  if (a.length != b.length) return a.length < b.length;
  for (let i: i32 = 0; i < a.length; i++) {
    const ca = a.charCodeAt(i);
    const cb = b.charCodeAt(i);
    if (ca != cb) return ca < cb;
  }
  return false;
}

// 选对手行动 3 中分值最高的一张
function choiceReply3(offer: string, board: Int8Array): string {
  let bestCh = offer.slice(0, 1);
  let bestId = charId(bestCh);
  let bestSc: i32 = scoreId(bestId) * boardWeightForCard(bestId, board);

  for (let i: i32 = 1; i < offer.length; i++) {
    const ch = offer.slice(i, i + 1);
    const id = charId(ch);
    const sc: i32 = scoreId(id) * boardWeightForCard(id, board);

    if (sc > bestSc || (sc == bestSc && lexLess(ch, bestCh))) {
      bestSc = sc;
      bestCh = ch;
    }
  }
  return `-${bestCh}`;
}

// 选对手行动 4 中分值最高的一组
function choiceReply4(four: string, board: Int8Array): string {
  const g0 = four.slice(0, 2);
  const g1 = four.slice(2, 4);

  let s0: i32 = 0;
  let s1: i32 = 0;
  for (let i: i32 = 0; i < 2; i++) {
    const id0 = charId(g0.slice(i, i + 1));
    const id1 = charId(g1.slice(i, i + 1));
    s0 += scoreId(id0) * boardWeightForCard(id0, board);
    s1 += scoreId(id1) * boardWeightForCard(id1, board);
  }

  if (s1 > s0 || (s1 == s0 && lexLess(g1, g0))) {
    return `-${g1}`;
  }
  return `-${g0}`;
}

function max2(a: i32, b: i32): i32 {
  return a > b ? a : b;
}

function min2(a: i32, b: i32): i32 {
  return a < b ? a : b;
}

// 枚举大法！枚举所有未使用行动类型与合法牌组合
function buildNormalAction(used: StaticArray<bool>, cards: string, board: Int8Array): string {
  const n = cards.length;
  let bestOut = "1A";
  let bestScore: i32 = -2147483647;

  if (!used[0] && n >= 1) {
    for (let i: i32 = 0; i < n; i++) {
      const ch = cards.slice(i, i + 1);
      const id = charId(ch);
      const sw = scoreId(id) * boardWeightForCard(id, board);
      const t: i32 = sw * 5;
      const body = `1${ch}`;
      if (t > bestScore || (t == bestScore && lexLess(body, bestOut))) {
        bestScore = t;
        bestOut = body;
      }
    }
  }

  if (!used[1] && n >= 2) {
    for (let i: i32 = 0; i < n; i++) {
      for (let j: i32 = i + 1; j < n; j++) {
        const a = cards.slice(i, i + 1);
        const b = cards.slice(j, j + 1);
        const ida = charId(a);
        const idb = charId(b);
        const sum = scoreId(ida) * boardWeightForCard(ida, board) + scoreId(idb) * boardWeightForCard(idb, board);
        const t: i32 = 500 - sum * 8;
        let body = `2${a}${b}`;
        if (lexLess(b, a)) body = `2${b}${a}`;
        if (t > bestScore || (t == bestScore && lexLess(body, bestOut))) {
          bestScore = t;
          bestOut = body;
        }
      }
    }
  }

  if (!used[2] && n >= 3) {
    for (let i: i32 = 0; i < n; i++) {
      for (let j: i32 = i + 1; j < n; j++) {
        for (let k: i32 = j + 1; k < n; k++) {
          const c0 = cards.slice(i, i + 1);
          const c1 = cards.slice(j, j + 1);
          const c2 = cards.slice(k, k + 1);
          const id0 = charId(c0);
          const id1 = charId(c1);
          const id2 = charId(c2);
          const s0 = scoreId(id0) * boardWeightForCard(id0, board);
          const s1 = scoreId(id1) * boardWeightForCard(id1, board);
          const s2 = scoreId(id2) * boardWeightForCard(id2, board);
          const mx = max2(max2(s0, s1), s2);
          const sum3 = s0 + s1 + s2;
          const t: i32 = (sum3 - mx) * 6;
          let body = `3${c0}${c1}${c2}`;
          const alt1 = `3${c0}${c2}${c1}`;
          const alt2 = `3${c1}${c0}${c2}`;
          const alt3 = `3${c1}${c2}${c0}`;
          const alt4 = `3${c2}${c0}${c1}`;
          const alt5 = `3${c2}${c1}${c0}`;
          if (lexLess(alt1, body)) body = alt1;
          if (lexLess(alt2, body)) body = alt2;
          if (lexLess(alt3, body)) body = alt3;
          if (lexLess(alt4, body)) body = alt4;
          if (lexLess(alt5, body)) body = alt5;
          if (t > bestScore || (t == bestScore && lexLess(body, bestOut))) {
            bestScore = t;
            bestOut = body;
          }
        }
      }
    }
  }

  if (!used[3] && n >= 4) {
    for (let i: i32 = 0; i < n; i++) {
      for (let j: i32 = i + 1; j < n; j++) {
        for (let k: i32 = j + 1; k < n; k++) {
          for (let l: i32 = k + 1; l < n; l++) {
            const c0 = cards.slice(i, i + 1);
            const c1 = cards.slice(j, j + 1);
            const c2 = cards.slice(k, k + 1);
            const c3 = cards.slice(l, l + 1);
            const id0 = charId(c0);
            const id1 = charId(c1);
            const id2 = charId(c2);
            const id3 = charId(c3);
            const w0 = scoreId(id0) * boardWeightForCard(id0, board);
            const w1 = scoreId(id1) * boardWeightForCard(id1, board);
            const w2 = scoreId(id2) * boardWeightForCard(id2, board);
            const w3 = scoreId(id3) * boardWeightForCard(id3, board);
            const p01 = w0 + w1;
            const p23 = w2 + w3;
            const p02 = w0 + w2;
            const p13 = w1 + w3;
            const p03 = w0 + w3;
            const p12 = w1 + w2;
            let t: i32 = min2(p01, p23) * 7;
            let left = `${c0}${c1}`;
            let right = `${c2}${c3}`;
            if (lexLess(c1, c0)) left = `${c1}${c0}`;
            if (lexLess(c3, c2)) right = `${c3}${c2}`;
            let body = `4${left}${right}`;
            const t1 = min2(p02, p13) * 7;
            let l1 = `${c0}${c2}`;
            let r1 = `${c1}${c3}`;
            if (lexLess(c2, c0)) l1 = `${c2}${c0}`;
            if (lexLess(c3, c1)) r1 = `${c3}${c1}`;
            const b1 = `4${l1}${r1}`;
            if (t1 > t || (t1 == t && lexLess(b1, body))) {
              t = t1;
              body = b1;
            }
            const t2 = min2(p03, p12) * 7;
            let l2 = `${c0}${c3}`;
            let r2 = `${c1}${c2}`;
            if (lexLess(c3, c0)) l2 = `${c3}${c0}`;
            if (lexLess(c2, c1)) r2 = `${c2}${c1}`;
            const b2 = `4${l2}${r2}`;
            if (t2 > t || (t2 == t && lexLess(b2, body))) {
              t = t2;
              body = b2;
            }
            if (t > bestScore || (t == bestScore && lexLess(body, bestOut))) {
              bestScore = t;
              bestOut = body;
            }
          }
        }
      }
    }
  }

  return bestOut;
}

function choiceReply(last: string, board: Int8Array): string {
  const c0 = last.charCodeAt(0);
  if (c0 == 51) {
    const offer = last.slice(1);
    return choiceReply3(offer, board);
  }
  const four = last.slice(1);
  return choiceReply4(four, board);
}

export function hanamikoji_action(history: string, cards: string, board: Int8Array): string {
  const tokens = splitBySpace(history);
  let last = "";
  if (tokens.length > 0) last = tokens[tokens.length - 1];

  // 如果是待选择状态，直接回复选择
  if (tokens.length > 0 && isChoiceModeLast(last)) {
    return choiceReply(last, board);
  }

  let complete = tokens;
  if (tokens.length == 0) {
    complete = new Array<string>();
  }

  // 推断身份与先手玩家
  let me: i32 = 0;
  let start: i32 = 0;
  let ok = false;

  for (let m: i32 = 0; m < 2; m++) {
    const sp = inferStartPlayer(complete, m);
    for (let s: i32 = 0; s < 2; s++) {
      const cand = s == 0 ? sp : 1 - sp;
      if (replayComplete(complete, m, cand)) {
        me = m;
        start = cand;
        ok = true;
        break;
      }
    }
    if (ok) break;
  }

  if (!ok) {
    me = 0;
    start = 0;
  }

  const used = usedByMe(complete, me, start);
  
  return buildNormalAction(used, cards, board);
}
