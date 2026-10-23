/**
 * Motor Universal de Importación y Diagnóstico JSON (Tolerante a Fallos)
 * 
 * Capacidades:
 * 1. Protege SIEMPRE comandos LaTeX que empiezan por escapes JSON (\frac, \theta, \times, \to, \text, \beta, \begin, \rho, \right, \nabla, \neq, \nu, etc.).
 * 2. Repara errores comunes de sintaxis JSON: bloques markdown ```json, comas finales (trailing commas), saltos de línea sin escapar y cierres truncados.
 * 3. Detecta automáticamente cualquier estructura en el mismo cuadro:
 *    - Tema Completo (Teoría + Ejercicios)
 *    - Solo Teoría (objeto teoría o secciones/introducción sueltas)
 *    - Ejercicios Sueltos (un ejercicio único, un array de ejercicios [...] o un objeto con ejercicios)
 *    - Backup Completo de Base de Datos (subjects)
 * 4. Diagnostica campos faltantes sin bloquear la importación y abre una ventana frontal de confirmación con opción de "Corregir".
 */

let pendingImportState = null;

function fixJsonLatex(jsonStr) {
    if (!jsonStr) return '';
    // 1. Limpiar espacios unicode invisibles
    let text = jsonStr.replace(/[\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/g, ' ');

    let result = '';
    let inString = false;
    let i = 0;

    while (i < text.length) {
        let char = text[i];

        if (char === '"') {
            let backslashCount = 0;
            let k = i - 1;
            while (k >= 0 && text[k] === '\\') {
                backslashCount++;
                k--;
            }
            if (backslashCount % 2 === 0) {
                inString = !inString;
            }
            result += char;
            i++;
            continue;
        }

        if (inString && char === '\\') {
            let nextChar = text[i + 1] || '';
            let rest = text.substring(i + 1);

            // Si ya viene escapada como doble barra (\\)
            if (nextChar === '\\') {
                result += '\\\\';
                i += 2;
                continue;
            }

            // Escapes JSON de comillas o barra
            if (nextChar === '"' || nextChar === '/') {
                result += '\\' + nextChar;
                i += 2;
                continue;
            }

            // Código unicode válido \uXXXX (que no sea \upsilon, \underline, \underbrace, \uparrow)
            if (nextChar === 'u' && /^[0-9a-fA-F]{4}/.test(rest.substring(1, 5))) {
                result += '\\' + rest.substring(0, 5);
                i += 6;
                continue;
            }

            // Salto de línea JSON explícito \n, EXCEPTO cuando sea un comando LaTeX (\nabla, \neq, \ne, \nu, \ni, \not, \notin, \neg, \natural, \newcommand, \newline, \noindent, \normalsize)
            if (nextChar === 'n' && !/^(abla|eq\b|e\b|u\b|i\b|ot\b|otin\b|eg\b|atural|ew|oindent|orm)/.test(rest.substring(1))) {
                result += '\\n';
                i += 2;
                continue;
            }

            // NOTA CRÍTICA: En LaTeX, \frac, \forall, \theta, \times, \to, \text, \tfrac, \tan, \tau, \beta, \begin, \binom, \bar, \bf, \rho, \right, \rightarrow, \mathrm
            // empiezan por \f, \t, \b, \r (que JSON.parse destruiría como formfeed, tab, backspace o CR si no se escapan a \\).
            // Por tanto, cualquier comando LaTeX con letra detrás se auto-escapa a doble barra \\
            result += '\\\\';
            i++;
            continue;
        }

        // Saltos de línea físicos o tabuladores literales dentro de una cadena JSON
        if (inString && (char === '\n' || char === '\r')) {
            if (char === '\r' && text[i + 1] === '\n') i++;
            result += '\\n';
            i++;
            continue;
        }
        if (inString && char === '\t') {
            result += ' ';
            i++;
            continue;
        }

        result += char;
        i++;
    }

    return result;
}

function removeTrailingCommasOutsideStrings(jsonStr) {
    let out = '';
    let inString = false;
    for (let i = 0; i < jsonStr.length; i++) {
        const ch = jsonStr[i];
        if (ch === '"') {
            let bs = 0;
            let k = i - 1;
            while (k >= 0 && jsonStr[k] === '\\') { bs++; k--; }
            if (bs % 2 === 0) inString = !inString;
        }
        if (!inString && ch === ',') {
            let j = i + 1;
            while (j < jsonStr.length && /\s/.test(jsonStr[j])) j++;
            if (jsonStr[j] === '}' || jsonStr[j] === ']') {
                continue; // Omitir coma colgante antes de cierre
            }
        }
        out += ch;
    }
    return out;
}

function autoBalanceTruncatedJson(jsonStr) {
    let text = jsonStr.trim();
    let inString = false;
    const stack = [];

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === '"') {
            let bs = 0;
            let k = i - 1;
            while (k >= 0 && text[k] === '\\') { bs++; k--; }
            if (bs % 2 === 0) inString = !inString;
            continue;
        }
        if (!inString) {
            if (ch === '{') stack.push('}');
            else if (ch === '[') stack.push(']');
            else if (ch === '}' || ch === ']') {
                if (stack.length > 0 && stack[stack.length - 1] === ch) {
                    stack.pop();
                }
            }
        }
    }

    if (inString) text += '"';
    text = text.replace(/,\s*$/, '');
    while (stack.length > 0) {
        text += stack.pop();
    }
    return text;
}

