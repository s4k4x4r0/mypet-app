// ドット絵のうさぎ（16x16のピクセルマップをCSSグリッドで描画）

export type Pose = 'normal' | 'happy' | 'hungry' | 'sleeping' | 'eating'

const PALETTE: Record<string, string> = {
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
const BASE: string[] = [
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

// [行, 列, 文字] の組
type Edit = [number, number, string]

/**
 * Applies coordinate-based character edits to a grid of rows.
 *
 * @param rows - Array of strings representing the initial grid rows
 * @param edits - Array of edits, where each edit specifies a row index, column index, and character to set
 * @returns The modified grid as an array of strings
 */
function withPixels(rows: string[], edits: Edit[]): string[] {
  const grid = rows.map((r) => r.split(''))
  for (const [y, x, ch] of edits) grid[y][x] = ch
  return grid.map((r) => r.join(''))
}

// 目(col4, col9 あたり)・ほっぺ・鼻を差し込む
const FACE_OPEN: Edit[] = [
  [9, 4, 'e'], [9, 9, 'e'], // 目
  [11, 3, 'c'], [11, 10, 'c'], // ほっぺ
  [11, 6, '$'], [11, 7, '$'], // 鼻
]

const FACE_HAPPY: Edit[] = [
  [9, 3, 'e'], [9, 4, 'e'], [9, 9, 'e'], [9, 10, 'e'], // にっこり閉じ目
  [11, 3, 'c'], [11, 10, 'c'],
  [11, 6, '$'], [11, 7, '$'],
  [12, 5, 'e'], [12, 6, 'e'], [12, 7, 'e'], [12, 8, 'e'], // 笑った口
]

const FACE_SLEEP: Edit[] = [
  [9, 3, '-'], [9, 4, '-'], [9, 9, '-'], [9, 10, '-'], // 閉じた目
  [11, 6, '$'], [11, 7, '$'],
]

const FACE_HUNGRY: Edit[] = [
  [9, 4, 'e'], [9, 9, 'e'],
  [11, 6, '$'], [11, 7, '$'],
  [12, 6, 'e'], [12, 7, 'e'], // 困り口
]

// 食べているとき：口を開ける
const FACE_EAT: Edit[] = [
  [9, 4, 'e'], [9, 9, 'e'],
  [11, 3, 'c'], [11, 10, 'c'],
  [11, 6, '$'], [11, 7, '$'],
  [12, 6, 'o'], [12, 7, 'o'], [13, 6, '$'], [13, 7, '$'], // あーん
]

const POSES: Record<Pose, string[]> = {
  normal: withPixels(BASE, FACE_OPEN),
  happy: withPixels(BASE, FACE_HAPPY),
  hungry: withPixels(BASE, FACE_HUNGRY),
  sleeping: withPixels(BASE, FACE_SLEEP),
  eating: withPixels(BASE, FACE_EAT),
}

interface RabbitSpriteProps {
  pose?: Pose
  pixel?: number
}

/**
 * Renders a pixel-art rabbit sprite with the specified pose and pixel size.
 *
 * @param pose - The rabbit's facial expression. Defaults to `'normal'`.
 * @param pixel - The width and height in pixels of each sprite pixel. Defaults to `14`.
 * @returns The rendered sprite as a 16x16 grid of colored pixels.
 */
export default function RabbitSprite({
  pose = 'normal',
  pixel = 14,
}: RabbitSpriteProps) {
  const grid = POSES[pose] ?? POSES.normal
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
