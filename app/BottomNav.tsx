"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  emoji: string;
  label: string;
  color: string;
};

const ITEMS: NavItem[] = [
  { href: "/", emoji: "🏠", label: "Início", color: "#38bdf8" },
  { href: "/expandir", emoji: "📚", label: "Expandir", color: "#38bdf8" },
  { href: "/quizz", emoji: "🧠", label: "Quizz", color: "#c084fc" },
  { href: "/pensar", emoji: "💭", label: "Pensar", color: "#fbbf24" },
  { href: "/glossario", emoji: "🔍", label: "Glossário", color: "#5eead4" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(2, 6, 23, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(56, 189, 248, 0.15)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div
        style={{
          display: "flex",
          maxWidth: "720px",
          margin: "0 auto",
          padding: "8px 4px",
        }}
      >
        {ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                flex: "1 1 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "8px 4px",
                textDecoration: "none",
                borderRadius: "14px",
                background: active ? `${item.color}1a` : "transparent",
                transition: "background 0.15s ease",
              }}
            >
              <span
                style={{
                  fontSize: "22px",
                  lineHeight: 1,
                  filter: active ? "none" : "grayscale(0.3) opacity(0.85)",
                  transform: active ? "scale(1.1)" : "scale(1)",
                  transition: "transform 0.15s ease",
                }}
              >
                {item.emoji}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: active ? 800 : 700,
                  color: active ? item.color : "#94a3b8",
                  letterSpacing: "0",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
