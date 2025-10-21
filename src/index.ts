export type Tile =
  | {
      type: "single";
      tile: string;
    }
  | {
      type: "chi";
      tiles: string[];
    }
  | {
      type: "peng";
      pos: number;
      tiles: string[];
    }
  | {
      type: "da-ming-gang";
      pos: number;
      tiles: string[];
    }
  | {
      type: "jia-gang";
      pos: number;
      tiles: string[];
    }
  | {
      type: "an-gang";
      tiles: string[];
    }
  | {
      type: "spacer";
    };

const AN_GANG_REGEX = /^(\d{4})\+([mpsz])$/;
const JIA_GANG_REGEX = /^(\d{1,3})=(\d{1,3})([mpsz])$/;
const DA_MING_GANG_REGEX = /^(\d{1,3})-(\d{1,3})([mpsz])$/;
const CHI_PENG_REGEX = /^(\d{1,3})-(\d{0,2})([mpsz])$/;

function parseAnGang(block: string): Tile | null {
  const meld = parseMeld(block, AN_GANG_REGEX, 4, "an-gang");
  if (!meld) return null;

  // biome-ignore lint/style/noNonNullAssertion: already checked
  const anGangMatch = block.match(AN_GANG_REGEX)!;

  const fourDigits = anGangMatch[1];
  const suit = anGangMatch[2];
  const tile2 = `${fourDigits[1]}${suit}`;
  const tile3 = `${fourDigits[2]}${suit}`;

  return {
    type: "an-gang",
    tiles: ["0x", tile2, tile3, "0x"],
  };
}

function parseMeld(
  block: string,
  regex: RegExp,
  expectedLength: 3 | 4,
  type: "jia-gang" | "da-ming-gang" | "peng" | "an-gang",
): Extract<Tile, { pos: number }> | null {
  const match = block.match(regex);
  if (!match) {
    return null;
  }

  const part1 = match[1];
  const part2 = match.length === 4 ? match[2] : "";
  const suit = match.length === 4 ? match[3] : match[2];

  if (part1.length + part2.length !== expectedLength) {
    return null;
  }

  const pos = part1.length - 1;
  const allDigits =
    type === "an-gang" ? part1.split("") : (part1 + part2).split("");
  const tiles = allDigits.map((digit) => `${digit}${suit}`);

  // 字牌(z)の場合、8, 9, 0 は無効
  if (suit === "z") {
    const hasInvalidHonorTile = allDigits.some((d) =>
      ["8", "9", "0"].includes(d),
    );
    if (hasInvalidHonorTile) {
      return null;
    }
  }

  const numericValues = allDigits.map((d) => (d === "0" ? 5 : parseInt(d, 10)));
  const firstValue = numericValues[0];
  const allSame = numericValues.every((v) => v === firstValue);

  if (!allSame) {
    return null;
  }

  return { type, pos, tiles } as Extract<Tile, { pos: number }>;
}

const parseJiaGang = (block: string) =>
  parseMeld(block, JIA_GANG_REGEX, 4, "jia-gang");
const parseDaMingGang = (block: string) =>
  parseMeld(block, DA_MING_GANG_REGEX, 4, "da-ming-gang");
const parsePeng = (block: string) =>
  parseMeld(block, CHI_PENG_REGEX, 3, "peng");

function parseChi(block: string): Tile | null {
  const chiMatch = block.match(CHI_PENG_REGEX);
  if (!chiMatch) {
    return null;
  }

  const part1 = chiMatch[1];
  const part2 = chiMatch[2];
  const suit = chiMatch[3];

  if (suit === "z") {
    return null;
  }

  if (part1.length + part2.length !== 3) {
    return null;
  }

  const allDigits = (part1 + part2).split("");

  const numericValues = allDigits.map((d) => (d === "0" ? 5 : parseInt(d, 10)));
  numericValues.sort((a, b) => a - b);
  const isConsecutive =
    numericValues[1] === numericValues[0] + 1 &&
    numericValues[2] === numericValues[1] + 1;

  if (!isConsecutive) {
    return null;
  }

  const calledDigit = part1.slice(-1);

  const calledIndex = allDigits.indexOf(calledDigit);
  const [called] = allDigits.splice(calledIndex, 1);
  allDigits.sort();
  const orderedDigits = [called, ...allDigits];

  const tiles = orderedDigits.map((digit) => `${digit}${suit}`);

  return { type: "chi", tiles };
}

/**
 * Parses a string representing Mahjong tiles and melds into an array of Tile objects.
 *
 * The string format uses a compact notation:
 * - Simple tiles: Digits followed by a suit character (e.g., "123m").
 * - Suits: 'm' (manzi), 'p' (pinzi), 's' (sozi), 'z' (zipai).
 * - Red fives: Represented by the digit '0'.
 * - Melds (Fulu):
 *   - Chi: "2-34m" (2m was called to complete the 2-3-4 sequence).
 *   - Peng: "22-2m" (a 2m was called from the player opposite).
 *   - Da-ming-gang: "33-33m".
 *   - Jia-gang: "222=2m".
 *   - An-gang: "1111+m".
 * - Sections: Commas (`,`) separate groups of tiles, represented as `null` in the output array.
 *
 * @param str The string to parse, representing tiles and melds.
 * @returns An array of `Tile` objects, which can be a string for a tile, a Fulu object for a meld, or `null` for a section separator.
 * @example
 * // Returns ["1m", "2m", { type: "chi", tiles: ["3p", "4p", "5p"] }, null, { type: "an-gang", tiles: ["0x", "1z", "1z", "0x"] }]
 * parse("12m3-45p,1111+z")
 */
export default function parse(str: string): Tile[] {
  const parsers = [
    parseAnGang,
    parseJiaGang,
    parseDaMingGang,
    parseChi,
    parsePeng,
  ];

  const parsed: Tile[] = [];
  const sections = str.split(",");
  for (const section of sections) {
    const blocks = section.split(/(?<=[mpszx])/).filter(Boolean);
    for (const block of blocks) {
      let fulu: Tile | null = null;
      for (const parser of parsers) {
        fulu = parser(block);
        if (fulu) break;
      }

      if (fulu) {
        parsed.push(fulu);
      } else if (!/[-=+]/.test(block)) {
        const suit = block.slice(-1);
        const digits = block.slice(0, -1);
        const tiles = digits
          .split("")
          .map((digit): Tile => ({ type: "single", tile: `${digit}${suit}` }));
        parsed.push(...tiles);
      }
    }
    parsed.push({ type: "spacer" });
  }
  parsed.pop();

  return parsed;
}
