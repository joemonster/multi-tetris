import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DebugProvider } from "./contexts/DebugContext";

export const metadata: Metadata = {
  title: "Tetris - Classic Block Puzzle Game",
  description: "Play the classic Tetris game built with Next.js and React. Features smooth animations, responsive design, multiple themes, and local high score tracking.",
  keywords: ["tetris", "game", "puzzle", "blocks", "react", "nextjs", "themes"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="neon-tokyo">
      <body className="antialiased">
        <DebugProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </DebugProvider>
      </body>
    </html>
  );
}
