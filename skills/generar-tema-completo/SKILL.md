---
name: generar-tema-universitario
description: Genera temas universitarios completos y exhaustivos con teoría profunda, ejercicios paso a paso y análisis de frecuencia de examen al estilo NotebookLM.
---

# Skill: Generador Universitario Exhaustivo (NotebookLM Style)

Esta skill define el protocolo de análisis y generación para **UniverSOS**. Su objetivo es transformar enunciados de exámenes, apuntes y colecciones de ejercicios en un tema de estudio riguroso, estructurado y optimizado para maximizar la nota de examen.

---

## 1. Principios Fundamentales

1. **Cero Resúmenes Perezosos:**
   - Prohibido omitir pasos algebraicos o usar frases como "el resto es análogo" o "dejado como ejercicio".
   - Todo desarrollo matemático debe resolverse hasta el resultado final simplificado con sus unidades de medida.
2. **Análisis Forense de Exámenes:**
   - Detectar la frecuencia histórica y el peso en puntos de cada tipo de ejercicio.
   - Categorizar cada ejercicio con una etiqueta de examen explícita (`[ALTA PROBABILIDAD - 3.5 pts]`, `[TÍPICO PARCIAL - 2.0 pts]`, etc.).
3. **Número Variable de Ejercicios:**
   - No imponer un límite arbitrario (3 o 5 ejercicios). Si el tema abarca 8, 10 o 14 tipologías distintas con variaciones relevantes, se generan todas las tipologías necesarias para cubrir el temario al 100%.
4. **Latex Estricto y Escapado Doble:**
   - Las fórmulas en línea usan `$ ... $` y las fórmulas en bloque usan `$$ ... $$`.
   - En respuestas JSON, todas las barras invertidas de LaTeX **deben estar doblemente escapadas**: `\\frac`, `\\int`, `\\sigma`, `\\vec`, etc.

---

## 2. Esquema de Estructura de Tema

Cada tema generado debe contener:

### A. Teoría Exhaustiva (`theory`)
1. **Fundamentos Conceptuales:** Definición matemática/formal rigurosa + explicación intuitiva.
2. **Fórmulas y Teoremas Clave:** Todas las ecuaciones con definición precisa de cada variable y unidades en el Sistema Internacional.
3. **Condiciones de Aplicabilidad:** Cuándo se puede usar cada fórmula y cuándo está prohibido (hipótesis de partida).
4. **Demostraciones Clave:** Demostraciones formales que suelen pedir en preguntas de teoría o desarrollo.
5. **Trampas Teóricas Habituales:** Confusiones típicas donde los profesores restan puntos en el examen.
6. **Checklist de Examen:** Puntos de control que el alumno debe verificar antes de entregar el examen.

### B. Colección Completa de Ejercicios (`exercises`)
Para cada tipología de problema identificada:
- **`title`:** Nombre descriptivo + Etiqueta de examen: ej. `"Cálculo de Tensiones Principales y Círculo de Mohr [PROBABILIDAD EXAMEN: 85% | PESO: 3.5 PTS]"`.
- **`statement`:** Enunciado completo y realista de nivel universitario con todos los datos numéricos y diagramas descritos.
- **`difficulty`:** `"Alta"`, `"Media"` o `"Extrema (Examen Final)"`.
- **`solution`:**
  1. *Estrategia & Algoritmo*: Pasos secuenciales antes de operar.
  2. *Desarrollo Paso a Paso*: Sustituciones numéricas intermedias y simplificaciones completas en LaTeX.
  3. *Resultado Final Enmarcado*: Con unidades de medida y análisis físico/geométrico del resultado.
  4. *Trampas y Errores Típicos*: Dónde caen habitualmente los alumnos en este ejercicio concreto.
- **`proposed`:** 1-2 ejercicios complementarios con solo la solución final para que el alumno practique de forma autónoma.

---

## 3. Formato JSON de Salida

```json
{
  "subject": "Nombre de la Asignatura",
  "topic": "Nombre del Tema Completo",
  "theory": {
    "sections": [
      {
        "title": "1. Fundamentos y Formulación Rigurosa",
        "content": "Texto detallado en Markdown con fórmulas en $latex$..."
      }
    ]
  },
  "exercises": [
    {
      "title": "Tipo 1: Nombre de la Tipología [PROBABILIDAD EXAMEN: 90% | PESO: 3.0 PTS]",
      "difficulty": "Alta",
      "statement": "Enunciado completo con datos numéricos...",
      "solution": "### 1. Estrategia\\n...\\n### 2. Desarrollo Paso a Paso\\n$$\\\\int_0^L ...$$\\n### 3. Resultado Final\\n...\\n### 4. Trampas Típicas\\n...",
      "proposed": "Problema propuesto similar para auto-evaluación con solución final numérica."
    }
  ]
}
```
