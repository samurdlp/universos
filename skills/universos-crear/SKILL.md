---
name: universos-crear
description: Genera un tema universitario completo en formato JSON para UniverSOS a partir de apuntes o exámenes, calculando probabilidad y peso en puntos de cada ejercicio tipo con máxima exhaustividad.
---

# Skill: /universos-crear

Esta skill se activa cuando el usuario solicita crear contenido universitario para **UniverSOS**. Analiza las fuentes de estudio (apuntes, hojas de problemas y exámenes anteriores) y genera un bloque JSON estricto con la máxima exhaustividad didáctica posible, deduciendo pesos de examen y sin recortar pasos algebraicos.

---

## 1. Entrada Requerida del Usuario
El usuario debe indicar:
- **Asignatura:** Nombre de la materia (ej: *Cálculo de Probabilidades II*).
- **Tema:** Nombre o título del tema a crear (ej: *Tema 1: Distribuciones Bidimensionales*).
- **Tipo de Contenido:** `teoria`, `ejs` (solo ejercicios) o `completo` (ambos).
- **Fuentes / Exámenes:** Documentos, enunciados o apuntes de referencia adjuntos.

---

## 2. Reglas Críticas de Calidad y Exhaustividad

1. **Análisis Forense de Exámenes (Ponderación Real):**
   - Cuenta la frecuencia histórica de cada tipología de problema en los exámenes y hojas de problemas.
   - Asigna a cada ejercicio un campo `"probabilidad"` de 1 a 100 y refleja en el título su peso en puntos:
     `"Tipo N: Nombre Técnico [PROB: X% | PESO: Y.Y PTS]"`.
   - Ordena los ejercicios situando en primer lugar aquellos con **mayor peso en puntos y mayor probabilidad**.

2. **Cero Límites Arbitrarios (Número Variable Completo):**
   - NO limites a 2 o 3 ejercicios. Si el tema abarca 7, 10 o 14 tipologías con variantes relevantes, **genéralas todas**.
   - Cada tipo de problema debe contener:
     - `identificacion`: Pistas inequívocas en el enunciado para reconocerlo en el examen.
     - `algoritmo`: Array de pasos minuciosos (`Paso 1`, `Paso 2`, ...) con `title`, `subtitle` y `example` (demostración o cálculo intermedio) en CADA paso.
     - `ejemploCompleto`: Desarrollo matemático integral con sustituciones numéricas y resultado final simplificado.
     - `variaciones`: Casos particulares o condiciones de contorno cambiantes con su solución (`fix`).
     - `trucos`: Atajos algebraicos de examen.
     - `errores`: Fallos frecuentes donde los alumnos pierden puntos.
     - `trampas`: Puntos ciegos o trampas de los profesores.
     - `ejerciciosPropuestos`: Problemas de examen para auto-evaluación con solución final.

3. **Teoría Rigurosa y Checklist Clave (Si aplica):**
   - Incluye `introduccion`, `secciones` con teoremas y demostraciones, y un `checklistClave` con los conceptos de examen indispensables.

4. **LaTeX Seguro:**
   - En fórmulas dentro de JSON, escapa doblemente las barras: `\\frac`, `\\int`, `\\sigma`, `\\lambda`.
   - Utiliza `$ ... $` para inline y `$$ ... $$` para bloque.

---

## 3. Estructura JSON de Salida

```json
{
  "asignatura": "Nombre de la Asignatura",
  "tema": "Nombre del Tema Completo",
  "teoria": {
    "title": "Fundamentos y Formulación Rigurosa",
    "introduccion": "Explicación conceptual profunda...",
    "secciones": [
      {
        "title": "1. Definiciones y Teoremas Fundamentales",
        "content": "Desarrollo con fórmulas en $latex$...",
        "detalles": [
          {
            "title": "Demostración Clave",
            "content": "Desarrollo matemático paso a paso..."
          }
        ]
      }
    ],
    "checklistClave": [
      "Concepto 1: Descripción detallada y fórmula asociada",
      "Concepto 2: Verificación de condiciones de contorno"
    ]
  },
  "ejercicios": [
    {
      "title": "Tipo 1: Nombre de la Tipología [PROBABILIDAD EXAMEN: 85% | PESO ESTIMADO: 3.5 PTS]",
      "probabilidad": 85,
      "identificacion": [
        "Palabras clave en el enunciado",
        "Forma de los datos o funciones dadas"
      ],
      "algoritmo": [
        {
          "title": "Paso 1: Planteamiento y Condiciones de Partida",
          "subtitle": "Definir el soporte o dominio de integración",
          "example": "$$soporte = \\{(x, y) \\in \\mathbb{R}^2 : 0 < x < y < 1\\}$$"
        },
        {
          "title": "Paso 2: Resolución Analítica",
          "subtitle": "Integrar respecto a la variable correspondiente",
          "example": "$$\\int_0^1 ... dx$$"
        }
      ],
      "ejemploCompleto": "Enunciado del problema de examen:\\n...\\n\\n### Solución Detallada:\\n$$...$$\\n\\n### Resultado Final:\\n$$...$$",
      "variaciones": [
        {
          "title": "Variante A: Soporte no rectangular",
          "content": "Qué cambia en los límites de integración...",
          "fix": "Ajuste específico de los extremos de la integral...",
          "example": "$$0 < x < y$$"
        }
      ],
      "trucos": [
        {
          "title": "Atajo de simetría",
          "content": "Si las variables son independientes o la función es simétrica, se ahorra el cálculo..."
        }
      ],
      "errores": [
        {
          "title": "Olvidar normalizar la constante",
          "content": "Verificar que la integral total sea 1 antes de calcular probabilidades."
        }
      ],
      "trampas": [
        {
          "title": "Límites variables dependientes",
          "content": "Integrar primero respecto a la variable dependiente y nunca dejar variables en los límites exteriores."
        }
      ],
      "ejerciciosPropuestos": [
        {
          "ref": "Examen Junio 2023 - Ejercicio 2",
          "nota": "2.5 pts",
          "enunciado": "Enunciado del ejercicio propuesto... Solución final: $k = 4$."
        }
      ]
    }
  ]
}
```
