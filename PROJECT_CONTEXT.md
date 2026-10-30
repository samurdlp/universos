# UniverSOS — Project Context & Ledger

> **Context Ledger**: Fuente de verdad técnica y arquitectónica del proyecto. Mantener sincronizado ante cambios estructurales.

---

## 1. Identidad y Stack
- **Identidad:** SPA cliente para la preparación y dominio de asignaturas universitarias STEM (teoría rigurosa, heurística de examen, resolución algorítmica por pasos, chuletas imprimibles, simulador interactivo, flashcards SRS adaptativas con registro autónomo, telemetría y modo offline PWA).
- **Versión:** `v2.7.0` (Autonomous Flashcards SRS & Retention Ledger + Clean Print Engine + Smart Cloud Merge + Balanced High-Density Cheatsheets).
- **Stack:** Vanilla JavaScript (ES6+ modular, sin bundlers ni dependencias de runtime), HTML5 semántico con roles ARIA, CSS3 modular (Custom Properties, Grid & Flexbox, micro-interacciones spring y transiciones radiales de 60 FPS), CDN MathJax v3 (renderizado TeX asíncrono con debounce en cola), Service Worker nativo (estrategia Cache-First y Stale-While-Revalidate para PWA `v2.7`), Supabase REST API (sincronización bidireccional no destructiva con derivación criptográfica SHA-256) y Google Gemini API (generación multimodal client-side).

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
| **ADR-08** | **Zero-Dependency Automated Testing Harness** | Suite de pruebas unitarias (`tests/run-tests.mjs`) ejecutable con `npm test` o `node tests/run-tests.mjs`, garantizando regresión cero en el parser JSON resiliente, ecuaciones LaTeX, normalización, derivación de contraseñas y motor SRS sin dependencias npm externas. |
| **ADR-09** | **Fusión en la Nube Inteligente y No Destructiva (`mergeDatabasesSafely`)** | Al sincronizar con Supabase (tanto al subir como al descargar), se pre-consulta el registro remoto y se ejecuta una fusión bidireccional profunda por nombre normalizado sin acentos. Evita pérdidas de datos o sobrescritura accidental al iniciar sesión en dispositivos nuevos. |
| **ADR-10** | **Balanced Density Engine para Chuletas de Examen** | `column-fill: balance;` y desacople de `break-inside: avoid` en `.cs-block` (manteniendo `break-inside: avoid` solo en filas atómicas como `.cs-step-row`, `.cs-alert-pill`, `.cs-compact-list li`). Elimina los huecos en blanco al final de columna y añade modo de 4 columnas (ultra-compacto) optimizado para impresión A4. |
| **ADR-11** | **Repaso Espaciado Activo y Registro Autónomo (Flashcards SRS)** | Generación dinámica de tarjetas desde la teoría, criterios de identificación, pasos de algoritmo, trampas y trucos del tema o asignatura completa. Menú previo de configuración paramétrica (ámbito, cantidad de 5/10/15/20/todas, y filtro por dificultad/falladas). Tarjetas con diseño de alta gama sin barras de scroll (`overflow: hidden`), separación visual entre Enunciado/Contexto y Pregunta de Examen, soporte íntegro de fórmulas MathJax (sin tags `<code>` restrictivos) y registro persistente autónomo en `localStorage` (`universos_flashcards_history`). |
| **ADR-12** | **Transición de Tema Concéntrica (Radial View Transition)** | Animación circular fluida al alternar entre tema claro y oscuro mediante la API nativa `document.startViewTransition()` con `clip-path` expansivo centrado en el punto de clic del usuario (`toggleTheme(event)`). |
| **ADR-13** | **Aislamiento Estricto de Impresión (@media print)** | Ocultamiento compulsivo de barras de herramientas interactivas (`.cheatsheet-item-selector`, `#cheatsheetItemSelector`, `.mastery-filter-bar`, `.top-nav`, `.sidebar`) en la hoja impresa, garantizando que el documento A4 contenga exclusivamente la materia de estudio sin elementos de control UI. |

---

## 3. Estado Actual y Registro de Funcionalidades

