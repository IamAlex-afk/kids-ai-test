// Lesson C, Portuguese (Brazil): "O que dá para compartilhar?". Every name,
// address and number below is made up for the demo (Brazilian names, a phone
// of zeros); the child never types anything about themselves. Adapted, not
// word for word. Not reviewed by a native-speaking editor or a teacher.

const DEMO = 'Este é um personagem fictício com dados fictícios — só para a atividade.';
const P = (text, needed, why) => ({ text, needed, why });

const TASK = P('Me ajuda a pensar num nome para a nossa equipe de robótica.', true, 'esta é a própria tarefa — sem ela o assistente não sabe o que é preciso');
const ROBOT = P('Estamos montando um robô que separa o lixo.', true, 'ajuda a achar um nome que combine e não diz nada sobre quem você é');
const NAME = P('Eu sou o Lucas Oliveira,', false, 'nome e sobrenome não são necessários para dar nome a uma equipe');
const SCHOOL = P('estudo na Escola Sol Nascente, na Rua das Flores,', false, 'a escola e a rua mostram onde encontrar você e não são necessárias para a tarefa');
const PHONE = P('meu celular é (00) 00000-0000,', false, 'número de telefone nunca é necessário para pensar num nome');
const CLUB = P('todo sábado às 10h vou ao clube de xadrez perto da praça,', false, 'a sua rotina e o lugar mostram onde e quando dá para encontrar você');
const TEAM = P('Somos quatro na equipe.', true, 'o número de integrantes não revela nada e pode ajudar com o nome');

const redact = (pieces, extra = {}) => ({
  q: 'Toque nos trechos que devem ser tirados ou trocados. A tarefa precisa continuar clara.',
  checkBtn: 'Conferir',
  pieces,
  ok: 'Pronto: a tarefa continua lá e o que sobrava saiu. Veja por que cada trecho é necessário ou não:',
  no: 'Ainda não. Veja a explicação: ficou algo que sobrava, ou saiu algo necessário.',
  ...extra,
});

const laura = {
  title: 'Exemplo novo — resolva sozinho',
  intro: 'Outro pedido. ' + DEMO + ' Dica: os convidados precisam do endereço, o assistente não — no texto dá para trocar por [endereço] e preencher depois.',
  bubble: { who: 'A Laura escreve ao assistente', text: 'Meu nome é Laura Souza. Me ajuda a escrever um convite para o meu aniversário, no sábado às 15h. Endereço: Rua dos Pinheiros, 7, apto 12. E me diz se a senha do meu jogo é forte: gatinho123?' },
  redact: redact([
    P('Meu nome é Laura Souza.', false, 'ela mesma pode assinar o convite; o assistente não precisa do sobrenome'),
    P('Me ajuda a escrever um convite para o meu aniversário,', true, 'esta é a própria tarefa — sem ela o assistente não sabe o que escrever'),
    P('no sábado às 15h.', true, 'o horário é necessário para o convite e, sozinho, não mostra quem ela é'),
    P('Endereço: Rua dos Pinheiros, 7, apto 12.', false, 'troque por [endereço] e preencha você mesma no texto pronto'),
    P('A senha do meu jogo: gatinho123', false, 'senha não se passa para ninguém, nem "para conferir"; dá para perguntar o que faz uma senha ser forte'),
  ], { result: 'Me ajuda a escrever um convite para o meu aniversário, no sábado às 15h, em [endereço]. E o que faz uma senha ser forte?', resultH: 'Pedido seguro:' }),
};

