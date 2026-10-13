/**
 * Sincronización en la Nube (Supabase / REST Cloud)
 * 
 * Permite sincronizar todo el conocimiento universitario entre dispositivos (móvil, tablet, PC)
 * manteniendo la funcionalidad 100% offline con localStorage.
 */

let autoSyncTimeout = null;

function getCloudConfig() {
    return {
        url: (localStorage.getItem('universos_supabase_url') || '').trim().replace(/\/+$/, ''),
        key: (localStorage.getItem('universos_supabase_key') || '').trim(),
        syncId: (localStorage.getItem('universos_sync_id') || '').trim() || generateDefaultSyncId(),
        autoSync: localStorage.getItem('universos_auto_sync') === 'true'
    };
}

function generateDefaultSyncId() {
    const id = 'estudiante_' + Math.random().toString(36).substring(2, 8);
    localStorage.setItem('universos_sync_id', id);
    return id;
}

function openCloudModal() {
    const cfg = getCloudConfig();
    
    const urlInput = document.getElementById('cloudUrlInput');
    const keyInput = document.getElementById('cloudKeyInput');
    const syncIdInput = document.getElementById('cloudSyncIdInput');
    const autoSyncCheck = document.getElementById('cloudAutoSyncCheck');
    const statusDiv = document.getElementById('cloudStatusDiv');

    if (urlInput) urlInput.value = cfg.url;
    if (keyInput) keyInput.value = cfg.key;
    if (syncIdInput) syncIdInput.value = cfg.syncId;
    if (autoSyncCheck) autoSyncCheck.checked = cfg.autoSync;
    
    if (statusDiv) {
        if (cfg.url && cfg.key) {
            statusDiv.innerHTML = `<span style="color:var(--c-truco);">● Conexión configurada</span> para identificador: <code>${cfg.syncId}</code>`;
        } else {
            statusDiv.innerHTML = `<span style="color:var(--text-muted);">● Modo Offline (sin configurar)</span>. Introduce tus datos de Supabase para activar la sincronización.`;
        }
    }

    openModal('cloudModal');
}

function saveCloudSettings() {
    const url = (document.getElementById('cloudUrlInput').value || '').trim();
    const key = (document.getElementById('cloudKeyInput').value || '').trim();
    const syncId = (document.getElementById('cloudSyncIdInput').value || '').trim() || generateDefaultSyncId();
    const autoSync = document.getElementById('cloudAutoSyncCheck').checked;

    localStorage.setItem('universos_supabase_url', url);
    localStorage.setItem('universos_supabase_key', key);
    localStorage.setItem('universos_sync_id', syncId);
    localStorage.setItem('universos_auto_sync', autoSync ? 'true' : 'false');

    const statusDiv = document.getElementById('cloudStatusDiv');
    if (statusDiv) {
        statusDiv.innerHTML = `<span style="color:var(--c-truco);">✓ Ajustes guardados correctamente.</span>`;
    }
}

async function pushToCloud() {
    const cfg = getCloudConfig();
    const statusDiv = document.getElementById('cloudStatusDiv');

    if (!cfg.url || !cfg.key) {
        customAlert("Configura primero la URL del proyecto y la Anon Key de Supabase.");
        return;
    }

    if (statusDiv) statusDiv.innerHTML = `<span style="color:var(--primary);">⏳ Subiendo apuntes a la nube...</span>`;

    try {
        const payload = {
            id: cfg.syncId,
            data: appDB,
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

        if (statusDiv) {
            statusDiv.innerHTML = `<span style="color:var(--c-truco);">✓ ¡Subida completada con éxito!</span> Tus apuntes están seguros en Supabase.`;
        } else {
            customAlert("¡Apuntes subidos y respaldados en la nube con éxito!");
        }
    } catch (e) {
        console.error("Error al sincronizar con Supabase:", e);
        if (statusDiv) {
            statusDiv.innerHTML = `<span style="color:var(--c-trampa);">✗ Error al subir:</span> ${e.message}<br><small style="color:var(--text-muted)">¿Has creado la tabla 'universos_sync'? Revisa las instrucciones de configuración.</small>`;
        } else {
            customAlert("Error al conectar con la nube: " + e.message);
        }
    }
}

async function pullFromCloud() {
    const cfg = getCloudConfig();
    const statusDiv = document.getElementById('cloudStatusDiv');

    if (!cfg.url || !cfg.key) {
        customAlert("Configura primero la URL del proyecto y la Anon Key de Supabase.");
        return;
    }

    if (statusDiv) statusDiv.innerHTML = `<span style="color:var(--primary);">⏳ Descargando apuntes desde la nube...</span>`;

    try {
        const response = await fetch(`${cfg.url}/rest/v1/universos_sync?id=eq.${encodeURIComponent(cfg.syncId)}&select=*`, {
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
            if (statusDiv) {
                statusDiv.innerHTML = `<span style="color:var(--c-error);">⚠️ No se encontraron datos</span> para el identificador <code>${cfg.syncId}</code>. Prueba a subir primero tus apuntes.`;
            } else {
                customAlert(`No hay datos en la nube para el identificador "${cfg.syncId}".`);
            }
            return;
        }

        // Cargar y persistir base de datos descargada
        appDB = data[0].data;
        saveDB();
        activeSubjectId = null;
        activeTopicId = null;
        renderDropdowns();

        if (statusDiv) {
            statusDiv.innerHTML = `<span style="color:var(--c-truco);">✓ ¡Datos sincronizados!</span> Se han actualizado tus asignaturas y temas.`;
        } else {
            customAlert("¡Datos descargados y actualizados con éxito!");
        }
        closeModal('cloudModal');
    } catch (e) {
        console.error("Error al descargar de Supabase:", e);
        if (statusDiv) {
            statusDiv.innerHTML = `<span style="color:var(--c-trampa);">✗ Error al descargar:</span> ${e.message}`;
        } else {
            customAlert("Error al descargar desde la nube: " + e.message);
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
        await fetch(`${cfg.url}/rest/v1/universos_sync?on_conflict=id`, {
            method: 'POST',
            headers: {
                'apikey': cfg.key,
                'Authorization': `Bearer ${cfg.key}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates,return=minimal'
            },
            body: JSON.stringify({
                id: cfg.syncId,
                data: appDB,
                updated_at: new Date().toISOString()
            })
        });
        console.log("Auto-sincronización en la nube completada.");
    } catch(e) {
        console.warn("Fallo silencioso en auto-sincronización:", e);
    }
}
