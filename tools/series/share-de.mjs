// Lesson C, German: "Was darf ich teilen?". Every name, address and number
// below is made up for the demo (German names, a phone of zeros); the child
// never types anything about themselves. Adapted, not word for word. Not
// reviewed by a native-speaking editor or a teacher.

const DEMO = 'Das ist eine ausgedachte Figur mit ausgedachten Angaben — nur für die Übung.';
const P = (text, needed, why) => ({ text, needed, why });

const TASK = P('Hilf mir, einen Namen für unser Robotik-Team zu finden.', true, 'das ist die Aufgabe selbst — ohne sie weiß der Assistent nicht, was gebraucht wird');
const ROBOT = P('Wir bauen einen Roboter, der Müll sortiert.', true, 'hilft, einen passenden Namen zu finden, und verrät nichts darüber, wer du bist');
const NAME = P('Ich bin Jonas Becker,', false, 'Vor- und Nachname braucht man nicht, um ein Team zu benennen');
const SCHOOL = P('gehe in die Lindenpark-Grundschule in der Gartenstraße,', false, 'Schule und Straße zeigen, wo man dich findet, und sind für die Aufgabe nicht nötig');
const PHONE = P('meine Handynummer ist 0000 0000000,', false, 'eine Telefonnummer braucht man nie, um sich einen Namen auszudenken');
const CLUB = P('jeden Samstag um 10 Uhr gehe ich in den Schachclub am Park,', false, 'dein Wochenplan und der Ort zeigen, wo und wann man dich antreffen kann');
const TEAM = P('Wir sind zu viert im Team.', true, 'die Zahl der Mitglieder verrät nichts und kann beim Namen helfen');

const redact = (pieces, extra = {}) => ({
  q: 'Tippe auf die Stücke, die weg oder ersetzt werden sollen. Die Aufgabe muss klar bleiben.',
  checkBtn: 'Prüfen',
  pieces,
  ok: 'Geschafft: Die Aufgabe ist noch da, das Überflüssige ist weg. So erklärt sich, warum jedes Stück nötig ist oder nicht:',
  no: 'Noch nicht ganz. Sieh dir die Erklärung an: Es ist noch etwas Überflüssiges da, oder etwas Nötiges wurde entfernt.',
  ...extra,
});

const emma = {
  title: 'Neues Beispiel — löse es selbst',
  intro: 'Eine andere Anfrage. ' + DEMO + ' Tipp: Die Gäste brauchen die Adresse, der Assistent nicht — im Text kann man sie durch [Adresse] ersetzen und später selbst eintragen.',
  bubble: { who: 'Emma schreibt dem Assistenten', text: 'Ich heiße Emma Schulz. Hilf mir, eine Einladung zu meinem Geburtstag zu schreiben, am Samstag um 15 Uhr. Adresse: Waldweg 7, Wohnung 12. Und sag mir, ob mein Spiel-Passwort sicher ist: miezekatze123?' },
  redact: redact([
    P('Ich heiße Emma Schulz.', false, 'sie kann die Einladung selbst unterschreiben; der Assistent braucht ihren Nachnamen nicht'),
    P('Hilf mir, eine Einladung zu meinem Geburtstag zu schreiben,', true, 'das ist die Aufgabe selbst — ohne sie weiß der Assistent nicht, was er schreiben soll'),
    P('am Samstag um 15 Uhr.', true, 'die Uhrzeit braucht die Einladung, und für sich allein zeigt sie nicht, wer sie ist'),
    P('Adresse: Waldweg 7, Wohnung 12.', false, 'durch [Adresse] ersetzen und im fertigen Text selbst eintragen'),
    P('Mein Spiel-Passwort: miezekatze123', false, 'ein Passwort gibt man niemandem, auch nicht „zum Prüfen“; man kann fragen, was ein sicheres Passwort ausmacht'),
  ], { result: 'Hilf mir, eine Einladung zu meinem Geburtstag zu schreiben, am Samstag um 15 Uhr, Ort: [Adresse]. Und was macht ein Passwort sicher?', resultH: 'Sichere Anfrage:' }),
};

