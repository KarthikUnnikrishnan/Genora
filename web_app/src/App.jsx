import { useState, useEffect, useRef } from "react"
import Navbar from "./components/Navbar"
import ImageSearch from "./components/search/ImageSearch"
import DetailPanel from "./components/results/DetailPanel"
import { searchMedicine } from "./api/genora"
import { ORIGINAL, ALTERNATIVES, STATS, SUGGESTIONS, PRESC_MEDICINES } from "./data/medicines"

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

  useReveal()

  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true)
    setResults(null)
    setSelectedAlt(null)
    setLastQuery(query)
    try {
      const data = await searchMedicine(query)
      setResults(data)
      setSelectedAlt(null)
      setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 100)
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
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        <div className="hero-badge">
          <div className="bdot" style={{width:'6px',height:'6px',borderRadius:'50%',background:'var(--green)',animation:'pulse 2s ease infinite'}} />
          India's Generic Medicine Finder · 7,466 Medicines
        </div>

        <h1 className="hero-h1">
          Find the <em>cheaper</em><br/>
          <em>alternative</em> instantly
        </h1>

        <p className="hero-sub">
          Search by name, scan a strip, or upload a prescription. Genora finds every generic alternative — ranked by price — in seconds.
        </p>

        <div className="mode-switcher">
          <button className={`modebt${mode==='text'?' active':''}`} onClick={()=>setMode('text')}>🔍 &nbsp;Text Search</button>
          <button className={`modebt${mode==='image'?' active':''}`} onClick={()=>setMode('image')}>📷 &nbsp;Image Scan</button>
        </div>

        <div className="input-panel">
          {mode === 'text' ? (
            <div className="text-panel">
              <div className="search-field">
                <input type="text" placeholder="Medicine name or salt composition…"
                  value={query} onChange={e=>setQuery(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&handleSearch()} />
                <button className="search-go" onClick={handleSearch} disabled={loading}>
                  {loading ? 'Searching…' : 'Search →'}
                </button>
              </div>
              <div className="suggestions">
                {['Paracetamol 500mg','Azithromycin 500','Metformin 500','Pantoprazole 40mg','Amoxicillin 250'].map(s=>(
                  <span key={s} className="sugg" onClick={()=>setQuery(s)}>{s}</span>
                ))}
              </div>
            </div>
          ) : (
            <ImageSearch onResults={handleImageResults} />
          )}
        </div>

        <div className="hero-stats">
          {[{num:7466,label:'Medicines Indexed'},{num:12675,label:'Ingredient Records'},{num:49,label:'Dosage Forms'},{num:3,label:'AI Scan Modes'}].map(s=>(
            <div key={s.label} className="hstat">
              <div className="hstat-num"><StatNum target={s.num} /></div>
              <div className="hstat-label">{s.label}</div>
            </div>
          ))}
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
          <div className="orig-card" style={{marginBottom:'32px'}}>
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
              <div className="chip">💊 {results.medicine.form}</div>
              <div className="chip">🏭 {results.medicine.manufacturer}</div>
              <div className="chip ok">✓ Available</div>
            </div>
          </div>

          {/* Alternatives */}
          {results.alternatives.length > 0 ? (
            <>
              <div style={{display:'flex', alignItems:'center', 
                justifyContent:'space-between', marginBottom:'16px'}}>
                <div style={{fontSize:'.65rem', fontWeight:700, 
                  letterSpacing:'1px', textTransform:'uppercase', color:'var(--text3)'}}>
                  {results.alternatives.length} Generic Alternatives — Same Salt
                </div>
              </div>
              <div className="alts-grid" style={{marginBottom:'32px'}}>
                {results.alternatives.map((alt, i) => (
                  <div
                    key={alt.id || i}
                    className={`alt-card${selectedAlt?.id === alt.id ? ' selected' : ''}`}
                    onClick={() => selectAlt(alt)}
                  >
                    <div className="alt-num">#{String(i+1).padStart(2,'0')}</div>
                    <div className="alt-name">{alt.name}</div>
                    <div className="alt-mfr">{alt.manufacturer}</div>
                    <div className="alt-bottom">
                      <div>
                        <div className="alt-price">₹{Number(alt.price || 0).toFixed(2)}</div>
                        <div className="alt-form">{alt.form}</div>
                      </div>
                      {results.medicine.price && alt.price && (
                        <span className="alt-save pos" style={{ background: "rgba(52,211,153,0.08)", color: "var(--green)", border: "1px solid rgba(52,211,153,0.2)" }}>
                          SAVE ₹{(results.medicine.price - alt.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{padding:'32px', textAlign:'center', color:'var(--text3)',
              background:'var(--card)', borderRadius:'14px', marginBottom:'32px',
              border:'1px solid var(--border)'}}>
              No generic alternatives found for this salt composition.
            </div>
          )}

          {/* Detail panel */}
          <div id="detail">
            <DetailPanel
              medicine={displayMed}
              isSaved={selectedAlt 
                ? `Save ₹${(results.medicine.price - selectedAlt.price).toFixed(2)} vs original`
                : '— Searched Medicine'}
            />
          </div>
        </div>
      )}

      {/* ── FEATURES ───────────────────────── */}
      <section className="features-section" id="features">
        <div style={{marginBottom:'48px'}}>
          <div className="section-pill">✦ Why Genora</div>
          <h2 className="section-h2">Everything you need to<br/>save on <em>medicine</em></h2>
          <p className="section-sub">Genora combines a massive medicine database, 
          smart AI image recognition, and real-time price comparison.</p>
        </div>

        <div className="features-grid">
          {[
            { icon: "🔍", title: "Smart Text Search", desc: "Search by brand name, salt composition, or manufacturer. Fuzzy matching finds the right medicine even with spelling variations." },
            { icon: "📷", title: "AI Image Recognition", desc: "Photograph any medicine strip, box, prescription or tablet. Our AI extracts the name and finds alternatives instantly." },
            { icon: "💰", title: "Price Comparison", desc: "All generic alternatives sorted cheapest first. Compare prices across every manufacturer for the exact same active ingredient." },
            { icon: "⚠️", title: "Drug Interactions", desc: "See all known drug interactions before switching medicines. Severity levels and brand names for every interaction." },
            { icon: "📋", title: "Prescription Scanner", desc: "Upload a full prescription and Genora identifies every medicine on it, finding cheaper alternatives for each one." },
            { icon: "⭐", title: "Patient Reviews", desc: "Excellent, Average and Poor review breakdowns from real patients to help you make the most informed choice." },
          ].map((f, i) => (
            <div key={f.title} className={`feat-card reveal stagger-${i + 1}`}>
              <div className="feat-icon">{f.icon}</div>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────── */}
      <section className="how-section" id="how">
        <div className="how-inner">
          <div className="section-pill reveal" style={{ display: "inline-flex" }}>✦ Simple Process</div>
          <h2 className="section-h2 reveal" style={{ margin: "0 auto 16px", textAlign: "center", maxWidth: "none" }}>
            How <em>Genora</em> works
          </h2>
          <p className="section-sub reveal" style={{ margin: "0 auto", textAlign: "center" }}>
            From search to savings in under 3 seconds
          </p>
          <div className="steps-row">
            {[
              { n: "01", icon: "🔍", title: "Search or Scan", desc: "Type a medicine name or upload / scan a medicine image using our AI camera" },
              { n: "02", icon: "🧬", title: "Salt Matching", desc: "Genora identifies the active salt composition and finds every generic with the same ingredients" },
              { n: "03", icon: "📊", title: "Compare & Choose", desc: "Browse alternatives sorted by price, view interactions, side effects and reviews" },
              { n: "04", icon: "💊", title: "Save Money", desc: "Pick the cheapest safe alternative and save up to 50% on your medicine bill" },
            ].map((s, i) => (
              <div key={s.n} className={`step-item reveal stagger-${i + 1}`}>
                <div className="step-num">{s.n}</div>
                <div className="step-icon-big">{s.icon}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOUNDERS ───────────────────────── */}
      <section className="founders-section" id="founders">
        <div className="section-pill reveal">✦ The Builder</div>
        <h2 className="section-h2 reveal">Built by one<br/><em>passionate developer</em></h2>
        <p className="section-sub reveal" style={{marginBottom:'40px'}}>A 4th year CS student solving a real healthcare problem.</p>

        <div className="founder-card reveal">
          <div className="founder-avatar">KU</div>
          <div className="founder-role">Co-Founder · Full Stack Developer</div>
          <div className="founder-name">Karthik Unnikrishnan</div>
          <div className="founder-bio">
            4th year Integrated M.Sc. Computer Science &amp; Data Science. Building Genora solo — React UI, FastAPI backend, AI image pipeline and full deployment. Also founder of <strong>Bright Future</strong>, a career guidance initiative.
          </div>
          <div className="founder-tags">
            {['React · Vite','FastAPI','PostgreSQL','EasyOCR','Bright Future'].map(t=>(
              <span key={t} className="founder-tag">{t}</span>
            ))}
          </div>
          <div className="college-note">
            🎓 <strong>Nirmala College, Muvattupuzha</strong> — Affiliated to Mahatma Gandhi University, Kerala · Batch 2025
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────── */}
      <footer>
        <div className="foot-brand">
          <div className="foot-logo">
            <div className="foot-logo-mark">⚕</div>
            Genora
          </div>
          <div className="foot-desc">India's smart medicine alternative finder. Helping patients save money without compromising on health since 2025.</div>
        </div>
        <div>
          <div className="foot-col-title">Navigate</div>
          <div className="foot-links">
            {["Search", "Features", "How it Works", "Founders"].map(l => <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} className="foot-link">{l}</a>)}
          </div>
        </div>
        <div>
          <div className="foot-col-title">Account</div>
          <div className="foot-links">
            <a href="#" className="foot-link">Log In</a>
            <a href="#" className="foot-link">Sign Up</a>
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
        <div>© 2025 Genora · Built by Karthik Unnikrishnan · Nirmala College, Muvattupuzha</div>
        <div>Built for India's healthcare access · All Free Tier Deployment</div>
      </div>
    </>
  )
}
