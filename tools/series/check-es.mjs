// Lesson B, Spanish (neutral, "tú"): "Comprueba una respuesta segura".
// Made-up workshop, made-up assistant; every fact the child needs is on the
// page. Adapted, not word for word (prices in pesos, 24-hour times). Not
// reviewed by a native-speaking editor or a teacher.

const WHO = 'Asistente (ejemplo de práctica)';
const SCHEDULE = {
  title: 'Horario del taller "Engranaje" (el documento original)',
  rows: [['Para quién', 'niños y niñas de 7 a 12 años'], ['Robots', 'lunes, 15:00'], ['Dibujo', 'miércoles, 16:30'], ['Maquetas de cartón', 'sábado, 11:00'], ['Duración', 'cada clase dura 1 hora']],
};
const SCHEDULE2 = {
  title: 'Aviso del taller "Engranaje" (el documento original)',
  rows: [['Visita al taller', 'sábado, 12:00'], ['Inscripción', 'en recepción, planta baja']],
  note: 'El aviso no dice nada sobre el precio de la visita.',
};
const ANSWER = 'El taller Engranaje es para niños y niñas. La clase de robots es el miércoles a las 16:30. Cada clase dura una hora.';
const SENTENCES = ['El taller es para niños y niñas.', 'La clase de robots es el miércoles a las 16:30.', 'Cada clase dura una hora.'];

const findStep = () => ({
  title: 'Encuentra la afirmación dudosa',
  intro: 'Le preguntaste al asistente cuándo es la clase de robots. Respondió con mucha seguridad. Compara su respuesta con el horario.',
  doc: SCHEDULE,
  bubble: { who: WHO, text: ANSWER },
  questions: [
    { q: '¿Qué afirmación del asistente no coincide con el horario?', options: SENTENCES, correct: 1,
      ok: 'Sí. El miércoles a las 16:30 es dibujo; robots es el lunes a las 15:00. El asistente confundió las filas.',
      noAll: 'Esta afirmación coincide con el horario. Busca la fila de robots y compara.' },
  ],
});

const fixStep = {
  title: 'Corrige la respuesta y di por qué',
  doc: SCHEDULE,
  questions: [
    { q: '¿Qué es lo correcto?', options: ['La clase de robots es el lunes a las 15:00.', 'La clase de robots es el miércoles a las 16:30.', 'La clase de robots es el sábado a las 11:00.'], correct: 0,
      ok: 'Correcto: eso dice el horario.', noAll: 'Mira la fila "Robots" del horario.' },
    { q: '¿En qué se apoya tu corrección?', options: ['Está escrito en el documento original: el horario del taller', 'El asistente respondió con mucha seguridad', 'Suena más correcto'], correct: 0,
      ok: 'Sí. La razón es el documento del que trata la pregunta. Un tono seguro no prueba nada.',
      noAll: 'Un tono seguro y "suena bien" no son pruebas. ¿En qué te puedes apoyar?' },
  ],
};

const unknownStep = {
  title: 'Ejemplo nuevo: resuélvelo tú',
  intro: 'Volviste a preguntar: ¿cuánto cuesta la visita?',
  doc: SCHEDULE2,
  bubble: { who: WHO, text: 'La visita al taller del sábado a las 12:00 cuesta 100 pesos.' },
  questions: [
    { q: '¿Es cierto que la visita cuesta 100 pesos?', options: ['Sí, es cierto', 'No, es falso', 'Todavía no se puede saber'], correct: 2,
      ok: 'Correcto. El aviso da la hora de la visita, pero no el precio. El asistente solo pudo inventar "100 pesos", y el documento no lo confirma.',
      no: { 0: 'El documento no tiene precio: nada confirma "100 pesos".', 1: 'Tampoco puedes decir "falso": el documento no tiene ningún precio. ¿Qué falta para decidir?' } },
    { q: '¿Cómo puedes saber el precio?', options: ['Preguntar en la recepción del taller, como dice el aviso', 'Preguntarle otra vez al asistente hasta que dé la misma respuesta', 'Creerle, porque el asistente dio una cifra exacta'], correct: 0,
      ok: 'Sí. Necesitas una fuente que sea responsable de esa información.',
      noAll: 'Una respuesta repetida o exacta del asistente sigue sin estar comprobada. ¿Quién sabe de verdad el precio?' },
  ],
};

