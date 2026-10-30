/**
 * Motor de Renderizado Matemático (MathJax v3)
 * 
 * REGLAS CRÍTICAS DE SUPERVIVENCIA:
 * 1. Typesetting seguro y asíncrono con cola (evita colisiones cuando typesetPromise está en vuelo).
 * 2. Renderizado tanto del contenedor principal como de los títulos matemáticos del sidebar.
 * 3. Los elementos dentro de acordeones usan CSS Grid (0fr -> 1fr) para que MathJax
 *    siempre conozca sus dimensiones calculadas en lugar de romperse con 'display: none'.
 */

let isMathJaxTypesetting = false;
let pendingMathJaxTypeset = false;
let pendingMathJaxTargets = null;
let mathDebounceTimer = null;

function forceMathRender(elements) {
    if (!window.MathJax || !MathJax.typesetPromise) {
        return;
    }

    if (mathDebounceTimer) {
        clearTimeout(mathDebounceTimer);
    }

    mathDebounceTimer = setTimeout(() => {
        executeMathRender(elements);
    }, 40);
}

function executeMathRender(elements) {
    if (isMathJaxTypesetting) {
        pendingMathJaxTypeset = true;
        pendingMathJaxTargets = elements || pendingMathJaxTargets;
        return;
    }

    isMathJaxTypesetting = true;

    const defaultTargets = [
        document.getElementById('exercise-content'),
        document.getElementById('subject-text'),
        document.getElementById('topic-text')
    ].filter(Boolean);

    const targets = elements && elements.length > 0 ? elements : defaultTargets;

    try {
        if (MathJax.typesetClear) {
            MathJax.typesetClear(targets);
        }
        MathJax.typesetPromise(targets)
            .catch(err => {
                console.warn('MathJax Typeset Warning:', err);
            })
            .finally(() => {
                isMathJaxTypesetting = false;
                if (pendingMathJaxTypeset) {
                    pendingMathJaxTypeset = false;
                    const nextTargets = pendingMathJaxTargets;
                    pendingMathJaxTargets = null;
                    executeMathRender(nextTargets);
                }
            });
    } catch (e) {
        isMathJaxTypesetting = false;
        console.error('MathJax execution error:', e);
    }
}
