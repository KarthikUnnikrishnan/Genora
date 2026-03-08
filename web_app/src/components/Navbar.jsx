import { useState, useEffect } from "react"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
      height: "64px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 48px",
      background: scrolled ? "rgba(13,20,16,0.97)" : "rgba(13,20,16,0.85)",
      backdropFilter: "blur(20px)",
      borderBottom: scrolled ? "1px solid rgba(34,197,94,0.22)" : "1px solid rgba(34,197,94,0.09)",
      boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.5)" : "none",
      transition: "all 0.3s ease",
    }}>

      {/* Logo */}
      <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
        <div style={{
          width: "34px", height: "34px", borderRadius: "9px",
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "16px", boxShadow: "0 0 16px rgba(34,197,94,0.3)",
        }}>⚕</div>
        <span style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.5px", color: "#dff0e4" }}>
          Genora
        </span>
      </a>

      {/* Nav Links */}
      <ul style={{ display: "flex", gap: "4px", listStyle: "none", margin: 0, padding: 0 }}>
        {["Search", "Features", "How it Works", "Founders"].map((item) => (
          <li key={item}>
            <a href={`#${item.toLowerCase().replace(/ /g, "-")}`} style={{
              padding: "6px 14px", borderRadius: "8px",
              fontSize: "0.79rem", fontWeight: 600,
              color: "#3a5c44", textDecoration: "none",
              transition: "color 0.2s, background 0.2s",
            }}
            onMouseEnter={e => { e.target.style.color = "#6fa882"; e.target.style.background = "rgba(34,197,94,0.07)" }}
            onMouseLeave={e => { e.target.style.color = "#3a5c44"; e.target.style.background = "transparent" }}
            >{item}</a>
          </li>
        ))}
      </ul>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

        {/* AI Active pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          fontSize: "0.67rem", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase",
          color: "#4ade80",
          background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.18)",
          padding: "5px 13px", borderRadius: "100px", marginRight: "4px",
        }}>
          <div style={{
            width: "5px", height: "5px", borderRadius: "50%", background: "#4ade80",
            boxShadow: "0 0 5px #4ade80",
            animation: "blink 2s ease infinite",
          }} />
          AI Active
        </div>

        {/* Log In */}
        <button
          onClick={() => alert("Login coming soon!")}
          style={{
            padding: "7px 18px", borderRadius: "8px",
            background: "transparent", border: "1px solid rgba(34,197,94,0.2)",
            fontFamily: "inherit", fontSize: "0.76rem", fontWeight: 700,
            color: "#6fa882", cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(34,197,94,0.4)"; e.currentTarget.style.color = "#dff0e4" }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(34,197,94,0.2)"; e.currentTarget.style.color = "#6fa882" }}
        >
          Log In
        </button>

        {/* Sign Up */}
        <button
          onClick={() => alert("Signup coming soon!")}
          style={{
            padding: "7px 18px", borderRadius: "8px",
            background: "#22c55e", border: "none",
            fontFamily: "inherit", fontSize: "0.76rem", fontWeight: 800,
            color: "#0a150c", cursor: "pointer", transition: "background 0.2s, transform 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#4ade80"; e.currentTarget.style.transform = "translateY(-1px)" }}
          onMouseLeave={e => { e.currentTarget.style.background = "#22c55e"; e.currentTarget.style.transform = "translateY(0)" }}
        >
          Sign Up →
        </button>

      </div>

      {/* Blink keyframe injected once */}
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }`}</style>
    </nav>
  )
}
