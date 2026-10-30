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

function registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(reg => {
                    console.log('UniverSOS PWA Service Worker activo:', reg.scope);
                })
                .catch(err => {
                    console.warn('Registro de Service Worker:', err);
                });
        });
    }
}

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
    if (typeof checkUrlCloudMagicConfig === 'function') {
        checkUrlCloudMagicConfig();
    }
    registerServiceWorker();
}

window.addEventListener('DOMContentLoaded', () => {
    initApp();
});
