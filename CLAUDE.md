# CLAUDE.md - Multi-Tetris Battle Arena

## Project Overview

**Multi-Tetris Battle Arena** is a modern multiplayer Tetris game built with Next.js 16, React 19, and PartyKit for real-time multiplayer functionality. The game features both solo and multiplayer modes with an arcade terminal aesthetic, multiple themes, and real-time matchmaking.

### Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4 with custom theming system
- **Real-time**: PartyKit (for Cloudflare deployment)
- **Development**: Concurrent dev servers (Next.js + PartyKit)

---

## Project Structure

```
multi-tetris/
├── app/                          # Next.js App Router
│   ├── components/               # React components
│   │   ├── Controls.tsx          # Mobile/touch game controls
│   │   ├── GameBoard.tsx         # Main 10x20 Tetris board
│   │   ├── GameOver.tsx          # Game over modal/screen
│   │   ├── NextPiece.tsx         # Next piece preview
│   │   ├── ScorePanel.tsx        # Score, lines, level display
│   │   ├── ThemeSelector.tsx     # Theme switcher UI
│   │   └── multiplayer/          # Multiplayer-specific components
│   │       ├── DisconnectWarning.tsx  # Opponent disconnect UI
│   │       ├── GameTimer.tsx          # Match timer
│   │       ├── MatchFound.tsx         # Match found notification
│   │       ├── ModeSelector.tsx       # Solo/Multiplayer selector
│   │       ├── NicknameInput.tsx      # Player nickname input
│   │       ├── OpponentBoard.tsx      # Opponent's board view
│   │       ├── PlayerCard.tsx         # Player info card
│   │       └── QueueStatus.tsx        # Matchmaking queue status
│   │
│   ├── contexts/                 # React contexts
│   │   └── ThemeContext.tsx      # Theme management context
│   │
│   ├── game/                     # Game routes
│   │   ├── [roomId]/             # Multiplayer game room
│   │   │   └── page.tsx          # Dynamic room page
│   │   └── solo/                 # Solo game mode
│   │       └── page.tsx          # Solo game page
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useGameLogic.ts       # Core game state & logic
│   │   ├── useKeyboardControls.ts # Keyboard input handler
│   │   └── multiplayer/          # Multiplayer hooks
│   │       ├── useMatchmaking.ts      # Queue & matchmaking
│   │       ├── useMultiplayerGame.ts  # Multiplayer game logic
│   │       └── useSocket.ts           # PartyKit socket connection
│   │
│   ├── lib/                      # Utilities & libraries
│   │   └── socket/
│   │       └── client.ts         # PartyKit client setup
│   │
│   ├── queue/                    # Matchmaking queue route
│   │   └── page.tsx              # Queue waiting page
│   │
│   ├── types/                    # TypeScript definitions
│   │   └── game.types.ts         # Game state, pieces, actions
│   │
│   ├── utils/                    # Helper functions
│   │   ├── gameHelpers.ts        # Collision detection, line clearing
│   │   └── tetrominos.ts         # Piece definitions (shapes, colors)
│   │
│   ├── globals.css               # Global styles + theme definitions
│   ├── layout.tsx                # Root layout with ThemeProvider
│   └── page.tsx                  # Landing page (mode selector)
│
├── party/                        # PartyKit server
│   └── index.ts                  # Multiplayer server logic
│
├── public/                       # Static assets
├── .gitignore                    # Git ignore rules
├── eslint.config.mjs             # ESLint configuration
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies & scripts
├── partykit.json                 # PartyKit configuration
├── postcss.config.mjs            # PostCSS config
├── tsconfig.json                 # TypeScript configuration
└── struktura.md                  # Polish structure documentation
```

---

## Key Architectural Patterns

### 1. Game State Management
- **Location**: `app/hooks/useGameLogic.ts`
- **Pattern**: Custom React hook with reducer-like state updates
- **State**: Board, current piece, next piece, score, lines, level, game status
- **Actions**: Move left/right/down, rotate, hard drop, pause, start/reset

