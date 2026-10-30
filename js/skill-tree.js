/**
 * UniverSOS — Árbol de Habilidades y Grafo de Dependencias de la Asignatura
 * Renderiza un mapa conceptual interactivo en SVG nativo mostrando el progreso,
 * estado de dominio y flujo pedagógico de los temas de la asignatura.
 */

var selectedSkillTopicId = null;

/**
 * Abre el modal del árbol de habilidades para la asignatura activa.
 */
function openSkillTreeModal() {
    const subjects = (appDB && Array.isArray(appDB.subjects)) ? appDB.subjects : [];
    if (subjects.length === 0) {
        customAlert('No tienes asignaturas registradas para visualizar el árbol de habilidades.', 'Mapa de Asignatura');
        return;
    }

    const activeSubj = subjects.find(sub => sub.id === activeSubjectId) || subjects[0];
    if (!activeSubj) return;

    const topics = activeSubj.topics || [];
    if (topics.length === 0) {
        customAlert('Esta asignatura no tiene temas creados todavía. Añade temas para generar el árbol de dependencias.', 'Sin Temas');
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
        return { percent: 0, status: 'pending', totalEx: 0, masteredEx: 0, totalFc: 0, masteredFc: 0 };
    }

    const exercises = Array.isArray(topic.data.ejercicios) ? topic.data.ejercicios : [];
    const totalEx = exercises.length;
    let masteredEx = 0;
    let doubtEx = 0;

    exercises.forEach(ex => {
        if (ex.dominio === 'mastered') masteredEx++;
        else if (ex.dominio === 'doubt') doubtEx++;
    });

    // Métricas cruzadas desde el historial de flashcards
    const history = typeof getFlashcardHistory === 'function' ? getFlashcardHistory() : {};
    let totalFc = 0;
    let masteredFc = 0;

    // Buscar tarjetas pertenecientes a este tema
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

    return { percent, status, totalEx, masteredEx, totalFc, masteredFc };
}

/**
 * Renderiza el árbol y genera el SVG interactivo.
 */
