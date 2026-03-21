import { useState, useRef } from "react"
import { analyzeImage } from "../../api/genora"

const STEPS = [
  "Image loaded & preprocessed",
  "EasyOCR text extraction…",
  "Filtering medicine name candidates",
  "Matching against 7,466 medicines",
]

const TYPES = [
  { id: "strip", ico: "📦", lbl: "Strip / Box" },
  { id: "presc", ico: "📋", lbl: "Prescription" },
  { id: "tablet", ico: "💊", lbl: "Tablet" },
]

const HINTS = {
  strip: "JPG · PNG · HEIC · Strip or box photo",
  presc: "JPG · PNG · PDF · Doctor prescription",
  tablet: "JPG · PNG · Clear tablet photo",
}

export default function ImageSearch({ onResults }) {
  const [type, setType] = useState("strip")
  const [phase, setPhase] = useState("idle") // idle | processing | confirm
  const [stepsDone, setStepsDone] = useState([])
  const [activeStep, setActiveStep] = useState(-1)
  const [extracted, setExtracted] = useState("")
  const [confidence, setConfidence] = useState(0)
  const fileRef = useRef()

  function startAI() {
    // Capture the file immediately, because setting phase to 'processing'
    // will unmount the <input> and clear fileRef.current!
    const file = fileRef.current?.files[0]

    setPhase("processing")
    setStepsDone([])
    setActiveStep(0)

    let i = 0
    const iv = setInterval(() => {
      setStepsDone(prev => [...prev, i])
      i++
      if (i < STEPS.length) {
        setActiveStep(i)
      } else {
        clearInterval(iv)
        setTimeout(async () => {
          const fd = new FormData()
          if (file) {
            fd.append("image", file)
          } else {
            console.warn("No file found! Perhaps it was camera mode.")
            // You can handle camera mode here. For now we just return.
            alert("No file found to scan. Please try uploading again.")
            setPhase("idle")
            return
          }
          fd.append("type", type)
          
          try {
            const res = await analyzeImage(fd)
            setExtracted(res.extracted)
            setConfidence(res.confidence)
            setPhase("confirm")
            window._imageResults = res
          } catch(err) {
            console.error("Image scan error:", err)
            setPhase("idle")
            alert("Image scan failed: " + err.message)
          }
        }, 400)
      }
    }, 680)
  }

  function confirm() {
    if (window._imageResults) {
      onResults(window._imageResults.medicine, window._imageResults.alternatives, "image", type)
    }
  }

  function reset() {
    setPhase("idle")
    setStepsDone([])
    setActiveStep(-1)
    setExtracted("")
    if (fileRef.current) fileRef.current.value = ""
  }

  return (
    <div className="image-panel on">
      {/* Type selector */}
      <div className="img-types">
        {TYPES.map(t => (
          <div key={t.id} className={`imgtype${type === t.id ? " on" : ""}`} onClick={() => { setType(t.id); reset() }}>
            <span className="ico">{t.ico}</span>
            <span className="lbl">{t.lbl}</span>
          </div>
        ))}
      </div>

      {/* Dropzone */}
      {phase === "idle" && (
        <>
          <div className="dropzone" onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => { if (e.target.files[0]) startAI() }} />
            <div className="dz-icon">↑</div>
            <div className="dz-title">Drop image here or click to upload</div>
            <div className="dz-sub">{HINTS[type]}</div>
          </div>
          <div className="cam-row" onClick={startAI}>📷 &nbsp; Open Camera</div>
        </>
      )}

      {/* AI Processing */}
      {phase === "processing" && (
        <div className="ai-proc on">
          <div className="ai-header">
            <div className="ai-spinner" />
            <div className="ai-title">
              {activeStep < STEPS.length ? STEPS[activeStep] : "Complete"}
            </div>
          </div>
          <div className="ai-steps">
            {STEPS.map((s, i) => (
              <div key={i} className={`ai-row${stepsDone.includes(i) ? " done" : activeStep === i ? " act" : ""}`}>
                <div className="ai-dot" />
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm */}
      {phase === "confirm" && (
        <div className="extract-box on">
          <div className="ext-label">Medicine Detected — Confirm to View Alternatives</div>
          <div className="ext-text" style={{ fontSize: "1.25rem", fontWeight: "600", textAlign: "center", color: "var(--brand)", padding: "24px 16px" }}>
            {window._imageResults?.medicine?.name || "Unknown Medicine"}
          </div>
          <div className="ext-conf">
            <span className="ext-conf-lbl">AI Confidence</span>
            <div className="ext-track">
              <div className="ext-fill" style={{ width: `${confidence}%` }} />
            </div>
            <span className="ext-pct">{confidence}%</span>
          </div>
          <div className="ext-btns">
            <button className="ext-btn yes" onClick={confirm}>✓ View Alternatives</button>
            <button className="ext-btn no" onClick={reset}>↺ Scan Another</button>
          </div>
        </div>
      )}
    </div>
  )
}
