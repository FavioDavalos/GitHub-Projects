import { useState } from 'react'
import StructureViewer from './components/StructureViewer'
import DataPanel from './components/DataPanel'
import ResultsPanel from './components/ResultsPanel'

// ── Example from Favio's notebook ─────────────────────────────────────────────
const EXAMPLE_NODES = {
  1:  { x: 0.0,  y: 0.0  },
  2:  { x: 0.0,  y: 3.5  },
  3:  { x: 2.0,  y: 7.0  },
  4:  { x: 3.0,  y: 0.0  },
  5:  { x: 4.5,  y: 3.5  },
  6:  { x: 4.5,  y: 7.0  },
  7:  { x: 9.5,  y: 0.0  },
  8:  { x: 6.5,  y: 7.0  },
  9:  { x: 6.5,  y: 6.34 },
  10: { x: 6.6,  y: 5.69 },
  11: { x: 6.81, y: 5.06 },
  12: { x: 7.12, y: 4.48 },
  13: { x: 7.52, y: 3.95 },
  14: { x: 8.0,  y: 3.5  },
  15: { x: 11.5, y: 3.5  },
  16: { x: 12.03,y: 3.19 },
  17: { x: 12.49,y: 2.79 },
  18: { x: 12.88,y: 2.32 },
  19: { x: 13.19,y: 1.79 },
  20: { x: 13.39,y: 1.21 },
  21: { x: 13.5, y: 0.61 },
  22: { x: 13.5, y: 0.0  },
}

const E = 2.1e7, Ar = 0.00251, I = 0.00001686

const EXAMPLE_BARS = {
  1:  { node_i: 1,  node_j: 2,  type: 'MEE', E, A: Ar, I },
  2:  { node_i: 2,  node_j: 3,  type: 'MEE', E, A: Ar, I },
  3:  { node_i: 3,  node_j: 6,  type: 'MEE', E, A: Ar, I },
  4:  { node_i: 2,  node_j: 5,  type: 'MEA', E, A: Ar, I },
  5:  { node_i: 4,  node_j: 5,  type: 'MEA', E, A: Ar, I },
  6:  { node_i: 5,  node_j: 6,  type: 'MAE', E, A: Ar, I },
  7:  { node_i: 6,  node_j: 8,  type: 'MEE', E, A: Ar, I },
  8:  { node_i: 5,  node_j: 14, type: 'MAE', E, A: Ar, I },
  9:  { node_i: 7,  node_j: 14, type: 'MEE', E, A: Ar, I },
  10: { node_i: 8,  node_j: 9,  type: 'MEE', E, A: Ar, I },
  11: { node_i: 9,  node_j: 10, type: 'MEE', E, A: Ar, I },
  12: { node_i: 10, node_j: 11, type: 'MEE', E, A: Ar, I },
  13: { node_i: 11, node_j: 12, type: 'MEE', E, A: Ar, I },
  14: { node_i: 12, node_j: 13, type: 'MEE', E, A: Ar, I },
  15: { node_i: 13, node_j: 14, type: 'MEE', E, A: Ar, I },
  16: { node_i: 14, node_j: 15, type: 'MEE', E, A: Ar, I },
  17: { node_i: 15, node_j: 16, type: 'MEE', E, A: Ar, I },
  18: { node_i: 16, node_j: 17, type: 'MEE', E, A: Ar, I },
  19: { node_i: 17, node_j: 18, type: 'MEE', E, A: Ar, I },
  20: { node_i: 18, node_j: 19, type: 'MEE', E, A: Ar, I },
  21: { node_i: 19, node_j: 20, type: 'MEE', E, A: Ar, I },
  22: { node_i: 20, node_j: 21, type: 'MEE', E, A: Ar, I },
  23: { node_i: 21, node_j: 22, type: 'MEA', E, A: Ar, I },
}

const EXAMPLE_SUPPORTS = {
  1:  { kx: 1e200, ky: 1e200, km: 1e200 },
  4:  { kx: 792305.3785, ky: 2641017.928, km: 1584610.757 },
  7:  { kx: 736844.002,  ky: 2456146.673, km: 1473688.004 },
  22: { kx: 1e200, ky: 1e200, km: 0 },
}

// Simple example loads — vertical load at node 6
const EXAMPLE_LOADS = {
  6: { fx: 0, fy: -5, m: 0 },
}

