/**
 * Servicio de Generación con Inteligencia Artificial (Gemini) — Estilo NotebookLM
 * 
 * Permite importar múltiples fuentes (PDFs, fotos de exámenes, apuntes TXT/MD),
 * seleccionarlas interactivamente, y analizarlas en profundidad para deducir:
 * - Probabilidad real de examen y peso en puntos de cada tipo de problema.
 * - Desglose exhaustivo de TODOS los tipos de ejercicios y variantes (número variable y completo).
 * - Algoritmos paso a paso, ejemplos resueltos en LaTeX, trucos, errores y trampas.
 * - Teoría rigurosa y checklists interactivas de conceptos clave.
 */

let aiSources = [];
let currentAiGenMode = 'both'; // 'both' | 'exercises' | 'theory'

function setAiGenMode(mode) {
    currentAiGenMode = mode;
    document.querySelectorAll('.mode-pill-btn').forEach(btn => btn.classList.remove('active'));
    if (mode === 'both') {
        const b = document.getElementById('modeBtnBoth');
        if (b) b.classList.add('active');
    } else if (mode === 'exercises') {
        const b = document.getElementById('modeBtnExercises');
        if (b) b.classList.add('active');
    } else if (mode === 'theory') {
        const b = document.getElementById('modeBtnTheory');
        if (b) b.classList.add('active');
    }
}

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// --- IndexedDB Cache para Documentos Pre-procesados ---
const AI_CACHE_DB_NAME = 'universos_ai_sources_db';
const AI_CACHE_STORE_NAME = 'processed_sources';

function getAiCacheDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(AI_CACHE_DB_NAME, 1);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(AI_CACHE_STORE_NAME)) {
                db.createObjectStore(AI_CACHE_STORE_NAME, { keyPath: 'id' });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function saveSourceToCache(src) {
    try {
        const db = await getAiCacheDB();
        const tx = db.transaction(AI_CACHE_STORE_NAME, 'readwrite');
        const store = tx.objectStore(AI_CACHE_STORE_NAME);
        store.put(src);
        await new Promise((res, rej) => {
            tx.oncomplete = res;
            tx.onerror = rej;
        });
    } catch (e) {
        console.warn("No se pudo cachear en IndexedDB:", e);
    }
}

async function loadSourcesFromCache() {
    try {
        const db = await getAiCacheDB();
        const tx = db.transaction(AI_CACHE_STORE_NAME, 'readonly');
        const store = tx.objectStore(AI_CACHE_STORE_NAME);
        const req = store.getAll();
        return new Promise((resolve) => {
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => resolve([]);
        });
    } catch (e) {
        return [];
    }
}

async function deleteSourceFromCache(id) {
    try {
        const db = await getAiCacheDB();
        const tx = db.transaction(AI_CACHE_STORE_NAME, 'readwrite');
        const store = tx.objectStore(AI_CACHE_STORE_NAME);
        store.delete(id);
    } catch (e) {
        console.warn("Error eliminando de IndexedDB:", e);
    }
}

function computeFileHash(fileName, fileSize, firstChars) {
    let str = `${fileName}_${fileSize}_${firstChars}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return 'h_' + Math.abs(hash);
}

function handleSourceFiles(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        const isImage = file.type.startsWith('image/');
        const isBinary = isPdf || isImage;

        const reader = new FileReader();
        reader.onload = async (e) => {
            let data = e.target.result;
            let mimeType = file.type;

            if (isBinary) {
                const commaIdx = data.indexOf(',');
                if (commaIdx !== -1) {
                    data = data.substring(commaIdx + 1);
                }
                if (isPdf && !mimeType) mimeType = 'application/pdf';
            }

            const id = 'src_' + computeFileHash(file.name, file.size, data.slice(0, 100));

            // Comprobar si ya la tenemos en memoria o cache
            const existing = aiSources.find(s => s.id === id);
            if (!existing) {
                const newSource = {
                    id: id,
                    name: file.name,
                    size: formatFileSize(file.size),
                    mimeType: mimeType || 'text/plain',
                    isBinary: isBinary,
                    data: data, // Base64 o texto
                    processedText: isBinary ? null : data, // Para no binarios ya es texto
                    status: isBinary ? 'pending' : 'ready', // 'pending' | 'processing' | 'ready'
                    selected: true,
                    timestamp: Date.now()
                };

                aiSources.push(newSource);
                await saveSourceToCache(newSource);
            } else {
                existing.selected = true;
            }

            renderSourcesList();
        };

        if (isBinary) {
            reader.readAsDataURL(file);
        } else {
            reader.readAsText(file);
        }
    });

    event.target.value = '';
}

function promptAddTextSource() {
    const title = prompt("Título para esta fuente de texto (ej: Apuntes_Clase o Ejercicios_Examen_2024):", "Apuntes_Texto_" + (aiSources.length + 1));
    if (!title) return;
    const content = prompt("Pega aquí el contenido, enunciados o apuntes:");
    if (!content || !content.trim()) return;

    const name = title.trim().endsWith('.txt') ? title.trim() : title.trim() + '.txt';
    const id = 'src_' + Date.now();
    const newSource = {
        id: id,
        name: name,
        size: formatFileSize(new Blob([content]).size),
        mimeType: 'text/plain',
        isBinary: false,
        data: content.trim(),
        processedText: content.trim(),
        status: 'ready',
        selected: true,
        timestamp: Date.now()
    };

    aiSources.push(newSource);
    saveSourceToCache(newSource);
    renderSourcesList();
}

function toggleSource(id) {
    const s = aiSources.find(src => src.id === id);
    if (s) {
        s.selected = !s.selected;
        saveSourceToCache(s);
        renderSourcesList();
    }
}

async function removeSource(id) {
    aiSources = aiSources.filter(src => src.id !== id);
    await deleteSourceFromCache(id);
    renderSourcesList();
}

function renderSourcesList() {
    const listEl = document.getElementById('aiSourcesList');
    const badgeEl = document.getElementById('sourcesCountBadge');
    if (!listEl) return;

    const selectedCount = aiSources.filter(s => s.selected).length;
    if (badgeEl) {
        badgeEl.innerText = `${selectedCount} de ${aiSources.length} activas`;
    }

    if (aiSources.length === 0) {
        listEl.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 20px;">
                No has añadido fuentes aún. Sube exámenes (PDF o fotos) o apuntes para que Gemini los analice.
            </div>
        `;
        return;
    }

    let html = '';
    aiSources.forEach(src => {
        let tagClass = 'txt';
        let tagText = 'TXT';
        if (src.mimeType === 'application/pdf') {
            tagClass = 'pdf';
            tagText = 'PDF';
        } else if (src.mimeType.startsWith('image/')) {
            tagClass = 'img';
            tagText = 'IMG';
        }

        let statusBadge = '';
        if (src.isBinary) {
            if (src.status === 'ready' && src.processedText) {
                statusBadge = `<span class="source-status-badge cached" title="Documento ya procesado y optimizado en caché local. No consume tokens de visión adicionales.">⚡ Optimizado</span>`;
            } else if (src.status === 'processing') {
                statusBadge = `<span class="source-status-badge processing" title="Procesando primera lectura con Gemini...">⏳ Procesando...</span>`;
            } else {
                statusBadge = `<span class="source-status-badge pending" title="Pendiente de primera lectura">📥 Sin procesar</span>`;
            }
        }

        html += `
            <div class="source-card ${src.selected ? 'selected' : ''}">
                <div class="source-card-info">
                    <input type="checkbox" ${src.selected ? 'checked' : ''} onchange="toggleSource('${src.id}')" style="cursor: pointer; width: 14px; height: 14px;">
                    <span class="source-tag ${tagClass}">${tagText}</span>
                    <span class="source-name" title="${sanitizeHTML(src.name)}">${sanitizeHTML(src.name)}</span>
                    <span style="font-size: 0.7rem; color: var(--text-muted); white-space: nowrap;">(${src.size})</span>
                    ${statusBadge}
                </div>
                <div style="display: flex; gap: 4px; align-items: center;">
                    ${src.processedText && src.isBinary ? `
                        <button class="act-btn" onclick="viewSourceExtraction('${src.id}')" title="Ver texto técnico extraído y guardado" style="padding: 2px 5px; font-size: 0.7rem;">
                            👁️
                        </button>
                    ` : ''}
                    <button class="act-btn delete" onclick="removeSource('${src.id}')" title="Quitar fuente" style="padding: 2px;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>
        `;
    });

    listEl.innerHTML = html;
}

