mpsz-parse
==

This is a parser of mahjong MPSZ format.

## Installation

```shell
npm install @tkzwhr/mpsz-parse
```

## Usage

```typescript
import parse from '@tkzwhr/mpsz-parse';

const pais = parse('123m');
// pais = [ { type: 'single', tile: '1m' }, { type: 'single', tile: '2m' }, { type: 'single', tile: '3m' } ];
```

## API

### parse(str: string): Pai[]

Parses an MPSZ format string into an array of tile objects.

- **str**: The MPSZ format string to parse.
- **returns**: An array of parsed `Pai` objects. A `Pai` can be an object representing a single tile, a meld (Chi, Peng, Kan, etc.), or a spacer.

## Format specification

Based on: [【MPSZ拡張表記案】麻雀のMPSZ表記の拡張を考えてみる](https://note.com/yuarasino/n/n1ba95bf3b618)

> [!NOTE]
> - `<TILE>` means `/\d[mpsz]/`.
> - For "consecutive" checks and "same" checks, `0` is treated as `5`.
> - If the suit is 'z' (honor tiles), only numbers 1-7 are allowed.

- Shu pai
  - input: `/\d+[mps]/`
  - output: `{ type: "single", tile: <TILE> }[]`
- Zi pai
  - input: `/[1-7]+z/`
  - output: `{ type: "single", tile: <TILE> }[]`
- Reversed pai
  - input: `/0+x/`
  - output: `{ type: "single", tile: "0x" }[]`
- Chi
  - input: `(\d{1}-\d{2}|\d{2}-\d{1}|\d{3}-)[mps]`
    - The three numbers must be consecutive.
  - output: `{ type: "chi", tiles: [<TILE>, <TILE>, <TILE>] }`
  - note: The number before the hyphen is moved to the beginning of the `tiles` array, regardless of its original position.
- Peng
  - input: `(\d{1}-\d{2}|\d{2}-\d{1}|\d{3}-)[mpsz]`
    - The three numbers must be the same.
  - output: `{ type: "peng", pos: /[0-2]/, tiles: [<TILE>, <TILE>, <TILE>] }`
- Gang (Da ming gang)
  - input: `(\d{1}-\d{3}|\d{2}-\d{2}|\d{3}-\d{1}|\d{4}-\d)[mpsz]`
    - The four numbers must be the same.
  - output: `{ type: "da-ming-gang", pos: /[0-3]/, tiles: [<TILE>, <TILE>, <TILE>, <TILE>] }`
- Gang (Jia gang)
  - input: `(\d{1}=\d{3}|\d{2}=\d{2}|\d{3}=\d{1})[mpsz]`
    - The four numbers must be the same.
  - output: `{ type: "jia-gang", pos: /[0-2]/, tiles: [<TILE>, <TILE>, <TILE>, <TILE>] }`
- Gang (An gang)
  - input: `\d{4}\+[mpsz]`
    - The four numbers must be the same.
    - In the output, the second and third numbers are used.
  - output: `{ type: "an-gang", tiles: ["0x", <TILE>, <TILE>, "0x"] }`
- Spacer
  - input: `,`
  - output: `{ type: "spacer" }`
