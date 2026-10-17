/**
 * Vistas y Renderizado de Componentes
 * Maneja el árbol DOM de Asignaturas, Temas, Teoría y Ejercicios.
 * Soporta Modo Examen, Indicadores de Dominio, Filtros y Exportación Imprimible.
 */

const icons = {
    edit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
    plus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
};

function setEmptyState(msg) {
    const content = document.getElementById('exercise-content');
    if (!content) return;
    content.innerHTML = `
        <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            <h3>Espacio de Trabajo</h3><p>${msg}</p>
        </div>`;
}

function renderDropdowns() {
    const sList = document.getElementById('subject-list');
    const tWrapper = document.getElementById('dd-topic');
    const tList = document.getElementById('topic-list');
    const exList = document.getElementById('exercise-list');
    
    if (!sList || !tWrapper || !tList) return;

    sList.innerHTML = '';
    appDB.subjects.forEach(subj => {
        sList.innerHTML += `
            <div class="custom-option" onclick="selectSubject('${subj.id}')">
                <span class="option-text">${subj.name}</span>
                <div class="option-actions">
                    <button class="act-btn" onclick="openEditModal('subject', '${subj.id}', event)" title="Renombrar">${icons.edit}</button>
                    <button class="act-btn delete" onclick="deleteItem('subject', '${subj.id}', event)" title="Eliminar">${icons.trash}</button>
                </div>
            </div>`;
    });

    const activeSubj = appDB.subjects.find(s => s.id === activeSubjectId);
    const subjText = document.getElementById('subject-text');
    if (subjText) subjText.innerText = activeSubj ? activeSubj.name : 'Asignatura...';

    if (activeSubj) {
        tWrapper.style.display = 'block';
        tList.innerHTML = '';
        activeSubj.topics.forEach(top => {
            tList.innerHTML += `
                <div class="custom-option" onclick="selectTopic('${top.id}')">
                    <span class="option-text">${top.name}</span>
                    <div class="option-actions">
                        <button class="act-btn" onclick="openEditModal('topic', '${top.id}', event)" title="Renombrar">${icons.edit}</button>
                        <button class="act-btn delete" onclick="deleteItem('topic', '${top.id}', event)" title="Eliminar">${icons.trash}</button>
                    </div>
                </div>`;
        });
        const activeTop = activeSubj.topics.find(t => t.id === activeTopicId);
        const topText = document.getElementById('topic-text');
        if (topText) topText.innerText = activeTop ? activeTop.name : 'Tema...';

        if (!activeTopicId) {
            if (exList) exList.innerHTML = '';
            setEmptyState('Selecciona o crea un Tema en el panel superior.');
        }
    } else {
        tWrapper.style.display = 'none';
        if (exList) exList.innerHTML = '';
        setEmptyState('Selecciona o crea una Asignatura a la izquierda.');
    }

    updateBreadcrumbs();
}

function updateBreadcrumbs() {
    const navLeft = document.getElementById('nav-breadcrumb');
    if (!navLeft) return;

    let textGroup = navLeft.querySelector('.breadcrumb-text-group');
    if (!textGroup) {
        textGroup = document.createElement('div');
        textGroup.className = 'breadcrumb-text-group';
        navLeft.appendChild(textGroup);
    }

    const activeSubj = appDB.subjects.find(s => s.id === activeSubjectId);
    if (!activeSubj) {
        textGroup.innerHTML = `
            <span class="breadcrumb-subj">UniverSOS</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-topic">Espacio de Estudio</span>
        `;
        return;
    }
    const activeTop = activeSubj.topics.find(t => t.id === activeTopicId);
    let html = `<span class="breadcrumb-subj">${sanitizeHTML(activeSubj.name)}</span>`;
    if (activeTop) {
        html += `<span class="breadcrumb-sep">/</span><span class="breadcrumb-topic">${sanitizeHTML(activeTop.name)}</span>`;
    }
    textGroup.innerHTML = html;
    forceMathRender([textGroup]);
}

function selectSubject(id) {
    activeSubjectId = id; 
    activeTopicId = null;
    localStorage.setItem(ACTIVE_SUBJ_KEY, id);
    localStorage.removeItem(ACTIVE_TOPIC_KEY);
    const ddSubj = document.getElementById('dd-subject');
    if (ddSubj) ddSubj.classList.remove('open');
    renderDropdowns(); 
    setEmptyState('Ahora selecciona un Tema en el menú superior.');
}

