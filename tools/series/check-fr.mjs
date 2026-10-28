// Lesson B, French ("tu"): "Vérifie une réponse sûre d'elle". Made-up
// workshop, made-up assistant; every fact the child needs is on the page.
// Adapted, not word for word (prices in euros, times as "15 h");
// non-breaking spaces before ? ! : ; and inside « ». Not reviewed by a
// native-speaking editor or a teacher.

const WHO = 'Assistant (exemple d’entraînement)';
const SCHEDULE = {
  title: 'Planning de l’atelier « Engrenage » (le document d’origine)',
  rows: [['Pour qui', 'enfants de 7 à 12 ans'], ['Robots', 'lundi, 15 h'], ['Dessin', 'mercredi, 16 h 30'], ['Maquettes en carton', 'samedi, 11 h'], ['Durée', 'chaque séance dure 1 heure']],
};
const SCHEDULE2 = {
  title: 'Annonce de l’atelier « Engrenage » (le document d’origine)',
  rows: [['Visite de l’atelier', 'samedi, 12 h'], ['Inscription', 'à l’accueil, au rez-de-chaussée']],
  note: 'L’annonce ne dit rien du prix de la visite.',
};
const ANSWER = 'L’atelier Engrenage est pour les enfants. Le club de robots a lieu le mercredi à 16 h 30. Chaque séance dure une heure.';
const SENTENCES = ['L’atelier est pour les enfants.', 'Le club de robots a lieu le mercredi à 16 h 30.', 'Chaque séance dure une heure.'];

const findStep = () => ({
  title: 'Trouve l’affirmation douteuse',
  intro: 'Tu as demandé à l’assistant quand a lieu le club de robots. Il a répondu avec beaucoup d’assurance. Compare sa réponse avec le planning.',
  doc: SCHEDULE,
  bubble: { who: WHO, text: ANSWER },
  questions: [
    { q: 'Quelle affirmation de l’assistant ne correspond pas au planning ?', options: SENTENCES, correct: 1,
      ok: 'Oui. Le mercredi à 16 h 30, c’est le dessin ; les robots, c’est le lundi à 15 h. L’assistant a mélangé les lignes.',
      noAll: 'Cette affirmation correspond au planning. Trouve la ligne des robots et compare.' },
  ],
});

const fixStep = {
  title: 'Corrige la réponse et justifie',
  doc: SCHEDULE,
  questions: [
    { q: 'Qu’est-ce qui est juste ?', options: ['Le club de robots a lieu le lundi à 15 h.', 'Le club de robots a lieu le mercredi à 16 h 30.', 'Le club de robots a lieu le samedi à 11 h.'], correct: 0,
      ok: 'Exact : c’est ce que dit le planning.', noAll: 'Regarde la ligne « Robots » du planning.' },
    { q: 'Sur quoi s’appuie ta correction ?', options: ['C’est écrit dans le document d’origine — le planning de l’atelier', 'L’assistant a répondu avec beaucoup d’assurance', 'Ça a l’air plus juste'], correct: 0,
      ok: 'Oui. La raison, c’est le document dont parle la question. Un ton assuré ne prouve rien.',
      noAll: 'Un ton assuré et « ça a l’air juste » ne sont pas des preuves. Sur quoi peux-tu t’appuyer ?' },
  ],
};

const unknownStep = {
  title: 'Nouvel exemple — à toi de jouer',
  intro: 'Tu as redemandé : combien coûte la visite ?',
  doc: SCHEDULE2,
  bubble: { who: WHO, text: 'La visite de l’atelier du samedi à 12 h coûte 5 euros.' },
  questions: [
    { q: 'Est-ce vrai que la visite coûte 5 euros ?', options: ['Oui, c’est vrai', 'Non, c’est faux', 'On ne peut pas encore savoir'], correct: 2,
      ok: 'Exact. L’annonce donne l’heure de la visite, mais pas le prix. L’assistant n’a pu que deviner « 5 euros » — et le document ne permet pas de le confirmer.',
      no: { 0: 'Le document n’indique aucun prix — rien ne confirme « 5 euros ».', 1: 'Tu ne peux pas dire « faux » non plus : le document n’indique aucun prix. Que manque-t-il pour trancher ?' } },
    { q: 'Comment connaître le prix ?', options: ['Demander à l’accueil de l’atelier, comme l’indique l’annonce', 'Redemander à l’assistant jusqu’à ce qu’il donne la même réponse', 'Le croire, puisque l’assistant a donné un montant précis'], correct: 0,
      ok: 'Oui. Il te faut une source responsable de cette information.',
      noAll: 'Une réponse répétée ou précise de l’assistant n’est toujours pas vérifiée. Qui connaît vraiment le prix ?' },
  ],
};

