/**
 * Punto de Entrada y Orquestador de UniverSOS
 */

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
