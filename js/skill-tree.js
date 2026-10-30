/**
 * UniverSOS — Árbol de Habilidades y Mapa Conceptual de la Asignatura
 * Visualización moderna, fluida y legible del avance pedagógico y dominio
 * de cada tema con soporte íntegro para temas claros/oscuros y filtros dinámicos.
 */

var selectedSkillTopicId = null;
var skillTreeCurrentFilter = 'all';

/**
 * Abre el modal del árbol de habilidades para la asignatura activa.
 */
function openSkillTreeModal() {
    const subjects = (appDB && Array.isArray(appDB.subjects)) ? appDB.subjects : [];
    if (subjects.length === 0) {
        customAlert('No tienes asignaturas registradas para visualizar el mapa de temas.', 'Mapa de Asignatura');
        return;
    }

    const activeSubj = subjects.find(sub => sub.id === activeSubjectId) || subjects[0];
    if (!activeSubj) return;

    const topics = activeSubj.topics || [];
    if (topics.length === 0) {
        customAlert('Esta asignatura no tiene temas creados todavía. Añade temas para generar el mapa conceptual.', 'Sin Temas');
        return;
    }

    renderSkillTreeGraph(activeSubj);
    openModal('skillTreeModal');
}

/**
 * Calcula las métricas de dominio para cada tema de la asignatura.
 */
function calculateTopicMastery(topic, subject) {
    if (!topic || !topic.data) {
        return { percent: 0, status: 'pending', totalEx: 0, masteredEx: 0, totalFc: 0, masteredFc: 0, checklistCount: 0 };
    }

    const exercises = Array.isArray(topic.data.ejercicios) ? topic.data.ejercicios : [];
    const totalEx = exercises.length;
    let masteredEx = 0;
    let doubtEx = 0;

    exercises.forEach(ex => {
        if (ex.dominio === 'mastered') masteredEx++;
        else if (ex.dominio === 'doubt') doubtEx++;
    });

    const checklist = (topic.data.teoria && Array.isArray(topic.data.teoria.checklistClave)) ? topic.data.teoria.checklistClave : [];
    const checklistCount = checklist.length;

    // Métricas cruzadas desde el historial de flashcards
    const history = typeof getFlashcardHistory === 'function' ? getFlashcardHistory() : {};
    let totalFc = 0;
    let masteredFc = 0;

    Object.keys(history).forEach(cardId => {
        const item = history[cardId];
        if (item && item.topicName && item.topicName.trim().toLowerCase() === (topic.name || '').trim().toLowerCase()) {
            totalFc++;
            if (item.status === 'mastered') masteredFc++;
        }
    });

    // Ponderación: 70% peso ejercicios prácticos, 30% peso retención de flashcards
    let percent = 0;
    if (totalEx > 0) {
        const exScore = ((masteredEx * 1.0 + doubtEx * 0.4) / totalEx) * 100;
        if (totalFc > 0) {
            const fcScore = (masteredFc / totalFc) * 100;
            percent = Math.round((exScore * 0.7) + (fcScore * 0.3));
        } else {
            percent = Math.round(exScore);
        }
    } else if (totalFc > 0) {
        percent = Math.round((masteredFc / totalFc) * 100);
    }

    let status = 'pending';
    if (percent >= 75) status = 'mastered';
    else if (percent >= 25 || doubtEx > 0) status = 'progress';
    else status = 'pending';

    return { percent, status, totalEx, masteredEx, totalFc, masteredFc, checklistCount };
}

/**
 * Renderiza el mapa conceptual de temas con diseño fluido, tipografía clara
 * y soporte completo para modo claro/oscuro.
 */