const twoSources = {
  title: 'Compare deux sources',
  intro: 'Question : en quelle année l’atelier Engrenage a-t-il ouvert ? L’assistant a répondu : « En 2022 — plein de sites le disent. » Voici ce que tu as trouvé.',
  sources: [
    { name: 'Source A : le site de l’atelier, page « Qui sommes-nous »', origin: 'l’atelier lui-même', date: 'page mise à jour en 2026', says: '« L’atelier a ouvert en 2019 »' },
    { name: 'Source B : un message sur un forum', origin: 'un utilisateur sans nom', date: 'pas de date', says: '« Ils ont ouvert il y a peu, en 2022 je crois »' },
  ],
  questions: [
    { q: 'Quelle source est la meilleure pour répondre à cette question ?', options: ['A : elle est écrite par l’atelier lui-même et datée', 'B : elle dit « 2022 », comme l’assistant', 'Les deux pareil : elles donnent toutes deux une année'], correct: 0,
      ok: 'Oui. Regarde qui l’a écrit (origine), quand (date) et si cela porte directement sur la question.',
      noAll: 'Être d’accord avec l’assistant ou être repris par beaucoup de sites ne prouve rien. Qui connaît le mieux l’année d’ouverture ?' },
  ],
};

const teenWhy = {
  q: '« Plein de sites le disent » — pourquoi est-ce une raison faible ?',
  options: ['Les sites peuvent recopier la même erreur les uns sur les autres', 'C’est une bonne raison : si beaucoup le disent, c’est vrai', 'Il n’y a jamais beaucoup de sites'], correct: 0,
  ok: 'Exact. Dix copies d’une erreur restent une seule erreur. Ce qui compte, c’est d’où vient l’information.',
  noAll: 'Pense à l’endroit où les sites trouvent leurs informations, et au fait qu’ils peuvent se répéter entre eux.',
};
const adultStakes = {
  q: 'Même la source A peut se tromper. Que fais-tu si une décision importante dépend de l’année (par exemple un dossier d’inscription à un concours) ?',
  options: ['Vérifier par un autre moyen indépendant : par exemple demander un document ou appeler l’atelier', 'Rien : un site officiel ne se trompe jamais', 'Prendre l’année donnée par l’assistant'], correct: 0,
  ok: 'Oui. Plus la décision est importante, plus elle demande de confirmations indépendantes.',
  noAll: 'Une source officielle est plus fiable, mais pas infaillible. Comment confirmer un fait important ?',
};

