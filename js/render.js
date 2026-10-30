/**
 * Vistas, Renderizado de Componentes, Simulador de Examen y Generador de Chuletas
 * Cero emojis: Sistema de iconografía 100% SVG monocolor de línea fina.
 */

const icons = {
    edit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
    plus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    chevronDown: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
    bookOpen: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
    target: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
    layers: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
    fileText: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`,
    gitBranch: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>`,
    zap: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
    xCircle: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
    alertTriangle: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    checkCircle: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    clock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    helpCircle: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    eye: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    play: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
    pause: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`,
    rotateCcw: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>`,
    shuffle: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>`,
    key: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>`,
    unlock: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>`
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
                <span class="option-text">${sanitizeHTML(subj.name)}</span>
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
                    <span class="option-text">${sanitizeHTML(top.name)}</span>
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
    if (typeof stopExamTimer === 'function') {
        stopExamTimer();
    }
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

    const counts = {
        all: allExercises.length,
        mastered: allExercises.filter(e => e.mastery === 'mastered').length,
        review: allExercises.filter(e => e.mastery === 'review').length,
        doubt: allExercises.filter(e => e.mastery === 'doubt').length
    };

    // Barra de filtros de dominio sin emojis (puntos de luz geométricos limpios)
    if (allExercises.length > 0) {
        exList.innerHTML += `
            <div class="mastery-filter-bar">
                <button class="filter-pill ${currentMasteryFilter === 'all' ? 'active' : ''}" onclick="setMasteryFilter('all')" title="Ver todos los ejercicios">
                    <span>Todos (${counts.all})</span>
                </button>
                <button class="filter-pill ${currentMasteryFilter === 'mastered' ? 'active' : ''}" onclick="setMasteryFilter('mastered')" title="Ejercicios dominados">
                    <span class="status-pip mastered"></span>
                    <span>${counts.mastered}</span>
                </button>
                <button class="filter-pill ${currentMasteryFilter === 'review' ? 'active' : ''}" onclick="setMasteryFilter('review')" title="Ejercicios para repasar">
                    <span class="status-pip review"></span>
                    <span>${counts.review}</span>
                </button>
                <button class="filter-pill ${currentMasteryFilter === 'doubt' ? 'active' : ''}" onclick="setMasteryFilter('doubt')" title="Ejercicios con dudas">
                    <span class="status-pip doubt"></span>
                    <span>${counts.doubt}</span>
                </button>
            </div>
        `;
    }

    // Tarjeta de Teoría (sutilmente diferenciada pero sin parecer seleccionada cuando no lo está)
    if (topic.data.teoria && currentMasteryFilter === 'all') {
        const theoryMastery = topic.data.teoria.mastery || 'none';
        let theoryMasteryClass = '';
        if (theoryMastery === 'mastered') theoryMasteryClass = 'mastery-mastered';
        else if (theoryMastery === 'review') theoryMasteryClass = 'mastery-review';
        else if (theoryMastery === 'doubt') theoryMasteryClass = 'mastery-doubt';

        exList.innerHTML += `
            <div class="exercise-card theory-card ${theoryMasteryClass}" id="card-theory" onclick="selectTheory()">
                <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0;">
                    <div class="theory-icon-badge">${icons.bookOpen}</div>
                    <div class="card-info">
                        <span class="card-title">Teoría del Tema</span>
                        <span class="card-meta">Fundamentos y conceptos clave</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="act-btn delete" onclick="deleteItem('theory', null, event)" title="Eliminar Teoría">${icons.trash}</button>
                </div>
            </div>
        `;
    }

    // Tarjetas de Ejercicios con degradado lateral derecho según estado de dominio (sin emojis ni porcentajes)
    let renderedCount = 0;
    allExercises.forEach((ex, idx) => {
        const exMastery = ex.mastery || 'none';
        if (currentMasteryFilter !== 'all' && exMastery !== currentMasteryFilter) {
            return;
        }

        renderedCount++;
        let masteryClass = '';
        if (exMastery === 'mastered') masteryClass = 'mastery-mastered';
        else if (exMastery === 'review') masteryClass = 'mastery-review';
        else if (exMastery === 'doubt') masteryClass = 'mastery-doubt';
        
        exList.innerHTML += `
            <div class="exercise-card ${masteryClass}" id="card-ex-${idx}" onclick="selectExercise(${idx})">
                <div class="card-info">
                    <span class="card-title">${sanitizeHTML(ex.title)}</span>
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

    // Selección inicial
    if (isExamMode) {
        startExamSimulatorSession(examSimState.mode || 'blind', examSimState.scope || 'topic');
    } else if (topic.data.teoria && currentMasteryFilter === 'all') {
        selectTheory();
    } else if (allExercises.length > 0) {
        selectExercise(0);
    } else {
        setEmptyState('Tema vacío. Usa el botón "+" de la barra lateral para importar JSON (teoría, ejercicios o tema) o genera con IA.');
    }

    forceMathRender([exList]);
}

