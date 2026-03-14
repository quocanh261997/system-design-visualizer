/* eslint-disable react-refresh/only-export-components */
import type { FC } from 'react'

interface ShapeProps {
  width: number
  height: number
  color: string
  selected: boolean
  active: boolean
  dimmed: boolean
}

type ShapeFC = FC<ShapeProps>

/** Resolve stroke color, stroke width, and drop-shadow filter from state */
function useShapeStyle(props: ShapeProps) {
  const { color, selected, active, dimmed } = props
  const stroke = active ? '#22c55e' : selected ? color : color
  const sw = selected || active ? 2.5 : 2
  const filter = active
    ? 'drop-shadow(0 0 12px rgba(34,197,94,0.4))'
    : selected
      ? `drop-shadow(0 0 12px ${color}33)`
      : 'none'
  const opacity = dimmed ? 0.3 : 1
  return { stroke, sw, filter, opacity }
}

const FILL = '#1e2030'
/** databases → Cylinder */
export const CylinderShape: ShapeFC = (props) => {
  const { width: w, height: h } = props
  const { stroke, sw, filter, opacity } = useShapeStyle(props)
  const ry = h * 0.18
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ opacity, filter }}>
      <path
        d={`M2,${ry} Q2,2 ${w / 2},2 Q${w - 2},2 ${w - 2},${ry} L${w - 2},${h - ry} Q${w - 2},${h - 2} ${w / 2},${h - 2} Q2,${h - 2} 2,${h - ry} Z`}
        fill={FILL} stroke={stroke} strokeWidth={sw}
      />
      <ellipse cx={w / 2} cy={ry} rx={w / 2 - 2} ry={ry - 2} fill={FILL} stroke={stroke} strokeWidth={sw} />
    </svg>
  )
}
/** caching → Hexagon */
export const HexagonShape: ShapeFC = (props) => {
  const { width: w, height: h } = props
  const { stroke, sw, filter, opacity } = useShapeStyle(props)
  const mx = w * 0.25
  const points = `${mx},2 ${w - mx},2 ${w - 2},${h / 2} ${w - mx},${h - 2} ${mx},${h - 2} 2,${h / 2}`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ opacity, filter }}>
      <polygon points={points} fill={FILL} stroke={stroke} strokeWidth={sw} />
    </svg>
  )
}
/** compute → Rounded rectangle */
export const RoundedRectShape: ShapeFC = (props) => {
  const { width: w, height: h } = props
  const { stroke, sw, filter, opacity } = useShapeStyle(props)
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ opacity, filter }}>
      <rect x={2} y={2} width={w - 4} height={h - 4} rx={10} ry={10} fill={FILL} stroke={stroke} strokeWidth={sw} />
    </svg>
  )
}
/** clients → Rounded square with monitor bezel */
export const MonitorShape: ShapeFC = (props) => {
  const { width: w, height: h } = props
  const { stroke, sw, filter, opacity } = useShapeStyle(props)
  const bezel = 8
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ opacity, filter }}>
      <rect x={2} y={bezel} width={w - 4} height={h - bezel - 4} rx={8} ry={8} fill={FILL} stroke={stroke} strokeWidth={sw} />
      <line x1={w * 0.3} y1={2} x2={w * 0.7} y2={2} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <line x1={w * 0.3} y1={2} x2={w * 0.3} y2={bezel} stroke={stroke} strokeWidth={sw * 0.6} />
      <line x1={w * 0.7} y1={2} x2={w * 0.7} y2={bezel} stroke={stroke} strokeWidth={sw * 0.6} />
    </svg>
  )
}
/** networking → Shield/diamond with flat top */
export const ShieldDiamondShape: ShapeFC = (props) => {
  const { width: w, height: h } = props
  const { stroke, sw, filter, opacity } = useShapeStyle(props)
  const inset = w * 0.2
  const points = `${inset},2 ${w - inset},2 ${w - 2},${h * 0.4} ${w / 2},${h - 2} 2,${h * 0.4}`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ opacity, filter }}>
      <polygon points={points} fill={FILL} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
    </svg>
  )
}
/** messaging → Parallelogram */
export const ParallelogramShape: ShapeFC = (props) => {
  const { width: w, height: h } = props
  const { stroke, sw, filter, opacity } = useShapeStyle(props)
  const skew = w * 0.15
  const points = `${skew},2 ${w - 2},2 ${w - skew},${h - 2} 2,${h - 2}`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ opacity, filter }}>
      <polygon points={points} fill={FILL} stroke={stroke} strokeWidth={sw} />
    </svg>
  )
}

