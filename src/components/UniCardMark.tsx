/** Neutral UniCard mark: a student card with a chip. Replaces the
 *  university logo, since this is an unofficial demo. */
export default function UniCardMark({ size = 28, variant = "dark" }: { size?: number; variant?: "dark" | "light" }) {
  const card = variant === "dark" ? "#FFFFFF" : "#28255A";
  const line = variant === "dark" ? "rgba(255,255,255,0.55)" : "#3374B5";
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" aria-hidden="true">
      <rect x="4" y="13" width="52" height="34" rx="6" fill={card} />
      <rect x="11" y="21" width="12" height="9" rx="2" fill="#E6B84A" />
      <rect x="11" y="36" width="26" height="4" rx="2" fill={line} />
      <rect x="29" y="22" width="20" height="4" rx="2" fill={variant === "dark" ? "#C9CCD6" : "#9FA6C0"} />
    </svg>
  );
}
