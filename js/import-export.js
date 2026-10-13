/**
 * Motor de Importación y Procesamiento JSON
 * 
 * Limpia y normaliza el JSON ingresado mediante Drag & Drop o pegado manual:
 * - Sanitiza espacios unicode invisibles
 * - Auto-escapa barras invertidas de LaTeX preservando comandos especiales (\frac, \theta, \beta, \rho, \upsilon, \nabla, etc.)
 * - Soporta matrices y saltos de línea sin corromper la sintaxis JSON
 * - Resuelve alias de asignaturas y temas
 */

function fixJsonLatex(jsonStr) {
    if (!jsonStr) return '';
    // 1. Reemplazar caracteres unicode invisibles y espacios raros
    let text = jsonStr.replace(/[\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/g, " ");

    // 2. Procesar cadenas dentro de comillas JSON para auto-escapar comandos LaTeX
    let result = '';
    let inString = false;
    let i = 0;

    while (i < text.length) {
        let char = text[i];

        // Detección de delimitador de cadena JSON respetando barras de escape
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

            // Escapes JSON estándar que debemos preservar como tales
            if (nextChar === '"' || nextChar === '/') {
                result += '\\' + nextChar;
                i += 2;
                continue;
            }

            // Código unicode válido de 4 dígitos \uXXXX
            if (nextChar === 'u' && /^[0-9a-fA-F]{4}/.test(rest.substring(1, 5))) {
                result += '\\' + rest.substring(0, 5);
                i += 6;
                continue;
            }

            // Salto de línea JSON explícito \n (que no sea un comando LaTeX como \nabla o \neq)
            if (nextChar === 'n' && !/^(abla|eq|u\b|orm|otin|ot\b|eg\b)/.test(rest.substring(1))) {
                result += '\\n';
                i += 2;
                continue;
            }

            // Cualquier otro escape o comando LaTeX (\frac, \theta, \beta, \rho, \upsilon, \int, \le, etc.)
            // se convierte en \\ para que JSON.parse lo preserve como barra única en JS
            result += '\\\\';
            i++;
            continue;
        }

        // Saltos de línea físicos dentro de una cadena JSON se convierten en \n
        if (inString && (char === '\n' || char === '\r')) {
            if (char === '\r' && text[i + 1] === '\n') i++;
            result += '\\n';
            i++;
            continue;
        }

        result += char;
        i++;
    }

    return result;
}

function importJsonData() {
    const textarea = document.getElementById('json-textarea');
    if (!textarea) return;

    let text = textarea.value.trim();
    if (!text) return;

    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        text = text.substring(firstBrace, lastBrace + 1);
    }

    let data;
    // Intentar primero parseo directo por si el JSON ya viene perfectamente estructurado
    try {
        data = JSON.parse(text);
    } catch (e1) {
        // Si falla, aplicar normalización inteligente para LaTeX y sintaxis
        try {
            const fixedText = fixJsonLatex(text);
            data = JSON.parse(fixedText);
        } catch (e2) {
            customAlert("Error de sintaxis al leer el JSON.\nDetalle: " + e2.message);
            return;
        }
    }

    if (!data.asignatura || !data.tema || (!data.ejercicios && !data.teoria)) { 
        customAlert("El JSON es válido pero le faltan los campos clave ('asignatura', 'tema', y 'ejercicios' o 'teoria')."); 
        return; 
    }
    
    let subject = appDB.subjects.find(s => 
        s.name.toLowerCase() === data.asignatura.toLowerCase() || 
        (s.aliases && s.aliases.includes(data.asignatura.toLowerCase()))
    );

    if (!subject) {
        subject = { 
            id: 'subj_' + Date.now(), 
            name: data.asignatura, 
            aliases: [data.asignatura.toLowerCase()], 
            topics: [] 
        };
        appDB.subjects.push(subject);
    }
    
    let topic = subject.topics.find(t => 
        t.name.toLowerCase() === data.tema.toLowerCase() || 
        (t.aliases && t.aliases.includes(data.tema.toLowerCase()))
    );

    if (topic) {
        if (!topic.data) topic.data = { ejercicios: [] };
        if (data.teoria) topic.data.teoria = data.teoria;
        if (data.ejercicios) topic.data.ejercicios = data.ejercicios;
    } else {
        let newTopicData = { ejercicios: [] };
        if (data.teoria) newTopicData.teoria = data.teoria;
        if (data.ejercicios) newTopicData.ejercicios = data.ejercicios;
        topic = { 
            id: 'topic_' + Date.now(), 
            name: data.tema, 
            aliases: [data.tema.toLowerCase()], 
            data: newTopicData 
        };
        subject.topics.push(topic);
    }
    
    saveDB(); 
    activeSubjectId = subject.id; 
    activeTopicId = topic.id;
    
    renderDropdowns(); 
    renderTopicExercises();
    
    closeModal('importModal'); 
    textarea.value = '';
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
        dropZone.addEventListener('dragleave', () => { 
            dropZone.classList.remove('dragover'); 
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