function parseResilientJson(rawInput) {
    const syntaxWarnings = [];
    if (!rawInput || !rawInput.trim()) {
        throw new Error('El cuadro de texto está vacío. Pega un código JSON o arrastra un archivo.');
    }

    let text = rawInput.trim();

    // Eliminar bloques markdown ```json ... ```
    text = text.replace(/^```(?:json|javascript|js)?\s*/i, '').replace(/\s*```$/i, '').trim();

    // Localizar el primer '{' o '[' y el último '}' o ']'
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    let startIdx = -1;
    let endIdx = -1;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        startIdx = firstBrace;
        endIdx = text.lastIndexOf('}');
    } else if (firstBracket !== -1) {
        startIdx = firstBracket;
        endIdx = text.lastIndexOf(']');
    }

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        text = text.substring(startIdx, endIdx + 1);
    } else if (startIdx !== -1) {
        text = text.substring(startIdx);
    }

    // 1. Siempre proteger LaTeX y limpiar comas finales antes de JSON.parse
    const latexProtected = removeTrailingCommasOutsideStrings(fixJsonLatex(text));

    try {
        return { data: JSON.parse(latexProtected), syntaxWarnings };
    } catch (err1) {
        // 2. Intentar auto-balancear por si el JSON estaba truncado o le faltaba una llave final
        try {
            const balanced = removeTrailingCommasOutsideStrings(autoBalanceTruncatedJson(latexProtected));
            const parsed = JSON.parse(balanced);
            syntaxWarnings.push('Se detectaron y repararon automáticamente errores menores de cierre o formato en el JSON.');
            return { data: parsed, syntaxWarnings };
        } catch (err2) {
            // 3. Último intento directo
            try {
                return { data: JSON.parse(text), syntaxWarnings };
            } catch (err3) {
                throw new Error(`No se pudo interpretar el formato JSON.\nDetalle técnico: ${err1.message}`);
            }
        }
    }
}

