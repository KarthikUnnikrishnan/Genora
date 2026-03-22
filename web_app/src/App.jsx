import { useState, useEffect, useRef } from "react"
import Navbar from "./components/Navbar"
import ImageSearch from "./components/search/ImageSearch"
import DetailPanel from "./components/results/DetailPanel"
import { searchMedicine, getAutoComplete } from "./api/genora"
import { ORIGINAL, ALTERNATIVES, STATS, SUGGESTIONS, PRESC_MEDICINES } from "./data/medicines"
import AutoComplete from './components/search/AutoComplete'

// ── Count-up hook ─────────────────────────
function useCountUp(target, trigger) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let cur = 0
    const step = Math.ceil(target / 60)
    const tick = () => {
      cur = Math.min(cur + step, target)
      setVal(cur)
      if (cur < target) requestAnimationFrame(tick)
    }
    tick()
  }, [trigger, target])
  return val.toLocaleString("en-IN")
}

// ── Scroll reveal hook ────────────────────
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible") }),
      { threshold: 0.12 }
    )
    document.querySelectorAll(".reveal,.reveal-left,.reveal-right,.reveal-scale").forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

// ── Stat counter ──────────────────────────
function StatNum({ target }) {
  const ref = useRef()
  const [triggered, setTriggered] = useState(false)
  const val = useCountUp(target, triggered)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTriggered(true); obs.disconnect() } }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return <span ref={ref}>{val}</span>
}