const twoSources = {
  title: 'Compara dos fuentes',
  intro: 'Pregunta: ¿en qué año abrió el taller Engranaje? El asistente respondió: "En 2022, lo dicen muchos sitios web." Esto es lo que encontraste.',
  sources: [
    { name: 'Fuente A: la web del taller, página "Quiénes somos"', origin: 'el propio taller', date: 'página actualizada en 2026', says: '"El taller abrió en 2019"' },
    { name: 'Fuente B: una publicación en un foro', origin: 'un usuario sin nombre', date: 'sin fecha', says: '"Abrieron hace poco, creo que en 2022"' },
  ],
  questions: [
    { q: '¿Qué fuente es mejor para responder esta pregunta?', options: ['A: la escribió el propio taller y tiene fecha', 'B: dice "2022", como el asistente', 'Las dos por igual: ambas dan un año'], correct: 0,
      ok: 'Sí. Fíjate en quién lo escribió (origen), cuándo (fecha) y si trata directamente de la pregunta.',
      noAll: 'Coincidir con el asistente y la cantidad de sitios parecidos no prueban nada. ¿Quién sabe mejor el año de apertura?' },
  ],
};

const teenWhy = {
  q: '"Lo dicen muchos sitios web": ¿por qué es una razón débil?',
  options: ['Los sitios pueden copiarse el mismo error unos a otros', 'Es una razón fuerte: si muchos lo dicen, debe ser verdad', 'Nunca hay muchos sitios'], correct: 0,
  ok: 'Correcto. Diez copias de un error siguen siendo un error. Lo que importa es de dónde salió la información.',
  noAll: 'Piensa de dónde sacan la información los sitios web y si pueden repetirse entre sí.',
};
const adultStakes = {
  q: 'Incluso la fuente A puede equivocarse. ¿Qué haces si una decisión importante depende del año (por ejemplo, una inscripción a un concurso)?',
  options: ['Comprobarlo de otra forma independiente: por ejemplo, pedir un documento o llamar al taller', 'Nada: una web oficial nunca se equivoca', 'Usar el año que dio el asistente'], correct: 0,
  ok: 'Sí. Cuanto más importante es la decisión, más confirmación independiente necesita.',
  noAll: 'Una fuente oficial es más confiable, pero no infalible. ¿Cómo confirmas un dato importante?',
};

