import type { Metadata } from "next";
import "./globals.css";
import { ParentBridge } from "@/components/parent-bridge";

export const metadata: Metadata = {
  title: "Tom Pham | Personal Desktop",
  description: "Tom Pham's personal desktop of projects, ideas, and digital experiences.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased"><ParentBridge />{children}</body>
    </html>
  );
}