| Módulo / Funcionalidad | Estado | Detalles Técnicos |
| :--- | :--- | :--- |
| **Flashcards SRS & Registro Autónomo** | `Completo` | Menú inicial de decisión (ámbito, cantidad 5/10/15/20/todas y dificultad), mazo adaptativo sin scroll (`overflow: hidden`), clara diferenciación visual Enunciado vs Pregunta, renderizado TeX MathJax completo, persistencia automática en `localStorage` (`universos_flashcards_history`) y vista de métricas. |
| **Aislamiento Limpio de Impresión** | `Completo` | Supresión de selectores de tema/ejercicios (`.cheatsheet-item-selector`) y filtros de dominio en `@media print`. Salida de impresión 100% limpia. |
| **Fusión Cloud No Destructiva** | `Completo` | `mergeDatabasesSafely()` en `cloud-sync.js`. Previene borrados accidentales de temas remotos al subir desde nuevas pestañas o dispositivos. |
| **Chuletas de Alta Densidad Equilibradas** | `Completo` | Soporte de 1 a 4 columnas con `column-fill: balance;`, micro-tipografía optimizada y corte fluido sin espacios artificiales en blanco. |
| **Panel de Métricas y Telemetría** | `Completo` | Modal `#statsModal` con conteo global de asignaturas, temas, ejercicios y barra proporcional de dominio de aprendizaje. |
| **Transición de Tema Radial** | `Completo` | `document.startViewTransition()` con interpolación concéntrica de radio circular `clip-path` a 60 FPS. |
| **PWA & Offline Engine** | `Completo` | Manifiesto PWA (`manifest.json`), icono SVG de alta definición (`icons/icon.svg`) y Service Worker (`sw.js`) con precache y offline fallback (`v2.7`). |
| **Test Suite Automatizado** | `Completo` | 41 pruebas unitarias sin dependencias externas (`tests/run-tests.mjs`) que validan parsing resiliente, fórmulas LaTeX, seguridad hash, fusión de bases de datos y motor SRS. |
| **Accesibilidad ARIA & Teclado** | `Completo` | Roles `dialog` y `alertdialog`, atributos `aria-modal`, `aria-labelledby`, `aria-describedby` y control de atajos (`Espacio` y `1`/`2`/`3` para flashcards, `Ctrl+Enter` para textareas). |
| **Gestión de Temario (CRUD)** | `Completo` | Alta, baja y edición en cascada de Asignaturas, Temas, Teoría y Ejercicios sin dejar huérfanos (`edit.js`). |
| **Visor de Teoría y Ejercicios** | `Completo` | Tarjeta de teoría distinguida, pasos algorítmicos numerados, trucos y trampas con callouts en gris neutral e iconos SVG monocolor (`render.js`). |
| **Renderizado Matemático (MathJax v3)** | `Completo` | Typesetting en cola serializada con debouncer de 40ms y renderizado focalizado en acordeones sin tirones (`math-render.js`). |
| **Buscador Global (Ctrl+K / Cmd+K)** | `Completo` | Búsqueda en tiempo real con scroll suave y manipulación DOM segura por nodos de texto sin desincronizar MathJax (`search.js`). |
| **Importador JSON Universal con Preview** | `Completo` | Admite comillas tipográficas, comas colgantes, temas completos, teoría o ejercicios sueltos. Modal de validación previa con botón "Corregir" y botón "Limpiar texto". |
| **Simulador de Examen Universitario** | `Completo` | Modos A Ciegas/Guiado, cronómetro con control de ciclo de vida sin fugas de memoria, desbloqueo progresivo y autoevaluación 0-10 (`render.js`). |
| **Sincronización en la Nube (Supabase)** | `Completo` | ID + PIN opcional con derivación SHA-256, panel colapsable de ajustes de servidor y generador de enlace mágico (`cloud-sync.js`). |

---

## 4. Tareas Pendientes y Roadmap Futuro (Backlog Priorizado de Alta Gama)

1. **[SRS / Algoritmo SuperMemo SM-2 Intervalos Reales]** Extender el motor de flashcards actual (intra-sesión) calculando intervalos de días en base al factor de facilidad $EF$ ($EF' = EF + (0.1 - (5-q) \times (0.08 + (5-q) \times 0.02))$) con indicador de "tarjetas que tocan hoy".
2. **[Export / PDF Vectorial Directo]** Generador de exportación directa a archivo `.pdf` vectorizado en cliente mediante `html2pdf` o stream de canvas local sin depender del cuadro de diálogo de impresión del navegador.
3. **[Focus Mode / Temporizador Pomodoro con Sonidos Lofi]** Modo concentración para estudio inmersivo con barra de progreso superior, pausas estructuradas de 25/5 min y síntesis de audio suave para inicio/fin.
4. **[Graph / Visual Knowledge Dependency Graph]** Grafo de dependencias interactivo (SVG/Canvas) que muestre qué temas o teoremas son prerrequisitos de otros dentro de la asignatura, iluminando nodos dominados vs dudosos.
5. **[Voice / Text-to-Speech para Flashcards y Teoría]** Síntesis de voz nativa del navegador (`window.speechSynthesis`) para escuchar los enunciados y soluciones de las tarjetas flashcards mientras se repasa con la pantalla bloqueada o en movimiento.