function selectTopic(id) {
    activeTopicId = id;
    if (activeSubjectId) localStorage.setItem(ACTIVE_SUBJ_KEY, activeSubjectId);
    localStorage.setItem(ACTIVE_TOPIC_KEY, id);
    const ddTop = document.getElementById('dd-topic');
    if (ddTop) ddTop.classList.remove('open');
    renderDropdowns(); 
    renderTopicExercises();
}

function setMasteryFilter(filter) {
    currentMasteryFilter = filter;
    renderTopicExercises();
}

function renderTopicExercises() {
    const exList = document.getElementById('exercise-list');
    if (!exList) return;
    exList.innerHTML = '';
    
    if (!activeSubjectId || !activeTopicId) {
        setEmptyState('Selecciona o crea una Asignatura y Tema.');
        return;
    }

    const subject = appDB.subjects.find(s => s.id === activeSubjectId);
    const topic = subject ? subject.topics.find(t => t.id === activeTopicId) : null;

    if (!topic) {
        setEmptyState('Selecciona un Tema válido.');
        return;
    }

    if (!topic.data) topic.data = { ejercicios: [] };
    const allExercises = topic.data.ejercicios || [];

    // Contadores de dominio
    const counts = {
        all: allExercises.length,
        mastered: allExercises.filter(e => e.mastery === 'mastered').length,
        review: allExercises.filter(e => e.mastery === 'review').length,
        doubt: allExercises.filter(e => e.mastery === 'doubt').length
    };

    // Barra de filtros de dominio (si hay ejercicios)
    if (allExercises.length > 0) {
        exList.innerHTML += `
            <div class="mastery-filter-bar">
                <button class="filter-pill ${currentMasteryFilter === 'all' ? 'active' : ''}" onclick="setMasteryFilter('all')" title="Ver todos">Todos (${counts.all})</button>
                <button class="filter-pill ${currentMasteryFilter === 'mastered' ? 'active' : ''}" onclick="setMasteryFilter('mastered')" title="Dominados">🟢 ${counts.mastered}</button>
                <button class="filter-pill ${currentMasteryFilter === 'review' ? 'active' : ''}" onclick="setMasteryFilter('review')" title="Por repasar">🟡 ${counts.review}</button>
                <button class="filter-pill ${currentMasteryFilter === 'doubt' ? 'active' : ''}" onclick="setMasteryFilter('doubt')" title="Dudas">🔴 ${counts.doubt}</button>
            </div>
        `;
    }

    // Tarjeta de Teoría (siempre visible salvo filtro estricto)
    if (topic.data.teoria && currentMasteryFilter === 'all') {
        exList.innerHTML += `
            <div class="exercise-card theory-card" id="card-theory" onclick="selectTheory()">
                <div class="card-info">
                    <span class="card-title">📖 Teoría del Tema</span>
                    <span class="card-meta">Conceptos clave y resumen</span>
                </div>
                <div class="card-actions">
                    <button class="act-btn delete" onclick="deleteItem('theory', null, event)" title="Eliminar Teoría">${icons.trash}</button>
                </div>
            </div>
        `;
    }

    // Tarjetas de Ejercicios filtradas
    let renderedCount = 0;
    allExercises.forEach((ex, idx) => {
        const exMastery = ex.mastery || 'none';
        if (currentMasteryFilter !== 'all' && exMastery !== currentMasteryFilter) {
            return;
        }

        renderedCount++;
        let badgeClass = 'low';
        if (ex.probabilidad >= 70) badgeClass = 'high';
        else if (ex.probabilidad >= 40) badgeClass = 'med';

        let masteryDot = '⚪';
        if (exMastery === 'mastered') masteryDot = '🟢';
        else if (exMastery === 'review') masteryDot = '🟡';
        else if (exMastery === 'doubt') masteryDot = '🔴';
        
        exList.innerHTML += `
            <div class="exercise-card" id="card-ex-${idx}" onclick="selectExercise(${idx})">
                <div class="card-info">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                        <span class="card-title" style="flex:1;">
                            <span class="mastery-dot" title="Estado de dominio: ${exMastery}">${masteryDot}</span>
                            ${sanitizeHTML(ex.title)}
                        </span>
                        <span class="prob-badge ${badgeClass}">${ex.probabilidad || 50}%</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="act-btn" onclick="openEditModal('exercise', ${idx}, event)" title="Renombrar">${icons.edit}</button>
                    <button class="act-btn delete" onclick="deleteItem('exercise', ${idx}, event)" title="Eliminar">${icons.trash}</button>
                </div>
            </div>
        `;
    });

    if (currentMasteryFilter !== 'all' && renderedCount === 0) {
        exList.innerHTML += `
            <div style="padding:16px; text-align:center; color:var(--text-muted); font-size:0.8rem;">
                No hay ejercicios con este estado de dominio.
            </div>
        `;
    }

    // Botón para añadir nuevo ejercicio (con IA, JSON o Manual)
    exList.innerHTML += `
        <div class="add-exercise-btn" onclick="openNewExerciseModal(event)">
            ${icons.plus} Añadir Ejercicio
        </div>
    `;

    // Selección automática inicial
    if (topic.data.teoria && currentMasteryFilter === 'all') {
        selectTheory();
    } else if (allExercises.length > 0) {
        selectExercise(0);
    } else {
        setEmptyState('Tema vacío. Puedes importar un JSON, usar la IA o pulsar "+ Añadir Ejercicio".');
    }

    forceMathRender([exList]);
}