export default function App() {
  const [mode, setMode] = useState("text")
  const [query, setQuery] = useState("")
  const [lastQuery, setLastQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)   // { medicine, alternatives }
  const [selectedAlt, setSelectedAlt] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const autocompleteTimer = useRef(null)

  useReveal()

  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest('.search-field') &&
        !e.target.closest('[data-autocomplete]')) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleQueryChange(value) {
    setQuery(value)
    clearTimeout(autocompleteTimer.current)
    if (value.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    autocompleteTimer.current = setTimeout(async () => {
      try {
        const results = await getAutoComplete(value)
        if (results && results.length > 0) {
          setSuggestions(results)
          setShowSuggestions(true)
        } else {
          setSuggestions([])
          setShowSuggestions(false)
        }
      } catch (err) {
        console.error('Autocomplete error:', err)
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 250)
  }

  function handleSuggestionSelect(name) {
    setQuery(name)
    setShowSuggestions(false)
    setSuggestions([])
    handleSearch(name)
  }

  async function handleSearch(searchQuery) {
    const q = (searchQuery || query).trim()
    if (!q) return
    setLoading(true)
    setResults(null)
    setSelectedAlt(null)
    setLastQuery(q)
    try {
      const data = await searchMedicine(q)
      if (!data) {
        alert("Medicine not found in our database.")
        setResults(null)
      } else {
        setResults(data)
        setSelectedAlt(null)
        setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 100)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function handleImageResults(medicine, alternatives) {
    setResults({ medicine, alternatives })
    setSelectedAlt(null)
    setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 100)
  }

  function selectAlt(alt) {
    setSelectedAlt(alt)
    setTimeout(() => document.getElementById("detail")?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80)
  }

  const displayMed = selectedAlt || results?.medicine

  return (
    <>
      <Navbar />

      {/* ── HERO ───────────────────────────── */}
      <section className="hero" id="home">

        {/* Corner illustrations */}
        <svg className="hero-deco hero-deco-tl" viewBox="0 0 200 200">
          <rect x="30" y="80" width="100" height="40" rx="20"
            fill="none" stroke="var(--green-lt2)" strokeWidth="2" />
          <rect x="30" y="80" width="50" height="40"
            rx="20" fill="var(--green-lt)" opacity="0.6" />
          <ellipse cx="160" cy="50" rx="18" ry="10"
            fill="none" stroke="var(--green-lt2)" strokeWidth="1.5"
            transform="rotate(-30 160 50)" />
          <line x1="155" y1="140" x2="155" y2="175"
            stroke="var(--green-lt2)" strokeWidth="2.5"
            strokeLinecap="round" />
          <line x1="138" y1="157" x2="173" y2="157"
            stroke="var(--green-lt2)" strokeWidth="2.5"
            strokeLinecap="round" />
          <circle cx="100" cy="35" r="4" fill="var(--green-lt2)" />
          <circle cx="170" cy="110" r="3" fill="var(--stone)" />
        </svg>

        <svg className="hero-deco hero-deco-tr" viewBox="0 0 200 200">
          <rect x="60" y="20" width="80" height="120" rx="10"
            fill="none" stroke="var(--green-lt2)" strokeWidth="1.5" />
          <circle cx="85" cy="50" r="11" fill="var(--green-lt)" opacity="0.7" />
          <circle cx="115" cy="50" r="11" fill="var(--green-lt)" opacity="0.7" />
          <circle cx="85" cy="80" r="11" fill="var(--green-lt)" opacity="0.5" />
          <circle cx="115" cy="80" r="11" fill="var(--green-lt)" opacity="0.5" />
          <circle cx="85" cy="110" r="11" fill="var(--border)" opacity="0.8" />
          <circle cx="115" cy="110" r="11" fill="var(--border)" opacity="0.8" />
          <line x1="100" y1="30" x2="100" y2="130"
            stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="25" cy="80" r="8"
            fill="none" stroke="var(--green-lt2)" strokeWidth="1.5" />
        </svg>

        <svg className="hero-deco hero-deco-bl" viewBox="0 0 200 200">
          <circle cx="60" cy="100" r="14"
            fill="var(--green-lt)" stroke="var(--green-lt2)" strokeWidth="1.5" />
          <circle cx="120" cy="70" r="10"
            fill="var(--green-lt)" stroke="var(--green-lt2)" strokeWidth="1.5" />
          <circle cx="150" cy="130" r="12"
            fill="var(--green-lt)" stroke="var(--green-lt2)" strokeWidth="1.5" />
          <circle cx="80" cy="155" r="8"
            fill="var(--border)" stroke="var(--border2)" strokeWidth="1.5" />
          <line x1="74" y1="93" x2="113" y2="76"
            stroke="var(--green-lt2)" strokeWidth="1.5" />
          <line x1="130" y1="80" x2="142" y2="120"
            stroke="var(--green-lt2)" strokeWidth="1.5" />
          <line x1="65" y1="113" x2="76" y2="148"
            stroke="var(--border2)" strokeWidth="1.5" />
          <rect x="15" y="25" width="50" height="22" rx="11"
            fill="none" stroke="var(--green-lt2)" strokeWidth="1.5" />
          <rect x="15" y="25" width="25" height="22"
            rx="11" fill="var(--green-lt)" opacity="0.5" />
        </svg>

        <svg className="hero-deco hero-deco-br" viewBox="0 0 200 200">
          <polyline
            points="10,110 35,110 50,70 65,150 80,90 95,110 125,110 140,75 155,140 170,110 200,110"
            fill="none" stroke="var(--green-lt2)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="80" cy="90" r="5" fill="var(--green-lt2)" />
          <line x1="155" y1="25" x2="155" y2="55"
            stroke="var(--green-lt2)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="140" y1="40" x2="170" y2="40"
            stroke="var(--green-lt2)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="155" cy="40" r="20"
            fill="none" stroke="var(--border)" strokeWidth="1.5" />
          <rect x="45" y="160" width="40" height="16" rx="8"
            fill="none" stroke="var(--green-lt2)" strokeWidth="1.5" />
        </svg>

        {/* LEFT — headline */}
        <div className="hero-left">
          <div className="hero-badge">
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--green)',
              animation: 'pulse 2s ease infinite',
              flexShrink: 0
            }} />
            India's Generic Medicine Finder · 7,466 Medicines
          </div>

          <h1 className="hero-h1">
            Find the <em>cheaper</em><br />
            <em>alternative</em><br />
            instantly
          </h1>

          <p className="hero-sub">
            Search by name, scan a strip, or upload a
            prescription. Genora finds every generic
            alternative — ranked by price — in seconds.
          </p>
        </div>

        {/* RIGHT — search */}
        <div className="hero-right">
          <div className="mode-switcher">
            <button
              className={`modebt${mode === 'text' ? ' active' : ''}`}
              onClick={() => setMode('text')}>
              Text Search
            </button>
            <button
              className={`modebt${mode === 'image' ? ' active' : ''}`}
              onClick={() => setMode('image')}>
              Image Scan
            </button>
          </div>

          <div className="input-panel">
            {mode === 'text' ? (
              <div className="text-panel">
                <div style={{ position: 'relative', width: '100%', zIndex: 100 }}>
                  <div className="search-field">
                    <input
                      type="text"
                      placeholder="Medicine name or salt composition..."
                      value={query}
                      onChange={e => handleQueryChange(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          setShowSuggestions(false)
                          handleSearch()
                        }
                        if (e.key === 'Escape') setShowSuggestions(false)
                      }}
                      onFocus={() => suggestions.length > 0 &&
                        setShowSuggestions(true)}
                      autoComplete="off"
                    />
                    <button
                      className="search-go"
                      onClick={() => {
                        setShowSuggestions(false)
                        handleSearch()
                      }}
                      disabled={loading}>
                      {loading ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                  <AutoComplete
                    suggestions={suggestions}
                    onSelect={handleSuggestionSelect}
                    visible={showSuggestions}
                  />
                </div>
                <div className="suggestions">
                  {['Paracetamol 500mg', 'Azithromycin 500',
                    'Metformin 500', 'Pantoprazole 40mg',
                    'Amoxicillin 250'].map(s => (
                      <span key={s} className="sugg"
                        onClick={() => {
                          setQuery(s)
                          setShowSuggestions(false)
                          handleSearch(s)
                        }}>{s}</span>
                    ))}
                </div>
              </div>
            ) : (
              <ImageSearch onResults={handleImageResults} />
            )}
          </div>

          <div className="hero-stats">
            {[
              { num: 7466, label: 'Medicines' },
              { num: 12675, label: 'Ingredients' },
              { num: 49, label: 'Dosage Forms' },
              { num: 3, label: 'Scan Modes' }
            ].map(s => (
              <div key={s.label} className="hstat">
                <div className="hstat-num">
                  <StatNum target={s.num} />
                </div>
                <div className="hstat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ── RESULTS ────────────────────────── */}
      {results && (
        <div className="results-section" id="results">

          {/* Header */}
          <div className="results-header">
            <div className="results-label">Results for</div>
            <div className="results-tag">"{lastQuery}"</div>
          </div>

          {/* Original medicine card */}
          <div className="orig-card" style={{ marginBottom: '32px' }}>
            <div className="orig-top">
              <div>
                <div className="orig-name">{results.medicine.name}</div>
                <div className="orig-salt">{results.medicine.salt}</div>
              </div>
              <div className="orig-price-wrap">
                <div className="orig-price">₹{Number(results.medicine.price || 0).toFixed(2)}</div>
                <div className="orig-price-sub">per strip</div>
              </div>
            </div>
            <div className="orig-meta">
              <div className="chip">{results.medicine.form}</div>
              <div className="chip">{results.medicine.manufacturer}</div>
              <div className={`chip ${results.medicine.available ? 'ok' : 'warn'}`}>
                {results.medicine.available ? 'Available' : 'Discontinued'}
              </div>
            </div>
          </div>

          {/* Alternatives */}
          {results.alternatives.length > 0 ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '16px'
              }}>
                <div style={{
                  fontSize: '.65rem', fontWeight: 700,
                  letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text3)'
                }}>
                  {results.alternatives.length} Generic Alternatives — Same Salt
                </div>
              </div>
              <div className="alts-grid" style={{ marginBottom: '32px' }}>
                {results.alternatives.map((alt, i) => (
                  <div
                    key={alt.id || i}
                    className={`alt-card${selectedAlt?.id === alt.id ? ' selected' : ''}`}
                    onClick={() => selectAlt(alt)}
                  >
                    <div className="alt-num">#{String(i + 1).padStart(2, '0')}</div>
                    <div className="alt-name">{alt.name}</div>
                    <div className="alt-mfr">{alt.manufacturer}</div>
                    <div className="alt-bottom">
                      <div>
                        <div className="alt-price">₹{Number(alt.price || 0).toFixed(2)}</div>
                        <div className="alt-form">{alt.form}</div>
                      </div>
                      {results.medicine.price && alt.price && (() => {
                        const saving = results.medicine.price - alt.price
                        if (saving > 0) {
                          return (
                            <span className="alt-save" style={{
                              fontSize: '.64rem', fontWeight: 600, letterSpacing: '.3px',
                              textTransform: 'uppercase', padding: '3px 9px', borderRadius: '6px',
                              background: 'var(--green-lt)', color: 'var(--green)',
                              border: '1px solid var(--green-lt2)'
                            }}>
                              SAVE ₹{saving.toFixed(2)}
                            </span>
                          )
                        } else if (saving < 0) {
                          return (
                            <span className="alt-save" style={{
                              fontSize: '.64rem', fontWeight: 600, letterSpacing: '.3px',
                              textTransform: 'uppercase', padding: '3px 9px', borderRadius: '6px',
                              background: 'var(--amber-lt)', color: 'var(--amber)',
                              border: '1px solid #FDE68A'
                            }}>
                              ₹{Math.abs(saving).toFixed(2)} more
                            </span>
                          )
                        }
                        return null
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{
              padding: '32px', textAlign: 'center', color: 'var(--text3)',
              background: 'var(--card)', borderRadius: '14px', marginBottom: '32px',
              border: '1px solid var(--border)'
            }}>
              No generic alternatives found for this salt composition.
            </div>
          )}

          {/* Detail panel */}
          <div id="detail">
            <DetailPanel
              medicine={displayMed}
              isSaved={selectedAlt
                ? (results.medicine.price && selectedAlt.price
                  ? `Save ₹${Math.abs(results.medicine.price - selectedAlt.price).toFixed(2)} vs original`
                  : '— Alternative Selected')
                : '— Searched Medicine'}
            />
          </div>
        </div>
      )}

      {/* ── FEATURES ───────────────────────── */}
      <section className="features-section" id="features">
        <div style={{ marginBottom: '48px' }}>
          <div className="section-pill">Why Genora</div>
          <h2 className="section-h2">Everything you need to<br />save on <em>medicine</em></h2>
          <p className="section-sub">Genora combines a massive medicine database,
            smart AI image recognition, and real-time price comparison.</p>
        </div>

        <div className="features-grid">
          {[
            { title: "Smart Text Search", desc: "Search by brand name, salt composition, or manufacturer. Fuzzy matching finds the right medicine even with spelling variations." },
            { title: "AI Image Recognition", desc: "Photograph any medicine strip, box, prescription or tablet. Our AI extracts the name and finds alternatives instantly." },
            { title: "Price Comparison", desc: "All generic alternatives sorted cheapest first. Compare prices across every manufacturer for the exact same active ingredient." },
            { title: "Drug Interactions", desc: "See all known drug interactions before switching medicines. Severity levels and brand names for every interaction." },
            { title: "Prescription Scanner", desc: "Upload a full prescription and Genora identifies every medicine on it, finding cheaper alternatives for each one." },
            { title: "Patient Reviews", desc: "Excellent, Average and Poor review breakdowns from real patients to help you make the most informed choice." },
          ].map((f, i) => (
            <div key={f.title} className={`feat-card reveal stagger-${i + 1}`}>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────── */}
      <section className="how-section" id="how">
        <div className="how-inner">
          <div className="section-pill reveal" style={{ display: "inline-flex" }}>Simple Process</div>
          <h2 className="section-h2 reveal" style={{ margin: "0 auto 16px", textAlign: "center", maxWidth: "none" }}>
            How <em>Genora</em> works
          </h2>
          <p className="section-sub reveal" style={{ margin: "0 auto", textAlign: "center" }}>
            From search to savings in under 3 seconds
          </p>
          <div className="steps-row">
            {[
              { n: "01", title: "Search or Scan", desc: "Type a medicine name or upload / scan a medicine image using our AI camera" },
              { n: "02", title: "Salt Matching", desc: "Genora identifies the active salt composition and finds every generic with the same ingredients" },
              { n: "03", title: "Compare & Choose", desc: "Browse alternatives sorted by price, view interactions, side effects and reviews" },
              { n: "04", title: "Save Money", desc: "Pick the cheapest safe alternative and save up to 50% on your medicine bill" },
            ].map((s, i) => (
              <div key={s.n} className={`step-item reveal stagger-${i + 1}`}>
                <div className="step-num">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOUNDERS ───────────────────────── */}
      <section className="founders-section" id="founders" style={{
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative background blobs */}
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, var(--green-lt) 0%, transparent 70%)',
          opacity: 0.5, pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', right: '-60px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, var(--green-lt) 0%, transparent 70%)',
          opacity: 0.4, pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-pill reveal">The Builders</div>
          <h2 className="section-h2 reveal">
            Built by 2<br /><em>passionate developers</em>
          </h2>
          <p className="section-sub reveal" style={{ marginBottom: '56px', maxWidth: '560px' }}>
            Two 5th-year Integrated M.Sc. CS students from <strong>Nirmala College, Muvattuppuzha</strong> — solving a real healthcare problem for millions of Indians.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '28px',
            marginTop: '8px'
          }}>
            {/* Karthik */}
            <div className="reveal stagger-1" style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '32px',
              display: 'flex', flexDirection: 'column', gap: '20px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              transition: 'transform .25s, box-shadow .25s',
              cursor: 'default'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              {/* Top strip accent */}
              <div style={{ height: '3px', background: 'linear-gradient(90deg, var(--green), var(--green-lt2))', borderRadius: '2px', margin: '-32px -32px 0', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '16px',
                  background: 'linear-gradient(135deg, #2D7A4F, #4CAF78)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem', fontWeight: 800, color: '#fff',
                  letterSpacing: '1px', flexShrink: 0,
                  boxShadow: '0 4px 16px rgba(45,122,79,0.35)'
                }}>KU</div>
                <div>
                  <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '4px' }}>
                    Co-Founder · Full Stack
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text1)', lineHeight: 1.2 }}>
                    Karthik Unnikrishnan
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.7, margin: 0 }}>
                Built Genora end-to-end — React frontend, FastAPI backend, PostgreSQL database,
                and the full AI image pipeline using EasyOCR. Also founder of <strong>Bright Future</strong>,
                a career guidance initiative for students.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['React · Vite', 'FastAPI', 'PostgreSQL', 'EasyOCR', 'Python', 'Full Stack'].map(t => (
                  <span key={t} style={{
                    fontSize: '.68rem', fontWeight: 600, padding: '4px 10px',
                    borderRadius: '20px', background: 'var(--green-lt)',
                    color: 'var(--green)', border: '1px solid var(--green-lt2)',
                    letterSpacing: '.3px'
                  }}>{t}</span>
                ))}
              </div>

              <div style={{
                marginTop: 'auto', paddingTop: '16px',
                borderTop: '1px solid var(--border)',
                fontSize: '.75rem', color: 'var(--text3)',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <span style={{ fontSize: '1rem' }}>🎓</span>
                Integrated M.Sc. CS &amp; Data Science · Nirmala College · Batch 2026
              </div>
            </div>

            {/* Fidha */}
            <div className="reveal stagger-2" style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '32px',
              display: 'flex', flexDirection: 'column', gap: '20px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              transition: 'transform .25s, box-shadow .25s',
              cursor: 'default'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              {/* Top strip accent */}
              <div style={{ height: '3px', background: 'linear-gradient(90deg, #4CAF78, var(--green-lt2))', borderRadius: '2px', margin: '-32px -32px 0', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '16px',
                  background: 'linear-gradient(135deg, #3d8b5e, #5dbf85)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem', fontWeight: 800, color: '#fff',
                  letterSpacing: '1px', flexShrink: 0,
                  boxShadow: '0 4px 16px rgba(45,122,79,0.35)'
                }}>FF</div>
                <div>
                  <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '4px' }}>
                    Co-Founder · Data &amp; UI
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text1)', lineHeight: 1.2 }}>
                    Fidha Fathima Salim
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.7, margin: 0 }}>
                Drives data science, medicine dataset curation, and UI/UX design for Genora.
                Focused on making healthcare data accessible, accurate and beautiful for
                every patient across India.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Data Science', 'UI/UX Design', 'Python', 'React', 'Dataset Curation', 'ML'].map(t => (
                  <span key={t} style={{
                    fontSize: '.68rem', fontWeight: 600, padding: '4px 10px',
                    borderRadius: '20px', background: 'var(--green-lt)',
                    color: 'var(--green)', border: '1px solid var(--green-lt2)',
                    letterSpacing: '.3px'
                  }}>{t}</span>
                ))}
              </div>

              <div style={{
                marginTop: 'auto', paddingTop: '16px',
                borderTop: '1px solid var(--border)',
                fontSize: '.75rem', color: 'var(--text3)',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <span style={{ fontSize: '1rem' }}>🎓</span>
                Integrated M.Sc. CS &amp; Data Science · Nirmala College · Batch 2026
              </div>
            </div>
          </div>

          {/* Bottom quote */}
          <div className="reveal" style={{
            marginTop: '48px', padding: '28px 36px',
            background: 'linear-gradient(135deg, var(--green-lt), transparent)',
            border: '1px solid var(--green-lt2)',
            borderRadius: '16px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--text1)', fontWeight: 500, lineHeight: 1.6 }}>
              "Healthcare should be affordable for everyone. Genora is our answer."
            </div>
            <div style={{ marginTop: '10px', fontSize: '.75rem', color: 'var(--green)', fontWeight: 600, letterSpacing: '.5px' }}>
              KARTHIK &amp; FIDHA · NIRMALA COLLEGE, MUVATTUPPUZHA
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────── */}
      <footer>
        <div className="foot-brand">
          <div className="foot-logo">
            <div className="foot-logo-mark">G</div>
            Genora
          </div>
          <div className="foot-desc">India's smart medicine alternative finder. Helping patients save money without compromising on health since 2026.</div>
        </div>
        <div>
          <div className="foot-col-title">Navigate</div>
          <div className="foot-links">
            {["Search", "Features", "How it Works", "Founders"].map(l => <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} className="foot-link">{l}</a>)}
          </div>
        </div>
        <div>
          <div className="foot-col-title">Resources</div>
          <div className="foot-links">
            <a href="#" className="foot-link">Drug Interactions</a>
            <a href="#" className="foot-link">Image Scan</a>
          </div>
        </div>
        <div>
          <div className="foot-col-title">Technical</div>
          <div className="foot-mono">
            <strong>7,466</strong> medicines<br />
            <strong>12,675</strong> ingredients<br />
            FastAPI · PostgreSQL<br />
            React · Vite · Tailwind<br />
            EasyOCR · Moondream2
          </div>
        </div>
      </footer>
      <div className="foot-bottom">
        <div>© 2026 Genora · Built by Karthik &amp; Fidha · Nirmala College, Muvattuppuzha</div>
        <div>Built for India's healthcare access · All Free Tier Deployment</div>
      </div>
    </>
  )
}