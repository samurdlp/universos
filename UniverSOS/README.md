# 🎓 UniverSOS — Gestor Integral de Estudio Universitario

**UniverSOS** es una Single Page Application (SPA) para la gestión del estudio universitario, unificando teoría y resolución algorítmica paso a paso de problemas matemáticos y técnicos en una interfaz moderna, responsiva y adaptada a móvil y escritorio.

---

## 📁 Estructura del Proyecto

```
UniverSOS/
├── index.html              # Documento raíz, buscador, modales y MathJax
├── css/
│   ├── variables.css       # Paleta temática, variables semánticas y modo oscuro
│   ├── base.css            # Reset, layout principal, responsive y @media print
│   ├── components.css      # Acordeones, cards, dropdowns, selector de dominio y buscador
│   └── modals.css          # Modales accesibles, Drag & Drop y loaders
├── js/
│   ├── sanitizer.js        # Sanitizador HTML y extractor de citas (Regla #1 y #4)
│   ├── state.js            # Base de datos (localStorage), modo examen y filtros
│   ├── modals.js           # Sistema de alertas, confirmación accesible y shortcuts
│   ├── math-render.js      # Orquestador MathJax v3 con cola y renderizado completo
│   ├── render.js           # Vistas, dominio, modo examen, checklists y chuleta
│   ├── edit.js             # Operaciones CRUD y borrado en cascada
│   ├── import-export.js    # Parser tolerante a fallos con normalizador fixJsonLatex
│   ├── ai.js               # Conexión directa a API de Gemini con gestión de clave integrada
│   ├── search.js           # Buscador global en tiempo real (Ctrl+K)
│   ├── cloud-sync.js       # Sincronización en la nube con Supabase REST API
│   └── app.js              # Inicializador y orquestación
└── README.md               # Esta documentación
```

---

## 🛡️ Reglas Críticas de Supervivencia

Al ampliar o mantener este código, **respetar siempre**:

1. **Escudo HTML vs LaTeX (`sanitizer.js`):**
   * En expresiones como `$0 < x < 1$`, MathJax y el navegador colisionan si el `<` se interpreta como tag HTML.
   * La función `sanitizeHTML()` intercepta los textos antes del DOM, protegiendo solo tags legítimos (`<br>`, `<strong>`, etc.) y transformando el resto de `<` en `&lt;`.

2. **Acordeones y MathJax (`components.css` / `math-render.js`):**
   * **NUNCA usar `display: none`** en contenedores que puedan tener fórmulas LaTeX. MathJax no puede calcular su bounding box.
   * Los acordeones usan **CSS Grid (`grid-template-rows: 0fr` $\rightarrow$ `1fr`)** con `overflow: hidden`.
   * Tras renderizar en el DOM, se invoca `MathJax.typesetClear()` seguido de `MathJax.typesetPromise()`.

3. **Modales Propios (`modals.js`):**
   * **NO usar `alert()` ni `confirm()`** nativos (los navegadores los bloquean o suspenden hilos). Usar `customAlert()` y `customConfirm()`.

4. **Extracción de Citas Fantasma (`sanitizer.js`):**
   * Detecta y remueve `[cite: ...]` generadas accidentalmente por LLMs, agrupándolas automáticamente en la sección de referencias al pie.

5. **Protección de LaTeX en JSON (`import-export.js`):**
   * El normalizador `fixJsonLatex` previene que comandos LaTeX como `\frac`, `\theta`, `\beta`, `\rho`, `\upsilon` o `\nabla` se degraden a caracteres de control JSON (form feeds, tabs, backspaces o errores unicode).
   * MathJax se sincroniza mediante cola en `math-render.js` tanto en el contenido principal como en los títulos del panel lateral.

6. **Eliminación en Cascada Garantizada (`edit.js`):**
   * Al eliminar una asignatura o tema, se purgan de inmediato todas las subramas asociadas (temas, teorías, ejercicios, checklists y pasos algorítmicos), limpiando el DOM y el `localStorage` sin dejar estados huérfanos.

