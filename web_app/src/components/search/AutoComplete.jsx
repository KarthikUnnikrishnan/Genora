export default function AutoComplete({ suggestions, onSelect, visible }) {
  if (!visible || !suggestions || suggestions.length === 0) return null

  return (
    <div data-autocomplete="true" style={{
      position: 'absolute',
      top: 'calc(100% + 6px)',
      left: 0,
      right: 0,
      background: 'var(--white)',
      border: '1.5px solid var(--border2)',
      borderRadius: '14px',
      boxShadow: 'var(--shadow2)',
      zIndex: 9999,
      maxHeight: '380px',
      overflowY: 'auto',
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
            padding: '12px 16px',
            cursor: 'pointer',
            borderBottom: i < suggestions.length - 1
              ? '1px solid var(--border)' : 'none',
            background: 'transparent',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--green-lt)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '.86rem',
              fontWeight: 600,
              color: 'var(--text)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {s.name}
            </div>
            <div style={{
              fontSize: '.68rem',
              color: 'var(--text3)',
              marginTop: '2px',
              fontFamily: "'JetBrains Mono', monospace",
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {s.salt}
            </div>
          </div>
          <div style={{
            fontSize: '.78rem',
            fontWeight: 700,
            color: 'var(--green)',
            flexShrink: 0,
            marginLeft: '16px',
          }}>
            {s.price}
          </div>
        </div>
      ))}
    </div>
  )
}
