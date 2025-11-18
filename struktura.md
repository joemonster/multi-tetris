# Struktura projektu Tetris

```
multi-tetris/
├── app/
│   ├── components/
│   │   ├── Controls.tsx       # Kontrolki mobilne (przyciski)
│   │   ├── GameBoard.tsx      # Plansza gry 10x20
│   │   ├── GameOver.tsx       # Modal końca gry
│   │   ├── NextPiece.tsx      # Podgląd następnego klocka
│   │   └── ScorePanel.tsx     # Panel z wynikiem, liniami, poziomem
│   ├── hooks/
│   │   ├── useGameLogic.ts    # Główna logika gry (stan, akcje)
│   │   └── useKeyboardControls.ts  # Obsługa klawiatury
│   ├── types/
│   │   └── game.types.ts      # Typy TypeScript (GameState, Tetromino, etc.)
│   ├── utils/
│   │   ├── gameHelpers.ts     # Funkcje pomocnicze (kolizje, czyszczenie linii)
│   │   └── tetrominos.ts      # Definicje klocków (kształty, kolory)
│   ├── favicon.ico
│   ├── globals.css            # Style globalne (Tailwind)
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Główna strona gry
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```
