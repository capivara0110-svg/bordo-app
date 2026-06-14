import { C } from "../styles/theme.js";

export default function AnchorIcon({ size = 32, color = C.aqua }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <line x1="32" y1="14" x2="32" y2="52" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <line x1="18" y1="52" x2="46" y2="52" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <path d="M18 52 Q10 43 15 34" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M46 52 Q54 43 49 34" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"/>
      <circle cx="32" cy="17" r="4.5" fill="none" stroke={color} strokeWidth="3"/>
      <line x1="22" y1="25" x2="42" y2="25" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}
