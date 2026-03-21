# Design Guidelines

## Theme

Dark-only theme. All colors defined as CSS custom properties in `src/styles.css` `@theme` block.

## Color Palette

| Variable | Hex | Usage |
|----------|-----|-------|
| `--color-canvas-bg` | `#0f1117` | Canvas/body background |
| `--color-sidebar-bg` | `#161821` | Sidebar, toolbar backgrounds |
| `--color-panel-bg` | `#1c1e2a` | Cards, dropdowns, node backgrounds |
| `--color-border` | `#2a2d3a` | All borders and dividers |
| `--color-accent` | `#6366f1` | Primary accent (indigo) |
| `--color-accent-hover` | `#818cf8` | Accent hover state |
| `--color-text-primary` | `#e2e8f0` | Primary text |
| `--color-text-secondary` | `#94a3b8` | Secondary text, descriptions |
| `--color-text-muted` | `#64748b` | Labels, placeholders, muted text |
| `--color-node-bg` | `#1e2030` | Node fill color |
| `--color-node-border` | `#2e3148` | Default node border |
| `--color-success` | `#22c55e` | Success state, active simulation |
| `--color-warning` | `#eab308` | Warning severity |
| `--color-error` | `#ef4444` | Error severity, delete actions |

## Connection Type Visual Encoding

| Type | Color | Dash Pattern | Usage |
|------|-------|-------------|-------|
| Sync | `#6366f1` (indigo) | Solid | REST, gRPC, GraphQL, HTTP, RPC |
| Async | `#f97316` (orange) | `8 4` dashed | Kafka, RabbitMQ, SQS, Pub/Sub |
| Streaming | `#22c55e` (green) | Solid + animated gradient | WebSocket, SSE, gRPC Stream |
| Response | `#38bdf8` (sky) | `4 3` dashed | HTTP Response, Callback, Return |

## Node Design

- **System nodes**: Simple rounded rectangle (`min-w-[120px]`), icon + label centered vertically. Border color matches component accent on selection. Hover reveals property tooltip.
- **Group nodes**: Dashed border rectangle, resizable. 5 boundary types with distinct colors (service=indigo, vpc=green, region=amber, subnet=cyan, zone=purple). Label floats above.
- **Decision nodes**: Diamond shape (110x110 SVG polygon). Amber accent with "?" indicator.
- **Text nodes**: Borderless text, editable on double-click. Selection shows subtle blue outline.

## Component Category Colors

Each component definition has a unique `color` hex. Used for:
- Palette icon background tint (`${color}1a`)
- Property panel icon badge
- Node border on selection

## Layout

- **Top toolbar**: Full width, fixed height (`shrink-0`). Logo, project name input, action buttons.
- **Left sidebar**: 256px wide (`w-64`), collapsible to 48px (`w-12`). Component palette with search.
- **Canvas**: Flex-1, fills remaining space. React Flow with dot grid background.
- **Right panel**: 288px (`w-72`) for properties, 320px (`w-80`) for analysis. Conditional rendering based on selection/analysis state.

## Interaction Patterns

- **Drag to add**: Drag from palette, drop on canvas
- **Click to select**: Node or edge, opens property panel
- **Double-click canvas**: Add text node
- **Double-click group/text label**: Inline edit mode
- **Space + drag**: Pan canvas
- **Scroll**: Pan canvas (panOnScroll enabled)
- **Pinch/wheel**: Zoom (0.1x to 30x range)
- **Edge bend**: Click edge to select, drag control point to bend curve

## Typography

- Font family: `'Inter', system-ui, -apple-system, sans-serif`
- Node labels: `text-[11px] font-semibold`
- Panel labels: `text-xs font-medium`
- Category headers: `text-xs font-semibold uppercase tracking-wider`
- Toolbar buttons: `text-xs font-medium`

## Shadows

- Node default: `0 2px 8px rgba(0,0,0,0.2)`
- Node selected: `0 0 8px rgba(59,130,246,0.3)`
- Node active (simulation): `0 0 12px rgba(34,197,94,0.4)`
- Dropdown/tooltip: `0 8px 24px rgba(0,0,0,0.4)` or `0 8px 32px rgba(0,0,0,0.4)`

## Simulation Visual Feedback

- **Visited nodes**: Border color changes to component accent with reduced opacity (`${color}99`)
- **Active node**: Green border + glow + "active" pulse indicator below
- **Dimmed nodes**: `opacity: 0.3` for unvisited nodes during simulation
- **Traffic dots**: Animated circles along edge paths, count scales with `trafficDensity` setting
- **Streaming edges**: Animated linear gradient for shimmer effect