### 2. Multiplayer Architecture
- **Real-time Backend**: PartyKit server (`party/index.ts`)
- **Client Connection**: `app/lib/socket/client.ts` (singleton PartySocket)
- **Matchmaking Flow**:
  1. Player enters nickname → joins queue
  2. Server matches 2 players → creates room
  3. 3-second countdown → game starts
  4. Real-time game state sync via WebSocket
  5. Game over detection → winner determination

### 3. Theming System
- **Implementation**: CSS custom properties + data attributes
- **Themes**:
  - `neon-tokyo` - Cyberpunk neon aesthetic (default)
  - `arcade-terminal` - Green monochrome CRT style
  - `brutalist` - High-contrast monochromatic design
  - `organic-flow` - Soft gradients and glassmorphism
- **Context**: `app/contexts/ThemeContext.tsx`
- **Styles**: `app/globals.css` (extensive theme variables)

### 4. Type Safety
- **Core Types**: `app/types/game.types.ts`
- **Key Types**:
  - `TetrominoType`: 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'
  - `GameState`: Complete game state interface
  - `GameAction`: Discriminated union of game actions
  - `Board`: `Cell[][]` (20 rows × 10 columns)
  - `CurrentPiece`: Active piece with position, rotation, color

---

## Development Workflows

### Starting Development

```bash
# Install dependencies
npm install

# Start both Next.js and PartyKit dev servers
npm run dev:all

# Or run separately:
npm run dev        # Next.js only (localhost:3000)
npm run dev:party  # PartyKit only (localhost:1999)
```

### Building & Deployment

```bash
# Build Next.js app
npm run build

# Start production server
npm start

# Deploy PartyKit server
npm run deploy:party
```

### Code Quality

```bash
# Run ESLint
npm run lint
```

---

## Key Conventions & Standards

### File Naming
- **Components**: PascalCase (e.g., `GameBoard.tsx`, `ScorePanel.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useGameLogic.ts`)
- **Utils**: camelCase (e.g., `gameHelpers.ts`, `tetrominos.ts`)
- **Types**: camelCase with `.types.ts` suffix (e.g., `game.types.ts`)

### Component Structure
- Use functional components with TypeScript
- Prefer named exports for components
- Use default export only for pages (Next.js requirement)
- Keep components focused and single-responsibility

### State Management Rules
- **Game Logic**: Always in `useGameLogic` hook
- **UI State**: Local component state (`useState`)
- **Global State**: React Context (themes, socket connection)
- **Multiplayer State**: Synced via PartyKit messages

### TypeScript Guidelines
- **Strict mode enabled**: All types must be explicit
- **No `any` types**: Use `unknown` if type is truly unknown
- **Interface over Type**: Use interfaces for object shapes
- **Exported types**: Define in `types/` directory

### CSS/Styling Conventions
- **Primary**: Tailwind utility classes
- **Theming**: CSS custom properties (`var(--property-name)`)
- **Theme-specific**: Use `[data-theme="name"]` selector
- **Animations**: Defined in `globals.css`, reusable via classes
- **Responsive**: Mobile-first approach with Tailwind breakpoints

---

## Game Logic Deep Dive

### Tetromino System
**File**: `app/utils/tetrominos.ts`

Defines all 7 standard Tetris pieces with:
- **Shapes**: 2D arrays (4×4 or 3×3 grids)
- **Colors**: Distinct colors per piece type
- **Rotation**: Handled in game logic (90° clockwise)

### Collision Detection
**File**: `app/utils/gameHelpers.ts`

Key functions:
- `isValidMove()`: Check if piece can move to position
- `hasCollision()`: Detect collisions with board/boundaries
- `placePiece()`: Lock piece to board
- `clearLines()`: Remove completed rows, update score

### Scoring System
**Constants**: `app/types/game.types.ts`

```typescript
SCORE_MULTIPLIERS = {
  1: 100,   // Single line
  2: 300,   // Double
  3: 500,   // Triple
  4: 800,   // Tetris!
}
```

Score = `MULTIPLIER × level`

### Speed Progression
- **Initial speed**: 1000ms per tick
- **Speed increase**: 50ms faster per level
- **Level up**: Every 10 lines cleared