// ── Simple example (portal frame) ────────────────────────────────────────────
const SIMPLE_NODES = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: 4 },
  3: { x: 5, y: 4 },
  4: { x: 5, y: 0 },
}
const SIMPLE_BARS = {
  1: { node_i: 1, node_j: 2, type: 'MEE', E: 2.1e7, A: 0.01, I: 0.0001 },
  2: { node_i: 2, node_j: 3, type: 'MEE', E: 2.1e7, A: 0.01, I: 0.0001 },
  3: { node_i: 3, node_j: 4, type: 'MEE', E: 2.1e7, A: 0.01, I: 0.0001 },
}
const SIMPLE_SUPPORTS = {
  1: { kx: 1e200, ky: 1e200, km: 1e200 },
  4: { kx: 1e200, ky: 1e200, km: 1e200 },
}
const SIMPLE_LOADS = {
  2: { fx: 2, fy: 0, m: 0 },
  3: { fx: 0, fy: -3, m: 0 },
}

// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [nodes,    setNodes]    = useState(EXAMPLE_NODES)
  const [bars,     setBars]     = useState(EXAMPLE_BARS)
  const [supports, setSupports] = useState(EXAMPLE_SUPPORTS)
  const [loads,    setLoads]    = useState(EXAMPLE_LOADS)

  const [results,      setResults]      = useState(null)
  const [error,        setError]        = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [showDeformed, setShowDeformed] = useState(false)
  const [activeTab,    setActiveTab]    = useState('data')   // data | results

  const loadExample = (type) => {
    if (type === 'favio') {
      setNodes(EXAMPLE_NODES); setBars(EXAMPLE_BARS)
      setSupports(EXAMPLE_SUPPORTS); setLoads(EXAMPLE_LOADS)
    } else {
      setNodes(SIMPLE_NODES); setBars(SIMPLE_BARS)
      setSupports(SIMPLE_SUPPORTS); setLoads(SIMPLE_LOADS)
    }
    setResults(null); setError(null)
  }

  const runAnalysis = async () => {
    setLoading(true); setError(null)
    try {
      const body = { nodes, bars, supports, loads }
      const res = await fetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Server error')
      }
      const data = await res.json()
      setResults(data)
      setActiveTab('results')
      setShowDeformed(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 bg-gray-900 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11H5m14 0l-4-4m4 4l-4 4" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">StructaCalc</h1>
            <p className="text-xs text-gray-400">2D Matrix Structural Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Load example:</span>
          <button onClick={() => loadExample('simple')}
            className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded">
            Portal Frame
          </button>
          <button onClick={() => loadExample('favio')}
            className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded">
            Favio's Structure
          </button>
          {results && (
            <button onClick={() => setShowDeformed(s => !s)}
              className={`text-xs px-2 py-1 rounded border transition-colors ${
                showDeformed
                  ? 'border-orange-500 text-orange-400 bg-orange-900/30'
                  : 'border-gray-600 text-gray-400 bg-gray-800'
              }`}>
              Deformed {showDeformed ? 'ON' : 'OFF'}
            </button>
          )}
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm
                       font-semibold px-4 py-1.5 rounded flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            Analyze
          </button>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-red-900/60 border-b border-red-700 px-5 py-2 text-sm text-red-300 flex-shrink-0">
          ⚠ {error}
        </div>
      )}

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar */}
        <div className="w-72 flex-shrink-0 bg-gray-900 border-r border-gray-700 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-700 flex-shrink-0">
            {['data', 'results'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-400'
                    : 'text-gray-500 hover:text-gray-300'
                }`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden p-3">
            {activeTab === 'data' ? (
              <DataPanel
                nodes={nodes} setNodes={setNodes}
                bars={bars} setBars={setBars}
                supports={supports} setSupports={setSupports}
                loads={loads} setLoads={setLoads}
              />
            ) : (
              <ResultsPanel results={results} />
            )}
          </div>

          {/* Footer stats */}
          <div className="border-t border-gray-700 px-3 py-2 flex gap-3 text-xs text-gray-500 flex-shrink-0">
            <span>{Object.keys(nodes).length} nodes</span>
            <span>{Object.keys(bars).length} bars</span>
            <span>{Object.keys(supports).length} supports</span>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-4 overflow-hidden">
          <StructureViewer
            nodes={nodes} bars={bars}
            supports={supports} loads={loads}
            results={results}
            showDeformed={showDeformed}
          />
        </div>
      </div>
    </div>
  )
}
