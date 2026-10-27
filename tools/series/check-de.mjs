// Lesson B, German: "Prüfe eine selbstsichere Antwort". Made-up workshop,
// made-up assistant; every fact the child needs is on the page. Adapted, not
// word for word (prices in euros, "15:00 Uhr", „…“ quotes). Not reviewed by a
// native-speaking editor or a teacher.

const WHO = 'Assistent (Übungsbeispiel)';
const SCHEDULE = {
  title: 'Stundenplan der Werkstatt „Zahnrad“ (das Originaldokument)',
  rows: [['Für wen', 'Kinder von 7 bis 12 Jahren'], ['Roboter', 'Montag, 15:00 Uhr'], ['Zeichnen', 'Mittwoch, 16:30 Uhr'], ['Modelle aus Pappe', 'Samstag, 11:00 Uhr'], ['Dauer', 'jede Stunde dauert 60 Minuten']],
};
const SCHEDULE2 = {
  title: 'Aushang der Werkstatt „Zahnrad“ (das Originaldokument)',
  rows: [['Werkstattführung', 'Samstag, 12:00 Uhr'], ['Anmeldung', 'am Empfang, Erdgeschoss']],
  note: 'Über den Preis der Führung steht im Aushang nichts.',
};
const ANSWER = 'Die Werkstatt Zahnrad ist für Kinder. Die Roboter-Gruppe trifft sich am Mittwoch um 16:30 Uhr. Jede Stunde dauert 60 Minuten.';
const SENTENCES = ['Die Werkstatt ist für Kinder.', 'Die Roboter-Gruppe trifft sich am Mittwoch um 16:30 Uhr.', 'Jede Stunde dauert 60 Minuten.'];

const findStep = () => ({
  title: 'Finde die zweifelhafte Aussage',
  intro: 'Du hast den Assistenten gefragt, wann die Roboter-Gruppe ist. Er hat sehr selbstsicher geantwortet. Vergleiche seine Antwort mit dem Stundenplan.',
  doc: SCHEDULE,
  bubble: { who: WHO, text: ANSWER },
  questions: [
    { q: 'Welche Aussage des Assistenten passt nicht zum Stundenplan?', options: SENTENCES, correct: 1,
      ok: 'Ja. Am Mittwoch um 16:30 Uhr ist Zeichnen; Roboter ist am Montag um 15:00 Uhr. Der Assistent hat die Zeilen verwechselt.',
      noAll: 'Diese Aussage passt zum Stundenplan. Such die Zeile mit den Robotern und vergleiche.' },
  ],
});

const fixStep = {
  title: 'Verbessere die Antwort und begründe',
  doc: SCHEDULE,
  questions: [
    { q: 'Was stimmt?', options: ['Die Roboter-Gruppe ist am Montag um 15:00 Uhr.', 'Die Roboter-Gruppe ist am Mittwoch um 16:30 Uhr.', 'Die Roboter-Gruppe ist am Samstag um 11:00 Uhr.'], correct: 0,
      ok: 'Richtig: So steht es im Stundenplan.', noAll: 'Schau dir die Zeile „Roboter“ im Stundenplan an.' },
    { q: 'Warum bist du dir bei deiner Verbesserung sicher?', options: ['Es steht im Originaldokument — im Stundenplan der Werkstatt', 'Der Assistent hat sehr selbstsicher geantwortet', 'Es klingt richtiger'], correct: 0,
      ok: 'Ja. Der Grund ist das Dokument, um das es in der Frage geht. Ein selbstsicherer Ton beweist nichts.',
      noAll: 'Ein selbstsicherer Ton und „klingt richtig“ sind keine Belege. Worauf kannst du dich stützen?' },
  ],
};

const unknownStep = {
  title: 'Neues Beispiel — löse es selbst',
  intro: 'Du hast noch einmal gefragt: Was kostet die Führung?',
  doc: SCHEDULE2,
  bubble: { who: WHO, text: 'Die Werkstattführung am Samstag um 12:00 Uhr kostet 5 Euro.' },
  questions: [
    { q: 'Stimmt es, dass die Führung 5 Euro kostet?', options: ['Ja, stimmt', 'Nein, falsch', 'Lässt sich noch nicht sagen'], correct: 2,
      ok: 'Richtig. Der Aushang nennt die Uhrzeit der Führung, aber keinen Preis. Der Assistent konnte „5 Euro“ nur raten — und das Dokument kann es nicht bestätigen.',
      no: { 0: 'Im Dokument steht kein Preis — nichts bestätigt „5 Euro“.', 1: 'Auch „falsch“ kannst du nicht sagen: Im Dokument steht überhaupt kein Preis. Was fehlt, um zu entscheiden?' } },
    { q: 'Wie findest du den Preis heraus?', options: ['Am Empfang der Werkstatt fragen, wie es im Aushang steht', 'Den Assistenten so lange fragen, bis er dieselbe Antwort gibt', 'Es glauben, weil der Assistent einen genauen Betrag genannt hat'], correct: 0,
      ok: 'Ja. Du brauchst eine Quelle, die für diese Information zuständig ist.',
      noAll: 'Auch eine wiederholte oder genaue Antwort des Assistenten ist noch nicht geprüft. Wer kennt den Preis wirklich?' },
  ],
};

