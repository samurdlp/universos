function toggleMobileSidebar() {
    const sidebar = document.getElementById('appSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) {
        const isOpen = sidebar.classList.contains('mobile-open');
        if (isOpen) {
            closeMobileSidebar();
        } else {
            sidebar.classList.add('mobile-open');
            if (backdrop) backdrop.classList.add('active');
            document.body.classList.add('sidebar-open-lock');
        }
    }
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('appSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
    document.body.classList.remove('sidebar-open-lock');
}

function initApp() {
    loadDB();
    initModalListeners();
    initEditListeners();
    initImportDropZone();
    initSearchShortcut();
    renderDropdowns();
    if (activeTopicId) {
        renderTopicExercises();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    initApp();
});
