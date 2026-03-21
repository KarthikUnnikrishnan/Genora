import { useState, useEffect } from "react"
import ThemeToggle from "./ThemeToggle"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  const links = [
    { label: "Search", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "How it Works", href: "#how" },
    { label: "Founders", href: "#founders" },
  ]

  return (
    <nav className={scrolled ? "scrolled" : ""}>
      <a href="#home" className="logo">
        <div className="logo-mark">⚕</div>
        <span className="logo-text">Genora</span>
      </a>

      <ul className="nav-links">
        {links.map(l => (
          <li key={l.label}>
            <a href={l.href} onClick={e => { e.preventDefault(); document.querySelector(l.href)?.scrollIntoView({ behavior: "smooth" }) }}>
              {l.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="nav-right">
        <div className="nav-badge">
          <div className="dot" />
          AI Active
        </div>
        <ThemeToggle />
        <button className="btn-login">Log In</button>
        <button className="btn-signup">Sign Up →</button>
      </div>
    </nav>
  )
}
