/**
 * Operaciones CRUD, Edición y Control de Interfaz
 * Maneja la creación, renombramiento, eliminación en cascada y alternancia de temas/menús.
 */

function toggleTheme() { 
    document.body.classList.toggle('dark');
    const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, currentTheme);
}

function toggleClass(element) { 
    element.parentElement.classList.toggle('open'); 
}

function toggleDropdown(id, e) {
    if (e) e.stopPropagation();
    const el = document.getElementById(id);
    if (!el) return;
    const wrapper = el.parentElement;
    const isOpen = wrapper.classList.contains('open');
    document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
    if (!isOpen) wrapper.classList.add('open');
}

function openEditModal(type, id, e) {
    if (e) e.stopPropagation();
    document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
    editTargetType = type; 
    editTargetId = id;
    
    const titleEl = document.getElementById('editModalTitle');
    const inputEl = document.getElementById('editModalInput');
    
    if (id === null) {
        if (type === 'subject') {
            titleEl.innerText = 'Crear Asignatura';
        } else if (type === 'topic') {
            titleEl.innerText = 'Crear Tema';
        } else if (type === 'exercise') {
            titleEl.innerText = 'Crear Ejercicio';
        }
        inputEl.value = '';
    } else {
        titleEl.innerText = 'Renombrar';
        if (type === 'subject') {
            const subj = appDB.subjects.find(s => s.id === id);
            inputEl.value = subj ? subj.name : '';
        } else if (type === 'topic') {
            const subj = appDB.subjects.find(s => s.id === activeSubjectId);
            const top = subj ? subj.topics.find(t => t.id === id) : null;
            inputEl.value = top ? top.name : '';
        } else if (type === 'exercise') {
            const subj = appDB.subjects.find(s => s.id === activeSubjectId);
            const topic = subj ? subj.topics.find(t => t.id === activeTopicId) : null;
            inputEl.value = (topic && topic.data && topic.data.ejercicios[id]) ? topic.data.ejercicios[id].title : '';
        }
    }
    openModal('editModal');
    setTimeout(() => inputEl.focus(), 100);
}

function initEditListeners() {
    const saveBtn = document.getElementById('editModalSave');
    const inputEl = document.getElementById('editModalInput');

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const val = inputEl.value.trim();
            if (!val) return;
            
            if (editTargetType === 'subject') {
                if (editTargetId) {
                    let s = appDB.subjects.find(s => s.id === editTargetId);
                    if (s) {
                        if (!s.aliases) s.aliases = [s.name.toLowerCase()];
                        if (!s.aliases.includes(val.toLowerCase())) s.aliases.push(val.toLowerCase());
                        s.name = val;
                    }
                } else {
                    const newId = 'subj_' + Date.now();
                    appDB.subjects.push({ id: newId, name: val, aliases: [val.toLowerCase()], topics: [] });
                    activeSubjectId = newId; 
                    activeTopicId = null;
                }
            } else if (editTargetType === 'topic') {
                const s = appDB.subjects.find(s => s.id === activeSubjectId);
                if (s) {
                    if (editTargetId) {
                        let t = s.topics.find(t => t.id === editTargetId);
                        if (t) {
                            if (!t.aliases) t.aliases = [t.name.toLowerCase()];
                            if (!t.aliases.includes(val.toLowerCase())) t.aliases.push(val.toLowerCase());
                            t.name = val;
                        }
                    } else {
                        const newId = 'top_' + Date.now();
                        s.topics.push({ id: newId, name: val, aliases: [val.toLowerCase()], data: { ejercicios: [] } });
                        activeTopicId = newId;
                    }
                }
            } else if (editTargetType === 'exercise') {
                const s = appDB.subjects.find(s => s.id === activeSubjectId);
                const topic = s ? s.topics.find(t => t.id === activeTopicId) : null;
                if (topic) {
                    if (!topic.data) topic.data = { ejercicios: [] };
                    if (!topic.data.ejercicios) topic.data.ejercicios = [];

                    if (editTargetId !== null) {
                        if (topic.data.ejercicios[editTargetId]) {
                            topic.data.ejercicios[editTargetId].title = val;
                        }
                    } else {
                        // Crear nuevo ejercicio
                        const newEx = {
                            title: val,
                            probabilidad: 50,
                            identificacion: ["Pautas de resolución para " + val],
                            algoritmo: [
                                {
                                    title: "Paso 1: Planteamiento",
                                    subtitle: "Definir variables y condiciones iniciales",
                                    example: "Indicar el punto de partida del problema."
                                }
                            ],
                            ejemploCompleto: "Desarrollo del ejercicio con fórmulas LaTeX."
                        };
                        topic.data.ejercicios.push(newEx);
                    }
                }
            }
            
            saveDB(); 
            renderDropdowns();
            if (activeTopicId) renderTopicExercises();
            closeModal('editModal');
        });
    }

    if (inputEl) {
        inputEl.addEventListener('keypress', e => {
            if (e.key === 'Enter' && saveBtn) saveBtn.click();
        });
    }

    // Cerrar desplegables al hacer clic fuera
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
    });
}

