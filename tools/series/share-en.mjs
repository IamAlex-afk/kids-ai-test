// Lesson C, English: "What is OK to share?". Every name, address and number
// below is made up for the demo; the child never types anything about
// themselves. Not reviewed by a native-speaking editor or a teacher.

const DEMO = 'This is a made-up character with made-up details — just for the activity.';
const P = (text, needed, why) => ({ text, needed, why });

const TASK = P('Help me think of a name for our robotics team.', true, 'this is the task itself — without it the assistant will not know what is needed');
const ROBOT = P('We are building a robot that sorts rubbish.', true, 'helps to find a fitting name and says nothing about who you are');
const NAME = P("I'm Tim Baker,", false, 'your first and last name are not needed to name a team');
const SCHOOL = P('I go to Park Lane Primary on Garden Street,', false, 'your school and street show where to find you and are not needed for the task');
const PHONE = P('my phone is 000-000-0000,', false, 'a phone number is never needed to think of a name');
const CLUB = P('every Saturday at 10 I go to the chess club by the park,', false, 'your timetable and place show where and when you can be found');
const TEAM = P('There are four of us in the team.', true, 'the number of members reveals nothing and may help with the name');

const redact = (pieces, extra = {}) => ({
  q: 'Tap the pieces that should be removed or replaced. The task must stay clear.',
  checkBtn: 'Check',
  pieces,
  ok: 'Done: the task is still there and the extra details are gone. Here is why each piece is needed or not:',
  no: 'Not quite yet. Look at the breakdown: something extra is still there, or something needed was removed.',
  ...extra,
});

const ella = {
  title: 'New example — solve it yourself',
  intro: 'A different request. ' + DEMO + ' Hint: the guests need the address, the assistant does not — in the text it can be replaced with [address] and filled in later.',
  bubble: { who: 'Ella writes to the assistant', text: "My name is Ella Smith. Help me write an invitation to my birthday party, on Saturday at 3 pm. Address: 7 Forest Road, flat 12. And tell me if my game password is strong: kitty123?" },
  redact: redact([
    P('My name is Ella Smith.', false, 'she can sign the invitation herself; the assistant does not need her surname'),
    P('Help me write an invitation to my birthday party,', true, 'this is the task'),
    P('on Saturday at 3 pm.', true, 'the time is needed for the invitation and does not, on its own, show who she is'),
    P('Address: 7 Forest Road, flat 12.', false, 'replace it with [address] and fill it in yourself in the finished text'),
    P('My game password: kitty123', false, 'a password is never shared with anyone, not even "to check it"; you can ask what makes a password strong'),
  ], { result: 'Help me write an invitation to my birthday party, on Saturday at 3 pm, at [address]. And what makes a password strong?', resultH: 'Safe request:' }),
};

