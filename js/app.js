function isMobileOrLandscapeDrawer() {
    return window.matchMedia('(max-width: 768px), (max-height: 500px) and (orientation: landscape)').matches;
}

function toggleSidebar() {
    if (isMobileOrLandscapeDrawer()) {
        toggleMobileSidebar();
    } else {
        const sidebar = document.getElementById('appSidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('universos_sidebar_collapsed', sidebar.classList.contains('collapsed') ? 'true' : 'false');
        }
    }
}

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

window.addEventListener('resize', () => {
    if (!isMobileOrLandscapeDrawer()) {
        closeMobileSidebar();
    }
});

function initApp() {
    loadDB();
    if (!isMobileOrLandscapeDrawer() && localStorage.getItem('universos_sidebar_collapsed') === 'true') {
        const sidebar = document.getElementById('appSidebar');
        if (sidebar) sidebar.classList.add('collapsed');
    }
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