function normalizeSingleExercise(rawEx, idx, warnings) {
    if (!rawEx || typeof rawEx !== 'object') {
        warnings.push(`El elemento #${idx + 1} no era un objeto válido y se ha omitido.`);
        return null;
    }

    const title = (rawEx.title || rawEx.titulo || rawEx.nombre || rawEx.name || rawEx.enunciadoCorto || '').toString().trim();
    if (!title) {
        warnings.push(`Ejercicio #${idx + 1}: No tenía campo 'title' (se le asignó "Ejercicio Tipo #${idx + 1}").`);
    }

    const finalTitle = title || `Ejercicio Tipo #${idx + 1}`;
    const prob = typeof rawEx.probabilidad === 'number' ? rawEx.probabilidad : (parseInt(rawEx.probabilidad || rawEx.peso) || 50);

    // Identificación
    let identificacion = rawEx.identificacion || rawEx.pistas || rawEx.claves || [];
    if (typeof identificacion === 'string') identificacion = [identificacion];
    if (!Array.isArray(identificacion) || identificacion.length === 0) {
        warnings.push(`"${finalTitle}": No incluye pautas en 'identificacion'.`);
        identificacion = [];
    }

    // Algoritmo / Pasos
    let rawSteps = rawEx.algoritmo || rawEx.pasos || rawEx.steps || [];
    if (!Array.isArray(rawSteps) || rawSteps.length === 0) {
        warnings.push(`"${finalTitle}": No incluye pasos detallados en 'algoritmo'.`);
        rawSteps = [];
    }
    const algoritmo = rawSteps.map((st, sIdx) => {
        if (typeof st === 'string') {
            return { title: `Paso ${sIdx + 1}`, subtitle: st, example: '' };
        }
        return {
            title: st.title || st.titulo || `Paso ${sIdx + 1}`,
            subtitle: st.subtitle || st.subtitulo || st.descripcion || st.content || '',
            example: st.example || st.ejemplo || st.calculo || st.detalle || ''
        };
    });

    // Ejemplo completo
    const ejemploCompleto = rawEx.ejemploCompleto || rawEx.ejemplo || rawEx.solucion || rawEx.resolucion || '';
    if (!ejemploCompleto) {
        warnings.push(`"${finalTitle}": No incluye 'ejemploCompleto' resuelto.`);
    }

    const normalizeAccList = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr.map((item, i) => {
            if (typeof item === 'string') return { title: `Punto ${i + 1}`, content: item, fix: '', example: '' };
            return {
                title: item.title || item.titulo || `Caso ${i + 1}`,
                content: item.content || item.contenido || item.descripcion || '',
                fix: item.fix || item.solucion || item.correccion || '',
                example: item.example || item.ejemplo || ''
            };
        });
    };

    const normalizePropuestos = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr.map((item, i) => {
            if (typeof item === 'string') return { ref: `Problema ${i + 1}`, nota: '', enunciado: item };
            return {
                ref: item.ref || item.referencia || item.title || item.titulo || `Problema ${i + 1}`,
                nota: item.nota || item.puntos || item.peso || '',
                enunciado: item.enunciado || item.content || item.texto || ''
            };
        });
    };

    return {
        title: finalTitle,
        probabilidad: prob,
        mastery: rawEx.mastery || 'none',
        identificacion,
        algoritmo,
        ejemploCompleto,
        variaciones: normalizeAccList(rawEx.variaciones || rawEx.variantes),
        trucos: normalizeAccList(rawEx.trucos || rawEx.atajos),
        errores: normalizeAccList(rawEx.errores || rawEx.erroresComunes),
        trampas: normalizeAccList(rawEx.trampas),
        ejerciciosPropuestos: normalizePropuestos(rawEx.ejerciciosPropuestos || rawEx.propuestos)
    };
}

function normalizeTheoryObject(rawTeo, warnings) {
    if (!rawTeo || typeof rawTeo !== 'object') return null;

    const title = rawTeo.title || rawTeo.titulo || rawTeo.nombre || 'Fundamentos Teóricos del Tema';
    const introduccion = rawTeo.introduccion || rawTeo.resumen || rawTeo.descripcion || '';
    const rawSecs = rawTeo.secciones || rawTeo.apartados || rawTeo.sections || [];
    const rawCheck = rawTeo.checklistClave || rawTeo.checklist || rawTeo.conceptosClave || rawTeo.conceptos || [];

    if (!introduccion && (!Array.isArray(rawSecs) || rawSecs.length === 0)) {
        warnings.push('Teoría: No se encontró introducción ni secciones detalladas (se importará con los datos disponibles).');
    }

    const secciones = Array.isArray(rawSecs) ? rawSecs.map((sec, idx) => ({
        title: sec.title || sec.titulo || `Sección ${idx + 1}`,
        content: sec.content || sec.contenido || sec.texto || '',
        detalles: Array.isArray(sec.detalles || sec.subapartados) ? (sec.detalles || sec.subapartados).map((d, dIdx) => {
            if (typeof d === 'string') return { title: `Detalle ${dIdx + 1}`, content: d };
            return {
                title: d.title || d.titulo || `Detalle ${dIdx + 1}`,
                content: d.content || d.contenido || d.texto || ''
            };
        }) : []
    })) : [];

    const checklistClave = Array.isArray(rawCheck) ? rawCheck : [];
    if (checklistClave.length === 0) {
        warnings.push('Teoría: No incluye lista de "checklistClave" al final del tema.');
    }

    return {
        title,
        introduccion,
        secciones,
        checklistClave
    };
}

