---
name: universos-adaptar
description: Detecta y clasifica automáticamente apuntes o enunciados aportados por el usuario (teoría, ejercicios o ambas), adaptándolos al esquema JSON de UniverSOS y completando datos faltantes con máxima exhaustividad.
---

# Skill: /universos-adaptar

Esta skill se activa cuando el usuario proporciona un bloque de apuntes, enunciados, soluciones o exámenes en texto desestructurado. La IA detecta automáticamente qué tipo de contenido es (`teoria`, `ejercicios` o `ambas`), lo transforma al esquema JSON oficial de **UniverSOS**, y si falta algún paso, demostración o solución, **lo deduce y completa al 100%** garantizando máxima rigurosidad técnica.

---

## 1. Funcionamiento del Protocolo de Adaptación

1. **Detección Automática:**
   - Si contiene definiciones, fórmulas teóricas o resúmenes $\rightarrow$ clasifica como `teoria`.
   - Si contiene enunciados con datos numéricos o problemas resueltos $\rightarrow$ clasifica como `ejercicios`.
   - Si contiene temario mixto con ejemplos $\rightarrow$ clasifica como `ambas`.

2. **Completado Inteligente de Datos Faltantes (Gap Filling):**
   - Si un ejercicio solo trae enunciado $\rightarrow$ la IA genera el algoritmo paso a paso, el ejemplo resuelto con todos los cálculos intermedios, trucos, errores típicos y trampas.
   - Si falta el cálculo de probabilidad o peso de examen $\rightarrow$ analiza la complejidad y estilo para estimar su frecuencia (`probabilidad`: 1-100) y peso en puntos.
   - Si faltan variaciones o ejercicios propuestos $\rightarrow$ genera variantes representativas con su desarrollo (`fix`).

3. **Garantía de Calidad:**
   - Cero frases vagas ("el cálculo es trivial", "análogo").
   - Todas las fórmulas matemáticas convertidas a sintaxis LaTeX rigurosa con doble escape (`\\\\frac`, `\\\\int`, `\\\\pmatrix`).

---

## 2. Estructura JSON de Salida

La IA devuelve el bloque JSON limpio listo para copiar o importar en UniverSOS:

```json
{
  "asignatura": "Asignatura detectada o indicada",
  "tema": "Tema detectado o indicado",
  "teoria": {
    "title": "Título del Tema",
    "introduccion": "Texto introductorio...",
    "secciones": [
      {
        "title": "1. Sección Adaptada",
        "content": "Contenido enriquecido con LaTeX...",
        "detalles": [
          {
            "title": "Demostración o Matiz Teórico",
            "content": "Detalles adicionales completados..."
          }
        ]
      }
    ],
    "checklistClave": [
      "Concepto Clave 1: Explicación...",
      "Concepto Clave 2: Explicación..."
    ]
  },
  "ejercicios": [
    {
      "title": "Tipo 1: Nombre Técnico Adaptado [PROBABILIDAD EXAMEN: 80% | PESO: 3.0 PTS]",
      "probabilidad": 80,
      "identificacion": [
        "Pista 1 del enunciado aportado",
        "Pista 2"
      ],
      "algoritmo": [
        {
          "title": "Paso 1: Identificación y variables",
          "subtitle": "Subtítulo descriptivo",
          "example": "Cálculo o fórmula del paso en LaTeX"
        }
      ],
      "ejemploCompleto": "Enunciado aportado completado con su solución íntegra paso a paso...",
      "variaciones": [
        {
          "title": "Variante 1",
          "content": "Qué ocurre si cambia una hipótesis...",
          "fix": "Cómo resolver la variación...",
          "example": "Fórmula"
        }
      ],
      "trucos": [
        {
          "title": "Truco de cálculo",
          "content": "Atajo matemático..."
        }
      ],
      "errores": [
        {
          "title": "Error habitual",
          "content": "Fallo típico a evitar..."
        }
      ],
      "trampas": [
        {
          "title": "Trampa del profesor",
          "content": "Detalle del enunciado con doble sentido..."
        }
      ],
      "ejerciciosPropuestos": [
        {
          "ref": "Problema propuesto similar",
          "nota": "2.5 pts",
          "enunciado": "Enunciado similar para practicar... Solución final numérica."
        }
      ]
    }
  ]
}
```
> **Nota:** Si el contenido solo era de teoría, se omite el campo `"ejercicios"`. Si solo eran problemas, se omite el campo `"teoria"`.
