// Lesson B, English: "Check a confident answer". Made-up workshop, made-up
// assistant; every fact the child needs is on the page. Not reviewed by a
// native-speaking editor or a teacher.

const WHO = 'Assistant (teaching example)';
const SCHEDULE = {
  title: '"Cogwheel" workshop timetable (the original document)',
  rows: [['Who for', 'children aged 7–12'], ['Robots', 'Monday, 3:00 pm'], ['Drawing', 'Wednesday, 4:30 pm'], ['Cardboard models', 'Saturday, 11:00 am'], ['Length', 'every session lasts 1 hour']],
};
const SCHEDULE2 = {
  title: '"Cogwheel" workshop notice (the original document)',
  rows: [['Workshop tour', 'Saturday, 12:00 noon'], ['Sign up', 'at the front desk, ground floor']],
  note: 'The notice says nothing about the price of the tour.',
};
const ANSWER = 'The Cogwheel workshop is for children. The robots club meets on Wednesday at 4:30 pm. Every session lasts one hour.';
const SENTENCES = ['The workshop is for children.', 'The robots club meets on Wednesday at 4:30 pm.', 'Every session lasts one hour.'];

const findStep = () => ({
  title: 'Find the doubtful statement',
  intro: 'You asked the assistant when the robots club meets. It answered very confidently. Compare its answer with the timetable.',
  doc: SCHEDULE,
  bubble: { who: WHO, text: ANSWER },
  questions: [
    { q: 'Which statement of the assistant does not match the timetable?', options: SENTENCES, correct: 1,
      ok: 'Yes. On Wednesday at 4:30 pm it is drawing; robots are on Monday at 3:00 pm. The assistant mixed up the rows.',
      noAll: 'This statement matches the timetable. Find the row about robots and compare.' },
  ],
});

const fixStep = {
  title: 'Fix the answer and give your reason',
  doc: SCHEDULE,
  questions: [
    { q: 'What is right?', options: ['The robots club is on Monday at 3:00 pm.', 'The robots club is on Wednesday at 4:30 pm.', 'The robots club is on Saturday at 11:00 am.'], correct: 0,
      ok: 'Right: that is what the timetable says.', noAll: 'Look at the "Robots" row of the timetable.' },
    { q: 'Why are you sure about your fix?', options: ['It is written in the original document — the workshop timetable', 'The assistant answered very confidently', 'It sounds more correct'], correct: 0,
      ok: 'Yes. The reason is the document the question is about. A confident tone proves nothing.',
      noAll: 'A confident tone and "sounds right" are not evidence. What can you rely on?' },
  ],
};

const unknownStep = {
  title: 'New example — solve it yourself',
  intro: 'You asked again: how much does the tour cost?',
  doc: SCHEDULE2,
  bubble: { who: WHO, text: 'The workshop tour on Saturday at 12:00 noon costs 5 dollars.' },
  questions: [
    { q: 'Is it true that the tour costs 5 dollars?', options: ['Yes, true', 'No, false', 'Cannot be decided yet'], correct: 2,
      ok: 'Right. The notice gives the time of the tour but no price. The assistant could only have guessed "5 dollars" — and the document cannot confirm it.',
      no: { 0: 'The document has no price — nothing confirms "5 dollars".', 1: 'You cannot say "false" either: the document has no price at all. What is missing to decide?' } },
    { q: 'How can you find out the price?', options: ['Ask at the workshop front desk, as the notice says', 'Ask the assistant again until it gives the same answer', 'Believe it, since the assistant named an exact amount'], correct: 0,
      ok: 'Yes. You need a source that is responsible for this information.',
      noAll: 'A repeated or exact answer from the assistant is still not checked. Who really knows the price?' },
  ],
};

const twoSources = {
  title: 'Compare two sources',
  intro: 'Question: in what year did the Cogwheel workshop open? The assistant answered: "In 2022 — lots of websites say so." Here is what you found.',
  sources: [
    { name: 'Source A: the workshop website, "About us" page', origin: 'the workshop itself', date: 'page updated in 2026', says: '"The workshop opened in 2019"' },
    { name: 'Source B: a forum post', origin: 'a user without a name', date: 'no date given', says: '"They opened recently, in 2022 I think"' },
  ],
  questions: [
    { q: 'Which source is better for answering this question?', options: ['A: it is written by the workshop itself and has a date', 'B: it says "2022", like the assistant', 'Both equally: both give a year'], correct: 0,
      ok: 'Yes. Look at who wrote it (origin), when (date) and whether it is directly about the question.',
      noAll: 'Agreeing with the assistant and the number of similar websites do not prove anything. Who knows the opening year best?' },
  ],
};