function selectTheory() {
    if (typeof closeMobileSidebar === 'function' && (typeof isMobileOrLandscapeDrawer === 'function' ? isMobileOrLandscapeDrawer() : window.innerWidth <= 768)) {
        closeMobileSidebar();
    }
    document.querySelectorAll('.exercise-card').forEach(c => c.classList.remove('active'));
    const card = document.getElementById('card-theory');
    if (card) card.classList.add('active');

    const subject = appDB.subjects.find(s => s.id === activeSubjectId);
    const topic = subject ? subject.topics.find(t => t.id === activeTopicId) : null;
    const data = topic && topic.data ? topic.data.teoria : null;
    if (!data) return;
    
    let html = `<div class="exercise-header-top">
        <h1 class="main-title">${sanitizeHTML(data.title) || 'Conceptos Teóricos'}</h1>
        <button class="btn btn-secondary print-action-btn" onclick="printStudySheet()" title="Exportar o Imprimir Chuleta">🖨️ Imprimir Chuleta</button>
    </div>`;
    html += `<div class="theory-content">`;
    
    if (data.introduccion) {
        let parsedIntro = processTextWithCitations(data.introduccion);
        html += `<p style="margin-bottom: 24px;">${parsedIntro.text}</p>`;
    }

    if (data.secciones) {
        data.secciones.forEach(sec => {
            let secRefs = new Set();
            let parsedContent = processTextWithCitations(sec.content);
            parsedContent.refs.forEach(r => secRefs.add(r));

            html += `<h2>${sanitizeHTML(sec.title)}</h2>`;
            html += `<p style="margin-bottom: 20px;">${parsedContent.text}</p>`;
            
            if (sec.detalles && sec.detalles.length > 0) {
                html += `<div class="section-card" style="border:none; padding-top:0; margin-bottom:16px;">`;
                sec.detalles.forEach(det => {
                    let parsedDet = processTextWithCitations(det.content);
                    parsedDet.refs.forEach(r => secRefs.add(r));
                    
                    html += `<div class="accordion-item acc-detalles">
                        <div class="accordion-header" onclick="toggleClass(this)">
                            <span>${sanitizeHTML(det.title)}</span>
                            <span class="chevron" style="font-size:0.8rem; opacity:0.7;">▼</span>
                        </div>
                        <div class="accordion-content">
                            <div class="accordion-content-inner"><p>${parsedDet.text}</p></div>
                        </div>
                    </div>`;
                });
                html += `</div>`;
            }

            if (secRefs.size > 0) {
                let refsArray = Array.from(secRefs).sort((a,b) => parseInt(a) - parseInt(b));
                html += `<div style="font-style:italic; font-size:0.85rem; color:var(--text-muted); margin-bottom:32px; border-top: 1px dashed var(--border-subtle); padding-top: 8px;">Referencias: ${refsArray.join(', ')}</div>`;
            }
        });
    }
    html += `</div>`; 

    if (data.checklistClave && data.checklistClave.length > 0) {
        const savedChecked = (topic.data && Array.isArray(topic.data.checklistChecked)) ? topic.data.checklistChecked : [];

        html += `
        <div class="checklist-box">
            <div class="checklist-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Conceptos Clave para Ejercicios
            </div>
            <div style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 16px;">Marca la casilla izquierda al comprender el concepto. Haz clic en el texto para expandir.</div>
        `;
        data.checklistClave.forEach((item, itemIdx) => {
            let title = "", subtitle = "";
            if (typeof item === 'string') {
                let parsedStr = processTextWithCitations(item);
                let text = parsedStr.text;
                let splitIdx = -1;
                let insideMath = false;
                let braceDepth = 0;

                for (let k = 0; k < text.length; k++) {
                    let ch = text[k];
                    if (ch === '$') {
                        insideMath = !insideMath;
                    } else if (ch === '{') {
                        braceDepth++;
                    } else if (ch === '}') {
                        if (braceDepth > 0) braceDepth--;
                    } else if (ch === ':' && !insideMath && braceDepth === 0) {
                        splitIdx = k;
                        break;
                    }
                }

                if (splitIdx > -1) {
                    title = text.substring(0, splitIdx).trim();
                    subtitle = text.substring(splitIdx + 1).trim();
                } else {
                    title = text; 
                    subtitle = "Haz clic en el cuadro para marcar este concepto.";
                }
            } else if (item && typeof item === 'object') {
                title = processTextWithCitations(item.title || item.concepto || '').text;
                subtitle = processTextWithCitations(item.subtitle || item.descripcion || item.content || '').text;
            }

            const isChecked = savedChecked.includes(itemIdx) ? 'checked' : '';

            html += `
            <div class="checklist-item-wrapper ${isChecked}" id="checklist-item-${itemIdx}">
                <div style="display:flex; align-items:flex-start; gap:12px;">
                    <div class="checklist-checkbox" onclick="toggleChecklistItem(${itemIdx})"></div>
                    <div style="flex:1;">
                        <div class="checklist-header" onclick="this.closest('.checklist-item-wrapper').classList.toggle('expanded')">
                            <span class="checklist-title-span">${title}</span>
                            <span class="chevron" style="color:var(--text-muted); font-size:0.8rem; transition:transform 0.2s;">▼</span>
                        </div>
                        <div class="checklist-body">
                            <div class="checklist-body-inner">${subtitle}</div>
                        </div>
                    </div>
                </div>
            </div>`;
        });
        html += `</div>`;
    }

    document.getElementById('exercise-content').innerHTML = html;
    forceMathRender();
}

