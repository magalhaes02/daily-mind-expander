import Link from "next/link";

type HomeTileProps = {
  href: string;
  emoji: string;
  title: string;
  subtitle: string;
  accent: string;
};

export default function HomeTile({
  href,
  emoji,
  title,
  subtitle,
  accent,
}: HomeTileProps) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          padding: "clamp(20px, 5.5vw, 28px)",
          borderRadius: "22px",
          background: `linear-gradient(135deg, ${accent}26, rgba(15, 23, 42, 0.85))`,
          border: `1px solid ${accent}66`,
          minHeight: "120px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "14px",
          transition: "transform 0.1s ease, border-color 0.1s ease",
        }}
      >
        <div style={{ fontSize: "clamp(34px, 9vw, 42px)", lineHeight: 1 }}>
          {emoji}
        </div>
        <div>
          <h3
            style={{
              margin: "0 0 6px 0",
              fontSize: "clamp(18px, 5vw, 22px)",
              fontWeight: "bold",
              color: "#f1f5f9",
              lineHeight: 1.2,
            }}
          >
            {title}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "clamp(13px, 3.6vw, 15px)",
              color: "#94a3b8",
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>
    </Link>
  );
}
