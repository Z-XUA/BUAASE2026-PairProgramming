// 记录标记分数
function tokenValue(index: i32): i32 {
  if (index < 3) return 2;
  if (index < 5) return 3;
  if (index == 5) return 4;
  return 5;
}

// 记录优先级
function tierPriority(index: i32): i32 {
  if (index == 6) return 3;
  if (index == 5) return 2;
  if (index == 3 || index == 4) return 1;
  return 0;
}

// 胜负判定
export function hanamikoji_judge(board: Int8Array, round: i32): i32 {
  let myScore: i32 = 0;
  let oppScore: i32 = 0;
  let myCnt: i32 = 0;
  let oppCnt: i32 = 0;
  let myBestTier: i32 = -1;
  let oppBestTier: i32 = -1;

  for (let i: i32 = 0; i < 7; i++) {
    const s = board[i];
    if (s == 1) {
      myCnt++;
      myScore += tokenValue(i);
      const p = tierPriority(i);
      if (p > myBestTier) myBestTier = p;
    } else if (s == -1) {
      oppCnt++;
      oppScore += tokenValue(i);
      const p = tierPriority(i);
      if (p > oppBestTier) oppBestTier = p;
    }
  }

  // 任意小局
  // 某一方获得的倾心标记总分值达到或超过 11 分
  if (myScore >= 11) return 1;
  if (oppScore >= 11) return -1;

  // 某一方获得的倾心标记数量达到或超过 4 枚，且另一方没有达到 11 分
  if (myCnt >= 4 && oppScore < 11) return 1;
  if (oppCnt >= 4 && myScore < 11) return -1;

  // 还没到第3小局
  // 游戏尚未结束，应继续进入下一小轮
  if (round < 3) return 0;

  // 第3小局
  // 总分更高者获胜
  if (myScore > oppScore) return 1;
  if (oppScore > myScore) return -1;
  // 优先级更高的获胜
  if (myBestTier > oppBestTier) return 1;
  if (oppBestTier > myBestTier) return -1;
  // 平局
  return 2;
}
