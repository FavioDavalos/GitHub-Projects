from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models import AnalysisRequest, AnalysisResponse
from .engine import analyze

app = FastAPI(title="Structural Analysis 2D API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalysisResponse)
def run_analysis(req: AnalysisRequest):
    try:
        nodes    = {k: {"x": v.x, "y": v.y} for k, v in req.nodes.items()}
        bars     = {k: v.model_dump() for k, v in req.bars.items()}
        supports = {k: {"kx": v.kx, "ky": v.ky, "km": v.km} for k, v in req.supports.items()}
        loads    = {k: {"fx": v.fx, "fy": v.fy, "m": v.m} for k, v in req.loads.items()}

        result = analyze(nodes, bars, supports, loads)

        # Convert int keys to int for pydantic
        return AnalysisResponse(
            displacements  = {int(k): v for k, v in result["displacements"].items()},
            reactions      = {int(k): v for k, v in result["reactions"].items()},
            element_forces = {int(k): v for k, v in result["element_forces"].items()},
            deformed_nodes = {int(k): v for k, v in result["deformed_nodes"].items()},
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {str(e)}")
