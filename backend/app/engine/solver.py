import numpy as np
from .stiffness import global_element_stiffness


def analyze(nodes: dict, bars: dict, supports: dict, loads: dict) -> dict:
    """
    Run 2D matrix structural analysis.

    nodes:    {id: {x, y}}
    bars:     {id: {node_i, node_j, type, E, A, I}}
    supports: {node_id: {kx, ky, km}}   — use 1e200 for rigid, 0 for free
    loads:    {node_id: {fx, fy, m}}    — nodal forces [Tn] and moments [Tn·m]

    Returns: {displacements, reactions, element_forces, deformed_nodes}
    """
    node_ids = sorted(nodes.keys())
    n_nodes = len(node_ids)
    n_dof = n_nodes * 3  # 3 DOF per node: u, v, theta

    # Map node id → index
    idx = {nid: i for i, nid in enumerate(node_ids)}

    # --- Assemble global stiffness matrix ---
    K = np.zeros((n_dof, n_dof))

    for bar_id, bar in bars.items():
        ni = bar["node_i"]
        nj = bar["node_j"]
        x1, y1 = nodes[ni]["x"], nodes[ni]["y"]
        x2, y2 = nodes[nj]["x"], nodes[nj]["y"]
        ke = global_element_stiffness(
            bar["type"], bar["E"], bar["A"], bar["I"], x1, y1, x2, y2
        )
        dofs_i = [idx[ni] * 3, idx[ni] * 3 + 1, idx[ni] * 3 + 2]
        dofs_j = [idx[nj] * 3, idx[nj] * 3 + 1, idx[nj] * 3 + 2]
        dofs = dofs_i + dofs_j
        for a in range(6):
            for b in range(6):
                K[dofs[a], dofs[b]] += ke[a, b]

    # --- Apply elastic/rigid supports (penalty method) ---
    for node_id, sup in supports.items():
        i = idx[node_id]
        K[i * 3,     i * 3]     += sup["kx"]
        K[i * 3 + 1, i * 3 + 1] += sup["ky"]
        K[i * 3 + 2, i * 3 + 2] += sup["km"]

    # --- Build force vector ---
    F = np.zeros(n_dof)
    for node_id, load in loads.items():
        i = idx[node_id]
        F[i * 3]     += load.get("fx", 0.0)
        F[i * 3 + 1] += load.get("fy", 0.0)
        F[i * 3 + 2] += load.get("m",  0.0)

    # --- Solve ---
    try:
        U = np.linalg.solve(K, F)
    except np.linalg.LinAlgError:
        raise ValueError("Singular stiffness matrix — check supports and connectivity.")

    # --- Displacements ---
    displacements = {}
    for nid in node_ids:
        i = idx[nid]
        displacements[nid] = {
            "ux": float(U[i * 3]),
            "uy": float(U[i * 3 + 1]),
            "theta": float(U[i * 3 + 2]),
        }

    # --- Reactions (support forces) ---
    # R = -K_penalty * U: force the support exerts on the structure
    reactions = {}
    for node_id, sup in supports.items():
        i = idx[node_id]
        rx = -sup["kx"] * U[i * 3]
        ry = -sup["ky"] * U[i * 3 + 1]
        rm = -sup["km"] * U[i * 3 + 2]
        reactions[node_id] = {
            "rx": float(rx),
            "ry": float(ry),
            "rm": float(rm),
        }

    # --- Element internal forces (local) ---
    element_forces = {}
    for bar_id, bar in bars.items():
        ni, nj = bar["node_i"], bar["node_j"]
        x1, y1 = nodes[ni]["x"], nodes[ni]["y"]
        x2, y2 = nodes[nj]["x"], nodes[nj]["y"]
        from .stiffness import (
            local_stiffness_MEE, local_stiffness_MEA, local_stiffness_MAE,
            transformation_matrix, element_length,
        )
        L = element_length(x1, y1, x2, y2)
        T = transformation_matrix(x1, y1, x2, y2)
        if bar["type"] == "MEE":
            k_loc = local_stiffness_MEE(bar["E"], bar["A"], bar["I"], L)
        elif bar["type"] == "MEA":
            k_loc = local_stiffness_MEA(bar["E"], bar["A"], bar["I"], L)
        else:
            k_loc = local_stiffness_MAE(bar["E"], bar["A"], bar["I"], L)

        dofs_i = [idx[ni] * 3, idx[ni] * 3 + 1, idx[ni] * 3 + 2]
        dofs_j = [idx[nj] * 3, idx[nj] * 3 + 1, idx[nj] * 3 + 2]
        u_global = U[dofs_i + dofs_j]
        u_local = T @ u_global
        f_local = k_loc @ u_local

        element_forces[bar_id] = {
            "N_i":  float(f_local[0]),   # axial at i
            "V_i":  float(f_local[1]),   # shear at i
            "M_i":  float(f_local[2]),   # moment at i
            "N_j":  float(f_local[3]),
            "V_j":  float(f_local[4]),
            "M_j":  float(f_local[5]),
        }

    # --- Deformed shape (scaled for visualization) ---
    deformed_nodes = {}
    max_disp = max(
        (abs(d["ux"]) + abs(d["uy"]) for d in displacements.values()), default=1e-10
    )
    # Auto scale: deformed shape shows ~10% of structure size
    xs = [nodes[n]["x"] for n in node_ids]
    ys = [nodes[n]["y"] for n in node_ids]
    struct_size = max(max(xs) - min(xs), max(ys) - min(ys), 1e-10)
    scale = (struct_size * 0.1) / max_disp if max_disp > 1e-12 else 1.0

    for nid in node_ids:
        d = displacements[nid]
        deformed_nodes[nid] = {
            "x": nodes[nid]["x"] + d["ux"] * scale,
            "y": nodes[nid]["y"] + d["uy"] * scale,
            "scale": float(scale),
        }

    return {
        "displacements": displacements,
        "reactions": reactions,
        "element_forces": element_forces,
        "deformed_nodes": deformed_nodes,
    }