export const de = {
  common: {
    title: 'Was darf ich teilen?',
    desc: 'Eine ausgedachte Figur bittet einen Assistenten um Hilfe und erzählt zu viel über sich. Das Kind entfernt oder ersetzt persönliche Angaben, ohne die Aufgabe zu verlieren, und sieht, warum jedes Stück nötig ist oder nicht.',
    goal: 'Lernen, in einer Anfrage nur zu lassen, was die Aufgabe braucht, und keine persönlichen Angaben zu teilen.',
    noJs: 'Die Übung selbst braucht JavaScript. Ohne JavaScript finden Sie unten das Ziel, die Erklärung und eine Aufgabe zum Ausdrucken.',
    explain1: 'Für die meisten Aufgaben braucht ein Assistent weder deinen Namen noch deine Adresse, Schule, Telefonnummer oder dein Passwort. Die Aufgabe lässt sich auch ohne sie beschreiben.',
    explain2: 'Manchmal braucht das Ergebnis eine Angabe (zum Beispiel die Adresse auf einer Einladung), aber du musst sie dem Assistenten nicht geben: Lass eine Lücke und trag sie selbst ein.',
    explain3: 'Angaben, die einzeln harmlos wirken, können zusammen zeigen, wer du bist und wo man dich findet. Wenn du unsicher bist, frag eine erwachsene Person, der du vertraust.',
    doneH: 'Wie geht es weiter?',
    doneText: 'Bevor du eine Anfrage abschickst, frag dich: Was davon braucht die Aufgabe wirklich? Alles andere kann weg oder ersetzt werden.',
    choices: ['Diese Übung noch einmal machen', 'Nächste Übung: „Warum hat sich der Sortierer geirrt?“', 'Alle Lektionen'],
    adult: {
      goal: 'Das Kind trennt die Aufgabe von persönlichen Angaben, entfernt oder ersetzt Überflüssiges und versteht, dass eine Kombination kleiner Details verraten kann, wer jemand ist.',
      questions: ['Was in Jonas’ Nachricht braucht man nicht, um einen Namen zu finden?', 'Warum brauchen die Gäste die Adresse, der Assistent aber nicht?', 'Was machst du, wenn du nicht sicher bist, ob du etwas schreiben darfst?'],
      misconception: 'Wer seinen Namen nicht nennt, teilt nichts Persönliches. Schule, Wochenplan, Orte und Fotos zusammen können auch ohne Namen auf eine Person zeigen.',
      signs: ['Entfernt Namen, Schule, Telefonnummer und Passwort, behält aber den Kern der Aufgabe.', 'Schlägt einen Ersatz vor: [Adresse], „meine Stadt“ statt der Straße.', 'Sagt, im Zweifel eine erwachsene Person zu fragen.'],
      method: 'Alle Namen, Adressen und Nummern sind ausgedacht. Das Kind tippt nichts über sich selbst ein: Es markiert nur Stücke eines fertigen Textes. Die Prüfung vergleicht die Markierungen mit einer vorab geschriebenen Auflösung und erklärt jedes Stück.',
      print: {
        task: 'Unterstreiche, was nicht nötig ist: „Hallo, ich bin Lina Hoffmann aus der 3b der Grundschule am Hang. Mein Passwort ist 1234. Hilf mir, ein Rätsel über eine Katze zu erfinden.“ Schreib die Anfrage so um, dass nur die Aufgabe übrig bleibt.',
        answers: 'Nicht nötig: Vor- und Nachname, Klasse und Schule, Passwort. Sichere Anfrage: „Hilf mir, ein Rätsel über eine Katze zu erfinden.“',
      },
    },
  },
  tiny: {
    goal: 'Wir finden heraus, was wir einem Assistenten erzählen können und was wir besser für uns behalten.',
    steps: [
      { title: 'Was ist überflüssig?', intro: 'Eine erwachsene Person liest vor. ' + DEMO, bubble: { who: 'Jonas schreibt dem Assistenten', text: 'Ich bin Jonas Becker. Hilf mir, einen Namen für mein Roboter-Team zu finden. Ich gehe in die Lindenpark-Grundschule.' },
        redact: redact([NAME, P('Hilf mir, einen Namen für mein Roboter-Team zu finden.', true, 'das ist die Aufgabe selbst — ohne sie weiß der Assistent nicht, was gebraucht wird'), P('Ich gehe in die Lindenpark-Grundschule.', false, 'die Schule braucht man nicht, um das Team zu benennen')]) },
      { title: 'Unsicher — was tust du?', questions: [{ q: 'Du bist nicht sicher, ob du etwas schreiben darfst. Was tust du?', options: ['Ich frage einen Erwachsenen', 'Ich schreibe alles, was ich weiß'], correct: 0, ok: 'Ja! Im Zweifel frag einen Erwachsenen.', noAll: 'Besser erst fragen. Wen könntest du fragen?' }] },
      { title: 'Neues Beispiel', intro: DEMO, questions: [{ q: 'Emma möchte, dass der Assistent ein kleines Gedicht schreibt. Was muss sie NICHT schreiben?', options: ['Ihre Adresse', 'Worum es im Gedicht geht'], correct: 0, ok: 'Richtig: Für ein Gedicht braucht man keine Adresse.', noAll: 'Worum es im Gedicht geht, ist die Aufgabe selbst. Was ist dann überflüssig?' }] },
    ],
  },
  child: {
    goal: 'Persönliche Angaben aus einer Anfrage entfernen, ohne die Aufgabe zu verlieren, und erklären, warum jedes Stück nötig ist oder nicht.',
    steps: [
      { title: 'Entferne das Überflüssige', intro: DEMO, bubble: { who: 'Jonas schreibt dem Assistenten', text: [NAME, SCHOOL, PHONE, TASK, ROBOT].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, PHONE, TASK, ROBOT]) },
      emma,
    ],
  },
  teen: {
    goal: 'Die Aufgabe von persönlichen Angaben trennen und verstehen, wie eine Kombination kleiner Details eine Person verrät.',
    steps: [
      { title: 'Entferne das Überflüssige', intro: DEMO, bubble: { who: 'Jonas schreibt dem Assistenten', text: [NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM]) },
      { title: 'Details zusammen', questions: [{ q: 'Jonas hat seinen Namen entfernt, aber „Lindenpark-Grundschule in der Gartenstraße“ und „Schach samstags um 10 Uhr am Park“ stehen lassen. Warum ist das immer noch riskant?',
        options: ['Zusammen verraten diese Details, wo und wann man ihn antreffen kann — auch ohne Namen', 'Es ist nicht riskant: Ohne Namen weiß niemand, wer er ist', 'Riskant ist nur das Wort „Schach“'], correct: 0,
        ok: 'Ja. Einzeln sind die Details harmlos; zusammen führen sie zu genau einer Person.', noAll: 'Überleg: Wie viele Jungen aus der Lindenpark-Grundschule gehen samstags um 10 Uhr in den Schachclub am Park?' }] },
      emma,
    ],
  },
  adult: {
    goal: 'Die Angaben in einer Anfrage auf das Nötigste beschränken, Kombinationen von Details bedenken und wer die Anfrage erhält.',
    steps: [
      { title: 'Entferne das Überflüssige', intro: DEMO, bubble: { who: 'Jonas schreibt dem Assistenten', text: [NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM]) },
      { title: 'Details zusammen — und wer sie bekommt', questions: [
        { q: 'Jonas hat seinen Namen entfernt, aber Schule, Straße und die Zeiten seines Clubs stehen lassen. Warum ist das immer noch riskant?',
          options: ['Zusammen führen diese Details zu genau einer Person und zeigen, wo und wann man ihn findet', 'Es ist nicht riskant: Ohne Namen weiß niemand, wer er ist', 'Riskant ist das nur für Erwachsene'], correct: 0,
          ok: 'Ja. Das nennt man Re-Identifizierung: Eine Person wird an einer Kombination von Merkmalen erkannt.', noAll: 'Überleg, wie viele Menschen auf all das gleichzeitig passen.' },
        { q: 'Eine Anfrage an einen Chatbot erhält das Unternehmen, das ihn betreibt. Was folgt daraus?',
          options: ['So schreiben, als könnte ein Fremder mitlesen: nichts, was du nicht an ein öffentliches Schwarzes Brett hängen würdest', 'Nichts: Chats mit einem Bot sind immer völlig privat', 'Man kann alles schreiben, wenn man den Chat später löscht'], correct: 0,
          ok: 'Ja. Dienste speichern Daten nach unterschiedlichen Regeln; sicherer ist es, Überflüssiges gar nicht erst zu schicken.', noAll: 'Wir können nicht sicher wissen, wer eine Anfrage sieht und wie lange. Wie schreibt man also vernünftigerweise?' },
      ] },
      emma,
    ],
  },
};
