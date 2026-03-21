# Phase 6: Interview Timer

## Context Links

- Top toolbar: `src/components/toolbar/top-toolbar.tsx`
- App layout: `src/App.tsx`
- Design system: `src/styles.css`
- Keyboard shortcuts: `src/hooks/use-keyboard-shortcuts.ts`

## Overview

- **Priority**: P0
- **Branch**: `feat/interview-timer`
- **Depends on**: None (independent of multi-tab workspace)
- **Status**: Planned
- **Estimated effort**: 0.5 days

## Key Insights

- Trivial to build but powerfully reinforces the interview-prep positioning.
- A thin progress bar at the very top of the screen (above toolbar) is the most non-intrusive approach.
- Should support customizable total duration and optional phase breakdowns.
- Timer state does NOT need to persist (it's session-only). No Zustand store needed -- React component state is sufficient.
- Audio alert (optional) at phase transitions and time-up. Use Web Audio API for a simple beep (no audio file dependency).

## Requirements

### Functional

1. **Timer bar**: Thin (3-4px) progress bar at the top of the viewport, above the toolbar
2. **Start/pause/reset** controls accessible from the toolbar
3. **Configurable duration**: Default 45 minutes. Quick presets: 30, 35, 40, 45, 60 minutes.
4. **Phase breakdown** (optional, toggleable):
   - Requirements & Estimation: first 20% of time (e.g., 9 min of 45)
   - High-Level Design: next 30% (e.g., 13.5 min)
   - Detailed Design: next 30% (e.g., 13.5 min)
   - Wrap-up & Questions: final 20% (e.g., 9 min)
5. **Phase indicator**: When phases are enabled, the progress bar shows colored segments and a small label indicates the current phase
6. **Time display**: Shows remaining time (mm:ss) in the toolbar area next to timer controls
7. **Alerts**:
   - Color change: green -> yellow (25% remaining) -> red (10% remaining)
   - Optional beep at phase transitions and at 5 minutes remaining
   - Visual flash when time is up
8. **Keyboard shortcut**: `Ctrl/Cmd+Shift+T` to toggle timer start/pause
9. **Minimal footprint**: Timer is completely hideable (collapse to nothing when not in use)
10. **"Start Interview" button**: Prominent button that starts the timer and optionally opens template picker

### Non-Functional

1. No new npm dependencies
2. Uses `requestAnimationFrame` or `setInterval` for countdown (1-second granularity is fine)
3. Timer continues running when switching workspace tabs
4. Negligible performance impact

## Architecture

### No Zustand Store Needed

Timer state is ephemeral (not saved to project). Use `useState` + `useRef` in a custom hook:

```typescript
// src/hooks/use-interview-timer.ts

interface TimerPhase {
  name: string
  color: string
  percent: number // fraction of total time (0-1)
}

interface UseInterviewTimerReturn {
  // State
  isRunning: boolean
  isPaused: boolean
  totalSeconds: number
  remainingSeconds: number
  elapsedPercent: number // 0-100
  currentPhase: TimerPhase | null
  phasesEnabled: boolean
  // Actions
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  setDuration: (minutes: number) => void
  togglePhases: () => void
  // Derived
  remainingFormatted: string // "32:15"
  urgencyLevel: 'normal' | 'warning' | 'critical' | 'expired'
}
```

### Component Structure

```
src/hooks/
└── use-interview-timer.ts        # Timer logic hook

src/components/timer/
├── timer-progress-bar.tsx        # Thin bar at top of viewport
├── timer-controls.tsx            # Start/pause/reset + duration picker in toolbar
└── timer-beep.ts                 # Web Audio API beep utility (no audio files)
```

### Layout

```
┌─ timer-progress-bar (3px, full width, above everything) ──────────────┐
│ ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ [Requirements]      [High-Level]       [Detailed]        [Wrap-up]    │
└───────────────────────────────────────────────────────────────────────┘
┌─ TopToolbar ──────────────────────────────────────────────────────────┐
│ SDB | Project Name          ... existing buttons ...  ⏱ 32:15 [▶][↺]│
└───────────────────────────────────────────────────────────────────────┘
```

### Phase Colors

| Phase | Color | % of Time |
|-------|-------|-----------|
| Requirements & Estimation | `#6366f1` (indigo) | 20% |
| High-Level Design | `#22c55e` (green) | 30% |
| Detailed Design | `#f59e0b` (amber) | 30% |
| Wrap-up & Questions | `#8b5cf6` (purple) | 20% |

### Urgency Colors (Progress Bar)

| Urgency | Remaining | Color |
|---------|-----------|-------|
| Normal | > 25% | `#22c55e` (green) |
| Warning | 10-25% | `#eab308` (yellow) |
| Critical | < 10% | `#ef4444` (red, pulsing) |
| Expired | 0% | `#ef4444` (red, flashing) |

## Related Code Files

### Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add `<TimerProgressBar />` above the toolbar |
| `src/components/toolbar/top-toolbar.tsx` | Add `<TimerControls />` to the right side of toolbar |
| `src/hooks/use-keyboard-shortcuts.ts` | Add Ctrl+Shift+T shortcut for timer toggle |

### Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/use-interview-timer.ts` | Timer logic custom hook |
| `src/components/timer/timer-progress-bar.tsx` | Top progress bar |
| `src/components/timer/timer-controls.tsx` | Toolbar controls (time display, start/pause/reset, duration picker) |
| `src/components/timer/timer-beep.ts` | Web Audio beep generator |

### Files to Delete

None.

## Implementation Steps

### Step 1: Create timer hook (1-2 hours)

1. Create `src/hooks/use-interview-timer.ts`:
   - `useState` for: `isRunning`, `remainingSeconds`, `totalSeconds`, `phasesEnabled`.
   - `useRef` for interval handle.
   - `useEffect` to set up `setInterval(1000)` when running, clear on pause/unmount.
   - `start()`: Begin countdown from `totalSeconds`.
   - `pause()`: Clear interval, preserve remaining.
   - `resume()`: Restart interval from current remaining.
   - `reset()`: Clear interval, set remaining = total.
   - `setDuration(minutes)`: Update total, reset.
   - `togglePhases()`: Toggle phase breakdown on/off.
   - Derived: `elapsedPercent`, `currentPhase` (based on elapsed %), `remainingFormatted` (mm:ss), `urgencyLevel`.

### Step 2: Create beep utility (30 min)

1. Create `src/components/timer/timer-beep.ts`:
   - `playBeep(frequency?: number, duration?: number)`: Creates an `OscillatorNode` via Web Audio API.
   - Default: 800Hz, 200ms for phase transition.
   - Higher pitch (1200Hz) for time-up warning.
   - Gracefully no-op if Web Audio not available.

### Step 3: Create progress bar component (1 hour)

1. Create `src/components/timer/timer-progress-bar.tsx`:
   - Fixed-position bar at top of viewport (`position: fixed; top: 0; left: 0; width: 100%; height: 3px; z-index: 9999`).
   - Fill width = `elapsedPercent%`.
   - Color based on `urgencyLevel`.
   - When phases enabled: show segmented bar with phase colors.
   - Small phase label below bar (only visible when phases enabled and timer running).
   - Hidden when timer hasn't been started.
   - CSS transition on width for smooth animation.
   - Pulsing animation when critical/expired.

### Step 4: Create timer controls component (1-2 hours)

1. Create `src/components/timer/timer-controls.tsx`:
   - Compact toolbar section (fits in the TopToolbar right side).
   - Shows: ⏱ icon, remaining time (mm:ss), play/pause button, reset button.
   - Duration presets dropdown: 30, 35, 40, 45, 60 min.
   - Phases toggle (small checkbox or button).
   - When not started: "Start Interview" button (accent color).
   - When running: time display + pause button.
   - When paused: time display + resume button.
   - Reset button always visible when timer has been used.

### Step 5: Wire into App and TopToolbar (30 min)

1. Add `<TimerProgressBar />` as the first child in `App.tsx` (above everything).
2. The timer hook is instantiated at the `AppContent` level and passed to both `TimerProgressBar` and `TimerControls` (or use a simple React context).
3. Add `<TimerControls />` to the right side of `TopToolbar`, before the shortcuts button.

### Step 6: Add keyboard shortcut (15 min)

1. Update `use-keyboard-shortcuts.ts`:
   - `Ctrl+Shift+T`: Call timer `start()` if not running, `pause()` if running, `resume()` if paused.
2. Update `SHORTCUT_MAP`.

### Step 7: Testing (30 min)

1. No complex unit tests needed (timer is UI-only, no persistence).
2. Run typecheck, lint, existing tests, build.
3. Manual testing:
   - Start timer, verify countdown works.
   - Pause/resume.
   - Duration change resets.
   - Phase segments display correctly.
   - Color changes at 25% and 10% remaining.
   - Beep at phase transitions (if phases enabled).
   - Ctrl+Shift+T toggles.
   - Timer continues when switching workspace tabs.
   - Timer hidden when not started.

## Todo Checklist

- [ ] Create `src/hooks/use-interview-timer.ts`
- [ ] Create `src/components/timer/timer-beep.ts`
- [ ] Create `src/components/timer/timer-progress-bar.tsx`
- [ ] Create `src/components/timer/timer-controls.tsx`
- [ ] Wire into `App.tsx` (progress bar)
- [ ] Wire into `top-toolbar.tsx` (controls)
- [ ] Add Ctrl+Shift+T keyboard shortcut
- [ ] Update `SHORTCUT_MAP`
- [ ] Run typecheck, lint, test, build
- [ ] Manual smoke test

## Success Criteria

1. Timer bar appears at top of viewport when started
2. Countdown displays correctly in mm:ss format
3. Play/pause/reset controls work
4. Duration presets (30/35/40/45/60 min) work
5. Phase segments show when phases enabled
6. Color transitions: green -> yellow (25%) -> red (10%)
7. Beep plays at phase transitions and near time-up
8. Ctrl+Shift+T keyboard shortcut works
9. Timer survives tab switches (workspace tabs)
10. No visual regressions in existing UI

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Web Audio blocked by browser autoplay policy | Medium | Low | Audio only after user gesture (timer start is a click); graceful no-op fallback |
| Progress bar z-index conflicts | Low | Low | Use z-index 9999, test with modals/dropdowns |
| Timer drift with setInterval | Low | Low | 1-second granularity is fine; use Date.now() delta for accuracy if needed |

## Security Considerations

- No external resources loaded
- Web Audio API is client-side only
- No data persistence (session-only state)

## Next Steps

- Future: Customizable phase names and percentages
- Future: Timer history (track practice sessions over time -- requires persistence)
- Future: Sound customization (different beep tones, or mute)