export const fr = {
  common: {
    title: 'Vérifie une réponse sûre d’elle',
    desc: 'Un assistant d’entraînement raconte un planning avec assurance, mais avec une erreur. L’enfant trouve l’affirmation douteuse, la compare au document, la corrige et justifie ; ensuite vient un cas où l’information manque.',
    goal: 'Apprendre à comparer une réponse sûre d’elle avec le document d’origine, et à dire « on ne peut pas encore savoir » quand l’information n’y est pas.',
    noJs: 'L’activité elle-même a besoin de JavaScript. Sans lui, l’objectif, l’explication et une tâche à imprimer se trouvent ci-dessous.',
    explain1: 'Un assistant peut répondre avec assurance et se tromper quand même : il a mélangé des lignes du planning. Vérifier, c’est comparer avec la source dont parle la question.',
    explain2: 'Si la source ne contient pas l’information, la réponse honnête est « on ne peut pas encore savoir ». Un chiffre précis dans une réponse ne veut pas dire qu’elle a été vérifiée.',
    explain3: 'Un ton assuré, la répétition et le nombre de liens ne prouvent pas la vérité. Regarde qui l’a écrit, quand, et si cela porte sur la question.',
    doneH: 'Et ensuite ?',
    doneText: 'Une réponse sûre d’elle n’est pas encore une réponse vérifiée. Vérifier, c’est s’appuyer sur une source — et quand l’information manque, le dire.',
    choices: ['Refaire cette activité', 'Activité suivante : « Que peut-on partager ? »', 'Toutes les leçons'],
    adult: {
      goal: 'L’enfant compare des affirmations avec la source d’origine, distingue « faux » de « on ne peut pas encore savoir », et ne prend ni l’assurance ni le nombre de liens pour une preuve.',
      questions: ['Comment as-tu remarqué que l’assistant se trompait ?', 'Quelle est la différence entre « faux » et « on ne peut pas encore savoir » ?', 'À qui demanderais-tu si le document ne donne pas la réponse ?'],
      misconception: 'Si une réponse a l’air sûre d’elle et contient des chiffres précis, elle est juste. Une formulation précise ne veut pas dire que l’information a été vérifiée.',
      signs: ['Montre la ligne du document sur laquelle il ou elle s’appuie.', 'Dit « on ne peut pas encore savoir » quand l’information manque, et dit où chercher.', 'Pour comparer des sources, regarde l’origine et la date, pas si elles sont d’accord avec la réponse.'],
      method: 'Tous les textes de l’assistant sont écrits à l’avance — ce n’est ni une discussion en direct ni une requête à un réseau de neurones. L’atelier et son planning sont inventés pour que la réponse puisse être vérifiée directement sur la page.',
      print: {
        task: 'Planning : « Robots — lundi 15 h ; Dessin — mercredi 16 h 30 ». L’assistant a dit : « Les robots, c’est le mercredi ». 1) Trouve l’erreur. 2) Corrige-la. 3) L’assistant a dit : « Une séance coûte 5 euros ». Peut-on le vérifier avec le planning ?',
        answers: '1) Le jour et l’heure sont mélangés. 2) Les robots, c’est le lundi à 15 h. 3) Non : le planning n’indique aucun prix — on ne peut pas encore savoir ; il faut demander à l’atelier.',
      },
    },
  },
  tiny: {
    goal: 'Vérifions avec le planning si l’assistant a dit vrai.',
    steps: [
      { title: 'Compare avec le planning', intro: 'Un adulte lit à voix haute. L’assistant a dit : « Le club de robots, c’est le mercredi. » Regardez le planning ensemble.', doc: SCHEDULE,
        questions: [{ q: 'Les robots, c’est le mercredi ?', options: ['Oui', 'Non'], correct: 1, ok: 'Exact : dans le planning, les robots, c’est le lundi. L’assistant s’est trompé.', noAll: 'Cherchez ensemble la ligne « Robots ». Quel jour est écrit ?' }] },
      { title: 'Pourquoi tu penses ça ?', questions: [{ q: 'Comment le sais-tu ?', options: ['J’ai regardé le planning', 'L’assistant avait l’air sûr de lui'], correct: 0, ok: 'Oui ! Nous avons vérifié avec le planning.', noAll: 'Une voix sûre d’elle, ce n’est pas une vérification. Où avons-nous regardé ?' }] },
      { title: 'Nouvel exemple', intro: 'L’assistant a dit : « La visite coûte 5 euros. » L’annonce donne seulement l’heure.', doc: SCHEDULE2,
        questions: [{ q: 'Est-ce qu’on connaît le prix ?', options: ['Oui, 5 euros', 'Pas encore — il faut demander à un adulte ou à l’accueil'], correct: 1, ok: 'Exact : l’annonce n’indique pas de prix. Quand on ne sait pas, on le dit — et on demande.', noAll: 'Regarde l’annonce : il y a un prix ?' }] },
    ],
  },
  child: {
    goal: 'Trouver l’erreur dans une réponse sûre d’elle, la corriger grâce au document, et distinguer « faux » de « on ne peut pas encore savoir ».',
    steps: [findStep(), fixStep, unknownStep],
  },
  teen: {
    goal: 'Comparer des affirmations avec le document, distinguer « faux » de « on ne peut pas encore savoir », et comparer des sources selon leur origine et leur date.',
    steps: [findStep(), fixStep, unknownStep, { ...twoSources, questions: [...twoSources.questions, teenWhy] }],
  },
  adult: {
    goal: 'Vérifier des affirmations à la source, peser l’origine, la date et la pertinence, et adapter l’effort de vérification à l’importance de la décision.',
    steps: [findStep(), fixStep, unknownStep, { ...twoSources, questions: [...twoSources.questions, teenWhy, adultStakes] }],
  },
};
