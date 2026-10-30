/**
 * UniverSOS — Motor de Repaso Espaciado Algorítmico SM-2 (SuperMemo-2)
 * Proporciona cálculo determinista de intervalos, factor de facilidad (EF)
 * y programación de repasos diarios óptimos contra la curva del olvido.
 */

var SM2_DEFAULT_EF = 2.5;
var SM2_MIN_EF = 1.3;

/**
 * Calcula el nuevo estado de retención de una flashcard según el algoritmo SuperMemo SM-2.
 * 
 * @param {Object} cardHistory - Estado previo de la tarjeta { reps, interval, easeFactor, history, timesReviewed, timesFailed, streak }
 * @param {number} quality - Calidad de la respuesta: 
 *                            1: Olvido total / Incorrecto (Blackout / Mal)
 *                            3: Duda importante / Respuesta con esfuerzo (Dudoso / Regular)
 *                            4: Respuesta correcta con vacilación menor (Bien / Recordado)
 *                            5: Respuesta perfecta e instantánea (Perfecto / Dominado)
 * @param {number} [nowTime=Date.now()] - Timestamp opcional para pruebas temporales
 * @returns {Object} Estado de retención actualizado
 */
function calculateSM2(cardHistory, quality, nowTime) {
    const now = typeof nowTime === 'number' ? nowTime : Date.now();
    const prev = cardHistory || {};

    let reps = typeof prev.reps === 'number' ? prev.reps : 0;
    let interval = typeof prev.interval === 'number' ? prev.interval : 0;
    let easeFactor = typeof prev.easeFactor === 'number' ? prev.easeFactor : SM2_DEFAULT_EF;
    let streak = typeof prev.streak === 'number' ? prev.streak : 0;
    let timesReviewed = typeof prev.timesReviewed === 'number' ? prev.timesReviewed : 0;
    let timesFailed = typeof prev.timesFailed === 'number' ? prev.timesFailed : 0;

    // Normalizar calidad en el rango 1 a 5
    const q = Math.max(1, Math.min(5, Math.round(quality)));

    timesReviewed++;

    // 1. Ajuste del Factor de Facilidad (EF) según la calidad actual
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (easeFactor < SM2_MIN_EF) {
        easeFactor = SM2_MIN_EF;
    }
    easeFactor = Number(easeFactor.toFixed(2));

    // 2. Cálculo del intervalo de días según repeticiones consecutivas
    if (q >= 3) {
        if (reps === 0) {
            interval = 1;
        } else if (reps === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * easeFactor);
        }
        reps++;
        streak++;
    } else {
        reps = 0;
        interval = 1;
        streak = 0;
        timesFailed++;
    }

    const nextReviewDate = now + (interval * 24 * 60 * 60 * 1000);

    // 3. Clasificación del estado de dominio (q=5 es perfecto/mastered inmediato)
    let status = 'doubt';
    if (q === 5 || (q >= 4 && reps >= 2)) {
        status = 'mastered';
    } else if (q >= 3) {
        status = 'review';
    } else {
        status = 'doubt';
    }

    return {
        reps,
        interval,
        easeFactor,
        streak,
        timesReviewed,
        timesFailed,
        lastReviewed: now,
        nextReviewDate,
        status,
        lastQuality: q
    };
}

/**
 * Comprueba si una tarjeta debe ser repasada en la fecha dada (o si es completamente nueva).
 */
function isCardDueForSM2(cardHistory, targetDate) {
    if (!cardHistory || !cardHistory.nextReviewDate) {
        return true; // Tarjeta nueva sin historial
    }
    const checkTime = typeof targetDate === 'number' ? targetDate : Date.now();
    return cardHistory.nextReviewDate <= checkTime;
}

/**
 * Filtra las tarjetas de un mazo que vencen en la fecha indicada.
 */
function getSM2DueCards(deck, history, targetDate) {
    if (!Array.isArray(deck)) return [];
    const hist = history || (typeof getFlashcardHistory === 'function' ? getFlashcardHistory() : {});
    const now = typeof targetDate === 'number' ? targetDate : Date.now();

    return deck.filter(card => {
        const item = hist[card.id];
        return isCardDueForSM2(item, now);
    });
}

/**
 * Formatea un intervalo en días para presentación visual humana.
 */
function formatSM2Interval(days) {
    if (days <= 1) return '1 día';
    if (days < 30) return `${days} días`;
    if (days < 365) {
        const months = Math.round(days / 30);
        return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    }
    const years = (days / 365).toFixed(1);
    return `${years} años`;
}

/**
 * Pre-calcula los próximos intervalos en días para cada posible calificación
 * para mostrarlos en los botones de respuesta.
 */
function previewNextIntervals(cardHistory) {
    const dummyNow = Date.now();
    const res1 = calculateSM2(cardHistory, 1, dummyNow);
    const res3 = calculateSM2(cardHistory, 3, dummyNow);
    const res4 = calculateSM2(cardHistory, 4, dummyNow);
    const res5 = calculateSM2(cardHistory, 5, dummyNow);

    return {
        1: formatSM2Interval(res1.interval),
        3: formatSM2Interval(res3.interval),
        4: formatSM2Interval(res4.interval),
        5: formatSM2Interval(res5.interval)
    };
}
