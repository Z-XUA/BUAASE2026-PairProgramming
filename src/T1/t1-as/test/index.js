import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hanamikoji_judge } from "../build/release.js";

function j(board, round) {
  return hanamikoji_judge(Int8Array.from(board), round);
}

describe("hanamikoji_judge test", () => {
  it("一方分值达到 11 分而获胜", () => {
    assert.equal(j([0, 0, 0, 0, 1, 1, 1], 1), 1);
    assert.equal(j([-1, -1, 0, -1, 0, -1, 0], 2), -1);
  });

  it("一方获得至少 4 枚倾心标记且对方总分未达到 11 则获胜", () => {
    assert.equal(j([1, 1, 1, 0, 0, 1, 0], 2), 1);
  });

  it("前两小轮结束时尚未满足胜利条件，应返回 0", () => {
    assert.equal(j([1, 0, 0, 0, 0, 0, 0], 1), 0);
    assert.equal(j([1, 1, 0, 0, 0, 0, 0], 2), 0);
  });

  it("第三小轮结束时，总分不同，由总分高者获胜", () => {
    assert.equal(j([1, 1, 0, 0, 0, 0, 0], 3), 1);
    assert.equal(j([-1, -1, 0, 0, 0, 0, 0], 3), -1);
  });

  it("第三小轮结束时，总分相同，由最高档位倾心标记判定胜负", () => {
    assert.equal(j([1, 1, 0, 0, 0, -1, 0], 3), -1);
    assert.equal(j([-1, -1, 0, 0, 0, 1, 0], 3), 1);
  });

  it("第三小轮结束时平局，应返回 2", () => {
    assert.equal(j([1, -1, 0, -1, 1, 0, 0], 3), 2);
  });

  describe("补充：边界与非法输入", () => {
    it("board 取值范围：非 1/-1/0 时视为中立", () => {
      assert.equal(j([2, 0, 0, 0, 0, 0, 0], 1), 0);
      assert.equal(j([2, 2, 2, 2, 2, 2, 2], 3), 2);
    });

    it("round 取值范围：<3 视为未终局；≥3 视为终局判定）", () => {
      assert.equal(j([1, 0, 0, 0, 0, 0, 0], 0), 0);
      assert.equal(j([1, 1, 0, 0, 0, 0, 0], 4), 1);
    });

    it("board 长度不足 7：Wasm 访问越界会抛错", () => {
      assert.throws(() => hanamikoji_judge(new Int8Array(3), 1));
    });
  });
});
