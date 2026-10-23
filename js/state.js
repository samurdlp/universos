/**
 * Estado Global y Persistencia de UniverSOS
 * 
 * Almacenamiento primario en localStorage bajo la clave 'universityAppDB'.
 * Estructura: { subjects: [ { id, name, aliases, topics: [ { id, name, aliases, data } ] } ] }
 */

const STORAGE_KEY = 'universityAppDB';
const THEME_KEY = 'universos_theme';
const EXAM_MODE_KEY = 'universos_exam_mode';
const ACTIVE_SUBJ_KEY = 'universos_active_subject_id';
const ACTIVE_TOPIC_KEY = 'universos_active_topic_id';

let appDB = { subjects: [] };
let activeSubjectId = null;
let activeTopicId = null;
let editTargetType = null; 
let editTargetId = null; 
let confirmCallback = null;

let isExamMode = false;
let currentMasteryFilter = 'all'; // 'all' | 'mastered' | 'review' | 'doubt'
let currentExerciseIndex = 0;

// Estado del nuevo Simulador de Examen Interactivo
let examSimState = {
    mode: 'blind', // 'blind' (Simulacro sorpresa sin ver título) | 'guided' (Entrenamiento del ejercicio actual)
    scope: 'topic', // 'topic' (Tema actual) | 'subject' (Toda la asignatura)
    queue: [], // Array de { subjId, topicId, topicName, exIndex, exData, selectedStmtIdx, unlockedIdent, unlockedStepsCount, unlockedTraps, fullRevealed, grade }
    currentPos: 0,
    timerSeconds: 0,
    timerRunning: false,
    timerInterval: null
};

function loadDB() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        try {
            appDB = JSON.parse(savedData);
        } catch (e) {
            console.error('Error al cargar la base de datos desde localStorage:', e);
            appDB = { subjects: [] };
        }
    }

    const savedSubjId = localStorage.getItem(ACTIVE_SUBJ_KEY);
    const savedTopicId = localStorage.getItem(ACTIVE_TOPIC_KEY);

    if (savedSubjId && appDB.subjects.some(s => s.id === savedSubjId)) {
        activeSubjectId = savedSubjId;
        const subj = appDB.subjects.find(s => s.id === savedSubjId);
        if (savedTopicId && subj && subj.topics.some(t => t.id === savedTopicId)) {
            activeTopicId = savedTopicId;
        } else if (subj && subj.topics.length > 0) {
            activeTopicId = subj.topics[0].id;
        }
    } else if (appDB.subjects.length > 0) {
        activeSubjectId = appDB.subjects[0].id;
        if (appDB.subjects[0].topics.length > 0) {
            activeTopicId = appDB.subjects[0].topics[0].id;
        }
    }

    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'light') {
        document.body.classList.remove('dark');
    } else {
        document.body.classList.add('dark');
    }

    isExamMode = localStorage.getItem(EXAM_MODE_KEY) === 'true';
    updateExamModeUI();
}

function saveDB() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appDB));
    if (activeSubjectId) localStorage.setItem(ACTIVE_SUBJ_KEY, activeSubjectId);
    if (activeTopicId) localStorage.setItem(ACTIVE_TOPIC_KEY, activeTopicId);
    if (typeof triggerAutoSync === 'function') {
        triggerAutoSync();
    }
}

function updateExamModeUI() {
    const btn = document.getElementById('examModeBtn');
    if (btn) {
        if (isExamMode) {
            btn.classList.add('active');
            btn.title = 'Salir del Simulador de Examen y volver a Modo Estudio';
        } else {
            btn.classList.remove('active');
            btn.title = 'Abrir Simulador de Examen y Práctica Activa';
        }
    }
}

function toggleExamMode() {
    if (!activeSubjectId) {
        customAlert('Selecciona primero una Asignatura y un Tema para iniciar el Simulador de Examen.');
        return;
    }

    isExamMode = !isExamMode;
    localStorage.setItem(EXAM_MODE_KEY, isExamMode ? 'true' : 'false');
    updateExamModeUI();

    if (isExamMode) {
        if (typeof startExamSimulatorSession === 'function') {
            startExamSimulatorSession('blind', 'topic');
        }
    } else {
        if (typeof stopExamTimer === 'function') stopExamTimer();
        if (activeTopicId) {
            selectExercise(currentExerciseIndex || 0);
        }
    }
}

function exportDatabase() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appDB, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "universos_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importFullDatabase(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const { data } = parseResilientJson(e.target.result);
            if (data && Array.isArray(data.subjects)) {
                appDB = data;
                saveDB();
                activeSubjectId = appDB.subjects.length > 0 ? appDB.subjects[0].id : null;
                activeTopicId = (activeSubjectId && appDB.subjects[0].topics.length > 0) ? appDB.subjects[0].topics[0].id : null;
                renderDropdowns();
                if (activeTopicId) renderTopicExercises();
                closeModal('dbModal');
                customAlert('Base de datos restaurada con éxito.', 'Backup Restaurado');
            } else {
                // Si el usuario subió un JSON de tema o ejercicios en vez de backup, redirigirlo al motor universal
                closeModal('dbModal');
                const analysis = analyzeImportedData(data, []);
                openImportPreviewModal(analysis);
            }
        } catch(err) {
            customAlert('Error al leer el archivo: ' + err.message, 'Error de Restauración');
        } finally {
            event.target.value = '';
        }
    };
    reader.readAsText(file);
}