const teenWhy = {
  q: '"Lots of websites say so" — why is that a weak reason?',
  options: ['Websites can copy the same mistake from each other', 'It is a strong reason: if many say it, it must be true', 'There are never many websites'], correct: 0,
  ok: 'Right. Ten copies of one mistake are still one mistake. What matters is where the information came from.',
  noAll: 'Think about where websites get their information and whether they can repeat each other.',
};
const adultStakes = {
  q: 'Even source A can be wrong. What do you do if an important decision depends on the year (for example, forms for a competition)?',
  options: ['Check in another independent way: for example, ask for a document or call the workshop', 'Nothing: an official website is never wrong', 'Use the year the assistant gave'], correct: 0,
  ok: 'Yes. The more important the decision, the more independent confirmation it needs.',
  noAll: 'An official source is more reliable, but not infallible. How do you confirm an important fact?',
};

export const en = {
  common: {
    title: 'Check a confident answer',
    desc: 'A teaching assistant confidently retells a timetable with a mistake. The child finds the doubtful statement, compares it with the document, fixes it and gives the reason; then a case where there is not enough information.',
    goal: 'Learn to compare a confident answer with the original document, and to say "cannot be decided yet" when the information is not there.',
    noJs: 'The activity itself needs JavaScript. Without it, the goal, the explanation and a printable task are below.',
    explain1: 'An assistant can answer confidently and still be wrong: it mixed up rows of the timetable. Checking means comparing with the source the question is about.',
    explain2: 'If the source does not have the information, the honest answer is "cannot be decided yet". An exact number in an answer does not make it checked.',
    explain3: 'A confident tone, repetition and the number of links do not prove the truth. Look at who wrote it, when, and whether it is about the question.',
    doneH: 'What next?',
    doneText: 'A confident answer is not yet a checked one. Checking relies on a source — and when the information is missing, we say so.',
    choices: ['Do this activity again', 'Next activity: "What is OK to share?"', 'All lessons'],
    adult: {
      goal: 'The child compares statements with the original source, tells "false" from "cannot be decided", and does not take confidence or the number of links as evidence.',
      questions: ['How did you notice that the assistant was wrong?', 'What is the difference between "false" and "cannot be decided yet"?', 'Who would you ask if the document has no answer?'],
      misconception: 'If an answer sounds confident and has exact numbers, it is right. Precise wording does not mean the information was checked.',
      signs: ['Points to the line of the document they rely on.', 'Says "cannot be decided yet" when information is missing, and names where to look.', 'When comparing sources, looks at origin and date, not at agreement with the answer.'],
      method: 'All the assistant’s texts were written in advance — this is not a live chat and not a request to a neural network. The workshop and its timetable are made up so that the answer can be checked right on the page.',
      print: {
        task: 'Timetable: "Robots — Mon 3:00 pm; Drawing — Wed 4:30 pm". The assistant said: "Robots are on Wednesday". 1) Find the mistake. 2) Fix it. 3) The assistant said: "A session costs 5 dollars". Can you check this with the timetable?',
        answers: '1) The day and time are mixed up. 2) Robots are on Monday at 3:00 pm. 3) No: the timetable has no price — it cannot be decided yet; ask the workshop.',
      },
    },
  },
  tiny: {
    goal: "Let's check with the timetable whether the assistant told the truth.",
    steps: [
      { title: 'Compare with the timetable', intro: 'An adult reads aloud. The assistant said: "The robots club is on Wednesday." Look at the timetable together.', doc: SCHEDULE,
        questions: [{ q: 'Are robots on Wednesday?', options: ['Yes', 'No'], correct: 1, ok: 'Right: in the timetable, robots are on Monday. The assistant made a mistake.', noAll: 'Find the "Robots" row together. What day does it say?' }] },
      { title: 'Why do you think so?', questions: [{ q: 'How do you know?', options: ['I looked at the timetable', 'The assistant sounded sure'], correct: 0, ok: 'Yes! We checked with the timetable.', noAll: 'A sure voice is not a check. Where did we look?' }] },
      { title: 'New example', intro: 'The assistant said: "The tour costs 5 dollars." The notice only gives the time.', doc: SCHEDULE2,
        questions: [{ q: 'Do we know the price?', options: ['Yes, 5 dollars', 'Not yet — we need to ask an adult or the front desk'], correct: 1, ok: 'Right: the notice has no price. When we do not know, we say so — and ask.', noAll: 'Look at the notice: is there a price?' }] },
    ],
  },
  child: {
    goal: 'Find the mistake in a confident answer, fix it with the document, and tell "false" from "cannot be decided".',
    steps: [findStep(), fixStep, unknownStep],
  },
  teen: {
    goal: 'Compare statements with the document, tell "false" from "cannot be decided", and compare sources by origin and date.',
    steps: [findStep(), fixStep, unknownStep, { ...twoSources, questions: [...twoSources.questions, teenWhy] }],
  },
  adult: {
    goal: 'Check statements against the original source, weigh origin, date and relevance, and match the amount of checking to how important the decision is.',
    steps: [findStep(), fixStep, unknownStep, { ...twoSources, questions: [...twoSources.questions, teenWhy, adultStakes] }],
  },
};
