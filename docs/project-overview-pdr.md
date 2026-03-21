# Product Development Requirements (PDR)

## Product Name

System Design Builder (SDB)

## Version

0.1.0

## Overview

A browser-based, drag-and-drop system design tool for practicing and acing system design interviews. Runs entirely client-side with local-first persistence via IndexedDB.

## Target Users

- Software engineers preparing for system design interviews
- Architects prototyping distributed system architectures
- Educators teaching system design concepts

## Core Features

### Component Palette
- 32 built-in components across 12 categories (clients, networking, compute, databases, caching, messaging, storage, search, auth, observability, third-party, decision)
- Drag-and-drop from sidebar onto canvas
- Searchable/filterable palette with category grouping
- Each component has configurable properties (replicas, protocols, algorithms, etc.)

### Canvas & Interaction
- React Flow-powered infinite canvas with pan, zoom, snap-to-grid
- 4 node types: system-component, group (boundary), decision-gateway, text
- Space-bar hold for pan mode; default arrow cursor otherwise
- Double-click on empty canvas spawns a text node
- Box selection drag on canvas (when space not held)
- Minimap and zoom controls

### Typed Connections (Edges)
- 4 connection types: sync (solid indigo), async (dashed orange), streaming (animated green), response (dashed blue)
- Protocol selection per connection type (REST, gRPC, Kafka, WebSocket, etc.)
- Configurable label, latency (ms), branch label, probability weight
- Draggable control point to bend edge curves (curvature offset)

### Request Simulation
- BFS-based request flow traversal from a start node
- Decision gateway branching with probability-weighted selection
- Play (all-at-once), step-forward, pause, reset controls
- Visual feedback: visited nodes/edges glow, active node pulses, animated traffic dots on edges
- Configurable speed and traffic density

### Rule-Based Analysis
- 7 built-in rules: single-point-of-failure, missing-cache, missing-rate-limit, unbalanced-load, missing-async, missing-monitoring, disconnected-components
- Severity levels: error, warning, info
- Clickable warnings navigate to affected nodes
- Filterable by severity

### Templates
- 10 interview-ready templates: URL Shortener, Chat App, E-Commerce, Twitter Clone, Video Streaming, Ride-Sharing, Notification System, Rate Limiter, Search Autocomplete, File Upload
- Difficulty tags: beginner, intermediate, advanced

### Persistence & Export
- Auto-save to IndexedDB every 30 seconds via Dexie
- Manual save (Ctrl+S)
- Export: PNG, SVG, PDF (print dialog), JSON project file
- Import: JSON project file

### Undo/Redo
- Snapshot-based history (max 50 entries)
- Ctrl+Z / Ctrl+Shift+Z

### Group Boundaries
- Resizable boundary boxes for logical grouping (Service, VPC, Region, Subnet, Zone)
- Double-click label to rename inline

### Keyboard Shortcuts
- Save, undo, redo, delete, deselect, add group, open templates, toggle analysis

## Non-Functional Requirements

- **Local-first**: No server, no accounts. All data in browser IndexedDB.
- **Performance**: Smooth canvas interaction with 50+ nodes. Manual chunks for React, Flow, and UI vendor bundles.
- **Accessibility**: Keyboard shortcuts, ARIA labels on collapsible palette.
- **Dark theme only**: Custom CSS variable system for consistent dark UI.

## Constraints

- No backend or API layer
- No authentication/authorization
- No collaborative editing
- Single project at a time in the editor (switch via save/load)

## Success Metrics

- Loads and renders canvas in under 2 seconds
- Supports 100+ nodes without noticeable frame drops
- All 10 templates load correctly with proper node/edge rendering
- Analysis engine detects common design anti-patterns accurately
