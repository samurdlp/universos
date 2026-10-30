/**
 * UniverSOS — Generador de Exámenes Imprimibles A4 (Simulacros Oficiales STEM)
 * Permite confeccionar, baremar e imprimir exámenes reales en papel con
 * encabezados oficiales, espacio pautado de cálculo y solucionario detallado.
 */

var examSelectedTopicIds = [];
var examProblemCount = 4;
var examScoreMode = 'equal'; // 'equal' | 'weighted'
var examIncludeGrid = true;
var examIncludeSolutions = true;
var currentGeneratedExam = null;

/**
 * Abre el modal de configuración del examen imprimible.
 */
function openExamGeneratorModal() {
    const subjects = (appDB && Array.isArray(appDB.subjects)) ? appDB.subjects : [];
    if (subjects.length === 0) {
        customAlert('No tienes asignaturas creadas en tu base de datos todavía. Crea una asignatura o importa temas primero.', 'Examen Imprimible');
        return;
    }

    const activeSubj = subjects.find(sub => sub.id === activeSubjectId) || subjects[0];
    if (!activeSubj) return;

    // Inicializar temas seleccionados (por defecto todos los temas con ejercicios)
    const availableTopics = (activeSubj.topics || []).filter(t => t.data && Array.isArray(t.data.ejercicios) && t.data.ejercicios.length > 0);
    
    if (availableTopics.length === 0) {
        customAlert('Esta asignatura no tiene temas con ejercicios prácticos registrados. Añade ejercicios a los temas para poder generar un examen.', 'Sin Ejercicios');
        return;
    }

    examSelectedTopicIds = availableTopics.map(t => t.id);

    renderExamGenConfigUI(activeSubj, availableTopics);
    openModal('examGenModal');
}

/**
 * Renderiza la interfaz de selección de parámetros en el modal de configuración.
 */
function renderExamGenConfigUI(subject, availableTopics) {
    const titleEl = document.getElementById('examGenSubjectTitle');
    const topicsListEl = document.getElementById('examGenTopicsList');
    const totalAvailEl = document.getElementById('examGenTotalAvailEx');

    if (titleEl) titleEl.innerText = subject.name || 'Asignatura';

    // Contar ejercicios disponibles
    let totalExCount = 0;
    availableTopics.forEach(t => {
        totalExCount += (t.data.ejercicios || []).length;
    });
    if (totalAvailEl) totalAvailEl.innerText = `${totalExCount} ejercicios disponibles`;

    if (topicsListEl) {
        topicsListEl.innerHTML = availableTopics.map(t => {
            const count = (t.data.ejercicios || []).length;
            const isChecked = examSelectedTopicIds.includes(t.id) ? 'checked' : '';
            return `
                <label class="exam-topic-chk-item">
                    <input type="checkbox" value="${t.id}" ${isChecked} onchange="toggleExamTopicSelection('${t.id}')">
                    <span class="exam-topic-chk-label">
                        <strong>${sanitizeHTML(t.name)}</strong>
                        <small style="color:var(--text-muted); margin-left:6px;">(${count} ${count === 1 ? 'ejercicio' : 'ejercicios'})</small>
                    </span>
                </label>
            `;
        }).join('');
    }

    updateExamGenSummary();
}

/**
 * Alterna la selección de un tema en el configurador.
 */
function toggleExamTopicSelection(topicId) {
    if (examSelectedTopicIds.includes(topicId)) {
        examSelectedTopicIds = examSelectedTopicIds.filter(id => id !== topicId);
    } else {
        examSelectedTopicIds.push(topicId);
    }
    updateExamGenSummary();
}

/**
 * Selecciona o deselecciona todos los temas.
 */
function selectAllExamTopics(select) {
    const subjects = (appDB && Array.isArray(appDB.subjects)) ? appDB.subjects : [];
    const activeSubj = subjects.find(sub => sub.id === activeSubjectId) || subjects[0];
    if (!activeSubj) return;

    const availableTopics = (activeSubj.topics || []).filter(t => t.data && Array.isArray(t.data.ejercicios) && t.data.ejercicios.length > 0);
    examSelectedTopicIds = select ? availableTopics.map(t => t.id) : [];

    const chks = document.querySelectorAll('.exam-topic-chk-item input[type="checkbox"]');
    chks.forEach(chk => { chk.checked = select; });

    updateExamGenSummary();
}

