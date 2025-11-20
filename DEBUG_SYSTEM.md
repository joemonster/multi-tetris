# System Debugowania - Multi-Tetris

## Przegląd

System debugowania został zaprojektowany do monitorowania komunikacji sieciowej, zdarzeń serwerowych i logowania wiadomości wysyłanych/odbieranych w grze multiplayer. System składa się z dwóch głównych widoków:

### 1. **Server Status Panel (Sidebar)**
- **Lokalizacja**: Prawa strona ekranu na stronach głównej (`/`) i poczekalni (`/queue`)
- **Funkcjonalność**:
  - Wyświetla liczbę graczy online
  - Pokazuje ostatnie 20 zdarzeń w kolejności chronologicznej
  - Każde zdarzenie ma kolor identyfikujący typ
  - Wyświetla znacznik czasu zdarzenia

### 2. **Game Debug Panel (Floating)**
- **Lokalizacja**: Prawy dolny róg ekranu gry (`/game/[roomId]`)
- **Funkcjonalność**:
  - Panel rozwijany/zwijany przyciskiem `[+] DEBUG` / `[-] DEBUG`
  - Wyświetla ostatnie 15 logów
  - Zawiera przycisk `[WYCZYŚĆ]` do czyszczenia logów
  - Pokazuje liczbę aktualnych graczy i logów

## Typy Zdarzeń i Kolory

### Typy:
- **`event`** - Ogólne zdarzenia serwera (połączenie, rozłączenie, matchmaking)
- **`sent`** - Wiadomości wysłane do serwera
- **`received`** - Wiadomości otrzymane z serwera
- **`info`** - Informacje debugowania

### Kolory:
- 🟢 **Zielony** - Sukces, połączenie, wysyłanie
- 🔴 **Pomarańczowy** - Ostrzeżenie, błąd, timeout
- 🔵 **Niebieski** - Odbieranie, update
- ⚫ **Szary** - Ogólne informacje

## Architektura

### Komponenty

#### `DebugContext.tsx`
Context provider zarządzający stanem logów:
```typescript
interface DebugLog {
  id: string;              // Unikatowy ID
  timestamp: number;       // Czas zdarzenia
  type: 'event' | 'sent' | 'received' | 'info';
  title: string;          // Nazwa zdarzenia
  data?: unknown;         // Dodatkowe dane
  color: 'green' | 'orange' | 'blue' | 'gray';
}
```

Metody:
- `addLog(log)` - Dodaj nowe zdarzenie
- `clearLogs()` - Wyczyść wszystkie logi
- `setOnlineCount(count)` - Aktualizuj liczbę graczy

#### `ServerStatusPanel.tsx`
Sidebar wyświetlający logi w formie listy. Maksymalnie 100 logów przechowywanych w pamięci.

#### `GameDebugPanel.tsx`
Rozwijany panel do gry z możliwością minimalizacji i czyszczenia.

### Hooki z Logowaniem

#### `useSocket.ts`
Loguje:
- Nawiązanie połączenia (`Połączenie nawiązane`)
- Zamknięcie połączenia (`Połączenie zamknięte`)
- Błędy (`Błąd połączenia`)
- Wysyłane wiadomości (`Wysłano: [typ]`)
- Odbierane wiadomości (`Odebrano: [typ]`)

#### `useMultiplayerGame.ts`
Loguje:
- Update od przeciwnika (`Update od przeciwnika`)
- Rozłączenie przeciwnika (`Przeciwnik rozłączony`)
- Ponowne połączenie (`Przeciwnik ponownie połączony`)
- Koniec gry (`Koniec gry`)
- Początek gry (`Gra rozpoczęta vs [gracz]`)

#### `useMatchmaking.ts`
Loguje:
- Dołączenie do kolejki (`Dołączono do kolejki`)
- Aktualizacja pozycji (`Aktualizacja pozycji`)
- Znaleziony match (`Match znaleziony! vs [gracz]`)
- Timeout (`Timeout - nie znaleziono przeciwnika`)
- Błędy matchmakingu (`Błąd matchmakingu`)

## Jak Używać

### Monitorowanie Poczekalni
1. Przejdź na stronę główną lub `/queue`
2. Spójrz na prawy sidebar - `SERVER STATUS`
3. Obserwuj logi w czasie rzeczywistym

### Monitorowanie Gry
1. Gdy gra się zaczyna, zobaczysz przycisk `[+] DEBUG` w prawym dolnym rogu
2. Kliknij aby rozwinąć panel
3. Obserwuj wiadomości i eventy
4. Kliknij `[WYCZYŚĆ]` aby wyczyścić logi

### Interpretacja Logów

#### Typowy scenariusz matchmakingu:
```
> Połączenie nawiązane        (zielony)
> Wysłano: find_game          (zielony)
> Odebrano: queue_joined      (niebieski)
> Dołączono do kolejki        (zielony)
> Odebrano: queue_update      (niebieski)
> Aktualizacja pozycji (2)    (niebieski)
> Odebrano: match_found       (niebieski)
> Match znaleziony!           (zielony)
```

#### Typowy scenariusz gry:
```
> Gra rozpoczęta vs GRACZ_1234  (zielony)
> Wysłano: game_update          (zielony) [co ~100ms]
> Odebrano: opponent_update     (niebieski)
> Update od przeciwnika         (niebieski)
> Wysłano: game_over            (zielony)
> Odebrano: game_over           (niebieski)
> Koniec gry                    (pomarańczowy)
```

## Struktura Plików

```
app/
├── contexts/
│   └── DebugContext.tsx          # Context provider
├── components/debug/
│   ├── ServerStatusPanel.tsx      # Sidebar na stronach
│   └── GameDebugPanel.tsx         # Floating panel w grze
├── hooks/multiplayer/
│   ├── useSocket.ts              # + logowanie komunikacji
│   ├── useMatchmaking.ts         # + logowanie matchmakingu
│   └── useMultiplayerGame.ts     # + logowanie gry
├── page.tsx                      # + ServerStatusPanel
├── queue/page.tsx                # + ServerStatusPanel
├── game/[roomId]/page.tsx        # + GameDebugPanel
└── layout.tsx                    # + DebugProvider
```

## Limity

- **Maksymalnie 100 logów** przechowywanych w pamięci (stare są automatycznie usuwane)
- **Update częstotliwości**: Logi są aktualizowane w miarę przychodzenia zdarzeń (bez throttlingu)
- **Brak persistencji**: Logi są wymazywane po odświeżeniu strony

## Rozszerzenia

Aby dodać logowanie w innym miejscu:

```typescript
import { useDebug } from '@/contexts/DebugContext';

function MyComponent() {
  const { addLog } = useDebug();

  const handleEvent = () => {
    addLog({
      type: 'event',
      title: 'Moje zdarzenie',
      data: { someData: 'value' },
      color: 'green', // 'green' | 'orange' | 'blue' | 'gray'
    });
  };

  return <button onClick={handleEvent}>Kliknij</button>;
}
```

## Notatki Edukacyjne

System został zaprojektowany aby:
- Łatwo zrozumieć przepływ komunikacji między klientem a serwerem
- Widzieć dokładnie jakie wiadomości są wysyłane/odbierane
- Monitorować stan matchmakingu w czasie rzeczywistym
- Śledzić zdarzenia gry (start, update, koniec)
- Diagnozować problemy z połączeniem
