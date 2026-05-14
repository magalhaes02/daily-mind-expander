import Link from "next/link";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header
      style={{
        marginBottom: "24px",
      }}
    >
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "#7dd3fc",
          textDecoration: "none",
          fontSize: "clamp(13px, 3.6vw, 15px)",
          fontWeight: "bold",
          marginBottom: "12px",
        }}
      >
        <span>←</span>
        <span>Início</span>
      </Link>
      <h1
        style={{
          fontSize: "clamp(26px, 7vw, 38px)",
          margin: "0 0 6px 0",
          lineHeight: 1.15,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            margin: 0,
            color: "#94a3b8",
            fontSize: "clamp(14px, 3.8vw, 16px)",
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}
