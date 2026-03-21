/* eslint-disable */
import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    // Read saved preference or default to light
    return localStorage.getItem('genora-theme') === 'dark'
  })

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('genora-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('genora-theme', 'light')
    }
  }, [dark])

  // Apply saved theme immediately on first load
  useEffect(() => {
    const saved = localStorage.getItem('genora-theme')
    if (saved === 'dark') {
      document.documentElement.classList.add('dark')
      setDark(true)
    }
  }, [])

  return (
    <button
      onClick={() => setDark(d => !d)}
      title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        padding: '7px 14px',
        borderRadius: '100px',
        border: '1.5px solid var(--border2)',
        background: 'var(--white)',
        cursor: 'pointer',
        fontSize: '.78rem',
        fontWeight: 600,
        color: 'var(--text2)',
        fontFamily: "'DM Sans', sans-serif",
        transition: 'all .2s',
        boxShadow: 'var(--shadow)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--green)'
        e.currentTarget.style.color = 'var(--green)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border2)'
        e.currentTarget.style.color = 'var(--text2)'
      }}
    >
      {/* Toggle track */}
      <div style={{
        width: '34px',
        height: '18px',
        borderRadius: '100px',
        background: dark ? 'var(--green2)' : 'var(--border2)',
        position: 'relative',
        transition: 'background .25s',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute',
          top: '2px',
          left: dark ? '18px' : '2px',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: '#fff',
          transition: 'left .25s',
          boxShadow: '0 1px 4px rgba(0,0,0,.2)',
        }} />
      </div>
      {dark ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}