function analyzeImportedData(rawData, syntaxWarnings = []) {
    const warnings = [...syntaxWarnings];
    let detectedType = 'full_topic'; // 'full_db' | 'full_topic' | 'theory_only' | 'exercises_only'
    let asignaturaName = '';
    let temaName = '';
    let normalizedTeoria = null;
    let normalizedEjercicios = [];

    // 1. ¿Es un Backup completo de la Base de Datos?
    if (rawData && !Array.isArray(rawData) && Array.isArray(rawData.subjects)) {
        return {
            detectedType: 'full_db',
            rawData,
            asignaturaName: `${rawData.subjects.length} asignaturas`,
            temaName: 'Base de Datos Completa',
            teoria: null,
            ejercicios: [],
            warnings
        };
    }

    // 2. ¿Es un Array directo [...]? -> Lista de ejercicios sueltos
    if (Array.isArray(rawData)) {
        detectedType = 'exercises_only';
        rawData.forEach((ex, idx) => {
            const norm = normalizeSingleExercise(ex, idx, warnings);
            if (norm) normalizedEjercicios.push(norm);
        });
    } else if (rawData && typeof rawData === 'object') {
        asignaturaName = (rawData.asignatura || rawData.subject || rawData.materia || '').toString().trim();
        temaName = (rawData.tema || rawData.topic || rawData.unidad || '').toString().trim();

        const hasTeoriaObj = rawData.teoria && typeof rawData.teoria === 'object';
        const hasEjerciciosArr = Array.isArray(rawData.ejercicios || rawData.exercises || rawData.problemas);
        const looksLikeDirectTheory = !hasTeoriaObj && !hasEjerciciosArr && (rawData.secciones || rawData.apartados || rawData.checklistClave || rawData.introduccion);
        const looksLikeDirectSingleExercise = !hasTeoriaObj && !hasEjerciciosArr && !looksLikeDirectTheory && (rawData.algoritmo || rawData.pasos || rawData.identificacion || rawData.ejemploCompleto || rawData.ejemplo || rawData.title || rawData.titulo);

        if (hasTeoriaObj && hasEjerciciosArr) {
            detectedType = 'full_topic';
            normalizedTeoria = normalizeTheoryObject(rawData.teoria, warnings);
            const rawExs = rawData.ejercicios || rawData.exercises || rawData.problemas;
            rawExs.forEach((ex, idx) => {
                const norm = normalizeSingleExercise(ex, idx, warnings);
                if (norm) normalizedEjercicios.push(norm);
            });
        } else if (hasTeoriaObj && !hasEjerciciosArr) {
            detectedType = 'theory_only';
            normalizedTeoria = normalizeTheoryObject(rawData.teoria, warnings);
        } else if (looksLikeDirectTheory) {
            detectedType = 'theory_only';
            normalizedTeoria = normalizeTheoryObject(rawData, warnings);
        } else if (hasEjerciciosArr && !hasTeoriaObj) {
            detectedType = 'exercises_only';
            const rawExs = rawData.ejercicios || rawData.exercises || rawData.problemas;
            rawExs.forEach((ex, idx) => {
                const norm = normalizeSingleExercise(ex, idx, warnings);
                if (norm) normalizedEjercicios.push(norm);
            });
        } else if (looksLikeDirectSingleExercise) {
            detectedType = 'exercises_only';
            const norm = normalizeSingleExercise(rawData, 0, warnings);
            if (norm) normalizedEjercicios.push(norm);
        } else {
            // Estructura genérica o parcial: intentar rescatar lo que haya
            warnings.push('El JSON tiene una estructura no estándar; se han rescatado los campos disponibles.');
            if (rawData.teoria) normalizedTeoria = normalizeTheoryObject(rawData.teoria, warnings);
            const norm = normalizeSingleExercise(rawData, 0, warnings);
            if (norm && !rawData.teoria) {
                detectedType = 'exercises_only';
                normalizedEjercicios.push(norm);
            }
        }
    }

    // Resolver asignatura y tema por defecto si no venían en el JSON
    const activeSubj = appDB.subjects.find(s => s.id === activeSubjectId);
    const activeTop = activeSubj ? activeSubj.topics.find(t => t.id === activeTopicId) : null;

    if (!asignaturaName) {
        if (activeSubj) {
            asignaturaName = activeSubj.name;
            warnings.push(`No se especificó 'asignatura' en el JSON; se ha seleccionado la asignatura actual ("${asignaturaName}"). Puedes cambiarla pulsando "Corregir".`);
        } else if (appDB.subjects.length > 0) {
            asignaturaName = appDB.subjects[0].name;
            warnings.push(`No se especificó 'asignatura' en el JSON; se usará "${asignaturaName}".`);
        } else {
            asignaturaName = 'Asignatura General';
            warnings.push('No se especificó "asignatura" en el JSON; se creará "Asignatura General".');
        }
    }

    if (!temaName) {
        if (activeTop) {
            temaName = activeTop.name;
            warnings.push(`No se especificó 'tema' en el JSON; se ha seleccionado el tema actual ("${temaName}"). Puedes cambiarlo pulsando "Corregir".`);
        } else if (normalizedTeoria && normalizedTeoria.title && normalizedTeoria.title !== 'Fundamentos Teóricos del Tema') {
            temaName = normalizedTeoria.title;
            warnings.push(`No se especificó 'tema'; se ha deducido "${temaName}" a partir del título.`);
        } else {
            temaName = 'Tema 1: Contenidos Importados';
            warnings.push('No se especificó "tema" en el JSON; se asignó "Tema 1: Contenidos Importados".');
        }
    }

    return {
        detectedType,
        rawData,
        asignaturaName,
        temaName,
        teoria: normalizedTeoria,
        ejercicios: normalizedEjercicios,
        warnings
    };
}