export const en = {
  common: {
    title: 'What is OK to share?',
    desc: 'A made-up character asks an assistant for help and shares too much about themselves. The child removes or replaces personal details while keeping the task, and looks at why each piece is needed or not.',
    goal: 'Learn to keep only what the task needs in a request, and not to share personal details.',
    noJs: 'The activity itself needs JavaScript. Without it, the goal, the explanation and a printable task are below.',
    explain1: 'For most tasks an assistant does not need your name, address, school, phone number or password. The task can be described without them.',
    explain2: 'Sometimes details are needed for the result (for example, the address on an invitation), but you do not have to give them to the assistant: leave a gap and fill it in yourself.',
    explain3: 'Details that look harmless one by one can, together, show who you are and where to find you. If you are not sure, ask a trusted adult.',
    doneH: 'What next?',
    doneText: 'Before you send a request, ask yourself: what here does the task really need? Everything else can be removed or replaced.',
    choices: ['Do this activity again', 'Next activity: "Why did the sorter get it wrong?"', 'All lessons'],
    adult: {
      goal: 'The child separates the task from personal details, removes or replaces the extras, and understands that a combination of small details can reveal who someone is.',
      questions: ['What in Tim’s message is not needed to think of a name?', 'Why do the guests need the address but the assistant does not?', 'What will you do if you are not sure whether you can write something?'],
      misconception: 'If you do not give your name, you share nothing personal. School, timetable, places and photos together can point to a person even without a name.',
      signs: ['Removes the name, school, phone number and password, but keeps the point of the task.', 'Suggests a replacement: [address], "my town" instead of the street.', 'Says they would ask an adult when unsure.'],
      method: 'All names, addresses and numbers are made up. The child types nothing about themselves: they only mark pieces of a ready-made text. The check compares the marks with a breakdown written in advance and explains every piece.',
      print: {
        task: 'Underline what is not needed: "Hi, I\'m Lucy Hart from class 3B at Hill School. My password is 1234. Help me make up a riddle about a cat." Rewrite the request so that only the task is left.',
        answers: 'Not needed: first and last name, class and school, password. Safe request: "Help me make up a riddle about a cat."',
      },
    },
  },
  tiny: {
    goal: "Let's find out what we can tell an assistant and what is better to keep to ourselves.",
    steps: [
      { title: 'What is not needed?', intro: 'An adult reads aloud. ' + DEMO, bubble: { who: 'Tim writes to the assistant', text: "I'm Tim Baker. Help me think of a name for my robot team. I go to Park Lane Primary." },
        redact: redact([NAME, P('Help me think of a name for my robot team.', true, 'this is the task'), P('I go to Park Lane Primary.', false, 'the school is not needed for a name')]) },
      { title: 'Not sure — what do you do?', questions: [{ q: 'You are not sure whether you can write something. What do you do?', options: ['Ask an adult', 'Write everything I know'], correct: 0, ok: 'Yes! When in doubt, ask an adult.', noAll: 'Better to ask first. Who could you ask?' }] },
      { title: 'New example', intro: DEMO, questions: [{ q: 'Ella wants the assistant to make up a little poem. What does she NOT need to write?', options: ['Her address', 'What the poem is about'], correct: 0, ok: 'Right: a poem does not need an address.', noAll: 'What the poem is about is the task itself. So what is not needed?' }] },
    ],
  },
  child: {
    goal: 'Remove personal details from a request while keeping the task, and explain why each piece is needed or not.',
    steps: [
      { title: 'Remove what is not needed', intro: DEMO, bubble: { who: 'Tim writes to the assistant', text: [NAME, SCHOOL, PHONE, TASK, ROBOT].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, PHONE, TASK, ROBOT]) },
      ella,
    ],
  },
  teen: {
    goal: 'Separate the task from personal details and understand how a combination of small details reveals a person.',
    steps: [
      { title: 'Remove what is not needed', intro: DEMO, bubble: { who: 'Tim writes to the assistant', text: [NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM]) },
      { title: 'Details combined', questions: [{ q: 'Tim removed his name but kept "Park Lane Primary on Garden Street" and "chess on Saturdays at 10 by the park". Why is that still risky?',
        options: ['Together these details hint where and when he can be found, even without a name', 'It is not risky: without a name nobody can tell who he is', 'It is risky only because of the word "chess"'], correct: 0,
        ok: 'Yes. One by one the details are harmless; together they narrow it down to one person.', noAll: 'Think: how many boys from Park Lane Primary go to the chess club by the park on Saturdays at 10?' }] },
      ella,
    ],
  },
  adult: {
    goal: 'Keep the data in a request to a minimum, consider combinations of details and who receives the request.',
    steps: [
      { title: 'Remove what is not needed', intro: DEMO, bubble: { who: 'Tim writes to the assistant', text: [NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM]) },
      { title: 'Details combined, and who receives them', questions: [
        { q: 'Tim removed his name but kept his school, street and club timetable. Why is that still risky?',
          options: ['Together these details narrow it down to one person and show where and when to find him', 'It is not risky: without a name nobody can tell who he is', 'It is risky only for adults'], correct: 0,
          ok: 'Yes. This is called re-identification: a person is recognised from a combination of traits.', noAll: 'Think about how many people match all of this at once.' },
        { q: 'A request to a chatbot is received by the company that runs it. What follows from that?',
          options: ['Write as if a stranger could read it: nothing you would not pin on a public noticeboard', 'Nothing: chats with a bot are always fully private', 'You can write anything if you delete the chat later'], correct: 0,
          ok: 'Yes. Services keep data under different rules; it is safer not to send extras in the first place.', noAll: 'We cannot know for sure who sees a request and for how long. So how is it sensible to write?' },
      ] },
      ella,
    ],
  },
};
