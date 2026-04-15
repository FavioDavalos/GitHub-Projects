import { useMemo, useState } from 'react'

const PADDING = 60

function worldToScreen(x, y, bounds, w, h) {
  const scaleX = (w - PADDING * 2) / (bounds.maxX - bounds.minX || 1)
  const scaleY = (h - PADDING * 2) / (bounds.maxY - bounds.minY || 1)
  const scale = Math.min(scaleX, scaleY)
  const offsetX = (w - (bounds.maxX - bounds.minX) * scale) / 2 - bounds.minX * scale
  const offsetY = (h - (bounds.maxY - bounds.minY) * scale) / 2 - bounds.minY * scale
  return [x * scale + offsetX, h - (y * scale + offsetY)]
}

function SupportSymbol({ x, y, sup, svgW, svgH, bounds }) {
  const [sx, sy] = worldToScreen(x, y, bounds, svgW, svgH)
  const size = 14
  const isRigidX = sup.kx > 1e10
  const isRigidY = sup.ky > 1e10
  const isRigidM = sup.km > 1e10

  // Triangle pointing up = fixed base
  if (isRigidX && isRigidY) {
    return (
      <g>
        <polygon
          points={`${sx},${sy} ${sx - size},${sy + size * 1.2} ${sx + size},${sy + size * 1.2}`}
          fill="none" stroke="#f59e0b" strokeWidth="2"
        />
        <line x1={sx - size - 4} y1={sy + size * 1.2 + 4} x2={sx + size + 4} y2={sy + size * 1.2 + 4}
          stroke="#f59e0b" strokeWidth="2" />
        {isRigidM && (
          <rect x={sx - 5} y={sy - 5} width={10} height={10}
            fill="#f59e0b" fillOpacity="0.5" stroke="#f59e0b" strokeWidth="1.5" />
        )}
      </g>
    )
  }
  // Roller / elastic
  return (
    <g>
      <circle cx={sx} cy={sy + size * 0.6} r={size * 0.5}
        fill="none" stroke="#f59e0b" strokeWidth="2" />
    </g>
  )
}

function LoadArrow({ x, y, load, svgW, svgH, bounds }) {
  const [sx, sy] = worldToScreen(x, y, bounds, svgW, svgH)
  const scale = 30
  const fx = load.fx || 0
  const fy = load.fy || 0
  const mag = Math.sqrt(fx * fx + fy * fy)
  if (mag < 1e-10) return null
  const nx = (fx / mag) * scale
  const ny = -(fy / mag) * scale  // flip y for screen
  const ax = sx - nx
  const ay = sy - ny
  return (
    <g>
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="4"
          refX="3" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="#34d399" />
        </marker>
      </defs>
      <line x1={ax} y1={ay} x2={sx} y2={sy}
        stroke="#34d399" strokeWidth="2" markerEnd="url(#arrowhead)" />
      <text x={ax} y={ay - 6} fontSize="10" fill="#34d399" textAnchor="middle">
        {mag.toFixed(1)} Tn
      </text>
    </g>
  )
}

