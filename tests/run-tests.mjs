/**
 * Suite de Pruebas Automatizadas de UniverSOS
 * Ejecución: node tests/run-tests.mjs (o npm test)
 */

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Entorno simulado para pruebas unitarias sin dependencias externas
const sandbox = {
    console,
    Date,
    Math,
    JSON,
    RegExp,
    Array,
    Set,
    String,
    Number,
    Boolean,
    Promise,
    parseInt,
    parseFloat,
    btoa: (str) => Buffer.from(str, 'binary').toString('base64'),
    atob: (b64) => Buffer.from(b64, 'base64').toString('binary'),
    encodeURIComponent,
    decodeURIComponent,
    window: {
        crypto: {
            subtle: {
                digest: async (algo, data) => {
                    const crypto = await import('crypto');
                    return crypto.createHash('sha256').update(Buffer.from(data)).digest();
                }
            }
        }
    },
    document: {
        getElementById: () => null,
        querySelectorAll: () => []
    },
    localStorage: {
        _store: {},
        getItem(key) { return this._store[key] || null; },
        setItem(key, val) { this._store[key] = String(val); },
        removeItem(key) { delete this._store[key]; }
    },
    appDB: { subjects: [] },
    activeSubjectId: null,
    activeTopicId: null,
    customAlert: (msg) => {},
    customConfirm: (msg, cb) => cb(true),
    openModal: () => {},
    closeModal: () => {},
    renderDropdowns: () => {},
    renderTopicExercises: () => {},
    forceMathRender: () => {}
};

vm.createContext(sandbox);

function loadScript(relPath) {
    const code = fs.readFileSync(path.join(rootDir, relPath), 'utf8');
    vm.runInContext(code, sandbox, { filename: relPath });
}