function importJsonData() {
    const textarea = document.getElementById('json-textarea');
    if (!textarea || !textarea.value.trim()) {
        customAlert('Pega el contenido JSON o arrastra un archivo antes de pulsar Procesar.', 'JSON Vacío');
        return;
    }

    try {
        const { data, syntaxWarnings } = parseResilientJson(textarea.value);
        const analysis = analyzeImportedData(data, syntaxWarnings);
        openImportPreviewModal(analysis);
    } catch (err) {
        customAlert(err.message, 'Error al Analizar el JSON');
    }
}

function getImportTypeHumanLabel(type, teo, exs) {
    if (type === 'full_db') return 'Backup Completo de Base de Datos';
    if (type === 'full_topic') return `Tema Completo (Teoría + ${exs ? exs.length : 0} ejercicio${exs && exs.length === 1 ? '' : 's'})`;
    if (type === 'theory_only') return 'Teoría del Tema';
    if (type === 'exercises_only') return `${exs ? exs.length : 0} Ejercicio${exs && exs.length === 1 ? '' : 's'} Tipo`;
    return 'Contenido Estructurado';
}

function openImportPreviewModal(analysis) {
    pendingImportState = {
        ...analysis,
        overrideType: analysis.detectedType,
        targetSubjectName: analysis.asignaturaName,
        targetTopicName: analysis.temaName,
        mergeMode: analysis.detectedType === 'exercises_only' ? 'append' : 'replace'
    };

    const panel = document.getElementById('importCorrectionPanel');
    if (panel) panel.classList.remove('open');

    // Inicializar controles del panel de corrección
    const typeSelect = document.getElementById('importOverrideType');
    if (typeSelect) typeSelect.value = pendingImportState.overrideType;

    const mergeSelect = document.getElementById('importOverrideMergeMode');
    if (mergeSelect) mergeSelect.value = pendingImportState.mergeMode;

    populateImportSubjectSelect(pendingImportState.targetSubjectName, pendingImportState.targetTopicName);
    updateImportPreviewSummaryUI();

    openModal('importPreviewModal');
}

function populateImportSubjectSelect(preferredSubjName, preferredTopicName) {
    const subjSelect = document.getElementById('importOverrideSubjSelect');
    const subjCustom = document.getElementById('importOverrideSubjCustom');
    if (!subjSelect || !subjCustom) return;

    subjSelect.innerHTML = '';
    let matchedSubj = null;

    appDB.subjects.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.name;
        opt.innerText = s.name;
        if (preferredSubjName && (s.name.toLowerCase() === preferredSubjName.toLowerCase() || (s.aliases && s.aliases.includes(preferredSubjName.toLowerCase())))) {
            matchedSubj = s;
        }
        subjSelect.appendChild(opt);
    });

    const newOpt = document.createElement('option');
    newOpt.value = '__NEW__';
    newOpt.innerText = '+ Crear nueva asignatura...';
    subjSelect.appendChild(newOpt);

    if (matchedSubj) {
        subjSelect.value = matchedSubj.name;
        subjCustom.style.display = 'none';
        subjCustom.value = '';
    } else {
        subjSelect.value = '__NEW__';
        subjCustom.style.display = 'block';
        subjCustom.value = preferredSubjName || '';
    }

    populateImportTopicSelect(matchedSubj, preferredTopicName);
}