function viewSourceExtraction(id) {
    const src = aiSources.find(s => s.id === id);
    if (!src || !src.processedText) return;
    customAlert(`<strong>Contenido Técnico Extraído y Cacheado (${sanitizeHTML(src.name)}):</strong><br><br><div style="max-height: 250px; overflow-y: auto; text-align: left; background: var(--bg-card); padding: 10px; border-radius: 6px; font-family: monospace; font-size: 0.78rem; white-space: pre-wrap; word-break: break-word;">${sanitizeHTML(src.processedText.slice(0, 3000))}${src.processedText.length > 3000 ? '\n\n... [Contenido truncado en la vista previa]' : ''}</div><br><span style="font-size:0.75rem; color:var(--text-muted);">Este texto estructurado se reutilizará en todas tus generaciones futuras sin volver a subir el archivo original.</span>`);
}

async function fetchWithBackoff(url, options, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                if (response.status === 429) { 
                    await new Promise(r => setTimeout(r, delay * Math.pow(2, i))); 
                    continue; 
                }
                const errData = await response.json().catch(() => null);
                const errMsg = errData && errData.error && errData.error.message ? errData.error.message : response.statusText;
                throw new Error(`Error API (${response.status}): ${errMsg}`);
            }
            return await response.json();
        } catch (e) {
            if (i === retries - 1) throw e;
            await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
        }
    }
}

async function extractBinarySourceContent(src, apiKey, model = 'gemini-3.8-flash', onStatusUpdate = null) {
    if (!src.isBinary || (src.status === 'ready' && src.processedText)) {
        return src.processedText || src.data;
    }

    if (onStatusUpdate) onStatusUpdate(`Procesando por primera vez "${src.name}" para extraer texto, fórmulas y diagramas...`);
    src.status = 'processing';
    renderSourcesList();

    const extractionPrompt = `Eres un transcriptor y digitalizador universitario experto de alta precisión.
Tu tarea es leer y extraer TODO el contenido relevante de este documento (examen, problemas o apuntes) con máxima fidelidad técnica:
1. Transcribe íntegramente todos los enunciados de ejercicios, preguntas teóricas y problemas, transcribiendo las fórmulas matemáticas en sintaxis LaTeX rigurosa ($...$ o $$...$$).
2. Conserva los datos numéricos, unidades, condiciones de contorno y restricciones.
3. Si hay figuras, esquemas o diagramas, describe con precisión qué representan geométrica o físicamente (ejes, cargas, vectores, circuitos, matrices).
4. No resumas ni recortes enunciados; transcríbelos completos para que puedan ser resueltos después.`;

    const payload = {
        contents: [{
            parts: [
                { text: extractionPrompt },
                {
                    inlineData: {
                        mimeType: src.mimeType,
                        data: src.data
                    }
                }
            ]
        }],
        generationConfig: {
            temperature: 0.1
        }
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
        const res = await fetchWithBackoff(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.candidates && res.candidates.length > 0 && res.candidates[0].content && res.candidates[0].content.parts.length > 0) {
            const extractedText = res.candidates[0].content.parts[0].text;
            src.processedText = extractedText;
            src.status = 'ready';
            // Liberamos src.data de memoria RAM en el objeto cacheado si ya tenemos el texto, o la conservamos según convenga. La guardamos para que esté completa en IndexedDB.
            await saveSourceToCache(src);
            renderSourcesList();
            return extractedText;
        } else {
            throw new Error("No se obtuvo texto de la extracción.");
        }
    } catch (err) {
        src.status = 'pending';
        renderSourcesList();
        throw err;
    }
}

