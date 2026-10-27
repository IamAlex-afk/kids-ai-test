// Lesson A — "Why did the sorter get it wrong?" (registry entry + content).
// Cards are language-independent; texts are per language (tools/series/sorter-<lang>.mjs).
// Engine: js/workshop.js (kind 'sorter'), model: js/sorter-model.js.

const card = (id, shape, bg) => ({ id, shape, bg, label: shape });

// Per age: starting training cards, the card to predict, extra cards the
// learner may add (some help, some only repeat the old pattern), separate
// test cards, how many extras may be chosen, and the new example.
const AGES = {
  tiny: {
    start: [card('a1', 'circle', 'blue'), card('a2', 'circle', 'blue'), card('a3', 'square', 'yellow'), card('a4', 'square', 'yellow')],
    probe: card('p1', 'circle', 'yellow'),
    extras: [card('x1', 'circle', 'yellow'), card('x3', 'circle', 'blue')],
    pick: 1,
    test: [card('t1', 'circle', 'yellow'), card('t2', 'square', 'blue')],
  },
  child: {
    start: [card('a1', 'circle', 'blue'), card('a2', 'circle', 'blue'), card('a5', 'circle', 'blue'), card('a3', 'square', 'yellow'), card('a4', 'square', 'yellow'), card('a6', 'square', 'yellow')],
    probe: card('p1', 'circle', 'yellow'),
    extras: [card('x1', 'circle', 'yellow'), card('x2', 'square', 'blue'), card('x3', 'circle', 'blue'), card('x4', 'square', 'yellow')],
    pick: 2,
    test: [card('t1', 'circle', 'yellow'), card('t2', 'square', 'blue'), card('t3', 'circle', 'blue'), card('t4', 'square', 'yellow')],
  },
};
AGES.teen = { ...AGES.child, pick: 2 };
AGES.adult = { ...AGES.child, pick: 3 };

// New example: same kind of mistake, new features and values.
const TRANSFER = {
  start: [card('n1', 'triangle', 'green'), card('n2', 'triangle', 'green'), card('n3', 'triangle', 'green'), card('n4', 'star', 'purple'), card('n5', 'star', 'purple'), card('n6', 'star', 'purple')],
  probe: card('np', 'star', 'green'),
  fixes: [card('f1', 'star', 'green'), card('f2', 'triangle', 'green'), card('f3', 'star', 'purple')],
};

export const sorter = {
  id: 'sorter',
  file: 'sorter.html',
  kind: 'sorter',
  skill: 'training-data',                     // a false pattern in training data, fixed by better data
  langs: ['ru', 'en', 'vi', 'id', 'pt', 'es', 'fr'],
  // Editorial status. Honest: nothing has been reviewed by a native speaker,
  // a teacher, or tested with children.
  review: { editorial: 'draft (author)', native: false, teacher: false, children: false, checked: '2026-10-26' },
  data: { ages: AGES, transfer: TRANSFER, categories: { main: ['circle', 'square'], transfer: ['triangle', 'star'] } },
  sources: [
    { url: 'https://arxiv.org/abs/2004.07780', title: 'Geirhos et al., "Shortcut learning in deep neural networks", Nature Machine Intelligence, 2020',
      supports: { ru: 'Модели машинного обучения могут опираться на случайную подсказку в обучающих данных (например, фон) вместо нужного признака.', en: 'Machine-learning models can rely on an accidental cue in the training data (such as the background) instead of the intended feature.', fr: 'Les modèles d’apprentissage automatique peuvent s’appuyer sur un indice dû au hasard dans les données d’entraînement (comme le fond) au lieu de la caractéristique visée.', es: 'Los modelos de aprendizaje automático pueden apoyarse en una pista casual de los datos de entrenamiento (como el fondo) en lugar del rasgo que se buscaba.', pt: 'Modelos de aprendizado de máquina podem se apoiar em uma pista acidental dos dados de treino (como o fundo) em vez da característica pretendida.', id: 'Model pembelajaran mesin bisa berpegang pada petunjuk kebetulan dalam data latihan (misalnya warna latar), bukan pada ciri yang seharusnya.', vi: 'Mô hình học máy có thể dựa vào một gợi ý tình cờ trong dữ liệu học (ví dụ màu nền) thay vì đặc điểm cần thiết.' } },
    { url: 'https://doi.org/10.1023/A:1022631118932', title: 'Holte, "Very Simple Classification Rules Perform Well on Most Commonly Used Datasets", Machine Learning, 1993',
      supports: { ru: 'Правило по одному признаку, выбранное по наименьшему числу ошибок, — известный простой метод классификации; наш сортировщик — его учебная версия.', en: 'A one-feature rule chosen by the fewest mistakes is a known simple classification method; our sorter is a teaching version of it.', fr: 'Une règle à une seule caractéristique, choisie par le plus petit nombre d’erreurs, est une méthode de classification simple et connue ; notre trieur en est une version pédagogique.', es: 'Una regla de un solo rasgo, elegida por el menor número de errores, es un método de clasificación sencillo y conocido; nuestro clasificador es una versión didáctica de él.', pt: 'Uma regra de uma só característica, escolhida pelo menor número de erros, é um método simples e conhecido de classificação; o nosso classificador é uma versão didática dele.', id: 'Aturan dengan satu ciri yang dipilih berdasarkan kesalahan paling sedikit adalah metode klasifikasi sederhana yang sudah dikenal; mesin penyortir kami adalah versi latihannya.', vi: 'Quy tắc dựa trên một đặc điểm, được chọn theo số lỗi ít nhất, là một phương pháp phân loại đơn giản đã được biết đến; máy phân loại của chúng tôi là phiên bản tập học của nó.' } },
  ],
};
