import { useState } from "react"

const TABS = ["Description", "Side Effects", "Drug Interactions", "Reviews"]

export default function DetailPanel({ medicine, isSaved }) {
  const [tab, setTab] = useState("Description")

  if (!medicine) return null

  const { name, desc, sideEffects, interactions, reviews, priceLabel, manufacturer, form, pack, salt } = medicine

  const meta = [manufacturer, form, pack, salt].filter(Boolean).join(" · ")

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
          <div key={t} className={`dtab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>

      {/* Body */}
      <div className="detail-body">
        <div className="detail-col">
          <div className="dcol-title">
            {tab === "Description" && "About this Medicine"}
            {tab === "Side Effects" && "Side Effects"}
            {tab === "Drug Interactions" && "Interactions"}
            {tab === "Reviews" && "Patient Reviews"}
          </div>

          {tab === "Description" && (
            <div className="desc-text" dangerouslySetInnerHTML={{ __html: desc }} />
          )}
          {tab === "Side Effects" && (
            <div className="desc-text" dangerouslySetInnerHTML={{ __html: sideEffects || "<p>No side effect data available.</p>" }} />
          )}
          {tab === "Drug Interactions" && (
            <div>
              {interactions?.map((it, i) => (
                <div key={i} className="int-row">
                  <div className="int-dot" />
                  <div>
                    <div className="int-drug">{it.drug}</div>
                    <div className="int-brand">{it.brand}</div>
                  </div>
                  <div className="int-badge">{it.level}</div>
                </div>
              ))}
            </div>
          )}
          {tab === "Reviews" && (
            <div>
              <ReviewBar label="Excellent" pct={reviews?.excellent} color="#22c55e" />
              <ReviewBar label="Average" pct={reviews?.average} color="var(--amber)" />
              <ReviewBar label="Poor" pct={reviews?.poor} color="var(--red)" />
            </div>
          )}
        </div>

        <div className="detail-col">
          <div className="dcol-title">Quick Info</div>
          <div className="desc-text">
            <strong>Manufacturer:</strong> {manufacturer}<br /><br />
            <strong>Form:</strong> {form} — {pack}<br /><br />
            <strong>Salt:</strong> {salt}<br /><br />
            <strong>Price:</strong> {priceLabel}
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
      <div className="rev-pct" style={{ color }}>{pct}%</div>
    </div>
  )
}
