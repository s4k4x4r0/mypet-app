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

/**
 * Creates the initial pet state.
 *
 * @param now - The current timestamp used to initialize the `lastUpdated` field
 * @returns A new pet state with full satiety and energy
 */
export function createInitialState(now: number): PetState {
  return {
    satiety: 80,
    energy: 100,
    asleep: false,
    lastUpdated: now,
  }
}

const clamp = (v: number): number => Math.max(0, Math.min(100, v))

/**
 * Advances the pet's state based on elapsed seconds.
 *
 * @param state - The current pet state
 * @param elapsedSec - The number of seconds elapsed
 * @returns The updated pet state
 */
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

/**
 * Feeds the pet, increasing its satiety if awake.
 *
 * @returns The pet state with satiety increased if awake, unchanged if asleep.
 */
export function feed(state: PetState): PetState {
  if (state.asleep) return state // 寝ている間はあげられない
  return { ...state, satiety: clamp(state.satiety + FEED_AMOUNT) }
}

/**
 * Determines the pet's mood based on its current state.
 *
 * @returns `'sleeping'` if asleep; `'hungry'` if satiety is below 25; `'happy'` if satiety exceeds 75 and energy exceeds 50; `'normal'` otherwise.
 */
export function getMood(state: PetState): Mood {
  if (state.asleep) return 'sleeping'
  if (state.satiety < 25) return 'hungry'
  if (state.satiety > 75 && state.energy > 50) return 'happy'
  return 'normal'
}

/**
 * Loads the pet state from storage, advancing it to account for elapsed time.
 *
 * Falls back to a fresh initial state if the saved data is missing, invalid, or an error occurs.
 *
 * @param now - The current timestamp in milliseconds
 * @returns The advanced pet state from storage, or a fresh initial state if loading fails
 */
export function loadState(now: number): PetState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState(now)
    const saved = JSON.parse(raw) as Partial<PetState>
    if (typeof saved.satiety !== 'number' || typeof saved.energy !== 'number') return createInitialState(now)
    const elapsed = (now - (saved.lastUpdated ?? now)) / 1000
    return { ...advance(saved as PetState, elapsed), lastUpdated: now }
  } catch {

  }
}

/**
 * Persists the pet state to browser local storage.
 */
export function saveState(state: PetState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // 保存に失敗しても無視
  }
}