function renderSkillTreeGraph(subject) {
    const titleEl = document.getElementById('skillTreeSubjectTitle');
    const svgContainer = document.getElementById('skillTreeSvgContainer');
    const globalPercentEl = document.getElementById('skillTreeGlobalProgress');
    const globalBarEl = document.getElementById('skillTreeProgressBar');

    if (titleEl) titleEl.innerText = subject.name || 'Asignatura';

    const topics = subject.topics || [];
    if (topics.length === 0) return;

    // Calcular estadísticas globales de la asignatura
    let totalPoints = 0;
    let topicStats = [];
    topics.forEach((t, idx) => {
        const stats = calculateTopicMastery(t, subject);
        topicStats.push({ topic: t, index: idx + 1, ...stats });
        totalPoints += stats.percent;
    });

    const globalAverage = Math.round(totalPoints / topics.length);
    if (globalPercentEl) globalPercentEl.innerText = `${globalAverage}%`;
    if (globalBarEl) globalBarEl.style.width = `${globalAverage}%`;

    // Disposición visual espacial en SVG (Layout de Grafo en Serpiente / Cuadrícula Dinámica)
    const nodeWidth = 260;
    const nodeHeight = 90;
    const gapX = 80;
    const gapY = 70;
    const columns = Math.min(3, Math.max(1, Math.floor(880 / (nodeWidth + gapX))));

    const positions = [];
    topics.forEach((t, i) => {
        const row = Math.floor(i / columns);
        const colInRow = i % columns;
        // Efecto serpiente para conexiones más orgánicas en lectura izquierda-derecha
        const col = (row % 2 === 0) ? colInRow : (columns - 1 - colInRow);

        const x = 50 + col * (nodeWidth + gapX);
        const y = 50 + row * (nodeHeight + gapY);
        positions.push({ x, y, width: nodeWidth, height: nodeHeight });
    });

    const totalWidth = 50 + columns * (nodeWidth + gapX);
    const totalHeight = 50 + (Math.ceil(topics.length / columns)) * (nodeHeight + gapY) + 40;

    // Generar conexiones SVG (Curvas Bézier con flechas direccionales)
    let connectionsSvg = '';
    for (let i = 0; i < topics.length - 1; i++) {
        const p1 = positions[i];
        const p2 = positions[i + 1];

        const startX = p1.x + p1.width / 2;
        const startY = p1.y + p1.height / 2;
        const endX = p2.x + p2.width / 2;
        const endY = p2.y + p2.height / 2;

        const deltaY = endY - startY;
        const deltaX = endX - startX;

        // Si están en la misma fila
        let pathD = '';
        if (Math.abs(deltaY) < 10) {
            const cpX = (startX + endX) / 2;
            pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
        } else {
            // Conexión curva en cambio de fila
            const cpY = startY + deltaY / 2;
            pathD = `M ${startX} ${startY} C ${startX} ${cpY}, ${endX} ${cpY}, ${endX} ${endY}`;
        }

        const isMastered = topicStats[i].status === 'mastered';
        const strokeColor = isMastered ? '#10b981' : (topicStats[i].status === 'progress' ? '#f59e0b' : '#94a3b8');

        connectionsSvg += `
            <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-dasharray="${isMastered ? 'none' : '5,5'}" marker-end="url(#treeArrow)" opacity="0.75" />
        `;
    }

    // Generar Nodos SVG interactivos
    let nodesSvg = '';
    topicStats.forEach((st, idx) => {
        const pos = positions[idx];
        const t = st.topic;
        const statusColors = {
            mastered: { border: '#10b981', bg: 'var(--card-bg, #ffffff)', badgeBg: '#d1fae5', badgeText: '#065f46', label: 'Dominado' },
            progress: { border: '#f59e0b', bg: 'var(--card-bg, #ffffff)', badgeBg: '#fef3c7', badgeText: '#92400e', label: 'En Progreso' },
            pending: { border: '#94a3b8', bg: 'var(--card-bg, #ffffff)', badgeBg: '#f1f5f9', badgeText: '#475569', label: 'Por Estudiar' }
        };
        const style = statusColors[st.status] || statusColors.pending;

        nodesSvg += `
            <g class="skill-tree-node" transform="translate(${pos.x}, ${pos.y})" onclick="selectSkillTreeNode('${t.id}')" style="cursor: pointer;">
                <!-- Fondo de la Tarjeta del Nodo -->
                <rect width="${pos.width}" height="${pos.height}" rx="12" fill="${style.bg}" stroke="${style.border}" stroke-width="2.2" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.06))" />
                
                <!-- Barra superior de acento coloreada -->
                <rect width="${pos.width}" height="4" rx="2" fill="${style.border}" />

                <!-- Círculo con Número de Tema -->
                <circle cx="28" cy="38" r="16" fill="${style.badgeBg}" stroke="${style.border}" stroke-width="1.5" />
                <text x="28" y="43" text-anchor="middle" font-size="12" font-weight="800" fill="${style.badgeText}">${st.index}</text>

                <!-- Título del Tema -->
                <text x="54" y="32" font-size="12.5" font-weight="700" fill="var(--text-heading, #1e293b)" width="${pos.width - 65}">
                    ${sanitizeHTML((t.name || 'Tema').slice(0, 24))}${(t.name || '').length > 24 ? '…' : ''}
                </text>

                <!-- Subtítulo / Métricas -->
                <text x="54" y="50" font-size="10.5" fill="var(--text-muted, #64748b)">
                    ${st.totalEx} ${st.totalEx === 1 ? 'ejercicio' : 'ejercicios'} • ${st.percent}% dominio
                </text>

                <!-- Badge de Estado -->
                <rect x="54" y="58" width="85" height="18" rx="9" fill="${style.badgeBg}" />
                <text x="96" y="71" text-anchor="middle" font-size="9.5" font-weight="800" fill="${style.badgeText}">${style.label}</text>

                <!-- Barra de progreso individual -->
                <rect x="${pos.width - 70}" y="62" width="55" height="8" rx="4" fill="#e2e8f0" />
                <rect x="${pos.width - 70}" y="62" width="${Math.max(4, (55 * st.percent) / 100)}" height="8" rx="4" fill="${style.border}" />
            </g>
        `;
    });

    if (svgContainer) {
        svgContainer.innerHTML = `
            <svg viewBox="0 0 ${totalWidth} ${totalHeight}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="min-width: 100%; min-height: 480px;">
                <defs>
                    <marker id="treeArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
                    </marker>
                </defs>
                ${connectionsSvg}
                ${nodesSvg}
            </svg>
        `;
    }

    // Seleccionar automáticamente el primer tema en el panel lateral de detalles
    if (topics.length > 0) {
        selectSkillTreeNode(topics[0].id);
    }
}

