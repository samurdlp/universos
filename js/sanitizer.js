/**
 * Módulo de Sanitización y Procesamiento Matemático (LaTeX / MathJax)
 * 
 * REGLAS CRÍTICAS:
 * 1. Protección de signos '<' en desigualdades matemáticas ($0 < x < 1$) frente al parser HTML.
 * 2. Normalización de comandos LaTeX doblemente escapados y envoltorio automático de expresiones huérfanas.
 * 3. División segura de cadenas tipo "Título: Explicación" en checklists sin romper delimitadores $, $$, \() o llaves {}.
 */

function cleanMathUnicode(text) {
    if (!text || typeof text !== 'string') return '';
    return text
        .replace(/₁/g, '_1')
        .replace(/₂/g, '_2')
        .replace(/₃/g, '_3')
        .replace(/₄/g, '_4')
        .replace(/₅/g, '_5')
        .replace(/₆/g, '_6')
        .replace(/₇/g, '_7')
        .replace(/₈/g, '_8')
        .replace(/₉/g, '_9')
        .replace(/₀/g, '_0');
}

function normalizeLatexEscapes(text) {
    if (!text || typeof text !== 'string') return '';
    let res = text;
    // Convertir delimitadores doblemente escapados \\( \\) \\[ \\] a simples
    res = res.replace(/\\\\([()\[\]])/g, '\\$1');
    // Convertir comandos LaTeX que hayan quedado con doble barra accidental fuera de saltos de línea de matrices
    res = res.replace(/\\\\(frac|dfrac|tfrac|sqrt|int|iint|iiint|oint|sum|prod|lim|infty|partial|nabla|alpha|beta|gamma|delta|epsilon|varepsilon|zeta|eta|theta|vartheta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|upsilon|phi|varphi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Upsilon|Phi|Psi|Omega|cdot|times|div|pm|mp|leq|le|geq|ge|neq|ne|approx|equiv|cong|sim|propto|in|notin|subset|subseteq|supset|supseteq|cup|cap|emptyset|varnothing|forall|exists|nexists|implies|iff|to|rightarrow|leftarrow|Rightarrow|Leftarrow|leftrightarrow|Leftrightarrow|mapsto|mathbb|mathcal|mathfrak|mathbf|mathrm|mathit|mathsf|text|textbf|textit|operatorname|hat|bar|tilde|vec|dot|ddot|overline|underline|overbrace|underbrace|left|right|big|Big|bigg|Bigg|binom|choose|pmatrix|bmatrix|vmatrix|matrix|cases)\b/g, '\\$1');
    return res;
}

function convertToMathJaxFormat(text) {
    if (!text || typeof text !== 'string') return '';

    let normalized = normalizeLatexEscapes(text);
    const trimmed = normalized.trim();
    if ((trimmed.startsWith('$$') && trimmed.endsWith('$$')) ||
        (trimmed.startsWith('\\[') && trimmed.endsWith('\\]'))) {
        return normalized;
    }

    // Dividir por bloques matemáticos ya delimitados: $$...$$, $...$, \[...\], \(...\)
    const mathBlockRegex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;
    const parts = normalized.split(mathBlockRegex);

    return parts.map((part, index) => {
        // Las partes impares ya están dentro de delimitadores matemáticos -> preservarlas intactas
        if (index % 2 === 1) return part;

        let res = part;

        // 1. Si hay un entorno \begin{...}...\end{...} suelto fuera de $, envolverlo en $$...$$
        res = res.replace(/(\\begin\{([a-zA-Z*]+)\}[\s\S]*?\\end\{\2\})/g, '$$$$$1$$$$');

        // 2. Detectar ecuaciones de densidad/probabilidad con integrales o funciones
        res = res.replace(/(f_\{[^}]+\}\([^)]+\)\s*=\s*[^.,;:\n<]+(?:\b(?:dx[1-2]?|dy|dt)\b)?)/g, '$$$1$$');
        res = res.replace(/(P\([^)]+\)\s*=\s*[^.\n<]+)/g, '$$$1$$');

        // 3. Detectar funciones generatrices y características sueltas
        res = res.replace(/(?<!\$)\b([M]|\\phi)_\{[^}]+\}\([^)]+\)(?![\w\$])/g, '$$$&$$');
        res = res.replace(/(?<!\$)\b([M]|\\phi)_\w+\([^)]+\)(?![\w\$])/g, '$$$&$$');

        // 4. Detectar expresiones con comandos LaTeX explícitos (\frac{...}{...}, \sqrt{...}, etc.) que hayan quedado sin $...$
        res = res.replace(/(\\(?:frac|dfrac|binom)\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/g, '$$$1$$');
        res = res.replace(/(\\sqrt(?:\[[^\]]*\])?\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/g, '$$$1$$');

        // 5. Detectar símbolos griegos u operadores LaTeX sueltos con posibles subíndices/superíndices
        res = res.replace(/(\\(?:alpha|beta|gamma|delta|epsilon|varepsilon|theta|lambda|mu|pi|rho|sigma|tau|phi|varphi|omega|Gamma|Delta|Theta|Lambda|Pi|Sigma|Omega|infty|partial|nabla)(?:_\{[^}]+\}|_[a-zA-Z0-9])?(?:\^\{[^}]+\}|\^[a-zA-Z0-9])?)/g, '$$$1$$');

        // 6. Detectar f_{X1}(x1), E[X], Var(X), Cov(X,Y) sueltos
        res = res.replace(/(?<!\$)\b(f_\{[A-Za-z0-9,]+\}\([^)]+\))(?![\w\$])/g, '$$$1$$');
        res = res.replace(/(?<!\$)\b((?:E|Var|Cov)\[[^\]]+\])(?![\w\$])/g, '$$$1$$');
        res = res.replace(/(?<!\$)\b(Cov\([^)]+\))(?![\w\$])/g, '$$$1$$');

        return res;
    }).join('');
}

