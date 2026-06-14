import { C, fonts } from "../styles/theme.js";

export default function Header({ title, sub, onBack, color = C.aqua }) {
  return (
    <div style={{ background: C.ocean, padding: "20px 20px 16px", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontSize: 18, cursor: "pointer", flexShrink: 0 }}>
            ←
          </button>
        )}
        <div>
          <div style={{ fontSize: 11, color: color, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>⚓ BORDO.</div>
          <div style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 800, color: C.white }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}
