# Phase 3: Estimation Calculator Tab

## Context Links

- Workspace shell: [Phase 1](./phase-01-multi-tab-workspace-shell.md)
- Placeholder to replace: `src/components/tabs/estimation-tab-placeholder.tsx`
- Types: `src/types/graph.ts` (`EstimationRow` defined in Phase 1)
- Persistence: `src/lib/persistence.ts`
- Design system: `src/styles.css`

## Overview

- **Priority**: P0
- **Branch**: `feat/estimation-calculator-tab`
- **Depends on**: Phase 1 (multi-tab workspace)
- **Status**: Planned
- **Estimated effort**: 2-3 days

## Key Insights

- Back-of-envelope estimation is asked in virtually every system design interview. No competing tool offers this. This is our biggest differentiator.
- The user chose **guided wizard with presets and formulas** over freeform spreadsheet.
- The wizard should walk the user through common estimation categories step by step, then show a summary.
- Presets should cover the most common interview patterns (social media, messaging, storage, video streaming, etc.).
- Results should be clearly formatted with proper unit scaling (auto-convert bytes to GB/TB, etc.).

## Requirements

### Functional

1. Replace `estimation-tab-placeholder.tsx` with a guided estimation wizard
2. **Preset templates**: Pre-built estimation flows for common interview scenarios:
   - General (blank, user fills in)
   - Social Media (DAU, posts/day, read-write ratio, media storage)
   - Chat/Messaging (messages/day, connection count, storage)
   - Video Streaming (videos/day, avg size, storage, bandwidth)
   - URL Shortener (URLs/day, reads vs writes, storage)
   - E-Commerce (orders/day, product catalog size, search QPS)
3. **Estimation wizard sections** (guided step-by-step):
   - **Traffic Estimation**: DAU, peak multiplier, read-write ratio -> QPS (read), QPS (write)
   - **Storage Estimation**: Record size, records/day, retention period -> total storage
   - **Bandwidth Estimation**: Request size, QPS -> bandwidth in/out
   - **Memory/Cache Estimation**: Cache ratio (e.g., 20% hot data), record size, daily records -> cache size
   - **Summary**: All calculated values in a clean table
4. Each step shows:
   - Input fields with labels and units
   - Formula explanation (e.g., "QPS = DAU x requests/user / 86400")
   - Live-calculated result
   - Common reference values as hints (e.g., "Twitter: ~300K QPS read")
5. User can override any calculated value (manual entry takes precedence)
6. All data persists with project save/load
7. "Reset" button per section and global reset
8. "Copy as text" button to copy estimation summary to clipboard (for pasting into notes or sharing)

### Non-Functional

1. No new npm dependencies
2. All calculations are instant (no async, pure math)
3. Numbers auto-format with proper units (1,500,000 -> "1.5M", 1073741824 bytes -> "1 GB")
4. Consistent dark theme styling

## Architecture

### Data Model

```typescript
// Estimation types

export interface EstimationInput {
  id: string
  label: string
  value: number | null
  unit: string
  hint?: string          // reference value hint
  isOverridden: boolean  // user manually set this instead of formula
}

export interface EstimationFormula {
  id: string
  label: string
  formula: string        // human-readable formula description
  inputs: string[]       // IDs of EstimationInput values used
  calculate: (inputs: Record<string, number>) => number
  unit: string
  result: number | null
}

export interface EstimationSection {
  id: 'traffic' | 'storage' | 'bandwidth' | 'cache'
  title: string
  inputs: EstimationInput[]
  formulas: EstimationFormula[]
}

export interface EstimationData {
  presetId: string | null
  sections: EstimationSection[]
  customNotes: string
}
```

### Store: `use-estimation-store.ts`

```typescript
interface EstimationState {
  data: EstimationData
  // Actions
  loadPreset: (presetId: string) => void
  updateInput: (sectionId: string, inputId: string, value: number | null) => void
  overrideResult: (sectionId: string, formulaId: string, value: number) => void
  clearOverride: (sectionId: string, formulaId: string) => void
  setCustomNotes: (notes: string) => void
  resetSection: (sectionId: string) => void
  resetAll: () => void
  loadEstimation: (data: EstimationData) => void
  getSummary: () => { label: string; value: number; unit: string }[]
  copyAsText: () => string
}
```

### Preset Definitions

```typescript
// src/data/estimation-presets.ts

export interface EstimationPreset {
  id: string
  name: string
  description: string
  defaults: Record<string, number> // input ID -> default value
}

export const estimationPresets: EstimationPreset[] = [
  {
    id: 'general',
    name: 'General',
    description: 'Blank template -- fill in your own values',
    defaults: {},
  },
  {
    id: 'social-media',
    name: 'Social Media',
    description: 'Twitter/Instagram-style: posts, timelines, media',
    defaults: {
      dau: 100_000_000,
      requestsPerUser: 20,
      peakMultiplier: 3,
      readWriteRatio: 10,
      recordSizeBytes: 500,
      retentionDays: 1825, // 5 years
      cacheRatio: 0.2,
      avgRequestSizeKb: 2,
      avgResponseSizeKb: 10,
    },
  },
  // ... more presets
]
```