const twoSources = {
  title: 'Vergleiche zwei Quellen',
  intro: 'Frage: In welchem Jahr hat die Werkstatt Zahnrad eröffnet? Der Assistent antwortete: „2022 — das steht auf vielen Websites.“ Das hast du gefunden.',
  sources: [
    { name: 'Quelle A: Website der Werkstatt, Seite „Über uns“', origin: 'die Werkstatt selbst', date: 'Seite aktualisiert 2026', says: '„Die Werkstatt hat 2019 eröffnet“' },
    { name: 'Quelle B: Beitrag in einem Forum', origin: 'ein Nutzer ohne Namen', date: 'kein Datum', says: '„Die haben erst vor Kurzem aufgemacht, 2022 glaube ich“' },
  ],
  questions: [
    { q: 'Welche Quelle ist besser, um diese Frage zu beantworten?', options: ['A: Sie stammt von der Werkstatt selbst und hat ein Datum', 'B: Sie sagt „2022“, wie der Assistent', 'Beide gleich: Beide nennen ein Jahr'], correct: 0,
      ok: 'Ja. Achte darauf, wer es geschrieben hat (Herkunft), wann (Datum) und ob es direkt um die Frage geht.',
      noAll: 'Dass eine Quelle mit dem Assistenten übereinstimmt oder es viele ähnliche Websites gibt, beweist nichts. Wer kennt das Eröffnungsjahr am besten?' },
  ],
};

const teenWhy = {
  q: '„Das steht auf vielen Websites“ — warum ist das ein schwacher Grund?',
  options: ['Websites können denselben Fehler voneinander abschreiben', 'Das ist ein starker Grund: Wenn viele es sagen, stimmt es', 'Es gibt nie viele Websites'], correct: 0,
  ok: 'Richtig. Zehn Kopien eines Fehlers bleiben ein Fehler. Entscheidend ist, woher die Information stammt.',
  noAll: 'Überleg, woher Websites ihre Informationen haben und ob sie einander wiederholen können.',
};
const adultStakes = {
  q: 'Auch Quelle A kann sich irren. Was tust du, wenn eine wichtige Entscheidung vom Jahr abhängt (zum Beispiel eine Anmeldung zu einem Wettbewerb)?',
  options: ['Auf einem anderen, unabhängigen Weg prüfen: zum Beispiel nach einem Dokument fragen oder in der Werkstatt anrufen', 'Nichts: Eine offizielle Website irrt sich nie', 'Das Jahr vom Assistenten nehmen'], correct: 0,
  ok: 'Ja. Je wichtiger die Entscheidung, desto mehr unabhängige Bestätigung braucht sie.',
  noAll: 'Eine offizielle Quelle ist verlässlicher, aber nicht unfehlbar. Wie bestätigst du eine wichtige Tatsache?',
};

