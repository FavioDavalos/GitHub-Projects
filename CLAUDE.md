# StructaCalc — CLAUDE.md

## What this project is

2D matrix structural analysis web app. Python backend (FastAPI + numpy) + React frontend (Vite + Tailwind).
Built by Favio (structural engineering logic) and Max (product).

## Running the project

### Backend
```bash
cd backend
uv venv && source .venv/bin/activate
uv pip install fastapi uvicorn numpy pydantic
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev   # runs on :5173, proxies /analyze to :8000
```

## Architecture

```
backend/app/
  engine/stiffness.py  — local stiffness matrices (MEE/MEA/MAE) + transformation
  engine/solver.py     — global assembly, penalty supports, solve K·u=F, reactions, element forces
  models.py            — Pydantic request/response models
  main.py              — FastAPI app, single POST /analyze endpoint

frontend/src/
  App.jsx              — state management, API call, layout
  components/StructureViewer.jsx  — SVG canvas, nodes/bars/supports/loads/deformed shape
  components/DataPanel.jsx        — forms: add/remove nodes, bars, supports, loads
  components/ResultsPanel.jsx     — tables: displacements, reactions, element forces
```

## Key engineering details

- **DOFs**: 3 per node (ux, uy, theta), numbered as node_index*3 + {0,1,2}
- **MEA** (fixed-pinned): condensed stiffness with theta_j = 0, uses 3EI/L coefficients
- **MAE** (pinned-fixed): condensed stiffness with theta_i = 0, uses 3EI/L coefficients
- **Supports**: penalty method — add kx/ky/km to K diagonal. Use 1e200 for rigid, 0 for free, actual stiffness for elastic
- **Reactions**: R = -K_penalty · U (force support exerts ON structure; negative of penalty force)
- **Deformed shape**: auto-scaled to 10% of structure bounding box for visualization

## Common error: singular stiffness matrix

Caused by unconstrained DOF. Most common case: a node where ALL connected bars are pinned at that end → rotation is free. Fix: at least one bar at that node must be MEE or have the fixed end at that node.

Example: node 5 in Favio's original notebook has bars 4(MEA), 5(MEA), 6(MAE), 8(MAE) — all pinned at node 5. Must change at least one to MEE.

## API contract

```
POST /analyze
Content-Type: application/json

{
  "nodes":    { "1": {"x": 0, "y": 0}, ... },
  "bars":     { "1": {"node_i": 1, "node_j": 2, "type": "MEE", "E": 2.1e7, "A": 0.00251, "I": 1.686e-5}, ... },
  "supports": { "1": {"kx": 1e200, "ky": 1e200, "km": 1e200}, ... },
  "loads":    { "2": {"fx": 0, "fy": -5, "m": 0}, ... }
}

Response: { displacements, reactions, element_forces, deformed_nodes }
```

## Units

Not enforced. Favio's notebook uses Tn, m, Tn/m², m², m⁴. Must be consistent throughout.

## Tech stack

- Backend: Python 3.12, FastAPI, numpy, pydantic, uvicorn
- Frontend: React 18, Vite 5, Tailwind CSS 3
- Package managers: uv (Python), npm (JS)
- No database yet — all state is in-memory per request
