/**
 * Sistema de Ventanas Modales Personalizadas
 * 
 * REGLAS CRÍTICAS DE SUPERVIVENCIA:
 * - Los navegadores bloquean o degradan confirm() y alert() nativos.
 * - Se utilizan modales basados en el DOM con soporte accesible y callbacks asíncronos.
 * - Soporte para cerrar al hacer clic en el backdrop o con la tecla Escape.
 */

function openModal(id) { 
    const el = document.getElementById(id);
    if (el) el.classList.add('active'); 
}

function closeModal(id) { 
    const el = document.getElementById(id);
    if (el) el.classList.remove('active'); 
}

function customAlert(msg) {
    const alertMsg = document.getElementById('alertMsg');
    if (alertMsg) alertMsg.innerText = msg;
    openModal('alertModal');
}

function customConfirm(msg, callback) {
    const confirmMsg = document.getElementById('confirmMsg');
    if (confirmMsg) confirmMsg.innerText = msg;
    confirmCallback = callback;
    openModal('confirmModal');
}

function closeConfirm(result) {
    closeModal('confirmModal');
    if (confirmCallback) {
        confirmCallback(result);
        confirmCallback = null;
    }
}

function initModalListeners() {
    // Cerrar al hacer clic en el fondo oscuro
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                if (overlay.id === 'confirmModal' && confirmCallback) {
                    confirmCallback(false);
                    confirmCallback = null;
                }
            }
        });
    });

    // Cerrar al presionar la tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                activeModal.classList.remove('active');
                if (activeModal.id === 'confirmModal' && confirmCallback) {
                    confirmCallback(false);
                    confirmCallback = null;
                }
            }
            document.querySelectorAll('.custom-select-wrapper.open').forEach(w => w.classList.remove('open'));
        }

        // Enter para disparar el botón destacado (Procesar, Guardar, etc.)
        // En textareas (como Importar JSON): Enter sin shift pulsa Procesar; Shift+Enter hace el salto de línea
        if (e.key === 'Enter') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (!activeModal) return;

            const focused = document.activeElement;
            const isTextarea = focused && focused.tagName === 'TEXTAREA';

            if (isTextarea) {
                if (e.shiftKey) {
                    // Shift+Enter en textarea: comportamiento nativo (salto de línea)
                    return;
                }
                // Enter a secas en textarea: enviar/procesar modal directamente
            } else {
                if (e.shiftKey) return;
            }

            // Buscar el botón primario del modal activo: btn-primary, btn-magic o btn-confirm-yes
            const primaryBtn = activeModal.querySelector('.btn-primary:not([disabled]), .btn-magic:not([disabled]), .btn-confirm-yes:not([disabled])');
            if (primaryBtn) {
                e.preventDefault();
                e.stopPropagation();
                primaryBtn.click();
            }
        }
    });
}

