# UniverSOS — Project Context & Ledger

> **Context Ledger**: Fuente de verdad técnica y arquitectónica del proyecto. Mantener sincronizado ante cambios estructurales.

---

## 1. Identidad y Stack
- **Identidad:** SPA cliente para la preparación y dominio de asignaturas universitarias STEM (teoría, heurística de examen, resolución algorítmica por pasos, chuletas imprimibles, simulador interactivo y modo offline PWA).
- **Versión:** `v2.6.0` (PWA Offline-First + Automated Test Suite + ARIA Accessibility).
- **Stack:** Vanilla JavaScript (ES6+ modular, sin bundlers ni dependencias de runtime), HTML5 semántico con roles ARIA, CSS3 modular (Custom Properties, Grid & Flexbox, animaciones con curvas Emil Kowalski), CDN MathJax v3 (renderizado TeX asíncrono con debounce en cola), Service Worker nativo (estrategia Cache-First y Stale-While-Revalidate para PWA), Supabase REST API (sincronización en la nube con derivación criptográfica SHA-256) y Google Gemini API (generación multimodal client-side).

---

## 2. Decisiones Arquitectónicas Clave (ADRs)

| ID | Decisión | Justificación / Consecuencia |
| :--- | :--- | :--- |
| **ADR-01** | **Zero-Build Architecture (No bundler)** | Cero dependencias npm en tiempo de ejecución. Los scripts se ejecutan directamente sobre cualquier servidor estático (GitHub Pages, Vercel, LiveServer). |
| **ADR-02** | **CSS Grid para Acordeones con LaTeX** | MathJax v3 no puede calcular cajas delimitadoras (*bounding boxes*) en nodos con `display: none`. Se prohibió su uso en desplegables; se usa `grid-template-rows: 0fr -> 1fr` con `overflow: hidden`. |
| **ADR-03** | **Pre-Parse Sanitizer & Normalizador LaTeX** | En cadenas JSON, caracteres de escape como `\f`, `\t`, `\b` degradaban fórmulas (`\frac`, `\theta`, `\beta`). `fixJsonLatex()`, `cleanProblematicJsonCharacters()` y `sanitizeHTML()` normalizan el texto antes de `JSON.parse` y de la inyección DOM. |
| **ADR-04** | **Persistencia Híbrida (Local-First + Cloud)** | `localStorage` e `IndexedDB` como capas primarias de almacenamiento offline. Supabase actúa como réplica protegida con hash SHA-256 y magic link en URL hash (`#cloud_cfg=`). |
| **ADR-05** | **Z-Index Layering Estricto y Modales Frontales** | Capas estrictas para impedir solapamientos: fondo base (`z-index: 200`), preview (`z-index: 260`) y alertas/confirmaciones críticas (`z-index: 400 !important`). |
| **ADR-06** | **Interacción Pointerdown/Mousedown No Destructiva** | La selección de texto y arrastre de ratón que termina fuera de un contenedor no cierra el modal; el cierre requiere que inicio y fin ocurran en el backdrop. |
| **ADR-07** | **PWA Offline-First con Service Worker (`sw.js`)** | Permite instalar UniverSOS como aplicación de escritorio y móvil autónoma. Cache-First para recursos locales, Stale-While-Revalidate para CDNs externas (Google Fonts, MathJax) y bypass estricto para APIs en vivo (Supabase, Gemini). |
| **ADR-08** | **Zero-Dependency Automated Testing Harness** | Suite de pruebas unitarias (`tests/run-tests.mjs`) ejecutable con `npm test` o `node tests/run-tests.mjs`, garantizando regresión cero en el parser JSON resiliente, ecuaciones LaTeX, normalización y derivación de contraseñas sin librerías npm externas. |

---

## 3. Estado Actual y Registro de Funcionalidades

| Módulo / Funcionalidad | Estado | Detalles Técnicos |
| :--- | :--- | :--- |
| **PWA & Offline Engine** | `Completo` | Manifiesto PWA (`manifest.json`), icono SVG de alta definición (`icons/icon.svg`) y Service Worker (`sw.js`) con precache y offline fallback. |
| **Test Suite Automatizado** | `Completo` | Suite de 28 pruebas unitarias (`tests/run-tests.mjs`) con `npm test`, blindando parsing resiliente, balanceo de llaves, desinfección HTML y criptografía. |
| **Accesibilidad ARIA & Teclado** | `Completo` | Roles `dialog` y `alertdialog`, atributos `aria-modal`, `aria-labelledby`, `aria-describedby` y control de atajos (`Ctrl+Enter` para textareas). |
| **Gestión de Temario (CRUD)** | `Completo` | Alta, baja y edición en cascada de Asignaturas, Temas, Teoría y Ejercicios sin dejar huérfanos (`edit.js`). |
| **Visor de Teoría y Ejercicios** | `Completo` | Tarjeta de teoría distinguida, pasos algorítmicos numerados, trucos y trampas con callouts en gris neutral e iconos SVG monocolor (`render.js`). |
| **Renderizado Matemático (MathJax v3)** | `Completo` | Typesetting en cola serializada con debouncer de 40ms y renderizado focalizado en acordeones sin tirones (`math-render.js`). |
| **Buscador Global (Ctrl+K / Cmd+K)** | `Completo` | Búsqueda en tiempo real con scroll suave y manipulación DOM segura por nodos de texto sin desincronizar MathJax (`search.js`). |
| **Importador JSON Universal con Preview** | `Completo` | Admite comillas tipográficas, comas colgantes, temas completos, teoría o ejercicios sueltos. Modal de validación previa con botón "Corregir" y botón "Limpiar texto". |
| **Simulador de Examen Universitario** | `Completo` | Modos A Ciegas/Guiado, cronómetro con control de ciclo de vida sin fugas de memoria, desbloqueo progresivo y autoevaluación 0-10 (`render.js`). |
| **Generador de Chuletas A4 (Print-Ready)** | `Completo` | Multi-columna (2 o 3 columnas), selector granular de ejercicios/teoría a incluir y escalado de fórmulas sin desbordes ni barras de scroll (`render.js`). |
| **Sincronización en la Nube (Supabase)** | `Completo` | ID + PIN opcional con derivación SHA-256, panel colapsable de ajustes de servidor y generador de enlace mágico (`cloud-sync.js`). |

---

## 4. Tareas Pendientes y Roadmap Futuro (Backlog Priorizado)

1. **[Feature / Repaso Espaciado]** Modo Flashcards con algoritmo de repetición espaciada (SM-2 simplificado) para memorización activa de los conceptos clave del checklist.
2. **[Visual / Theme Transition]** Micro-animación fluida tipo *clip-path* radial concéntrico al alternar entre modo claro y oscuro con detección automática de preferencia de sistema (`prefers-color-scheme`).
3. **[Export / PDF Stream]** Generador de exportación directa a archivo `.pdf` vectorizado en cliente sin depender exclusivamente del diálogo de impresión del navegador.
4. **[Analytics / Dashboard]** Panel de telemetría de estudio local: métricas de tiempo invertido en cada tema, gráficos SVG ultraligeros de distribución de dominio (Perfecto / Regular / Mal) y racha de días de estudio.
5. **[Cloud / Conflict Resolution]** Sistema de resolución interactiva de conflictos si la versión en la nube tiene un timestamp `updated_at` posterior a las modificaciones locales antes de sincronizar.
