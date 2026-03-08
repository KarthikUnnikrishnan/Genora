import Navbar from "./components/Navbar"

export default function App() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: "64px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <h1 style={{ color: "#22c55e", fontFamily: "sans-serif" }}>Genora ✓</h1>
      </div>
    </>
  )
}
