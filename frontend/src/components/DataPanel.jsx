import { useState } from 'react'

function Section({ title, children, accent = 'blue' }) {
  const colors = {
    blue:   'border-blue-500 text-blue-400',
    yellow: 'border-yellow-500 text-yellow-400',
    green:  'border-green-500 text-green-400',
    purple: 'border-purple-500 text-purple-400',
  }
  return (
    <div className="mb-4">
      <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 border-l-2 pl-2 ${colors[accent]}`}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function Input({ label, value, onChange, type = 'number', className = '' }) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <label className="text-xs text-gray-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-100
                   focus:outline-none focus:border-blue-500 w-full"
      />
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-xs text-gray-400">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-100
                   focus:outline-none focus:border-blue-500"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function Tag({ children, color = 'blue' }) {
  const cls = {
    blue:   'bg-blue-900/50 text-blue-300 border-blue-700',
    yellow: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    green:  'bg-green-900/50 text-green-300 border-green-700',
  }
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded border ${cls[color]}`}>{children}</span>
  )
}

// ─── Nodes ────────────────────────────────────────────────────────────────────
function NodeEditor({ nodes, setNodes }) {
  const [form, setForm] = useState({ x: 0, y: 0 })

  const nextId = () => Math.max(0, ...Object.keys(nodes).map(Number)) + 1

  const add = () => {
    const id = nextId()
    setNodes(prev => ({ ...prev, [id]: { x: form.x, y: form.y } }))
  }
  const remove = id => setNodes(prev => { const n = { ...prev }; delete n[id]; return n })
  const update = (id, field, val) =>
    setNodes(prev => ({ ...prev, [id]: { ...prev[id], [field]: val } }))

  return (
    <Section title="Nodes" accent="blue">
      <div className="space-y-1 max-h-40 overflow-y-auto mb-2 pr-1">
        {Object.entries(nodes).map(([id, n]) => (
          <div key={id} className="flex items-center gap-1 bg-gray-800/50 rounded px-2 py-1">
            <Tag>{id}</Tag>
            <input type="number" value={n.x}
              onChange={e => update(id, 'x', parseFloat(e.target.value) || 0)}
              className="w-16 bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-xs text-center"
              placeholder="x"
            />
            <input type="number" value={n.y}
              onChange={e => update(id, 'y', parseFloat(e.target.value) || 0)}
              className="w-16 bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-xs text-center"
              placeholder="y"
            />
            <span className="text-xs text-gray-500 ml-1">m</span>
            <button onClick={() => remove(id)}
              className="ml-auto text-red-400 hover:text-red-300 text-xs px-1">✕</button>
          </div>
        ))}
      </div>
      <div className="flex gap-1 items-end">
        <Input label="x (m)" value={form.x} onChange={v => setForm(f => ({ ...f, x: v }))} className="w-20" />
        <Input label="y (m)" value={form.y} onChange={v => setForm(f => ({ ...f, y: v }))} className="w-20" />
        <button onClick={add}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded mb-0.5">
          + Add
        </button>
      </div>
    </Section>
  )
}

// ─── Bars ─────────────────────────────────────────────────────────────────────
function BarEditor({ bars, setBars, defaultE, defaultA, defaultI }) {
  const [form, setForm] = useState({
    node_i: 1, node_j: 2, type: 'MEE',
    E: defaultE, A: defaultA, I: defaultI
  })

  const nextId = () => Math.max(0, ...Object.keys(bars).map(Number)) + 1
  const add = () => {
    setBars(prev => ({ ...prev, [nextId()]: { ...form } }))
  }
  const remove = id => setBars(prev => { const b = { ...prev }; delete b[id]; return b })

  return (
    <Section title="Bars" accent="blue">
      <div className="space-y-1 max-h-36 overflow-y-auto mb-2 pr-1">
        {Object.entries(bars).map(([id, b]) => (
          <div key={id} className="flex items-center gap-1 bg-gray-800/50 rounded px-2 py-1 text-xs">
            <Tag>{id}</Tag>
            <span className="text-gray-300">{b.node_i}→{b.node_j}</span>
            <Tag color="green">{b.type}</Tag>
            <button onClick={() => remove(id)}
              className="ml-auto text-red-400 hover:text-red-300 px-1">✕</button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1 mb-1">
        <Input label="Node i" value={form.node_i} onChange={v => setForm(f => ({ ...f, node_i: Math.round(v) }))} />
        <Input label="Node j" value={form.node_j} onChange={v => setForm(f => ({ ...f, node_j: Math.round(v) }))} />
        <Select label="Type" value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))}
          options={['MEE', 'MEA', 'MAE']} />
        <Input label="E (Tn/m²)" value={form.E} onChange={v => setForm(f => ({ ...f, E: v }))} />
        <Input label="A (m²)" value={form.A} onChange={v => setForm(f => ({ ...f, A: v }))} />
        <Input label="I (m⁴)" value={form.I} onChange={v => setForm(f => ({ ...f, I: v }))} />
      </div>
      <button onClick={add}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded">
        + Add Bar
      </button>
    </Section>
  )
}

// ─── Supports ─────────────────────────────────────────────────────────────────
const RIGID = 1e200

