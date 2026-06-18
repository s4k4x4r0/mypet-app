// ドット絵のうさぎ（16x16のピクセルマップをCSSグリッドで描画）

const PALETTE = {
  '.': 'transparent',
  o: '#7a6a58', // やわらかい茶色の輪郭
  '#': '#fffdf7', // 体（ほぼ白のクリーム色）
  $: '#ff9fb6', // 耳の内側・鼻
  e: '#5b4636', // 目
  c: '#ffc6d6', // ほっぺ
  '-': '#5b4636', // 閉じた目
}

// 共通の体（耳・顔・輪郭）。目と口だけポーズで差し替える。
// 16文字 x 16行
const BASE = [
  '................',
  '...oo....oo.....',
  '..o##o..o##o....',
  '..o#$o..o$#o....',
  '..o#$o..o$#o....',
  '..o#$o..o$#o....',
  '..o##oooo##o....',
  '..o########o....',
  '.o##########o...',
  '.o##########o...',
  '.o##########o...',
  '.o##########o...',
  '.o##########o...',
  '.o##########o...',
  '..o########o....',
  '...oooooooo.....',
]

// 行・列を指定して文字を差し替える
function withPixels(rows, edits) {
  const grid = rows.map((r) => r.split(''))
  for (const [y, x, ch] of edits) grid[y][x] = ch
  return grid.map((r) => r.join(''))
}

// 目(col4, col9 あたり)・ほっぺ・鼻を差し込む
const FACE_OPEN = [
  [9, 4, 'e'], [9, 9, 'e'], // 目
  [11, 3, 'c'], [11, 10, 'c'], // ほっぺ
  [11, 6, '$'], [11, 7, '$'], // 鼻
]

const FACE_HAPPY = [
  [9, 3, 'e'], [9, 4, 'e'], [9, 9, 'e'], [9, 10, 'e'], // にっこり閉じ目
  [11, 3, 'c'], [11, 10, 'c'],
  [11, 6, '$'], [11, 7, '$'],
  [12, 5, 'e'], [12, 6, 'e'], [12, 7, 'e'], [12, 8, 'e'], // 笑った口
]

const FACE_SLEEP = [
  [9, 3, '-'], [9, 4, '-'], [9, 9, '-'], [9, 10, '-'], // 閉じた目
  [11, 6, '$'], [11, 7, '$'],
]

const FACE_HUNGRY = [
  [9, 4, 'e'], [9, 9, 'e'],
  [11, 6, '$'], [11, 7, '$'],
  [12, 6, 'e'], [12, 7, 'e'], // 困り口
]

// 食べているとき：口を開ける
const FACE_EAT = [
  [9, 4, 'e'], [9, 9, 'e'],
  [11, 3, 'c'], [11, 10, 'c'],
  [11, 6, '$'], [11, 7, '$'],
  [12, 6, 'o'], [12, 7, 'o'], [13, 6, '$'], [13, 7, '$'], // あーん
]

const POSES = {
  normal: withPixels(BASE, FACE_OPEN),
  happy: withPixels(BASE, FACE_HAPPY),
  hungry: withPixels(BASE, FACE_HUNGRY),
  sleeping: withPixels(BASE, FACE_SLEEP),
  eating: withPixels(BASE, FACE_EAT),
}

export default function RabbitSprite({ pose = 'normal', pixel = 14 }) {
  const grid = POSES[pose] || POSES.normal
  const size = 16
  return (
    <div
      className="sprite"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, ${pixel}px)`,
        gridTemplateRows: `repeat(${size}, ${pixel}px)`,
        width: size * pixel,
        height: size * pixel,
      }}
    >
      {grid.flatMap((row, y) =>
        row.split('').map((ch, x) => (
          <div
            key={`${y}-${x}`}
            style={{ background: PALETTE[ch] || 'transparent' }}
          />
        )),
      )}
    </div>
  )
}
