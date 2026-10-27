// Lesson C, French ("tu"): "Que peut-on partager ?". Every name, address and
// number below is made up for the demo (French names, a phone of zeros); the
// child never types anything about themselves. Adapted, not word for word;
// non-breaking spaces before ? ! : ; and inside « ». Not reviewed by a
// native-speaking editor or a teacher.

const DEMO = 'C’est un personnage inventé avec des informations inventées — juste pour l’activité.';
const P = (text, needed, why) => ({ text, needed, why });

const TASK = P('Aide-moi à trouver un nom pour notre équipe de robotique.', true, 'c’est la tâche elle-même — sans elle, l’assistant ne sait pas ce qu’il faut faire');
const ROBOT = P('On construit un robot qui trie les déchets.', true, 'aide à trouver un nom qui colle et ne dit rien sur qui tu es');
const NAME = P('Je m’appelle Hugo Bernard,', false, 'ton prénom et ton nom ne servent à rien pour nommer une équipe');
const SCHOOL = P('je suis à l’école des Tilleuls, rue des Jardins,', false, 'ton école et ta rue montrent où te trouver et ne servent pas à la tâche');
const PHONE = P('mon numéro est le 00 00 00 00 00,', false, 'un numéro de téléphone ne sert jamais à trouver un nom');
const CLUB = P('tous les samedis à 10 h je vais au club d’échecs près du parc,', false, 'ton emploi du temps et le lieu montrent où et quand on peut te trouver');
const TEAM = P('On est quatre dans l’équipe.', true, 'le nombre de membres ne révèle rien et peut aider à trouver le nom');

const redact = (pieces, extra = {}) => ({
  q: 'Touche les morceaux qu’il faut enlever ou remplacer. La tâche doit rester claire.',
  checkBtn: 'Vérifier',
  pieces,
  ok: 'C’est fait : la tâche est toujours là et le superflu a disparu. Voici pourquoi chaque morceau est utile ou non :',
  no: 'Pas encore tout à fait. Regarde l’explication : il reste quelque chose en trop, ou quelque chose d’utile a été enlevé.',
  ...extra,
});

const lea = {
  title: 'Nouvel exemple — à toi de jouer',
  intro: 'Une autre demande. ' + DEMO + ' Indice : les invités ont besoin de l’adresse, l’assistant non — dans le texte, on peut la remplacer par [adresse] et la compléter soi-même.',
  bubble: { who: 'Léa écrit à l’assistant', text: 'Je m’appelle Léa Moreau. Aide-moi à écrire une invitation pour mon anniversaire, samedi à 15 h. Adresse : 7 rue des Pins, appartement 12. Et dis-moi si mon mot de passe de jeu est solide : chaton123 ?' },
  redact: redact([
    P('Je m’appelle Léa Moreau.', false, 'elle peut signer l’invitation elle-même ; l’assistant n’a pas besoin de son nom de famille'),
    P('Aide-moi à écrire une invitation pour mon anniversaire,', true, 'c’est la tâche elle-même — sans elle, l’assistant ne sait pas quoi écrire'),
    P('samedi à 15 h.', true, 'l’heure est utile pour l’invitation et, à elle seule, ne montre pas qui elle est'),
    P('Adresse : 7 rue des Pins, appartement 12.', false, 'remplace-la par [adresse] et complète-la toi-même dans le texte final'),
    P('Mon mot de passe de jeu : chaton123', false, 'un mot de passe ne se donne à personne, même « pour le vérifier » ; tu peux demander ce qui rend un mot de passe solide'),
  ], { result: 'Aide-moi à écrire une invitation pour mon anniversaire, samedi à 15 h, au [adresse]. Et qu’est-ce qui rend un mot de passe solide ?', resultH: 'Demande sans risque :' }),
};

