import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "で？（So What?）",
  description:
    "自身の発言に対して常に「で？」と返してくるチャットボット。思考の深掘りと俯瞰的な視点をそっと後押しします。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