export const es = {
  common: {
    title: 'Comprueba una respuesta segura',
    desc: 'Un asistente de práctica cuenta con seguridad un horario, pero con un error. El niño o la niña encuentra la afirmación dudosa, la compara con el documento, la corrige y da la razón; después viene un caso en el que falta información.',
    goal: 'Aprender a comparar una respuesta segura con el documento original y a decir "todavía no se puede saber" cuando la información no está.',
    noJs: 'La actividad necesita JavaScript. Sin él, abajo están el objetivo, la explicación y una tarea para imprimir.',
    explain1: 'Un asistente puede responder con seguridad y aun así equivocarse: confundió filas del horario. Comprobar es comparar con la fuente de la que trata la pregunta.',
    explain2: 'Si la fuente no tiene la información, la respuesta honesta es "todavía no se puede saber". Una cifra exacta en la respuesta no significa que esté comprobada.',
    explain3: 'Un tono seguro, la repetición y la cantidad de enlaces no prueban la verdad. Fíjate en quién lo escribió, cuándo y si trata de la pregunta.',
    doneH: '¿Y ahora qué?',
    doneText: 'Una respuesta segura todavía no es una respuesta comprobada. Comprobar es apoyarse en una fuente, y cuando falta información, decirlo.',
    choices: ['Repetir esta actividad', 'Siguiente actividad: "¿Qué se puede compartir?"', 'Todas las lecciones'],
    adult: {
      goal: 'El niño o la niña compara afirmaciones con la fuente original, distingue "falso" de "todavía no se puede saber" y no toma la seguridad ni la cantidad de enlaces como prueba.',
      questions: ['¿Cómo te diste cuenta de que el asistente se equivocó?', '¿Qué diferencia hay entre "falso" y "todavía no se puede saber"?', '¿A quién le preguntarías si el documento no tiene la respuesta?'],
      misconception: 'Si una respuesta suena segura y tiene cifras exactas, es correcta. Una redacción precisa no significa que la información esté comprobada.',
      signs: ['Señala la línea del documento en la que se apoya.', 'Dice "todavía no se puede saber" cuando falta información, y dice dónde buscar.', 'Al comparar fuentes, mira el origen y la fecha, no si coinciden con la respuesta.'],
      method: 'Todos los textos del asistente están escritos de antemano: no es un chat en vivo ni una petición a una red neuronal. El taller y su horario son inventados para que la respuesta se pueda comprobar en la misma página.',
      print: {
        task: 'Horario: "Robots — lunes 15:00; Dibujo — miércoles 16:30". El asistente dijo: "Robots es el miércoles". 1) Encuentra el error. 2) Corrígelo. 3) El asistente dijo: "Cada clase cuesta 100 pesos". ¿Se puede comprobar con el horario?',
        answers: '1) El día y la hora están confundidos. 2) Robots es el lunes a las 15:00. 3) No: el horario no tiene precios; todavía no se puede saber. Hay que preguntar al taller.',
      },
    },
  },
  tiny: {
    goal: 'Vamos a comprobar con el horario si el asistente dijo la verdad.',
    steps: [
      { title: 'Compara con el horario', intro: 'Una persona adulta lee en voz alta. El asistente dijo: "La clase de robots es el miércoles." Miren juntos el horario.', doc: SCHEDULE,
        questions: [{ q: '¿Robots es el miércoles?', options: ['Sí', 'No'], correct: 1, ok: 'Correcto: en el horario, robots es el lunes. El asistente se equivocó.', noAll: 'Busquen juntos la fila "Robots". ¿Qué día dice?' }] },
      { title: '¿Por qué lo piensas?', questions: [{ q: '¿Cómo lo sabes?', options: ['Miré el horario', 'El asistente sonaba muy seguro'], correct: 0, ok: '¡Sí! Lo comprobamos con el horario.', noAll: 'Una voz segura no es una comprobación. ¿Dónde miramos?' }] },
      { title: 'Ejemplo nuevo', intro: 'El asistente dijo: "La visita cuesta 100 pesos." El aviso solo da la hora.', doc: SCHEDULE2,
        questions: [{ q: '¿Sabemos el precio?', options: ['Sí, 100 pesos', 'Todavía no: hay que preguntar a una persona adulta o en recepción'], correct: 1, ok: 'Correcto: el aviso no tiene precio. Cuando no sabemos, lo decimos, y preguntamos.', noAll: 'Mira el aviso: ¿hay un precio?' }] },
    ],
  },
  child: {
    goal: 'Encontrar el error en una respuesta segura, corregirlo con el documento y distinguir "falso" de "todavía no se puede saber".',
    steps: [findStep(), fixStep, unknownStep],
  },
  teen: {
    goal: 'Comparar afirmaciones con el documento, distinguir "falso" de "todavía no se puede saber" y comparar fuentes por origen y fecha.',
    steps: [findStep(), fixStep, unknownStep, { ...twoSources, questions: [...twoSources.questions, teenWhy] }],
  },
  adult: {
    goal: 'Comprobar afirmaciones con la fuente original, sopesar origen, fecha y pertinencia, y ajustar cuánto se comprueba a la importancia de la decisión.',
    steps: [findStep(), fixStep, unknownStep, { ...twoSources, questions: [...twoSources.questions, teenWhy, adultStakes] }],
  },
};