export const fr = {
  common: {
    title: 'Que peut-on partager ?',
    desc: 'Un personnage inventé demande de l’aide à un assistant et en dit trop sur lui-même. L’enfant enlève ou remplace les informations personnelles tout en gardant la tâche, et voit pourquoi chaque morceau est utile ou non.',
    goal: 'Apprendre à ne garder dans une demande que ce dont la tâche a besoin, et à ne pas partager d’informations personnelles.',
    noJs: 'L’activité elle-même a besoin de JavaScript. Sans lui, l’objectif, l’explication et une tâche à imprimer se trouvent ci-dessous.',
    explain1: 'Pour la plupart des tâches, un assistant n’a pas besoin de ton nom, de ton adresse, de ton école, de ton numéro de téléphone ni de ton mot de passe. On peut décrire la tâche sans eux.',
    explain2: 'Parfois, une information est nécessaire au résultat (par exemple l’adresse sur une invitation), mais tu n’as pas à la donner à l’assistant : laisse un blanc et complète-le toi-même.',
    explain3: 'Des informations qui semblent sans danger une par une peuvent, ensemble, montrer qui tu es et où te trouver. Si tu as un doute, demande à un adulte de confiance.',
    doneH: 'Et ensuite ?',
    doneText: 'Avant d’envoyer une demande, demande-toi : de quoi la tâche a-t-elle vraiment besoin ici ? Le reste peut être enlevé ou remplacé.',
    choices: ['Refaire cette activité', 'Activité suivante : « Pourquoi le trieur s’est-il trompé ? »', 'Toutes les leçons'],
    adult: {
      goal: 'L’enfant sépare la tâche des informations personnelles, enlève ou remplace le superflu, et comprend qu’une combinaison de petits détails peut révéler qui est quelqu’un.',
      questions: ['Qu’est-ce qui, dans le message d’Hugo, ne sert pas à trouver un nom ?', 'Pourquoi les invités ont-ils besoin de l’adresse, mais pas l’assistant ?', 'Que feras-tu si tu n’es pas sûr de pouvoir écrire quelque chose ?'],
      misconception: 'Si on ne donne pas son nom, on ne partage rien de personnel. L’école, l’emploi du temps, les lieux et les photos réunis peuvent désigner une personne même sans son nom.',
      signs: ['Enlève le nom, l’école, le numéro de téléphone et le mot de passe, mais garde l’essentiel de la tâche.', 'Propose un remplacement : [adresse], « ma ville » au lieu de la rue.', 'Dit qu’il ou elle demanderait à un adulte en cas de doute.'],
      method: 'Tous les noms, adresses et numéros sont inventés. L’enfant ne tape rien sur lui-même : il ou elle marque seulement des morceaux d’un texte déjà écrit. La vérification compare les marques avec une explication rédigée à l’avance et explique chaque morceau.',
      print: {
        task: 'Souligne ce qui n’est pas utile : « Salut, je suis Chloé Petit, en CE2 B à l’école des Collines. Mon mot de passe est 1234. Aide-moi à inventer une devinette sur un chat. » Réécris la demande pour qu’il ne reste que la tâche.',
        answers: 'Pas utile : prénom et nom, classe et école, mot de passe. Demande sans risque : « Aide-moi à inventer une devinette sur un chat. »',
      },
    },
  },
  tiny: {
    goal: 'Découvrons ce qu’on peut raconter à un assistant et ce qu’il vaut mieux garder pour soi.',
    steps: [
      { title: 'Qu’est-ce qui est en trop ?', intro: 'Un adulte lit à voix haute. ' + DEMO, bubble: { who: 'Hugo écrit à l’assistant', text: 'Je m’appelle Hugo Bernard. Aide-moi à trouver un nom pour mon équipe de robots. Je suis à l’école des Tilleuls.' },
        redact: redact([NAME, P('Aide-moi à trouver un nom pour mon équipe de robots.', true, 'c’est la tâche elle-même — sans elle, l’assistant ne sait pas ce qu’il faut faire'), P('Je suis à l’école des Tilleuls.', false, 'l’école ne sert à rien pour nommer l’équipe')]) },
      { title: 'Si tu n’es pas sûr, que fais-tu ?', questions: [{ q: 'Tu n’es pas sûr de pouvoir écrire quelque chose. Que fais-tu ?', options: ['Je demande à un adulte', 'J’écris tout ce que je sais'], correct: 0, ok: 'Oui ! En cas de doute, demande à un adulte.', noAll: 'Mieux vaut demander d’abord. À qui pourrais-tu demander ?' }] },
      { title: 'Nouvel exemple', intro: DEMO, questions: [{ q: 'Léa veut que l’assistant invente un petit poème. Qu’est-ce qu’elle n’a PAS besoin d’écrire ?', options: ['Son adresse', 'Le sujet du poème'], correct: 0, ok: 'Exact : un poème n’a pas besoin d’adresse.', noAll: 'Le sujet du poème, c’est la tâche elle-même. Alors, qu’est-ce qui est en trop ?' }] },
    ],
  },
  child: {
    goal: 'Enlever les informations personnelles d’une demande tout en gardant la tâche, et expliquer pourquoi chaque morceau est utile ou non.',
    steps: [
      { title: 'Enlève ce qui est en trop', intro: DEMO, bubble: { who: 'Hugo écrit à l’assistant', text: [NAME, SCHOOL, PHONE, TASK, ROBOT].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, PHONE, TASK, ROBOT]) },
      lea,
    ],
  },
  teen: {
    goal: 'Séparer la tâche des informations personnelles et comprendre comment une combinaison de petits détails révèle une personne.',
    steps: [
      { title: 'Enlève ce qui est en trop', intro: DEMO, bubble: { who: 'Hugo écrit à l’assistant', text: [NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM]) },
      { title: 'Détails combinés', questions: [{ q: 'Hugo a enlevé son nom, mais il a gardé « école des Tilleuls, rue des Jardins » et « échecs le samedi à 10 h près du parc ». Pourquoi est-ce encore risqué ?',
        options: ['Ensemble, ces détails indiquent où et quand on peut le trouver, même sans son nom', 'Ce n’est pas risqué : sans nom, personne ne sait qui c’est', 'C’est risqué seulement à cause du mot « échecs »'], correct: 0,
        ok: 'Oui. Un par un, les détails sont sans danger ; ensemble, ils désignent une seule personne.', noAll: 'Réfléchis : combien de garçons de l’école des Tilleuls vont au club d’échecs près du parc le samedi à 10 h ?' }] },
      lea,
    ],
  },
  adult: {
    goal: 'Réduire au minimum les données d’une demande, tenir compte des combinaisons de détails et de qui reçoit la demande.',
    steps: [
      { title: 'Enlève ce qui est en trop', intro: DEMO, bubble: { who: 'Hugo écrit à l’assistant', text: [NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM]) },
      { title: 'Détails combinés, et qui les reçoit', questions: [
        { q: 'Hugo a enlevé son nom, mais il a gardé son école, sa rue et l’horaire de son club. Pourquoi est-ce encore risqué ?',
          options: ['Ensemble, ces détails désignent une seule personne et montrent où et quand la trouver', 'Ce n’est pas risqué : sans nom, personne ne sait qui c’est', 'C’est risqué seulement pour les adultes'], correct: 0,
          ok: 'Oui. On appelle cela la réidentification : on reconnaît une personne grâce à une combinaison de traits.', noAll: 'Pense au nombre de personnes qui correspondent à tout cela à la fois.' },
        { q: 'Une demande à un chatbot est reçue par l’entreprise qui le fait fonctionner. Qu’est-ce que cela implique ?',
          options: ['Écris comme si un inconnu pouvait lire : rien que tu n’afficherais pas sur un panneau public', 'Rien : les discussions avec un bot sont toujours entièrement privées', 'On peut tout écrire si on supprime la discussion ensuite'], correct: 0,
          ok: 'Oui. Chaque service conserve les données selon ses propres règles ; il est plus sûr de ne pas envoyer le superflu dès le départ.', noAll: 'On ne peut pas savoir avec certitude qui voit une demande, ni pendant combien de temps. Alors, comment est-il raisonnable d’écrire ?' },
      ] },
      lea,
    ],
  },
};
