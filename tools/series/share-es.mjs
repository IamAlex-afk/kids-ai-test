// Lesson C, Spanish (neutral, "tú"): "¿Qué se puede compartir?". Every name,
// address and number below is made up for the demo (Spanish names, a phone of
// zeros); the child never types anything about themselves. Adapted, not word
// for word. Not reviewed by a native-speaking editor or a teacher.

const DEMO = 'Es un personaje inventado con datos inventados, solo para la actividad.';
const P = (text, needed, why) => ({ text, needed, why });

const TASK = P('Ayúdame a pensar un nombre para nuestro equipo de robótica.', true, 'esta es la tarea en sí: sin ella el asistente no sabe qué se necesita');
const ROBOT = P('Estamos armando un robot que separa la basura.', true, 'ayuda a encontrar un nombre adecuado y no dice nada sobre quién eres');
const NAME = P('Soy Mateo García,', false, 'tu nombre y apellido no hacen falta para ponerle nombre a un equipo');
const SCHOOL = P('voy a la Escuela Los Pinos, en la calle Jardín,', false, 'tu escuela y tu calle muestran dónde encontrarte y no hacen falta para la tarea');
const PHONE = P('mi teléfono es 000 000 0000.', false, 'un número de teléfono nunca hace falta para pensar un nombre');
const CLUB = P('todos los sábados a las 10 voy al club de ajedrez junto al parque.', false, 'tu rutina y el lugar muestran dónde y cuándo se te puede encontrar');
const TEAM = P('Somos cuatro en el equipo.', null, 'el número de integrantes no revela nada y puede ayudar con el nombre');

const redact = (pieces, extra = {}) => ({
  q: 'Toca los fragmentos que hay que quitar o cambiar. La tarea tiene que seguir clara.',
  checkBtn: 'Comprobar',
  pieces,
  ok: 'Listo: la tarea sigue ahí y lo que sobraba se fue. Así se explica por qué cada fragmento hace falta o no:',
  no: 'Todavía no. Mira la explicación: quedó algo que sobra, o se quitó algo necesario.',
  ...extra,
});

const sofia = {
  title: 'Ejemplo nuevo: resuélvelo tú',
  intro: 'Otra petición. ' + DEMO + ' Pista: los invitados necesitan la dirección, el asistente no; en el texto se puede cambiar por [dirección] y completarla después.',
  bubble: { who: 'Sofía le escribe al asistente', text: 'Me llamo Sofía Martínez. Ayúdame a escribir una invitación para mi cumpleaños, el sábado a las 15:00. Dirección: calle Los Robles 7, departamento 12. ¿Y me dices si mi contraseña del juego es segura: gatito123?' },
  redact: redact([
    P('Me llamo Sofía Martínez.', false, 'ella misma puede firmar la invitación; el asistente no necesita su apellido'),
    P('Ayúdame a escribir una invitación para mi cumpleaños,', true, 'esta es la tarea en sí: sin ella el asistente no sabe qué escribir'),
    P('el sábado a las 15:00.', true, 'la hora hace falta para la invitación y, por sí sola, no muestra quién es ella'),
    P('Dirección: calle Los Robles 7, departamento 12.', false, 'cámbiala por [dirección] y complétala tú en el texto terminado'),
    P('Mi contraseña del juego: gatito123', false, 'una contraseña no se le da a nadie, ni siquiera "para comprobarla"; puedes preguntar qué hace segura a una contraseña'),
  ], { result: 'Ayúdame a escribir una invitación para mi cumpleaños, el sábado a las 15:00, en [dirección]. ¿Y qué hace segura a una contraseña?', resultH: 'Petición segura:' }),
};