---

## PartyKit Server Architecture

### Server State
**File**: `party/index.ts`

In-memory data structures:
- `queue`: Map<playerId, Player> - Matchmaking queue
- `games`: Map<roomId, GameRoom> - Active games
- `playerRooms`: Map<playerId, roomId> - Player→Room mapping
- `playerConnections`: Map<playerId, Connection> - WebSocket connections

### Message Protocol

#### Client → Server
```typescript
{ type: 'find_game', nickname: string }
{ type: 'cancel_queue' }
{ type: 'game_update', board, score, lines, level, gameOver }
{ type: 'game_over', roomId }
{ type: 'leave_game', roomId }
```

#### Server → Client
```typescript
{ type: 'queue_joined', position: number }
{ type: 'queue_update', position: number }
{ type: 'match_found', opponent: string, roomId: string }
{ type: 'game_start', roomId: string, opponent: string }
{ type: 'opponent_update', board, score, lines, level, gameOver }
{ type: 'opponent_disconnected' }
{ type: 'game_over', winner: string, reason: string }
{ type: 'queue_timeout' }
{ type: 'error', message: string }
```

### Matchmaking Logic
1. Player joins queue → sent position update
2. If 2+ players in queue → create match
3. Remove both from queue → create game room
4. Notify both players → 3-second countdown
5. Send `game_start` → redirect to `/game/[roomId]`

### Disconnect Handling
- Remove from queue if queuing
- Notify opponent if in game
- 60-second timeout before auto-win for opponent
- Clean up room and player mappings

---

## Environment Variables

```bash
# PartyKit server host (for production)
NEXT_PUBLIC_PARTYKIT_HOST=your-partykit-host.partykit.dev

# Development (default)
NEXT_PUBLIC_PARTYKIT_HOST=localhost:1999
```

---

## Common Development Tasks

### Adding a New Component
1. Create file in `app/components/` (or subdirectory)
2. Use TypeScript with proper typing
3. Follow naming conventions (PascalCase)
4. Import types from `app/types/game.types.ts`
5. Use Tailwind classes for styling
6. Respect current theme with CSS custom properties

### Adding a New Theme
1. Add theme definition in `app/globals.css`:
   ```css
   [data-theme="theme-name"] {
     --background: #color;
     --foreground: #color;
     /* ... other variables */
   }
   ```
2. Add theme-specific animations if needed
3. Update `ThemeSelector.tsx` to include new theme
4. Test with all components (especially GameBoard)

### Modifying Game Logic
1. **State changes**: Update `useGameLogic.ts`
2. **Scoring**: Modify constants in `game.types.ts`
3. **Physics**: Update helpers in `gameHelpers.ts`
4. **Pieces**: Modify definitions in `tetrominos.ts`
5. **Always test**: Solo mode first, then multiplayer sync

### Adding Multiplayer Features
1. **Server logic**: Update `party/index.ts`
2. **Client hook**: Modify `useSocket.ts` or create new hook
3. **Message types**: Add to both client and server
4. **UI updates**: Create/update components in `components/multiplayer/`
5. **Type safety**: Define message interfaces in relevant files

---

## Testing Checklist

When making changes, always test:

### Solo Mode
- [ ] Game starts correctly
- [ ] Pieces move/rotate properly
- [ ] Collision detection works
- [ ] Lines clear correctly
- [ ] Score updates accurately
- [ ] Level progression works
- [ ] Game over triggers appropriately
- [ ] Pause/unpause functions
- [ ] Theme switching doesn't break gameplay

### Multiplayer Mode
- [ ] Connection to PartyKit established
- [ ] Queue system works (join, position updates, cancel)
- [ ] Matchmaking pairs players correctly
- [ ] Countdown displays before game start
- [ ] Both players' games start simultaneously
- [ ] Opponent board updates in real-time
- [ ] Disconnect handling works (warnings, timeouts)
- [ ] Game over determines winner correctly
- [ ] Return to menu works properly

