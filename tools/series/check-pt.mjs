// Lesson B, Portuguese (Brazil): "Confira uma resposta confiante". Made-up
// workshop, made-up assistant; every fact the child needs is on the page.
// Adapted, not word for word (prices in reais, times as "15h"). Not reviewed
// by a native-speaking editor or a teacher.

const WHO = 'Assistente (exemplo de treino)';
const SCHEDULE = {
  title: 'Horários da oficina "Engrenagem" (o documento original)',
  rows: [['Para quem', 'crianças de 7 a 12 anos'], ['Robôs', 'segunda-feira, 15h'], ['Desenho', 'quarta-feira, 16h30'], ['Maquetes de papelão', 'sábado, 11h'], ['Duração', 'cada encontro dura 1 hora']],
};
const SCHEDULE2 = {
  title: 'Aviso da oficina "Engrenagem" (o documento original)',
  rows: [['Visita à oficina', 'sábado, 12h'], ['Inscrições', 'na recepção, no térreo']],
  note: 'O aviso não diz nada sobre o preço da visita.',
};
const ANSWER = 'A oficina Engrenagem é para crianças. A turma de robôs se encontra na quarta-feira às 16h30. Cada encontro dura uma hora.';
const SENTENCES = ['A oficina é para crianças.', 'A turma de robôs se encontra na quarta-feira às 16h30.', 'Cada encontro dura uma hora.'];

const findStep = () => ({
  title: 'Encontre a afirmação duvidosa',
  intro: 'Você perguntou ao assistente quando é a turma de robôs. Ele respondeu com muita confiança. Compare a resposta com os horários.',
  doc: SCHEDULE,
  bubble: { who: WHO, text: ANSWER },
  questions: [
    { q: 'Qual afirmação do assistente não bate com os horários?', options: SENTENCES, correct: 1,
      ok: 'Isso. Quarta-feira às 16h30 é desenho; robôs é na segunda-feira às 15h. O assistente trocou as linhas.',
      noAll: 'Esta afirmação bate com os horários. Encontre a linha dos robôs e compare.' },
  ],
});

const fixStep = {
  title: 'Corrija a resposta e explique por quê',
  doc: SCHEDULE,
  questions: [
    { q: 'O que está certo?', options: ['A turma de robôs é na segunda-feira às 15h.', 'A turma de robôs é na quarta-feira às 16h30.', 'A turma de robôs é no sábado às 11h.'], correct: 0,
      ok: 'Certo: é isso que dizem os horários.', noAll: 'Olhe a linha "Robôs" dos horários.' },
    { q: 'Em que se apoia a sua correção?', options: ['Está escrito no documento original — os horários da oficina', 'O assistente respondeu com muita confiança', 'Parece mais certo'], correct: 0,
      ok: 'Isso. O motivo é o documento sobre o qual é a pergunta. Um tom confiante não prova nada.',
      noAll: 'Tom confiante e "parece certo" não são provas. Em que você pode se apoiar?' },
  ],
};

const unknownStep = {
  title: 'Exemplo novo — sua vez',
  intro: 'Você perguntou de novo: quanto custa a visita?',
  doc: SCHEDULE2,
  bubble: { who: WHO, text: 'A visita à oficina no sábado às 12h custa R$ 20.' },
  questions: [
    { q: 'É verdade que a visita custa R$ 20?', options: ['Sim, é verdade', 'Não, é falso', 'Ainda não dá para saber'], correct: 2,
      ok: 'Certo. O aviso dá o horário da visita, mas não o preço. O assistente só podia ter chutado "R$ 20" — e o documento não confirma isso.',
      no: { 0: 'O documento não tem preço — nada confirma "R$ 20".', 1: 'Também não dá para dizer "falso": o documento não tem preço nenhum. O que falta para decidir?' } },
    { q: 'Como descobrir o preço?', options: ['Perguntar na recepção da oficina, como diz o aviso', 'Perguntar de novo ao assistente até ele dar a mesma resposta', 'Acreditar, já que o assistente deu um valor exato'], correct: 0,
      ok: 'Isso. Você precisa de uma fonte que seja responsável por essa informação.',
      noAll: 'Uma resposta repetida ou exata do assistente continua sem conferência. Quem sabe de verdade o preço?' },
  ],
};

const twoSources = {
  title: 'Compare duas fontes',
  intro: 'Pergunta: em que ano a oficina Engrenagem abriu? O assistente respondeu: "Em 2022 — vários sites dizem isso." Veja o que você encontrou.',
  sources: [
    { name: 'Fonte A: site da oficina, página "Quem somos"', origin: 'a própria oficina', date: 'página atualizada em 2026', says: '"A oficina abriu em 2019"' },
    { name: 'Fonte B: post em um fórum', origin: 'usuário sem nome', date: 'sem data', says: '"Abriram faz pouco tempo, acho que em 2022"' },
  ],
  questions: [
    { q: 'Qual fonte é melhor para responder a esta pergunta?', options: ['A: foi escrita pela própria oficina e tem data', 'B: diz "2022", como o assistente', 'As duas igualmente: ambas dão um ano'], correct: 0,
      ok: 'Isso. Veja quem escreveu (origem), quando (data) e se trata diretamente da pergunta.',
      noAll: 'Concordar com o assistente e o número de sites parecidos não provam nada. Quem sabe melhor o ano de abertura?' },
  ],
};