### Component Structure

```
src/components/tabs/
└── estimation-tab.tsx                 # Main estimation tab (replaces placeholder)

src/components/estimation/
├── estimation-preset-picker.tsx       # Preset selection cards
├── estimation-section.tsx             # Single estimation section (traffic/storage/etc)
├── estimation-input-field.tsx         # Input with label, unit, hint
├── estimation-formula-display.tsx     # Formula + calculated result
├── estimation-summary.tsx             # Summary table with all results
└── estimation-utils.ts               # Unit formatting, formula helpers

src/data/
└── estimation-presets.ts              # Preset definitions with default values
```

### Layout

```
┌──────────────────────────────────────────────────────┐
│ Back-of-Envelope Estimation          [Copy] [Reset]  │
├──────────────────────────────────────────────────────┤
│ Preset: [General] [Social Media] [Chat] [Video] ... │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ▼ Traffic Estimation                                 │
│   DAU:              [100,000,000]  users              │
│   Requests/user:    [20]           /day               │
│   Peak multiplier:  [3]           x                   │
│   Read:Write ratio: [10]          :1                  │
│   ─────────────────────────────────                  │
│   Formula: QPS = DAU × req/user / 86400              │
│   Read QPS:    ≈ 23,148   (peak: 69,444)            │
│   Write QPS:   ≈ 2,315    (peak: 6,944)             │
│                                                      │
│ ▼ Storage Estimation                                 │
│   Record size:      [500]          bytes              │
│   Records/day:      [2,000,000]    (auto from QPS)   │
│   Retention:        [1825]         days (5 years)     │
│   ─────────────────────────────────                  │
│   Formula: Storage = records/day × size × retention  │
│   Total storage: ≈ 1.7 TB                           │
│                                                      │
│ ▼ Bandwidth Estimation                               │
│   Avg request size: [2]            KB                 │
│   Avg response size:[10]           KB                 │
│   ─────────────────────────────────                  │
│   Incoming: ≈ 45 MB/s   Outgoing: ≈ 225 MB/s       │
│                                                      │
│ ▼ Cache Estimation                                   │
│   Cache ratio:      [20]           % of daily data   │
│   ─────────────────────────────────                  │
│   Cache size: ≈ 200 MB                               │
│                                                      │
│ ═══════════════════════════════════════════════       │
│ SUMMARY                                              │
│ ┌──────────────────┬────────────────────────┐        │
│ │ Read QPS         │ 23,148 (peak: 69,444)  │        │
│ │ Write QPS        │ 2,315  (peak: 6,944)   │        │
│ │ Total Storage    │ 1.7 TB                 │        │
│ │ Incoming BW      │ 45 MB/s                │        │
│ │ Outgoing BW      │ 225 MB/s               │        │
│ │ Cache Memory     │ 200 MB                 │        │
│ └──────────────────┴────────────────────────┘        │
│ Notes: [textarea for additional estimation notes]    │
└──────────────────────────────────────────────────────┘
```

## Related Code Files

### Files to Modify

| File | Change |
|------|--------|
| `src/types/graph.ts` | Refine `EstimationData` type (replace placeholder `EstimationRow[]`) |
| `src/types/index.ts` | Re-export estimation types |
| `src/lib/persistence.ts` | Wire estimation store data into save/load |
| `src/components/workspace/workspace-content.tsx` | Replace estimation placeholder with real component |
| `src/hooks/use-auto-save.ts` | Include estimation store in auto-save |

### Files to Create

| File | Purpose |
|------|---------|
| `src/store/use-estimation-store.ts` | Estimation state + calculation logic |
| `src/data/estimation-presets.ts` | 6 preset templates with default values |
| `src/components/tabs/estimation-tab.tsx` | Main estimation tab layout |
| `src/components/estimation/estimation-preset-picker.tsx` | Preset selection UI |
| `src/components/estimation/estimation-section.tsx` | Collapsible section with inputs + formulas |
| `src/components/estimation/estimation-input-field.tsx` | Single input with label, unit, hint |
| `src/components/estimation/estimation-formula-display.tsx` | Formula text + result |
| `src/components/estimation/estimation-summary.tsx` | Summary table |
| `src/components/estimation/estimation-utils.ts` | Number formatting, unit conversion |
| `src/store/__tests__/use-estimation-store.test.ts` | Store + calculation tests |

### Files to Delete

| File | Reason |
|------|--------|
| `src/components/tabs/estimation-tab-placeholder.tsx` | Replaced by real implementation |

## Implementation Steps

### Step 1: Utility functions (1-2 hours)

1. Create `src/components/estimation/estimation-utils.ts`:
   - `formatNumber(n: number): string` -- locale-aware with commas (1,234,567)
   - `formatCompact(n: number): string` -- compact notation (1.5M, 2.3TB)
   - `formatBytes(bytes: number): string` -- auto-scale to KB/MB/GB/TB
   - `formatBandwidth(bytesPerSec: number): string` -- auto-scale + /s suffix
   - Unit conversion helpers