function toggleChecklistItem(index) {
    const subject = appDB.subjects.find(s => s.id === activeSubjectId);
    const topic = subject ? subject.topics.find(t => t.id === activeTopicId) : null;
    if (!topic || !topic.data) return;
    if (!Array.isArray(topic.data.checklistChecked)) {
        topic.data.checklistChecked = [];
    }
    const pos = topic.data.checklistChecked.indexOf(index);
    if (pos > -1) {
        topic.data.checklistChecked.splice(pos, 1);
    } else {
        topic.data.checklistChecked.push(index);
    }
    saveDB();
    const el = document.getElementById(`checklist-item-${index}`);
    if (el) {
        el.classList.toggle('checked');
    }
}

function setMasteryStatus(index, status) {
    const subject = appDB.subjects.find(s => s.id === activeSubjectId);
    const topic = subject ? subject.topics.find(t => t.id === activeTopicId) : null;
    if (!topic || !topic.data || !topic.data.ejercicios || !topic.data.ejercicios[index]) return;

    // Si ya tiene este estado, desmarcarlo (volver a 'none')
    if (topic.data.ejercicios[index].mastery === status) {
        topic.data.ejercicios[index].mastery = 'none';
    } else {
        topic.data.ejercicios[index].mastery = status;
    }

    saveDB();
    renderTopicExercises();
    selectExercise(index);
}

function revealExamSolution(index) {
    revealedExercisesInExam.add(index);
    selectExercise(index);
}