export default function StructureViewer({ nodes, bars, supports, loads, results, showDeformed }) {
  const svgW = 700
  const svgH = 500
  const [hovered, setHovered] = useState(null)

  const bounds = useMemo(() => {
    const xs = Object.values(nodes).map(n => n.x)
    const ys = Object.values(nodes).map(n => n.y)
    return {
      minX: Math.min(...xs) - 1,
      maxX: Math.max(...xs) + 1,
      minY: Math.min(...ys) - 1,
      maxY: Math.max(...ys) + 1,
    }
  }, [nodes])

  const toScreen = (x, y) => worldToScreen(x, y, bounds, svgW, svgH)

  const deformed = results?.deformed_nodes

  return (
    <div className="relative bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      <div className="absolute top-3 left-3 flex gap-2 text-xs">
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-0.5 bg-blue-400"></span> Original
        </span>
        {showDeformed && deformed && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 h-0.5 bg-orange-400" style={{borderTop:'2px dashed'}}></span> Deformed
          </span>
        )}
      </div>

      <svg width={svgW} height={svgH} className="w-full h-full">
        {/* Grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={svgW} height={svgH} fill="url(#grid)" />

        {/* Original bars */}
        {Object.entries(bars).map(([bid, bar]) => {
          const ni = nodes[bar.node_i]
          const nj = nodes[bar.node_j]
          if (!ni || !nj) return null
          const [x1, y1] = toScreen(ni.x, ni.y)
          const [x2, y2] = toScreen(nj.x, nj.y)
          return (
            <line key={`bar-${bid}`} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round"
              onMouseEnter={() => setHovered({ type: 'bar', id: bid })}
              onMouseLeave={() => setHovered(null)}
              opacity={hovered?.id === bid ? 1 : 0.8}
              style={{ cursor: 'pointer' }}
            />
          )
        })}

        {/* Deformed bars */}
        {showDeformed && deformed && Object.entries(bars).map(([bid, bar]) => {
          const di = deformed[bar.node_i]
          const dj = deformed[bar.node_j]
          if (!di || !dj) return null
          const [x1, y1] = toScreen(di.x, di.y)
          const [x2, y2] = toScreen(dj.x, dj.y)
          return (
            <line key={`def-${bid}`} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#fb923c" strokeWidth="2" strokeDasharray="6 3"
              strokeLinecap="round" opacity={0.75}
            />
          )
        })}

        {/* Supports */}
        {Object.entries(supports).map(([nid, sup]) => {
          const node = nodes[parseInt(nid)]
          if (!node) return null
          return (
            <SupportSymbol key={`sup-${nid}`}
              x={node.x} y={node.y} sup={sup}
              svgW={svgW} svgH={svgH} bounds={bounds}
            />
          )
        })}

        {/* Loads */}
        {Object.entries(loads).map(([nid, load]) => {
          const node = nodes[parseInt(nid)]
          if (!node) return null
          return (
            <LoadArrow key={`load-${nid}`}
              x={node.x} y={node.y} load={load}
              svgW={svgW} svgH={svgH} bounds={bounds}
            />
          )
        })}

        {/* Nodes */}
        {Object.entries(nodes).map(([nid, node]) => {
          const [sx, sy] = toScreen(node.x, node.y)
          const isHovered = hovered?.type === 'node' && hovered?.id === nid
          return (
            <g key={`node-${nid}`}
              onMouseEnter={() => setHovered({ type: 'node', id: nid })}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={sx} cy={sy} r={isHovered ? 7 : 5}
                fill="#1e40af" stroke="#60a5fa" strokeWidth="2" />
              <text x={sx + 8} y={sy - 6} fontSize="11" fill="#94a3b8">{nid}</text>
            </g>
          )
        })}

        {/* Deformed nodes */}
        {showDeformed && deformed && Object.entries(deformed).map(([nid, dn]) => {
          const [sx, sy] = toScreen(dn.x, dn.y)
          return (
            <circle key={`dnode-${nid}`} cx={sx} cy={sy} r={4}
              fill="#ea580c" stroke="#fb923c" strokeWidth="1.5" opacity={0.8}
            />
          )
        })}

        {/* Hover tooltip */}
        {hovered?.type === 'bar' && (() => {
          const bar = bars[hovered.id]
          const ef = results?.element_forces?.[parseInt(hovered.id)]
          if (!bar) return null
          const ni = nodes[bar.node_i]
          const nj = nodes[bar.node_j]
          if (!ni || !nj) return null
          const [mx, my] = toScreen((ni.x + nj.x) / 2, (ni.y + nj.y) / 2)
          return (
            <g>
              <rect x={mx + 8} y={my - 36} width={160} height={ef ? 80 : 40}
                rx="6" fill="#1f2937" stroke="#374151" strokeWidth="1" />
              <text x={mx + 16} y={my - 18} fontSize="11" fill="#e5e7eb" fontWeight="600">
                Bar {hovered.id} — {bar.type}
              </text>
              <text x={mx + 16} y={my - 4} fontSize="10" fill="#9ca3af">
                E={bar.E.toExponential(2)}  A={bar.A}  I={bar.I}
              </text>
              {ef && <>
                <text x={mx + 16} y={my + 12} fontSize="10" fill="#34d399">
                  N={ef.N_i.toFixed(3)} Tn
                </text>
                <text x={mx + 16} y={my + 26} fontSize="10" fill="#34d399">
                  V={ef.V_i.toFixed(3)} Tn  M={ef.M_i.toFixed(3)} Tn·m
                </text>
              </>}
            </g>
          )
        })()}
      </svg>
    </div>
  )
}
