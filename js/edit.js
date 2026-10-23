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
    const parent = element.parentElement;
    if (!parent) return;
    parent.classList.toggle('open');
    if (parent.classList.contains('open') && typeof forceMathRender === 'function') {
        forceMathRender([parent]);
    }
}

function toggleChecklistExpand(headerEl) {
    const wrapper = headerEl.closest('.checklist-item-wrapper');
    if (!wrapper) return;
    wrapper.classList.toggle('expanded');
    if (wrapper.classList.contains('expanded') && typeof forceMathRender === 'function') {
        forceMathRender([wrapper]);
    }
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

    // Cerrar desplegables SOLO si el clic empezó y terminó fuera del desplegable
    document.addEventListener('click', (e) => {
        const downInsideDropdown = lastPointerDownTarget && lastPointerDownTarget.closest && lastPointerDownTarget.closest('.custom-select-wrapper');
        const upInsideDropdown = e.target && e.target.closest && e.target.closest('.custom-select-wrapper');
        if (!downInsideDropdown && !upInsideDropdown) {
            document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
        }
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
        confirmPrompt = "¿Eliminar este ejercicio completo y todos sus pasos y variaciones?";
    }

    customConfirm(confirmPrompt, (confirmed) => {
        if (!confirmed) return;
        
        if (type === 'subject') {
            appDB.subjects = appDB.subjects.filter(s => s.id !== id);
            if (activeSubjectId === id) { 
                activeSubjectId = null; 
                activeTopicId = null; 
            }
        } else if (type === 'topic') {
            const s = appDB.subjects.find(s => s.topics.some(t => t.id === id)) || appDB.subjects.find(s => s.id === activeSubjectId);
            if (s) {
                s.topics = s.topics.filter(t => t.id !== id);
                if (activeTopicId === id) {
                    activeTopicId = null;
                }
            }
        } else if (type === 'theory') {
            const s = appDB.subjects.find(s => s.id === activeSubjectId);
            const topic = s ? s.topics.find(t => t.id === activeTopicId) : null;
            if (topic && topic.data) {
                delete topic.data.teoria;
            }
        } else if (type === 'exercise') {
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
            const exList = document.getElementById('exercise-list');
            if (exList) exList.innerHTML = '';
            setEmptyState(activeSubjectId ? 'Selecciona o crea un Tema en el panel superior.' : 'Selecciona o crea una Asignatura.');
        }
    });
}
