from pydantic import BaseModel
from typing import Dict


class Node(BaseModel):
    x: float
    y: float


class Bar(BaseModel):
    node_i: int
    node_j: int
    type: str          # MEE | MEA | MAE
    E: float
    A: float
    I: float


class Support(BaseModel):
    kx: float          # 1e200 = rigid, 0 = free, other = elastic
    ky: float
    km: float


class Load(BaseModel):
    fx: float = 0.0
    fy: float = 0.0
    m:  float = 0.0


class AnalysisRequest(BaseModel):
    nodes:    Dict[int, Node]
    bars:     Dict[int, Bar]
    supports: Dict[int, Support]
    loads:    Dict[int, Load] = {}


class DisplacementResult(BaseModel):
    ux: float
    uy: float
    theta: float


class ReactionResult(BaseModel):
    rx: float
    ry: float
    rm: float


class ElementForceResult(BaseModel):
    N_i: float
    V_i: float
    M_i: float
    N_j: float
    V_j: float
    M_j: float


class DeformedNode(BaseModel):
    x: float
    y: float
    scale: float


class AnalysisResponse(BaseModel):
    displacements:  Dict[int, DisplacementResult]
    reactions:      Dict[int, ReactionResult]
    element_forces: Dict[int, ElementForceResult]
    deformed_nodes: Dict[int, DeformedNode]
