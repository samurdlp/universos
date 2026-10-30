/**
 * Sincronización en la Nube Simplificada y Protegida (Supabase / REST Cloud)
 * 
 * - A primera vista solo solicita el ID de Usuario y (opcionalmente) una Contraseña/PIN.
 * - La URL y Anon API Key se cargan por defecto y permanecen ocultas bajo "Ajustes de Servidor".
 * - Si se introduce contraseña, deriva un identificador criptográfico SHA-256 para impedir
 *   que terceros puedan leer o sobrescribir los apuntes aunque la Anon Key sea pública.
 */

// Valores por defecto del proyecto Supabase (puedes pegarlos aquí para dejarlos fijos en el código)
const DEFAULT_SUPABASE_URL = '';
const DEFAULT_SUPABASE_KEY = '';

let autoSyncTimeout = null;

function getCloudConfig() {
    const storedUrl = (localStorage.getItem('universos_supabase_url') || DEFAULT_SUPABASE_URL || '').trim().replace(/\/+$/, '');
    const storedKey = (localStorage.getItem('universos_supabase_key') || DEFAULT_SUPABASE_KEY || '').trim();
    const syncId = (localStorage.getItem('universos_sync_id') || '').trim() || generateDefaultSyncId();
    const syncPass = (localStorage.getItem('universos_sync_pass') || '').trim();
    const autoSync = localStorage.getItem('universos_auto_sync') === 'true';

    return {
        url: storedUrl,
        key: storedKey,
        syncId,
        syncPass,
        autoSync
    };
}

function generateDefaultSyncId() {
    const id = 'estudiante_' + Math.random().toString(36).substring(2, 8);
    localStorage.setItem('universos_sync_id', id);
    return id;
}

