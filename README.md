# StructaCalc — Análisis Matricial de Estructuras 2D

Aplicación web para análisis matricial de estructuras 2D. Desarrollada por Favio (cálculo estructural) y Max (producto).

---

## ¿Qué hace?

Tomás los datos de tu estructura (nodos, barras, apoyos, cargas) y el programa resuelve el sistema matricial completo:

- Matrices de rigidez locales para barras **MEE**, **MEA** y **MAE**
- Transformación a coordenadas globales
- Ensamblaje de la matriz global de rigidez
- Apoyos rígidos y elásticos (método de penalización)
- Resolución del sistema `K · u = F`
- Desplazamientos, reacciones y fuerzas internas por barra
- Visualización interactiva con forma deformada

---

## Requisitos previos

Necesitás tener instalados:

- [Python 3.12+](https://www.python.org/downloads/)
- [uv](https://docs.astral.sh/uv/getting-started/installation/) — gestor de entornos Python (más rápido que pip)
- [Node.js 18+](https://nodejs.org/) — para el frontend

Para verificar que los tenés:

```bash
python --version   # debe decir 3.12 o mayor
uv --version
node --version     # debe decir 18 o mayor
```

---

## Cómo correr el proyecto

### 1. Backend (Python / FastAPI)

```bash
# Entrar a la carpeta del backend
cd backend

# Crear el entorno virtual
uv venv

# Activarlo
source .venv/bin/activate        # Mac / Linux
# .venv\Scripts\activate         # Windows

# Instalar dependencias
uv pip install fastapi uvicorn numpy pydantic

# Correr el servidor
uvicorn app.main:app --reload --port 8000
```

El servidor queda disponible en `http://localhost:8000`
Podés ver la documentación automática en `http://localhost:8000/docs`

### 2. Frontend (React / Vite)

En otra terminal:

```bash
# Entrar a la carpeta del frontend
cd frontend

# Instalar dependencias
npm install

# Correr la app
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`

---

## Estructura del proyecto

```
├── backend/
│   └── app/
│       ├── main.py          ← API (FastAPI): recibe datos, devuelve resultados
│       ├── models.py        ← Definición de los datos de entrada y salida
│       └── engine/
│           ├── stiffness.py ← Matrices de rigidez locales y transformación
│           └── solver.py    ← Ensamblaje, solución del sistema, resultados
│
├── frontend/
│   └── src/
│       ├── App.jsx                      ← Componente principal
│       └── components/
│           ├── StructureViewer.jsx      ← Visualización SVG de la estructura
│           ├── DataPanel.jsx            ← Formularios de entrada de datos
│           └── ResultsPanel.jsx         ← Tablas de resultados
│
└── Analisis_Matricial_2D.ipynb  ← Notebook original de Favio (Milestone 1)
```

---

## Tipos de barra soportados

| Código | Nombre              | Descripción                                      |
|--------|---------------------|--------------------------------------------------|
| MEE    | Bi-empotrada        | Ambos extremos empotrados (transmite momento)    |
| MEA    | Empotrada-Articulada| Empotrado en i, articulado en j (pin en j)       |
| MAE    | Articulada-Empotrada| Articulado en i (pin en i), empotrado en j       |

> **Atención:** Si en un nodo todas las barras conectadas son articuladas en ese extremo, la rotación queda libre y la matriz es singular. Al menos una barra debe transmitir momento en cada nodo sin apoyo de rotación.

---

## Unidades

El sistema no impone unidades. Usá el sistema que quieras siempre que sea consistente. El notebook original de Favio usa:

- Fuerzas: **Tn** (toneladas)
- Longitudes: **m** (metros)
- E: **Tn/m²**
- A: **m²**
- I: **m⁴**

---

## Próximos pasos

- [ ] Cargas distribuidas en barras
- [ ] Exportar resultados a PDF
- [ ] Guardar y cargar proyectos
- [ ] Autenticación y pagos (Stripe)
