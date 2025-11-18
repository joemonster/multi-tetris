import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tetris - Classic Block Puzzle Game",
  description: "Play the classic Tetris game built with Next.js and React. Features smooth animations, responsive design, and local high score tracking.",
  keywords: ["tetris", "game", "puzzle", "blocks", "react", "nextjs"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
