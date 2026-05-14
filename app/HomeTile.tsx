import Link from "next/link";

type HomeTileProps = {
  href: string;
  emoji: string;
  title: string;
  subtitle: string;
  accent: string;
  badge?: string;
};

export default function HomeTile({
  href,
  emoji,
  title,
  subtitle,
  accent,
  badge,
}: HomeTileProps) {
  return (
    <Link
      href={href}
      className="dme-tile"
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "clamp(20px, 5.5vw, 28px)",
          borderRadius: "26px",
          background: `linear-gradient(140deg, ${accent}38 0%, ${accent}14 45%, rgba(15, 23, 42, 0.92) 100%)`,
          border: `2px solid ${accent}66`,
          minHeight: "140px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "16px",
          boxShadow: `0 8px 24px ${accent}1f, inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
          overflow: "hidden",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accent}55 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
          <span
            style={{
              fontSize: "clamp(40px, 11vw, 52px)",
              lineHeight: 1,
              filter: `drop-shadow(0 4px 12px ${accent}77)`,
            }}
          >
            {emoji}
          </span>
          {badge && (
            <span
              style={{
                padding: "4px 10px",
                borderRadius: "999px",
                background: accent,
                color: "#020617",
                fontSize: "10px",
                fontWeight: 900,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {badge}
            </span>
          )}
        </div>

        <div style={{ position: "relative" }}>
          <h3
            style={{
              margin: "0 0 6px 0",
              fontSize: "clamp(20px, 5.4vw, 24px)",
              fontWeight: 900,
              color: "#f8fafc",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "clamp(13px, 3.6vw, 15px)",
              color: "#cbd5e1",
              lineHeight: 1.5,
              fontWeight: 600,
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>
    </Link>
  );
}
