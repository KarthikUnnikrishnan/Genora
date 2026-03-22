import { useState } from "react"

const TABS = ["Description", "Side Effects", "Drug Interactions", "Reviews"]

const LEVEL_COLORS = {
  Severe:   { bg: "#FEE2E2", color: "#DC2626" },
  Moderate: { bg: "#FEF3C7", color: "#D97706" },
  Mild:     { bg: "#DCFCE7", color: "#16A34A" },
}

export default function DetailPanel({ medicine, isSaved }) {
  const [tab, setTab] = useState("Description")

  if (!medicine) return null

  const { name, desc, sideEffects, interactions, reviews, priceLabel, manufacturer, form, pack, salt, available } = medicine

  const meta = [manufacturer, form, salt].filter(Boolean).join(" · ")

  return (
    <div className="detail-panel">

      {/* Header */}
      <div className="detail-selected-header">
        <div>
          <div className="dsh-name">{name}</div>
          <div className="dsh-meta">{meta}</div>
        </div>
        <div>
          <div className="dsh-price">{priceLabel}</div>
          <div className="dsh-save">{isSaved || "— Searched Medicine"}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        {TABS.map(t => (
          <div key={t} className={`dtab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
            {t}
            {t === "Drug Interactions" && interactions?.length > 0 && (
              <span style={{
                marginLeft: '6px', fontSize: '.6rem', fontWeight: 700,
                background: 'var(--amber-lt)', color: 'var(--amber)',
                borderRadius: '10px', padding: '1px 6px'
              }}>{interactions.length}</span>
            )}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="detail-body">
        <div className="detail-col">
          <div className="dcol-title">
            {tab === "Description"       && "About this Medicine"}
            {tab === "Side Effects"      && "Side Effects"}
            {tab === "Drug Interactions" && "Drug Interactions"}
            {tab === "Reviews"           && "Patient Reviews"}
          </div>

          {tab === "Description" && (
            <div className="desc-text" dangerouslySetInnerHTML={{ __html: desc || "<p>No description available.</p>" }} />
          )}

          {tab === "Side Effects" && (
            <div className="desc-text" dangerouslySetInnerHTML={{ __html: sideEffects || "<p>No side effect data available.</p>" }} />
          )}

          {tab === "Drug Interactions" && (
            <div>
              {interactions && interactions.length > 0 ? (
                interactions.map((it, i) => {
                  const style = LEVEL_COLORS[it.level] || LEVEL_COLORS.Moderate
                  return (
                    <div key={i} className="int-row">
                      <div className="int-dot" />
                      <div style={{ flex: 1 }}>
                        <div className="int-drug">{it.drug}</div>
                        {it.brand && <div className="int-brand">{it.brand}</div>}
                      </div>
                      <div className="int-badge" style={{ background: style.bg, color: style.color }}>
                        {it.level}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div style={{
                  padding: '24px', textAlign: 'center',
                  color: 'var(--text3)', fontSize: '.85rem',
                  background: 'var(--bg2)', borderRadius: '10px',
                  border: '1px solid var(--border)'
                }}>
                  ✓ No known drug interactions recorded for this medicine.
                </div>
              )}
            </div>
          )}

          {tab === "Reviews" && (
            <div>
              {(reviews?.excellent || reviews?.average || reviews?.poor)
                ? <>
                    <ReviewBar label="Excellent" pct={reviews?.excellent} color="#22c55e" />
                    <ReviewBar label="Average"   pct={reviews?.average}   color="var(--amber)" />
                    <ReviewBar label="Poor"      pct={reviews?.poor}      color="var(--red)" />
                  </>
                : (
                    <div style={{
                      padding: '24px', textAlign: 'center',
                      color: 'var(--text3)', fontSize: '.85rem',
                      background: 'var(--bg2)', borderRadius: '10px',
                      border: '1px solid var(--border)'
                    }}>
                      No patient review data available for this medicine.
                    </div>
                  )
              }
            </div>
          )}
        </div>

        <div className="detail-col">
          <div className="dcol-title">Quick Info</div>
          <div className="desc-text">
            <strong>Manufacturer:</strong> {manufacturer || "N/A"}<br /><br />
            <strong>Form:</strong> {form || "N/A"}<br /><br />
            <strong>Salt:</strong> {salt || "N/A"}<br /><br />
            <strong>Price:</strong> {priceLabel || "N/A"}<br /><br />
            <strong>Status:</strong>{" "}
            <span style={{ color: available ? '#22c55e' : 'var(--red)', fontWeight: 600 }}>
              {available ? "Available" : "Discontinued"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReviewBar({ label, pct, color }) {
  return (
    <div className="rev-row">
      <div className="rev-lbl">{label}</div>
      <div className="rev-track">
        <div className="rev-fill" style={{ width: `${pct || 0}%`, background: color }} />
      </div>
      <div className="rev-pct" style={{ color }}>{Number(pct || 0).toFixed(0)}%</div>
    </div>
  )
}