// Cargar módulos core de lógica matemática, sanitización, importación y nube
loadScript('js/sanitizer.js');
loadScript('js/state.js');
loadScript('js/import-export.js');
loadScript('js/cloud-sync.js');

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✓ ${message}`);
        passed++;
    } else {
        console.error(`  ✗ FAIL: ${message}`);
        failed++;
    }
}

async function runTestSuite() {
    console.log('\n========================================');
    console.log('🧪 UniverSOS Test Runner — Regresión y Seguridad');
    console.log('========================================\n');

    // 1. Limpieza de caracteres problemáticos de procesador de texto (comillas tipográficas, non-breaking spaces)
    console.log('[1] Normalización de caracteres JSON conflictivos:');
    const dirtySnippet = '“asignatura”: ‘Cálculo II’, «tema»: “Integrales”,';
    const cleaned = sandbox.cleanProblematicJsonCharacters(dirtySnippet);
    assert(cleaned.includes('"asignatura":'), 'Convierte comillas curvas dobles en comillas estándar');
    assert(cleaned.includes("'Cálculo II'"), 'Convierte comillas curvas simples en apóstrofes rectos');
    assert(cleaned.includes('"tema":'), 'Convierte comillas angulares francesas (« ») en estándar');

    // 2. Blindaje de comandos LaTeX frente a colisión de escapes JSON
    console.log('\n[2] Protección pre-parse de fórmulas LaTeX (fixJsonLatex):');
    const rawLatex = '{"formula": "\\frac{1}{2} + \\theta + \\times + \\beta + \\rho + \\nabla"}';
    const protectedLatex = sandbox.fixJsonLatex(rawLatex);
    const parsedLatex = JSON.parse(protectedLatex);
    assert(parsedLatex.formula.includes('\\frac'), 'Preserva \\frac sin transformarse en formfeed');
    assert(parsedLatex.formula.includes('\\theta'), 'Preserva \\theta sin transformarse en tab/octal');
    assert(parsedLatex.formula.includes('\\beta'), 'Preserva \\beta sin transformarse en backspace');
    assert(parsedLatex.formula.includes('\\rho'), 'Preserva \\rho sin transformarse en carriage return');
    assert(parsedLatex.formula.includes('\\nabla'), 'Preserva \\nabla sin transformarse en newline');

    // 3. Eliminación de comas colgantes (trailing commas)
    console.log('\n[3] Limpieza de trailing commas:');
    const trailingJson = '{"items": [1, 2, ], "obj": {"x": 10, }, "str": "hola, mundo, "}';
    const fixedTrailing = sandbox.removeTrailingCommasOutsideStrings(trailingJson);
    const parsedTrailing = JSON.parse(fixedTrailing);
    assert(parsedTrailing.items.length === 2, 'Elimina coma colgante en array preservando elementos');
    assert(parsedTrailing.obj.x === 10, 'Elimina coma colgante en objeto');
    assert(parsedTrailing.str === 'hola, mundo, ', 'Preserva intactas las comas dentro de cadenas');

    // 4. Auto-balance de JSON truncado
    console.log('\n[4] Auto-balance de estructuras truncadas:');
    const truncated = '{"tema": "Grafos", "ejercicios": [{"title": "Prim"';
    const balanced = sandbox.autoBalanceTruncatedJson(truncated);
    let balancedParsed = null;
    try {
        balancedParsed = JSON.parse(balanced);
    } catch (e) {}
    assert(balancedParsed !== null && balancedParsed.tema === 'Grafos', 'Cierra llaves y corchetes pendientes automáticamente');

    // 5. Test Integral del Parser Resiliente con código de examen real
    console.log('\n[5] Parser Resiliente con código de examen complejo:');
    const userPrimSnippet = `\`\`\`json
{
  “asignatura”: “Estructura de Datos y Algoritmos”,
  “tema”: “3. Grafos y Algoritmo de Prim”,
  “ejercicios”: [
    {
      “title”: “Árbol de Recubrimiento Mínimo con Prim”,
      “probabilidad”: 85,
      “identificacion”: [
        “Grafo conexo no dirigido y ponderado”,
        “Búsqueda del MST (Minimum Spanning Tree)”,
      ],
      “algoritmo”: [
        {
          “title”: “Inicializar la cola de prioridad”,
          “subtitle”: “Insertar vértices con clave infinito excepto el inicial”,
          “example”: “dist[v] = infinito”,
        },
        {
          “title”: “Extraer el mínimo y relajar adyacentes”,
          “subtitle”: “Actualizar distancias de vecinos no visitados”,
          “example”: “min_heap.pop()”,
        }
      ],
      “ejemploCompleto”: “Dado el grafo de 5 vértices, aplicamos el algoritmo arrancando en $v_0$.<br><br><span class='step-ref'>Extracción</span> Extraemos la arista de menor coste hacia el conjunto no visitado.”,
      “trampas”: [
        {
          “title”: “Aristas con pesos negativos”,
          “content”: “Prim funciona con pesos negativos mientras el grafo sea no dirigido y sin ciclos negativos.”,
          “fix”: “No confundir la restricción de Dijkstra con la de Prim.”,
        },
      ],
    },
  ],
}
\`\`\``;
    const primResult = sandbox.parseResilientJson(userPrimSnippet);
    assert(primResult.data.asignatura === 'Estructura de Datos y Algoritmos', 'Extrae asignatura ignorando markdown y comillas curvas');
    assert(primResult.data.ejercicios.length === 1, 'Procesa ejercicio con pasos algorítmicos');
    assert(primResult.data.ejercicios[0].algoritmo.length === 2, 'Lee correctamente array con trailing commas');

    // 6. División segura de Checklist sin romper LaTeX
    console.log('\n[6] División segura de ítems de Checklist (splitChecklistStringSafely):');
    const mathChecklist1 = 'Teorema de Green: Sea $D \\subset \\mathbb{R}^2$ acotado y $\\oint_{\\partial D} L dx + M dy$';
    const split1 = sandbox.splitChecklistStringSafely(mathChecklist1);
    assert(split1.title === 'Teorema de Green', 'Separa título antes de los dos puntos');
    assert(split1.subtitle.includes('\\oint'), 'Preserva la fórmula integral en la explicación');

    const mathChecklist2 = 'Aplicación $f: A \\to B$: Correspondencia donde cada elemento tiene imagen única';
    const split2 = sandbox.splitChecklistStringSafely(mathChecklist2);
    assert(split2.title.includes('$f: A \\to B$'), 'No divide por dos puntos ubicados dentro de fórmula $f: A \\to B$');

    // 7. Sanitizador HTML vs Desigualdades Matemáticas ($0 < x < 1$)
    console.log('\n[7] Sanitizador HTML vs Desigualdades Matemáticas ($0 < x < 1$):');
    const mathIneq = 'El intervalo de convergencia es $0 < x < 1$ y $y > 2$.';
    const sanitizedIneq = sandbox.sanitizeHTML(mathIneq);
    assert(sanitizedIneq.includes('&lt; x &lt; 1'), 'Convierte el signo menor que en &lt; sin romper la fórmula');

    const citeSnippet = 'Demostración según Cauchy [cite: 1, 4] con paso intermedio.';
    const parsedCite = sandbox.processTextWithCitations(citeSnippet);
    assert(!parsedCite.text.includes('[cite:'), 'Purga marcas fantasma [cite: ...]');
    assert(parsedCite.refs.length === 2 && parsedCite.refs[0] === '1' && parsedCite.refs[1] === '4', 'Extrae citas numéricas ordenadas');

    // 8. Derivación de Clave Criptográfica SHA-256 para Sincronización en la Nube
    console.log('\n[8] Derivación segura de clave en la Nube (computeEffectiveSyncKey):');
    const syncKeyNoPass = await sandbox.computeEffectiveSyncKey('alumno_1', '');
    assert(syncKeyNoPass === 'alumno_1', 'Devuelve ID limpio cuando no hay contraseña');

    const syncKeyWithPass1 = await sandbox.computeEffectiveSyncKey('alumno_1', 'pass123');
    const syncKeyWithPass2 = await sandbox.computeEffectiveSyncKey('alumno_1', 'pass123');
    const syncKeyWrongPass = await sandbox.computeEffectiveSyncKey('alumno_1', 'pass456');
    assert(syncKeyWithPass1.startsWith('alumno_1_sec_'), 'Genera clave derivada con prefijo de seguridad');
    assert(syncKeyWithPass1 === syncKeyWithPass2, 'La derivación es determinista para el mismo ID + contraseña');
    assert(syncKeyWithPass1 !== syncKeyWrongPass, 'Contraseñas distintas generan claves derivadas completamente diferentes');

    // 9. Clasificador Automático de Estructuras JSON Importadas (analyzeImportedData)
    console.log('\n[9] Clasificador de estructuras de importación (analyzeImportedData):');
    const fullTopicData = {
        asignatura: 'Física I',
        tema: 'Cinemática',
        teoria: { title: 'Leyes de Newton' },
        ejercicios: [{ title: 'Plano Inclinado' }]
    };
    const analysisTopic = sandbox.analyzeImportedData(fullTopicData, []);
    assert(analysisTopic.detectedType === 'full_topic', 'Detecta correctamente Tema Completo');

    const looseExData = [
        { title: 'Tiro Parabólico', algoritmo: [] },
        { title: 'Choque Elástico', algoritmo: [] }
    ];
    const analysisEx = sandbox.analyzeImportedData(looseExData, []);
    assert(analysisEx.detectedType === 'exercises_only', 'Detecta correctamente Lista de Ejercicios Sueltos');

    const dbBackupData = {
        subjects: [
            { id: 's1', name: 'Álgebra', topics: [] }
        ]
    };
    const analysisDb = sandbox.analyzeImportedData(dbBackupData, []);
    assert(analysisDb.detectedType === 'full_db', 'Detecta correctamente Backup de Base de Datos');

    // Resumen Final
    console.log('\n========================================');
    console.log(`Resultados: ${passed} pasados, ${failed} fallidos`);
    if (failed === 0) {
        console.log('🎉 TODOS LOS TESTS HAN PASADO SATISFACTORIAMENTE');
        console.log('========================================\n');
        process.exit(0);
    } else {
        console.error('💥 SE DETECTARON REGRESIONES EN EL TEST SUITE');
        console.log('========================================\n');
        process.exit(1);
    }
}

runTestSuite().catch(err => {
    console.error('Error fatal ejecutando test suite:', err);
    process.exit(1);
});