function selectTheory() {
    if (isExamMode) {
        isExamMode = false;
        localStorage.setItem(EXAM_MODE_KEY, 'false');
        updateExamModeUI();
        stopExamTimer();
    }

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
    
    const currentTheoryMastery = (data && data.mastery) || 'none';

    let html = `<div class="exercise-header-top">
        <h1 class="main-title">${sanitizeHTML(data.title) || 'Conceptos Teóricos'}</h1>
        <div class="header-action-pills">
            <div class="mastery-selector">
                <span class="mastery-selector-label">Nivel</span>
                <button class="mastery-pill ${currentTheoryMastery === 'mastered' ? 'active-mastered' : ''}" onclick="setTheoryMasteryStatus('mastered')" title="Marcar como Perfecto (Verde)">
                    ${icons.checkCircle}
                    <span>Perfecto</span>
                </button>
                <button class="mastery-pill ${currentTheoryMastery === 'review' ? 'active-review' : ''}" onclick="setTheoryMasteryStatus('review')" title="Marcar como Regular (Ámbar)">
                    ${icons.clock}
                    <span>Regular</span>
                </button>
                <button class="mastery-pill ${currentTheoryMastery === 'doubt' ? 'active-doubt' : ''}" onclick="setTheoryMasteryStatus('doubt')" title="Marcar como Mal (Rojo)">
                    ${icons.helpCircle}
                    <span>Mal</span>
                </button>
            </div>
        </div>
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
                    let parsedDet = processTextWithCitations(det.content || det.contenido || '');
                    parsedDet.refs.forEach(r => secRefs.add(r));
                    
                    html += `<div class="accordion-item acc-detalles">
                        <div class="accordion-header" onclick="toggleClass(this)">
                            <span>${sanitizeHTML(det.title || det.titulo || 'Detalle')}</span>
                            <span class="chevron">${icons.chevronDown}</span>
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
                html += `<div style="font-style:italic; font-size:0.84rem; color:var(--text-muted); margin-bottom:30px; border-top: 1px dashed var(--border-subtle); padding-top: 8px;">Referencias: ${refsArray.join(', ')}</div>`;
            }
        });
    }
    html += `</div>`; 

    if (data.checklistClave && data.checklistClave.length > 0) {
        const savedChecked = (topic.data && Array.isArray(topic.data.checklistChecked)) ? topic.data.checklistChecked : [];

        html += `
        <div class="checklist-box">
            <div class="checklist-title">
                ${icons.checkCircle}
                <span>Conceptos Clave para Ejercicios</span>
            </div>
            <div style="color: var(--text-muted); font-size: 0.84rem; margin-bottom: 16px;">Marca la casilla izquierda al dominar el concepto. Pulsa sobre cualquier concepto para desplegar su demostración o fórmula matemática.</div>
        `;
        data.checklistClave.forEach((item, itemIdx) => {
            let title = '', subtitle = '';
            if (typeof item === 'string') {
                const parts = splitChecklistStringSafely(item);
                title = sanitizeHTML(parts.title);
                subtitle = parts.subtitle
                    ? sanitizeHTML(parts.subtitle)
                    : 'Concepto fundamental verificado para la resolución de problemas de examen.';
            } else if (item && typeof item === 'object') {
                const rawT = item.title || item.titulo || item.concepto || item.nombre || item.pregunta || `Concepto ${itemIdx + 1}`;
                const rawS = item.subtitle || item.subtitulo || item.descripcion || item.content || item.contenido || item.explicacion || item.detalle || item.respuesta || '';
                title = sanitizeHTML(rawT);
                subtitle = rawS ? sanitizeHTML(rawS) : title;
            }

            const isChecked = savedChecked.includes(itemIdx) ? 'checked' : '';

            html += `
            <div class="checklist-item-wrapper ${isChecked}" id="checklist-item-${itemIdx}">
                <div style="display:flex; align-items:flex-start; gap:12px;">
                    <div class="checklist-checkbox" onclick="toggleChecklistItem(${itemIdx})"></div>
                    <div style="flex:1; min-width:0;">
                        <div class="checklist-header" onclick="toggleChecklistExpand(this)">
                            <span class="checklist-title-span">${title}</span>
                            <span class="chevron">${icons.chevronDown}</span>
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

    const contentContainer = document.getElementById('exercise-content');
    if (contentContainer) {
        contentContainer.innerHTML = html;
        forceMathRender([contentContainer]);
    }
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

function setTheoryMasteryStatus(status) {
    const subject = appDB.subjects.find(s => s.id === activeSubjectId);
    const topic = subject ? subject.topics.find(t => t.id === activeTopicId) : null;
    if (!topic || !topic.data || !topic.data.teoria) return;

    if (topic.data.teoria.mastery === status) {
        topic.data.teoria.mastery = 'none';
    } else {
        topic.data.teoria.mastery = status;
    }

    saveDB();
    renderTopicExercises();
    selectTheory();
}

function setMasteryStatus(index, status) {
    const subject = appDB.subjects.find(s => s.id === activeSubjectId);
    const topic = subject ? subject.topics.find(t => t.id === activeTopicId) : null;
    if (!topic || !topic.data || !topic.data.ejercicios || !topic.data.ejercicios[index]) return;

    if (topic.data.ejercicios[index].mastery === status) {
        topic.data.ejercicios[index].mastery = 'none';
    } else {
        topic.data.ejercicios[index].mastery = status;
    }

    saveDB();
    renderTopicExercises();
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

    // Si estamos en Modo Examen, sincronizar el simulador con este ejercicio si está en modo guiado
    if (isExamMode) {
        const posInQueue = examSimState.queue.findIndex(q => q.topicId === activeTopicId && q.exIndex === index);
        if (posInQueue !== -1) {
            examSimState.currentPos = posInQueue;
            renderExamSimulator();
            return;
        } else {
            startExamSimulatorSession(examSimState.mode || 'guided', 'topic', index);
            return;
        }
    }

    const subject = appDB.subjects.find(s => s.id === activeSubjectId);
    const topic = subject ? subject.topics.find(t => t.id === activeTopicId) : null;
    const data = topic && topic.data && topic.data.ejercicios ? topic.data.ejercicios[index] : null;

    if (!data) return;

    const currentMastery = (data && data.mastery) || 'none';

    let html = `
        <div class="exercise-header-top">
            <h1 class="main-title">${sanitizeHTML(data.title)}</h1>
            <div class="header-action-pills">
                <div class="mastery-selector">
                    <span class="mastery-selector-label">Nivel</span>
                    <button class="mastery-pill ${currentMastery === 'mastered' ? 'active-mastered' : ''}" onclick="setMasteryStatus(${index}, 'mastered')" title="Marcar como Perfecto (Verde)">
                        ${icons.checkCircle}
                        <span>Perfecto</span>
                    </button>
                    <button class="mastery-pill ${currentMastery === 'review' ? 'active-review' : ''}" onclick="setMasteryStatus(${index}, 'review')" title="Marcar como Regular (Ámbar)">
                        ${icons.clock}
                        <span>Regular</span>
                    </button>
                    <button class="mastery-pill ${currentMastery === 'doubt' ? 'active-doubt' : ''}" onclick="setMasteryStatus(${index}, 'doubt')" title="Marcar como Mal (Rojo)">
                        ${icons.helpCircle}
                        <span>Mal</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    if (data.identificacion && data.identificacion.length > 0) {
        html += `<div class="section-card"><div class="section-title">${icons.target}<span>Identificación del Problema</span></div>${buildList(data.identificacion)}</div>`;
    }

    if (data.algoritmo && data.algoritmo.length > 0) {
        html += `<div class="section-card"><div class="section-title">${icons.layers}<span>Algoritmo Paso a Paso</span></div><div class="steps-container">`;
        data.algoritmo.forEach((step, idx) => {
            html += `
                <div class="step-block">
                    <div class="step-header" onclick="toggleClass(this)">
                        <div class="step-number">${idx + 1}</div>
                        <div class="step-text">
                            <div class="step-title-text">${sanitizeHTML(step.title)}</div>
                            <div class="step-subtitle">${sanitizeHTML(step.subtitle)}</div>
                        </div>
                        <span class="chevron">${icons.chevronDown}</span>
                    </div>
                    <div class="step-content">
                        <div class="step-content-inner">${sanitizeHTML(step.example)}</div>
                    </div>
                </div>`;
        });
        html += `</div></div>`;
    }

    if (data.ejemploCompleto) {
        html += `<div class="section-card"><div class="section-title">${icons.fileText}<span>Ejemplo Resuelto Integral</span></div>
                 <div class="example-box">${sanitizeHTML(data.ejemploCompleto)}</div></div>`;
    }

    if (data.variaciones && data.variaciones.length > 0) {
        html += `<div class="section-card"><div class="section-title">${icons.gitBranch}<span>Variaciones de Examen</span></div>${buildAccordions(data.variaciones, 'acc-variaciones')}</div>`;
    }
    if (data.trucos && data.trucos.length > 0) {
        html += `<div class="section-card"><div class="section-title">${icons.zap}<span>Trucos y Atajos</span></div>${buildAccordions(data.trucos, 'acc-trucos')}</div>`;
    }
    if (data.errores && data.errores.length > 0) {
        html += `<div class="section-card"><div class="section-title">${icons.xCircle}<span>Errores Comunes</span></div>${buildAccordions(data.errores, 'acc-errores')}</div>`;
    }
    if (data.trampas && data.trampas.length > 0) {
        html += `<div class="section-card"><div class="section-title">${icons.alertTriangle}<span>Trampas de Examen</span></div>${buildAccordions(data.trampas, 'acc-trampas')}</div>`;
    }
    if (data.ejerciciosPropuestos && data.ejerciciosPropuestos.length > 0) {
        html += `<div class="section-card"><div class="section-title">${icons.bookOpen}<span>Ejercicios Propuestos de Examen</span></div>${buildPropuestos(data.ejerciciosPropuestos)}</div>`;
    }

    const contentContainer = document.getElementById('exercise-content');
    if (contentContainer) {
        contentContainer.innerHTML = html;
        forceMathRender([contentContainer]);
    }
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
                <span class="chevron">${icons.chevronDown}</span>
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
        <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-left:4px solid var(--primary); border-radius:10px; margin-bottom:14px; padding:18px 20px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; gap:10px;">
                <strong style="color:var(--text-heading); font-size:0.96rem;">${idx + 1}. ${sanitizeHTML(item.ref)}</strong>
                ${item.nota ? `<span style="font-size:0.74rem; font-weight:700; color:var(--primary); background:var(--primary-bg); padding:2px 8px; border-radius:6px; white-space:nowrap;">${sanitizeHTML(item.nota)}</span>` : ''}
            </div>
            <div style="color:var(--text-body); font-size:0.93rem; line-height:1.65;">${sanitizeHTML(item.enunciado)}</div>
        </div>
    `).join('');
}

/* ==========================================================================
   SIMULADOR DE EXAMEN UNIVERSITARIO E INTERACTIVO
   ========================================================================== */

function extractStatementsFromExercise(exData) {
    const statements = [];

    // 1. Si tiene ejerciciosPropuestos reales de examen, añadirlos como enunciados practicables
    if (Array.isArray(exData.ejerciciosPropuestos) && exData.ejerciciosPropuestos.length > 0) {
        exData.ejerciciosPropuestos.forEach((prop, idx) => {
            if (prop && prop.enunciado) {
                statements.push({
                    label: prop.ref ? prop.ref : `Problema de Examen ${idx + 1}`,
                    weight: prop.nota || '',
                    promptHtml: sanitizeHTML(prop.enunciado),
                    fullSolutionHtml: exData.ejemploCompleto ? sanitizeHTML(exData.ejemploCompleto) : ''
                });
            }
        });
    }

    // 2. Extraer enunciado del ejemploCompleto (separando el planteamiento inicial de la resolución si es posible)
    if (exData.ejemploCompleto) {
        const raw = exData.ejemploCompleto;
        let promptPart = '';
        // Intentar cortar antes del primer <span class="step-ref"> o "Paso 1" o "Resolución:" o "Solución:"
        const splitMatch = raw.match(/(\<span class=["']step-ref["']\>|\<strong\>\s*(?:Paso\s*1|Resoluci[oó]n|Soluci[oó]n)|(?:<br\s*\/?>|\n)\s*(?:Paso\s*1|Resoluci[oó]n|Soluci[oó]n)\s*[:\-])/i);
        if (splitMatch && splitMatch.index > 20) {
            promptPart = raw.substring(0, splitMatch.index).trim();
        } else {
            // Tomar el primer párrafo o las primeras 2 frases largas
            const brSplit = raw.split(/(?:<br\s*\/?>\s*){2,}|\n\s*\n/);
            if (brSplit.length > 1 && brSplit[0].length > 20) {
                promptPart = brSplit[0].trim();
            } else {
                promptPart = raw;
            }
        }

        statements.unshift({
            label: 'Caso Práctico Principal',
            weight: exData.probabilidad ? `Frecuencia: ${exData.probabilidad}%` : '',
            promptHtml: sanitizeHTML(promptPart),
            fullSolutionHtml: sanitizeHTML(raw)
        });
    }

    // 3. Fallback si el ejercicio no tenía ni ejemploCompleto ni propuestos
    if (statements.length === 0) {
        const fallbackPrompt = (exData.algoritmo && exData.algoritmo.length > 0)
            ? `Plantea y desarrolla el método de resolución completo para: <strong>${sanitizeHTML(exData.title)}</strong>.`
            : `Resuelve un problema tipo de: <strong>${sanitizeHTML(exData.title)}</strong>.`;
        statements.push({
            label: 'Planteamiento General',
            weight: '',
            promptHtml: fallbackPrompt,
            fullSolutionHtml: 'Revisa los pasos del algoritmo desbloqueados.'
        });
    }

    return statements;
}

function startExamSimulatorSession(mode = 'blind', scope = 'topic', startExIdx = null) {
    const subject = appDB.subjects.find(s => s.id === activeSubjectId);
    if (!subject) return;

    examSimState.mode = mode;
    examSimState.scope = scope;
    examSimState.queue = [];

    if (scope === 'subject') {
        subject.topics.forEach(t => {
            const exs = (t.data && Array.isArray(t.data.ejercicios)) ? t.data.ejercicios : [];
            exs.forEach((ex, idx) => {
                examSimState.queue.push({
                    subjId: subject.id,
                    topicId: t.id,
                    topicName: t.name,
                    exIndex: idx,
                    exData: ex,
                    statements: extractStatementsFromExercise(ex),
                    selectedStmtIdx: 0,
                    unlockedIdent: false,
                    unlockedStepsCount: 0,
                    unlockedTraps: false,
                    fullRevealed: false,
                    grade: null
                });
            });
        });
    } else {
        const topic = subject.topics.find(t => t.id === activeTopicId) || subject.topics[0];
        if (topic) {
            activeTopicId = topic.id;
            const exs = (topic.data && Array.isArray(topic.data.ejercicios)) ? topic.data.ejercicios : [];
            exs.forEach((ex, idx) => {
                examSimState.queue.push({
                    subjId: subject.id,
                    topicId: topic.id,
                    topicName: topic.name,
                    exIndex: idx,
                    exData: ex,
                    statements: extractStatementsFromExercise(ex),
                    selectedStmtIdx: 0,
                    unlockedIdent: false,
                    unlockedStepsCount: 0,
                    unlockedTraps: false,
                    fullRevealed: false,
                    grade: null
                });
            });
        }
    }

    // Si es modo Simulacro a Ciegas y no se forzó un ejercicio concreto, barajar el orden para entrenamiento real
    if (mode === 'blind' && startExIdx === null && examSimState.queue.length > 1) {
        for (let i = examSimState.queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [examSimState.queue[i], examSimState.queue[j]] = [examSimState.queue[j], examSimState.queue[i]];
        }
    }

    if (startExIdx !== null) {
        const foundPos = examSimState.queue.findIndex(q => q.exIndex === startExIdx);
        examSimState.currentPos = foundPos !== -1 ? foundPos : 0;
    } else {
        examSimState.currentPos = 0;
    }

    resetExamTimer(true);
    renderExamSimulator();
}

function formatExamTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function startExamTimer() {
    if (examSimState.timerInterval) clearInterval(examSimState.timerInterval);
    examSimState.timerRunning = true;
    examSimState.timerInterval = setInterval(() => {
        examSimState.timerSeconds++;
        const disp = document.getElementById('examTimerDisplay');
        if (disp) disp.innerText = formatExamTime(examSimState.timerSeconds);
    }, 1000);
    updateExamTimerButtonsUI();
}

function stopExamTimer() {
    if (examSimState.timerInterval) {
        clearInterval(examSimState.timerInterval);
        examSimState.timerInterval = null;
    }
    examSimState.timerRunning = false;
    updateExamTimerButtonsUI();
}

function toggleExamTimer() {
    if (examSimState.timerRunning) stopExamTimer();
    else startExamTimer();
}

function resetExamTimer(autoStart = true) {
    stopExamTimer();
    examSimState.timerSeconds = 0;
    const disp = document.getElementById('examTimerDisplay');
    if (disp) disp.innerText = '00:00';
    if (autoStart) startExamTimer();
}

function updateExamTimerButtonsUI() {
    const toggleBtn = document.getElementById('examTimerToggleBtn');
    if (toggleBtn) {
        toggleBtn.innerHTML = examSimState.timerRunning ? icons.pause : icons.play;
        toggleBtn.title = examSimState.timerRunning ? 'Pausar cronómetro' : 'Reanudar cronómetro';
    }
}

function jumpToExamQuestion(pos) {
    if (pos < 0 || pos >= examSimState.queue.length) return;
    examSimState.currentPos = pos;
    const item = examSimState.queue[pos];
    if (item && item.topicId === activeTopicId) {
        document.querySelectorAll('.exercise-card').forEach(c => c.classList.remove('active'));
        const card = document.getElementById(`card-ex-${item.exIndex}`);
        if (card) card.classList.add('active');
    }
    renderExamSimulator();
}

function selectExamStatementVariant(stmtIdx) {
    const item = examSimState.queue[examSimState.currentPos];
    if (!item) return;
    item.selectedStmtIdx = stmtIdx;
    renderExamSimulator();
}

function unlockExamIdent() {
    const item = examSimState.queue[examSimState.currentPos];
    if (!item) return;
    item.unlockedIdent = true;
    renderExamSimulator();
}

function unlockNextExamStep() {
    const item = examSimState.queue[examSimState.currentPos];
    if (!item) return;
    const totalSteps = (item.exData.algoritmo || []).length;
    if (item.unlockedStepsCount < totalSteps) {
        item.unlockedStepsCount++;
    }
    renderExamSimulator();
}

function unlockExamTraps() {
    const item = examSimState.queue[examSimState.currentPos];
    if (!item) return;
    item.unlockedTraps = true;
    renderExamSimulator();
}

function revealFullExamExercise() {
    const item = examSimState.queue[examSimState.currentPos];
    if (!item) return;
    item.fullRevealed = true;
    item.unlockedIdent = true;
    item.unlockedTraps = true;
    item.unlockedStepsCount = (item.exData.algoritmo || []).length;
    renderExamSimulator();
}

function gradeExamQuestion(gradeStatus) {
    const item = examSimState.queue[examSimState.currentPos];
    if (!item) return;
    item.grade = gradeStatus;

    // Actualizar dominio real en la base de datos
    const subj = appDB.subjects.find(s => s.id === item.subjId);
    const top = subj ? subj.topics.find(t => t.id === item.topicId) : null;
    if (top && top.data && top.data.ejercicios && top.data.ejercicios[item.exIndex]) {
        top.data.ejercicios[item.exIndex].mastery = gradeStatus;
        saveDB();
    }

    // Actualizar color de la tarjeta en el sidebar sin perder el estado del simulador
    const card = document.getElementById(`card-ex-${item.exIndex}`);
    if (card) {
        card.classList.remove('mastery-mastered', 'mastery-review', 'mastery-doubt');
        if (gradeStatus === 'mastered') card.classList.add('mastery-mastered');
        else if (gradeStatus === 'review') card.classList.add('mastery-review');
        else if (gradeStatus === 'doubt') card.classList.add('mastery-doubt');
    }

    // Si hay un siguiente problema pendiente, avanzar automáticamente tras 220ms
    if (examSimState.currentPos < examSimState.queue.length - 1) {
        examSimState.currentPos++;
    }
    renderExamSimulator();
}

function computeExamSessionScore() {
    const graded = examSimState.queue.filter(q => q.grade !== null);
    if (graded.length === 0) return { gradedCount: 0, scoreOut10: '—' };
    let pts = 0;
    graded.forEach(q => {
        if (q.grade === 'mastered') pts += 10;
        else if (q.grade === 'review') pts += 6;
        else pts += 0;
    });
    const avg = (pts / graded.length).toFixed(1);
    return { gradedCount: graded.length, scoreOut10: avg };
}

function renderExamSimulator() {
    const contentContainer = document.getElementById('exercise-content');
    if (!contentContainer) return;

    if (!examSimState.queue || examSimState.queue.length === 0) {
        contentContainer.innerHTML = `
            <div class="empty-state">
                ${icons.target}
                <h3>Sin Ejercicios para el Simulacro</h3>
                <p>Este tema aún no tiene ejercicios cargados. Importa ejercicios o cambia a otro tema para practicar.</p>
                <button class="btn btn-secondary" onclick="toggleExamMode()">Volver a Modo Estudio</button>
            </div>
        `;
        return;
    }

    const pos = examSimState.currentPos;
    const item = examSimState.queue[pos];
    const ex = item.exData;
    const totalQ = examSimState.queue.length;
    const totalSteps = (ex.algoritmo || []).length;
    const isBlind = examSimState.mode === 'blind';
    const showRealTitle = !isBlind || item.unlockedIdent || item.fullRevealed;
    const displayTitle = showRealTitle
        ? sanitizeHTML(ex.title)
        : `Problema de Examen #${pos + 1} (Identificación a Ciegas)`;

    const activeStmt = item.statements[item.selectedStmtIdx] || item.statements[0];
    const scoreInfo = computeExamSessionScore();

    let html = `<div class="exam-sim-container">`;

    // 1. Barra Superior de Control del Simulador
    html += `
        <div class="exam-sim-topbar">
            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                <div class="exam-sim-mode-tabs">
                    <button class="exam-sim-tab ${examSimState.mode === 'blind' ? 'active' : ''}" onclick="startExamSimulatorSession('blind', '${examSimState.scope}')" title="Oculta el nombre del método y baraja los problemas como en un examen real">
                        ${icons.shuffle}
                        <span>Simulacro a Ciegas</span>
                    </button>
                    <button class="exam-sim-tab ${examSimState.mode === 'guided' ? 'active' : ''}" onclick="startExamSimulatorSession('guided', '${examSimState.scope}', ${item.exIndex})" title="Practica el ejercicio seleccionado paso a paso">
                        ${icons.layers}
                        <span>Práctica Guiada</span>
                    </button>
                </div>

                <div class="exam-sim-mode-tabs">
                    <button class="exam-sim-tab ${examSimState.scope === 'topic' ? 'active' : ''}" onclick="startExamSimulatorSession('${examSimState.mode}', 'topic')">
                        <span>Tema Actual</span>
                    </button>
                    <button class="exam-sim-tab ${examSimState.scope === 'subject' ? 'active' : ''}" onclick="startExamSimulatorSession('${examSimState.mode}', 'subject')">
                        <span>Toda la Asignatura</span>
                    </button>
                </div>
            </div>

            <div class="exam-sim-controls">
                <div class="exam-timer-widget" title="Tiempo de resolución">
                    ${icons.clock}
                    <span id="examTimerDisplay">${formatExamTime(examSimState.timerSeconds)}</span>
                    <button class="exam-timer-btn" id="examTimerToggleBtn" onclick="toggleExamTimer()">${examSimState.timerRunning ? icons.pause : icons.play}</button>
                    <button class="exam-timer-btn" onclick="resetExamTimer(true)" title="Reiniciar cronómetro">${icons.rotateCcw}</button>
                </div>
                <button class="btn btn-secondary" style="padding:6px 12px; font-size:0.78rem;" onclick="toggleExamMode()">
                    Salir del Examen
                </button>
            </div>
        </div>
    `;

    // 2. Tira de Progreso y Nota Estimada en Vivo
    html += `
        <div class="exam-progress-strip">
            <div class="exam-progress-dots">
                ${examSimState.queue.map((q, qIdx) => {
                    let dotCls = qIdx === pos ? 'current' : '';
                    if (q.grade === 'mastered') dotCls += ' done-mastered';
                    else if (q.grade === 'review') dotCls += ' done-review';
                    else if (q.grade === 'doubt') dotCls += ' done-doubt';
                    return `<button class="exam-q-dot ${dotCls}" onclick="jumpToExamQuestion(${qIdx})" title="Ir al Problema ${qIdx + 1}">${qIdx + 1}</button>`;
                }).join('')}
            </div>
            <div>
                Calificados: <strong>${scoreInfo.gradedCount}/${totalQ}</strong> &nbsp;•&nbsp; Nota media: <strong style="color:var(--primary);">${scoreInfo.scoreOut10} / 10</strong>
            </div>
        </div>
    `;

    // 3. Hoja de Enunciado del Problema de Examen
    html += `
        <div class="exam-problem-sheet">
            <div class="exam-sheet-header">
                <div>
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                        <span class="exam-sheet-badge">${icons.target} Problema ${pos + 1} de ${totalQ}</span>
                        <span style="font-size:0.78rem; color:var(--text-muted); font-weight:600;">${sanitizeHTML(item.topicName)}</span>
                    </div>
                    <h2 style="font-size:1.3rem; font-weight:800; color:var(--text-heading); margin:0;">${displayTitle}</h2>
                </div>

                ${item.statements.length > 1 ? `
                    <div class="exam-statement-selector">
                        ${item.statements.map((st, sIdx) => `
                            <button class="exam-stmt-pill ${item.selectedStmtIdx === sIdx ? 'active' : ''}" onclick="selectExamStatementVariant(${sIdx})">
                                ${sanitizeHTML(st.label)}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>

            <div class="exam-statement-body">
                <div style="font-size:0.74rem; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted); margin-bottom:8px;">
                    Enunciado / Planteamiento del Ejercicio ${activeStmt.weight ? `(${sanitizeHTML(activeStmt.weight)})` : ''}
                </div>
                <div>${activeStmt.promptHtml}</div>
            </div>

            <!-- Botonera de Desbloqueo Progresivo (Pistas y Pasos sin destripar todo de golpe) -->
            <div class="exam-assist-bar">
                <button class="exam-assist-btn" onclick="unlockExamIdent()" ${item.unlockedIdent ? 'disabled' : ''}>
                    ${icons.key}
                    <span>${item.unlockedIdent ? 'Pista de Identificación Desbloqueada' : 'Pista: ¿Cómo identificar este problema?'}</span>
                </button>

                ${totalSteps > 0 ? `
                    <button class="exam-assist-btn" onclick="unlockNextExamStep()" ${item.unlockedStepsCount >= totalSteps ? 'disabled' : ''}>
                        ${icons.unlock}
                        <span>${item.unlockedStepsCount >= totalSteps ? `Todos los pasos desbloqueados (${totalSteps}/${totalSteps})` : `Desbloquear Paso ${item.unlockedStepsCount + 1} de ${totalSteps}`}</span>
                    </button>
                ` : ''}

                ${(ex.trampas && ex.trampas.length > 0) || (ex.errores && ex.errores.length > 0) ? `
                    <button class="exam-assist-btn" onclick="unlockExamTraps()" ${item.unlockedTraps ? 'disabled' : ''}>
                        ${icons.alertTriangle}
                        <span>${item.unlockedTraps ? 'Trampas visibilizadas' : 'Ver Alerta de Trampa'}</span>
                    </button>
                ` : ''}

                <button class="exam-assist-btn primary-reveal" onclick="revealFullExamExercise()" ${item.fullRevealed ? 'disabled' : ''}>
                    ${icons.eye}
                    <span>${item.fullRevealed ? 'Resolución Completa Visible' : 'Comprobar Resolución Completa'}</span>
                </button>
            </div>
        </div>
    `;

    // 4. Área de Pistas y Pasos Desbloqueados Progresivamente
    html += `<div class="exam-unlocked-area">`;

    if (item.unlockedIdent && ex.identificacion && ex.identificacion.length > 0) {
        html += `
            <div class="exam-hint-card">
                <div class="section-title" style="margin-bottom:10px; color:var(--c-var);">
                    ${icons.key}
                    <span>Pista de Identificación — Tipo: ${sanitizeHTML(ex.title)}</span>
                </div>
                ${buildList(ex.identificacion)}
            </div>
        `;
    }

    if (item.unlockedStepsCount > 0 && ex.algoritmo && ex.algoritmo.length > 0) {
        const visibleSteps = ex.algoritmo.slice(0, item.unlockedStepsCount);
        html += `
            <div class="exam-hint-card" style="border-left-color:var(--primary);">
                <div class="section-title" style="margin-bottom:12px;">
                    ${icons.layers}
                    <span>Pasos del Algoritmo Desbloqueados (${item.unlockedStepsCount} de ${totalSteps})</span>
                </div>
                <div class="steps-container">
                    ${visibleSteps.map((step, sIdx) => `
                        <div class="step-block open">
                            <div class="step-header" onclick="toggleClass(this)">
                                <div class="step-number">${sIdx + 1}</div>
                                <div class="step-text">
                                    <div class="step-title-text">${sanitizeHTML(step.title)}</div>
                                    <div class="step-subtitle">${sanitizeHTML(step.subtitle)}</div>
                                </div>
                                <span class="chevron">${icons.chevronDown}</span>
                            </div>
                            <div class="step-content">
                                <div class="step-content-inner">${sanitizeHTML(step.example)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    if (item.unlockedTraps) {
        const trapsAndErrors = [...(ex.trampas || []), ...(ex.errores || [])];
        if (trapsAndErrors.length > 0) {
            html += `
                <div class="exam-hint-card" style="border-left-color:var(--c-trampa);">
                    <div class="section-title" style="margin-bottom:10px; color:var(--c-trampa);">
                        ${icons.alertTriangle}
                        <span>Puntos Ciegos y Trampas a Evitar en el Examen</span>
                    </div>
                    ${buildAccordions(trapsAndErrors, 'acc-trampas')}
                </div>
            `;
        }
    }

    if (item.fullRevealed) {
        if (ex.ejemploCompleto) {
            html += `
                <div class="exam-hint-card" style="border-left-color:var(--c-truco);">
                    <div class="section-title" style="margin-bottom:12px; color:var(--c-truco);">
                        ${icons.fileText}
                        <span>Resolución Matemática Completa</span>
                    </div>
                    <div class="example-box">${sanitizeHTML(ex.ejemploCompleto)}</div>
                </div>
            `;
        }

        if (ex.trucos && ex.trucos.length > 0) {
            html += `
                <div class="exam-hint-card" style="border-left-color:var(--c-truco);">
                    <div class="section-title" style="margin-bottom:10px; color:var(--c-truco);">
                        ${icons.zap}
                        <span>Trucos y Atajos de Examen</span>
                    </div>
                    ${buildAccordions(ex.trucos, 'acc-trucos')}
                </div>
            `;
        }
    }

    html += `</div>`; // Fin de exam-unlocked-area

    // 5. Panel de Calificación y Autoevaluación del Ejercicio
    html += `
        <div class="exam-grading-panel">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <strong style="color:var(--text-heading); font-size:0.95rem;">Califica tu resolución en este problema:</strong>
                <span style="font-size:0.78rem; color:var(--text-muted);">Actualiza automáticamente el estado de dominio y pasa al siguiente problema</span>
            </div>
            <div class="exam-grading-buttons">
                <button class="exam-grade-btn grade-doubt ${item.grade === 'doubt' ? 'selected' : ''}" onclick="gradeExamQuestion('doubt')">
                    <strong>${icons.helpCircle} Fallo o Atascado (0 pts)</strong>
                    <span>Marcar como Duda prioritaria</span>
                </button>
                <button class="exam-grade-btn grade-review ${item.grade === 'review' ? 'selected' : ''}" onclick="gradeExamQuestion('review')">
                    <strong>${icons.clock} Con Pistas / Duda Leve (6 pts)</strong>
                    <span>Marcar para Repasar antes del examen</span>
                </button>
                <button class="exam-grade-btn grade-mastered ${item.grade === 'mastered' ? 'selected' : ''}" onclick="gradeExamQuestion('mastered')">
                    <strong>${icons.checkCircle} Resuelto sin Fallos (10 pts)</strong>
                    <span>Marcar como Dominado</span>
                </button>
            </div>
        </div>
    `;

    html += `</div>`; // Fin de exam-sim-container

    contentContainer.innerHTML = html;
    forceMathRender([contentContainer]);
}

/* ==========================================================================
   GENERADOR DE CHULETA DE ALTA DENSIDAD (MULTI-COLUMNA Y AHORRO DE PÁGINAS)
   ========================================================================== */

let cheatsheetSelectedExercises = null;
let cheatsheetIncludeTheoryCard = true;

function openCheatsheetModal() {
    if (!activeSubjectId || !activeTopicId) {
        customAlert('Selecciona primero una Asignatura y un Tema para generar su chuleta compacta.', 'Selecciona un Tema');
        return;
    }
    const subject = appDB.subjects.find(s => s.id === activeSubjectId);
    const topic = subject ? subject.topics.find(t => t.id === activeTopicId) : null;
    if (!topic || !topic.data) {
        customAlert('Este tema aún no tiene contenido cargado.', 'Tema Vacío');
        return;
    }

    const totalEx = (topic.data.ejercicios || []).length;
    cheatsheetSelectedExercises = new Set(Array.from({ length: totalEx }, (_, i) => i));
    cheatsheetIncludeTheoryCard = true;

    renderCheatsheetSelectorBar(topic);
    renderCheatsheetPreview();
    openModal('cheatsheetModal');
}

function renderCheatsheetSelectorBar(topic) {
    const selectorContainer = document.getElementById('cheatsheetItemSelector');
    if (!selectorContainer) return;

    const ejercicios = topic.data.ejercicios || [];
    let html = `
        <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted); margin-right:4px;">Incluir:</span>
        <button type="button" class="cs-select-pill ${cheatsheetIncludeTheoryCard ? 'active' : ''}" onclick="toggleCheatsheetTheorySelect()">
            <span>Teoría</span>
        </button>
    `;

    ejercicios.forEach((ex, idx) => {
        const isSel = cheatsheetSelectedExercises.has(idx);
        html += `
            <button type="button" class="cs-select-pill ${isSel ? 'active' : ''}" onclick="toggleCheatsheetExSelect(${idx})" title="${sanitizeHTML(ex.title)}">
                <span>Ej. ${idx + 1}</span>
            </button>
        `;
    });

    html += `
        <div style="margin-left:auto; display:flex; gap:6px;">
            <button type="button" class="btn btn-secondary" style="font-size:0.7rem; padding:3px 7px;" onclick="setAllCheatsheetExercises(true)">Todos</button>
            <button type="button" class="btn btn-secondary" style="font-size:0.7rem; padding:3px 7px;" onclick="setAllCheatsheetExercises(false)">Ninguno</button>
        </div>
    `;

    selectorContainer.innerHTML = html;
}

function toggleCheatsheetTheorySelect() {
    cheatsheetIncludeTheoryCard = !cheatsheetIncludeTheoryCard;
    const subject = appDB.subjects.find(s => s.id === activeSubjectId);
    const topic = subject ? subject.topics.find(t => t.id === activeTopicId) : null;
    if (topic) renderCheatsheetSelectorBar(topic);
    renderCheatsheetPreview();
}

function toggleCheatsheetExSelect(idx) {
    if (!cheatsheetSelectedExercises) cheatsheetSelectedExercises = new Set();
    if (cheatsheetSelectedExercises.has(idx)) {
        cheatsheetSelectedExercises.delete(idx);
    } else {
        cheatsheetSelectedExercises.add(idx);
    }
    const subject = appDB.subjects.find(s => s.id === activeSubjectId);
    const topic = subject ? subject.topics.find(t => t.id === activeTopicId) : null;
    if (topic) renderCheatsheetSelectorBar(topic);
    renderCheatsheetPreview();
}

function setAllCheatsheetExercises(select) {
    const subject = appDB.subjects.find(s => s.id === activeSubjectId);
    const topic = subject ? subject.topics.find(t => t.id === activeTopicId) : null;
    if (!topic) return;
    const totalEx = (topic.data.ejercicios || []).length;
    if (select) {
        cheatsheetSelectedExercises = new Set(Array.from({ length: totalEx }, (_, i) => i));
        cheatsheetIncludeTheoryCard = true;
    } else {
        cheatsheetSelectedExercises = new Set();
        cheatsheetIncludeTheoryCard = false;
    }
    renderCheatsheetSelectorBar(topic);
    renderCheatsheetPreview();
}

function renderCheatsheetPreview() {
    const container = document.getElementById('cheatsheetPreviewContainer');
    if (!container) return;

    const subject = appDB.subjects.find(s => s.id === activeSubjectId);
    const topic = subject ? subject.topics.find(t => t.id === activeTopicId) : null;
    if (!subject || !topic || !topic.data) {
        container.innerHTML = '<div style="padding:20px; text-align:center;">No hay datos en el tema actual.</div>';
        return;
    }

    const incTheory = (document.getElementById('csIncTheory') ? document.getElementById('csIncTheory').checked : true) && cheatsheetIncludeTheoryCard;
    const incChecklist = (document.getElementById('csIncChecklist') ? document.getElementById('csIncChecklist').checked : true) && cheatsheetIncludeTheoryCard;
    const incIdent = document.getElementById('csIncIdent') ? document.getElementById('csIncIdent').checked : true;
    const incSteps = document.getElementById('csIncSteps') ? document.getElementById('csIncSteps').checked : true;
    const incTricks = document.getElementById('csIncTricks') ? document.getElementById('csIncTricks').checked : true;
    const incExamples = document.getElementById('csIncExamples') ? document.getElementById('csIncExamples').checked : false;
    const cols = document.getElementById('csColsSelect') ? document.getElementById('csColsSelect').value : '3';

    const teo = topic.data.teoria;
    const allEjercicios = topic.data.ejercicios || [];
    const ejercicios = allEjercicios.filter((_, idx) => cheatsheetSelectedExercises ? cheatsheetSelectedExercises.has(idx) : true);

    let html = `
        <div class="cheatsheet-sheet cols-${cols}" id="cheatsheet-print-area">
            <div class="cs-doc-header">
                <div class="cs-doc-title">${sanitizeHTML(subject.name)} — ${sanitizeHTML(topic.name)}</div>
                <div class="cs-doc-meta">Resumen Compacto de Estudio • UniverSOS</div>
            </div>
    `;

    // 1. Bloques de Teoría Condensados
    if (incTheory && teo) {
        if (teo.introduccion) {
            html += `
                <div class="cs-block cs-block-theory">
                    <div class="cs-block-title"><span>Fundamentos del Tema</span></div>
                    <div>${ processTextWithCitations(teo.introduccion).text }</div>
                </div>
            `;
        }
        if (Array.isArray(teo.secciones)) {
            teo.secciones.forEach(sec => {
                let detHtml = '';
                if (Array.isArray(sec.detalles) && sec.detalles.length > 0) {
                    detHtml = sec.detalles.map(d => `
                        <div class="cs-step-row" style="margin-top:3px;">
                            <strong>• ${sanitizeHTML(d.title || d.titulo)}:</strong> ${processTextWithCitations(d.content || d.contenido || '').text}
                        </div>
                    `).join('');
                }
                html += `
                    <div class="cs-block cs-block-theory">
                        <div class="cs-block-title"><span>${sanitizeHTML(sec.title)}</span></div>
                        <div>${processTextWithCitations(sec.content || '').text}</div>
                        ${detHtml}
                    </div>
                `;
            });
        }
    }

    // 2. Checklist de Conceptos y Fórmulas Clave
    if (incChecklist && teo && Array.isArray(teo.checklistClave) && teo.checklistClave.length > 0) {
        html += `
            <div class="cs-block cs-block-theory">
                <div class="cs-block-title"><span>Fórmulas y Conceptos Clave</span></div>
                <ul class="cs-compact-list">
                    ${teo.checklistClave.map(item => {
                        if (typeof item === 'string') {
                            const parts = splitChecklistStringSafely(item);
                            const t = processTextWithCitations(parts.title).text;
                            const s = parts.subtitle ? `: ${processTextWithCitations(parts.subtitle).text}` : '';
                            return `<li><strong>${t}</strong>${s}</li>`;
                        } else if (item && typeof item === 'object') {
                            const t = processTextWithCitations(item.title || item.titulo || item.concepto || '').text;
                            const s = processTextWithCitations(item.subtitle || item.descripcion || item.content || '').text;
                            return `<li><strong>${t}</strong>${s ? `: ${s}` : ''}</li>`;
                        }
                        return '';
                    }).join('')}
                </ul>
            </div>
        `;
    }

    // 3. Bloques Compactos de Ejercicios Tipo
    ejercicios.forEach((ex, idx) => {
        let blockInner = '';

        if (incIdent && Array.isArray(ex.identificacion) && ex.identificacion.length > 0) {
            blockInner += `
                <div class="cs-sub-label">Identificación</div>
                <ul class="cs-compact-list">
                    ${ex.identificacion.map(idStr => `<li>${sanitizeHTML(idStr)}</li>`).join('')}
                </ul>
            `;
        }

        if (incSteps && Array.isArray(ex.algoritmo) && ex.algoritmo.length > 0) {
            blockInner += `<div class="cs-sub-label">Algoritmo de Resolución</div>`;
            ex.algoritmo.forEach((st, sIdx) => {
                blockInner += `
                    <div class="cs-step-row">
                        <strong>${sIdx + 1}. ${sanitizeHTML(st.title)}:</strong> ${sanitizeHTML(st.subtitle)}
                        ${st.example ? `<div style="color:#334155; margin-top:2px;">${sanitizeHTML(st.example)}</div>` : ''}
                    </div>
                `;
            });
        }

        if (incTricks) {
            if (Array.isArray(ex.trucos) && ex.trucos.length > 0) {
                ex.trucos.forEach(tr => {
                    blockInner += `
                        <div class="cs-trick-pill">
                            <strong>Truco (${sanitizeHTML(tr.title)}):</strong> ${sanitizeHTML(tr.content)}
                            ${tr.fix ? ` — ${sanitizeHTML(tr.fix)}` : ''}
                        </div>
                    `;
                });
            }
            const trapsAndErrs = [...(ex.trampas || []), ...(ex.errores || [])];
            if (trapsAndErrs.length > 0) {
                trapsAndErrs.forEach(tr => {
                    blockInner += `
                        <div class="cs-alert-pill">
                            <strong>Cuidado (${sanitizeHTML(tr.title)}):</strong> ${sanitizeHTML(tr.content)}
                            ${tr.fix ? ` → <em>${sanitizeHTML(tr.fix)}</em>` : ''}
                        </div>
                    `;
                });
            }
            if (Array.isArray(ex.variaciones) && ex.variaciones.length > 0) {
                ex.variaciones.forEach(v => {
                    blockInner += `
                        <div class="cs-step-row" style="margin-top:3px;">
                            <strong>Variante (${sanitizeHTML(v.title)}):</strong> ${sanitizeHTML(v.content)} ${v.fix ? `→ ${sanitizeHTML(v.fix)}` : ''}
                        </div>
                    `;
                });
            }
        }

        if (incExamples && ex.ejemploCompleto) {
            blockInner += `
                <div class="cs-sub-label">Ejemplo Resuelto</div>
                <div style="font-size:0.66rem; background:#f8fafc; padding:5px; border:1px solid #e2e8f0; border-radius:4px;">
                    ${sanitizeHTML(ex.ejemploCompleto)}
                </div>
            `;
        }

        if (blockInner) {
            html += `
                <div class="cs-block cs-block-ex">
                    <div class="cs-block-title">
                        <span>${idx + 1}. ${sanitizeHTML(ex.title)}</span>
                    </div>
                    ${blockInner}
                </div>
            `;
        }
    });

    html += `</div>`;
    container.innerHTML = html;
    forceMathRender([container]);
}

function triggerCheatsheetPrint() {
    document.body.classList.add('printing-cheatsheet');
    const container = document.getElementById('cheatsheetPreviewContainer');
    const finalizePrint = () => {
        window.print();
        setTimeout(() => {
            document.body.classList.remove('printing-cheatsheet');
        }, 400);
    };

    if (window.MathJax && MathJax.typesetPromise && container) {
        MathJax.typesetPromise([container]).then(finalizePrint).catch(finalizePrint);
    } else {
        finalizePrint();
    }
}

/* ==========================================================================
   MODO FLASHCARDS SRS (REPASO ESPACIADO ACTIVO DE ALTA GAMA)
   ========================================================================== */

let currentFlashcardDeck = [];
let currentFlashcardIndex = 0;

function openFlashcardsModal() {
    currentFlashcardDeck = [];
    currentFlashcardIndex = 0;

    const subjects = (appDB && Array.isArray(appDB.subjects)) ? appDB.subjects : [];
    if (subjects.length === 0) {
        customAlert('No tienes asignaturas creadas en tu base de datos todavía. Crea una asignatura o importa temas primero.', 'Flashcards');
        return;
    }

    let targetTopics = [];
    if (activeSubjectId && activeTopicId) {
        const s = subjects.find(sub => sub.id === activeSubjectId);
        if (s && s.topics) {
            const t = s.topics.find(top => top.id === activeTopicId);
            if (t) targetTopics.push(t);
        }
    } else if (activeSubjectId) {
        const s = subjects.find(sub => sub.id === activeSubjectId);
        if (s && s.topics) targetTopics = [...s.topics];
    } else {
        subjects.forEach(s => {
            if (Array.isArray(s.topics)) targetTopics.push(...s.topics);
        });
    }

    targetTopics.forEach(top => {
        if (!top.data) return;
        const topicName = top.name || 'Tema';

        // 1. Conceptos Clave de la Teoría
        if (top.data.teoria && Array.isArray(top.data.teoria.checklistClave)) {
            top.data.teoria.checklistClave.forEach(item => {
                const title = typeof item === 'string' ? item : (item.title || item.text || '');
                const detail = typeof item === 'object' ? (item.explanation || item.detail || '') : '';
                if (title) {
                    currentFlashcardDeck.push({
                        type: 'Concepto Clave',
                        typeBack: 'Explicación Teórica',
                        front: `<strong>${sanitizeHTML(topicName)}</strong><br><br>${sanitizeHTML(title)}`,
                        back: detail ? sanitizeHTML(detail) : 'Concepto teórico fundamental para el examen. Asegúrate de saber deducirlo o enunciarlo.'
                    });
                }
            });
        }

        // 2. Ejercicios: Identificación
        if (Array.isArray(top.data.ejercicios)) {
            top.data.ejercicios.forEach(ex => {
                const exTitle = ex.title || 'Ejercicio';
                if (Array.isArray(ex.identificacion) && ex.identificacion.length > 0) {
                    currentFlashcardDeck.push({
                        type: 'Identificación de Problema',
                        typeBack: 'Criterios de Reconocimiento',
                        front: `¿Cómo identificar en el examen que debes aplicar:<br><br><strong>${sanitizeHTML(exTitle)}</strong>?`,
                        back: `<ul style="text-align:left; padding-left:18px; margin:0;">${ex.identificacion.map(id => `<li style="margin-bottom:4px;">${sanitizeHTML(id)}</li>`).join('')}</ul>`
                    });
                }

                // 3. Pasos del Algoritmo
                if (Array.isArray(ex.algoritmo) && ex.algoritmo.length > 0) {
                    ex.algoritmo.forEach((st, sIdx) => {
                        currentFlashcardDeck.push({
                            type: 'Algoritmo de Resolución',
                            typeBack: `Paso ${sIdx + 1}: ${sanitizeHTML(st.title || '')}`,
                            front: `En <strong>${sanitizeHTML(exTitle)}</strong>:<br><br>¿Cuál es el <strong>Paso ${sIdx + 1}</strong> (${sanitizeHTML(st.title || '')}) y cómo se opera?`,
                            back: `<div style="text-align:left;"><strong>Operación:</strong> ${sanitizeHTML(st.subtitle || '')} ${st.example ? `<br><br><strong>Ejemplo / Fórmula:</strong><br><code>${sanitizeHTML(st.example)}</code>` : ''}</div>`
                        });
                    });
                }

                // 4. Trampas y Errores
                const traps = [...(ex.trampas || []), ...(ex.errores || [])];
                traps.forEach(tr => {
                    if (tr.title || tr.content) {
                        currentFlashcardDeck.push({
                            type: 'Trampa Típica de Examen',
                            typeBack: 'Prevención y Solución',
                            front: `¡Alerta en <strong>${sanitizeHTML(exTitle)}</strong>!<br><br>¿Qué error grave suele cometerse respecto a <strong>${sanitizeHTML(tr.title || 'este punto')}</strong>?`,
                            back: `<div style="text-align:left; color:#991b1b;"><strong>Peligro:</strong> ${sanitizeHTML(tr.content || '')} ${tr.fix ? `<br><br><span style="color:#065f46;"><strong>Solución / Regla:</strong> ${sanitizeHTML(tr.fix)}</span>` : ''}</div>`
                        });
                    }
                });

                // 5. Trucos y Atajos
                if (Array.isArray(ex.trucos)) {
                    ex.trucos.forEach(tr => {
                        if (tr.title || tr.content) {
                            currentFlashcardDeck.push({
                                type: 'Truco de Velocidad',
                                typeBack: 'Atajo Aplicable',
                                front: `¿Qué truco o atajo existe para <strong>${sanitizeHTML(exTitle)}</strong>?<br><br><em>${sanitizeHTML(tr.title || '')}</em>`,
                                back: `<div style="text-align:left; color:#065f46;"><strong>Truco:</strong> ${sanitizeHTML(tr.content || '')} ${tr.fix ? `<br><br><strong>Aplicación:</strong> ${sanitizeHTML(tr.fix)}` : ''}</div>`
                            });
                        }
                    });
                }
            });
        }
    });

    if (currentFlashcardDeck.length === 0) {
        customAlert('No se encontraron suficientes conceptos teóricos o algoritmos estructurados en este tema para generar flashcards. Añade ejercicios o una checklist de teoría primero.', 'Flashcards Vacías');
        return;
    }

    // Mezcla pseudo-aleatoria uniforme (Fisher-Yates) para no estudiar en orden idéntico
    for (let i = currentFlashcardDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentFlashcardDeck[i], currentFlashcardDeck[j]] = [currentFlashcardDeck[j], currentFlashcardDeck[i]];
    }

    renderCurrentFlashcard();
    openModal('flashcardsModal');
}

function renderCurrentFlashcard() {
    const inner = document.getElementById('flashcardInner');
    const typeFront = document.getElementById('fc-type-front');
    const frontText = document.getElementById('fc-front-text');
    const typeBack = document.getElementById('fc-type-back');
    const backText = document.getElementById('fc-back-text');
    const counter = document.getElementById('flashcard-counter');
    const wrapper = document.getElementById('flashcardWrapper');

    if (!inner || !frontText || !backText) return;

    inner.classList.remove('is-flipped');

    if (currentFlashcardIndex >= currentFlashcardDeck.length) {
        if (typeFront) typeFront.innerText = '¡Completado!';
        frontText.innerHTML = `
            <div style="text-align:center; padding:10px;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" style="margin-bottom:12px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <div style="font-size:1.25rem; font-weight:800; color:var(--text-heading); margin-bottom:6px;">¡Sesión de Repaso Finalizada!</div>
                <div style="font-size:0.88rem; color:var(--text-muted);">Has reforzado exitosamente todos los conceptos programados. Vuelve a repasar cuando quieras afianzar tu memoria.</div>
            </div>
        `;
        if (counter) counter.innerText = `${currentFlashcardDeck.length} / ${currentFlashcardDeck.length}`;
        return;
    }

    const card = currentFlashcardDeck[currentFlashcardIndex];
    if (typeFront) typeFront.innerText = card.type || 'Flashcard';
    frontText.innerHTML = card.front;
    if (typeBack) typeBack.innerText = card.typeBack || 'Respuesta / Desarrollo';
    backText.innerHTML = card.back;
    if (counter) counter.innerText = `${currentFlashcardIndex + 1} / ${currentFlashcardDeck.length}`;

    if (wrapper) {
        forceMathRender([wrapper]);
    }
}

function flipFlashcard() {
    const inner = document.getElementById('flashcardInner');
    if (inner && currentFlashcardIndex < currentFlashcardDeck.length) {
        inner.classList.toggle('is-flipped');
    }
}

function rateFlashcard(rating) {
    if (currentFlashcardDeck.length === 0 || currentFlashcardIndex >= currentFlashcardDeck.length) {
        return;
    }

    const card = currentFlashcardDeck[currentFlashcardIndex];

    // Algoritmo SRS simplificado intra-sesión
    if (rating === 'mal') {
        // Reinsertar 3 posiciones más adelante o al final para forzar repetición inmediata
        const targetPos = Math.min(currentFlashcardIndex + 3, currentFlashcardDeck.length);
        currentFlashcardDeck.splice(targetPos, 0, card);
    } else if (rating === 'regular') {
        // Reinsertar 6 posiciones más adelante o al final
        const targetPos = Math.min(currentFlashcardIndex + 6, currentFlashcardDeck.length);
        currentFlashcardDeck.splice(targetPos, 0, card);
    }
    // Si es 'perfecto', avanza limpiamente sin reinsertar

    currentFlashcardIndex++;
    renderCurrentFlashcard();
}

// Atajos de teclado para Flashcards (Espacio para voltear, 1/2/3 para calificar)
window.addEventListener('keydown', (e) => {
    const modal = document.getElementById('flashcardsModal');
    if (!modal || !modal.classList.contains('active')) return;

    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

    if (e.code === 'Space') {
        e.preventDefault();
        flipFlashcard();
    } else if (e.key === '1') {
        rateFlashcard('mal');
    } else if (e.key === '2') {
        rateFlashcard('regular');
    } else if (e.key === '3') {
        rateFlashcard('perfecto');
    }
});

/* ==========================================================================
   PANEL DE MÉTRICAS Y TELEMETRÍA DE ESTUDIO
   ========================================================================== */

function openStatsModal() {
    const subjects = (appDB && Array.isArray(appDB.subjects)) ? appDB.subjects : [];
    
    let totalTopics = 0;
    let totalExercises = 0;
    let totalTheory = 0;
    let countMastered = 0;
    let countReview = 0;
    let countDoubt = 0;
    let countNone = 0;

    subjects.forEach(s => {
        if (Array.isArray(s.topics)) {
            totalTopics += s.topics.length;
            s.topics.forEach(t => {
                if (t.data) {
                    if (t.data.teoria && Array.isArray(t.data.teoria.checklistClave)) {
                        totalTheory += t.data.teoria.checklistClave.length;
                    }
                    if (Array.isArray(t.data.ejercicios)) {
                        totalExercises += t.data.ejercicios.length;
                        t.data.ejercicios.forEach(ex => {
                            const m = ex.mastery || 'none';
                            if (m === 'mastered') countMastered++;
                            else if (m === 'review') countReview++;
                            else if (m === 'doubt') countDoubt++;
                            else countNone++;
                        });
                    }
                }
            });
        }
    });

    const elSubj = document.getElementById('stat-total-subjects');
    const elTop = document.getElementById('stat-total-topics');
    const elEx = document.getElementById('stat-total-exercises');
    const elTheo = document.getElementById('stat-total-theory');

    if (elSubj) elSubj.innerText = subjects.length;
    if (elTop) elTop.innerText = totalTopics;
    if (elEx) elEx.innerText = totalExercises;
    if (elTheo) elTheo.innerText = totalTheory;

    const elLblMastered = document.getElementById('lbl-mastered');
    const elLblReview = document.getElementById('lbl-review');
    const elLblDoubt = document.getElementById('lbl-doubt');
    const elLblNone = document.getElementById('lbl-none');

    if (elLblMastered) elLblMastered.innerText = countMastered;
    if (elLblReview) elLblReview.innerText = countReview;
    if (elLblDoubt) elLblDoubt.innerText = countDoubt;
    if (elLblNone) elLblNone.innerText = countNone;

    const barMastered = document.getElementById('bar-mastered');
    const barReview = document.getElementById('bar-review');
    const barDoubt = document.getElementById('bar-doubt');
    const barNone = document.getElementById('bar-none');
    const pctLabel = document.getElementById('stat-mastery-percentage');

    if (totalExercises > 0) {
        const pctM = (countMastered / totalExercises) * 100;
        const pctR = (countReview / totalExercises) * 100;
        const pctD = (countDoubt / totalExercises) * 100;
        const pctN = (countNone / totalExercises) * 100;

        if (barMastered) barMastered.style.width = `${pctM}%`;
        if (barReview) barReview.style.width = `${pctR}%`;
        if (barDoubt) barDoubt.style.width = `${pctD}%`;
        if (barNone) barNone.style.width = `${pctN}%`;

        if (pctLabel) pctLabel.innerText = `${Math.round(pctM)}% Dominado`;
    } else {
        if (barMastered) barMastered.style.width = '0%';
        if (barReview) barReview.style.width = '0%';
        if (barDoubt) barDoubt.style.width = '0%';
        if (barNone) barNone.style.width = '100%';
        if (pctLabel) pctLabel.innerText = '0% Dominado';
    }

    openModal('statsModal');
}