function deleteItem(type, id, e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    let confirmPrompt = "¿Eliminar definitivamente este elemento?";
    if (type === 'subject') {
        confirmPrompt = "¿Eliminar esta Asignatura y TODOS sus temas y ejercicios?";
    } else if (type === 'topic') {
        confirmPrompt = "¿Eliminar este Tema y TODA su teoría y ejercicios dependientes?";
    } else if (type === 'theory') {
        confirmPrompt = "¿Eliminar la sección de Teoría de este tema?";
    } else if (type === 'exercise') {
        confirmPrompt = "¿Eliminar este ejercicio completo y todos sus pasos/variaciones?";
    }

    customConfirm(confirmPrompt, (confirmed) => {
        if (!confirmed) return;
        
        if (type === 'subject') {
            // Eliminación en cascada de la asignatura y todas sus subramas
            appDB.subjects = appDB.subjects.filter(s => s.id !== id);
            if (activeSubjectId === id) { 
                activeSubjectId = null; 
                activeTopicId = null; 
            }
        } else if (type === 'topic') {
            // Eliminación en cascada del tema y todas sus subramas
            const s = appDB.subjects.find(s => s.topics.some(t => t.id === id)) || appDB.subjects.find(s => s.id === activeSubjectId);
            if (s) {
                s.topics = s.topics.filter(t => t.id !== id);
                if (activeTopicId === id) {
                    activeTopicId = null;
                }
            }
        } else if (type === 'theory') {
            // Eliminación de la rama de teoría
            const s = appDB.subjects.find(s => s.id === activeSubjectId);
            const topic = s ? s.topics.find(t => t.id === activeTopicId) : null;
            if (topic && topic.data) {
                delete topic.data.teoria;
            }
        } else if (type === 'exercise') {
            // Eliminación del ejercicio y todos sus pasos/variaciones/trucos
            const s = appDB.subjects.find(s => s.id === activeSubjectId);
            const topic = s ? s.topics.find(t => t.id === activeTopicId) : null;
            if (topic && topic.data && topic.data.ejercicios) {
                topic.data.ejercicios.splice(id, 1);
            }
        }
        
        saveDB(); 
        renderDropdowns(); 
        
        if (activeTopicId) {
            renderTopicExercises();
        } else {
            // Limpieza integral del DOM de subramas
            const exList = document.getElementById('exercise-list');
            if (exList) exList.innerHTML = '';
            setEmptyState(activeSubjectId ? 'Selecciona o crea un Tema en el panel superior.' : 'Selecciona o crea una Asignatura.');
        }
    });
}