async function openAIModal() {
    const loadingDiv = document.getElementById('aiLoading');
    if (loadingDiv) loadingDiv.style.display = 'none';
    
    const errorDiv = document.getElementById('aiError');
    if (errorDiv) errorDiv.style.display = 'none';
    
    const submitBtn = document.getElementById('aiSubmitBtn');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
    }

    // Cargar clave guardada en el input
    const keyInput = document.getElementById('geminiApiKeyInput');
    const saveKeyBtn = document.getElementById('saveApiKeyBtn');
    const savedKey = localStorage.getItem('gemini_api_key') || '';
    if (keyInput) keyInput.value = savedKey;
    if (saveKeyBtn) saveKeyBtn.innerText = savedKey ? 'Guardada ✓' : 'Guardar Clave';

    // Rellenar automáticamente Asignatura y Tema actuales si existen
    const activeSubj = appDB.subjects.find(s => s.id === activeSubjectId);
    const activeTop = activeSubj ? activeSubj.topics.find(t => t.id === activeTopicId) : null;
    
    const subjInput = document.getElementById('aiSubjectInput');
    const topicInput = document.getElementById('aiTopicInput');
    if (subjInput) subjInput.value = activeSubj ? activeSubj.name : '';
    if (topicInput) topicInput.value = activeTop ? activeTop.name : '';

    // Cargar fuentes cacheadas de IndexedDB si la lista en memoria está vacía
    if (aiSources.length === 0) {
        try {
            const cached = await loadSourcesFromCache();
            if (cached && cached.length > 0) {
                aiSources = cached;
            }
        } catch (e) {
            console.warn("Error cargando fuentes de IndexedDB:", e);
        }
    }

    renderSourcesList();
    initAIDropZone(); // Inicializar drag & drop
    openModal('aiModal');
}

function initAIDropZone() {
    const dropZone = document.getElementById('sourcesDropzone');
    if (!dropZone || dropZone._dndReady) return;
    dropZone._dndReady = true; // Evitar doble-registro de eventos

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', (e) => {
        // Solo quitar la clase si el cursor sale del dropzone de verdad (no de un hijo)
        if (!dropZone.contains(e.relatedTarget)) {
            dropZone.classList.remove('dragover');
        }
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleSourceFiles({ target: { files: files, value: '' } });
        }
    });
}


function toggleSaveApiKey() {
    const keyInput = document.getElementById('geminiApiKeyInput');
    const saveKeyBtn = document.getElementById('saveApiKeyBtn');
    if (!keyInput) return;
    
    const val = keyInput.value.trim();
    if (val) {
        localStorage.setItem('gemini_api_key', val);
        if (saveKeyBtn) saveKeyBtn.innerText = 'Guardada ✓';
    } else {
        localStorage.removeItem('gemini_api_key');
        if (saveKeyBtn) saveKeyBtn.innerText = 'Guardar Clave';
    }
}