async function computeEffectiveSyncKey(syncId, syncPass) {
    const cleanId = (syncId || 'default').trim();
    const cleanPass = (syncPass || '').trim();
    if (!cleanPass) return cleanId;

    const raw = `${cleanId}::universos_salt_v2::${cleanPass}`;
    if (window.crypto && window.crypto.subtle) {
        try {
            const msgBuffer = new TextEncoder().encode(raw);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 20);
            return `${cleanId}_sec_${hashHex}`;
        } catch (e) {
            // Fallback determinista si se ejecuta en contexto sin WebCrypto (ej. file://)
        }
    }

    let h1 = 0xdeadbeef ^ raw.length;
    let h2 = 0x41c6ce57 ^ raw.length;
    for (let i = 0, ch; i < raw.length; i++) {
        ch = raw.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const hex = (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
    return `${cleanId}_sec_${hex}`;
}

function toggleCloudAdvancedSettings() {
    const panel = document.getElementById('cloudAdvancedPanel');
    const chevron = document.getElementById('cloudAdvChevron');
    if (panel) {
        const isOpen = panel.classList.toggle('open');
        if (chevron) {
            chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    }
}

function openCloudModal() {
    const cfg = getCloudConfig();
    
    const urlInput = document.getElementById('cloudUrlInput');
    const keyInput = document.getElementById('cloudKeyInput');
    const syncIdInput = document.getElementById('cloudSyncIdInput');
    const syncPassInput = document.getElementById('cloudSyncPassInput');
    const autoSyncCheck = document.getElementById('cloudAutoSyncCheck');
    const statusDiv = document.getElementById('cloudStatusDiv');
    const advPanel = document.getElementById('cloudAdvancedPanel');
    const chevron = document.getElementById('cloudAdvChevron');

    if (urlInput) urlInput.value = cfg.url;
    if (keyInput) keyInput.value = cfg.key;
    if (syncIdInput) syncIdInput.value = cfg.syncId;
    if (syncPassInput) syncPassInput.value = cfg.syncPass;
    if (autoSyncCheck) autoSyncCheck.checked = cfg.autoSync;

    // Por defecto el panel de servidor (URL, Key, SQL) permanece escondido salvo que falten credenciales
    if (advPanel) {
        if (!cfg.url || !cfg.key) {
            advPanel.classList.add('open');
            if (chevron) chevron.style.transform = 'rotate(180deg)';
        } else {
            advPanel.classList.remove('open');
            if (chevron) chevron.style.transform = 'rotate(0deg)';
        }
    }
    
    if (statusDiv) {
        if (cfg.url && cfg.key) {
            const lockLabel = cfg.syncPass ? ' (Protegido con Contraseña)' : '';
            statusDiv.innerHTML = `<span style="color:var(--c-truco); font-weight:700;">● Servidor Conectado</span> — ID: <code>${sanitizeHTML(cfg.syncId)}</code>${lockLabel}`;
        } else {
            statusDiv.innerHTML = `<span style="color:var(--c-error); font-weight:700;">● Servidor pendiente de configurar</span>. Introduce por única vez la URL y Anon Key en el apartado inferior de Ajustes de Servidor.`;
        }
    }

    openModal('cloudModal');
}

function saveCloudSettings(silent = false) {
    const urlEl = document.getElementById('cloudUrlInput');
    const keyEl = document.getElementById('cloudKeyInput');
    const syncIdEl = document.getElementById('cloudSyncIdInput');
    const syncPassEl = document.getElementById('cloudSyncPassInput');
    const autoSyncEl = document.getElementById('cloudAutoSyncCheck');

    const url = (urlEl ? urlEl.value : '').trim().replace(/\/+$/, '') || DEFAULT_SUPABASE_URL;
    const key = (keyEl ? keyEl.value : '').trim() || DEFAULT_SUPABASE_KEY;
    const syncId = (syncIdEl ? syncIdEl.value : '').trim() || generateDefaultSyncId();
    const syncPass = (syncPassEl ? syncPassEl.value : '').trim();
    const autoSync = autoSyncEl ? autoSyncEl.checked : false;

    if (url) localStorage.setItem('universos_supabase_url', url);
    if (key) localStorage.setItem('universos_supabase_key', key);
    localStorage.setItem('universos_sync_id', syncId);
    localStorage.setItem('universos_sync_pass', syncPass);
    localStorage.setItem('universos_auto_sync', autoSync ? 'true' : 'false');

    if (!silent) {
        const statusDiv = document.getElementById('cloudStatusDiv');
        if (statusDiv) {
            statusDiv.innerHTML = `<span style="color:var(--c-truco); font-weight:700;">Ajustes guardados correctamente.</span>`;
        }
    }
}

function copyCloudMobileMagicLink() {
    saveCloudSettings(true);
    const cfg = getCloudConfig();
    if (!cfg.url || !cfg.key) {
        customAlert('Introduce primero la Project URL y la Anon Key de Supabase para generar el enlace de auto-configuración.', 'Faltan Datos del Servidor');
        return;
    }

    const payloadObj = {
        u: cfg.url,
        k: cfg.key,
        id: cfg.syncId
    };
    const encoded = btoa(encodeURIComponent(JSON.stringify(payloadObj)));
    const baseUrl = window.location.href.split('#')[0];
    const magicLink = `${baseUrl}#cloud_cfg=${encoded}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(magicLink).then(() => {
            customAlert('¡Enlace mágico copiado al portapapeles!<br><br>Envíatelo a tu móvil o tablet (por WhatsApp, Telegram o notas). Al abrirlo una sola vez, tu móvil guardará la URL y API Key automáticamente para siempre.', 'Enlace Mágico Copiado');
        }).catch(() => {
            prompt('Copia este enlace y ábrelo en tu móvil:', magicLink);
        });
    } else {
        prompt('Copia este enlace y ábrelo en tu móvil:', magicLink);
    }
}

function checkUrlCloudMagicConfig() {
    const hash = window.location.hash || '';
    if (hash.startsWith('#cloud_cfg=')) {
        try {
            const encoded = hash.replace('#cloud_cfg=', '').trim();
            const decoded = JSON.parse(decodeURIComponent(atob(encoded)));
            if (decoded.u && decoded.k) {
                localStorage.setItem('universos_supabase_url', decoded.u);
                localStorage.setItem('universos_supabase_key', decoded.k);
                if (decoded.id) localStorage.setItem('universos_sync_id', decoded.id);
                localStorage.setItem('universos_auto_sync', 'true');
                history.replaceState(null, document.title, window.location.pathname + window.location.search);
                setTimeout(() => {
                    customAlert('¡Servidor Supabase configurado automáticamente en este dispositivo! Ahora solo necesitas tu ID y pulsar Descargar.', 'Sincronización Lista');
                }, 400);
            }
        } catch (e) {
            console.warn('No se pudo leer cloud_cfg de la URL:', e);
        }
    }
}

function normalizeCompareName(str) {
    if (!str || typeof str !== 'string') return '';
    return str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Fusión Inteligente y No Destructiva de Bases de Datos
 * Combina asignaturas, temas y ejercicios sin sobrescribir ni duplicar elementos existentes.
 */
function mergeDatabasesSafely(baseDB, incomingDB) {
    if (!incomingDB || !Array.isArray(incomingDB.subjects)) return baseDB || { subjects: [] };
    if (!baseDB || !Array.isArray(baseDB.subjects)) {
        return JSON.parse(JSON.stringify(incomingDB));
    }

    const merged = JSON.parse(JSON.stringify(baseDB));

    incomingDB.subjects.forEach(incSubj => {
        const incNorm = normalizeCompareName(incSubj.name);
        let targetSubj = merged.subjects.find(s => 
            s.id === incSubj.id || 
            normalizeCompareName(s.name) === incNorm || 
            (s.aliases && s.aliases.some(a => normalizeCompareName(a) === incNorm))
        );

        if (!targetSubj) {
            // Asignatura nueva que no existía: añadir completa
            merged.subjects.push(JSON.parse(JSON.stringify(incSubj)));
            return;
        }

        // Si ya existe la asignatura, fusionar sus temas
        if (!Array.isArray(targetSubj.topics)) targetSubj.topics = [];
        if (!Array.isArray(incSubj.topics)) return;

        incSubj.topics.forEach(incTopic => {
            const incTopNorm = normalizeCompareName(incTopic.name);
            let targetTopic = targetSubj.topics.find(t => 
                t.id === incTopic.id || 
                normalizeCompareName(t.name) === incTopNorm || 
                (t.aliases && t.aliases.some(a => normalizeCompareName(a) === incTopNorm))
            );

            if (!targetTopic) {
                // Tema nuevo que no existía: añadirlo
                targetSubj.topics.push(JSON.parse(JSON.stringify(incTopic)));
                return;
            }

            // Si el tema existe en ambos, fusionar datos (teoría y ejercicios)
            if (!targetTopic.data) targetTopic.data = {};
            const incData = incTopic.data || {};

            // 1. Fusión de Teoría
            if (!targetTopic.data.teoria && incData.teoria) {
                targetTopic.data.teoria = JSON.parse(JSON.stringify(incData.teoria));
            } else if (targetTopic.data.teoria && incData.teoria) {
                // Fusionar checklist de conceptos clave sin duplicar
                if (Array.isArray(incData.teoria.checklistClave)) {
                    if (!Array.isArray(targetTopic.data.teoria.checklistClave)) {
                        targetTopic.data.teoria.checklistClave = [];
                    }
                    incData.teoria.checklistClave.forEach(incItem => {
                        const incItemText = typeof incItem === 'string' ? incItem : (incItem.title || '');
                        const incItemNorm = normalizeCompareName(incItemText);
                        const exists = targetTopic.data.teoria.checklistClave.some(tItem => {
                            const tText = typeof tItem === 'string' ? tItem : (tItem.title || '');
                            return normalizeCompareName(tText) === incItemNorm;
                        });
                        if (!exists) {
                            targetTopic.data.teoria.checklistClave.push(JSON.parse(JSON.stringify(incItem)));
                        }
                    });
                }
                // Si la versión entrante tiene nivel de dominio superior, actualizar
                const masteryWeight = { 'mastered': 3, 'review': 2, 'doubt': 1, 'none': 0 };
                const curTheoW = masteryWeight[targetTopic.data.teoria.mastery || 'none'] || 0;
                const incTheoW = masteryWeight[incData.teoria.mastery || 'none'] || 0;
                if (incTheoW > curTheoW) {
                    targetTopic.data.teoria.mastery = incData.teoria.mastery;
                }
            }

            // 2. Fusión de Ejercicios (sin repetir por título)
            if (!Array.isArray(targetTopic.data.ejercicios)) targetTopic.data.ejercicios = [];
            if (Array.isArray(incData.ejercicios)) {
                incData.ejercicios.forEach(incEx => {
                    const incExNorm = normalizeCompareName(incEx.title);
                    const existingEx = targetTopic.data.ejercicios.find(e => normalizeCompareName(e.title) === incExNorm);
                    if (!existingEx) {
                        targetTopic.data.ejercicios.push(JSON.parse(JSON.stringify(incEx)));
                    } else {
                        // Preservar estado de dominio más avanzado
                        const masteryWeight = { 'mastered': 3, 'review': 2, 'doubt': 1, 'none': 0 };
                        const curW = masteryWeight[existingEx.mastery || 'none'] || 0;
                        const incW = masteryWeight[incEx.mastery || 'none'] || 0;
                        if (incW > curW) {
                            existingEx.mastery = incEx.mastery;
                        }
                    }
                });
            }
        });
    });

    return merged;
}

async function pushToCloud() {
    saveCloudSettings(true);
    const cfg = getCloudConfig();
    const statusDiv = document.getElementById('cloudStatusDiv');

    if (!cfg.url || !cfg.key) {
        const advPanel = document.getElementById('cloudAdvancedPanel');
        if (advPanel) advPanel.classList.add('open');
        customAlert('Configura por primera vez la URL y la Anon Key de Supabase en la sección "Ajustes de Servidor".', 'Configuración Requerida');
        return;
    }

    if (statusDiv) statusDiv.innerHTML = `<span style="color:var(--primary); font-weight:600;">Comprobando datos remotos y fusionando...</span>`;

    try {
        const effectiveKey = await computeEffectiveSyncKey(cfg.syncId, cfg.syncPass);

        // 1. Obtener datos existentes en la nube antes de subir para no perder asignaturas previas
        let mergedDB = appDB;
        try {
            const checkRes = await fetch(`${cfg.url}/rest/v1/universos_sync?id=eq.${encodeURIComponent(effectiveKey)}&select=*`, {
                method: 'GET',
                headers: {
                    'apikey': cfg.key,
                    'Authorization': `Bearer ${cfg.key}`,
                    'Content-Type': 'application/json'
                }
            });
            if (checkRes.ok) {
                const existingRecords = await checkRes.json();
                if (existingRecords && existingRecords.length > 0 && existingRecords[0].data) {
                    mergedDB = mergeDatabasesSafely(existingRecords[0].data, appDB);
                }
            }
        } catch (fetchErr) {
            console.warn('No se pudo verificar base remota previa; continuando con datos locales:', fetchErr);
        }

        // 2. Persistir localmente el resultado fusionado
        appDB = mergedDB;
        saveDB();
        renderDropdowns();
        if (activeTopicId) renderTopicExercises();

        // 3. Subir la base de datos combinada
        const payload = {
            id: effectiveKey,
            data: mergedDB,
            updated_at: new Date().toISOString()
        };

        const response = await fetch(`${cfg.url}/rest/v1/universos_sync?on_conflict=id`, {
            method: 'POST',
            headers: {
                'apikey': cfg.key,
                'Authorization': `Bearer ${cfg.key}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates,return=minimal'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errText}`);
        }

        const totalSubjs = mergedDB.subjects.length;
        const totalTopics = mergedDB.subjects.reduce((acc, s) => acc + (s.topics ? s.topics.length : 0), 0);

        if (statusDiv) {
            statusDiv.innerHTML = `<span style="color:var(--c-truco); font-weight:700;">¡Sincronizado y fusionado con éxito!</span> ${totalSubjs} asignaturas y ${totalTopics} temas sincronizados bajo <code>${sanitizeHTML(cfg.syncId)}</code> sin duplicados.`;
        } else {
            customAlert(`¡Sincronizado con éxito! Se han fusionado los apuntes nuevos con los ya existentes en la nube (${totalSubjs} asignaturas, ${totalTopics} temas).`);
        }
    } catch (e) {
        console.error('Error al sincronizar con Supabase:', e);
        if (statusDiv) {
            statusDiv.innerHTML = `<span style="color:var(--c-trampa); font-weight:700;">Error al sincronizar:</span> ${sanitizeHTML(e.message)}`;
        } else {
            customAlert('Error al conectar con la nube: ' + e.message, 'Error de Sincronización');
        }
    }
}

