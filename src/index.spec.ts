import { describe, expect, test } from "vitest";
import parse from "./index.ts";

describe("parse", () => {
  test("単純な牌を解析できる", () => {
    expect(parse("123m456p789s1234567z")).toEqual([
      { type: "single", tile: "1m" },
      { type: "single", tile: "2m" },
      { type: "single", tile: "3m" },
      { type: "single", tile: "4p" },
      { type: "single", tile: "5p" },
      { type: "single", tile: "6p" },
      { type: "single", tile: "7s" },
      { type: "single", tile: "8s" },
      { type: "single", tile: "9s" },
      { type: "single", tile: "1z" },
      { type: "single", tile: "2z" },
      { type: "single", tile: "3z" },
      { type: "single", tile: "4z" },
      { type: "single", tile: "5z" },
      { type: "single", tile: "6z" },
      { type: "single", tile: "7z" },
    ]);
  });

  test("様々な位置で鳴かれたチーを解析できる", () => {
    // 鳴いた牌が一番小さい
    expect(parse("2-34m")).toEqual([
      { type: "chi", tiles: ["2m", "3m", "4m"] },
    ]);
    // 鳴いた牌が真ん中
    expect(parse("3-24m")).toEqual([
      { type: "chi", tiles: ["3m", "2m", "4m"] },
    ]);
    // 鳴いた牌が一番大きい
    expect(parse("4-23m")).toEqual([
      { type: "chi", tiles: ["4m", "2m", "3m"] },
    ]);
  });

  test("様々な位置で鳴かれたポンを解析できる", () => {
    // 上家から鳴いた
    expect(parse("2-22m")).toEqual([
      { type: "peng", pos: 0, tiles: ["2m", "2m", "2m"] },
    ]);
    // 対面から鳴いた
    expect(parse("22-2m")).toEqual([
      { type: "peng", pos: 1, tiles: ["2m", "2m", "2m"] },
    ]);
    // 下家から鳴いた
    expect(parse("222-m")).toEqual([
      { type: "peng", pos: 2, tiles: ["2m", "2m", "2m"] },
    ]);
  });

  test("大明槓を解析できる", () => {
    expect(parse("33-33m")).toEqual([
      { type: "da-ming-gang", pos: 1, tiles: ["3m", "3m", "3m", "3m"] },
    ]);
  });

  test("加槓を解析できる", () => {
    expect(parse("222=2m")).toEqual([
      { type: "jia-gang", pos: 2, tiles: ["2m", "2m", "2m", "2m"] },
    ]);
  });

  test("暗槓を解析できる", () => {
    expect(parse("1111+m")).toEqual([
      { type: "an-gang", tiles: ["0x", "1m", "1m", "0x"] },
    ]);
  });

  test("赤ドラを解析できる", () => {
    expect(parse("4-06s")).toEqual([
      { type: "chi", tiles: ["4s", "0s", "6s"] },
    ]);
    expect(parse("50-5p")).toEqual([
      { type: "peng", pos: 1, tiles: ["5p", "0p", "5p"] },
    ]);
    expect(parse("55-05p")).toEqual([
      { type: "da-ming-gang", pos: 1, tiles: ["5p", "5p", "0p", "5p"] },
    ]);
    expect(parse("505=5p")).toEqual([
      { type: "jia-gang", pos: 2, tiles: ["5p", "0p", "5p", "5p"] },
    ]);
    expect(parse("5055+p")).toEqual([
      { type: "an-gang", tiles: ["0x", "0p", "5p", "0x"] },
    ]);
    expect(parse("123m0s5p")).toEqual([
      { type: "single", tile: "1m" },
      { type: "single", tile: "2m" },
      { type: "single", tile: "3m" },
      { type: "single", tile: "0s" },
      { type: "single", tile: "5p" },
    ]);
  });

  test("1セクションに複数のブロックがある場合を解析できる", () => {
    expect(parse("12m1-23p4444+s")).toEqual([
      { type: "single", tile: "1m" },
      { type: "single", tile: "2m" },
      { type: "chi", tiles: ["1p", "2p", "3p"] },
      { type: "an-gang", tiles: ["0x", "4s", "4s", "0x"] },
    ]);
  });

  test("裏牌を解析できる", () => {
    expect(parse("0x")).toEqual([{ type: "single", tile: "0x" }]);
  });

  test("カンマで区切られた複数のセクションを解析できる", () => {
    expect(parse("123m,2-34p,1111+s,11-1z")).toEqual([
      { type: "single", tile: "1m" },
      { type: "single", tile: "2m" },
      { type: "single", tile: "3m" },
      { type: "spacer" },
      { type: "chi", tiles: ["2p", "3p", "4p"] },
      { type: "spacer" },
      { type: "an-gang", tiles: ["0x", "1s", "1s", "0x"] },
      { type: "spacer" },
      { type: "peng", pos: 1, tiles: ["1z", "1z", "1z"] },
    ]);
  });

  test("空文字列の場合は空の配列を返す", () => {
    expect(parse("")).toEqual([]);
  });

  test("不正な形式の面子を無視する", () => {
    // 不正なチー (連続していない)
    expect(parse("2-35m")).toEqual([]);
    // 不正なチー (字牌)
    expect(parse("1-23z")).toEqual([]);
    // 不正なチー (3枚ではない)
    expect(parse("12-34m")).toEqual([]);
    // 不正な暗槓 (4枚ではない)
    expect(parse("111+m")).toEqual([]);
    // 不正な暗槓 (同じ数字ではない)
    expect(parse("1234+m")).toEqual([]);
    // 不正な字牌の数字 (8, 9, 0)
    expect(parse("88-8z")).toEqual([]);
    expect(parse("999-z")).toEqual([]);
    expect(parse("88-88z")).toEqual([]);
    expect(parse("999=9z")).toEqual([]);
    expect(parse("8888+z")).toEqual([]);
    expect(parse("00-0z")).toEqual([]);
  });
});