function renderSkillTreeGraph(subject) {
    const titleEl = document.getElementById('skillTreeSubjectTitle');
    const container = document.getElementById('skillTreeSvgContainer');
    const globalPercentEl = document.getElementById('skillTreeGlobalProgress');
    const globalBarEl = document.getElementById('skillTreeProgressBar');

    if (titleEl) titleEl.innerText = subject.name || 'Asignatura';

    const topics = subject.topics || [];
    if (topics.length === 0) return;

    // Calcular estadísticas globales
    let totalPoints = 0;
    let countMastered = 0;
    let countProgress = 0;
    let countPending = 0;

    const topicStats = topics.map((t, idx) => {
        const stats = calculateTopicMastery(t, subject);
        totalPoints += stats.percent;
        if (stats.status === 'mastered') countMastered++;
        else if (stats.status === 'progress') countProgress++;
        else countPending++;
        return { topic: t, index: idx + 1, ...stats };
    });

    const globalAverage = Math.round(totalPoints / topics.length);
    if (globalPercentEl) globalPercentEl.innerText = `${globalAverage}%`;
    if (globalBarEl) globalBarEl.style.width = `${globalAverage}%`;

    // Filtros de estado para el mapa
    let html = `
        <div class="skill-tree-toolbar">
            <div class="skill-tree-filter-chips">
                <button class="skill-filter-chip ${skillTreeCurrentFilter === 'all' ? 'active' : ''}" onclick="setSkillTreeFilter('all')">
                    Todos (${topics.length})
                </button>
                <button class="skill-filter-chip chip-mastered ${skillTreeCurrentFilter === 'mastered' ? 'active' : ''}" onclick="setSkillTreeFilter('mastered')">
                    Dominados (${countMastered})
                </button>
                <button class="skill-filter-chip chip-progress ${skillTreeCurrentFilter === 'progress' ? 'active' : ''}" onclick="setSkillTreeFilter('progress')">
                    En Progreso (${countProgress})
                </button>
                <button class="skill-filter-chip chip-pending ${skillTreeCurrentFilter === 'pending' ? 'active' : ''}" onclick="setSkillTreeFilter('pending')">
                    Por Estudiar (${countPending})
                </button>
            </div>
            <div class="skill-tree-legend">
                <span class="legend-item"><span class="legend-dot dot-mastered"></span> ≥75% Dominado</span>
                <span class="legend-item"><span class="legend-dot dot-progress"></span> 25-74% En Progreso</span>
                <span class="legend-item"><span class="legend-dot dot-pending"></span> &lt;25% Por Iniciar</span>
            </div>
        </div>

        <div class="skill-tree-flow-list">
    `;

    // Renderizar cada tema como una tarjeta editorial estructurada y legible
    topicStats.forEach((st, idx) => {
        if (skillTreeCurrentFilter !== 'all' && st.status !== skillTreeCurrentFilter) {
            return;
        }

        const t = st.topic;
        const statusConfig = {
            mastered: {
                label: 'Dominado',
                badgeClass: 'status-mastered',
                barColor: '#10b981',
                icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
            },
            progress: {
                label: 'En Progreso',
                badgeClass: 'status-progress',
                barColor: '#f59e0b',
                icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`
            },
            pending: {
                label: 'Por Estudiar',
                badgeClass: 'status-pending',
                barColor: '#94a3b8',
                icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>`
            }
        };

        const sc = statusConfig[st.status] || statusConfig.pending;
        const isSelected = selectedSkillTopicId === t.id ? 'is-selected' : '';

        html += `
            <div class="skill-flow-step ${isSelected}" onclick="selectSkillTreeNode('${t.id}')">
                <div class="skill-step-stem">
                    <div class="skill-step-marker ${sc.badgeClass}">
                        ${st.index}
                    </div>
                    ${idx < topicStats.length - 1 ? '<div class="skill-step-line"></div>' : ''}
                </div>

                <div class="skill-topic-card card-${st.status}">
                    <div class="skill-card-top">
                        <div class="skill-card-header-left">
                            <span class="skill-topic-num">TEMA ${st.index < 10 ? '0' + st.index : st.index}</span>
                            <h3 class="skill-topic-name">${sanitizeHTML(t.name || 'Tema')}</h3>
                        </div>
                        <div class="skill-card-status-badge ${sc.badgeClass}">
                            ${sc.icon}
                            <span>${sc.label}</span>
                        </div>
                    </div>

                    <div class="skill-card-progress-bar-wrap">
                        <div class="skill-card-progress-bar" style="width: ${st.percent}%; background: ${sc.barColor};"></div>
                    </div>

                    <div class="skill-card-meta-grid">
                        <div class="skill-meta-pill">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                            <span><strong>${st.masteredEx}/${st.totalEx}</strong> ejercicios dominados</span>
                        </div>
                        <div class="skill-meta-pill">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                            <span><strong>${st.checklistCount}</strong> fórmulas de checklist</span>
                        </div>
                        <div class="skill-meta-pill">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                            <span><strong>${st.percent}%</strong> de dominio</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += `</div>`; // fin skill-tree-flow-list

    if (container) {
        container.innerHTML = html;
    }

    // Seleccionar por defecto el primer tema
    if (topics.length > 0 && !selectedSkillTopicId) {
        selectSkillTreeNode(topics[0].id);
    } else if (selectedSkillTopicId) {
        selectSkillTreeNode(selectedSkillTopicId);
    }
}

/**
 * Cambia el filtro activo del árbol.
 */
function setSkillTreeFilter(filter) {
    skillTreeCurrentFilter = filter;
    const subjects = (appDB && Array.isArray(appDB.subjects)) ? appDB.subjects : [];
    const activeSubj = subjects.find(sub => sub.id === activeSubjectId) || subjects[0];
    if (activeSubj) {
        renderSkillTreeGraph(activeSubj);
    }
}

/**
 * Muestra el panel lateral de detalles de un tema al hacer clic en su nodo.
 */
function selectSkillTreeNode(topicId) {
    selectedSkillTopicId = topicId;

    // Resaltar visualmente la tarjeta seleccionada
    document.querySelectorAll('.skill-flow-step').forEach(el => {
        el.classList.remove('is-selected');
    });

    const subjects = (appDB && Array.isArray(appDB.subjects)) ? appDB.subjects : [];
    const activeSubj = subjects.find(sub => sub.id === activeSubjectId) || subjects[0];
    if (!activeSubj) return;

    const topic = (activeSubj.topics || []).find(t => t.id === topicId);
    if (!topic) return;

    const stats = calculateTopicMastery(topic, activeSubj);
    const detailBox = document.getElementById('skillTreeTopicDetail');
    if (!detailBox) return;

    const statusBadges = {
        mastered: '<span class="status-badge-inline status-mastered">🟢 Dominado (≥75%)</span>',
        progress: '<span class="status-badge-inline status-progress">🟡 En Progreso (25%-74%)</span>',
        pending: '<span class="status-badge-inline status-pending">⚪ Por Estudiar (&lt;25%)</span>'
    };

    const exList = (topic.data && Array.isArray(topic.data.ejercicios)) ? topic.data.ejercicios : [];
    const checklist = (topic.data && topic.data.teoria && Array.isArray(topic.data.teoria.checklistClave)) ? topic.data.teoria.checklistClave : [];

    detailBox.innerHTML = `
        <div class="skill-detail-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <div>
                    <span style="font-size: 0.7rem; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em;">Ficha del Tema</span>
                    <h3 style="margin: 2px 0 0; font-size: 1.15rem; color: var(--text-heading); font-weight: 800; line-height: 1.35;">${sanitizeHTML(topic.name)}</h3>
                </div>
                ${statusBadges[stats.status] || ''}
            </div>

            <div style="margin-top: 14px; background: var(--bg-alt); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle);">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 6px;">
                    <span style="color: var(--text-heading);">Nivel Global de Dominio</span>
                    <span style="color: var(--primary);">${stats.percent}%</span>
                </div>
                <div style="width: 100%; height: 8px; background: var(--border-color); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${stats.percent}%; height: 100%; background: var(--primary); border-radius: 4px; transition: width 0.3s ease;"></div>
                </div>
            </div>

            <!-- Métricas Claras y Explicadas -->
            <div class="skill-metrics-row" style="display: flex; gap: 8px; margin-top: 12px;">
                <div class="skill-metric-pill" style="flex: 1; padding: 10px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.2rem; font-weight: 900; color: var(--text-heading);">${stats.totalEx}</div>
                    <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-body); margin-top: 2px;">Problemas Prácticos</div>
                    <div style="font-size: 0.66rem; color: var(--text-muted);">${stats.masteredEx} dominados</div>
                </div>
                <div class="skill-metric-pill" style="flex: 1; padding: 10px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.2rem; font-weight: 900; color: var(--text-heading);">${checklist.length}</div>
                    <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-body); margin-top: 2px;">Checklist Teórico</div>
                    <div style="font-size: 0.66rem; color: var(--text-muted);">Fórmulas y conceptos</div>
                </div>
            </div>

            <!-- Checklist Teórico Explicado -->
            <div style="margin-top: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="font-size: 0.8rem; color: var(--text-heading);">Fórmulas y Conceptos Clave:</strong>
                    <span style="font-size: 0.68rem; color: var(--text-muted);">Checklist de Teoría</span>
                </div>
                <p style="font-size: 0.72rem; color: var(--text-muted); margin: 3px 0 6px; line-height: 1.4;">
                    Definiciones, propiedades y teoremas del tema extraídos para preguntas cortas de examen:
                </p>
                ${checklist.length > 0 ? `
                    <ul class="skill-detail-checklist">
                        ${checklist.slice(0, 5).map(c => `<li>${sanitizeHTML(typeof c === 'string' ? c.split(':')[0] : (c.title || c.text || 'Concepto'))}</li>`).join('')}
                        ${checklist.length > 5 ? `<li style="list-style: none; color: var(--primary); font-weight: 600;">+${checklist.length - 5} conceptos más en el tema...</li>` : ''}
                    </ul>
                ` : `
                    <div style="font-size: 0.76rem; color: var(--text-muted); font-style: italic;">No hay conceptos de checklist registrados en este tema.</div>
                `}
            </div>

            <!-- Botones de Acción Directa -->
            <div style="margin-top: 18px; display: flex; flex-direction: column; gap: 8px;">
                <button class="btn btn-primary" style="width: 100%; padding: 10px; font-size: 0.85rem; font-weight: 800;" onclick="jumpToSkillTopic('${topic.id}')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                    <span>Abrir y Estudiar este Tema</span>
                </button>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-secondary" style="flex: 1; padding: 8px; font-size: 0.78rem;" onclick="launchFlashcardsForTopic('${topic.id}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                        <span>Flashcards</span>
                    </button>
                    <button class="btn btn-secondary" style="flex: 1; padding: 8px; font-size: 0.78rem;" onclick="launchExamForTopic('${topic.id}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        <span>Simulacro A4</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Salta directamente al tema seleccionado y cierra el modal del árbol.
 */
function jumpToSkillTopic(topicId) {
    closeModal('skillTreeModal');
    if (typeof selectTopic === 'function') {
        selectTopic(topicId);
    }
}

/**
 * Lanza las flashcards restringidas a este tema.
 */
function launchFlashcardsForTopic(topicId) {
    closeModal('skillTreeModal');
    activeTopicId = topicId;
    flashcardScope = 'topic';
    if (typeof openFlashcardsModal === 'function') {
        openFlashcardsModal();
    }
}

/**
 * Lanza el generador de examen pre-filtrado con este tema.
 */
function launchExamForTopic(topicId) {
    closeModal('skillTreeModal');
    activeTopicId = topicId;
    examSelectedTopicIds = [topicId];
    if (typeof openExamGeneratorModal === 'function') {
        openExamGeneratorModal();
    }
}