const teenWhy = {
  q: '"Vários sites dizem isso" — por que esse é um motivo fraco?',
  options: ['Os sites podem copiar o mesmo erro uns dos outros', 'É um motivo forte: se muitos dizem, deve ser verdade', 'Nunca existem muitos sites'], correct: 0,
  ok: 'Certo. Dez cópias de um erro continuam sendo um erro. O que importa é de onde veio a informação.',
  noAll: 'Pense em onde os sites conseguem as informações e se eles podem repetir uns aos outros.',
};
const adultStakes = {
  q: 'Até a fonte A pode errar. O que fazer se uma decisão importante depende do ano (por exemplo, a inscrição em uma competição)?',
  options: ['Conferir de outro jeito independente: por exemplo, pedir um documento ou ligar para a oficina', 'Nada: site oficial nunca erra', 'Usar o ano que o assistente deu'], correct: 0,
  ok: 'Isso. Quanto mais importante a decisão, mais confirmação independente ela pede.',
  noAll: 'Uma fonte oficial é mais confiável, mas não infalível. Como confirmar um fato importante?',
};

export const pt = {
  common: {
    title: 'Confira uma resposta confiante',
    desc: 'Um assistente de treino reconta com confiança uns horários, mas com um erro. A criança encontra a afirmação duvidosa, compara com o documento, corrige e explica o motivo; depois vem um caso em que falta informação.',
    goal: 'Aprender a comparar uma resposta confiante com o documento original e a dizer "ainda não dá para saber" quando a informação não está lá.',
    noJs: 'A atividade em si precisa de JavaScript. Sem ele, abaixo estão o objetivo, a explicação e uma tarefa para imprimir.',
    explain1: 'Um assistente pode responder com confiança e mesmo assim errar: ele trocou linhas dos horários. Conferir é comparar com a fonte sobre a qual é a pergunta.',
    explain2: 'Se a fonte não tem a informação, a resposta honesta é "ainda não dá para saber". Um número exato na resposta não quer dizer que ela foi conferida.',
    explain3: 'Tom confiante, repetição e quantidade de links não provam a verdade. Veja quem escreveu, quando e se é sobre a pergunta.',
    doneH: 'E agora?',
    doneText: 'Uma resposta confiante ainda não é uma resposta conferida. Conferir é se apoiar em uma fonte — e, quando falta informação, dizer isso.',
    choices: ['Fazer esta atividade de novo', 'Próxima atividade: "O que dá para compartilhar?"', 'Todas as lições'],
    adult: {
      goal: 'A criança compara afirmações com a fonte original, distingue "falso" de "ainda não dá para saber" e não toma a confiança ou o número de links como prova.',
      questions: ['Como você percebeu que o assistente errou?', 'Qual é a diferença entre "falso" e "ainda não dá para saber"?', 'A quem você perguntaria se o documento não tiver a resposta?'],
      misconception: 'Se a resposta soa confiante e tem números exatos, está certa. Uma formulação precisa não significa que a informação foi conferida.',
      signs: ['Aponta a linha do documento em que se apoia.', 'Diz "ainda não dá para saber" quando falta informação e diz onde procurar.', 'Ao comparar fontes, olha a origem e a data, não se a fonte concorda com a resposta.'],
      method: 'Todos os textos do assistente foram escritos antes — não é um chat ao vivo nem um pedido a uma rede neural. A oficina e os horários são inventados para que a resposta possa ser conferida na própria página.',
      print: {
        task: 'Horários: "Robôs — seg 15h; Desenho — qua 16h30". O assistente disse: "Robôs é na quarta". 1) Encontre o erro. 2) Corrija. 3) O assistente disse: "Cada encontro custa R$ 20". Dá para conferir isso nos horários?',
        answers: '1) O dia e o horário foram trocados. 2) Robôs é na segunda-feira às 15h. 3) Não: os horários não têm preço — ainda não dá para saber; pergunte à oficina.',
      },
    },
  },
  tiny: {
    goal: 'Vamos conferir nos horários se o assistente disse a verdade.',
    steps: [
      { title: 'Compare com os horários', intro: 'Um adulto lê em voz alta. O assistente disse: "A turma de robôs é na quarta-feira." Olhem os horários juntos.', doc: SCHEDULE,
        questions: [{ q: 'Robôs é na quarta-feira?', options: ['Sim', 'Não'], correct: 1, ok: 'Certo: nos horários, robôs é na segunda-feira. O assistente errou.', noAll: 'Procurem juntos a linha "Robôs". Que dia está escrito?' }] },
      { title: 'Por que você acha isso?', questions: [{ q: 'Como você sabe?', options: ['Olhei os horários', 'O assistente parecia ter certeza'], correct: 0, ok: 'Isso! Conferimos nos horários.', noAll: 'Uma voz cheia de certeza não é conferência. Onde nós olhamos?' }] },
      { title: 'Exemplo novo', intro: 'O assistente disse: "A visita custa R$ 20." O aviso só dá o horário.', doc: SCHEDULE2,
        questions: [{ q: 'A gente sabe o preço?', options: ['Sim, R$ 20', 'Ainda não — precisamos perguntar a um adulto ou na recepção'], correct: 1, ok: 'Certo: o aviso não tem preço. Quando não sabemos, dizemos isso — e perguntamos.', noAll: 'Olhe o aviso: tem preço?' }] },
    ],
  },
  child: {
    goal: 'Encontrar o erro em uma resposta confiante, corrigi-lo com o documento e distinguir "falso" de "ainda não dá para saber".',
    steps: [findStep(), fixStep, unknownStep],
  },
  teen: {
    goal: 'Comparar afirmações com o documento, distinguir "falso" de "ainda não dá para saber" e comparar fontes por origem e data.',
    steps: [findStep(), fixStep, unknownStep, { ...twoSources, questions: [...twoSources.questions, teenWhy] }],
  },
  adult: {
    goal: 'Conferir afirmações na fonte original, pesar origem, data e relevância e ajustar o tanto de conferência à importância da decisão.',
    steps: [findStep(), fixStep, unknownStep, { ...twoSources, questions: [...twoSources.questions, teenWhy, adultStakes] }],
  },
};