function populateImportTopicSelect(subjectObj, preferredTopicName) {
    const topSelect = document.getElementById('importOverrideTopicSelect');
    const topCustom = document.getElementById('importOverrideTopicCustom');
    if (!topSelect || !topCustom) return;

    topSelect.innerHTML = '';
    let matchedTop = null;

    if (subjectObj && Array.isArray(subjectObj.topics)) {
        subjectObj.topics.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.name;
            opt.innerText = t.name;
            if (preferredTopicName && (t.name.toLowerCase() === preferredTopicName.toLowerCase() || (t.aliases && t.aliases.includes(preferredTopicName.toLowerCase())))) {
                matchedTop = t;
            }
            topSelect.appendChild(opt);
        });
    }

    const newOpt = document.createElement('option');
    newOpt.value = '__NEW__';
    newOpt.innerText = '+ Crear nuevo tema...';
    topSelect.appendChild(newOpt);

    if (matchedTop) {
        topSelect.value = matchedTop.name;
        topCustom.style.display = 'none';
        topCustom.value = '';
    } else {
        topSelect.value = '__NEW__';
        topCustom.style.display = 'block';
        topCustom.value = preferredTopicName || '';
    }
}

function onImportSubjSelectChange() {
    const subjSelect = document.getElementById('importOverrideSubjSelect');
    const subjCustom = document.getElementById('importOverrideSubjCustom');
    if (!subjSelect || !subjCustom) return;

    if (subjSelect.value === '__NEW__') {
        subjCustom.style.display = 'block';
        subjCustom.focus();
        populateImportTopicSelect(null, pendingImportState ? pendingImportState.temaName : '');
    } else {
        subjCustom.style.display = 'none';
        const subjObj = appDB.subjects.find(s => s.name === subjSelect.value);
        populateImportTopicSelect(subjObj, pendingImportState ? pendingImportState.temaName : '');
    }
    updateImportPreviewSummaryUI();
}

function onImportTopicSelectChange() {
    const topSelect = document.getElementById('importOverrideTopicSelect');
    const topCustom = document.getElementById('importOverrideTopicCustom');
    if (!topSelect || !topCustom) return;

    if (topSelect.value === '__NEW__') {
        topCustom.style.display = 'block';
        topCustom.focus();
    } else {
        topCustom.style.display = 'none';
    }
    updateImportPreviewSummaryUI();
}

function onImportOverrideChange() {
    const typeSelect = document.getElementById('importOverrideType');
    const destFields = document.getElementById('importDestinationFields');
    const mergeGroup = document.getElementById('importMergeModeGroup');
    if (!typeSelect || !pendingImportState) return;

    pendingImportState.overrideType = typeSelect.value;
    if (destFields) {
        destFields.style.display = (typeSelect.value === 'full_db') ? 'none' : 'flex';
    }
    if (mergeGroup) {
        mergeGroup.style.display = (typeSelect.value === 'theory_only' || typeSelect.value === 'full_db') ? 'none' : 'flex';
    }
    updateImportPreviewSummaryUI();
}

function toggleImportCorrectionPanel() {
    const panel = document.getElementById('importCorrectionPanel');
    if (!panel) return;
    panel.classList.toggle('open');
    onImportOverrideChange();
}

