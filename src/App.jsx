import { useEffect, useRef, useState } from 'react'
import RabbitSprite from './RabbitSprite.jsx'
import { loadState, saveState, advance, feed, getMood } from './pet.js'
import './App.css'

export default function App() {
  const [state, setState] = useState(() => loadState(Date.now()))
  const [eating, setEating] = useState(false)
  const eatTimer = useRef(null)

  // 1秒ごとに時間経過を反映
  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => {
        const now = Date.now()
        const elapsed = (now - prev.lastUpdated) / 1000
        return { ...advance(prev, elapsed), lastUpdated: now }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // 状態が変わるたびに localStorage へ保存
  useEffect(() => {
    saveState(state)
  }, [state])

  // タブに戻ってきたときも経過を反映
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        setState((prev) => {
          const now = Date.now()
          const elapsed = (now - prev.lastUpdated) / 1000
          return { ...advance(prev, elapsed), lastUpdated: now }
        })
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  useEffect(() => () => clearTimeout(eatTimer.current), [])

  const handleFeed = () => {
    if (state.asleep) return
    setState((prev) => feed(prev))
    setEating(true)
    clearTimeout(eatTimer.current)
    eatTimer.current = setTimeout(() => setEating(false), 1200)
  }

  const mood = getMood(state)
  const pose = eating && !state.asleep ? 'eating' : mood

  const message = state.asleep
    ? 'スヤスヤ… ねむっているよ'
    : eating
      ? 'もぐもぐ、おいしい！'
      : mood === 'hungry'
        ? 'おなかすいた…ごはんちょうだい'
        : mood === 'happy'
          ? 'ごきげんだよ！'
          : 'なでなでしてほしいな'

  return (
    <div className="app">
      <h1 className="title">うさぎっち</h1>

      <div className={`stage ${state.asleep ? 'night' : ''}`}>
        {state.asleep && <div className="zzz">Z z z…</div>}
        {eating && !state.asleep && <div className="carrot">🥕</div>}
        <div className={`rabbit ${state.asleep ? 'breathing' : 'bobbing'}`}>
          <RabbitSprite pose={pose} pixel={14} />
        </div>
        <div className="ground" />
      </div>

      <p className="message">{message}</p>

      <div className="stats">
        <Stat label="おなか" value={state.satiety} color="#ff8aa6" icon="🍚" />
        <Stat label="げんき" value={state.energy} color="#7ed3a2" icon="✨" />
      </div>

      <button
        className="feed-btn"
        onClick={handleFeed}
        disabled={state.asleep}
      >
        🥕 ごはんをあげる
      </button>
      {state.asleep && (
        <p className="hint">起きるまで待ってあげてね</p>
      )}
    </div>
  )
}

function Stat({ label, value, color, icon }) {
  const v = Math.round(value)
  return (
    <div className="stat">
      <div className="stat-head">
        <span>{icon} {label}</span>
        <span>{v}</span>
      </div>
      <div className="bar">
        <div
          className="bar-fill"
          style={{ width: `${v}%`, background: color }}
        />
      </div>
    </div>
  )
}