/** storage → Cloud shape */
export const CloudShape: ShapeFC = (props) => {
  const { width: w, height: h } = props
  const { stroke, sw, filter, opacity } = useShapeStyle(props)
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ opacity, filter }}>
      <path
        d={`M${w * 0.25},${h * 0.6} Q2,${h * 0.6} 2,${h * 0.42} Q2,${h * 0.22} ${w * 0.22},${h * 0.22} Q${w * 0.25},2 ${w * 0.45},${h * 0.12} Q${w * 0.55},2 ${w * 0.7},${h * 0.15} Q${w - 2},${h * 0.1} ${w - 2},${h * 0.38} Q${w - 2},${h * 0.6} ${w * 0.78},${h * 0.6} Z M2,${h * 0.6} L${w - 2},${h * 0.6} L${w - 2},${h - 4} Q${w - 2},${h - 2} ${w - 6},${h - 2} L6,${h - 2} Q2,${h - 2} 2,${h - 6} Z`}
        fill={FILL} stroke={stroke} strokeWidth={sw}
      />
    </svg>
  )
}

/** search → Pill / stadium */
export const PillShape: ShapeFC = (props) => {
  const { width: w, height: h } = props
  const { stroke, sw, filter, opacity } = useShapeStyle(props)
  const r = (h - 4) / 2
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ opacity, filter }}>
      <rect x={2} y={2} width={w - 4} height={h - 4} rx={r} ry={r} fill={FILL} stroke={stroke} strokeWidth={sw} />
    </svg>
  )
}

/** auth → Classic shield */
export const ShieldShape: ShapeFC = (props) => {
  const { width: w, height: h } = props
  const { stroke, sw, filter, opacity } = useShapeStyle(props)
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ opacity, filter }}>
      <path
        d={`M${w / 2},2 L${w - 2},${h * 0.2} L${w - 2},${h * 0.55} Q${w - 2},${h * 0.85} ${w / 2},${h - 2} Q2,${h * 0.85} 2,${h * 0.55} L2,${h * 0.2} Z`}
        fill={FILL} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"
      />
    </svg>
  )
}

/** observability → Oval / eye */
export const OvalShape: ShapeFC = (props) => {
  const { width: w, height: h } = props
  const { stroke, sw, filter, opacity } = useShapeStyle(props)
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ opacity, filter }}>
      <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 2} ry={h / 2 - 2} fill={FILL} stroke={stroke} strokeWidth={sw} />
    </svg>
  )
}

/** decision → Diamond */
export const DiamondShape: ShapeFC = (props) => {
  const { width: w, height: h } = props
  const { stroke, sw, filter, opacity } = useShapeStyle(props)
  const points = `${w / 2},2 ${w - 2},${h / 2} ${w / 2},${h - 2} 2,${h / 2}`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ opacity, filter }}>
      <polygon points={points} fill={FILL} stroke={stroke} strokeWidth={sw} />
    </svg>
  )
}

/** third-party → Rounded rectangle with notch */
export const NotchedRectShape: ShapeFC = (props) => {
  const { width: w, height: h } = props
  const { stroke, sw, filter, opacity } = useShapeStyle(props)
  const n = 10 // notch size
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ opacity, filter }}>
      <path
        d={`M${10},2 L${w - n - 2},2 L${w - 2},${n + 2} L${w - 2},${h - 10} Q${w - 2},${h - 2} ${w - 10},${h - 2} L10,${h - 2} Q2,${h - 2} 2,${h - 10} L2,10 Q2,2 10,2 Z`}
        fill={FILL} stroke={stroke} strokeWidth={sw}
      />
      <line x1={w - n - 2} y1={2} x2={w - n - 2} y2={n + 2} stroke={stroke} strokeWidth={sw * 0.6} />
      <line x1={w - n - 2} y1={n + 2} x2={w - 2} y2={n + 2} stroke={stroke} strokeWidth={sw * 0.6} />
    </svg>
  )
}

/** Map from category string to the corresponding shape component */
export const categoryShapeMap: Record<string, ShapeFC> = {
  databases: CylinderShape,
  caching: HexagonShape,
  compute: RoundedRectShape,
  clients: MonitorShape,
  networking: ShieldDiamondShape,
  messaging: ParallelogramShape,
  storage: CloudShape,
  search: PillShape,
  auth: ShieldShape,
  observability: OvalShape,
  decision: DiamondShape,
  'third-party': NotchedRectShape,
}
