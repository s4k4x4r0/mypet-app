// うさぎの状態管理ロジック（バックエンドなし・純粋関数）

export const STORAGE_KEY = 'usagicchi-state-v1'

export interface PetState {
  satiety: number
  energy: number
  asleep: boolean
  lastUpdated: number
}

export type Mood = 'sleeping' | 'hungry' | 'happy' | 'normal'

// 各ステータスの増減レート（1秒あたり）
const RATES = {
  // 満腹度: 起きている間に約10分でゼロまで減る
  satietyAwake: 100 / 600,
  // 満腹度: 寝ている間はゆっくり減る（約30分）
  satietyAsleep: 100 / 1800,
  // 元気度(エネルギー): 起きている間に約3分で尽きる→眠くなる
  energyAwake: 100 / 180,
  // 元気度: 寝ている間に約1分で回復→目覚める
  energyAsleep: -100 / 60,
} as const

const FEED_AMOUNT = 30

export function createInitialState(now: number): PetState {
  return {
    satiety: 80,
    energy: 100,
    asleep: false,
    lastUpdated: now,
  }
}

const clamp = (v: number): number => Math.max(0, Math.min(100, v))

// 経過秒数ぶん状態を進める純粋関数（1秒刻みでシミュレート）
export function advance(state: PetState, elapsedSec: number): PetState {
  let { satiety, energy, asleep } = state
  // 異常に長い経過は丸める（最大48時間ぶんまで）
  let secs = Math.min(Math.max(0, Math.floor(elapsedSec)), 48 * 3600)

  while (secs-- > 0) {
    if (asleep) {
      satiety = clamp(satiety - RATES.satietyAsleep)
      energy = clamp(energy - RATES.energyAsleep)
      if (energy >= 100) asleep = false // 元気が満タンになったら起きる
    } else {
      satiety = clamp(satiety - RATES.satietyAwake)
      energy = clamp(energy - RATES.energyAwake)
      if (energy <= 0) asleep = true // 元気がなくなったら寝る
    }
  }

  return { ...state, satiety, energy, asleep }
}

export function feed(state: PetState): PetState {
  if (state.asleep) return state // 寝ている間はあげられない
  return { ...state, satiety: clamp(state.satiety + FEED_AMOUNT) }
}

// 状態から気分を判定
export function getMood(state: PetState): Mood {
  if (state.asleep) return 'sleeping'
  if (state.satiety < 25) return 'hungry'
  if (state.satiety > 75 && state.energy > 50) return 'happy'
  return 'normal'
}

export function loadState(now: number): PetState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState(now)
    const saved = JSON.parse(raw) as Partial<PetState>
    if (typeof saved.satiety !== 'number') return createInitialState(now)
    const elapsed = (now - (saved.lastUpdated ?? now)) / 1000
    return { ...advance(saved as PetState, elapsed), lastUpdated: now }
  } catch {
    return createInitialState(now)
  }
}

export function saveState(state: PetState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // 保存に失敗しても無視
  }
}