### Step 2: Define presets (1-2 hours)

1. Create `src/data/estimation-presets.ts`:
   - Define 6 presets: General, Social Media, Chat/Messaging, Video Streaming, URL Shortener, E-Commerce.
   - Each preset provides sensible default values for all inputs.
   - Include `description` and category tags.

### Step 3: Create estimation store (2-3 hours)

1. Create `src/store/use-estimation-store.ts`:
   - Build the 4 sections with their inputs and formulas.
   - `loadPreset(id)` populates inputs with preset defaults.
   - `updateInput()` triggers recalculation of dependent formulas.
   - Calculation chain: traffic inputs -> QPS results -> storage formulas use QPS -> bandwidth formulas use QPS.
   - `overrideResult()` lets user pin a formula result (breaks auto-calculation for that field).
   - `getSummary()` returns array of all formula results for the summary table.
   - `copyAsText()` formats summary as plain text for clipboard.

### Step 4: Build input and formula components (2-3 hours)

1. Create `estimation-input-field.tsx`: Label, number input, unit badge, optional hint tooltip.
2. Create `estimation-formula-display.tsx`: Formula text in monospace, calculated result with unit, override toggle.

### Step 5: Build section component (1-2 hours)

1. Create `estimation-section.tsx`:
   - Collapsible header with section title and result preview.
   - Renders inputs and formulas for a given section.
   - Reset button per section.

### Step 6: Build preset picker (1 hour)

1. Create `estimation-preset-picker.tsx`:
   - Horizontal row of preset cards (similar to difficulty filter in template picker).
   - Active preset highlighted. Clicking a preset calls `loadPreset()`.

### Step 7: Build summary component (1 hour)

1. Create `estimation-summary.tsx`:
   - Table with label, value, unit columns.
   - "Copy to clipboard" button formats as text.
   - Highlight important values (storage, QPS).

### Step 8: Build estimation tab (1-2 hours)

1. Create `estimation-tab.tsx`:
   - Centered, max-width container (~900px).
   - Header with title, copy and reset buttons.
   - Preset picker.
   - All 4 sections.
   - Summary at bottom.
   - Optional notes textarea below summary.

### Step 9: Wire into workspace and persistence (1-2 hours)

1. Replace placeholder in `workspace-content.tsx`.
2. Update `saveProject()` to include estimation data.
3. Update `loadProject()` to call `useEstimationStore.getState().loadEstimation()`.
4. Update auto-save, export, import.

### Step 10: Testing (2 hours)

1. Write `src/store/__tests__/use-estimation-store.test.ts`:
   - Test preset loading with correct default values.
   - Test formula calculations (QPS from DAU, storage from record size, etc.).
   - Test override behavior.
   - Test reset per section and global.
   - Test copyAsText formatting.
2. Run typecheck, lint, test, build.
3. Manual testing: load presets, modify values, verify calculations, save/reload.

## Todo Checklist

- [ ] Create `estimation-utils.ts` (formatting, unit conversion)
- [ ] Create `estimation-presets.ts` (6 presets)
- [ ] Create `use-estimation-store.ts`
- [ ] Refine estimation types in `graph.ts`
- [ ] Create `estimation-input-field.tsx`
- [ ] Create `estimation-formula-display.tsx`
- [ ] Create `estimation-section.tsx`
- [ ] Create `estimation-preset-picker.tsx`
- [ ] Create `estimation-summary.tsx`
- [ ] Create `estimation-tab.tsx`
- [ ] Wire into `workspace-content.tsx`
- [ ] Wire into persistence
- [ ] Write store tests
- [ ] Run typecheck, lint, test, build
- [ ] Manual smoke test

## Success Criteria

1. Preset picker shows all 6 presets, loading one populates all inputs
2. All 4 estimation sections calculate correctly (QPS, storage, bandwidth, cache)
3. Formula descriptions are shown next to each calculation
4. Values auto-format with proper units
5. User can override any calculated value
6. Summary table shows all key metrics
7. "Copy as text" produces clean clipboard content
8. All data persists across save/load
9. Existing tests pass, new store tests pass
10. Clean typecheck, lint, build

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Formula chain gets complex with overrides | Medium | Medium | Keep dependency graph simple; overrides break chain at that point |
| Number formatting edge cases (NaN, Infinity, 0) | Medium | Low | Guard all divisions, show "N/A" for invalid results |
| Preset defaults may not match real-world scenarios | Low | Low | Research actual industry numbers; allow user override |

## Security Considerations

- Pure client-side calculations, no external APIs
- No eval() or dynamic code execution for formulas (all calculations are hardcoded functions)
- Clipboard API requires user gesture (browser handles permission)

## Next Steps

- After merge, could add: custom formula builder, more presets, integration with architecture canvas (auto-detect QPS from component properties)