/**
 * Divide de forma segura un ítem de checklist "Concepto: Explicación"
 * garantizando que jamás se corte por un ':' situado dentro de $...$, $$...$$, \(...\), \[...\] o {...}.
 */
function splitChecklistStringSafely(rawText) {
    if (!rawText || typeof rawText !== 'string') {
        return { title: '', subtitle: '' };
    }

    let insideSingleDollar = false;
    let insideDoubleDollar = false;
    let insideParenMath = false;
    let insideBracketMath = false;
    let braceDepth = 0;
    let splitIdx = -1;

    for (let k = 0; k < rawText.length; k++) {
        const ch = rawText[k];
        const next = rawText[k + 1] || '';
        const prev = k > 0 ? rawText[k - 1] : '';

        if (ch === '$' && prev !== '\\') {
            if (next === '$') {
                insideDoubleDollar = !insideDoubleDollar;
                k++;
                continue;
            } else if (!insideDoubleDollar) {
                insideSingleDollar = !insideSingleDollar;
                continue;
            }
        }

        if (ch === '\\') {
            if (next === '(') { insideParenMath = true; k++; continue; }
            if (next === ')') { insideParenMath = false; k++; continue; }
            if (next === '[') { insideBracketMath = true; k++; continue; }
            if (next === ']') { insideBracketMath = false; k++; continue; }
        }

        if (ch === '{' && prev !== '\\') braceDepth++;
        else if (ch === '}' && prev !== '\\' && braceDepth > 0) braceDepth--;

        const inAnyMath = insideSingleDollar || insideDoubleDollar || insideParenMath || insideBracketMath || braceDepth > 0;
        if (ch === ':' && !inAnyMath) {
            splitIdx = k;
            break;
        }
    }

    if (splitIdx > -1) {
        return {
            title: rawText.substring(0, splitIdx).trim(),
            subtitle: rawText.substring(splitIdx + 1).trim()
        };
    }

    return {
        title: rawText.trim(),
        subtitle: ''
    };
}

function sanitizeHTML(text) {
    if (typeof text !== 'string') {
        if (text === null || text === undefined) return '';
        return String(text);
    }
    let safeText = text.replace(/<(?!(br|\/br|strong|\/strong|em|\/em|span|\/span|div|\/div|p|\/p|b|\/b|i|\/i|u|\/u|code|\/code|sub|\/sub|sup|\/sup|ul|\/ul|ol|\/ol|li|\/li)[ >])/gi, '&lt;');
    safeText = safeText.replace(/\[cite:\s*([^\]]+)\]/gi, '');
    safeText = cleanMathUnicode(safeText);
    return convertToMathJaxFormat(safeText);
}

function processTextWithCitations(text) {
    if (typeof text !== 'string') {
        if (text === null || text === undefined) return { text: '', refs: [] };
        text = String(text);
    }
    
    let refsSet = new Set();
    let withoutCites = text.replace(/\[cite:\s*([^\]]+)\]/gi, (match, p1) => {
        p1.split(',').forEach(num => { 
            let n = num.trim(); 
            if (n) refsSet.add(n); 
        });
        return ''; 
    });

    let safeText = sanitizeHTML(withoutCites);
    let refsArray = Array.from(refsSet).sort((a, b) => parseInt(a) - parseInt(b));
    return { text: safeText, refs: refsArray };
}
