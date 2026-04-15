function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} className="text-left text-gray-400 pb-1 pr-3 font-medium border-b border-gray-700">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-gray-800/20' : ''}>
              {row.map((cell, j) => (
                <td key={j} className="py-0.5 pr-3 text-gray-200 font-mono">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Section({ title, accent, children }) {
  const colors = {
    blue:   'border-blue-500 text-blue-400',
    yellow: 'border-yellow-500 text-yellow-400',
    green:  'border-green-500 text-green-400',
    red:    'border-red-500 text-red-400',
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

const fmt = (v, d = 5) => typeof v === 'number' ? v.toExponential(d) : v

export default function ResultsPanel({ results }) {
  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="text-sm">Run analysis to see results</p>
      </div>
    )
  }

  const { displacements, reactions, element_forces } = results

  return (
    <div className="h-full overflow-y-auto pr-1 space-y-1">
      <Section title="Displacements" accent="blue">
        <Table
          headers={['Node', 'ux (m)', 'uy (m)', 'θ (rad)']}
          rows={Object.entries(displacements).map(([id, d]) => [
            id,
            fmt(d.ux),
            fmt(d.uy),
            fmt(d.theta),
          ])}
        />
      </Section>

      <Section title="Reactions" accent="yellow">
        <Table
          headers={['Node', 'Rx (Tn)', 'Ry (Tn)', 'Rm (Tn·m)']}
          rows={Object.entries(reactions).map(([id, r]) => [
            id,
            fmt(r.rx),
            fmt(r.ry),
            fmt(r.rm),
          ])}
        />
      </Section>

      <Section title="Element Forces" accent="green">
        <Table
          headers={['Bar', 'N_i (Tn)', 'V_i (Tn)', 'M_i (Tn·m)', 'N_j', 'V_j', 'M_j']}
          rows={Object.entries(element_forces).map(([id, f]) => [
            id,
            fmt(f.N_i, 3),
            fmt(f.V_i, 3),
            fmt(f.M_i, 3),
            fmt(f.N_j, 3),
            fmt(f.V_j, 3),
            fmt(f.M_j, 3),
          ])}
        />
      </Section>
    </div>
  )
}