7. **Persistencia de Progreso (`state.js` / `render.js`):**
   * La selección de tema claro/oscuro y las casillas marcadas en los checklists de conceptos clave se guardan automáticamente en `localStorage`.

---

## 📐 Esquema JSON Maestro

```json
{
  "asignatura": "Nombre de la Asignatura",
  "tema": "Nombre del Tema",
  "teoria": {
    "title": "Título de la Teoría",
    "introduccion": "Texto introductorio...",
    "secciones": [
      {
        "title": "Subsección",
        "content": "Contenido con fórmulas $f(x) = \\int x dx$...",
        "detalles": [
          { "title": "Detalle desplegable", "content": "Explicación..." }
        ]
      }
    ],
    "checklistClave": [
      { "title": "Concepto Clave", "subtitle": "Explicación interactiva desplegable..." }
    ]
  },
  "ejercicios": [
    {
      "title": "Nombre del Ejercicio Tipo",
      "probabilidad": 85,
      "identificacion": [
        "Pistas para identificar el tipo de problema en el examen"
      ],
      "algoritmo": [
        {
          "title": "Paso 1: Planteamiento",
          "subtitle": "Breve explicación de la acción a realizar",
          "example": "Demostración o cálculo del paso en un caso concreto"
        }
      ],
      "ejemploCompleto": "Resolución integral paso a paso con fórmulas LaTeX...",
      "variaciones": [
        { "title": "Caso particular", "content": "...", "fix": "...", "example": "..." }
      ],
      "trucos": [
        { "title": "Atajo de cálculo", "content": "...", "example": "..." }
      ],
      "errores": [
        { "title": "Fallo típico", "content": "...", "fix": "...", "example": "..." }
      ],
      "trampas": [
        { "title": "Detalle que suele pasarse por alto", "content": "...", "fix": "..." }
      ],
      "ejerciciosPropuestos": [
        { "ref": "Examen Junio 2024", "nota": "Dificultad Media", "enunciado": "Calcular..." }
      ]
    }
  ]
}
```

---

## 🚀 Cómo Ejecutar

1. Abre directamente `index.html` en cualquier navegador web moderno (Edge, Chrome, Firefox, Safari).
2. Funciona **100% offline** directamente con el protocolo `file://` o a través de cualquier servidor local (`npx serve`, Live Server, etc.).
3. Los datos se almacenan en el navegador (`localStorage`) y pueden exportarse o restaurarse en formato `.json` en cualquier momento desde el botón de base de datos.

---

## ⚡ Nuevas Funcionalidades Integradas

1. **🔍 Buscador Global (`Ctrl+K`):**
   * Búsqueda en tiempo real a través de todas las asignaturas, temas, fórmulas, pasos de algoritmos, trucos y trampas.
   * Navegación instantánea al resultado seleccionado con un solo clic.

2. **🎯 Modo Examen / Práctica:**
   * Alterna entre modo estudio y modo examen con el botón de diana en la cabecera.
   * Oculta el desarrollo y la solución detrás de una tarjeta interactiva para que el estudiante resuelva en papel antes de comprobar.
   * Al revelar la solución, ofrece botones de autoevaluación rápida (Dominado, Repasar, Duda).

3. **📊 Indicadores de Dominio y Filtros de Estudio:**
   * Clasifica cada ejercicio en: 🟢 Dominado, 🟡 Repasar, 🔴 Duda, ⚪ Sin empezar.
   * Barra de filtros rápida en el panel lateral con contadores en tiempo real para focalizar el tiempo de estudio.

4. **🖨️ Chuleta Imprimible y Exportación a PDF:**
   * Botón directo "Imprimir Chuleta" que expande automáticamente todos los acordeones, formatea las fórmulas y optimiza el documento con `@media print` para imprimir en papel o guardar en PDF limpio.

5. **☁️ Sincronización en la Nube (Supabase):**
   * Conexión con proyectos gratuitos de Supabase mediante REST API para compartir apuntes entre móvil, tablet y ordenador sin servidores intermedios.
   * Incluye soporte para auto-sincronización y plantilla SQL en 1 clic.
