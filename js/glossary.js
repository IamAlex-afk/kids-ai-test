/* ═══════════════════════════════════════════════════════════════════
   KIDS AI TEST · js/glossary.js
   Tap a highlighted term inside a lesson to get a plain-language
   definition + example, in the current language. Additive only —
   if a term isn't found in the running text nothing is linked, so
   this can never break lesson rendering.
═══════════════════════════════════════════════════════════════════ */
(function () {
  const TERMS = {
    en: [
      { key: 'hallucination', match: 'hallucination', label: 'AI hallucination', def: 'When AI confidently says something that sounds true but isn\'t. It happens because AI predicts likely-sounding words, not verified facts.', example: 'Like a classmate who guesses on a test instead of saying "I don\'t know" — but sounds 100% sure either way.' },
      { key: 'deepfake', match: 'deepfake', label: 'Deepfake', def: 'A fake photo, video, or voice made by AI to look or sound like a real person doing or saying something they never did.', example: 'A video of a celebrity "saying" something they never actually said.' },
      { key: 'neuralnet', match: 'neural network', label: 'Neural network', def: 'A type of AI loosely inspired by how brain cells connect, built from layers of simple math units that learn patterns from examples.', example: 'It doesn\'t "think" like a brain — it adjusts millions of numbers until its guesses get closer to correct.' },
      { key: 'algorithm', match: 'algorithm', label: 'Algorithm', def: 'A step-by-step set of rules a computer follows to solve a problem or make a decision.', example: 'A recipe is an algorithm for cooking — an AI algorithm is a recipe for a decision.' },
      { key: 'chatbot', match: 'chatbot', label: 'Chatbot', def: 'A computer program designed to hold a conversation with you by predicting likely next words, not by understanding like a person does.', example: 'ChatGPT and similar assistants are chatbots.' },
      { key: 'datacenter', match: 'data center', label: 'Data center', def: 'A large building full of powerful computers that actually run AI models — AI is not "in the cloud" in any magical sense.', example: 'Answering your question uses real electricity in a real building somewhere in the world.' },
      { key: 'trainingdata', match: 'training data', label: 'Training data', def: 'The huge collection of text, images, or examples an AI studied to learn its patterns before you ever used it.', example: 'If the training data is unbalanced or unfair, the AI\'s answers can be too.' },
      { key: 'prompt', match: 'prompt', label: 'Prompt', def: 'The question or instruction you type to an AI. What you write shapes the answer you get.', example: 'A specific, clear prompt usually gets a much more useful answer than a vague one.' },
      { key: 'bias', match: 'bias', label: 'AI bias', def: 'When an AI treats some people or groups unfairly because the examples it learned from weren\'t balanced.', example: 'A face-recognition tool trained mostly on light skin tones can be less accurate for dark skin tones.' },
      { key: 'llm', match: 'large language model', label: 'Large language model (LLM)', def: 'A type of AI trained on huge amounts of text to predict the next word — the technology behind chatbots like ChatGPT.', example: 'It\'s called "large" because it learned from an enormous amount of text and has billions of internal settings.' },
    ],
    ru: [
      { key: 'hallucination', match: 'галлюцинаци', label: 'Галлюцинация ИИ', def: 'Когда ИИ уверенно говорит то, что звучит правдоподобно, но на самом деле неверно. Это происходит, потому что ИИ предсказывает правдоподобные слова, а не проверенные факты.', example: 'Как одноклассник, который угадывает ответ на контрольной, вместо того чтобы сказать «я не знаю» — но звучит при этом очень уверенно.' },
      { key: 'deepfake', match: 'дипфейк', label: 'Дипфейк', def: 'Поддельное фото, видео или голос, сделанные ИИ так, чтобы выглядеть или звучать как настоящий человек, делающий или говорящий то, чего он никогда не делал.', example: 'Видео, где знаменитость «говорит» то, чего она на самом деле никогда не говорила.' },
      { key: 'neuralnet', match: 'нейросет', label: 'Нейросеть', def: 'Тип ИИ, вдохновлённый тем, как связаны клетки мозга, — она состоит из слоёв простых математических элементов, которые учатся на примерах.', example: 'Она не «думает» как мозг — она подстраивает миллионы чисел, пока её ответы не становятся точнее.' },
      { key: 'algorithm', match: 'алгоритм', label: 'Алгоритм', def: 'Пошаговый набор правил, по которым компьютер решает задачу или принимает решение.', example: 'Рецепт — это алгоритм для готовки; алгоритм ИИ — это рецепт для решения.' },
      { key: 'chatbot', match: 'чат-бот', label: 'Чат-бот', def: 'Программа, созданная для общения с тобой — она предсказывает вероятные слова, а не понимает тебя как человек.', example: 'ChatGPT и похожие помощники — это чат-боты.' },
      { key: 'datacenter', match: 'дата-центр', label: 'Дата-центр', def: 'Огромное здание, полное мощных компьютеров, которые и запускают модели ИИ — ИИ не живёт в «облаке» в магическом смысле.', example: 'Ответ на твой вопрос тратит настоящее электричество в настоящем здании где-то в мире.' },
      { key: 'trainingdata', match: 'обучающих данных', label: 'Обучающие данные', def: 'Огромный набор текстов, картинок или примеров, на которых ИИ учился, прежде чем ты им воспользовался.', example: 'Если обучающие данные несбалансированы, ответы ИИ тоже могут быть несправедливыми.' },
      { key: 'prompt', match: 'промпт', label: 'Промпт', def: 'Вопрос или инструкция, которую ты пишешь ИИ. То, как ты спрашиваешь, влияет на то, какой ответ ты получишь.', example: 'Конкретный, чёткий промпт обычно даёт гораздо более полезный ответ, чем расплывчатый.' },
      { key: 'bias', match: 'предвзят', label: 'Предвзятость ИИ', def: 'Когда ИИ относится к некоторым людям или группам несправедливо, потому что примеры, на которых он учился, были несбалансированы.', example: 'Система распознавания лиц, обученная главным образом на светлой коже, может хуже работать с тёмной.' },
      { key: 'llm', match: 'языковая модел', label: 'Большая языковая модель (LLM)', def: 'Тип ИИ, обученный на огромном количестве текста, чтобы предсказывать следующее слово — технология за чат-ботами вроде ChatGPT.', example: 'Её называют «большой», потому что она училась на огромном объёме текста и имеет миллиарды внутренних настроек.' },
    ],
    de: [
      { key: "hallucination", match: "halluzination", label: "KI-Halluzination", def: "Wenn KI mit Überzeugung etwas sagt, das plausibel klingt, aber nicht stimmt. Das passiert, weil KI wahrscheinlich klingende Wörter vorhersagt, keine geprüften Fakten.", example: "Wie ein Mitschüler, der bei einem Test rät, statt 'ich weiß es nicht' zu sagen — aber dabei zu 100% sicher klingt." },
      { key: "deepfake", match: "deepfake", label: "Deepfake", def: "Ein gefälschtes Foto, Video oder eine gefälschte Stimme, von KI erzeugt, um wie eine echte Person auszusehen oder zu klingen, die etwas nie getan hat.", example: "Ein Video, in dem ein Star etwas 'sagt', das er nie wirklich gesagt hat." },
      { key: "neuralnet", match: "neuronale", label: "Neuronales Netz", def: "Eine Art KI, lose inspiriert davon, wie Gehirnzellen verbunden sind — aufgebaut aus Schichten einfacher mathematischer Einheiten, die Muster aus Beispielen lernen.", example: "Es 'denkt' nicht wie ein Gehirn — es passt Millionen Zahlen an, bis seine Vermutungen näher an richtig liegen." },
      { key: "algorithm", match: "algorithmus", label: "Algorithmus", def: "Eine Schritt-für-Schritt-Regelfolge, der ein Computer folgt, um ein Problem zu lösen oder eine Entscheidung zu treffen.", example: "Ein Rezept ist ein Algorithmus zum Kochen — ein KI-Algorithmus ist ein Rezept für eine Entscheidung." },
      { key: "chatbot", match: "chatbot", label: "Chatbot", def: "Ein Computerprogramm, das eine Unterhaltung mit dir führt, indem es wahrscheinliche nächste Wörter vorhersagt — nicht, indem es wie ein Mensch versteht.", example: "ChatGPT und ähnliche Assistenten sind Chatbots." },
      { key: "datacenter", match: "rechenzentrum", label: "Rechenzentrum", def: "Ein großes Gebäude voller leistungsstarker Computer, die KI-Modelle tatsächlich betreiben — KI ist nicht in einem magischen Sinn 'in der Cloud'.", example: "Die Beantwortung deiner Frage verbraucht echten Strom in einem echten Gebäude irgendwo auf der Welt." },
      { key: "trainingdata", match: "trainingsdaten", label: "Trainingsdaten", def: "Die riesige Sammlung von Texten, Bildern oder Beispielen, die eine KI studiert hat, um ihre Muster zu lernen, bevor du sie je benutzt hast.", example: "Sind die Trainingsdaten unausgewogen oder unfair, können es die Antworten der KI auch sein." },
      { key: "prompt", match: "prompt", label: "Prompt", def: "Die Frage oder Anweisung, die du einer KI eingibst. Was du schreibst, formt die Antwort, die du bekommst.", example: "Ein konkreter, klarer Prompt bekommt meist eine viel nützlichere Antwort als ein vager." },
      { key: "bias", match: "voreingenommen", label: "KI-Verzerrung (Bias)", def: "Wenn eine KI manche Menschen oder Gruppen unfair behandelt, weil die Beispiele, aus denen sie gelernt hat, nicht ausgewogen waren.", example: "Ein Gesichtserkennungstool, das hauptsächlich mit hellen Hauttönen trainiert wurde, kann bei dunkleren Hauttönen weniger genau sein." },
      { key: "llm", match: "sprachmodell", label: "Großes Sprachmodell (LLM)", def: "Eine Art KI, trainiert auf riesigen Textmengen, um das nächste Wort vorherzusagen — die Technologie hinter Chatbots wie ChatGPT.", example: "Es heißt 'groß', weil es aus einer enormen Textmenge gelernt hat und Milliarden interner Einstellungen hat." },
    ],
    es: [
      { key: "hallucination", match: "alucinaci", label: "Alucinación de la IA", def: "Cuando la IA dice con confianza algo que suena cierto pero no lo es. Ocurre porque la IA predice palabras que suenan probables, no hechos verificados.", example: "Como un compañero de clase que adivina en un examen en lugar de decir 'no lo sé' — pero suena 100% seguro de todos modos." },
      { key: "deepfake", match: "deepfake", label: "Deepfake", def: "Una foto, video o voz falsa creada por IA para parecer o sonar como una persona real haciendo o diciendo algo que nunca hizo.", example: "Un video de una celebridad 'diciendo' algo que en realidad nunca dijo." },
      { key: "neuralnet", match: "red neuronal", label: "Red neuronal", def: "Un tipo de IA vagamente inspirado en cómo se conectan las células cerebrales, construida con capas de unidades matemáticas simples que aprenden patrones a partir de ejemplos.", example: "No 'piensa' como un cerebro — ajusta millones de números hasta que sus suposiciones se acercan a lo correcto." },
      { key: "algorithm", match: "algoritmo", label: "Algoritmo", def: "Un conjunto de reglas paso a paso que sigue una computadora para resolver un problema o tomar una decisión.", example: "Una receta es un algoritmo para cocinar — un algoritmo de IA es una receta para una decisión." },
      { key: "chatbot", match: "chatbot", label: "Chatbot", def: "Un programa de computadora diseñado para mantener una conversación contigo prediciendo palabras probables, no entendiendo como lo haría una persona.", example: "ChatGPT y asistentes similares son chatbots." },
      { key: "datacenter", match: "centro de datos", label: "Centro de datos", def: "Un edificio grande lleno de computadoras potentes que realmente ejecutan los modelos de IA — la IA no está 'en la nube' en ningún sentido mágico.", example: "Responder tu pregunta consume electricidad real en un edificio real en algún lugar del mundo." },
      { key: "trainingdata", match: "datos de entrenamiento", label: "Datos de entrenamiento", def: "La enorme colección de textos, imágenes o ejemplos que una IA estudió para aprender sus patrones antes de que tú la usaras.", example: "Si los datos de entrenamiento están desequilibrados o son injustos, las respuestas de la IA también pueden serlo." },
      { key: "prompt", match: "prompt", label: "Prompt (instrucción)", def: "La pregunta o instrucción que le escribes a una IA. Lo que escribes moldea la respuesta que obtienes.", example: "Un prompt específico y claro suele obtener una respuesta mucho más útil que uno vago." },
      { key: "bias", match: "sesgo", label: "Sesgo de la IA", def: "Cuando una IA trata injustamente a algunas personas o grupos porque los ejemplos con los que aprendió no estaban equilibrados.", example: "Una herramienta de reconocimiento facial entrenada principalmente con tonos de piel claros puede ser menos precisa con tonos de piel oscuros." },
      { key: "llm", match: "modelo de lenguaje", label: "Modelo de lenguaje grande (LLM)", def: "Un tipo de IA entrenado con enormes cantidades de texto para predecir la siguiente palabra — la tecnología detrás de chatbots como ChatGPT.", example: "Se llama 'grande' porque aprendió de una cantidad enorme de texto y tiene miles de millones de parámetros internos." },
    ],
    fr: [
      { key: "hallucination", match: "hallucination", label: "Hallucination de l'IA", def: "Quand l'IA affirme avec assurance quelque chose qui semble vrai mais ne l'est pas. Cela arrive parce que l'IA prédit des mots qui semblent plausibles, pas des faits vérifiés.", example: "Comme un camarade de classe qui devine à un contrôle au lieu de dire « je ne sais pas » — mais qui a l'air sûr à 100 % quand même." },
      { key: "deepfake", match: "deepfake", label: "Deepfake", def: "Une fausse photo, vidéo ou voix créée par IA pour ressembler ou sonner comme une vraie personne disant ou faisant quelque chose qu'elle n'a jamais fait.", example: "Une vidéo d'une célébrité « disant » quelque chose qu'elle n'a en réalité jamais dit." },
      { key: "neuralnet", match: "réseau de neurones", label: "Réseau de neurones", def: "Un type d'IA vaguement inspiré de la façon dont les cellules du cerveau sont connectées, construit à partir de couches d'unités mathématiques simples qui apprennent des motifs à partir d'exemples.", example: "Il ne « pense » pas comme un cerveau — il ajuste des millions de nombres jusqu'à ce que ses suppositions se rapprochent de la bonne réponse." },
      { key: "algorithm", match: "algorithme", label: "Algorithme", def: "Un ensemble de règles étape par étape qu'un ordinateur suit pour résoudre un problème ou prendre une décision.", example: "Une recette est un algorithme pour cuisiner — un algorithme d'IA est une recette pour une décision." },
      { key: "chatbot", match: "chatbot", label: "Chatbot", def: "Un programme informatique conçu pour tenir une conversation avec toi en prédisant les mots probables suivants, pas en comprenant comme une personne.", example: "ChatGPT et les assistants similaires sont des chatbots." },
      { key: "datacenter", match: "centre de données", label: "Centre de données", def: "Un grand bâtiment rempli d'ordinateurs puissants qui font vraiment tourner les modèles d'IA — l'IA n'est pas « dans le cloud » au sens magique du terme.", example: "Répondre à ta question consomme de l'électricité réelle dans un vrai bâtiment quelque part dans le monde." },
      { key: "trainingdata", match: "données d'entraînement", label: "Données d'entraînement", def: "L'immense collection de textes, d'images ou d'exemples qu'une IA a étudiés pour apprendre ses schémas avant que tu ne l'utilises.", example: "Si les données d'entraînement sont déséquilibrées ou injustes, les réponses de l'IA peuvent l'être aussi." },
      { key: "prompt", match: "prompt", label: "Prompt (instruction)", def: "La question ou l'instruction que tu tapes à une IA. Ce que tu écris façonne la réponse que tu obtiens.", example: "Un prompt précis et clair obtient généralement une réponse bien plus utile qu'un prompt vague." },
      { key: "bias", match: "biais", label: "Biais de l'IA", def: "Quand une IA traite certaines personnes ou certains groupes injustement parce que les exemples dont elle a appris n'étaient pas équilibrés.", example: "Un outil de reconnaissance faciale entraîné surtout sur des teints clairs peut être moins précis pour les teints plus foncés." },
      { key: "llm", match: "modèle de langage", label: "Grand modèle de langage (LLM)", def: "Un type d'IA entraîné sur d'énormes quantités de texte pour prédire le mot suivant — la technologie derrière les chatbots comme ChatGPT.", example: "On l'appelle « grand » parce qu'il a appris à partir d'une quantité énorme de texte et possède des milliards de paramètres internes." },
    ],
    pt: [
      { key: "hallucination", match: "alucinaç", label: "Alucinação da IA", def: "Quando a IA diz com confiança algo que soa verdadeiro mas não é. Isso acontece porque a IA prevê palavras que soam prováveis, não fatos verificados.", example: "Como um colega de turma que chuta numa prova em vez de dizer 'não sei' — mas soa 100% confiante mesmo assim." },
      { key: "deepfake", match: "deepfake", label: "Deepfake", def: "Uma foto, vídeo ou voz falsa criada por IA para parecer ou soar como uma pessoa real fazendo ou dizendo algo que ela nunca fez.", example: "Um vídeo de uma celebridade 'dizendo' algo que ela nunca disse de verdade." },
      { key: "neuralnet", match: "rede neural", label: "Rede neural", def: "Um tipo de IA vagamente inspirado em como as células do cérebro se conectam, construída a partir de camadas de unidades matemáticas simples que aprendem padrões a partir de exemplos.", example: "Ela não 'pensa' como um cérebro — ajusta milhões de números até que seus palpites cheguem mais perto do certo." },
      { key: "algorithm", match: "algoritmo", label: "Algoritmo", def: "Um conjunto de regras passo a passo que um computador segue para resolver um problema ou tomar uma decisão.", example: "Uma receita é um algoritmo para cozinhar — um algoritmo de IA é uma receita para uma decisão." },
      { key: "chatbot", match: "chatbot", label: "Chatbot", def: "Um programa de computador feito para manter uma conversa com você prevendo as próximas palavras prováveis, não entendendo como uma pessoa entende.", example: "ChatGPT e assistentes parecidos são chatbots." },
      { key: "datacenter", match: "centro de dados", label: "Centro de dados (data center)", def: "Um prédio grande cheio de computadores potentes que realmente rodam os modelos de IA — a IA não está 'na nuvem' em nenhum sentido mágico.", example: "Responder sua pergunta gasta eletricidade de verdade em um prédio de verdade em algum lugar do mundo." },
      { key: "trainingdata", match: "dados de treinamento", label: "Dados de treinamento", def: "A enorme coleção de textos, imagens ou exemplos que uma IA estudou para aprender seus padrões antes de você usá-la.", example: "Se os dados de treinamento forem desequilibrados ou injustos, as respostas da IA também podem ser." },
      { key: "prompt", match: "prompt", label: "Prompt (instrução)", def: "A pergunta ou instrução que você digita para uma IA. O que você escreve molda a resposta que você recebe.", example: "Um prompt específico e claro geralmente recebe uma resposta bem mais útil do que um vago." },
      { key: "bias", match: "viés", label: "Viés da IA (bias)", def: "Quando uma IA trata algumas pessoas ou grupos de forma injusta porque os exemplos com que ela aprendeu não eram equilibrados.", example: "Uma ferramenta de reconhecimento facial treinada principalmente com tons de pele claros pode ser menos precisa para tons de pele escuros." },
      { key: "llm", match: "modelo de linguagem", label: "Modelo de linguagem grande (LLM)", def: "Um tipo de IA treinado com quantidades enormes de texto para prever a próxima palavra — a tecnologia por trás de chatbots como o ChatGPT.", example: "É chamado de 'grande' porque aprendeu com uma quantidade enorme de texto e tem bilhões de parâmetros internos." },
    ],
    tr: [
      { key: "hallucination", match: "halüsinasyon", label: "AI halüsinasyonu", def: "AI'nin gerçek gibi görünen ama doğru olmayan bir şeyi kendinden emin şekilde söylemesi. Bu, AI'nin doğrulanmış gerçekleri değil, olası görünen kelimeleri tahmin etmesinden kaynaklanır.", example: "Sınavda 'bilmiyorum' demek yerine tahmin yürüten ama yine de %100 emin görünen bir sınıf arkadaşı gibi." },
      { key: "deepfake", match: "deepfake", label: "Deepfake", def: "Gerçek bir kişinin hiç yapmadığı veya söylemediği bir şeyi yapıyor ya da söylüyor gibi görünmesi veya duyulması için AI tarafından oluşturulmuş sahte bir fotoğraf, video veya ses.", example: "Bir ünlünün gerçekte hiç söylemediği bir şeyi 'söylediği' bir video." },
      { key: "neuralnet", match: "sinir ağı", label: "Sinir ağı (neural network)", def: "Beyin hücrelerinin nasıl bağlandığından gevşek şekilde ilham alan, örneklerden desen öğrenen basit matematiksel birimlerin katmanlarından oluşan bir AI türü.", example: "Bir beyin gibi 'düşünmez' — tahminleri doğruya yaklaşana kadar milyonlarca sayıyı ayarlar." },
      { key: "algorithm", match: "algoritma", label: "Algoritma", def: "Bir bilgisayarın bir sorunu çözmek veya karar vermek için izlediği adım adım kurallar bütünü.", example: "Tarif, yemek pişirmek için bir algoritmadır — AI algoritması bir karar için tariftir." },
      { key: "chatbot", match: "sohbet botu", label: "Sohbet botu (chatbot)", def: "Bir insan gibi anlayarak değil, olası bir sonraki kelimeleri tahmin ederek seninle sohbet etmek için tasarlanmış bir bilgisayar programı.", example: "ChatGPT ve benzeri asistanlar sohbet botlarıdır." },
      { key: "datacenter", match: "veri merkezi", label: "Veri merkezi", def: "AI modellerini gerçekten çalıştıran güçlü bilgisayarlarla dolu büyük bir bina — AI, büyülü bir anlamda 'bulutta' değildir.", example: "Sorunu cevaplamak, dünyanın bir yerindeki gerçek bir binada gerçek elektrik harcar." },
      { key: "trainingdata", match: "eğitim verisi", label: "Eğitim verisi", def: "Bir AI'nin sen onu kullanmadan önce desenlerini öğrenmek için incelediği devasa metin, görüntü veya örnek koleksiyonu.", example: "Eğitim verisi dengesiz veya adaletsizse, AI'nin cevapları da öyle olabilir." },
      { key: "prompt", match: "prompt", label: "Prompt (komut)", def: "Bir AI'ye yazdığın soru veya talimat. Ne yazdığın, alacağın cevabı şekillendirir.", example: "Spesifik, net bir prompt genellikle belirsiz bir promptan çok daha faydalı bir cevap alır." },
      { key: "bias", match: "önyargı", label: "AI önyargısı (bias)", def: "Bir AI'nin bazı insanlara veya gruplara haksız davranması, çünkü öğrendiği örnekler dengeli değildi.", example: "Çoğunlukla açık ten tonlarıyla eğitilmiş bir yüz tanıma aracı, koyu ten tonlarında daha az doğru olabilir." },
      { key: "llm", match: "dil modeli", label: "Büyük dil modeli (LLM)", def: "Bir sonraki kelimeyi tahmin etmek için devasa miktarda metinle eğitilmiş bir AI türü — ChatGPT gibi sohbet botlarının arkasındaki teknoloji.", example: "'Büyük' denmesinin nedeni, muazzam miktarda metinden öğrenmiş olması ve milyarlarca dahili ayara sahip olmasıdır." },
    ],
    vi: [
      { key: "hallucination", match: "ảo giác", label: "Ảo giác AI (hallucination)", def: "Khi AI tự tin nói điều gì đó nghe có vẻ đúng nhưng thực ra không đúng. Điều này xảy ra vì AI dự đoán những từ nghe có vẻ hợp lý, không phải sự thật đã kiểm chứng.", example: "Giống như một bạn cùng lớp đoán bừa trong bài kiểm tra thay vì nói 'em không biết' — nhưng vẫn tỏ ra tự tin 100%." },
      { key: "deepfake", match: "deepfake", label: "Deepfake", def: "Ảnh, video hoặc giọng nói giả do AI tạo ra để trông hoặc nghe giống một người thật đang làm hoặc nói điều họ chưa từng làm.", example: "Một video trong đó một người nổi tiếng 'nói' điều mà họ chưa bao giờ thực sự nói." },
      { key: "neuralnet", match: "mạng nơ-ron", label: "Mạng nơ-ron (neural network)", def: "Một loại AI được lấy cảm hứng lỏng lẻo từ cách các tế bào não kết nối, được xây dựng từ các lớp đơn vị toán học đơn giản học các khuôn mẫu từ ví dụ.", example: "Nó không 'suy nghĩ' như một bộ não — nó điều chỉnh hàng triệu con số cho đến khi các dự đoán của nó gần đúng hơn." },
      { key: "algorithm", match: "thuật toán", label: "Thuật toán", def: "Một tập hợp quy tắc từng bước mà máy tính làm theo để giải quyết vấn đề hoặc đưa ra quyết định.", example: "Công thức nấu ăn là một thuật toán để nấu ăn — thuật toán AI là công thức cho một quyết định." },
      { key: "chatbot", match: "chatbot", label: "Chatbot", def: "Một chương trình máy tính được thiết kế để trò chuyện với bạn bằng cách dự đoán từ tiếp theo có khả năng xảy ra, không phải bằng cách hiểu như con người.", example: "ChatGPT và các trợ lý tương tự là chatbot." },
      { key: "datacenter", match: "trung tâm dữ liệu", label: "Trung tâm dữ liệu", def: "Một tòa nhà lớn đầy máy tính mạnh mẽ thực sự chạy các mô hình AI — AI không nằm 'trên đám mây' theo nghĩa kỳ diệu nào cả.", example: "Trả lời câu hỏi của bạn tiêu tốn điện thật ở một tòa nhà thật đâu đó trên thế giới." },
      { key: "trainingdata", match: "dữ liệu huấn luyện", label: "Dữ liệu huấn luyện", def: "Bộ sưu tập khổng lồ văn bản, hình ảnh hoặc ví dụ mà một AI đã nghiên cứu để học các khuôn mẫu của nó trước khi bạn từng sử dụng nó.", example: "Nếu dữ liệu huấn luyện không cân bằng hoặc không công bằng, câu trả lời của AI cũng có thể như vậy." },
      { key: "prompt", match: "prompt", label: "Prompt (câu lệnh)", def: "Câu hỏi hoặc chỉ dẫn mà bạn gõ cho AI. Những gì bạn viết định hình câu trả lời bạn nhận được.", example: "Một prompt cụ thể, rõ ràng thường nhận được câu trả lời hữu ích hơn nhiều so với một prompt mơ hồ." },
      { key: "bias", match: "thiên kiến", label: "Thiên kiến AI (bias)", def: "Khi một AI đối xử không công bằng với một số người hoặc nhóm người vì các ví dụ mà nó học không cân bằng.", example: "Một công cụ nhận diện khuôn mặt được huấn luyện chủ yếu trên tông da sáng có thể kém chính xác hơn với tông da tối." },
      { key: "llm", match: "mô hình ngôn ngữ", label: "Mô hình ngôn ngữ lớn (LLM)", def: "Một loại AI được huấn luyện trên lượng văn bản khổng lồ để dự đoán từ tiếp theo — công nghệ đằng sau các chatbot như ChatGPT.", example: "Nó được gọi là 'lớn' vì nó học từ một lượng văn bản khổng lồ và có hàng tỷ tham số nội bộ." },
    ],
    id: [
      { key: "hallucination", match: "halusinasi", label: "Halusinasi AI", def: "Ketika AI dengan percaya diri mengatakan sesuatu yang terdengar benar tapi sebenarnya tidak. Ini terjadi karena AI memprediksi kata-kata yang terdengar mungkin, bukan fakta yang terverifikasi.", example: "Seperti teman sekelas yang menebak saat ujian alih-alih bilang 'saya tidak tahu' — tapi tetap terdengar 100% yakin." },
      { key: "deepfake", match: "deepfake", label: "Deepfake", def: "Foto, video, atau suara palsu yang dibuat AI agar terlihat atau terdengar seperti orang sungguhan yang melakukan atau mengatakan sesuatu yang sebenarnya tidak pernah mereka lakukan.", example: "Video seorang selebriti 'mengatakan' sesuatu yang sebenarnya tidak pernah mereka katakan." },
      { key: "neuralnet", match: "jaringan saraf", label: "Jaringan saraf (neural network)", def: "Jenis AI yang terinspirasi secara longgar dari cara sel otak terhubung, dibangun dari lapisan unit matematika sederhana yang mempelajari pola dari contoh.", example: "Ia tidak 'berpikir' seperti otak — ia menyesuaikan jutaan angka sampai tebakannya semakin mendekati benar." },
      { key: "algorithm", match: "algoritma", label: "Algoritma", def: "Serangkaian aturan langkah demi langkah yang diikuti komputer untuk menyelesaikan masalah atau membuat keputusan.", example: "Resep adalah algoritma untuk memasak — algoritma AI adalah resep untuk sebuah keputusan." },
      { key: "chatbot", match: "chatbot", label: "Chatbot", def: "Program komputer yang dirancang untuk melakukan percakapan denganmu dengan memprediksi kata berikutnya yang mungkin, bukan dengan memahami seperti manusia.", example: "ChatGPT dan asisten serupa adalah chatbot." },
      { key: "datacenter", match: "pusat data", label: "Pusat data (data center)", def: "Gedung besar penuh komputer canggih yang benar-benar menjalankan model AI — AI tidak berada 'di awan' dalam arti ajaib apa pun.", example: "Menjawab pertanyaanmu menggunakan listrik sungguhan di gedung sungguhan di suatu tempat di dunia." },
      { key: "trainingdata", match: "data pelatihan", label: "Data pelatihan (training data)", def: "Kumpulan besar teks, gambar, atau contoh yang dipelajari AI untuk mempelajari polanya sebelum kamu pernah menggunakannya.", example: "Jika data pelatihan tidak seimbang atau tidak adil, jawaban AI juga bisa begitu." },
      { key: "prompt", match: "prompt", label: "Prompt (perintah)", def: "Pertanyaan atau instruksi yang kamu ketik ke AI. Apa yang kamu tulis membentuk jawaban yang kamu dapatkan.", example: "Prompt yang spesifik dan jelas biasanya mendapat jawaban yang jauh lebih berguna daripada yang samar." },
      { key: "bias", match: "bias", label: "Bias AI", def: "Ketika AI memperlakukan sebagian orang atau kelompok secara tidak adil karena contoh yang dipelajarinya tidak seimbang.", example: "Alat pengenalan wajah yang dilatih terutama pada warna kulit terang bisa kurang akurat untuk warna kulit gelap." },
      { key: "llm", match: "model bahasa", label: "Model bahasa besar (LLM)", def: "Jenis AI yang dilatih dengan sejumlah besar teks untuk memprediksi kata berikutnya — teknologi di balik chatbot seperti ChatGPT.", example: "Disebut 'besar' karena ia belajar dari jumlah teks yang sangat banyak dan memiliki miliaran pengaturan internal." },
    ],
    hi: [
      { key: "hallucination", match: "हैलुसिनेशन", label: "AI हैलुसिनेशन", def: "जब AI भरोसे के साथ कुछ ऐसा कहता है जो सही लगता है पर सही नहीं होता। ऐसा इसलिए होता है क्योंकि AI सही साबित हुए तथ्यों की बजाय संभावित लगने वाले शब्दों का अनुमान लगाता है।", example: "जैसे कोई सहपाठी जो टेस्ट में 'मुझे नहीं पता' कहने के बजाय अंदाज़ा लगाता है — लेकिन फिर भी पूरी तरह आश्वस्त दिखता है।" },
      { key: "deepfake", match: "डीपफेक", label: "डीपफेक", def: "एक नकली फ़ोटो, वीडियो या आवाज़ जिसे AI ने इस तरह बनाया है कि वह किसी असली इंसान जैसा दिखे या सुनाई दे, जो कुछ ऐसा कर या कह रहा हो जो उसने असल में कभी नहीं किया।", example: "किसी सेलिब्रिटी का वीडियो जिसमें वह कुछ ऐसा 'कहता' है जो उसने असल में कभी नहीं कहा।" },
      { key: "neuralnet", match: "न्यूरल नेटवर्क", label: "न्यूरल नेटवर्क", def: "एक तरह का AI जो ढीले तौर पर इस बात से प्रेरित है कि दिमाग की कोशिकाएं कैसे जुड़ी होती हैं — यह सरल गणितीय इकाइयों की परतों से बना है जो उदाहरणों से पैटर्न सीखती हैं।", example: "यह दिमाग की तरह 'सोचता' नहीं — यह लाखों नंबरों को तब तक एडजस्ट करता है जब तक उसके अनुमान सही के करीब न पहुंच जाएं।" },
      { key: "algorithm", match: "एल्गोरिदम", label: "एल्गोरिदम", def: "चरण-दर-चरण नियमों का एक सेट जिसे कंप्यूटर किसी समस्या को हल करने या फैसला लेने के लिए फॉलो करता है।", example: "एक रेसिपी खाना बनाने का एल्गोरिदम है — AI एल्गोरिदम किसी फैसले की रेसिपी है।" },
      { key: "chatbot", match: "चैटबॉट", label: "चैटबॉट", def: "एक कंप्यूटर प्रोग्राम जो तुमसे बातचीत करने के लिए बनाया गया है, यह संभावित अगले शब्दों का अनुमान लगाकर करता है, न कि किसी इंसान की तरह समझकर।", example: "ChatGPT और इसी तरह के असिस्टेंट चैटबॉट हैं।" },
      { key: "datacenter", match: "डेटा सेंटर", label: "डेटा सेंटर", def: "शक्तिशाली कंप्यूटरों से भरी एक बड़ी इमारत जो वाकई AI मॉडल चलाती है — AI किसी जादुई मायने में 'क्लाउड में' नहीं है।", example: "तुम्हारे सवाल का जवाब देने में दुनिया में कहीं किसी असली इमारत में असली बिजली खर्च होती है।" },
      { key: "trainingdata", match: "ट्रेनिंग डेटा", label: "ट्रेनिंग डेटा", def: "टेक्स्ट, तस्वीरों या उदाहरणों का विशाल संग्रह जिसे किसी AI ने तुम्हारे इस्तेमाल करने से पहले अपने पैटर्न सीखने के लिए पढ़ा।", example: "अगर ट्रेनिंग डेटा असंतुलित या अनुचित है, तो AI के जवाब भी वैसे ही हो सकते हैं।" },
      { key: "prompt", match: "प्रॉम्प्ट", label: "प्रॉम्प्ट", def: "वह सवाल या निर्देश जो तुम किसी AI को टाइप करते हो। तुम जो लिखते हो वह तुम्हें मिलने वाले जवाब को आकार देता है।", example: "एक स्पष्ट, ठोस प्रॉम्प्ट आमतौर पर किसी अस्पष्ट प्रॉम्प्ट से कहीं ज़्यादा उपयोगी जवाब देता है।" },
      { key: "bias", match: "पूर्वाग्रह", label: "AI पूर्वाग्रह (bias)", def: "जब कोई AI कुछ लोगों या समूहों के साथ अनुचित व्यवहार करता है क्योंकि जिन उदाहरणों से उसने सीखा वे संतुलित नहीं थे।", example: "मुख्य रूप से हल्के रंग की त्वचा पर प्रशिक्षित चेहरा-पहचान टूल गहरे रंग की त्वचा के लिए कम सटीक हो सकता है।" },
      { key: "llm", match: "भाषा मॉडल", label: "बड़ा भाषा मॉडल (LLM)", def: "एक तरह का AI जिसे अगला शब्द अनुमानित करने के लिए विशाल मात्रा में टेक्स्ट पर प्रशिक्षित किया गया है — ChatGPT जैसे चैटबॉट के पीछे की तकनीक।", example: "इसे 'बड़ा' इसलिए कहा जाता है क्योंकि इसने बहुत बड़ी मात्रा में टेक्स्ट से सीखा है और इसमें अरबों आंतरिक सेटिंग्स हैं।" },
    ],
  };
  // Fallback: languages without a native list yet reuse EN definitions so the
  // feature is present everywhere; native lists can replace this over time.
  // all 10 languages now have native term lists; no fallback needed.

  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function linkify(html, lang) {
    if (!html) return html;
    const terms = TERMS[lang] || TERMS.en;
    let out = html;
    terms.forEach(term => {
      if (out.indexOf('data-term="' + term.key + '"') !== -1) return; // already linked once
      const re = new RegExp('(' + escapeRe(term.match) + ')', 'i');
      if (re.test(out)) {
        out = out.replace(re, `<span class="kat-term" data-term="${term.key}" data-lang="${lang}" role="button" tabindex="0">$1</span>`);
      }
    });
    return out;
  }

  function showPopup(key, lang) {
    const terms = TERMS[lang] || TERMS.en;
    const term = terms.find(t => t.key === key);
    if (!term) return;
    let modal = document.getElementById('kat-term-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'kat-term-modal';
      modal.className = 'kat-term-modal hidden';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div class="kat-term-card">
        <button class="kat-term-close" id="kat-term-close" aria-label="Close">✕</button>
        <p class="kat-term-label">📖 ${term.label}</p>
        <p class="kat-term-def">${term.def}</p>
        ${term.example ? `<p class="kat-term-example">💡 ${term.example}</p>` : ''}
      </div>`;
    modal.classList.remove('hidden');
    const close = () => modal.classList.add('hidden');
    modal.querySelector('#kat-term-close').addEventListener('click', close, { once: true });
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); }, { once: true });
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('.kat-term');
    if (!el) return;
    showPopup(el.dataset.term, el.dataset.lang);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target.closest && e.target.closest('.kat-term');
    if (!el) return;
    e.preventDefault();
    showPopup(el.dataset.term, el.dataset.lang);
  });

  window.KAT_Glossary = { linkify, TERMS };
})();
