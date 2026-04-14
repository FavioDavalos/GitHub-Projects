import numpy as np


def _base_axial(EA, L):
    """Axial part of the stiffness matrix."""
    k = np.zeros((6, 6))
    k[0, 0] = EA / L
    k[0, 3] = -EA / L
    k[3, 0] = -EA / L
    k[3, 3] = EA / L
    return k


def local_stiffness_MEE(E, A, I, L):
    """Bi-fixed frame element (Bi-empotrada)."""
    EI = E * I
    EA = E * A
    k = _base_axial(EA, L)
    k[1, 1] = 12 * EI / L**3
    k[1, 2] = 6 * EI / L**2
    k[1, 4] = -12 * EI / L**3
    k[1, 5] = 6 * EI / L**2
    k[2, 1] = 6 * EI / L**2
    k[2, 2] = 4 * EI / L
    k[2, 4] = -6 * EI / L**2
    k[2, 5] = 2 * EI / L
    k[4, 1] = -12 * EI / L**3
    k[4, 2] = -6 * EI / L**2
    k[4, 4] = 12 * EI / L**3
    k[4, 5] = -6 * EI / L**2
    k[5, 1] = 6 * EI / L**2
    k[5, 2] = 2 * EI / L
    k[5, 4] = -6 * EI / L**2
    k[5, 5] = 4 * EI / L
    return k


def local_stiffness_MEA(E, A, I, L):
    """Fixed-Pinned frame element (Empotrada-Articulada). Pin at end j (DOF 5 condensed)."""
    EI = E * I
    EA = E * A
    k = _base_axial(EA, L)
    k[1, 1] = 3 * EI / L**3
    k[1, 2] = 3 * EI / L**2
    k[1, 4] = -3 * EI / L**3
    k[2, 1] = 3 * EI / L**2
    k[2, 2] = 3 * EI / L
    k[2, 4] = -3 * EI / L**2
    k[4, 1] = -3 * EI / L**3
    k[4, 2] = -3 * EI / L**2
    k[4, 4] = 3 * EI / L**3
    return k


def local_stiffness_MAE(E, A, I, L):
    """Pinned-Fixed frame element (Articulada-Empotrada). Pin at end i (DOF 2 condensed)."""
    EI = E * I
    EA = E * A
    k = _base_axial(EA, L)
    k[1, 1] = 3 * EI / L**3
    k[1, 4] = -3 * EI / L**3
    k[1, 5] = 3 * EI / L**2
    k[4, 1] = -3 * EI / L**3
    k[4, 4] = 3 * EI / L**3
    k[4, 5] = -3 * EI / L**2
    k[5, 1] = 3 * EI / L**2
    k[5, 4] = -3 * EI / L**2
    k[5, 5] = 3 * EI / L
    return k


def transformation_matrix(x1, y1, x2, y2):
    """6x6 rotation matrix from local to global coordinates."""
    dx = x2 - x1
    dy = y2 - y1
    L = np.sqrt(dx**2 + dy**2)
    c = dx / L
    s = dy / L
    T = np.zeros((6, 6))
    T[0, 0] = c;  T[0, 1] = s
    T[1, 0] = -s; T[1, 1] = c
    T[2, 2] = 1
    T[3, 3] = c;  T[3, 4] = s
    T[4, 3] = -s; T[4, 4] = c
    T[5, 5] = 1
    return T


def element_length(x1, y1, x2, y2):
    return np.sqrt((x2 - x1)**2 + (y2 - y1)**2)


def global_element_stiffness(bar_type, E, A, I, x1, y1, x2, y2):
    """Compute the 6x6 global stiffness matrix for a single element."""
    L = element_length(x1, y1, x2, y2)
    if bar_type == "MEE":
        k_local = local_stiffness_MEE(E, A, I, L)
    elif bar_type == "MEA":
        k_local = local_stiffness_MEA(E, A, I, L)
    elif bar_type == "MAE":
        k_local = local_stiffness_MAE(E, A, I, L)
    else:
        raise ValueError(f"Unknown bar type: {bar_type}")
    T = transformation_matrix(x1, y1, x2, y2)
    return T.T @ k_local @ T
