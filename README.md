mpsz-parse
==

This is a parser of mahjong MPSZ format.

## Getting Started

```shell
pnpm i
pnpm run build
```

### Testing

```shell
pnpm run test
```

with coverage:

```shell
pnpm run coverage
```

### Linting

> [!NOTE]
> This is done automatically when you commit to git, so you normally don't need to run it.

```shell
pnpm run check
```

## Format specification

Based on: [【MPSZ拡張表記案】麻雀のMPSZ表記の拡張を考えてみる](https://note.com/yuarasino/n/n1ba95bf3b618)

| Type         | Format (Regexp)   | e.g.                                                                            |
|--------------|-------------------|---------------------------------------------------------------------------------|
| Shu Pai      | `\d+[mps]`        | `123m`           => `["1m","2m","3m"]`                                          |
| Zi Pai       | `[1-7]+z`         | `111z`           => `["1z","1z","1z"]`                                          |
| Chi          | `<Three:->[mps]`  | `12-3m`, `2-13m` => `[{type:"chi",tiles:["2m","1m","3m"]}]`                     |
| Peng         | `<Three:->[mpsz]` | `11-1z`          => `[{type:"peng",pos:2,tiles:["1z","1z","1z"]}]`              |
| Da Ming Gang | `<Four:->[mpsz]`  | `111-1z`         => `[{type:"da-ming-gang",pos:3,tiles:["1z","1z","1z","1z"]}]` |
| Jia Gang     | `<Four:=>[mpsz]`  | `1=111z`         => `[{type:"jia-gang",pos:1,tiles:["1z","1z","1z","1z"]}]`     |
| Ang Gang     | `\d{4}\+[mpsz]`   | `1111+z`         => `[{type:"an-gang",tiles:["0x","1z","1z","0x"]}]`            |
| Back         | `0x`              | `0x`             => `["0x"]`                                                    |
| Space        | `,`               | `,`              => `[null]`                                                    |

```jsregexp
<Three:`X`> = \d`X`\d{2}|\d{2}`X`\d|\d{3}`X`
<Four:`X`> = \d`X`\d{3}|\d{2}`X`\d{2}|\d{3}`X`\d|\d{4}`X`
```
