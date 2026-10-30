/**
 * Sistema de Ventanas Modales Personalizadas
 * 
 * REGLAS CRÍTICAS DE SUPERVIVENCIA:
 * - Protección contra cierre accidental al arrastrar: solo se cierra si tanto mousedown como mouseup/click ocurren fuera del contenido del modal.
 * - Jerarquía estricta de capas (z-index): las alertas y confirmaciones aparecen siempre en primer plano (z-index: 400), por delante de cualquier otra ventana abierta.
 */

let lastPointerDownTarget = null;

function openModal(id) { 
    const el = document.getElementById(id);
    if (el) el.classList.add('active'); 
}

function closeModal(id) { 
    const el = document.getElementById(id);
    if (el) el.classList.remove('active'); 
}

function customAlert(msg, title = 'Aviso') {
    const alertMsg = document.getElementById('alertMsg');
    const alertTitleText = document.getElementById('alertTitleText');
    if (alertTitleText) alertTitleText.innerText = title;
    if (alertMsg) {
        if (typeof msg === 'string' && (msg.includes('<') && msg.includes('>'))) {
            alertMsg.innerHTML = msg;
        } else {
            alertMsg.innerText = msg;
        }
    }
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

function getTopmostActiveModal() {
    const priorityIds = ['alertModal', 'confirmModal', 'importPreviewModal', 'cheatsheetModal'];
    for (const id of priorityIds) {
        const el = document.getElementById(id);
        if (el && el.classList.contains('active')) return el;
    }
    const allActive = Array.from(document.querySelectorAll('.modal-overlay.active'));
    return allActive.length > 0 ? allActive[allActive.length - 1] : null;
}

function initModalListeners() {
    // Registrar dónde empezó exactamente el clic (mousedown / pointerdown)
    document.addEventListener('pointerdown', (e) => {
        lastPointerDownTarget = e.target;
    }, true);

    document.addEventListener('mousedown', (e) => {
        lastPointerDownTarget = e.target;
    }, true);

    // Cerrar modal SOLO si el clic empezó Y terminó directamente en el fondo oscuro (overlay)
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay && lastPointerDownTarget === overlay) {
                overlay.classList.remove('active');
                if (overlay.id === 'confirmModal' && confirmCallback) {
                    confirmCallback(false);
                    confirmCallback = null;
                }
            }
        });
    });

    // Backdrop de barra lateral móvil: solo cerrar si empezó y terminó fuera del sidebar
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', (e) => {
            if (e.target === sidebarBackdrop && lastPointerDownTarget === sidebarBackdrop) {
                if (typeof closeMobileSidebar === 'function') {
                    closeMobileSidebar();
                }
            }
        });
    }

    // Cerrar al presionar la tecla Escape (actuando siempre sobre la ventana más frontal)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const topModal = getTopmostActiveModal();
            if (topModal) {
                topModal.classList.remove('active');
                if (topModal.id === 'confirmModal' && confirmCallback) {
                    confirmCallback(false);
                    confirmCallback = null;
                }
                return;
            }
            document.querySelectorAll('.custom-select-wrapper.open').forEach(w => w.classList.remove('open'));
        }

        // Enter para disparar el botón destacado de la ventana más frontal
        if (e.key === 'Enter') {
            const topModal = getTopmostActiveModal();
            if (!topModal) return;

            const focused = document.activeElement;
            const isTextarea = focused && focused.tagName === 'TEXTAREA';

            if (isTextarea) {
                // En un textarea, Enter normal debe insertar un salto de línea.
                // Solo enviar el modal si se pulsa Ctrl+Enter o Cmd+Enter.
                if (!e.ctrlKey && !e.metaKey) return;
            } else {
                if (e.shiftKey) return;
            }

            const primaryBtn = topModal.querySelector('.btn-primary:not([disabled]), .btn-magic:not([disabled]), .btn-confirm-yes:not([disabled])');
            if (primaryBtn) {
                e.preventDefault();
                e.stopPropagation();
                primaryBtn.click();
            }
        }
    });
}