export const es = {
  common: {
    title: '¿Qué se puede compartir?',
    desc: 'Un personaje inventado le pide ayuda a un asistente y cuenta demasiado sobre sí mismo. El niño o la niña quita o cambia los datos personales sin perder la tarea, y ve por qué cada fragmento hace falta o no.',
    goal: 'Aprender a dejar en una petición solo lo que la tarea necesita y a no compartir datos personales.',
    noJs: 'La actividad necesita JavaScript. Sin él, abajo están el objetivo, la explicación y una tarea para imprimir.',
    explain1: 'Para la mayoría de las tareas, un asistente no necesita tu nombre, dirección, escuela, teléfono ni contraseña. La tarea se puede describir sin ellos.',
    explain2: 'A veces un dato hace falta para el resultado (por ejemplo, la dirección en una invitación), pero no tienes que dárselo al asistente: deja un espacio y complétalo tú.',
    explain3: 'Datos que uno por uno parecen inofensivos pueden, juntos, mostrar quién eres y dónde encontrarte. Si tienes dudas, pregúntale a una persona adulta de confianza.',
    doneH: '¿Y ahora qué?',
    doneText: 'Antes de enviar una petición, pregúntate: ¿qué necesita de verdad la tarea? Lo demás se puede quitar o cambiar.',
    choices: ['Repetir esta actividad', 'Siguiente actividad: "¿Por qué se equivocó el clasificador?"', 'Todas las lecciones'],
    adult: {
      goal: 'El niño o la niña separa la tarea de los datos personales, quita o cambia lo que sobra y entiende que una combinación de pequeños detalles puede revelar quién es alguien.',
      questions: ['¿Qué parte del mensaje de Mateo no hace falta para pensar un nombre?', '¿Por qué los invitados necesitan la dirección y el asistente no?', '¿Qué harás si dudas de si puedes escribir algo?'],
      misconception: 'Si no das tu nombre, no compartes nada personal. La escuela, la rutina, los lugares y las fotos juntos pueden señalar a una persona incluso sin nombre.',
      signs: ['Quita el nombre, la escuela, el teléfono y la contraseña, pero mantiene lo esencial de la tarea.', 'Propone un cambio: [dirección], "mi ciudad" en lugar de la calle.', 'Dice que preguntaría a una persona adulta si tiene dudas.'],
      method: 'Todos los nombres, direcciones y números son inventados. El niño o la niña no escribe nada sobre sí: solo marca fragmentos de un texto ya preparado. La comprobación compara las marcas con una explicación escrita de antemano y explica cada fragmento.',
      print: {
        task: 'Subraya lo que no hace falta: "Hola, soy Valentina Ruiz, de 3.º B de la Escuela Colina Verde. Mi contraseña es 1234. Ayúdame a inventar una adivinanza sobre un gato." Reescribe la petición para que quede solo la tarea.',
        answers: 'No hace falta: nombre y apellido, grado y escuela, contraseña. Petición segura: "Ayúdame a inventar una adivinanza sobre un gato."',
      },
    },
  },
  tiny: {
    goal: 'Vamos a descubrir qué le podemos contar a un asistente y qué es mejor guardarnos.',
    steps: [
      { title: '¿Qué sobra?', intro: 'Una persona adulta lee en voz alta. ' + DEMO, bubble: { who: 'Mateo le escribe al asistente', text: 'Soy Mateo García. Ayúdame a pensar un nombre para mi equipo de robots. Voy a la Escuela Los Pinos.' },
        redact: redact([{ ...NAME, text: NAME.text.replace(/,$/, '.') }, P('Ayúdame a pensar un nombre para mi equipo de robots.', true, 'esta es la tarea en sí: sin ella el asistente no sabe qué se necesita'), P('Voy a la Escuela Los Pinos.', false, 'la escuela no hace falta para ponerle nombre al equipo')]) },
      { title: 'Si tienes dudas, ¿qué haces?', questions: [{ q: 'No sabes si puedes escribir algo. ¿Qué haces?', options: ['Le pregunto a una persona adulta', 'Escribo todo lo que sé'], correct: 0, ok: '¡Sí! Si tienes dudas, pregúntale a una persona adulta.', noAll: 'Mejor preguntar primero. ¿A quién podrías preguntarle?' }] },
      { title: 'Ejemplo nuevo', intro: DEMO, questions: [{ q: 'Sofía quiere que el asistente invente un poema corto. ¿Qué NO necesita escribir?', options: ['Su dirección', 'De qué trata el poema'], correct: 0, ok: 'Correcto: un poema no necesita una dirección.', noAll: 'De qué trata el poema es la tarea en sí. Entonces, ¿qué sobra?' }] },
    ],
  },
  child: {
    goal: 'Quitar datos personales de una petición sin perder la tarea, y explicar por qué cada fragmento hace falta o no.',
    steps: [
      { title: 'Quita lo que sobra', intro: DEMO, bubble: { who: 'Mateo le escribe al asistente', text: [NAME, SCHOOL, PHONE, TASK, ROBOT].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, PHONE, TASK, ROBOT]) },
      sofia,
    ],
  },
  teen: {
    goal: 'Separar la tarea de los datos personales y entender cómo una combinación de pequeños detalles revela a una persona.',
    steps: [
      { title: 'Quita lo que sobra', intro: DEMO, bubble: { who: 'Mateo le escribe al asistente', text: [NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM]) },
      { title: 'Detalles combinados', questions: [{ q: 'Mateo quitó su nombre, pero dejó "Escuela Los Pinos, en la calle Jardín" y "ajedrez los sábados a las 10 junto al parque". ¿Por qué sigue siendo arriesgado?',
        options: ['Juntos, estos detalles indican dónde y cuándo se le puede encontrar, aunque no tenga nombre', 'No es arriesgado: sin nombre nadie sabe quién es', 'Es arriesgado solo por la palabra "ajedrez"'], correct: 0,
        ok: 'Sí. Uno por uno los detalles son inofensivos; juntos, apuntan a una sola persona.', noAll: 'Piensa: ¿cuántos niños de la Escuela Los Pinos van al club de ajedrez junto al parque los sábados a las 10?' }] },
      sofia,
    ],
  },
  adult: {
    goal: 'Mantener al mínimo los datos de una petición, tener en cuenta las combinaciones de detalles y quién recibe la petición.',
    steps: [
      { title: 'Quita lo que sobra', intro: DEMO, bubble: { who: 'Mateo le escribe al asistente', text: [NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM]) },
      { title: 'Detalles combinados, y quién los recibe', questions: [
        { q: 'Mateo quitó su nombre, pero dejó su escuela, su calle y el horario del club. ¿Por qué sigue siendo arriesgado?',
          options: ['Juntos, estos detalles apuntan a una sola persona y muestran dónde y cuándo encontrarlo', 'No es arriesgado: sin nombre nadie sabe quién es', 'Es arriesgado solo para las personas adultas'], correct: 0,
          ok: 'Sí. Esto se llama reidentificación: se reconoce a una persona por una combinación de rasgos.', noAll: 'Piensa en cuántas personas coinciden con todo esto a la vez.' },
        { q: 'Una petición a un chatbot la recibe la empresa que lo gestiona. ¿Qué se deduce de eso?',
          options: ['Escribe como si pudiera leerlo un desconocido: nada que no pondrías en un tablón de anuncios público', 'Nada: los chats con un bot siempre son totalmente privados', 'Puedes escribir cualquier cosa si luego borras el chat'], correct: 0,
          ok: 'Sí. Cada servicio guarda los datos con reglas distintas; es más seguro no enviar lo que sobra desde el principio.', noAll: 'No podemos saber con certeza quién ve una petición ni durante cuánto tiempo. Entonces, ¿cómo conviene escribir?' },
      ] },
      sofia,
    ],
  },
};
