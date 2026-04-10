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

// 

// 统计A-G的出现次数
function countLetters(s: string): StaticArray<i32> {
  const c = new StaticArray<i32>(7);
  for (let i: i32 = 0; i < 7; i++) c[i] = 0;
  for (let i: i32 = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    if (ch >= 65 && ch <= 71) {
      c[ch - 65]++;
    }
  }
  return c;
}

// 取出需要数量的最小的牌
function takeSmallest(c: StaticArray<i32>, need: i32): string {
  let out = "";
  let left = need;

  for (let id: i32 = 0; id < 7 && left > 0; id++) {
    while (c[id] > 0 && left > 0) {
      const ch = String.fromCharCode(65 + id);
      out += ch;
      c[id]--;
      left--;
    }
  }
  return out;
}

// 固定：按照 1-2-3-4 尝试行动；优先用没用过的最小牌
function buildNormalAction(used: StaticArray<bool>, cards: string): string {
  const cnt = countLetters(cards);
  for (let ty: i32 = 1; ty <= 4; ty++) {
    const ui = ty - 1;
    // 用过则跳过
    if (used[ui]) continue;

    let need: i32 = ty;
    let sum: i32 = 0;
    for (let i: i32 = 0; i < 7; i++) sum += cnt[i];
    // 牌不足则跳过
    if (sum < need) continue;

    // 取出最小牌
    const c2 = new StaticArray<i32>(7);
    for (let i: i32 = 0; i < 7; i++) c2[i] = cnt[i];
    const body = takeSmallest(c2, need);

    if (body.length != need) continue;
    return `${ty}${body}`;
  }
  return "1A";
}

// 回复对手的 3赠送 / 4竞争：简单选择第一张/组
function choiceReply(last: string): string {
  const c0 = last.charCodeAt(0);
  
  // 3赠送：选第一张
  if (c0 == 51) {
    const offer = last.slice(1);
    const ch = offer.slice(0, 1);
    return `-${ch}`;
  }

  // 4竞争：选第一组
  const four = last.slice(1);
  const g0 = four.slice(0, 2);
  return `-${g0}`;
}

export function hanamikoji_action(history: string, cards: string, board: Int8Array): string {
  const tokens = splitBySpace(history);
  let last = "";
  if (tokens.length > 0) last = tokens[tokens.length - 1];

  // 如果是待选择状态，直接回复选择
  if (tokens.length > 0 && isChoiceModeLast(last)) {
    return choiceReply(last);
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
  
  return buildNormalAction(used, cards);
}