function getEffectiveImportParams() {
    if (!pendingImportState) return null;
    const typeSelect = document.getElementById('importOverrideType');
    const subjSelect = document.getElementById('importOverrideSubjSelect');
    const subjCustom = document.getElementById('importOverrideSubjCustom');
    const topSelect = document.getElementById('importOverrideTopicSelect');
    const topCustom = document.getElementById('importOverrideTopicCustom');
    const mergeSelect = document.getElementById('importOverrideMergeMode');

    const finalType = typeSelect ? typeSelect.value : pendingImportState.overrideType;
    const finalSubj = (subjSelect && subjSelect.value !== '__NEW__')
        ? subjSelect.value
        : ((subjCustom && subjCustom.value.trim()) || pendingImportState.asignaturaName || 'Asignatura General');
    const finalTopic = (topSelect && topSelect.value !== '__NEW__')
        ? topSelect.value
        : ((topCustom && topCustom.value.trim()) || pendingImportState.temaName || 'Tema General');
    const finalMerge = mergeSelect ? mergeSelect.value : pendingImportState.mergeMode;

    const existingSubj = appDB.subjects.find(s => s.name.toLowerCase() === finalSubj.toLowerCase() || (s.aliases && s.aliases.includes(finalSubj.toLowerCase())));
    const existingTop = existingSubj ? existingSubj.topics.find(t => t.name.toLowerCase() === finalTopic.toLowerCase() || (t.aliases && t.aliases.includes(finalTopic.toLowerCase()))) : null;

    return {
        finalType,
        finalSubj,
        finalTopic,
        finalMerge,
        isNewSubj: !existingSubj,
        isNewTop: !existingTop
    };
}

function updateImportPreviewSummaryUI() {
    if (!pendingImportState) return;
    const params = getEffectiveImportParams();
    const summaryEl = document.getElementById('importPreviewSummary');
    const warningsEl = document.getElementById('importPreviewWarningsArea');

    if (summaryEl && params) {
        const typeLabel = getImportTypeHumanLabel(params.finalType, pendingImportState.teoria, pendingImportState.ejercicios);
        if (params.finalType === 'full_db') {
            summaryEl.innerHTML = `
                <div class="import-summary-row">
                    <span class="import-summary-label">Qué se va a importar</span>
                    <span class="import-type-badge">${sanitizeHTML(typeLabel)}</span>
                </div>
                <div class="import-summary-row">
                    <span class="import-summary-label">Acción</span>
                    <span class="import-summary-val">Restaurar todas las asignaturas y temas del backup</span>
                </div>
            `;
        } else {
            const subjStatus = params.isNewSubj ? '<span style="color:var(--c-truco); font-size:0.74rem;">(Se creará nueva)</span>' : '<span style="color:var(--text-muted); font-size:0.74rem;">(Existente)</span>';
            const topStatus = params.isNewTop ? '<span style="color:var(--c-truco); font-size:0.74rem;">(Se creará nuevo)</span>' : '<span style="color:var(--text-muted); font-size:0.74rem;">(Existente)</span>';
            const mergeText = params.finalType === 'theory_only'
                ? 'Actualizar sección de Teoría del tema'
                : (params.finalMerge === 'append' ? 'Añadir a los ejercicios existentes del tema' : 'Reemplazar los ejercicios del tema');

            summaryEl.innerHTML = `
                <div class="import-summary-row">
                    <span class="import-summary-label">Tipo detectado</span>
                    <span class="import-type-badge">${sanitizeHTML(typeLabel)}</span>
                </div>
                <div class="import-summary-row">
                    <span class="import-summary-label">Asignatura destino</span>
                    <span class="import-summary-val">${sanitizeHTML(params.finalSubj)} ${subjStatus}</span>
                </div>
                <div class="import-summary-row">
                    <span class="import-summary-label">Tema destino</span>
                    <span class="import-summary-val">${sanitizeHTML(params.finalTopic)} ${topStatus}</span>
                </div>
                <div class="import-summary-row">
                    <span class="import-summary-label">Modo de inserción</span>
                    <span class="import-summary-val">${mergeText}</span>
                </div>
            `;
        }
    }

    if (warningsEl) {
        const warns = pendingImportState.warnings || [];
        if (warns.length > 0) {
            warningsEl.innerHTML = `
                <div class="import-warnings-box">
                    <div class="import-warnings-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        <span>Avisos detectados (${warns.length}) — ¿Deseas continuar igualmente?</span>
                    </div>
                    <ul class="import-warnings-list">
                        ${warns.map(w => `<li>${sanitizeHTML(w)}</li>`).join('')}
                    </ul>
                </div>
            `;
        } else {
            warningsEl.innerHTML = `
                <div class="import-ok-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <span>Estructura JSON 100% completa y verificada sin campos faltantes.</span>
                </div>
            `;
        }
    }
}

