import { useEffect, useRef } from 'react'

export default function AutoComplete({ suggestions, onSelect, visible }) {
  const ref = useRef()

  if (!visible || suggestions.length === 0) return null

  return (
    <div ref={ref} data-autocomplete="true" style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      marginTop: '6px',
      background: 'var(--white)',
      border: '1.5px solid var(--border2)',
      borderRadius: '14px',
      boxShadow: 'var(--shadow2)',
      zIndex: 100,
      overflow: 'hidden',
      animation: 'fadeUp 0.15s ease both',
    }}>
      {suggestions.map((s, i) => (
        <div
          key={i}
          onClick={() => onSelect(s.name)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '11px 16px',
            cursor: 'pointer',
            borderBottom: i < suggestions.length - 1 
              ? '1px solid var(--border)' : 'none',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => 
            e.currentTarget.style.background = 'var(--green-lt)'}
          onMouseLeave={e => 
            e.currentTarget.style.background = 'transparent'}
        >
          <div>
            <div style={{
              fontSize: '.85rem',
              fontWeight: 600,
              color: 'var(--text)',
            }}>{s.name}</div>
            <div style={{
              fontSize: '.68rem',
              color: 'var(--text3)',
              marginTop: '2px',
              fontFamily: "'JetBrains Mono', monospace",
            }}>{s.salt}</div>
          </div>
          <div style={{
            fontSize: '.78rem',
            fontWeight: 700,
            color: 'var(--green)',
            flexShrink: 0,
            marginLeft: '12px',
          }}>{s.price}</div>
        </div>
      ))}
    </div>
  )
}
