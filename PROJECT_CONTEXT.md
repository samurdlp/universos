# UniverSOS — Project Context & Ledger

> **Context Ledger**: Fuente de verdad técnica y arquitectónica del proyecto. Mantener sincronizado ante cambios estructurales.

---

## 1. Identidad y Stack
- **Identidad:** SPA cliente para la preparación y dominio de asignaturas universitarias STEM (teoría, heurística de examen, resolución algorítmica por pasos, chuletas imprimibles y simulador interactivo).
- **Stack:** Vanilla JavaScript (ES6+ modular, sin bundlers ni frameworks), HTML5 semántico, CSS3 modular (Custom Properties, Grid & Flexbox, animaciones de alto rendimiento), CDN MathJax v3 (renderizado TeX asíncrono en cola), Supabase REST API (sincronización multi-dispositivo en la nube vía fetch nativo) y Google Gemini API (generación y adaptación asistida de temarios en JSON).

---

## 2. Decisiones Arquitectónicas Clave (ADRs)

| ID | Decisión | Justificación / Consecuencia |
| :--- | :--- | :--- |
| **ADR-01** | **Zero-Build Architecture (No bundler)** | Cero dependencias npm y ejecución directa sobre cualquier servidor estático (GitHub Pages, Vercel, LiveServer). Los scripts se cargan en orden secuencial explícito en `index.html`. |
| **ADR-02** | **CSS Grid para Acordeones con LaTeX** | MathJax v3 es incapaz de calcular cajas delimitadoras (*bounding boxes*) en nodos con `display: none`. Se prohibió su uso en desplegables; se usa `grid-template-rows: 0fr -> 1fr` con `overflow: hidden`. |
| **ADR-03** | **Pre-Parse Sanitizer & Normalizador LaTeX** | En cadenas JSON, caracteres de escape como `\f`, `\t`, `\b` degradaban fórmulas (`\frac`, `\theta`, `\beta`). `fixJsonLatex()` y `sanitizeHTML()` interceptan y normalizan el texto antes de `JSON.parse` y de la inyección DOM. |
| **ADR-04** | **Persistencia Híbrida (Local-First + Cloud)** | `localStorage` como capa primaria de almacenamiento y offline-first. La nube (Supabase) es un canal opcional de respaldo y réplica móvil protegido con derivación de clave `SHA-256` y enlace mágico en URL hash (`#cloud_cfg=`). |
| **ADR-05** | **Z-Index Layering Estricto y Modales Frontales** | Para evitar que modales de confirmación o alerta queden ocultos tras modales de importación o IA, se definieron tres niveles: fondo/modales base (`z-index: 200`), preview (`z-index: 260`) y alertas críticas (`z-index: 400 !important`). |
| **ADR-06** | **Interacción Pointerdown/Mousedown No Destructiva** | La selección de texto y arrastre de ratón que termina fuera de un contenedor no cierra el modal ni el menú; el cierre requiere que inicio y fin ocurran en el backdrop. |

---

## 3. Estado Actual y Registro de Funcionalidades

| Módulo / Funcionalidad | Estado | Detalles Técnicos |
| :--- | :--- | :--- |
| **Gestión de Temario (CRUD)** | `Completo` | Alta, baja y edición en cascada de Asignaturas, Temas, Teoría y Ejercicios sin dejar huérfanos (`edit.js`). |
| **Visor de Teoría y Ejercicios** | `Completo` | Tarjeta de teoría distinguida, pasos algorítmicos numerados, trucos y trampas con callouts semánticos (`render.js`). |
| **Renderizado Matemático (MathJax v3)** | `Completo` | Cola serializada anti-colisión en `math-render.js` con soporte en contenido dinámico, sidebars y acordeones. |
| **Buscador Global (Ctrl+K / Cmd+K)** | `Completo` | Búsqueda en tiempo real por asignaturas, temas, fórmulas, pistas y trampas; resaltado y navegación con scroll suave (`search.js`). |
| **Importador JSON Universal con Preview** | `Completo` | Soporta temas completos, teoría suelta, ejercicios sueltos o backups íntegros. Modal de validación previa (`#importPreviewModal`) con opción de "Corregir" destino (`import-export.js`). |
| **Simulador de Examen Universitario** | `Completo` | Modos A Ciegas/Guiado, cronómetro, selector de problemas, revelado paso a paso progresivo y autoevaluación 0-10 (`render.js`). |
| **Generador de Chuletas A4 (Print-Ready)** | `Completo` | Generación multi-columna densa en 2 o 3 columnas, filtros por tipo de bloque y optimización `@media print` (`render.js`). |
| **Sincronización en la Nube (Supabase)** | `Completo` | Panel simplificado con ID + PIN, ajustes avanzados colapsables, hash SHA-256 y exportador de enlace mágico (`cloud-sync.js`). |
| **Diseño y Adaptabilidad Móvil** | `Completo` | Menú lateral colapsable unificado (botón panel lateral), soporte horizontal, sin desbordamiento horizontal y tipografía justificada (`base.css`). |
| **Modo IA (Gemini API Integration)** | `Completo` | Prompting de generación de temarios adaptados al esquema canónico desde el cliente (`ai.js`). |

---

## 4. Tareas Pendientes Inmediatas (Backlog Priorizado)

1. **[QA / Regresión]** Prueba de estrés de sincronización cruzada (móvil vs escritorio) bajo condiciones de conexión intermitente.
2. **[Refactor / Limpieza]** Depurar archivos `.css` y `.js` duplicados en la raíz que ya residen en sus carpetas `css/` y `js/` para evitar divergencias o lecturas accidentales.
3. **[PWA / Offline Assets]** Añadir `manifest.json` y Service Worker ligero para habilitar instalación como Web App nativa en móviles y tablets sin conexión.
4. **[Tests Automatizados]** Implementar un suite de tests de regresión ligero en Node.js para `fixJsonLatex` y `sanitizeHTML` ante esquemas JSON complejos de exámenes.
