import assert from "node:assert/strict";
import { it } from "node:test";
import { hanamikoji_action } from "../build/release.js";

function board7(arr) {
  return Int8Array.from(arr);
}

it("空历史：返回以 1/2/3/4 开头的合法行动字符串", () => {
  const b = board7([0, 0, 0, 0, 0, 0, 0]);
  const a = hanamikoji_action("", "ABCDEFG", b);
  assert.match(a, /^[1234]/);
  assert.ok(a.length >= 2);
});

it("需响应对手赠予：返回 -X 形式且 X 在展示牌中", () => {
  const b = board7([0, 0, 0, 0, 0, 0, 0]);
  const a = hanamikoji_action("3ABC", "", b);
  assert.match(a, /^-[A-G]$/);
  assert.ok("ABC".includes(a.charAt(1)));
});

it("需响应对手对决：返回 -XY 且与某一组 multiset 一致", () => {
  const b = board7([0, 0, 0, 0, 0, 0, 0]);
  const a = hanamikoji_action("4ABCD", "", b);
  assert.match(a, /^-[A-G]{2}$/);
  const pick = a.slice(1);
  const g0 = "AB";
  const g1 = "CD";
  const same = (p, g) =>
    (p[0] === g[0] && p[1] === g[1]) || (p[0] === g[1] && p[1] === g[0]);
  assert.ok(same(pick, g0) || same(pick, g1));
});

it("已行动后：输出仍合法且使用当前手牌字母", () => {
  const b = board7([0, 0, 0, 0, 0, 0, 0]);
  const hand = "BCDEFG";
  const a = hanamikoji_action("1A", hand, b);
  assert.match(a, /^[1234]/);
  const body = a.slice(1).split("-")[0];
  for (const ch of body) {
    assert.ok(hand.includes(ch), `手牌中应包含 ${ch}`);
  }
});