function selectExercise(index) {
    if (typeof closeMobileSidebar === 'function' && (typeof isMobileOrLandscapeDrawer === 'function' ? isMobileOrLandscapeDrawer() : window.innerWidth <= 768)) {
        closeMobileSidebar();
    }
    currentExerciseIndex = index;
    document.querySelectorAll('.exercise-card').forEach(c => c.classList.remove('active'));
    const card = document.getElementById(`card-ex-${index}`);
    if (card) card.classList.add('active');

    const subject = appDB.subjects.find(s => s.id === activeSubjectId);
    const topic = subject ? subject.topics.find(t => t.id === activeTopicId) : null;
    const data = topic && topic.data && topic.data.ejercicios ? topic.data.ejercicios[index] : null;

    if (!data) return;

    const currentMastery = data.mastery || 'none';
    const isRevealed = !isExamMode || revealedExercisesInExam.has(index);

    let html = `
        <div class="exercise-header-top">
            <h1 class="main-title">${sanitizeHTML(data.title)}</h1>
            <div class="header-action-pills">
                <div class="mastery-selector">
                    <span style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">Dominio:</span>
                    <button class="mastery-pill ${currentMastery === 'mastered' ? 'active-mastered' : ''}" onclick="setMasteryStatus(${index}, 'mastered')" title="Marcar como Dominado">🟢 Dominado</button>
                    <button class="mastery-pill ${currentMastery === 'review' ? 'active-review' : ''}" onclick="setMasteryStatus(${index}, 'review')" title="Marcar para Repasar">🟡 Repasar</button>
                    <button class="mastery-pill ${currentMastery === 'doubt' ? 'active-doubt' : ''}" onclick="setMasteryStatus(${index}, 'doubt')" title="Duda para Tutoría">🔴 Duda</button>
                </div>
                <button class="btn btn-secondary print-action-btn" onclick="printStudySheet()" title="Exportar o Imprimir Chuleta">🖨️ Chuleta</button>
            </div>
        </div>
    `;

    // Banner de Modo Examen
    if (isExamMode) {
        html += `
            <div class="exam-banner">
                <div class="exam-banner-icon">🎯</div>
                <div class="exam-banner-text">
                    <strong>Modo Examen / Práctica Activo</strong>
                    <div>Intenta resolver el ejercicio en tu libreta antes de consultar la solución.</div>
                </div>
            </div>
        `;
    }
    
    // Pistas de Identificación (siempre visibles para orientar el planteamiento)
    if (data.identificacion && data.identificacion.length > 0) {
        html += `<div class="section-card"><div class="section-title">🎯 Identificación del Problema</div>${buildList(data.identificacion)}</div>`;
    }

    // Si está en Modo Examen y aún NO se ha revelado la solución
    if (isExamMode && !isRevealed) {
        html += `
            <div class="exam-reveal-card">
                <div style="font-size:1.15rem; font-weight:800; color:var(--text-heading); margin-bottom:8px;">¿Has intentado resolver el ejercicio?</div>
                <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:20px; line-height:1.5;">Tómate unos minutos para plantear las ecuaciones. Cuando termines, pulsa para comprobar si tu algoritmo coincide.</p>
                <button class="btn btn-primary" onclick="revealExamSolution(${index})">👁️ Revelar Algoritmo y Solución</button>
            </div>
        `;
    } else {
        // Vista normal o examen revelado
        if (data.algoritmo && data.algoritmo.length > 0) {
            html += `<div class="section-card"><div class="section-title">⚙️ Algoritmo Paso a Paso</div><div class="steps-container">`;
            data.algoritmo.forEach((step, idx) => {
                html += `
                    <div class="step-block ${isExamMode ? 'open' : ''}">
                        <div class="step-header" onclick="toggleClass(this)">
                            <div class="step-number">${idx + 1}</div>
                            <div class="step-text">
                                <div class="step-title-text">${sanitizeHTML(step.title)}</div>
                                <div class="step-subtitle">${sanitizeHTML(step.subtitle)}</div>
                            </div>
                            <span class="chevron" style="font-size:0.8rem; color:var(--text-muted); transition:transform 0.2s;">▼</span>
                        </div>
                        <div class="step-content">
                            <div class="step-content-inner">${sanitizeHTML(step.example)}</div>
                        </div>
                    </div>`;
            });
            html += `</div></div>`;
        }

        if (data.ejemploCompleto) {
            html += `<div class="section-card"><div class="section-title">📝 Ejemplo Resuelto Integral</div>
                     <div class="example-box">${sanitizeHTML(data.ejemploCompleto)}</div></div>`;
        }

        if (data.variaciones && data.variaciones.length > 0) {
            html += `<div class="section-card"><div class="section-title" style="color:var(--c-var)">🔄 Variaciones</div>${buildAccordions(data.variaciones, 'acc-variaciones')}</div>`;
        }
        if (data.trucos && data.trucos.length > 0) {
            html += `<div class="section-card"><div class="section-title" style="color:var(--c-truco)">💡 Trucos</div>${buildAccordions(data.trucos, 'acc-trucos')}</div>`;
        }
        if (data.errores && data.errores.length > 0) {
            html += `<div class="section-card"><div class="section-title" style="color:var(--c-error)">❌ Errores Comunes</div>${buildAccordions(data.errores, 'acc-errores')}</div>`;
        }
        if (data.trampas && data.trampas.length > 0) {
            html += `<div class="section-card"><div class="section-title" style="color:var(--c-trampa)">⚠️ Trampas</div>${buildAccordions(data.trampas, 'acc-trampas')}</div>`;
        }
        if (data.ejerciciosPropuestos && data.ejerciciosPropuestos.length > 0) {
            html += `<div class="section-card"><div class="section-title">📚 Ejercicios Propuestos</div>${buildPropuestos(data.ejerciciosPropuestos)}</div>`;
        }

        // Si estamos en Modo Examen y se acaba de revelar la solución, mostrar barra de autoevaluación
        if (isExamMode) {
            html += `
                <div class="exam-eval-bar">
                    <span style="font-weight:700; color:var(--text-heading);">Autoevaluación:</span>
                    <button class="eval-btn doubt" onclick="setMasteryStatus(${index}, 'doubt')">❌ Tuve fallos (Duda)</button>
                    <button class="eval-btn review" onclick="setMasteryStatus(${index}, 'review')">⚠️ Dudé en un paso (Repasar)</button>
                    <button class="eval-btn mastered" onclick="setMasteryStatus(${index}, 'mastered')">✅ Resuelto perfecto (Dominado)</button>
                </div>
            `;
        }
    }

    document.getElementById('exercise-content').innerHTML = html;
    forceMathRender();
}

