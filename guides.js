// Páginas de estudio (guías). Resumen propio a partir del handbook oficial de B1 Preliminary.
window.LEXI_GUIDES = [
{ id:'exam-overview', section:'exam', title:'El examen PET de un vistazo', html:`
<p>El B1 Preliminary evalúa las cuatro destrezas en cuatro pruebas. En total dura unas 2 horas y 12 minutos.</p>
<table><tr><th>Prueba</th><th>Duración</th><th>Partes</th><th>Preguntas</th></tr>
<tr><td>Reading</td><td>45 min</td><td>6</td><td>32</td></tr>
<tr><td>Writing</td><td>45 min</td><td>2</td><td>2 textos (~100 palabras)</td></tr>
<tr><td>Listening</td><td>~30 min (+6 para pasar respuestas)</td><td>4</td><td>25</td></tr>
<tr><td>Speaking</td><td>12–17 min, en pareja</td><td>4</td><td>–</td></tr></table>
<h4>Resultados</h4>
<p>Cada prueba da una puntuación en la <b>Cambridge English Scale</b> y la nota final es la media.</p>
<table><tr><th>Escala</th><th>Resultado</th></tr>
<tr><td>160–170</td><td>Grade A: certificado que acredita nivel <b>B2</b></td></tr>
<tr><td>153–159</td><td>Grade B: B1</td></tr>
<tr><td>140–152</td><td>Grade C: B1</td></tr>
<tr><td>120–139</td><td>Certificado de nivel A2</td></tr></table>
<p class="tip">Si sacas Grade A en el PET, ya tienes un certificado de B2. Es un buen objetivo intermedio mientras preparas el B2 First.</p>`},
{ id:'exam-reading', section:'exam', title:'Reading: las 6 partes', html:`
<table><tr><th>Parte</th><th>Tarea</th><th>Qué evalúa</th></tr>
<tr><td>1 (5 preg.)</td><td>5 textos cortos reales (avisos, mensajes, etiquetas) con 3 opciones</td><td>Entender el mensaje principal</td></tr>
<tr><td>2 (5)</td><td>Emparejar 5 personas con 8 textos cortos sobre un tema</td><td>Comprensión detallada</td></tr>
<tr><td>3 (5)</td><td>Texto largo con preguntas de 4 opciones</td><td>Detalle, idea global, opinión y actitud del autor</td></tr>
<tr><td>4 (5)</td><td>Texto al que le faltan 5 frases; eliges entre 8</td><td>Coherencia y estructura del texto</td></tr>
<tr><td>5 (6)</td><td>Texto con huecos; 4 opciones por hueco</td><td>Vocabulario, collocations, preposiciones</td></tr>
<tr><td>6 (6)</td><td>Texto con huecos; escribes una palabra</td><td>Gramática, phrasal verbs, expresiones fijas</td></tr></table>
<h4>Estrategias</h4>
<p><b>Parte 1:</b> piensa quién escribe, a quién y para qué. La opción correcta suele decir lo mismo con otras palabras.</p>
<p><b>Parte 2:</b> subraya 3 requisitos de cada persona. El texto correcto debe cumplir <i>todos</i>; los distractores cumplen uno o dos.</p>
<p><b>Parte 3:</b> las preguntas van en el orden del texto, salvo la última, que es global (de todo el texto).</p>
<p><b>Parte 4:</b> fíjate en pronombres (it, they, this), conectores y tiempos verbales antes y después del hueco.</p>
<p><b>Partes 5 y 6:</b> lee la frase entera, no solo el hueco. En la 6 suelen faltar preposiciones, auxiliares, relativos, artículos y conectores.</p>
<p class="tip">Nunca dejes respuestas en blanco: no restan puntos.</p>`},
{ id:'exam-writing', section:'exam', title:'Writing: las 2 partes', html:`
<table><tr><th>Parte</th><th>Tarea</th><th>Palabras</th></tr>
<tr><td>1 (obligatoria)</td><td>Responder un <b>email</b> usando 4 notas que te dan</td><td>~100</td></tr>
<tr><td>2 (eliges una)</td><td>Un <b>artículo</b> o una <b>historia</b></td><td>~100</td></tr></table>
<p>Cada texto vale 20 puntos: 4 criterios de 0 a 5 (lo explico en "Cómo se puntúa el Writing").</p>
<h4>Consejos clave</h4>
<p>Responde a <b>las cuatro notas</b> del email: si falta una, bajas en Content. Planifica 5 minutos, escribe 15 y revisa 3 por texto.</p>
<p>No te pases mucho de 100 palabras: más texto significa más errores y no suma puntos.</p>
<p>En la historia, la frase inicial o el título que te dan es obligatorio y la historia debe tener sentido con él.</p>`},
{ id:'exam-listening', section:'exam', title:'Listening: las 4 partes', html:`
<table><tr><th>Parte</th><th>Tarea</th></tr>
<tr><td>1 (7 preg.)</td><td>7 diálogos o monólogos cortos; eliges entre 3 imágenes</td></tr>
<tr><td>2 (6)</td><td>6 diálogos cortos; entender la idea general, opinión o intención</td></tr>
<tr><td>3 (6)</td><td>Un monólogo; completar 6 huecos en unas notas (1–3 palabras)</td></tr>
<tr><td>4 (6)</td><td>Una entrevista; 6 preguntas de 3 opciones, incluidas actitudes y opiniones</td></tr></table>
<p>Cada grabación se escucha <b>dos veces</b>.</p>
<h4>Estrategias</h4>
<p>Lee las preguntas antes de escuchar. En la Parte 1 suelen mencionar las tres opciones, pero solo una es la respuesta ("I was going to… but…").</p>
<p>En la Parte 3 anticipa qué tipo de palabra falta (fecha, número, nombre, objeto). Si deletrean un nombre, apúntalo letra a letra: la ortografía cuenta.</p>
<p class="tip">En la app, el Listening usa la voz del móvil. No es tan natural como el examen, pero entrena la comprensión y la estrategia. Complementa con podcasts o series.</p>`},
{ id:'exam-speaking', section:'exam', title:'Speaking: las 4 partes', html:`
<table><tr><th>Parte</th><th>Tiempo</th><th>Tarea</th></tr>
<tr><td>1</td><td>2–3 min</td><td>El examinador te hace preguntas personales (nombre, dónde vives, rutina, gustos)</td></tr>
<tr><td>2</td><td>~1 min cada uno</td><td>Describir una foto a color tú solo</td></tr>
<tr><td>3</td><td>~2–3 min</td><td>Con tu compañero: hacer sugerencias, comentar opciones y llegar a un acuerdo sobre una situación</td></tr>
<tr><td>4</td><td>~3 min</td><td>Conversación con tu compañero sobre el tema de la Parte 3</td></tr></table>
<p>Se evalúa gramática y vocabulario, gestión del discurso, pronunciación y comunicación interactiva.</p>
<p class="tip">Lo que más penaliza es quedarse callado. Si no sabes una palabra, descríbela ("It's a thing you use to…"). En la Parte 3, pregunta a tu compañero: "What do you think?"</p>`},
{ id:'exam-marks', section:'exam', title:'Cómo se puntúa el Writing', html:`
<p>Cada texto se puntúa de 0 a 5 en cuatro criterios (máximo 20 por texto, 40 en total). Esta es la escala que uso para corregir tus textos:</p>
<table><tr><th>Criterio</th><th>Qué significa</th><th>Para sacar 5</th></tr>
<tr><td><b>Content</b></td><td>¿Has hecho todo lo que pide la tarea?</td><td>Todo es relevante y el lector queda completamente informado.</td></tr>
<tr><td><b>Communicative Achievement</b></td><td>¿Encaja con el tipo de texto y el lector (registro, tono, formato)?</td><td>Usa las convenciones del tipo de texto para mantener la atención del lector y comunicar ideas sencillas.</td></tr>
<tr><td><b>Organisation</b></td><td>¿Está bien estructurado y conectado?</td><td>Bien organizado y coherente, con variedad de conectores y mecanismos de cohesión.</td></tr>
<tr><td><b>Language</b></td><td>Vocabulario y gramática</td><td>Variedad de vocabulario cotidiano y de estructuras simples y algunas complejas, con buen control. Los errores no dificultan la comprensión.</td></tr></table>
<p>La banda 3 es el nivel B1 "sólido": se usan conectores básicos, gramática sencilla con buen control y los errores se notan pero se entiende todo. Las bandas 4 y 2 están entre medias.</p>
<p class="tip">Para subir de 3 a 5 en Language: mete una condicional, una pasiva, un relativo y algún phrasal verb o collocation, siempre que salgan natural.</p>`},
{ id:'exam-b2', section:'exam', title:'El salto al B2 First', html:`
<p>El <b>B2 First (FCE)</b> tiene cuatro pruebas. Reading y Use of English van juntas en un mismo papel.</p>
<table><tr><th>Prueba</th><th>Duración</th><th>Contenido</th></tr>
<tr><td>Reading & Use of English</td><td>1 h 15 min</td><td>7 partes, 52 preguntas</td></tr>
<tr><td>Writing</td><td>1 h 20 min</td><td>Essay obligatorio + a elegir: artículo, email/carta, informe o reseña (140–190 palabras)</td></tr>
<tr><td>Listening</td><td>~40 min</td><td>4 partes, 30 preguntas</td></tr>
<tr><td>Speaking</td><td>14 min</td><td>4 partes, en pareja</td></tr></table>
<h4>Use of English (partes 1–4)</h4>
<table><tr><th>Parte</th><th>Tarea</th></tr>
<tr><td>1</td><td>Cloze de 8 huecos con 4 opciones (collocations, phrasal verbs, matices de vocabulario)</td></tr>
<tr><td>2</td><td>Open cloze: 8 huecos, una palabra</td></tr>
<tr><td>3</td><td>Word formation: 8 huecos; transformas una palabra dada (SUCCEED → successful)</td></tr>
<tr><td>4</td><td>Key word transformations: 6 frases; reescribes usando una palabra clave (2–5 palabras)</td></tr></table>
<p class="tip">Los ejercicios de "Forma la palabra" y las transformaciones de la app te preparan ya para las partes 3 y 4.</p>`},
{ id:'s-phrases', section:'speaking', title:'Frases útiles para el Speaking', html:`
<h4>Part 2: describir una foto</h4>
<p>In this photo I can see… / In the foreground / background… / On the left / right… / It looks like… / They seem to be… / I think it might be… / Maybe they're…</p>
<p>Si no sabes una palabra: <i>It's a kind of… / It's something you use for…</i></p>
<h4>Part 3: sugerir y negociar</h4>
<p>Shall we start with…? / What do you think about…? / I think… would be a good idea because… / That's a good point, but… / I'm not sure about that. / Why don't we choose…? / So, do we agree that…?</p>
<h4>Part 4: opinar</h4>
<p>In my opinion… / I'd say that… / It depends on… / For example, in my case… / I agree with you. / I see what you mean, but…</p>
<h4>Ganar tiempo</h4>
<p>Let me think… / That's an interesting question. / Well, …</p>`}
];
