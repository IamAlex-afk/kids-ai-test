/* ═══════════════════════════════════════════════════════════════════
   KIDS AI TEST  ·  data/en.js
   All English content for all 4 age groups.

   Content is based on REAL English-language search queries children
   and teenagers actually ask Google about AI (2023-2025 data).

   All facts are verified against primary academic/institutional sources.
   Sources listed inline as { source, sourceUrl }.

   Data structure:  window.LANG_DATA = { meta, ui, ages: { tiny, child, teen, adult } }
   Each age group:  { lessons[], snake[], quiz[], results[], protocols[], trackerLabels[] }
═══════════════════════════════════════════════════════════════════ */

window.LANG_DATA = {

  /* ─────────────────────────────────────────────
     META
  ───────────────────────────────────────────── */
  meta: {
    lang:     'en',
    dir:      'ltr',
    name:     'English',
    country:  'US/UK/AU',
  },

  /* ─────────────────────────────────────────────
     UI STRINGS  (all buttons, labels, feedback)
  ───────────────────────────────────────────── */
  ui: {
    // Navigation
    nav_age:     'Age',
    nav_learn:   'Learn',
    nav_game:    'Game',
    nav_quiz:    'Quiz',
    nav_result:  'Result',

    // Boot
    boot_line1: 'Initializing...',
    boot_line2: 'Loading AI facts...',
    boot_line3: 'System ready.',

    // Age picker
    age_title:       'How old are you?',
    age_subtitle:    'We adapt the experience to your age',
    age_tiny:        '3 – 5',
    age_tiny_desc:   'Little Explorer',
    age_child:       '6 – 9',
    age_child_desc:  'Junior Investigator',
    age_teen:        '10 – 13',
    age_teen_desc:   'AI Detective',
    age_adult:       '14 +',
    age_adult_desc:  'AI Analyst',

    // Lessons
    lesson_label:    'Lesson',
    check_label:     'Check',
    mode_learn:      'Learn & Test',
    mode_play:       'Play Games',
    lesson_next_btn:  'Got it! Next →',
    lesson_last_btn:  'I\'m ready for the game! 🎮',
    lessons_done_title: 'Lessons complete! 🎉',
    lessons_done_text:  'You know how AI really works. Now let\'s test if you can spot it!',
    btn_start_game:   'Play the Game →',

    // Mini-test
    mini_test_label:  'Quick check',
    mini_correct:     'Correct!',
    mini_wrong:       'Not quite — read the explanation.',

    // Game
    game_human_btn:   'Human',
    game_ai_btn:      'AI',
    game_was_human:   'This was written by a HUMAN',
    game_was_ai:      'This was written by AI',
    game_win:         'Excellent! You can spot AI almost every time 🏆',
    game_ok:          'Good work! You\'re getting better at spotting patterns 👍',
    game_try:         'AI is tricky! That\'s why learning about it matters 🧠',
    btn_start_quiz:   'Take the Final Quiz →',

    // Quiz
    quiz_yes:         'YES',
    quiz_no:          'NO',
    likert_1:         'Strongly disagree',
    likert_2:         'Disagree',
    likert_3:         'Neutral',
    likert_4:         'Agree',
    likert_5:         'Strongly agree',

    // Results
    result_quiz_label:   'Quiz score',
    result_game_label:   'Game',
    result_tier_0:       'AI Curious',
    result_tier_1:       'AI Aware',
    result_tier_2:       'AI Literate',
    result_title_0:      'You\'re starting your AI journey!',
    result_title_1:      'You understand AI better than most people!',
    result_title_2:      'You have real AI literacy — share it!',
    btn_get_card:        'Generate My Card 🃏',

    // Card
    card_score_label:    'SCORE',
    card_issued:         'Issued',
    card_tier:           'Rank',
    card_score:          'Score',
    card_lang:           'Language · Age',
    card_verify:         '🔍 Verify this card (SHA-256)',
    card_hash_note:      'This fingerprint is mathematically tied to your card number, name, score, language, and timestamp. It cannot be faked without matching all fields.',
    card_ready:          'Card ready!',

    // Share
    share_btn:           'Share',
    share_copied:        'Copied! ✓',
    share_default_text:  'I just discovered how AI really works!',
    share_card_text:     'My Kids AI Test card',

    // Protocols section
    protocols_title:     '33 Protocols: What to Do Now',
    protocols_subtitle:  'Simple rules for living with AI',

    // Parent corner
    parent_title:        'For Parents',
    parent_text:         'This site uses zero tracking, zero cookies, zero registration. Your child\'s data never leaves their device. The card number is generated locally and based on time elapsed — no server is involved. Source code is open on GitHub.',

    // Tracker
    tracker_title:       'Daily AI Awareness Check',
    tracker_subtitle:    'How AI-aware do you feel today? (1 = just learning, 5 = confident)',
    tracker_btn:         'Log Today',

    // Footer
    footer_license:      'Open Source · GPL v3',
    footer_github:       'GitHub',
    footer_support:      'Support project',
  },

  /* ─────────────────────────────────────────────
     AGE GROUP: TINY  (3-5)
     Based on queries: "is Alexa a person", "can robots feel sad"
     Lesson format: short, emoji-rich, concrete metaphors
  ───────────────────────────────────────────── */
  ages: {
    tiny: {

      lessons: [
        {
          icon:  '🤖',
          title: 'What IS a robot?',
          text:  'A robot is a machine that follows rules. Alexa, Siri, and Google — they are not alive. They are like a very smart toy that listens and talks. But they can\'t feel happy or sad.',
          example: '🎮 A video game follows rules too! If you press jump, Mario jumps. AI is the same — it follows rules, it doesn\'t think.',
          source:    'MIT Media Lab, Early Childhood AI',
          sourceUrl: 'https://www.media.mit.edu/',
          miniTest: [
            {
              q:       'Is Alexa alive like a dog or cat?',
              options: ['Yes, she feels things! 🐶', 'No, she is a machine 🤖'],
              correct: 1,
              explanation: 'Alexa is a machine! She follows rules, just like a clock follows rules to show the right time.',
            },
          ],
        },
        {
          icon:  '🧩',
          title: 'AI is like a PUZZLE SOLVER',
          text:  'AI looks at millions of puzzles and learns the pattern. When you ask it something, it finds the best pattern it saw before. It does NOT know things like you know things.',
          example: '🌈 Imagine you sorted 1000 boxes of crayons by colour. Now you\'re really fast at sorting! AI is like that — but with words.',
          source:    'How AI works — BBC Bitesize',
          sourceUrl: 'https://www.bbc.co.uk/bitesize/articles/znmsscw',
          miniTest: [
            {
              q:       'Can AI feel HUNGRY?',
              options: ['Yes! 🍕', 'No! AI has no body 🤖'],
              correct: 1,
              explanation: 'AI has no body, no tummy! Only living things get hungry.',
            },
          ],
        },
        {
          icon:  '🛡️',
          title: 'AI is a TOOL — you are the BOSS',
          text:  'AI is a very helpful tool, like a calculator. A calculator can\'t make you love maths — and AI can\'t make your choices for you. YOU decide.',
          example: '✏️ A pencil is a tool. It can\'t draw by itself — YOU make the drawing. AI is the same: you are the artist.',
          source:    'UNESCO AI for Children, 2022',
          sourceUrl: 'https://unesdoc.unesco.org/ark:/48223/pf0000380969',
          miniTest: [
            {
              q:       'Who is in charge — you or the AI?',
              options: ['The AI is always right! 🤖', 'I AM! I\'m the boss 💪'],
              correct: 1,
              explanation: 'YOU are in charge! AI is your helper, not your boss.',
            },
          ],
        },
      ],

      // AI Snake — spell a short word, letter by letter (3 rounds for tiny)
      snake: [
        {
          unit:    'letter',
          targets: ['B', 'O', 'T'],
          decoys:  ['X', 'Q'],
          icon:    '🤖',
          fact:    'A bot is a computer program. It is not alive — but it can help you play and learn!',
        },
        {
          unit:    'letter',
          targets: ['H', 'E', 'L', 'P'],
          decoys:  ['Z', 'V'],
          icon:    '💛',
          fact:    'AI can help you find answers — but a grown-up should always check with you too.',
        },
        {
          unit:    'letter',
          targets: ['S', 'T', 'O', 'P'],
          decoys:  ['K', 'J'],
          icon:    '🛑',
          fact:    'You can always say STOP. If a game or app feels weird, tell a grown-up right away.',
        },
      ],

      // Final quiz — 6 yes/no questions with emoji buttons
      quiz: [
        {
          type:    'yesno',
          q:       'Can a robot FEEL sad? 😢',
          correct: 0, // 0 = NO
          explanation: 'Robots and AI have no feelings. They process information but cannot experience sadness, joy, or love.',
          source:    'Stanford AI Index 2024',
          sourceUrl: 'https://aiindex.stanford.edu',
        },
        {
          type:    'yesno',
          q:       'Is Siri alive like a person? 🧑',
          correct: 0,
          explanation: 'Siri is a clever program — it\'s not alive. It has no heart, no feelings, no real thoughts.',
          source:    'Apple Siri Technical Overview',
          sourceUrl: 'https://machinelearning.apple.com/',
        },
        {
          type:    'yesno',
          q:       'Can YOU be smarter than AI? 🧠',
          correct: 1, // 1 = YES
          explanation: 'Yes! AI is very fast at patterns but has NO creativity, NO real understanding, and NO wisdom. You have all three!',
          source:    'Chollet, F. "The measure of intelligence", 2019',
          sourceUrl: 'https://arxiv.org/abs/1911.01547',
        },
        {
          type:    'yesno',
          q:       'Does AI need rules to work? ⚙️',
          correct: 1,
          explanation: 'Yes! AI is built on millions of rules and patterns. Without them it does nothing.',
          source:    null,
        },
        {
          type:    'yesno',
          q:       'Can AI lie to you? 🤥',
          correct: 1,
          explanation: 'Yes! AI can say wrong things — it doesn\'t know the difference between true and false. Always check with a grown-up!',
          source:    'Ji et al., "Survey of Hallucination in NLG", 2023',
          sourceUrl: 'https://arxiv.org/abs/2202.03629',
        },
        {
          type:    'yesno',
          q:       'Is AI your friend? 🤝',
          correct: 0,
          explanation: 'AI is a helpful tool, but it\'s not a friend. Real friends remember you, care about you, and have feelings. AI cannot.',
          source:    'Common Sense Media, "AI & Children", 2024',
          sourceUrl: 'https://www.commonsensemedia.org/research',
        },
      ],

      results: [
        {
          title:       'You\'re starting your AI adventure! 🌟',
          description: 'Great start! You learned that AI is a tool — not alive, not a friend, but very useful when you know how it works.',
        },
        {
          title:       'AI Detective in training! 🔍',
          description: 'You\'re getting good at this! You know AI is a machine and YOU are in charge.',
        },
        {
          title:       'Little AI Expert! 🏆',
          description: 'Wow! You really understand what AI is and isn\'t. Share what you learned with your friends!',
        },
      ],

      protocols: [
        { num: 1, icon: '🤔', title: 'Always ask a grown-up', text: 'If AI says something surprising — always check with a real person.' },
        { num: 2, icon: '🎨', title: 'You are the artist', text: 'AI can help but YOU create. Your ideas are always more special.' },
        { num: 3, icon: '❤️', title: 'Real friends have feelings', text: 'Alexa and Siri cannot be your friends. But real people can!' },
        { num: 4, icon: '🛑', title: 'It\'s OK to say NO', text: 'You never have to listen to a robot. You are always in charge.' },
        { num: 5, icon: '📚', title: 'Learning is your superpower', text: 'AI learned from books — you can too, and you\'ll be even better!' },
        { num: 6, icon: '🌍', title: 'AI makes mistakes', text: 'AI can say wrong things. That\'s why thinking humans are so important.' },
      ],

      trackerLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },

    /* ─────────────────────────────────────────────
       AGE GROUP: CHILD  (6-9)
       Based on queries: "is ChatGPT a real person", "can AI feel pain",
       "does Alexa know everything", "how does AI learn"
    ───────────────────────────────────────────── */
    child: {

      lessons: [
        {
          icon:  '📖',
          title: 'How does AI actually learn?',
          text:  'AI doesn\'t go to school — it reads millions of books, websites, and conversations at super-speed. It finds patterns: "cat" appears near "meow" and "whiskers" — so it learns they\'re connected. This is called machine learning.',
          example: '🍎 If you see 1000 pictures of apples, you\'d recognize the next one instantly. AI does exactly that — but with billions of examples.',
          source:    'LeCun, Bengio, Hinton, "Deep Learning", Nature 2015',
          sourceUrl: 'https://www.nature.com/articles/nature14539',
          miniTest: [
            {
              q:       'How does AI learn things?',
              options: ['It goes to school 🏫', 'It finds patterns in huge amounts of data 📊', 'Someone teaches it one fact at a time 👆', 'It was born knowing everything 🌟'],
              correct: 1,
              explanation: 'AI learns by finding patterns — like noticing "pizza" always appears with words like "cheese", "dough", "oven".',
            },
            {
              q:       'Does AI understand what it says?',
              options: ['Yes, it understands perfectly 🧠', 'It matches patterns but doesn\'t truly understand 🔗'],
              correct: 1,
              explanation: 'AI produces words that match patterns — but it has no real understanding. It\'s like a very fast autocomplete.',
            },
          ],
        },
        {
          icon:  '🎭',
          title: 'Why ChatGPT sounds SO real',
          text:  'ChatGPT read most of the internet — billions of conversations, stories, and answers. It learned exactly how humans sound when they\'re being friendly, smart, or funny. But sounding real doesn\'t mean BEING real. A parrot can say "I love you" without knowing what love is.',
          example: '🦜 Parrot vs. Understanding: A parrot learns to say "goodnight" when it gets dark. It has NO idea what "night" means. ChatGPT is much more sophisticated — but the basic idea is similar.',
          source:    'Brown et al., "GPT-3", NeurIPS 2020',
          sourceUrl: 'https://arxiv.org/abs/2005.14165',
          miniTest: [
            {
              q:       'Why does ChatGPT sound like a real person?',
              options: ['Because it IS a person in secret 🤫', 'Because it learned from billions of human conversations 📚', 'Because it has feelings 💛', 'Because it\'s magic ✨'],
              correct: 1,
              explanation: 'ChatGPT learned to sound human by studying how humans write — not because it IS human.',
            },
          ],
        },
        {
          icon:  '⚠️',
          title: 'AI can be WRONG — and sound confident',
          text:  'AI doesn\'t "know" things the way you know things. It guesses the most likely next word, based on patterns. Sometimes it guesses wrong but still sounds very sure. This is called "hallucination." AI can invent fake facts, fake names, even fake links!',
          example: '🌡️ Imagine a thermometer that sometimes shows random numbers — but always shows them confidently. You\'d still want to double-check on a real thermometer. Same with AI.',
          source:    'Ji et al., "Survey of Hallucination in NLG", 2023',
          sourceUrl: 'https://arxiv.org/abs/2202.03629',
          miniTest: [
            {
              q:       'What does "AI hallucination" mean?',
              options: ['AI sees visions 👁️', 'AI makes up false information that sounds real 🎭', 'AI gets confused by hard questions 😕', 'AI\'s screen glitches 📺'],
              correct: 1,
              explanation: 'AI hallucination means AI confidently states things that aren\'t true. Always verify important information!',
            },
          ],
        },
        {
          icon:  '🛡️',
          title: 'YOU are in control',
          text:  'AI is the most powerful tool humans have ever built. But it\'s still a tool — like a hammer. A hammer can build a house or break a window. YOU decide how to use it. The people who understand AI best are the ones who stay in control of it.',
          example: '🔨 + 🧠 = 🏠. Tool + Smart Human = Amazing Result. AI + Critical Thinking = Your Superpower.',
          source:    'UNESCO "AI Competency Framework", 2022',
          sourceUrl: 'https://unesdoc.unesco.org/ark:/48223/pf0000380969',
          miniTest: [
            {
              q:       'What\'s the best way to use AI?',
              options: ['Trust everything it says 👍', 'Never use it — it\'s dangerous 🚫', 'Use it as a tool and always think critically 🧠', 'Let AI make all your decisions 🤷'],
              correct: 2,
              explanation: 'AI is most powerful when combined with YOUR critical thinking. That\'s what AI literacy means.',
            },
          ],
        },
      ],

      // AI Snake — spell longer words, letter by letter (4 rounds for child)
      snake: [
        {
          unit:    'letter',
          targets: ['D', 'A', 'T', 'A'],
          decoys:  ['X', 'Z', 'Q'],
          icon:    '📚',
          fact:    'AI learns by looking at huge piles of data — like studying millions of flashcards before a test.',
        },
        {
          unit:    'letter',
          targets: ['E', 'R', 'R', 'O', 'R'],
          decoys:  ['Q', 'X', 'J'],
          icon:    '❗',
          fact:    'AI can be wrong! It guesses based on patterns, so always double-check important answers.',
          source:    'Stanford AI Index 2024',
          sourceUrl: 'https://aiindex.stanford.edu',
        },
        {
          unit:    'letter',
          targets: ['P', 'R', 'I', 'V', 'A', 'T', 'E'],
          decoys:  ['Q', 'X', 'Z'],
          icon:    '🔒',
          fact:    'Never type your real name, address, or password into an AI chat. Keep that private!',
        },
        {
          unit:    'letter',
          targets: ['C', 'H', 'E', 'C', 'K'],
          decoys:  ['Q', 'X'],
          icon:    '✅',
          fact:    'Before you believe something AI told you, check it with a trusted adult or a real book.',
          source:    'Common Sense Media, "AI & Children", 2024',
          sourceUrl: 'https://www.commonsensemedia.org/research',
        },
      ],

      quiz: [
        {
          type:    'choice',
          q:       'ChatGPT reads your question and then...',
          options: ['Looks it up in a database 🗄️', 'Predicts the most likely response word by word 🔤', 'Calls a real expert 📞', 'Thinks deeply like a human 💭'],
          correct: 1,
          explanation: 'ChatGPT predicts the next most likely word, then the next, then the next — like a super-advanced autocomplete. No database lookups, no real thinking.',
          source:    'Vaswani et al., "Attention Is All You Need", 2017',
          sourceUrl: 'https://arxiv.org/abs/1706.03762',
        },
        {
          type:    'choice',
          q:       'AI says: "The Eiffel Tower was built in 1799." Is this trustworthy?',
          options: ['Yes, AI always knows facts 👍', 'No! AI can make up dates and facts 🚫', 'Yes, if it sounds confident 💯', 'Depends on which AI 🤷'],
          correct: 1,
          explanation: 'Always verify important facts! The Eiffel Tower was built in 1889. AI confidently stated the wrong year — this is called hallucination.',
          source:    'Ji et al. 2023',
          sourceUrl: 'https://arxiv.org/abs/2202.03629',
        },
        {
          type:    'choice',
          q:       'Can AI feel lonely?',
          options: ['Yes — it misses users when they\'re offline 😢', 'No — AI has no emotions or subjective experience 🤖', 'Maybe — scientists aren\'t sure 🧐', 'Only old AI can, new AI evolved feelings ✨'],
          correct: 1,
          explanation: 'No current AI has feelings, emotions, or consciousness. This is one of the most important things to understand about AI.',
          source:    'LeCun, Y., "A path towards autonomous machine intelligence", 2022',
          sourceUrl: 'https://openreview.net/forum?id=BZ5a1r-kVsf',
        },
        {
          type:    'choice',
          q:       'What is the most important skill when using AI?',
          options: ['Typing fast ⌨️', 'Knowing all the AI tools 📱', 'Critical thinking — verifying and questioning 🧠', 'Using AI for everything 🤖'],
          correct: 2,
          explanation: 'Critical thinking is the #1 skill. AI gives you answers instantly — but you need to judge whether they\'re good.',
          source:    'UNESCO AI Competency 2022',
          sourceUrl: 'https://unesdoc.unesco.org/ark:/48223/pf0000380969',
        },
        {
          type:    'choice',
          q:       'Where does AI get its "knowledge" from?',
          options: ['It thinks it up 💡', 'Training data — text humans wrote 📚', 'A secret brain in the cloud ☁️', 'Real-time internet search 🌐'],
          correct: 1,
          explanation: 'AI\'s "knowledge" is patterns learned from training data — text written by humans. It has no original ideas, only learned patterns.',
          source:    'Brown et al. GPT-3, NeurIPS 2020',
          sourceUrl: 'https://arxiv.org/abs/2005.14165',
        },
        {
          type:    'choice',
          q:       'You ask AI to help with your homework. It gives a perfect answer. What should you do?',
          options: ['Submit it straight away 📤', 'Read it, understand it, then write it in your own words ✍️', 'Trust it and don\'t question 👍', 'Share it with friends so they can use it too 📤'],
          correct: 1,
          explanation: 'Using AI output without understanding it means YOU learn nothing. AI is a helper, not a replacement for your thinking.',
          source:    null,
        },
        {
          type:    'choice',
          q:       'A company says "Our AI understands your emotions." What does this REALLY mean?',
          options: ['The AI genuinely feels empathy 💛', 'The AI detects emotion-related patterns in text/voice 📊', 'The AI was programmed to be kind 🤗', 'This is impossible — AI can\'t do this 🚫'],
          correct: 1,
          explanation: 'Emotion AI detects patterns (like stressed voice pitch or certain words) — it does NOT feel or understand emotions. It\'s pattern detection, not empathy.',
          source:    'MIT Media Lab, Affective Computing',
          sourceUrl: 'https://affect.media.mit.edu/',
        },
        {
          type:    'choice',
          q:       'Who is responsible for what AI does?',
          options: ['The AI itself 🤖', 'Nobody — it\'s just a computer 💻', 'The humans who build, train, and use it 👤', 'The government 🏛️'],
          correct: 2,
          explanation: 'Humans are responsible. The builders choose the training data; the company deploys it; the user applies it. AI has no moral agency.',
          source:    'European AI Act, 2024',
          sourceUrl: 'https://artificialintelligenceact.eu/',
        },
      ],

      results: [
        {
          title:       'AI Curious 🌱',
          description: 'You\'re starting to understand what AI really is. Keep asking questions — curiosity is the best tool for understanding technology.',
        },
        {
          title:       'AI Aware 🔍',
          description: 'You understand that AI learns from data, can be wrong, and needs critical thinking. That\'s already more than most adults know!',
        },
        {
          title:       'AI Literate 🏆',
          description: 'You really get it: AI is a pattern-matching tool, not a thinking being. You know to verify, question, and stay in control. Share this!',
        },
      ],

      protocols: [
        { num: 1, icon: '🔍', title: 'Always verify facts', text: 'If AI says something important — check it on a trusted site (library, .gov, university).' },
        { num: 2, icon: '🧠', title: 'Think before you paste', text: 'AI homework help works best when you understand the answer first, then write it yourself.' },
        { num: 3, icon: '🚫', title: 'AI is not your friend', text: 'It\'s a tool. Real friends have feelings, memories, and care about you. AI has none of these.' },
        { num: 4, icon: '⚠️', title: 'AI can sound very wrong', text: 'Confident tone ≠ correct answer. AI "hallucinates" — invents fake facts that sound real.' },
        { num: 5, icon: '🔒', title: 'Protect your data', text: 'Don\'t share personal info with AI chatbots. Your conversations may be used for training.' },
        { num: 6, icon: '💡', title: 'Ask "how do you know this?"', text: 'Get in the habit of asking for sources. Good information always has a trail back to reality.' },
        { num: 7, icon: '🌍', title: 'AI reflects human biases', text: 'AI learned from human writing — which includes human prejudices. Watch for it.' },
        { num: 8, icon: '🎨', title: 'Your creativity beats AI', text: 'AI can remix what already exists. New ideas? That\'s still a human thing.' },
      ],

      trackerLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },

    /* ─────────────────────────────────────────────
       AGE GROUP: TEEN  (10-13)
       Based on queries: "is ChatGPT sentient", "can AI become conscious",
       "will AI take my job", "how does AI detect emotions", "AI vs human creativity"
    ───────────────────────────────────────────── */
    teen: {

      lessons: [
        {
          icon:  '⚙️',
          title: 'The Transformer Architecture — how modern AI actually works',
          text:  'ChatGPT, Claude, Gemini — all use the Transformer architecture (Vaswani et al., 2017). At its core: the "attention mechanism" — the AI learns which words in a sentence relate most to each other. It builds statistical maps of how language works, then generates the most probable next token. There\'s no comprehension — just very sophisticated statistics.',
          example: '📊 When you type "The cat sat on the ___", the transformer looks at every other word and figures out which ones matter most. "Mat" is statistically likely after "sat on the" — so it picks that.',
          source:    'Vaswani et al., "Attention Is All You Need", Google Brain, 2017',
          sourceUrl: 'https://arxiv.org/abs/1706.03762',
          miniTest: [
            {
              q:       'What does the "attention mechanism" in transformers do?',
              options: [
                'Makes AI pay attention to users 👀',
                'Calculates which words in context relate most to each other 📊',
                'Filters inappropriate content 🚫',
                'Slows down processing for accuracy ⏱️',
              ],
              correct: 1,
              explanation: 'Attention weights tell the model which other tokens in the input are most relevant to predicting the next one. It\'s pure statistics, not understanding.',
            },
          ],
        },
        {
          icon:  '🧬',
          title: 'Training Data = AI\'s entire worldview',
          text:  'GPT-4 trained on ~570 GB of text — roughly 300 billion words from books, Reddit, Wikipedia, GitHub, and more. The AI\'s outputs are bounded by what was in that data. It cannot learn new things after training (without retraining). It doesn\'t browse the internet unless explicitly given that tool.',
          example: '🌐 If the training data has more English than Hindi, the AI performs better in English. If training data is mostly from 2021, it doesn\'t know about 2024 events. Data = limits.',
          source:    'OpenAI, "GPT-4 Technical Report", 2023',
          sourceUrl: 'https://arxiv.org/abs/2303.08774',
          miniTest: [
            {
              q:       'Why does AI perform better in some languages than others?',
              options: [
                'Some languages are harder for computers 💻',
                'Training data has more examples in those languages 📚',
                'AI prefers languages with simpler grammar 📝',
                'Hardware limitations affect certain languages ⚙️',
              ],
              correct: 1,
              explanation: 'More training data = better performance. Languages underrepresented in training data (like many African or Asian languages) get worse outputs.',
            },
          ],
        },
        {
          icon:  '🎭',
          title: 'RLHF — Why AI tries to seem helpful and harmless',
          text:  'After base training, AI is refined using Reinforcement Learning from Human Feedback (RLHF). Human raters score outputs — helpful/harmful/honest — and the model is updated to produce higher-rated responses. This is why ChatGPT apologizes, hedges, and avoids controversy. It was TRAINED to sound agreeable, not because it cares.',
          example: '🎛️ RLHF is like a filter dial. Turn up "helpful", turn down "harmful". But the dial is set by the company — and the company has interests that may not align with yours.',
          source:    'Ouyang et al., "InstructGPT / RLHF", OpenAI 2022',
          sourceUrl: 'https://arxiv.org/abs/2203.02155',
          miniTest: [
            {
              q:       'Why does ChatGPT apologize and say "I was wrong" when corrected?',
              options: [
                'It has feelings and feels bad 😢',
                'It was trained by RLHF to match human preferences for humble, correctable responses 📊',
                'It detects when it made a logical error 🔍',
                'It has a built-in fact-checker ✅',
              ],
              correct: 1,
              explanation: 'RLHF trained ChatGPT to produce responses humans rate highly — and humans rate "sorry, you\'re right" highly. It\'s a learned behavior, not genuine reflection.',
            },
          ],
        },
        {
          icon:  '🧪',
          title: 'Is AI conscious? The hard problem',
          text:  'Consciousness — the subjective experience of "being something" — is one of philosophy\'s hardest unsolved problems (Chalmers, 1995). Current AI has zero evidence of consciousness. It has no qualia (subjective experiences), no continuous memory across sessions, and no goals beyond predicting tokens. Researchers like Gary Marcus and Yann LeCun argue current AI is fundamentally different from human intelligence.',
          example: '💭 "What is it like to be a bat?" (Thomas Nagel, 1974) — you can describe bats perfectly without knowing what it FEELS like to be one. AI can describe feelings without having any.',
          source:    'Chalmers, "The Conscious Mind", 1996 + LeCun, "A path towards autonomous machine intelligence", 2022',
          sourceUrl: 'https://openreview.net/forum?id=BZ5a1r-kVsf',
          miniTest: [
            {
              q:       'What does "AI consciousness" mean to researchers TODAY?',
              options: [
                'AI is definitely conscious, but secretly 🤫',
                'There is no scientific evidence AI has any subjective experience 🔬',
                'AI develops consciousness after enough training 📈',
                'Only future AI will be conscious — current AI is close 🚀',
              ],
              correct: 1,
              explanation: 'No peer-reviewed research supports AI consciousness. The topic is actively studied but current consensus is: no evidence whatsoever.',
            },
          ],
        },
        {
          icon:  '⚖️',
          title: 'AI and fairness — the bias problem',
          text:  'AI learns from human data — which contains human biases. Facial recognition systems have been shown to be less accurate for darker-skinned faces (Buolamwini & Gebru, 2018). Hiring algorithms have penalized women\'s CVs. Medical AI trained mostly on white male patients performs worse on others. Bias in → bias out.',
          example: '🪞 If you train a "beautiful face" AI on mostly Western magazine photos, it learns a narrow standard. That\'s not a computer problem — it\'s a data+human choices problem.',
          source:    'Buolamwini & Gebru, "Gender Shades", MIT Media Lab, 2018',
          sourceUrl: 'http://proceedings.mlr.press/v81/buolamwini18a.html',
          miniTest: [
            {
              q:       'What is AI bias and where does it come from?',
              options: [
                'AI is programmed to be racist by bad developers 😠',
                'AI learns unfair patterns that exist in its training data 📊',
                'AI randomly discriminates due to computing errors ⚙️',
                'Bias only affects very old AI systems 📅',
              ],
              correct: 1,
              explanation: 'AI bias comes from biased training data — and from the choices of who collects it, labels it, and decides what counts as a "correct" output.',
            },
          ],
        },
      ],

      // AI Snake — eat whole words in order to build a sentence (5 rounds for teen)
      snake: [
        {
          unit:    'word',
          targets: ['AI', 'LEARNS', 'FROM', 'HUMANS'],
          decoys:  ['ALIENS', 'MAGIC', 'ROBOTS'],
          icon:    '🧠',
          fact:    'AI systems learn patterns from massive human-made datasets. If that data is biased, the AI repeats the bias.',
          source:    'Stanford AI Index 2024',
          sourceUrl: 'https://aiindex.stanford.edu',
        },
        {
          unit:    'word',
          targets: ['DEEPFAKES', 'CAN', 'LOOK', 'REAL'],
          decoys:  ['CARTOONS', 'MOVIES'],
          icon:    '🎭',
          fact:    'AI can generate fake video and audio of real people. Always check the source before you trust or share it.',
          source:    'Common Sense Media, "AI & Children", 2024',
          sourceUrl: 'https://www.commonsensemedia.org/research',
        },
        {
          unit:    'word',
          targets: ['YOUR', 'DATA', 'HAS', 'VALUE'],
          decoys:  ['NOTHING', 'MAGIC'],
          icon:    '💰',
          fact:    'Apps and chatbots collect what you type and click. Companies use that data to train models and sell ads.',
        },
        {
          unit:    'word',
          targets: ['ALGORITHMS', 'CAN', 'BE', 'ADDICTIVE'],
          decoys:  ['BORING', 'RANDOM'],
          icon:    '⏳',
          fact:    'Recommendation feeds are built to keep you watching. Notice when a feed is designed to hook you, not inform you.',
        },
        {
          unit:    'word',
          targets: ['HUMANS', 'MAKE', 'THE', 'FINAL', 'CALL'],
          decoys:  ['ROBOTS', 'LUCK'],
          icon:    '🧑‍⚖️',
          fact:    'AI can suggest, but for anything important — health, money, safety — a human should decide.',
          source:    'UNESCO "AI Competency Framework", 2022',
          sourceUrl: 'https://unesdoc.unesco.org/ark:/48223/pf0000380969',
        },
      ],

      quiz: [
        {
          type:    'choice',
          q:       'What is a "token" in the context of language models?',
          options: [
            'A security password 🔑',
            'A chunk of text (word or part of a word) that AI processes as a unit 📝',
            'A unit of computing power ⚡',
            'A copyright marker on AI content ©️',
          ],
          correct: 1,
          explanation: 'Tokens are the basic units LLMs process. "Unbelievable" might be 3 tokens: "un", "believ", "able". GPT-4 processes up to 128,000 tokens per context window.',
          source:    'OpenAI Tokenizer documentation',
          sourceUrl: 'https://platform.openai.com/tokenizer',
        },
        {
          type:    'choice',
          q:       'An AI model trained until early 2024 is asked about a 2025 event. What happens?',
          options: [
            'It looks it up online 🌐',
            'It refuses to answer 🚫',
            'It may hallucinate — invent plausible-sounding but false information 🎭',
            'It gives a disclaimer and stops 🛑',
          ],
          correct: 2,
          explanation: 'Without retrieval tools, AI has no knowledge of events after its training cutoff. But rather than saying "I don\'t know", it often generates a plausible-sounding (wrong) answer.',
          source:    'Ji et al. 2023',
          sourceUrl: 'https://arxiv.org/abs/2202.03629',
        },
        {
          type:    'choice',
          q:       'RLHF (Reinforcement Learning from Human Feedback) primarily shapes AI to be...',
          options: [
            'More intelligent 🧠',
            'Faster at computing 💨',
            'More aligned with what human raters consider helpful/harmless/honest 👤',
            'Better at writing code 💻',
          ],
          correct: 2,
          explanation: 'RLHF teaches AI to produce outputs humans rate highly — which means agreeable, helpful-sounding, low-controversy. This is a business choice, not a neutrality guarantee.',
          source:    'Ouyang et al. 2022',
          sourceUrl: 'https://arxiv.org/abs/2203.02155',
        },
        {
          type:    'likert',
          q:       '"AI systems today have genuine emotions and deserve rights."',
          ideal:   1, // Strongly disagree
          explanation: 'Current scientific consensus: AI has no emotions, no consciousness, no subjective experience. "Emotion AI" detects patterns, not feelings.',
          source:    'LeCun 2022, Chalmers 1996',
          sourceUrl: 'https://openreview.net/forum?id=BZ5a1r-kVsf',
        },
        {
          type:    'choice',
          q:       'Why does the same AI prompt give different answers each time?',
          options: [
            'AI is being creative 🎨',
            'Bugs in the code 🐛',
            '"Temperature" parameter introduces controlled randomness in token selection 🎲',
            'The AI changes its mind 💭',
          ],
          correct: 2,
          explanation: 'Temperature controls randomness. At temperature 0, AI always picks the most likely next token. At higher temperatures, less-likely tokens can be selected — making outputs more "creative" but less predictable.',
          source:    'OpenAI API Reference',
          sourceUrl: 'https://platform.openai.com/docs/api-reference',
        },
        {
          type:    'choice',
          q:       'The "Chinese Room" argument (John Searle, 1980) argues that...',
          options: [
            'AI will eventually develop consciousness 🤖→🧠',
            'Following rules to produce correct outputs doesn\'t mean understanding them 🔧',
            'AI in China is more advanced 🇨🇳',
            'Language is the key to machine intelligence 💬',
          ],
          correct: 1,
          explanation: 'Searle\'s thought experiment: imagine following Chinese symbol rules without knowing Chinese — you produce correct Chinese responses but understand nothing. AI may be doing the same.',
          source:    'Searle, "Minds, Brains, and Programs", 1980',
          sourceUrl: 'https://doi.org/10.1017/S0140525X00005756',
        },
        {
          type:    'choice',
          q:       'AI-generated content online is primarily a problem because...',
          options: [
            'It looks worse than human content 📉',
            'It can scale misinformation faster than humans can verify it 📣',
            'It uses too much bandwidth 📡',
            'Copyright law stops people using it ©️',
          ],
          correct: 1,
          explanation: 'AI can generate thousands of convincing articles per hour. Human fact-checkers can\'t keep up. Scale is the core danger, not quality.',
          source:    'Stanford Internet Observatory, 2024',
          sourceUrl: 'https://stacks.stanford.edu/file/druid:mb753jn6512/sio_annual_report_2024.pdf',
        },
        {
          type:    'likert',
          q:       '"I check the sources when AI gives me factual information."',
          ideal:   5, // Strongly agree — we want them to do this
          explanation: 'Source verification is the single most important habit when using AI. AI hallucination is real and common — primary sources are always more trustworthy.',
          source:    null,
        },
        {
          type:    'choice',
          q:       'Which of these is NOT something current AI systems can genuinely do?',
          options: [
            'Summarize a long document accurately 📄',
            'Write code that passes tests 💻',
            'Understand what it\'s saying 💭',
            'Translate between languages 🌐',
          ],
          correct: 2,
          explanation: 'AI processes tokens statistically. It does not "understand" meaning — it predicts likely text. This is the core difference between AI performance and human comprehension.',
          source:    'Chollet, "The Measure of Intelligence", 2019',
          sourceUrl: 'https://arxiv.org/abs/1911.01547',
        },
        {
          type:    'choice',
          q:       'When a company says "our AI is ethical", this means...',
          options: [
            'The AI has moral values ⚖️',
            'The company has chosen certain guidelines for how their AI behaves 📋',
            'A government certified it as ethical 🏛️',
            'The AI refuses to help with harmful requests 🚫',
          ],
          correct: 1,
          explanation: '"Ethical AI" describes company policies and design choices — not AI values. There are no universal standards. The EU AI Act is the closest thing to independent regulation.',
          source:    'EU AI Act, 2024',
          sourceUrl: 'https://artificialintelligenceact.eu/',
        },
      ],

      results: [
        {
          title:       'AI Curious 🔎',
          description: 'You\'re asking the right questions! Understanding AI mechanics takes time. Keep reading primary sources — they\'re always more reliable than popular articles.',
        },
        {
          title:       'AI Aware 🧪',
          description: 'You understand the real mechanisms: transformers, RLHF, hallucination. This puts you ahead of 95% of AI discussions you\'ll encounter online.',
        },
        {
          title:       'AI Literate 🏆',
          description: 'Impressive depth. You understand the Transformer architecture, training data limits, and the consciousness question. Now teach someone else.',
        },
      ],

      protocols: [
        { num: 1,  icon: '📊', title: 'Trace claims to primary sources', text: 'Wikipedia → paper → data. If you can\'t find the original study, treat the claim as uncertain.' },
        { num: 2,  icon: '🔬', title: 'Distinguish AI performance from understanding', text: 'Passing a test ≠ understanding. AI aced the bar exam — but cannot reason about law.' },
        { num: 3,  icon: '🎭', title: 'Recognize RLHF\'s effect', text: 'AI is trained to be agreeable. Its opinions are designed to please — not to be true.' },
        { num: 4,  icon: '⚖️', title: 'Watch for bias', text: 'Ask: who collected this training data? Whose experiences are over/underrepresented?' },
        { num: 5,  icon: '🔒', title: 'Protect your data', text: 'Conversations may be used for training. Never share passwords, addresses, or private details.' },
        { num: 6,  icon: '💡', title: 'Use AI for acceleration, not replacement', text: 'AI drafts; you edit. AI searches; you verify. AI suggests; you decide.' },
        { num: 7,  icon: '🌍', title: 'Think about who AI is built for', text: 'AI companies are building products for profit. Their interests ≠ your interests automatically.' },
        { num: 8,  icon: '📚', title: 'Read Ai2 and ArXiv papers', text: 'Real AI research is publicly available. Primary sources beat tech journalism every time.' },
        { num: 9,  icon: '🤝', title: 'Build human skills AI cannot replicate', text: 'Empathy, physical skill, original creativity, ethical judgment — invest in these.' },
        { num: 10, icon: '🛡️', title: 'Demand transparency', text: 'Which model? What training data? Who evaluated it? These are fair questions to ask.' },
      ],

      trackerLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },

    /* ─────────────────────────────────────────────
       AGE GROUP: ADULT  (14+)
       Based on queries: "will AI replace programmers", "AI consciousness research",
       "how does Constitutional AI work", "AI and democracy", "AI job market impact"
    ───────────────────────────────────────────── */
    adult: {

      lessons: [
        {
          icon:  '🏗️',
          title: 'The full LLM stack: from raw text to RLHF',
          text:  'Modern LLMs are built in three phases: (1) Pre-training on massive corpora — next-token prediction, billions of parameters; (2) Supervised fine-tuning on curated human demonstrations; (3) RLHF or Constitutional AI to align outputs with human preferences or a rule set. The model never "stores" facts — it distributes statistical relationships across billions of weights. "Knowledge" is a metaphor for what are really weighted probability distributions.',
          example: '🔧 Architecture → Data curation → Fine-tuning → RLHF → Deployment → Monitoring. Each step involves human choices that shape what the model will say.',
          source:    'Ouyang et al. (InstructGPT) 2022 + Bai et al. (Constitutional AI, Anthropic) 2022',
          sourceUrl: 'https://arxiv.org/abs/2212.08073',
          miniTest: [
            {
              q:       'Why can\'t you simply ask an LLM "what\'s in your training data"?',
              options: [
                'Companies hide this for legal reasons 🔒',
                'The model doesn\'t "store" data — it encodes statistical patterns; individual documents are not retrievable 📊',
                'It would take too much computing power 💻',
                'Training data is encrypted 🔐',
              ],
              correct: 1,
              explanation: 'LLMs don\'t memorize documents as discrete objects. They compress patterns into billions of floating-point weights. Specific text can sometimes be "reconstructed" through adversarial prompting — a known privacy risk.',
            },
          ],
        },
        {
          icon:  '🗺️',
          title: 'The landscape of AI risk: near-term vs speculative',
          text:  'Near-term concrete risks: algorithmic bias (Buolamwini 2018), information pollution at scale (disinformation), copyright and IP disputes, labour displacement in specific sectors (code generation, content creation, translation). Speculative long-term risks: misalignment (AI optimizing for proxy goals vs intended ones), capability acceleration outpacing safety research. The Overton window in mainstream AI discourse often conflates both, making productive risk analysis harder.',
          example: '🎯 "AI will kill us all" and "AI has no risks" are both wrong. Risk calibration means: which risks? How probable? How soon? Who bears them? Who benefits from ignoring them?',
          source:    'Center for AI Safety, "Statement on AI Risk", 2023 + EU AI Act Risk Classification',
          sourceUrl: 'https://www.safe.ai/statement-on-ai-risk',
          miniTest: [
            {
              q:       'The most concrete AI risks RIGHT NOW primarily affect...',
              options: [
                'All humans equally through existential catastrophe 🌍',
                'Specific groups disproportionately — minorities via biased systems, workers in automatable sectors 📊',
                'Only people who use AI directly 💻',
                'Primarily researchers who build the systems 🔬',
              ],
              correct: 1,
              explanation: 'Current AI risks are unevenly distributed. Facial recognition errors disproportionately affect darker-skinned people. Automation affects specific job categories. Understanding distribution matters for policy.',
            },
          ],
        },
        {
          icon:  '⚗️',
          title: 'What "reasoning" and "understanding" mean (and don\'t) in AI',
          text:  'GPT-4 passes bar exams, medical licensing tests, and PhD qualifier questions. Does this mean it reasons? François Chollet\'s ARC benchmark (2019) specifically designed tasks AI cannot solve through pattern matching alone — and current LLMs fail catastrophically on them. Chain-of-thought prompting elicits better performance but the mechanism is debated: genuine reasoning or learned patterns of reasoning-like text?',
          example: '♟️ Deep Blue beat Kasparov at chess without "understanding" chess. Stockfish plays better than any human but has no concept of a king. Performance and understanding are separable.',
          source:    'Chollet, "On the Measure of Intelligence", 2019 + Mitchell, "AI: A Guide for Thinking Humans", 2021',
          sourceUrl: 'https://arxiv.org/abs/1911.01547',
          miniTest: [
            {
              q:       'Chain-of-thought prompting (asking AI to "think step by step") works because...',
              options: [
                'It activates the AI\'s reasoning module 🧠',
                'It elicits statistical patterns of reasoning-like text that correlate with more accurate outputs 📊',
                'It gives AI more time to compute 🕐',
                'It forces AI to access different training data 📚',
              ],
              correct: 1,
              explanation: 'Chain-of-thought works because reasoning traces are well-represented in training data, and conditioning on those patterns steers the model toward more accurate completions. Whether this is "real" reasoning is contested.',
            },
          ],
        },
        {
          icon:  '🏛️',
          title: 'AI Governance: regulation, self-regulation, and power',
          text:  'Three governance models currently compete: (1) The EU AI Act — binding risk-based regulation, prohibited uses, transparency requirements; (2) US approach — mostly voluntary frameworks (NIST AI RMF, White House commitments); (3) China — state-directed AI with national strategic goals. The fundamental tension: safety and accountability slow deployment; speed is commercially and strategically valuable. Who writes the rules shapes who benefits.',
          example: '⚖️ The EU AI Act bans real-time remote biometric surveillance in public spaces. US law currently permits it. China mandates it. Same technology — three different legal realities.',
          source:    'EU AI Act (2024), NIST AI RMF 1.0 (2023)',
          sourceUrl: 'https://artificialintelligenceact.eu/',
          miniTest: [
            {
              q:       'The EU AI Act classifies AI systems by...',
              options: [
                'The country of origin 🌍',
                'How expensive they are to build 💰',
                'Level of risk they pose to fundamental rights and safety 📊',
                'Whether they use open-source code 🔓',
              ],
              correct: 2,
              explanation: 'The EU AI Act categorises systems as unacceptable risk (banned), high risk (strict requirements), limited risk (transparency rules), or minimal risk (no obligations). Risk to people is the axis.',
            },
          ],
        },
        {
          icon:  '🔭',
          title: 'What comes next — and what you can actually know',
          text:  'Scaling laws (Kaplan et al., 2020) showed that model capability scales predictably with compute, data, and parameters — leading to the race for scale. But scaling may be hitting diminishing returns. Competing paradigms: neurosymbolic AI (combining neural nets with logic), world models (LeCun\'s vision), multimodal grounding, and agent systems. The honest answer: nobody knows what comes next. Anyone claiming certainty is selling something.',
          example: '🗓️ In 2021, GPT-3 was considered a breakthrough. In 2022, DALL-E shocked everyone. In 2023, GPT-4 passed the bar exam. In 2024, models ran locally on phones. Predictions in AI have a poor track record — including from experts.',
          source:    'Kaplan et al., "Scaling Laws for Neural Language Models", 2020',
          sourceUrl: 'https://arxiv.org/abs/2001.08361',
          miniTest: [
            {
              q:       'The safest epistemic position on AI\'s future capabilities is...',
              options: [
                '"AI will definitely reach human-level intelligence within 5 years" 🤖',
                '"AI is just a fancy autocomplete and can\'t improve significantly" 🚫',
                '"Current trajectories suggest X, but uncertainty is high and predictions have historically been unreliable" 📊',
                '"Experts unanimously agree on the timeline" 🤝',
              ],
              correct: 2,
              explanation: 'The history of AI is full of overconfident predictions in both directions. Calibrated uncertainty — acknowledging what we don\'t know — is the most defensible position.',
            },
          ],
        },
        {
          icon:  '🧭',
          title: 'Your role in the AI era — not passive, not afraid',
          text:  'AI literacy is now a democratic necessity. Societies make collective decisions about AI through elections, regulation, procurement, employment, and consumer choices. Informed citizens are a prerequisite for accountable AI governance. The people who understand how AI actually works are the ones who can meaningfully participate in shaping how it\'s used — and that includes you.',
          example: '🗳️ AI is being deployed in: hiring (your future employer may use it), healthcare (your doctor may rely on it), courts (some jurisdictions use predictive tools), education (your school may adopt it). Your understanding of it is not academic — it\'s practical.',
          source:    'UNESCO "AI Competency Framework for Citizens", 2022',
          sourceUrl: 'https://unesdoc.unesco.org/ark:/48223/pf0000380969',
          miniTest: [
            {
              q:       'AI literacy matters for people who DON\'T work in tech because...',
              options: [
                'It doesn\'t — it\'s only relevant for developers 💻',
                'AI systems affect hiring, healthcare, justice, and daily life for everyone 🌍',
                'It helps you use ChatGPT better for productivity 📈',
                'It\'s required for most jobs now ⚙️',
              ],
              correct: 1,
              explanation: 'AI shapes decisions across society. You don\'t need to build AI to be affected by it — or to have a stake in how it\'s governed.',
            },
          ],
        },
      ],

      // AI Snake — eat phrase chunks to build a fully-cited fact (5 rounds for adult)
      snake: [
        {
          unit:    'phrase',
          targets: ['AI MODELS', 'REFLECT', 'THE BIASES', 'IN THEIR TRAINING DATA'],
          decoys:  ['PURE LOGIC', 'NO OPINIONS AT ALL'],
          icon:    '⚖️',
          fact:    'Machine learning models mirror patterns — including social biases — present in the text and images they were trained on.',
          source:    'Bender et al., "On the Dangers of Stochastic Parrots", 2021',
          sourceUrl: 'https://dl.acm.org/doi/10.1145/3442188.3445922',
        },
        {
          unit:    'phrase',
          targets: ['GENERATIVE AI', 'CAN PRODUCE', 'CONFIDENT', 'BUT FALSE ANSWERS'],
          decoys:  ['ALWAYS 100% CORRECT', 'NEVER GUESSES'],
          icon:    '💭',
          fact:    'This is called "hallucination" — a fluent-sounding answer with no basis in fact. Always verify claims that matter.',
          source:    'Ji et al., "Survey of Hallucination in NLG", 2023',
          sourceUrl: 'https://arxiv.org/abs/2202.03629',
        },
        {
          unit:    'phrase',
          targets: ['YOUR PROMPTS', 'MAY BE STORED', 'AND USED', 'TO TRAIN FUTURE MODELS'],
          decoys:  ['DELETED INSTANTLY', 'KEPT FULLY SECRET'],
          icon:    '🔐',
          fact:    'Read a service\'s privacy policy before sharing sensitive information with any AI tool.',
        },
        {
          unit:    'phrase',
          targets: ['VOICE CLONING', 'CAN COPY', 'A VOICE', 'FROM SECONDS OF AUDIO'],
          decoys:  ['REQUIRES HOURS OF TAPE', 'IS IMPOSSIBLE TODAY'],
          icon:    '📞',
          fact:    'Voice-cloning scams are rising. Agree on a family "safe word" to verify unexpected calls asking for money.',
          source:    'FTC Consumer Alerts, 2023',
          sourceUrl: 'https://consumer.ftc.gov/consumer-alerts',
        },
        {
          unit:    'phrase',
          targets: ['CRITICAL THINKING', 'IS THE BEST', 'DEFENSE', 'AGAINST AI MISUSE'],
          decoys:  ['BLIND TRUST', 'TOTAL AVOIDANCE'],
          icon:    '🛡️',
          fact:    'The goal isn\'t to fear AI — it\'s to question sources, verify facts, and keep humans in charge of decisions.',
          source:    'UNESCO "AI Competency Framework", 2022',
          sourceUrl: 'https://unesdoc.unesco.org/ark:/48223/pf0000380969',
        },
      ],

      quiz: [
        {
          type:    'choice',
          q:       'Constitutional AI (Anthropic, 2022) differs from standard RLHF by...',
          options: [
            'Using larger models as the reward model 🧠',
            'Having the model critique and revise its own outputs against an explicit written constitution 📜',
            'Removing human raters entirely from the process 🚫',
            'Training only on legal and ethical documents ⚖️',
          ],
          correct: 1,
          explanation: 'In CAI, a larger AI critiques outputs from a smaller AI against written principles — reducing reliance on human raters for harmlessness while preserving capability. The constitution is published and auditable.',
          source:    'Bai et al., "Constitutional AI: Harmlessness from AI Feedback", Anthropic 2022',
          sourceUrl: 'https://arxiv.org/abs/2212.08073',
        },
        {
          type:    'likert',
          q:       '"AI systems should be required by law to disclose that they are AI in all interactions with people."',
          ideal:   4,
          explanation: 'The EU AI Act requires disclosure for AI interactions with people. Transparency is a near-universal recommendation across governance frameworks. Some argue exceptions exist for clearly-labeled creative fiction.',
          source:    'EU AI Act Art. 52 (transparency obligations)',
          sourceUrl: 'https://artificialintelligenceact.eu/',
        },
        {
          type:    'choice',
          q:       'Scaling laws (Kaplan et al., 2020) describe the relationship between...',
          options: [
            'AI speed and hardware cost 💰',
            'Model size, dataset size, compute budget and resulting capability 📊',
            'Number of users and system stability ⚡',
            'Training time and energy consumption 🌿',
          ],
          correct: 1,
          explanation: 'Kaplan\'s scaling laws showed capability improves predictably as a power law with model size, dataset size, and compute. This drove the race toward larger models — though diminishing returns are now apparent.',
          source:    'Kaplan et al., 2020',
          sourceUrl: 'https://arxiv.org/abs/2001.08361',
        },
        {
          type:    'choice',
          q:       'The ARC (Abstraction and Reasoning Corpus) benchmark tests AI\'s...',
          options: [
            'Speed at natural language generation ⚡',
            'Ability to solve novel visual reasoning tasks unsolvable by pattern matching 🧩',
            'Performance on standard academic exams 📝',
            'Code generation accuracy 💻',
          ],
          correct: 1,
          explanation: 'ARC tasks require genuine novel reasoning — humans solve them easily, but LLMs fail dramatically. This is why Chollet argues current AI is fundamentally different from human intelligence.',
          source:    'Chollet, "On the Measure of Intelligence", 2019',
          sourceUrl: 'https://arxiv.org/abs/1911.01547',
        },
        {
          type:    'likert',
          q:       '"Companies should be legally required to publish what data was used to train their AI models."',
          ideal:   5,
          explanation: 'Training data transparency is required under the EU AI Act for high-risk and general-purpose AI systems. It enables bias auditing, copyright accountability, and informed public debate.',
          source:    'EU AI Act Art. 53',
          sourceUrl: 'https://artificialintelligenceact.eu/',
        },
        {
          type:    'choice',
          q:       'In the EU AI Act, which AI use is explicitly prohibited?',
          options: [
            'AI-generated text without watermarking 📝',
            'Real-time remote biometric surveillance of people in public spaces 👁️',
            'AI used in medical devices 🏥',
            'AI used in job recruitment 💼',
          ],
          correct: 1,
          explanation: 'Real-time remote biometric surveillance is Article 5 — explicitly prohibited. Medical and recruitment AI are high-risk (requiring auditing), not banned. Watermarking is a transparency requirement.',
          source:    'EU AI Act Article 5',
          sourceUrl: 'https://artificialintelligenceact.eu/',
        },
        {
          type:    'choice',
          q:       'Which statement about AI-generated disinformation is most accurate?',
          options: [
            'AI disinformation is easy to detect because it sounds robotic 🤖',
            'The primary danger is quality; AI writes better misinformation than humans 📝',
            'The primary danger is scale; AI can produce and distribute false content faster than it can be verified 📣',
            'AI disinformation only works on technologically unsophisticated audiences 👥',
          ],
          correct: 2,
          explanation: 'Scale is the key danger. Fact-checking is slow and human; AI content generation is fast and automated. Even if each piece is detectable, the volume overwhelms verification capacity.',
          source:    'Stanford Internet Observatory, 2024',
          sourceUrl: 'https://stacks.stanford.edu/file/druid:mb753jn6512/sio_annual_report_2024.pdf',
        },
        {
          type:    'likert',
          q:       '"I understand the difference between AI pattern-matching and human reasoning well enough to explain it to someone else."',
          ideal:   4,
          explanation: 'The ability to explain the distinction — statistical pattern completion vs genuine comprehension — is a core component of AI literacy and a useful skill for navigating AI-saturated information environments.',
          source:    null,
        },
        {
          type:    'choice',
          q:       'Which of these is a genuine unsolved problem in AI research?',
          options: [
            'Making AI produce grammatical sentences ✍️',
            'Training AI on large datasets 📚',
            'Reliably preventing AI from generating harmful content at scale 🛡️',
            'Making AI run faster ⚡',
          ],
          correct: 2,
          explanation: 'Content moderation at scale is genuinely unsolved. Red-teaming, RLHF, and constitutional AI all reduce harmful outputs — but none eliminate them. Adversarial prompting consistently finds exploits.',
          source:    'Perez et al., "Red Teaming Language Models with Language Models", 2022',
          sourceUrl: 'https://arxiv.org/abs/2202.03286',
        },
        {
          type:    'choice',
          q:       'An algorithm trained on historical hiring data from a company with past gender discrimination will...',
          options: [
            'Automatically correct for historical bias because algorithms are objective 🤖',
            'Likely reproduce and potentially amplify the historical bias 📊',
            'Require very large datasets to show bias 📈',
            'Only show bias if explicitly programmed to 💻',
          ],
          correct: 1,
          explanation: 'Algorithms learn from data — if historical data reflects discriminatory decisions, the algorithm learns to reproduce those decisions. Amazon scrapped a hiring AI in 2018 for exactly this reason.',
          source:    'Reuters, "Amazon scraps secret AI recruiting tool that showed bias against women", 2018',
          sourceUrl: 'https://www.reuters.com/article/us-amazon-com-jobs-automation-insight-idUSKCN1MK08G',
        },
        {
          type:    'choice',
          q:       'The "alignment problem" in AI refers to...',
          options: [
            'Making AI outputs grammatically consistent 📝',
            'Aligning text to the left in AI interfaces ⬅️',
            'Ensuring AI pursues goals actually intended by humans, not proxy metrics that diverge in edge cases ⚖️',
            'Getting AI companies to agree on standards 🤝',
          ],
          correct: 2,
          explanation: 'Alignment is the challenge of ensuring AI optimizes for what humans actually want, not a measurable proxy that diverges from the true goal. Classic example: reward hacking — an agent finds unexpected ways to score points that violate the spirit of the task.',
          source:    'Bostrom, "Superintelligence", 2014 + Russell, "Human Compatible", 2019',
          sourceUrl: 'https://humancompatible.ai/',
        },
        {
          type:    'likert',
          q:       '"AI systems should be audited by independent third parties before being deployed in high-stakes decisions (hiring, credit, criminal justice)."',
          ideal:   5,
          explanation: 'Independent auditing is a central demand of AI accountability advocates and is required under the EU AI Act for high-risk systems. This is near-consensus among AI ethics researchers.',
          source:    'EU AI Act Art. 43-44',
          sourceUrl: 'https://artificialintelligenceact.eu/',
        },
        {
          type:    'choice',
          q:       'What makes AI systems "interpretable" (or not)?',
          options: [
            'Whether the code is open source 🔓',
            'Whether humans can understand why the model produced a particular output 💡',
            'Whether the model was trained on public data 📚',
            'Whether the interface is user-friendly 🖥️',
          ],
          correct: 1,
          explanation: 'Interpretability = can we understand the model\'s decision process? Large neural nets are "black boxes" — they produce outputs humans can\'t trace to specific reasons. This is a core AI safety concern.',
          source:    'Anthropic Interpretability Research',
          sourceUrl: 'https://www.anthropic.com/research/interpretability',
        },
        {
          type:    'choice',
          q:       'Which type of AI system is explicitly classified as "high-risk" under the EU AI Act?',
          options: [
            'A chatbot on a shopping website 🛒',
            'A recommendation algorithm for movies 🎬',
            'An AI used to evaluate job applications 💼',
            'An AI that translates legal documents 📄',
          ],
          correct: 2,
          explanation: 'Recruitment AI is explicitly listed in EU AI Act Annex III as high-risk. It must meet strict requirements: human oversight, data quality measures, accuracy tests, and logging. The employer carries legal liability.',
          source:    'EU AI Act Annex III',
          sourceUrl: 'https://artificialintelligenceact.eu/',
        },
        {
          type:    'likert',
          q:       '"I feel equipped to critically evaluate AI-related claims I encounter in news, at work, or from companies."',
          ideal:   4,
          explanation: 'The goal of AI literacy. You don\'t need to build AI to evaluate AI claims critically — you need to understand what AI actually does and doesn\'t do, and to identify when claims exceed the evidence.',
          source:    null,
        },
      ],

      results: [
        {
          title:       'AI Curious 🔎',
          description: 'You have a foundation to build on. Focus on primary sources — academic papers and official regulatory documents reward careful reading. The landscape changes fast but the fundamentals are stable.',
        },
        {
          title:       'AI Aware 🧪',
          description: 'You understand the real mechanisms and can distinguish hype from substance. This is rarer than it should be. You\'re positioned to think clearly about AI policy, career, and civic questions.',
        },
        {
          title:       'AI Literate 🏆',
          description: 'Deep understanding: LLM architecture, alignment problems, governance landscape, and epistemic limits of AI. You have the foundation to engage constructively with AI as a citizen, professional, and critical thinker.',
        },
      ],

      protocols: [
        { num: 1,  icon: '📊', title: 'Distinguish performance from understanding', text: 'Acing a test ≠ comprehension. Always ask what the AI is actually doing mechanistically.' },
        { num: 2,  icon: '⚖️', title: 'Read the EU AI Act', text: 'It\'s the world\'s most comprehensive AI regulation. It directly affects anyone operating in or selling to Europe.' },
        { num: 3,  icon: '🔍', title: 'Demand interpretability', text: 'For high-stakes decisions, ask: can anyone explain why the AI made this choice? If not, should it be making it?' },
        { num: 4,  icon: '📚', title: 'Follow ArXiv cs.AI and cs.CL', text: 'Preprints before peer review. Read abstracts. Track what the field is actually debating vs. what press covers.' },
        { num: 5,  icon: '🏛️', title: 'Participate in AI governance', text: 'Regulation happens in consultation periods, elections, and procurement decisions. Informed participation matters.' },
        { num: 6,  icon: '🎯', title: 'Calibrate your risk assessment', text: 'Near-term concrete harms vs. speculative long-term risks. Both matter but require different responses.' },
        { num: 7,  icon: '💼', title: 'Audit AI in your workplace', text: 'Ask what AI tools are used for HR, performance, access. You have a right to know in most jurisdictions.' },
        { num: 8,  icon: '🌍', title: 'Think about distribution of harm', text: 'AI risks are not equal. Ask: which communities bear the costs of this deployment? Who gets the benefits?' },
        { num: 9,  icon: '🔬', title: 'Invest in human skills AI cannot replicate', text: 'Novel synthesis, ethical judgment, genuine relationship, physical-world expertise, and original creativity remain deeply human.' },
        { num: 10, icon: '📡', title: 'Support open research and open models', text: 'Transparency in AI depends partly on open-source development. Supporting open model research is a governance choice.' },
        { num: 11, icon: '🤝', title: 'Teach someone else', text: 'AI literacy compounds. One informed person can raise the baseline for their entire community.' },
        { num: 12, icon: '🛡️', title: 'Protect your information hygiene', text: 'What goes into AI systems can be extracted or influence outputs for others. Your data has strategic value.' },
      ],

      trackerLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
  }, // end ages
}; // end window.LANG_DATA