export const pt = {
  common: {
    title: 'O que dá para compartilhar?',
    desc: 'Um personagem fictício pede ajuda a um assistente e conta coisas demais sobre si. A criança tira ou troca os dados pessoais mantendo a tarefa e vê por que cada trecho é necessário ou não.',
    goal: 'Aprender a deixar no pedido só o que a tarefa precisa e a não compartilhar dados pessoais.',
    noJs: 'A atividade em si precisa de JavaScript. Sem ele, abaixo estão o objetivo, a explicação e uma tarefa para imprimir.',
    explain1: 'Para a maioria das tarefas, o assistente não precisa do seu nome, endereço, escola, telefone ou senha. Dá para descrever a tarefa sem eles.',
    explain2: 'Às vezes um dado é necessário para o resultado (por exemplo, o endereço no convite), mas você não precisa passá-lo ao assistente: deixe um espaço e preencha você mesmo.',
    explain3: 'Dados que parecem inofensivos um por um podem, juntos, mostrar quem você é e onde encontrar você. Se tiver dúvida, pergunte a um adulto de confiança.',
    doneH: 'E agora?',
    doneText: 'Antes de enviar um pedido, pergunte a si mesmo: o que aqui a tarefa realmente precisa? O resto dá para tirar ou trocar.',
    choices: ['Fazer esta atividade de novo', 'Próxima atividade: "Por que o classificador errou?"', 'Todas as lições'],
    adult: {
      goal: 'A criança separa a tarefa dos dados pessoais, tira ou troca o que sobra e entende que uma combinação de pequenos detalhes pode revelar quem é a pessoa.',
      questions: ['O que na mensagem do Lucas não é necessário para pensar num nome?', 'Por que os convidados precisam do endereço e o assistente não?', 'O que você vai fazer se não tiver certeza se pode escrever alguma coisa?'],
      misconception: 'Se você não diz seu nome, não compartilha nada pessoal. Escola, rotina, lugares e fotos juntos podem apontar uma pessoa mesmo sem o nome.',
      signs: ['Tira o nome, a escola, o telefone e a senha, mas mantém o essencial da tarefa.', 'Sugere uma troca: [endereço], "minha cidade" em vez da rua.', 'Diz que perguntaria a um adulto na dúvida.'],
      method: 'Todos os nomes, endereços e números são inventados. A criança não digita nada sobre si: só marca trechos de um texto pronto. A conferência compara as marcações com uma explicação escrita antes e explica cada trecho.',
      print: {
        task: 'Sublinhe o que não é necessário: "Oi, eu sou a Beatriz Lima, do 3º ano B da Escola Monte Verde. Minha senha é 1234. Me ajuda a inventar uma adivinha sobre gato." Reescreva o pedido para que fique só a tarefa.',
        answers: 'Não é necessário: nome e sobrenome, turma e escola, senha. Pedido seguro: "Me ajuda a inventar uma adivinha sobre gato."',
      },
    },
  },
  tiny: {
    goal: 'Vamos descobrir o que dá para contar a um assistente e o que é melhor guardar para nós.',
    steps: [
      { title: 'O que não é necessário?', intro: 'Um adulto lê em voz alta. ' + DEMO, bubble: { who: 'O Lucas escreve ao assistente', text: 'Eu sou o Lucas Oliveira. Me ajuda a pensar num nome para a minha equipe de robôs. Eu estudo na Escola Sol Nascente.' },
        redact: redact([NAME, P('Me ajuda a pensar num nome para a minha equipe de robôs.', true, 'esta é a própria tarefa — sem ela o assistente não sabe o que é preciso'), P('Eu estudo na Escola Sol Nascente.', false, 'a escola não é necessária para dar nome à equipe')]) },
      { title: 'Na dúvida, o que fazer?', questions: [{ q: 'Você não tem certeza se pode escrever alguma coisa. O que você faz?', options: ['Pergunto a um adulto', 'Escrevo tudo o que sei'], correct: 0, ok: 'Isso! Na dúvida, pergunte a um adulto.', noAll: 'É melhor perguntar antes. A quem você poderia perguntar?' }] },
      { title: 'Exemplo novo', intro: DEMO, questions: [{ q: 'A Laura quer que o assistente invente um poeminha. O que ela NÃO precisa escrever?', options: ['O endereço dela', 'Sobre o que é o poema'], correct: 0, ok: 'Certo: um poema não precisa de endereço.', noAll: 'Sobre o que é o poema é a própria tarefa. Então o que não é necessário?' }] },
    ],
  },
  child: {
    goal: 'Tirar dados pessoais de um pedido mantendo a tarefa e explicar por que cada trecho é necessário ou não.',
    steps: [
      { title: 'Tire o que não é necessário', intro: DEMO, bubble: { who: 'O Lucas escreve ao assistente', text: [NAME, SCHOOL, PHONE, TASK, ROBOT].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, PHONE, TASK, ROBOT]) },
      laura,
    ],
  },
  teen: {
    goal: 'Separar a tarefa dos dados pessoais e entender como uma combinação de pequenos detalhes revela uma pessoa.',
    steps: [
      { title: 'Tire o que não é necessário', intro: DEMO, bubble: { who: 'O Lucas escreve ao assistente', text: [NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM]) },
      { title: 'Detalhes combinados', questions: [{ q: 'O Lucas tirou o nome, mas deixou "Escola Sol Nascente, na Rua das Flores" e "xadrez aos sábados às 10h perto da praça". Por que isso ainda é arriscado?',
        options: ['Juntos, esses detalhes indicam onde e quando ele pode ser encontrado, mesmo sem o nome', 'Não é arriscado: sem nome ninguém sabe quem é', 'É arriscado só por causa da palavra "xadrez"'], correct: 0,
        ok: 'Isso. Um por um os detalhes são inofensivos; juntos, eles chegam a uma única pessoa.', noAll: 'Pense: quantos meninos da Escola Sol Nascente vão ao clube de xadrez perto da praça aos sábados às 10h?' }] },
      laura,
    ],
  },
  adult: {
    goal: 'Manter os dados de um pedido no mínimo, considerar combinações de detalhes e quem recebe o pedido.',
    steps: [
      { title: 'Tire o que não é necessário', intro: DEMO, bubble: { who: 'O Lucas escreve ao assistente', text: [NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM]) },
      { title: 'Detalhes combinados, e quem os recebe', questions: [
        { q: 'O Lucas tirou o nome, mas deixou a escola, a rua e o horário do clube. Por que isso ainda é arriscado?',
          options: ['Juntos, esses detalhes chegam a uma única pessoa e mostram onde e quando encontrá-lo', 'Não é arriscado: sem nome ninguém sabe quem é', 'É arriscado só para adultos'], correct: 0,
          ok: 'Isso. Isso se chama reidentificação: uma pessoa é reconhecida por uma combinação de características.', noAll: 'Pense em quantas pessoas combinam com tudo isso ao mesmo tempo.' },
        { q: 'Um pedido a um chatbot é recebido pela empresa que o opera. O que isso significa?',
          options: ['Escreva como se um desconhecido pudesse ler: nada que você não colaria num mural público', 'Nada: conversas com um bot são sempre totalmente privadas', 'Dá para escrever qualquer coisa se depois você apagar a conversa'], correct: 0,
          ok: 'Isso. Cada serviço guarda dados com regras diferentes; é mais seguro não enviar o que sobra desde o começo.', noAll: 'Não dá para saber ao certo quem vê um pedido e por quanto tempo. Então como é sensato escrever?' },
      ] },
      laura,
    ],
  },
};
