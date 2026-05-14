import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "./ServiceWorkerRegister";
import BottomNav from "./BottomNav";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Daily Mind Expander",
  description:
    "Briefing diário de expansão intelectual e conhecimento geral.",
  applicationName: "Daily Mind Expander",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Mind Expander",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className={nunito.variable}>
      <body>
        <ServiceWorkerRegister />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