/**
 * Muestra el panel lateral de detalles de un tema al hacer clic en su nodo.
 */
function selectSkillTreeNode(topicId) {
    selectedSkillTopicId = topicId;

    const subjects = (appDB && Array.isArray(appDB.subjects)) ? appDB.subjects : [];
    const activeSubj = subjects.find(sub => sub.id === activeSubjectId) || subjects[0];
    if (!activeSubj) return;

    const topic = (activeSubj.topics || []).find(t => t.id === topicId);
    if (!topic) return;

    const stats = calculateTopicMastery(topic, activeSubj);
    const detailBox = document.getElementById('skillTreeTopicDetail');
    if (!detailBox) return;

    const statusBadges = {
        mastered: '<span style="color:#065f46; background:#d1fae5; padding:2px 8px; border-radius:999px; font-weight:700; font-size:0.75rem;">Dominado (≥75%)</span>',
        progress: '<span style="color:#92400e; background:#fef3c7; padding:2px 8px; border-radius:999px; font-weight:700; font-size:0.75rem;">En Progreso (25%-74%)</span>',
        pending: '<span style="color:#475569; background:#f1f5f9; padding:2px 8px; border-radius:999px; font-weight:700; font-size:0.75rem;">Por Estudiar (&lt;25%)</span>'
    };

    const exList = (topic.data && Array.isArray(topic.data.ejercicios)) ? topic.data.ejercicios : [];
    const checklist = (topic.data && topic.data.teoria && Array.isArray(topic.data.teoria.checklistClave)) ? topic.data.teoria.checklistClave : [];

    detailBox.innerHTML = `
        <div class="skill-detail-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <h3 style="margin: 0; font-size: 1.1rem; color: var(--text-heading);">${sanitizeHTML(topic.name)}</h3>
                ${statusBadges[stats.status] || ''}
            </div>

            <div style="margin-top: 10px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
                    <span>Nivel de Dominio</span>
                    <span style="color: var(--primary);">${stats.percent}%</span>
                </div>
                <div style="width: 100%; height: 8px; background: var(--border-color); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${stats.percent}%; height: 100%; background: var(--primary); border-radius: 4px;"></div>
                </div>
            </div>

            <div class="skill-metrics-row" style="display: flex; gap: 10px; margin-top: 14px;">
                <div class="skill-metric-pill" style="flex: 1; padding: 8px; background: var(--bg-alt); border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-heading);">${stats.totalEx}</div>
                    <div style="font-size: 0.7rem; color: var(--text-muted);">Ejercicios (${stats.masteredEx} dominados)</div>
                </div>
                <div class="skill-metric-pill" style="flex: 1; padding: 8px; background: var(--bg-alt); border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-heading);">${checklist.length}</div>
                    <div style="font-size: 0.7rem; color: var(--text-muted);">Conceptos Teóricos</div>
                </div>
            </div>

            ${checklist.length > 0 ? `
                <div style="margin-top: 14px;">
                    <strong style="font-size: 0.82rem; color: var(--text-heading);">Conceptos Clave del Tema:</strong>
                    <ul style="margin: 4px 0 0; padding-left: 18px; font-size: 0.78rem; color: var(--text-muted); line-height: 1.4;">
                        ${checklist.slice(0, 4).map(c => `<li>${sanitizeHTML(typeof c === 'string' ? c.split(':')[0] : (c.title || c.text || 'Concepto'))}</li>`).join('')}
                        ${checklist.length > 4 ? `<li><em>+${checklist.length - 4} conceptos más...</em></li>` : ''}
                    </ul>
                </div>
            ` : ''}

            <!-- Botones de Acción Inmediata -->
            <div style="margin-top: 18px; display: flex; flex-direction: column; gap: 8px;">
                <button class="btn btn-primary" style="width: 100%; padding: 10px; font-size: 0.85rem; font-weight: 700;" onclick="jumpToSkillTopic('${topic.id}')">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                    <span>Abrir y Estudiar este Tema</span>
                </button>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-secondary" style="flex: 1; padding: 8px; font-size: 0.78rem;" onclick="launchFlashcardsForTopic('${topic.id}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                        <span>Flashcards</span>
                    </button>
                    <button class="btn btn-secondary" style="flex: 1; padding: 8px; font-size: 0.78rem;" onclick="launchExamForTopic('${topic.id}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
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