async function pullFromCloud() {
    saveCloudSettings(true);
    const cfg = getCloudConfig();
    const statusDiv = document.getElementById('cloudStatusDiv');

    if (!cfg.url || !cfg.key) {
        const advPanel = document.getElementById('cloudAdvancedPanel');
        if (advPanel) advPanel.classList.add('open');
        customAlert('Configura primero la URL y la Anon Key de Supabase en "Ajustes de Servidor".', 'Configuración Requerida');
        return;
    }

    if (statusDiv) statusDiv.innerHTML = `<span style="color:var(--primary); font-weight:600;">Descargando apuntes desde la nube y combinando...</span>`;

    try {
        const effectiveKey = await computeEffectiveSyncKey(cfg.syncId, cfg.syncPass);
        const response = await fetch(`${cfg.url}/rest/v1/universos_sync?id=eq.${encodeURIComponent(effectiveKey)}&select=*`, {
            method: 'GET',
            headers: {
                'apikey': cfg.key,
                'Authorization': `Bearer ${cfg.key}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errText}`);
        }

        const data = await response.json();
        if (!data || data.length === 0 || !data[0].data) {
            const passHint = cfg.syncPass ? ' Verifica que el ID y la contraseña coincidan con los que usaste al subir.' : '';
            if (statusDiv) {
                statusDiv.innerHTML = `<span style="color:var(--c-error); font-weight:700;">No se encontraron datos</span> para <code>${sanitizeHTML(cfg.syncId)}</code>.${passHint}`;
            } else {
                customAlert(`No hay datos en la nube para "${cfg.syncId}".${passHint}`);
            }
            return;
        }

        // Fusión inteligente: nunca borra apuntes locales nuevos que no estuvieran en la nube
        appDB = mergeDatabasesSafely(appDB, data[0].data);
        saveDB();
        activeSubjectId = appDB.subjects.length > 0 ? appDB.subjects[0].id : null;
        activeTopicId = (activeSubjectId && appDB.subjects[0].topics.length > 0) ? appDB.subjects[0].topics[0].id : null;
        renderDropdowns();
        if (activeTopicId) renderTopicExercises();

        const totalSubjs = appDB.subjects.length;
        const totalTopics = appDB.subjects.reduce((acc, s) => acc + (s.topics ? s.topics.length : 0), 0);

        if (statusDiv) {
            statusDiv.innerHTML = `<span style="color:var(--c-truco); font-weight:700;">¡Datos fusionados con éxito!</span> Dispones de ${totalSubjs} asignaturas y ${totalTopics} temas.`;
        }
        closeModal('cloudModal');
    } catch (e) {
        console.error('Error al descargar de Supabase:', e);
        if (statusDiv) {
            statusDiv.innerHTML = `<span style="color:var(--c-trampa); font-weight:700;">Error al descargar:</span> ${sanitizeHTML(e.message)}`;
        } else {
            customAlert('Error al descargar desde la nube: ' + e.message, 'Error de Sincronización');
        }
    }
}

function triggerAutoSync() {
    const cfg = getCloudConfig();
    if (!cfg.autoSync || !cfg.url || !cfg.key) return;

    if (autoSyncTimeout) clearTimeout(autoSyncTimeout);
    autoSyncTimeout = setTimeout(() => {
        pushToCloudSilent();
    }, 3000);
}

async function pushToCloudSilent() {
    const cfg = getCloudConfig();
    if (!cfg.url || !cfg.key) return;
    try {
        const effectiveKey = await computeEffectiveSyncKey(cfg.syncId, cfg.syncPass);
        let mergedDB = appDB;
        try {
            const checkRes = await fetch(`${cfg.url}/rest/v1/universos_sync?id=eq.${encodeURIComponent(effectiveKey)}&select=*`, {
                method: 'GET',
                headers: {
                    'apikey': cfg.key,
                    'Authorization': `Bearer ${cfg.key}`,
                    'Content-Type': 'application/json'
                }
            });
            if (checkRes.ok) {
                const existingRecords = await checkRes.json();
                if (existingRecords && existingRecords.length > 0 && existingRecords[0].data) {
                    mergedDB = mergeDatabasesSafely(existingRecords[0].data, appDB);
                }
            }
        } catch (e) {}

        await fetch(`${cfg.url}/rest/v1/universos_sync?on_conflict=id`, {
            method: 'POST',
            headers: {
                'apikey': cfg.key,
                'Authorization': `Bearer ${cfg.key}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates,return=minimal'
            },
            body: JSON.stringify({
                id: effectiveKey,
                data: mergedDB,
                updated_at: new Date().toISOString()
            })
        });
    } catch (e) {
        console.warn('Fallo silencioso en auto-sincronización:', e);
    }
}