export const de = {
  common: {
    title: 'Prüfe eine selbstsichere Antwort',
    desc: 'Ein Übungs-Assistent gibt einen Stundenplan selbstsicher, aber mit einem Fehler wieder. Das Kind findet die zweifelhafte Aussage, vergleicht sie mit dem Dokument, verbessert sie und begründet das; danach kommt ein Fall, in dem Informationen fehlen.',
    goal: 'Lernen, eine selbstsichere Antwort mit dem Originaldokument zu vergleichen und „lässt sich noch nicht sagen“ zu sagen, wenn die Information fehlt.',
    noJs: 'Die Übung selbst braucht JavaScript. Ohne JavaScript finden Sie unten das Ziel, die Erklärung und eine Aufgabe zum Ausdrucken.',
    explain1: 'Ein Assistent kann selbstsicher antworten und sich trotzdem irren: Er hat Zeilen im Stundenplan verwechselt. Prüfen heißt: mit der Quelle vergleichen, um die es in der Frage geht.',
    explain2: 'Steht die Information nicht in der Quelle, ist die ehrliche Antwort „lässt sich noch nicht sagen“. Eine genaue Zahl in der Antwort heißt nicht, dass sie geprüft ist.',
    explain3: 'Ein selbstsicherer Ton, Wiederholung und die Zahl der Links beweisen nicht, dass etwas stimmt. Achte darauf, wer es geschrieben hat, wann und ob es um die Frage geht.',
    doneH: 'Wie geht es weiter?',
    doneText: 'Eine selbstsichere Antwort ist noch keine geprüfte. Prüfen heißt, sich auf eine Quelle zu stützen — und wenn die Information fehlt, das auch zu sagen.',
    choices: ['Diese Übung noch einmal machen', 'Nächste Übung: „Was darf ich teilen?“', 'Alle Lektionen'],
    adult: {
      goal: 'Das Kind vergleicht Aussagen mit der Originalquelle, unterscheidet „falsch“ von „lässt sich noch nicht sagen“ und hält weder Selbstsicherheit noch die Zahl der Links für einen Beweis.',
      questions: ['Woran hast du gemerkt, dass sich der Assistent geirrt hat?', 'Was ist der Unterschied zwischen „falsch“ und „lässt sich noch nicht sagen“?', 'Wen würdest du fragen, wenn das Dokument keine Antwort enthält?'],
      misconception: 'Wenn eine Antwort selbstsicher klingt und genaue Zahlen enthält, stimmt sie. Eine genaue Formulierung bedeutet nicht, dass die Information geprüft wurde.',
      signs: ['Zeigt auf die Zeile im Dokument, auf die es sich stützt.', 'Sagt „lässt sich noch nicht sagen“, wenn Informationen fehlen, und nennt, wo man nachsehen kann.', 'Achtet beim Vergleich von Quellen auf Herkunft und Datum, nicht darauf, ob sie mit der Antwort übereinstimmen.'],
      method: 'Alle Texte des Assistenten sind vorab geschrieben — das ist kein Live-Chat und keine Anfrage an ein neuronales Netz. Werkstatt und Stundenplan sind ausgedacht, damit sich die Antwort direkt auf der Seite prüfen lässt.',
      print: {
        task: 'Stundenplan: „Roboter — Mo 15:00 Uhr; Zeichnen — Mi 16:30 Uhr“. Der Assistent sagte: „Roboter ist am Mittwoch.“ 1) Finde den Fehler. 2) Verbessere ihn. 3) Der Assistent sagte: „Eine Stunde kostet 5 Euro.“ Lässt sich das mit dem Stundenplan prüfen?',
        answers: '1) Tag und Uhrzeit sind vertauscht. 2) Roboter ist am Montag um 15:00 Uhr. 3) Nein: Im Stundenplan steht kein Preis — das lässt sich noch nicht sagen; in der Werkstatt nachfragen.',
      },
    },
  },
  tiny: {
    goal: 'Wir prüfen mit dem Stundenplan, ob der Assistent die Wahrheit gesagt hat.',
    steps: [
      { title: 'Mit dem Stundenplan vergleichen', intro: 'Eine erwachsene Person liest vor. Der Assistent sagte: „Die Roboter-Gruppe ist am Mittwoch.“ Schaut euch den Stundenplan zusammen an.', doc: SCHEDULE,
        questions: [{ q: 'Ist Roboter am Mittwoch?', options: ['Ja', 'Nein'], correct: 1, ok: 'Richtig: Im Stundenplan ist Roboter am Montag. Der Assistent hat sich geirrt.', noAll: 'Sucht zusammen die Zeile „Roboter“. Welcher Tag steht da?' }] },
      { title: 'Warum denkst du das?', questions: [{ q: 'Woher weißt du das?', options: ['Ich habe im Stundenplan nachgesehen', 'Der Assistent klang ganz sicher'], correct: 0, ok: 'Ja! Wir haben im Stundenplan nachgesehen.', noAll: 'Eine sichere Stimme ist noch keine Prüfung. Wo haben wir nachgesehen?' }] },
      { title: 'Neues Beispiel', intro: 'Der Assistent sagte: „Die Führung kostet 5 Euro.“ Im Aushang steht nur die Uhrzeit.', doc: SCHEDULE2,
        questions: [{ q: 'Kennen wir den Preis?', options: ['Ja, 5 Euro', 'Noch nicht — wir müssen einen Erwachsenen oder am Empfang fragen'], correct: 1, ok: 'Richtig: Im Aushang steht kein Preis. Wenn wir etwas nicht wissen, sagen wir das — und fragen nach.', noAll: 'Schau dir den Aushang an: Steht da ein Preis?' }] },
    ],
  },
  child: {
    goal: 'Den Fehler in einer selbstsicheren Antwort finden, ihn mit dem Dokument verbessern und „falsch“ von „lässt sich noch nicht sagen“ unterscheiden.',
    steps: [findStep(), fixStep, unknownStep],
  },
  teen: {
    goal: 'Aussagen mit dem Dokument vergleichen, „falsch“ von „lässt sich noch nicht sagen“ unterscheiden und Quellen nach Herkunft und Datum vergleichen.',
    steps: [findStep(), fixStep, unknownStep, { ...twoSources, questions: [...twoSources.questions, teenWhy] }],
  },
  adult: {
    goal: 'Aussagen an der Originalquelle prüfen, Herkunft, Datum und Bezug abwägen und den Prüfaufwand der Bedeutung der Entscheidung anpassen.',
    steps: [findStep(), fixStep, unknownStep, { ...twoSources, questions: [...twoSources.questions, teenWhy, adultStakes] }],
  },
};
