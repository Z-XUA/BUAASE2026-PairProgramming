import assert from "node:assert/strict";
import { it } from "node:test";
import { calc_current_state } from "../build/release.js";

function board7(arr) {
  return Int8Array.from(arr);
}

it("空历史：双方场上为 0，标记沿用传入 board", () => {
  const b = board7([1, 0, -1, 0, 0, 0, 0]);
  const out = calc_current_state("", b);
  assert.equal(out.length, 21);
  for (let i = 0; i < 7; i++) {
    assert.equal(out[i], 0);
    assert.equal(out[i + 7], 0);
    assert.equal(out[i + 14], b[i]);
  }
});

it("密约交替：双方各打一张，花色计数与胜负标记正确", () => {
  const b = board7([0, 0, 0, 0, 0, 0, 0]);
  const out = calc_current_state("1A 1B", b);
  assert.equal(out[0], 1);
  assert.equal(out[1], 0);
  assert.equal(out[7], 0);
  assert.equal(out[8], 1);
  assert.equal(out[14], 1);
  assert.equal(out[15], -1);
});

it("取舍不计入场上：对手弃牌不改变双方区域牌数", () => {
  const b = board7([0, 0, 0, 0, 0, 0, 0]);
  const out = calc_current_state("1A 2BC", b);
  assert.equal(out[0], 1);
  assert.equal(out[1], 0);
  assert.equal(out[2], 0);
  for (let i = 0; i < 7; i++) assert.equal(out[i + 7], 0);
  assert.equal(out[14], 1);
});

it("赠予 3 选 1：对手拿所选，其余归己方", () => {
  const b = board7([0, 0, 0, 0, 0, 0, 0]);
  const out = calc_current_state("3ABC-A", b);
  assert.equal(out[0], 0);
  assert.equal(out[1], 1);
  assert.equal(out[2], 1);
  assert.equal(out[7], 1);
  assert.equal(out[8], 0);
  assert.equal(out[9], 0);
  assert.equal(out[14], -1);
  assert.equal(out[15], 1);
  assert.equal(out[16], 1);
});

it("对决 4 选 2：按选择分配两组", () => {
  const b = board7([0, 0, 0, 0, 0, 0, 0]);
  const out = calc_current_state("4ABCD-AB", b);
  assert.equal(out[0], 0);
  assert.equal(out[1], 0);
  assert.equal(out[2], 1);
  assert.equal(out[3], 1);
  assert.equal(out[7], 1);
  assert.equal(out[8], 1);
  assert.equal(out[9], 0);
  assert.equal(out[10], 0);
});

it("同分花色沿用回合前 board 中的标记", () => {
  const b = board7([0, 1, 0, 0, 0, 0, 0]);
  const out = calc_current_state("1A 1A", b);
  assert.equal(out[0], 1);
  assert.equal(out[7], 1);
  assert.equal(out[14], b[0]);
});