### Cross-browser & Responsive
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Mobile responsive (touch controls work)
- [ ] Keyboard controls work on desktop
- [ ] Themes render correctly across browsers
- [ ] Animations perform smoothly

---

## Git Workflow

### Branch Naming
- Feature branches: `claude/feature-name-{session-id}`
- Bug fixes: `fix/description`
- Refactors: `refactor/description`

### Commit Messages
Follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `refactor:` Code refactoring
- `style:` Formatting changes
- `docs:` Documentation updates
- `chore:` Maintenance tasks

### Example Workflow
```bash
# Create feature branch
git checkout -b claude/new-feature-{session-id}

# Make changes and commit
git add .
git commit -m "feat: Add new multiplayer feature"

# Push to remote
git push -u origin claude/new-feature-{session-id}

# Create pull request (via GitHub UI or gh CLI)
```

---

## Performance Considerations

### Game Loop Optimization
- **Tick rate**: Controlled by level-based speed
- **Render optimization**: Only re-render on state changes
- **Use React.memo()**: For expensive components (GameBoard, OpponentBoard)

### PartyKit Best Practices
- **Message batching**: Combine multiple updates when possible
- **State sync**: Send only changed data, not entire state
- **Connection cleanup**: Always clean up on disconnect

### Asset Optimization
- SVGs for icons (already in use)
- Minimal dependencies (keep bundle size small)
- Code splitting: Use dynamic imports for heavy components

---

## Debugging Tips

### Common Issues

**Issue**: Game state not updating
- Check `useGameLogic` hook logic
- Verify action dispatches are correct
- Check React DevTools for state changes

**Issue**: Multiplayer sync problems
- Check PartyKit server logs (console)
- Verify message format matches protocol
- Test with browser DevTools → Network → WS tab

**Issue**: Theme not applying
- Verify `data-theme` attribute on `<html>` element
- Check CSS custom property definitions in `globals.css`
- Inspect element to see computed CSS variables

**Issue**: Collision detection failing
- Log piece position and board state
- Test `isValidMove()` function in isolation
- Check board boundaries (10×20)

### Useful Debug Commands
```bash
# View PartyKit logs
npm run dev:party

# Check Next.js build for errors
npm run build

# Lint and find issues
npm run lint
```

---

## Future Considerations

### Planned Features (TODOs in codebase)
- Statistics page (linked from landing page)
- Match history page
- Leaderboard system
- Power-ups/special abilities
- Tournament brackets
- Spectator mode

### Scalability Notes
- PartyKit handles multiple rooms automatically
- Consider Redis for persistent leaderboards
- May need rate limiting for matchmaking
- Monitor Cloudflare Workers limits for PartyKit

---

## AI Assistant Guidelines

### When Working on This Codebase:

1. **Always read existing code** before making changes
2. **Maintain type safety** - never use `any`
3. **Follow established patterns** - don't introduce new paradigms without discussion
4. **Test both modes** - solo and multiplayer
5. **Preserve theme system** - ensure changes work across all themes
6. **Keep performance in mind** - game loop must stay responsive
7. **Document complex logic** - add comments for non-obvious code
8. **Use existing utilities** - check `utils/` before creating new helpers
9. **Respect the architecture** - don't mix concerns (game logic vs UI)
10. **Consider mobile** - touch controls must work alongside keyboard

### Code Review Checklist:
- [ ] TypeScript types are explicit and correct
- [ ] No console.logs in production code
- [ ] Components are properly typed
- [ ] Tailwind classes follow utility-first approach
- [ ] Game logic changes don't break multiplayer sync
- [ ] Changes are tested in all themes
- [ ] Mobile/desktop both tested
- [ ] No performance regressions
- [ ] Code follows existing naming conventions
- [ ] Documentation updated if needed

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [PartyKit Documentation](https://docs.partykit.io/)
- [React 19 Documentation](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Contact & Support

For questions or issues:
- Check existing GitHub issues
- Review commit history for context
- Reference this CLAUDE.md for conventions
- Test changes in both development modes

---

**Last Updated**: 2025-11-20
**Version**: 0.1.0
**Maintainer**: AI-assisted development
