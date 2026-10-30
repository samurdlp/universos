/**
 * Buscador Global de UniverSOS
 * Permite buscar en tiempo real fórmulas, conceptos, temas, ejercicios y trucos
 * a través de todo el conocimiento universitario almacenado.
 */

function openSearchModal() {
    openModal('searchModal');
    const input = document.getElementById('globalSearchInput');
    if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 100);
    }
    renderSearchResults('');
}

function closeSearchModal() {
    closeModal('searchModal');
}

function handleSearchKeydown(e) {
    if (e.key === 'Escape') {
        closeSearchModal();
    }
}

function initSearchShortcut() {
    document.addEventListener('keydown', (e) => {
        // Atajo Ctrl+K o Cmd+K para abrir el buscador
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            const modal = document.getElementById('searchModal');
            if (modal && modal.classList.contains('active')) {
                closeSearchModal();
            } else {
                openSearchModal();
            }
        }
    });

    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderSearchResults(e.target.value.trim());
        });
    }
}

function renderSearchResults(query) {
    const container = document.getElementById('searchResults');
    if (!container) return;

    if (!query || query.length < 2) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px 20px; color:var(--text-muted); font-size:0.9rem;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:8px; opacity:0.6;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <div>Escribe al menos 2 letras para buscar fórmulas, teoremas, pasos o ejercicios...</div>
            </div>
        `;
        return;
    }

    const q = query.toLowerCase();
    const results = [];

    // Recorrer toda la base de datos
    appDB.subjects.forEach(subj => {
        // Coincidencia en Asignatura
        if (subj.name.toLowerCase().includes(q)) {
            results.push({
                type: 'Asignatura',
                badgeClass: 'badge-subj',
                title: subj.name,
                snippet: `Asignatura con ${subj.topics.length} temas`,
                subjId: subj.id,
                topicId: subj.topics.length > 0 ? subj.topics[0].id : null,
                actionType: 'subject',
                actionIdx: null
            });
        }

        subj.topics.forEach(topic => {
            // Coincidencia en Tema
            if (topic.name.toLowerCase().includes(q)) {
                results.push({
                    type: 'Tema',
                    badgeClass: 'badge-topic',
                    title: topic.name,
                    snippet: `${subj.name} > ${topic.name}`,
                    subjId: subj.id,
                    topicId: topic.id,
                    actionType: 'topic',
                    actionIdx: null
                });
            }

            const data = topic.data || {};

            // Coincidencia en Teoría
            if (data.teoria) {
                const teo = data.teoria;
                if (teo.title && teo.title.toLowerCase().includes(q)) {
                    results.push({
                        type: 'Teoría',
                        badgeClass: 'badge-theory',
                        title: teo.title,
                        snippet: `${subj.name} > ${topic.name} > Título de Teoría`,
                        subjId: subj.id,
                        topicId: topic.id,
                        actionType: 'theory',
                        actionIdx: null
                    });
                }
                if (teo.introduccion && teo.introduccion.toLowerCase().includes(q)) {
                    results.push({
                        type: 'Teoría',
                        badgeClass: 'badge-theory',
                        title: teo.title || 'Introducción teórica',
                        snippet: getSnippet(teo.introduccion, q),
                        subjId: subj.id,
                        topicId: topic.id,
                        actionType: 'theory',
                        actionIdx: null
                    });
                }
                if (teo.secciones) {
                    teo.secciones.forEach(sec => {
                        if ((sec.title && sec.title.toLowerCase().includes(q)) || (sec.content && sec.content.toLowerCase().includes(q))) {
                            results.push({
                                type: 'Sección',
                                badgeClass: 'badge-theory',
                                title: sec.title || 'Sección teórica',
                                snippet: getSnippet(sec.content || sec.title, q),
                                subjId: subj.id,
                                topicId: topic.id,
                                actionType: 'theory',
                                actionIdx: null
                            });
                        }
                    });
                }
                if (teo.checklistClave) {
                    teo.checklistClave.forEach(item => {
                        const itemStr = typeof item === 'string' ? item : `${item.title} ${item.subtitle}`;
                        if (itemStr.toLowerCase().includes(q)) {
                            results.push({
                                type: 'Concepto Clave',
                                badgeClass: 'badge-theory',
                                title: 'Concepto de examen',
                                snippet: getSnippet(itemStr, q),
                                subjId: subj.id,
                                topicId: topic.id,
                                actionType: 'theory',
                                actionIdx: null
                            });
                        }
                    });
                }
            }

            // Coincidencia en Ejercicios
            if (data.ejercicios) {
                data.ejercicios.forEach((ex, exIdx) => {
                    let matched = false;
                    let matchSnippet = '';
                    let matchCategory = 'Ejercicio';

                    if (ex.title && ex.title.toLowerCase().includes(q)) {
                        matched = true;
                        matchSnippet = `${subj.name} > ${topic.name} (Probabilidad: ${ex.probabilidad}%)`;
                    } else if (ex.identificacion && ex.identificacion.some(id => id.toLowerCase().includes(q))) {
                        matched = true;
                        matchCategory = 'Pistas';
                        matchSnippet = getSnippet(ex.identificacion.join(' | '), q);
                    } else if (ex.algoritmo && ex.algoritmo.some(st => (st.title + st.subtitle + st.example).toLowerCase().includes(q))) {
                        matched = true;
                        matchCategory = 'Paso a Paso';
                        const foundStep = ex.algoritmo.find(st => (st.title + st.subtitle + st.example).toLowerCase().includes(q));
                        matchSnippet = getSnippet(`${foundStep.title}: ${foundStep.subtitle} ${foundStep.example}`, q);
                    } else if (ex.ejemploCompleto && ex.ejemploCompleto.toLowerCase().includes(q)) {
                        matched = true;
                        matchCategory = 'Ejemplo Resuelto';
                        matchSnippet = getSnippet(ex.ejemploCompleto, q);
                    } else if (ex.trucos && ex.trucos.some(tr => (tr.title + tr.content).toLowerCase().includes(q))) {
                        matched = true;
                        matchCategory = 'Truco';
                        const foundTr = ex.trucos.find(tr => (tr.title + tr.content).toLowerCase().includes(q));
                        matchSnippet = getSnippet(foundTr.title + ': ' + foundTr.content, q);
                    } else if (ex.trampas && ex.trampas.some(tr => (tr.title + tr.content).toLowerCase().includes(q))) {
                        matched = true;
                        matchCategory = 'Trampa';
                        const foundTr = ex.trampas.find(tr => (tr.title + tr.content).toLowerCase().includes(q));
                        matchSnippet = getSnippet(foundTr.title + ': ' + foundTr.content, q);
                    }

                    if (matched) {
                        results.push({
                            type: matchCategory,
                            badgeClass: 'badge-ex',
                            title: ex.title,
                            snippet: matchSnippet,
                            subjId: subj.id,
                            topicId: topic.id,
                            actionType: 'exercise',
                            actionIdx: exIdx
                        });
                    }
                });
            }
        });
    });

    if (results.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px 20px; color:var(--text-muted); font-size:0.9rem;">
                No se encontraron resultados para "<strong>${sanitizeHTML(query)}</strong>".
            </div>
        `;
        return;
    }

    let html = `<div class="search-results-list">`;
    results.slice(0, 30).forEach((res, i) => {
        const escapedQ = query.replace(/'/g, "\\'");
        html += `
            <div class="search-result-item" onclick="navigateToSearchResult('${res.subjId}', '${res.topicId || ''}', '${res.actionType}', ${res.actionIdx}, '${escapedQ}')">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <span class="search-item-type ${res.badgeClass}">${res.type}</span>
                    <span style="font-size:0.75rem; color:var(--text-muted);">↵ Clic para abrir y ver</span>
                </div>
                <div class="search-item-title">${highlightMatch(sanitizeHTML(res.title), query)}</div>
                <div class="search-item-snippet">${highlightMatch(sanitizeHTML(res.snippet), query)}</div>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;

    forceMathRender([container]);
}

function getSnippet(text, query) {
    if (!text) return '';
    const clean = text.replace(/<[^>]*>/g, '');
    const idx = clean.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return clean.substring(0, 100);
    const start = Math.max(0, idx - 40);
    const end = Math.min(clean.length, idx + query.length + 60);
    return (start > 0 ? '...' : '') + clean.substring(start, end) + (end < clean.length ? '...' : '');
}

function highlightMatch(text, query) {
    if (!query) return text;
    // Resaltar sin romper entidades HTML ni fórmulas
    const safeQ = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeQ})`, 'gi');
    return text.replace(regex, '<mark class="search-hl">$1</mark>');
}

function navigateToSearchResult(subjId, topicId, actionType, actionIdx, query) {
    closeSearchModal();
    
    activeSubjectId = subjId;
    localStorage.setItem(ACTIVE_SUBJ_KEY, subjId);

    if (topicId) {
        activeTopicId = topicId;
        localStorage.setItem(ACTIVE_TOPIC_KEY, topicId);
    } else {
        activeTopicId = null;
        localStorage.removeItem(ACTIVE_TOPIC_KEY);
    }
    
    renderDropdowns();
    
    if (activeTopicId) {
        renderTopicExercises();
        if (actionType === 'theory') {
            selectTheory();
        } else if (actionType === 'exercise' && actionIdx !== null && actionIdx !== undefined) {
            selectExercise(actionIdx);
        }

        // Resaltar el segmento buscado en el contenido renderizado
        if (query && query.length >= 2) {
            setTimeout(() => {
                highlightAndScrollToQuery(query);
            }, 300);
        }
    }
}

function highlightAndScrollToQuery(query) {
    const container = document.getElementById('exercise-content');
    if (!container || !query) return;

    // Quitar cualquier resaltado temporal previo
    container.querySelectorAll('mark.search-target-highlight').forEach(m => {
        m.replaceWith(...m.childNodes);
    });

    const qLower = query.toLowerCase();
    const walk = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    let targetNode = null;
    let matchIdx = -1;
    let n;
    while ((n = walk.nextNode())) {
        if (n.parentElement && !['SCRIPT', 'STYLE', 'MARK', 'CODE'].includes(n.parentElement.tagName) && !n.parentElement.closest('mjx-container')) {
            const idx = n.nodeValue.toLowerCase().indexOf(qLower);
            if (idx !== -1) {
                targetNode = n;
                matchIdx = idx;
                break;
            }
        }
    }

    if (targetNode && matchIdx !== -1) {
        try {
            // Manipulación segura del nodo de texto sin alterar innerHTML ni desincronizar MathJax
            const matchText = targetNode.nodeValue.substring(matchIdx, matchIdx + query.length);
            const afterText = targetNode.splitText(matchIdx);
            afterText.splitText(query.length);

            const mark = document.createElement('mark');
            mark.className = 'search-target-highlight';
            mark.textContent = matchText;

            afterText.parentNode.replaceChild(mark, afterText);
            mark.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Desvanecer y retirar tras 3.5 segundos
            setTimeout(() => {
                mark.classList.add('fade-out');
                setTimeout(() => {
                    if (mark.parentNode) {
                        mark.replaceWith(...mark.childNodes);
                    }
                }, 500);
            }, 3500);
        } catch (e) {
            console.warn('Highlight search warning:', e);
        }
    }
}