function buildList(items) {
    if (!items || items.length === 0) return '';
    return `<ul class="ident-list">${items.map(item => `<li>${sanitizeHTML(item)}</li>`).join('')}</ul>`;
}

function buildAccordions(items, typeClass) {
    if (!items || items.length === 0) return '';
    return items.map(item => {
        let boxes = '';
        if (item.fix) boxes += `<div class="action-box"><strong>Desarrollo / Solución:</strong><br><br>${sanitizeHTML(item.fix)}</div>`;
        if (item.example) boxes += `<div class="action-box" style="margin-top:12px; background:var(--step-content-bg)"><strong>Ejemplo:</strong><br><br>${sanitizeHTML(item.example)}</div>`;
        return `
        <div class="accordion-item ${typeClass}">
            <div class="accordion-header" onclick="toggleClass(this)">
                <span>${sanitizeHTML(item.title)}</span>
                <span class="chevron" style="font-size:0.8rem; transition:transform 0.2s;">▼</span>
            </div>
            <div class="accordion-content">
                <div class="accordion-content-inner">
                    <p>${sanitizeHTML(item.content)}</p>
                    ${boxes}
                </div>
            </div>
        </div>`;
    }).join('');
}

function buildPropuestos(items) {
    if (!items || items.length === 0) return '';
    return items.map((item, idx) => `
        <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-left:4px solid var(--primary); border-radius:10px; margin-bottom:16px; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                <strong style="color:var(--text-heading); font-size:1.05rem;">${idx + 1}. ${sanitizeHTML(item.ref)}</strong>
                <span class="prob-badge low">${sanitizeHTML(item.nota)}</span>
            </div>
            <div style="color:var(--text-body); font-size:0.95rem; line-height:1.6;">${sanitizeHTML(item.enunciado)}</div>
        </div>
    `).join('');
}

function printStudySheet() {
    if (!activeSubjectId || !activeTopicId) {
        customAlert("Selecciona una Asignatura y un Tema para exportar o imprimir la chuleta de estudio.");
        return;
    }

    // Abrir todos los bloques colapsables para la impresión
    document.querySelectorAll('.accordion-item').forEach(el => el.classList.add('open'));
    document.querySelectorAll('.step-block').forEach(el => el.classList.add('open'));
    document.querySelectorAll('.checklist-item-wrapper').forEach(el => el.classList.add('expanded'));

    if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise().then(() => {
            window.print();
        }).catch(() => {
            window.print();
        });
    } else {
        window.print();
    }
}