function SupportEditor({ supports, setSupports }) {
  const [form, setForm] = useState({ node: 1, type: 'fixed' })

  const supportPresets = {
    fixed:    { kx: RIGID, ky: RIGID, km: RIGID, label: 'Fixed (empotrado)' },
    pinned:   { kx: RIGID, ky: RIGID, km: 0,     label: 'Pinned (articulado)' },
    roller_x: { kx: 0,     ky: RIGID, km: 0,     label: 'Roller Y (rueda)' },
    roller_y: { kx: RIGID, ky: 0,     km: 0,     label: 'Roller X' },
    free:     { kx: 0,     ky: 0,     km: 0,     label: 'Free' },
  }

  const add = () => {
    const preset = supportPresets[form.type]
    setSupports(prev => ({ ...prev, [form.node]: { kx: preset.kx, ky: preset.ky, km: preset.km } }))
  }
  const remove = id => setSupports(prev => { const s = { ...prev }; delete s[id]; return s })

  const describe = sup => {
    const parts = []
    if (sup.kx > 1e10) parts.push('X') ; else if (sup.kx > 0) parts.push(`kx=${sup.kx.toExponential(1)}`)
    if (sup.ky > 1e10) parts.push('Y') ; else if (sup.ky > 0) parts.push(`ky=${sup.ky.toExponential(1)}`)
    if (sup.km > 1e10) parts.push('M') ; else if (sup.km > 0) parts.push(`km=${sup.km.toExponential(1)}`)
    return parts.length ? parts.join('+') : 'free'
  }

  return (
    <Section title="Supports" accent="yellow">
      <div className="space-y-1 max-h-28 overflow-y-auto mb-2 pr-1">
        {Object.entries(supports).map(([id, sup]) => (
          <div key={id} className="flex items-center gap-1 bg-gray-800/50 rounded px-2 py-1 text-xs">
            <Tag color="yellow">N{id}</Tag>
            <span className="text-gray-300">{describe(sup)}</span>
            <button onClick={() => remove(id)}
              className="ml-auto text-red-400 hover:text-red-300 px-1">✕</button>
          </div>
        ))}
      </div>
      <div className="flex gap-1 items-end">
        <Input label="Node" value={form.node} onChange={v => setForm(f => ({ ...f, node: Math.round(v) }))} className="w-16" />
        <Select label="Type" value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))}
          options={Object.keys(supportPresets)} />
        <button onClick={add}
          className="bg-yellow-600 hover:bg-yellow-500 text-white text-xs px-3 py-1.5 rounded mb-0.5">
          + Add
        </button>
      </div>
    </Section>
  )
}

// ─── Loads ────────────────────────────────────────────────────────────────────
function LoadEditor({ loads, setLoads }) {
  const [form, setForm] = useState({ node: 1, fx: 0, fy: -1, m: 0 })

  const add = () => {
    setLoads(prev => ({ ...prev, [form.node]: { fx: form.fx, fy: form.fy, m: form.m } }))
  }
  const remove = id => setLoads(prev => { const l = { ...prev }; delete l[id]; return l })

  return (
    <Section title="Nodal Loads" accent="green">
      <div className="space-y-1 max-h-28 overflow-y-auto mb-2 pr-1">
        {Object.entries(loads).map(([id, l]) => (
          <div key={id} className="flex items-center gap-1 bg-gray-800/50 rounded px-2 py-1 text-xs">
            <Tag color="green">N{id}</Tag>
            <span className="text-gray-300">
              Fx={l.fx} Fy={l.fy} M={l.m} Tn
            </span>
            <button onClick={() => remove(id)}
              className="ml-auto text-red-400 hover:text-red-300 px-1">✕</button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1 mb-1">
        <Input label="Node" value={form.node} onChange={v => setForm(f => ({ ...f, node: Math.round(v) }))} />
        <Input label="Fx (Tn)" value={form.fx} onChange={v => setForm(f => ({ ...f, fx: v }))} />
        <Input label="Fy (Tn)" value={form.fy} onChange={v => setForm(f => ({ ...f, fy: v }))} />
        <Input label="M (Tn·m)" value={form.m} onChange={v => setForm(f => ({ ...f, m: v }))} />
      </div>
      <button onClick={add}
        className="w-full bg-green-700 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded">
        + Add Load
      </button>
    </Section>
  )
}

// ─── Main DataPanel ───────────────────────────────────────────────────────────
export default function DataPanel({ nodes, setNodes, bars, setBars, supports, setSupports, loads, setLoads }) {
  const DEFAULT_E = 2.1e7
  const DEFAULT_A = 0.00251
  const DEFAULT_I = 0.00001686

  return (
    <div className="h-full overflow-y-auto pr-1 space-y-1">
      <NodeEditor nodes={nodes} setNodes={setNodes} />
      <BarEditor bars={bars} setBars={setBars}
        defaultE={DEFAULT_E} defaultA={DEFAULT_A} defaultI={DEFAULT_I} />
      <SupportEditor supports={supports} setSupports={setSupports} />
      <LoadEditor loads={loads} setLoads={setLoads} />
    </div>
  )
}
