/**
 * Módulo de Sanitización y Procesamiento de Texto
 * 
 * REGLAS CRÍTICAS:
 * 1. MathJax vs HTML tags: En fórmulas como $0 < x < 1$, el '<'
 *    hace que el navegador lo interprete como tag HTML inválido y lo corte.
 *    Solo se permiten tags seguros y se escapa el resto.
 * 2. Citas LLM: Extrae citas del tipo [cite: 1, 2].
 * 3. Conversión de glifos unicode matemáticos a sintaxis estándar sin romper llaves ni $$.
 */

function cleanMathUnicode(text) {
    if (!text || typeof text !== 'string') return '';
    // Reemplaza subíndices unicode solo cuando no estén dentro de llaves rotas
    return text
        .replace(/₁/g, '1')
        .replace(/₂/g, '2')
        .replace(/₃/g, '3')
        .replace(/₄/g, '4')
        .replace(/₅/g, '5')
        .replace(/₆/g, '6')
        .replace(/₇/g, '7')
        .replace(/₈/g, '8')
        .replace(/₉/g, '9')
        .replace(/₀/g, '0');
}

function convertToMathJaxFormat(text) {
    if (!text || typeof text !== 'string') return '';

    // Si todo el texto ya está envuelto en $...$ o $$...$$, dejarlo intacto
    const trimmed = text.trim();
    if ((trimmed.startsWith('$') && trimmed.endsWith('$')) || (trimmed.startsWith('$$') && trimmed.endsWith('$$'))) {
        return text;
    }

    // Dividimos por bloques matemáticos ya delimitados ($...$ o $$...$$)
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g);

    return parts.map((part, index) => {
        // Las partes impares ya están dentro de $...$ o $$...$$ -> NO tocarlas
        if (index % 2 === 1) return part;

        let res = part;

        // 1. Detectar ecuaciones con signo igual que contengan funciones, integrales o subíndices:
        // Ej: f_{X1}(x1) = \int f(x1, x2) dx2  o  f(x1, x2) = g(x1)h(x2)
        res = res.replace(/(f_\{[^}]+\}\([^)]+\)\s*=\s*[^.,;:\n]+(?:\b(?:dx[1-2]?|dy|dt)\b)?)/g, '$$$1$$');

        // 2. Detectar probabilidades compuestas:
        // Ej: P(a1 < X1 <= b1, a2 < X2 <= b2) = F(b1, b2) - F(a1, b2) - F(b1, a2) + F(a1, a2) >= 0
        res = res.replace(/(P\([^)]+\)\s*=\s*[^.\n]+)/g, '$$$1$$');

        // 3. Detectar funciones generatrices (MGF) y características:
        // Ej: M_{X1, X2}(t1, t2), M_{X, Y}(t1, t2), M_X(t), \phi_X(t)
        res = res.replace(/(?<!\$)\b([M\phi]_\{[^}]+\}\([^)]+\))(?![\w\$])/g, '$$$1$$');
        res = res.replace(/(?<!\$)\b([M\phi]_\w+\([^)]+\))(?![\w\$])/g, '$$$1$$');

        // 4. Detectar ecuaciones de transformaciones lineales o combinaciones:
        // Ej: Y = X1 + X2, Z = X/Y, S1 x S2
        res = res.replace(/(?<!\$)\b([A-Z]\s*=\s*[A-Za-z0-9_+\-*\/\s]+[A-Za-z0-9_])(?![\w\$])/g, (match, expr) => {
            // Solo si contiene variables o subíndices matemáticos
            if (/[+\-*\/]/.test(expr) && /[A-Z]/.test(expr)) {
                return `$$${expr.trim()}$$`;
            }
            return match;
        });

        // 5. Detectar funciones o variables con subíndices que hayan quedado sueltas:
        // Ej: f_{X1}(x1), f_{X2}(x2), E[X1 X2], Var(X), Cov(X, Y)
        res = res.replace(/(?<!\$)\b(f_\{[A-Za-z0-9]+\}\([^)]+\))(?![\w\$])/g, '$$$1$$');
        res = res.replace(/(?<!\$)\b([E|Var|Cov]\[[^\]]+\])(?![\w\$])/g, '$$$1$$');
        res = res.replace(/(?<!\$)\b(Cov\([^)]+\))(?![\w\$])/g, '$$$1$$');

        return res;
    }).join('');
}

function sanitizeHTML(text) {
    if (typeof text !== 'string') {
        if (text === null || text === undefined) return '';
        return String(text);
    }
    // Protege etiquetas HTML válidas y de cierre (\/strong, \/em, etc.), escapando el resto de '<'
    let safeText = text.replace(/<(?!(br|\/br|strong|\/strong|em|\/em|span|\/span|div|\/div|p|\/p|b|\/b|i|\/i|u|\/u|code|\/code|sub|\/sub|sup|\/sup)[ >])/gi, '&lt;');
    safeText = safeText.replace(/\[cite:\s*([^\]]+)\]/gi, '');
    safeText = cleanMathUnicode(safeText);
    return convertToMathJaxFormat(safeText);
}

function processTextWithCitations(text) {
    if (typeof text !== 'string') {
        if (text === null || text === undefined) return { text: '', refs: [] };
        text = String(text);
    }
    
    let safeText = sanitizeHTML(text);
    let refsSet = new Set();
    
    let cleanText = safeText.replace(/\[cite:\s*([^\]]+)\]/gi, (match, p1) => {
        p1.split(',').forEach(num => { 
            let n = num.trim(); 
            if (n) refsSet.add(n); 
        });
        return ''; 
    });
    let refsArray = Array.from(refsSet).sort((a, b) => parseInt(a) - parseInt(b));
    return { text: cleanText, refs: refsArray };
}
