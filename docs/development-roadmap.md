# Development Roadmap

## Current Version: 0.1.0 (MVP)

### Phase 1: Core Canvas & Components — Complete
- [x] React Flow integration with dark theme
- [x] 32 system design components across 12 categories
- [x] Drag-and-drop from palette to canvas
- [x] Configurable component properties
- [x] Brand icons for databases and messaging systems
- [x] Category-based shape system (node-shapes.tsx — unused in current node renderer, available for future use)

### Phase 2: Connections & Edges — Complete
- [x] 4 typed connection types (sync, async, streaming, response)
- [x] Protocol selection per connection type
- [x] Editable labels on edges
- [x] Draggable control point for edge bending (curvature offset)
- [x] Animated streaming edges
- [x] Max 2 edges between any node pair
- [x] Arrow markers on edges

### Phase 3: Advanced Nodes — Complete
- [x] Group boundary nodes (resizable, 5 boundary types)
- [x] Decision gateway nodes (diamond shape, conditional branching)
- [x] Text annotation nodes (double-click to create, inline editing)
- [x] Inline label editing for group and text nodes

### Phase 4: Persistence & Export — Complete
- [x] Dexie IndexedDB persistence
- [x] Auto-save every 30 seconds
- [x] Manual save (Ctrl+S)
- [x] JSON project export/import
- [x] PNG export (2x pixel ratio)
- [x] SVG export
- [x] PDF export (via print dialog)

### Phase 5: Simulation — Complete
- [x] BFS-based request flow traversal
- [x] Decision gateway branching with probability weights
- [x] Play/pause/step/reset controls
- [x] Visual feedback (visited glow, active pulse, dimmed unvisited)
- [x] Animated traffic dots on edges
- [x] Configurable speed and traffic density

### Phase 6: Analysis — Complete
- [x] 7 built-in analysis rules
- [x] Severity-based filtering (error, warning, info)
- [x] Clickable warnings navigate to affected nodes
- [x] Analysis panel with badge counts

### Phase 7: UX Polish — Complete
- [x] Keyboard shortcuts (save, undo/redo, delete, templates, analysis)
- [x] Undo/redo with 50-entry history
- [x] 10 interview-ready templates
- [x] Template picker shown on app load
- [x] Collapsible component palette
- [x] Space-bar pan mode
- [x] Minimap and zoom controls
- [x] Shortcuts help dialog

## Potential Future Enhancements

- [ ] Multi-project management (project list/switcher)
- [ ] Collaborative editing (WebSocket/CRDT)
- [ ] Custom component definitions (user-created)
- [ ] Category-based node shapes (shapes exist in `node-shapes.tsx`, not yet wired to renderer)
- [ ] Copy/paste nodes and edges
- [ ] Latency/throughput estimation calculator
- [ ] AI-powered design suggestions
- [ ] Cloud sync (optional accounts)
- [ ] More templates (50+ common interview patterns)
- [ ] Export to Terraform/CloudFormation stubs
- [ ] Component cost estimation
- [ ] Dark/light theme toggle