/**
 * Cambia el número de problemas del examen.
 */
function setExamProblemCount(count, btn) {
    examProblemCount = parseInt(count, 10) || 4;
    if (btn) {
        const parent = btn.closest('.fc-number-selector');
        if (parent) {
            parent.querySelectorAll('.fc-number-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
    }
    updateExamGenSummary();
}

/**
 * Cambia el modo de puntuación (equitativo vs ponderado por probabilidad).
 */
function setExamScoreMode(mode, btn) {
    examScoreMode = mode;
    if (btn) {
        const parent = btn.closest('.exam-mode-selector');
        if (parent) {
            parent.querySelectorAll('.exam-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
    }
}

/**
 * Actualiza el contador de problemas disponibles y advertencias de baremo.
 */
function updateExamGenSummary() {
    const subjects = (appDB && Array.isArray(appDB.subjects)) ? appDB.subjects : [];
    const activeSubj = subjects.find(sub => sub.id === activeSubjectId) || subjects[0];
    if (!activeSubj) return;

    let pool = [];
    (activeSubj.topics || []).forEach(t => {
        if (examSelectedTopicIds.includes(t.id) && t.data && Array.isArray(t.data.ejercicios)) {
            t.data.ejercicios.forEach(ex => pool.push({ ex, topic: t }));
        }
    });

    const infoEl = document.getElementById('examGenSummaryText');
    const startBtn = document.getElementById('examGenSubmitBtn');

    if (pool.length === 0) {
        if (infoEl) infoEl.innerHTML = `<span style="color:#ef4444;">Debes seleccionar al menos un tema con ejercicios.</span>`;
        if (startBtn) startBtn.disabled = true;
    } else {
        const actualCount = Math.min(examProblemCount, pool.length);
        const ptsPerEx = (10 / actualCount).toFixed(2);
        if (infoEl) {
            infoEl.innerHTML = `Se generará un modelo con <strong>${actualCount} ejercicios</strong> seleccionados de un banco de <strong>${pool.length}</strong> (~${ptsPerEx} pts c/u).`;
        }
        if (startBtn) startBtn.disabled = false;
    }
}

/**
 * Genera el examen A4 en memoria y despliega la vista preliminar de impresión.
 */
function buildAndPreviewExam() {
    const subjects = (appDB && Array.isArray(appDB.subjects)) ? appDB.subjects : [];
    const activeSubj = subjects.find(sub => sub.id === activeSubjectId) || subjects[0];
    if (!activeSubj) return;

    const pool = [];
    (activeSubj.topics || []).forEach(t => {
        if (examSelectedTopicIds.includes(t.id) && t.data && Array.isArray(t.data.ejercicios)) {
            t.data.ejercicios.forEach((ex, idx) => {
                pool.push({
                    exercise: ex,
                    topicName: t.name || 'Tema',
                    topicId: t.id,
                    indexInTopic: idx
                });
            });
        }
    });

    if (pool.length === 0) {
        customAlert('No hay ejercicios seleccionados para generar el examen.', 'Atención');
        return;
    }

    // Mezcla y selección de problemas
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const count = Math.min(examProblemCount, shuffled.length);
    const selectedProblems = shuffled.slice(0, count);

    // Asignación de baremo de puntuación (suma total: 10.00 pts)
    let points = [];
    if (examScoreMode === 'weighted') {
        const totalWeight = selectedProblems.reduce((acc, p) => acc + (p.exercise.probabilidad || 50), 0);
        let accumulated = 0;
        selectedProblems.forEach((p, idx) => {
            if (idx === count - 1) {
                points.push(Number((10 - accumulated).toFixed(2)));
            } else {
                const w = (p.exercise.probabilidad || 50) / totalWeight;
                const pt = Number((w * 10).toFixed(2));
                accumulated += pt;
                points.push(pt);
            }
        });
    } else {
        const basePt = Number((10 / count).toFixed(2));
        let accumulated = 0;
        for (let i = 0; i < count; i++) {
            if (i === count - 1) {
                points.push(Number((10 - accumulated).toFixed(2)));
            } else {
                accumulated += basePt;
                points.push(basePt);
            }
        }
    }

    currentGeneratedExam = {
        subjectName: activeSubj.name || 'Asignatura',
        dateStr: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
        problems: selectedProblems.map((p, idx) => ({
            ...p,
            num: idx + 1,
            points: points[idx]
        })),
        includeGrid: document.getElementById('examGenOptGrid')?.checked ?? true,
        includeSolutions: document.getElementById('examGenOptSolutions')?.checked ?? true
    };

    closeModal('examGenModal');
    renderExamPreviewSheet();
    openModal('examPreviewModal');
}

/**
 * Renderiza el documento A4 del examen en el modal de vista previa.
 */
function renderExamPreviewSheet() {
    if (!currentGeneratedExam) return;

    const container = document.getElementById('examPreviewContent');
    if (!container) return;

    const { subjectName, dateStr, problems, includeGrid, includeSolutions } = currentGeneratedExam;

    // Encabezado Oficial Universitario
    let html = `
        <div class="exam-a4-sheet" id="examPrintArea">
            <header class="exam-a4-header">
                <div class="exam-header-top">
                    <div>
                        <div class="exam-univ-badge">EVALUACIÓN OFICIAL DE DOMINIO STEM</div>
                        <h1 class="exam-subject-title">${sanitizeHTML(subjectName)}</h1>
                        <div class="exam-meta-line">Convocatoria Oficial Ordinaria • Tiempo Límite: <strong>120 minutos</strong> • Fecha: <strong>${dateStr}</strong></div>
                    </div>
                    <div class="exam-grade-box">
                        <div class="exam-grade-title">CALIFICACIÓN</div>
                        <div class="exam-grade-score">___ / 10.00</div>
                    </div>
                </div>

                <div class="exam-student-fields">
                    <div class="exam-field-item">
                        <span class="exam-field-label">Apellidos y Nombre:</span>
                        <div class="exam-field-line"></div>
                    </div>
                    <div class="exam-field-item" style="max-width: 200px;">
                        <span class="exam-field-label">DNI / NIE:</span>
                        <div class="exam-field-line"></div>
                    </div>
                    <div class="exam-field-item" style="max-width: 140px;">
                        <span class="exam-field-label">Grupo:</span>
                        <div class="exam-field-line"></div>
                    </div>
                </div>

                <table class="exam-breakdown-table">
                    <thead>
                        <tr>
                            ${problems.map(p => `<th>Prob ${p.num}</th>`).join('')}
                            <th class="exam-th-total">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            ${problems.map(p => `<td><strong>${p.points.toFixed(2)}</strong></td>`).join('')}
                            <td class="exam-td-total">10.00</td>
                        </tr>
                        <tr class="exam-tr-nota">
                            ${problems.map(() => `<td></td>`).join('')}
                            <td class="exam-td-total"></td>
                        </tr>
                    </tbody>
                </table>

                <div class="exam-instructions-box">
                    <strong>NORMAS Y CRITERIOS GENERALES:</strong>
                    <ol>
                        <li>Justifique razonadamente todos los pasos matemáticos y algorítmicos. Las respuestas sin planteamiento no puntúan.</li>
                        <li>Identifique con precisión las condiciones previas del enunciado antes de aplicar cualquier fórmula o algoritmo.</li>
                        <li>Cuide el rigor, la claridad de la notación matemática y la limpieza del desarrollo.</li>
                    </ol>
                </div>
            </header>

            <div class="exam-problems-body">
    `;

    // Renderizar cada problema
    problems.forEach(p => {
        const ex = p.exercise;
        const exTitle = processTextWithCitations(ex.title || 'Problema').text;
        const exContext = ex.ejemploCompleto 
            ? processTextWithCitations(ex.ejemploCompleto).text 
            : (Array.isArray(ex.identificacion) && ex.identificacion.length > 0 
                ? `Enunciado Tipo: Dado el planteamiento sobre ${exTitle.toLowerCase()}, determine y desarrolle la solución analítica completa.` 
                : 'Desarrolle analíticamente el problema propuesto especificando el algoritmo a aplicar y el resultado final simplificado.');

        html += `
            <article class="exam-problem-block">
                <div class="exam-prob-header">
                    <span class="exam-prob-badge">PROBLEMA ${p.num}</span>
                    <span class="exam-prob-pts">[Puntuación Máxima: <strong>${p.points.toFixed(2)} pts</strong>]</span>
                    <span class="exam-prob-topic">Tema: ${sanitizeHTML(p.topicName)}</span>
                </div>
                
                <h2 class="exam-prob-title">${exTitle}</h2>
                <div class="exam-prob-statement">${exContext}</div>

                ${includeGrid ? `
                    <div class="exam-draft-grid-box" title="Espacio pautado para desarrollo de cálculo">
                        <div class="exam-draft-watermark">ESPACIO DE DESARROLLO Y CÁLCULO — PROBLEMA ${p.num}</div>
                    </div>
                ` : ''}
            </article>
        `;
    });

    html += `</div>`; // fin exam-problems-body

    // Sección de Solucionario y Criterios de Corrección (si está activada)
    if (includeSolutions) {
        html += `
            <div class="exam-solutions-section">
                <div class="exam-solutions-header">
                    <div class="exam-sol-badge">PLANTILLA DE CORRECCIÓN OFICIAL</div>
                    <h2 style="margin: 4px 0 0; font-size: 1.2rem; color: #1e293b;">Criterios de Puntuación y Solucionario Paso a Paso</h2>
                    <p style="margin: 2px 0 0; font-size: 0.8rem; color: #64748b;">Desglose de baremación analítica, puntos críticos y trampas de examen para autocorrección.</p>
                </div>

                <div class="exam-solutions-grid">
        `;

        problems.forEach(p => {
            const ex = p.exercise;
            const exTitle = processTextWithCitations(ex.title || 'Problema').text;
            const stepPts = Array.isArray(ex.algoritmo) && ex.algoritmo.length > 0 
                ? (p.points / ex.algoritmo.length).toFixed(2) 
                : p.points.toFixed(2);

            html += `
                <div class="exam-sol-card">
                    <div class="exam-sol-card-header">
                        <strong>Problema ${p.num}: ${exTitle}</strong>
                        <span class="exam-sol-pts-tag">${p.points.toFixed(2)} pts</span>
                    </div>

                    ${Array.isArray(ex.identificacion) && ex.identificacion.length > 0 ? `
                        <div class="exam-sol-subbox">
                            <strong>1. Criterios de Reconocimiento Esperados:</strong>
                            <ul>
                                ${ex.identificacion.map(id => `<li>${processTextWithCitations(id).text}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${Array.isArray(ex.algoritmo) && ex.algoritmo.length > 0 ? `
                        <div class="exam-sol-subbox">
                            <strong>2. Desglose de Pasos y Baremación (~${stepPts} pts por paso):</strong>
                            <ol>
                                ${ex.algoritmo.map((st, sIdx) => `
                                    <li>
                                        <strong>Paso ${sIdx + 1}: ${processTextWithCitations(st.title || '').text}</strong>
                                        <div style="font-size:0.82rem; color:#475569;">${processTextWithCitations(st.subtitle || '').text}</div>
                                        ${st.example ? `<div style="font-size:0.8rem; margin-top:2px;">${processTextWithCitations(st.example).text}</div>` : ''}
                                    </li>
                                `).join('')}
                            </ol>
                        </div>
                    ` : ''}

                    ${((ex.trampas && ex.trampas.length > 0) || (ex.errores && ex.errores.length > 0)) ? `
                        <div class="exam-sol-subbox" style="border-left: 3px solid #ef4444; background: #fef2f2; padding: 6px 10px; border-radius: 4px;">
                            <strong style="color: #991b1b;">3. Penalizaciones y Trampas de Tribunal:</strong>
                            <ul style="margin: 4px 0 0; padding-left: 18px; color: #7f1d1d; font-size: 0.8rem;">
                                ${[...(ex.trampas || []), ...(ex.errores || [])].map(tr => `
                                    <li>
                                        <strong>${processTextWithCitations(tr.title || 'Alerta').text}:</strong> ${processTextWithCitations(tr.content || '').text}
                                        ${tr.fix ? ` <em style="color:#065f46;">(Regla: ${processTextWithCitations(tr.fix).text})</em>` : ''}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    }

    html += `</div>`; // fin exam-a4-sheet

    container.innerHTML = html;

    // Ejecutar renderizado asíncrono seguro de fórmulas MathJax
    if (typeof forceMathRender === 'function') {
        forceMathRender([container]);
    }
}

/**
 * Lanza el diálogo nativo de impresión configurado estrictamente para A4.
 */
function printGeneratedExam() {
    window.print();
}
