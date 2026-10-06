# Lexi: pautas de mejora de la lógica de ejercicios (propuesta v5)

## 1. Cómo funciona hoy

Cada sesión diaria se construye así:

1. **Repasos vencidos:** ejercicios ya vistos cuya fecha de repaso ha llegado. Al acertar, se repasan a 1 día, 3 días, 7–8 días… Al fallar, a los 10 minutos.
2. **Nuevos:** hasta el límite diario (por defecto 12). Primero salen los de packs y luego los del banco base, con B1 y algo de B2.
3. **Fallos en sesión:** cada fallo vuelve a aparecer unos 4 ejercicios después, una vez.
4. **Extra review:** coge ejercicios ya vistos, los que tienen el repaso más próximo, aunque no hayan vencido.

### Por qué se nota repetición

- Con 12 nuevos al día, tras 2–3 sesiones solo quedan repasos.
- *Extra review* nunca mete material nuevo y no evita lo que acabas de ver.
- Un ejercicio siempre se presenta igual: mismo formato y misma frase. Aunque el algoritmo funcione bien, la sensación es de "ya lo he visto".
- El banco base (unos 210 ejercicios) se agota en pocas semanas sin packs.

## 2. Mejoras propuestas (por prioridad)

### P1. Más material cuando el usuario quiera
- **Botón "Learn new words":** sesión solo con ejercicios nuevos, aunque se haya pasado el límite diario. Aviso suave: "Has superado tu límite: más de 20 al día dificulta recordarlas".
- **Extra review mejorado:** excluye lo respondido en las últimas 2 horas. Si no queda nada, ofrece nuevos.
- **Ajuste "New words per day"** con más opciones: 5 / 8 / 12 / 20 / 30.

### P2. Indicador del banco
- En Home: "N ejercicios nuevos disponibles".
- Si quedan menos de 30: tarjeta "Te quedas sin ejercicios nuevos: pide un pack a Claude", con acceso a *Data → Copy updates*.

### P3. Rotación de formato por ejercicio (lo más importante)
El mismo contenido se presenta en formatos distintos según su madurez, pasando del **reconocimiento a la producción**:

| Repasos acertados | Formato |
|---|---|
| 0 (nuevo) | Elegir opción (`mcq`) |
| 1 | Escribir con pista (`gap` con `hint` visible) |
| 2–3 | Escribir sin pista |
| 4+ | Alterna: escribir, traducir desde el español o dictado de la frase completa |

**Conversiones automáticas:**
- `mcq → gap`: `answers=[answer]`, mismo `prompt`. Pista: primera letra + número de letras.
- `gap → mcq`: el app genera 3 distractores de la misma `cat` y `topic` (respuestas de otros ejercicios), excluyendo las respuestas válidas.
- Cualquier ítem con `prompt` → dictado de la frase completa (`prompt` con la respuesta en el hueco).
- Ítems con traducción: si el ítem trae `es_sentence` (frase completa en español), puede ofrecer el formato traducir.

**Opcional en packs:** un ítem puede traer `variants`, una lista de formatos alternativos ya escritos a mano (por ejemplo, una segunda frase de ejemplo). La app rota entre `prompt` y `variants` para no repetir siempre la misma frase.

### P4. Phrasal verbs: 6 formatos generados desde la biblioteca
Cada phrasal verb de la biblioteca (con sus 2 ejemplos) debe producir automáticamente:

1. **Partícula:** *I gave ___ smoking.* → up / in / out / away. Distractores: partículas frecuentes (up, down, out, off, on, in, over, away, after, back) distintas de la correcta.
2. **Verbo:** *I ___ up smoking.* → gave / took / put / made. Mismo tiempo verbal en los distractores.
3. **Significado en contexto:** la frase con el verbo en mayúsculas → elegir el significado (EN o ES según idioma).
4. **Hueco conjugado con pista** (el actual).
5. **Sustituir un sinónimo:** *The meeting was postponed* → escribir *put off*. Requiere un campo nuevo opcional `syn` en la biblioteca: `{ "syn": "postpone" }`.
6. **Dictado** de uno de los ejemplos.

**Reglas:**
- En la sesión diaria, cada phrasal verb rota por estos formatos según P3: 1 y 3 primero, 4 y 5 después, 6 al final.
- En el test de phrasal verbs, las 10 preguntas se reparten en al menos 4 formatos distintos, no solo 2.
- El ejemplo usado se alterna entre los dos disponibles.

### P5. Mezcla dentro de la sesión
- Nunca dos ejercicios seguidos de la misma `cat`.
- Al menos un 40% de ejercicios de producción (escribir, traducir, dictado).
- Los reintentos de fallo se muestran en formato más fácil: si falló escribiendo, reintento en elección con la explicación visible.

### P6. Sesiones por tema o tipo
- En Tests, nueva sección **"Focused practice"**: elegir tipo (phrasal verbs, collocations, false friends, word formation, prepositions, dictation) o tema (travel, work…).
- Usa ítems vistos y no vistos de esa categoría, priorizando los vencidos y los más fallados.
- Cuenta para la repetición espaciada igual que la sesión diaria.

### P7. Ejercicios "atascados"
- Si un ítem acumula 4 o más fallos, se marca como difícil.
- La siguiente vez se muestra primero la explicación ("Remember: …") y luego el ejercicio.
- Aparece en Progress como "Hard words" y va en la exportación como `leeches`, para que Claude prepare refuerzo específico.

### P8. Datos para Claude
- Cada intento exportado incluye el `format` mostrado (mcq / gap / gap_hint / translate / dictation / particle / meaning / synonym).
- Así se distingue si falla reconocer o producir, que es la información más útil para preparar packs.

## 3. Cambios de formato de packs

Todo opcional y compatible con los packs actuales:

| Campo | Dónde | Uso |
|---|---|---|
| `variants` | `items` | Lista de `{prompt, answers?, options?, answer?}` alternativos para rotar |
| `es_sentence` | `items` | Frase completa en español para el formato traducir |
| `syn` | `phrasal` | Sinónimo de una palabra para el formato "sustituir" |
| `syn_en` / `syn_es` | `phrasal` | Si el sinónimo necesita contexto |

## 4. Criterios de aceptación

- Con 300 ítems vistos y 0 nuevos, *Extra review* no muestra un ítem respondido hace menos de 2 horas.
- Un mismo ítem no aparece dos veces seguidas con el mismo formato en sus 3 primeros repasos.
- En 50 sesiones simuladas, no hay dos ítems consecutivos de la misma `cat`, salvo que la sesión sea "Focused practice".
- El test de phrasal verbs usa al menos 4 formatos en cada ejecución.
- La exportación incluye `format` en cada intento y `leeches` en el resumen.
- Todo sigue funcionando sin conexión y con packs antiguos sin los campos nuevos.

## 5. Qué no cambiar
- Los intervalos de repaso (1, 3, ~7 días, multiplicador) funcionan bien. El problema es de variedad y cantidad, no del algoritmo.
- La corrección tolerante (contracciones y erratas de 1 letra como "casi").
- El formato de packs existente: todo lo nuevo es opcional.
