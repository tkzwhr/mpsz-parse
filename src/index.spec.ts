import { describe, expect, test } from "vitest";
import { parse } from "./index.ts";

describe("parse", () => {
  test("should parse simple tiles", () => {
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

  test("should parse chi (chow) with different call positions", () => {
    // Called tile is the smallest
    expect(parse("2-34m")).toEqual([
      { type: "chi", tiles: ["2m", "3m", "4m"] },
    ]);
    // Called tile is in the middle
    expect(parse("3-24m")).toEqual([
      { type: "chi", tiles: ["3m", "2m", "4m"] },
    ]);
    // Called tile is the largest
    expect(parse("4-23m")).toEqual([
      { type: "chi", tiles: ["4m", "2m", "3m"] },
    ]);
  });

  test("should parse peng (pung) with different call positions", () => {
    // Called from opponent on your left
    expect(parse("2-22m")).toEqual([
      { type: "peng", pos: 0, tiles: ["2m", "2m", "2m"] },
    ]);
    // Called from opponent in front of you
    expect(parse("22-2m")).toEqual([
      { type: "peng", pos: 1, tiles: ["2m", "2m", "2m"] },
    ]);
    // Called from opponent on your right
    expect(parse("222-m")).toEqual([
      { type: "peng", pos: 2, tiles: ["2m", "2m", "2m"] },
    ]);
  });

  test("should parse da-ming-gang (open kong)", () => {
    expect(parse("33-33m")).toEqual([
      { type: "da-ming-gang", pos: 1, tiles: ["3m", "3m", "3m", "3m"] },
    ]);
  });

  test("should parse jia-gang (added kong)", () => {
    expect(parse("222=2m")).toEqual([
      { type: "jia-gang", pos: 2, tiles: ["2m", "2m", "2m", "2m"] },
    ]);
  });

  test("should parse an-gang (concealed kong)", () => {
    expect(parse("1111+m")).toEqual([
      { type: "an-gang", tiles: ["0x", "1m", "1m", "0x"] },
    ]);
  });

  test("should parse red fives (aka dora)", () => {
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

  test("should parse multiple blocks in one section", () => {
    expect(parse("12m1-23p4444+s")).toEqual([
      { type: "single", tile: "1m" },
      { type: "single", tile: "2m" },
      { type: "chi", tiles: ["1p", "2p", "3p"] },
      { type: "an-gang", tiles: ["0x", "4s", "4s", "0x"] },
    ]);
  });

  test("should handle 'x' as a suit specifier in splits", () => {
    expect(parse("1x2m")).toEqual([
      { type: "single", tile: "1x" },
      { type: "single", tile: "2m" },
    ]);
  });

  test("should parse multiple sections separated by commas", () => {
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

  test("should return empty array for empty string", () => {
    expect(parse("")).toEqual([]);
  });

  test("should ignore malformed meld strings", () => {
    // Invalid chi (not consecutive)
    expect(parse("2-35m")).toEqual([]);
    // Invalid chi (honor tiles)
    expect(parse("1-23z")).toEqual([]);
    // Malformed chi (not 3 digits)
    expect(parse("12-34m")).toEqual([]);
    // Malformed an-gang (not 4 digits)
    expect(parse("111+m")).toEqual([]);
    // Malformed an-gang (not same digits)
    expect(parse("1234+m")).toEqual([]);
  });
});