function openNewExerciseModal(e) {
    if (e) e.stopPropagation();
    if (!activeSubjectId || !activeTopicId) {
        customAlert("Por favor, selecciona una Asignatura y un Tema antes de añadir un ejercicio.");
        return;
    }
    setAddExerciseTab('ai');
    openModal('newExerciseModal');
}

function setAddExerciseTab(tab) {
    const tabs = ['ai', 'json', 'manual'];
    tabs.forEach(t => {
        const btn = document.getElementById('tabAdd' + t.charAt(0).toUpperCase() + t.slice(1));
        const panel = document.getElementById('addExercisePanel' + t.charAt(0).toUpperCase() + t.slice(1));
        if (btn) btn.classList.toggle('active', t === tab);
        if (panel) panel.style.display = (t === tab) ? 'flex' : 'none';
    });
}

function openAIFromNewExercise() {
    closeModal('newExerciseModal');
    // Forzar modo Solo Ejercicios en el estudio IA
    if (typeof setAiGenMode === 'function') {
        setAiGenMode('exercises');
    }
    openAIModal();
}

function submitJsonExercise() {
    const textarea = document.getElementById('addExerciseJsonInput');
    if (!textarea || !textarea.value.trim()) {
        customAlert("Pega el JSON del ejercicio a insertar.");
        return;
    }

    const s = appDB.subjects.find(s => s.id === activeSubjectId);
    const topic = s ? s.topics.find(t => t.id === activeTopicId) : null;
    if (!topic) return;

    try {
        let fixed = fixJsonLatex(textarea.value.trim());
        let parsed = JSON.parse(fixed);

        if (!topic.data) topic.data = { ejercicios: [] };
        if (!topic.data.ejercicios) topic.data.ejercicios = [];

        // Si viene un array de ejercicios o un solo objeto de ejercicio
        if (Array.isArray(parsed)) {
            parsed.forEach(ex => topic.data.ejercicios.push(ex));
        } else if (parsed.ejercicios && Array.isArray(parsed.ejercicios)) {
            parsed.ejercicios.forEach(ex => topic.data.ejercicios.push(ex));
        } else if (parsed.title) {
            topic.data.ejercicios.push(parsed);
        } else {
            throw new Error("El JSON debe tener un campo 'title' o ser un array de ejercicios.");
        }

        saveDB();
        renderTopicExercises();
        closeModal('newExerciseModal');
        textarea.value = '';
        selectExercise(topic.data.ejercicios.length - 1);
        customAlert("¡Ejercicio(s) añadido(s) con éxito al tema!");
    } catch (err) {
        customAlert("Error al procesar el JSON del ejercicio: " + err.message);
    }
}

function submitManualExercise() {
    const titleInput = document.getElementById('addExerciseTitleInput');
    const probInput = document.getElementById('addExerciseProbInput');
    const title = titleInput ? titleInput.value.trim() : '';
    const prob = probInput ? parseInt(probInput.value) || 70 : 70;

    if (!title) {
        customAlert("Escribe un título para el nuevo ejercicio tipo.");
        return;
    }

    const s = appDB.subjects.find(s => s.id === activeSubjectId);
    const topic = s ? s.topics.find(t => t.id === activeTopicId) : null;
    if (!topic) return;

    if (!topic.data) topic.data = { ejercicios: [] };
    if (!topic.data.ejercicios) topic.data.ejercicios = [];

    const newEx = {
        title: title,
        probabilidad: prob,
        identificacion: ["Pistas de resolución para " + title],
        algoritmo: [
            {
                title: "Paso 1: Planteamiento",
                subtitle: "Definir variables y condiciones iniciales",
                example: "Indicar el punto de partida del problema."
            }
        ],
        ejemploCompleto: "Desarrollo del ejercicio con fórmulas LaTeX."
    };

    topic.data.ejercicios.push(newEx);
    saveDB();
    renderTopicExercises();
    closeModal('newExerciseModal');
    if (titleInput) titleInput.value = '';
    selectExercise(topic.data.ejercicios.length - 1);
}