async function generateExerciseWithAI() {
    const subjectName = (document.getElementById('aiSubjectInput').value || '').trim();
    const topicName = (document.getElementById('aiTopicInput').value || '').trim();
    const extraObservations = (document.getElementById('aiPrompt').value || '').trim();
    const errorDiv = document.getElementById('aiError');
    const keyInput = document.getElementById('geminiApiKeyInput');
    const modelSelect = document.getElementById('geminiModelSelect');
    const selectedModel = modelSelect ? modelSelect.value : 'gemini-3.8-flash';

    if (!subjectName || !topicName) {
        if (errorDiv) {
            errorDiv.innerHTML = '<strong>Aviso:</strong> Por favor indica la Asignatura y el Tema que deseas estructurar.';
            errorDiv.style.display = 'block';
        }
        return;
    }

    let apiKey = (keyInput ? keyInput.value.trim() : '') || localStorage.getItem('gemini_api_key') || "";
    if (!apiKey) {
        if (errorDiv) {
            errorDiv.innerHTML = '<strong>Error:</strong> Introduce tu Gemini API Key en el campo inferior para continuar.';
            errorDiv.style.display = 'block';
        }
        if (keyInput) keyInput.focus();
        return;
    }

    // Persistir clave ingresada
    localStorage.setItem('gemini_api_key', apiKey);
    const saveKeyBtn = document.getElementById('saveApiKeyBtn');
    if (saveKeyBtn) saveKeyBtn.innerText = 'Guardada ✓';

    const selectedSources = aiSources.filter(s => s.selected);
    if (selectedSources.length === 0 && !extraObservations) {
        if (errorDiv) {
            errorDiv.innerHTML = '<strong>Aviso:</strong> Sube o marca al menos un documento/examen fuente o escribe las observaciones detalladas del tema.';
            errorDiv.style.display = 'block';
        }
        return;
    }

    const loadingDiv = document.getElementById('aiLoading');
    const loadingStatus = document.getElementById('aiLoadingStatus');
    const submitBtn = document.getElementById('aiSubmitBtn');

    if (loadingDiv) loadingDiv.style.display = 'block';
    if (errorDiv) errorDiv.style.display = 'none';
    if (submitBtn) submitBtn.disabled = true;

    try {
        // PASO 1: Optimización de Fuentes Binarias (PDFs e Imágenes).
        // Si nunca se han procesado, se leen con Gemini una sola vez y se guardan como texto técnico estructurado.
        // En llamadas futuras o al cambiar de tema, se usa directamente el texto ahorrando miles de tokens de visión.
        for (const src of selectedSources) {
            if (src.isBinary && (!src.processedText || src.status !== 'ready')) {
                if (loadingStatus) {
                    loadingStatus.innerText = `Digitalizando y cacheando por primera vez: "${src.name}"... (solo se hace una vez)`;
                }
                await extractBinarySourceContent(src, apiKey, selectedModel, (msg) => {
                    if (loadingStatus) loadingStatus.innerText = msg;
                });
            }
        }

        if (loadingStatus) {
            loadingStatus.innerText = `Gemini (${selectedModel}) analizando fuentes cacheadas y calculando ponderación de exámenes...`;
        }

        // CONSTRUCCIÓN DEL MASTER PROMPT Y NORMAS DE LA SKILL
        const systemPrompt = `Eres un Catedrático y Diseñador Pedagógico Universitario de Élite para la plataforma UniverSOS.
Tu misión es realizar un análisis exhaustivo y riguroso de todas las fuentes proporcionadas (exámenes pasados, hojas de problemas, apuntes) para el tema "${topicName}" de la asignatura "${subjectName}".

REGLAS CRÍTICAS DE CALIDAD, EXHAUSTIVIDAD Y SUPERVIVENCIA:
1. ANÁLISIS DE EXÁMENES Y PONDERACIÓN REAL:
   - Examina con qué frecuencia aparece cada tipo de ejercicio en los exámenes y hojas de problemas adjuntos.
   - Concluye el peso en puntos y la probabilidad real (campo "probabilidad" de 1 a 100%) de cada tipo de ejercicio.
   - Prioriza en el orden de los ejercicios aquellos con mayor probabilidad y mayor peso de puntos en exámenes reales.

2. EXHAUSTIVIDAD TOTAL (NÚMERO VARIABLE Y COMPLETO — CERO ATAJOS):
   - NO limites arbitrariamente la cantidad de ejercicios a un número fijo o pequeño.
   - Si en los exámenes y fuentes detectas 6, 8, 10 o 12 tipos y variantes de problemas distintos, GENÉRALOS TODOS. Cada uno debe tener su estructura completa.
   - En cada ejercicio tipo debes desglosar con máxima minuciosidad:
     * title: Nombre técnico exacto del ejercicio tipo.
     * probabilidad: Número entero del 1 al 100 deducido del análisis de frecuencia en exámenes.
     * identificacion: Array de pistas inequívocas en el enunciado para reconocer el problema en el examen.
     * algoritmo: Array de pasos meticulosos (Paso 1, Paso 2, ...) con "title", "subtitle" y "example" (demostración o micro-cálculo) en CADA paso.
     * ejemploCompleto: Desarrollo matemático completo y riguroso de un problema real con fórmulas LaTeX.
     * variaciones: Array de casos particulares o variantes de examen con "title", "content", "fix" y "example".
     * trucos: Atajos algebraicos y de cálculo para ahorrar tiempo en el examen.
     * errores: Fallos típicos en los que los alumnos suelen perder puntos y cómo evitarlos.
     * trampas: Puntos ciegos o trampas deliberadas de examen.
     * ejerciciosPropuestos: Ejercicios reales extraídos de las fuentes para practicar (con "ref", "nota" de puntuación estimada y "enunciado").

3. TEORÍA RIGUROSA Y CHECKLISTS CLAVE (SI APLICA):
   - title: Título formal del tema.
   - introduccion: Fundamentos teóricos y motivación.
   - secciones: Subsecciones teóricas con teoremas, demostraciones clave y acordeones de "detalles" (con "title" y "content").
   - checklistClave: Lista exhaustiva de conceptos de examen que el alumno debe verificar antes de hacer problemas.

4. NORMAS ESTRICTAS DE FORMATO Y LATEX:
   - Usa sintaxis LaTeX ($ para inline y $$ para display).
   - En el JSON, escapa doblemente las barras invertidas de LaTeX (ej: \\\\frac, \\\\lambda, \\\\int, \\\\pmatrix).
   - Usa <br> para saltos de línea dentro de cadenas de texto.
   - Devuelve ÚNICAMENTE el bloque JSON estricto con la estructura requerida, sin texto explicativo exterior ni bloques markdown decorativos.`;

        let userInstruction = `Asignatura: "${subjectName}"\nTema: "${topicName}"\nModo de Generación: "${currentAiGenMode}" (both = teoría y ejercicios, exercises = solo ejercicios tipo, theory = solo teoría).\n`;
        if (extraObservations) {
            userInstruction += `\nObservaciones e Instrucciones adicionales del estudiante:\n${extraObservations}\n`;
        }
        userInstruction += `\nAnaliza minuciosamente los documentos fuentes adjuntos a continuación. Identifica todos los ejercicios de exámenes y hojas de problemas, calcula sus probabilidades y genera la estructura JSON maestra completa con todos los pasos y LaTeX riguroso.`;

        // Construcción de partes de contenido (Ahorro masivo de tokens: ¡todo se pasa como texto optimizado!)
        const contentsParts = [];
        contentsParts.push({ text: userInstruction });

        selectedSources.forEach(src => {
            const docContent = src.processedText || src.data;
            contentsParts.push({
                text: `\n\n=== DOCUMENTO FUENTE: ${src.name} (${src.mimeType}) ===\n${docContent}\n=== FIN DOCUMENTO ===\n`
            });
        });

        const payload = {
            contents: [{ parts: contentsParts }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
                responseMimeType: "application/json"
            }
        };

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

        const result = await fetchWithBackoff(apiUrl, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        });

        if (result.candidates && result.candidates.length > 0) {
            const rawJsonText = result.candidates[0].content.parts[0].text;
            let data;
            
            try {
                data = JSON.parse(rawJsonText);
            } catch(e1) {
                const repaired = fixJsonLatex(rawJsonText);
                data = JSON.parse(repaired);
            }

            // Normalizar y almacenar en base de datos
            const targetSubjName = data.asignatura || subjectName;
            const targetTopName = data.tema || topicName;

            let subject = appDB.subjects.find(s => 
                s.name.toLowerCase() === targetSubjName.toLowerCase() || 
                (s.aliases && s.aliases.includes(targetSubjName.toLowerCase()))
            );

            if (!subject) {
                subject = {
                    id: 'subj_' + Date.now(),
                    name: targetSubjName,
                    aliases: [targetSubjName.toLowerCase()],
                    topics: []
                };
                appDB.subjects.push(subject);
            }

            let topic = subject.topics.find(t => 
                t.name.toLowerCase() === targetTopName.toLowerCase() || 
                (t.aliases && t.aliases.includes(targetTopName.toLowerCase()))
            );

            if (!topic) {
                topic = {
                    id: 'top_' + Date.now(),
                    name: targetTopName,
                    aliases: [targetTopName.toLowerCase()],
                    data: { ejercicios: [] }
                };
                subject.topics.push(topic);
            }

            if (!topic.data) topic.data = { ejercicios: [] };

            // Inyectar según el modo
            if (currentAiGenMode === 'both' || currentAiGenMode === 'theory') {
                if (data.teoria) topic.data.teoria = data.teoria;
            }
            if (currentAiGenMode === 'both' || currentAiGenMode === 'exercises') {
                if (data.ejercicios && Array.isArray(data.ejercicios)) {
                    topic.data.ejercicios = data.ejercicios;
                }
            }

            saveDB();
            activeSubjectId = subject.id;
            activeTopicId = topic.id;

            renderDropdowns();
            renderTopicExercises();

            closeModal('aiModal');
            customAlert(`¡Estudio generado con éxito!\nSe han estructurado los contenidos para "${targetTopName}" analizando las fuentes proporcionadas.`);
        } else {
            throw new Error("Respuesta vacía o inesperada del modelo.");
        }
    } catch (error) {
        console.error("Error al generar con IA:", error);
        if (errorDiv) {
            errorDiv.innerHTML = `<strong>Error:</strong> No se pudo completar la generación. Detalle: ${error.message}`;
            errorDiv.style.display = 'block';
        }
    } finally {
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (submitBtn) submitBtn.disabled = false;
    }
}