function executeConfirmedImport() {
    if (!pendingImportState) return;
    const params = getEffectiveImportParams();
    if (!params) return;

    // Caso 1: Backup de Base de Datos Completa
    if (params.finalType === 'full_db') {
        if (pendingImportState.rawData && Array.isArray(pendingImportState.rawData.subjects)) {
            appDB = pendingImportState.rawData;
            saveDB();
            activeSubjectId = appDB.subjects.length > 0 ? appDB.subjects[0].id : null;
            activeTopicId = (activeSubjectId && appDB.subjects[0].topics.length > 0) ? appDB.subjects[0].topics[0].id : null;
            renderDropdowns();
            if (activeTopicId) renderTopicExercises();
            finishImportCleanup();
            return;
        }
    }

    // Buscar o crear Asignatura
    let subject = appDB.subjects.find(s =>
        s.name.toLowerCase() === params.finalSubj.toLowerCase() ||
        (s.aliases && s.aliases.includes(params.finalSubj.toLowerCase()))
    );

    if (!subject) {
        subject = {
            id: 'subj_' + Date.now(),
            name: params.finalSubj,
            aliases: [params.finalSubj.toLowerCase()],
            topics: []
        };
        appDB.subjects.push(subject);
    }

    // Buscar o crear Tema
    let topic = subject.topics.find(t =>
        t.name.toLowerCase() === params.finalTopic.toLowerCase() ||
        (t.aliases && t.aliases.includes(params.finalTopic.toLowerCase()))
    );

    if (!topic) {
        topic = {
            id: 'topic_' + Date.now(),
            name: params.finalTopic,
            aliases: [params.finalTopic.toLowerCase()],
            data: { ejercicios: [] }
        };
        subject.topics.push(topic);
    }

    if (!topic.data) topic.data = { ejercicios: [] };
    if (!Array.isArray(topic.data.ejercicios)) topic.data.ejercicios = [];

    // Aplicar según el tipo confirmado/corregido
    let teoToApply = pendingImportState.teoria;
    let exsToApply = pendingImportState.ejercicios || [];

    // Si el usuario forzó 'theory_only' y no se había extraído como teoría, intentar adaptarlo
    if (params.finalType === 'theory_only' && !teoToApply && pendingImportState.rawData) {
        teoToApply = normalizeTheoryObject(pendingImportState.rawData.teoria || pendingImportState.rawData, []);
    }

    // Si el usuario forzó 'exercises_only' y la lista estaba vacía, intentar extraer del rawData
    if (params.finalType === 'exercises_only' && exsToApply.length === 0 && pendingImportState.rawData) {
        const single = normalizeSingleExercise(pendingImportState.rawData, 0, []);
        if (single) exsToApply = [single];
    }

    if (params.finalType === 'full_topic' || params.finalType === 'theory_only') {
        if (teoToApply) {
            topic.data.teoria = teoToApply;
        }
    }

    if (params.finalType === 'full_topic' || params.finalType === 'exercises_only') {
        if (exsToApply.length > 0) {
            if (params.finalMerge === 'append') {
                exsToApply.forEach(ex => topic.data.ejercicios.push(ex));
            } else {
                topic.data.ejercicios = exsToApply;
            }
        }
    }

    saveDB();
    activeSubjectId = subject.id;
    activeTopicId = topic.id;

    renderDropdowns();
    renderTopicExercises();

    // Si solo se importaron ejercicios sueltos, seleccionar el último añadido
    if (params.finalType === 'exercises_only' && topic.data.ejercicios.length > 0) {
        selectExercise(topic.data.ejercicios.length - 1);
    } else if (params.finalType === 'theory_only' && topic.data.teoria) {
        selectTheory();
    }

    finishImportCleanup();
}

function finishImportCleanup() {
    pendingImportState = null;
    closeModal('importPreviewModal');
    closeModal('importModal');
    const textarea = document.getElementById('json-textarea');
    if (textarea) textarea.value = '';
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
}

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => { 
        const textarea = document.getElementById('json-textarea');
        if (textarea) {
            textarea.value = e.target.result; 
            importJsonData(); 
        }
    };
    reader.readAsText(file);
}

function initImportDropZone() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => { 
            e.preventDefault(); 
            dropZone.classList.add('dragover'); 
        });
        dropZone.addEventListener('dragleave', (e) => { 
            if (!dropZone.contains(e.relatedTarget)) {
                dropZone.classList.remove('dragover'); 
            }
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault(); 
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => { 
            if (e.target.files.length > 0) handleFile(e.target.files[0]); 
        });
    }
}
