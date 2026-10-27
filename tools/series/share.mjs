// Lesson C — "What is OK to share?" (registry entry). Texts: share-ru/en.
// Engine: js/workshop-scenario.js (kind 'share'). Only made-up demo data;
// the child never types anything about themselves.
export const share = {
  id: 'share',
  file: 'share.html',
  kind: 'share',
  skill: 'personal-data',                  // keep the task, drop details it does not need
  langs: ['ru', 'en', 'vi', 'id', 'pt', 'es', 'fr', 'de'],
  review: { editorial: 'draft (author)', native: false, teacher: false, children: false, checked: '2026-10-26' },
  sample: true,
  data: {},
  sources: [
    { url: 'https://www.unicef.org/innocenti/reports/policy-guidance-ai-children', title: 'UNICEF Innocenti, Guidance on AI and children',
      supports: { ru: 'Защита данных и приватности детей — одно из требований к системам ИИ, с которыми взаимодействуют дети.', en: 'Protecting children’s data and privacy is one of the requirements for AI systems that children interact with.', de: 'Der Schutz der Daten und der Privatsphäre von Kindern ist eine der Anforderungen an KI-Systeme, mit denen Kinder umgehen.', fr: 'Protéger les données et la vie privée des enfants fait partie des exigences envers les systèmes d’IA avec lesquels les enfants interagissent.', es: 'Proteger los datos y la privacidad de niñas y niños es uno de los requisitos para los sistemas de IA con los que interactúan.', pt: 'Proteger os dados e a privacidade das crianças é um dos requisitos para os sistemas de IA com os quais as crianças interagem.', id: 'Melindungi data dan privasi anak adalah salah satu syarat bagi sistem AI yang digunakan anak-anak.', vi: 'Bảo vệ dữ liệu và quyền riêng tư của trẻ em là một trong những yêu cầu đối với các hệ thống AI mà trẻ em sử dụng.' } },
    { url: 'https://dataprivacylab.org/projects/identifiability/paper1.pdf', title: 'Sweeney, "Simple Demographics Often Identify People Uniquely", Carnegie Mellon University, 2000',
      supports: { ru: 'Сочетание нескольких обычных сведений (почтовый индекс, пол, дата рождения) позволяло узнать большинство людей в исследованных данных.', en: 'A combination of a few ordinary details (ZIP code, sex, date of birth) was enough to single out most people in the data studied.', de: 'Eine Kombination weniger gewöhnlicher Angaben (Postleitzahl, Geschlecht, Geburtsdatum) reichte aus, um die meisten Menschen in den untersuchten Daten eindeutig zu erkennen.', fr: 'La combinaison de quelques informations ordinaires (code postal, sexe, date de naissance) suffisait à identifier la plupart des personnes dans les données étudiées.', es: 'La combinación de unos pocos datos comunes (código postal, sexo, fecha de nacimiento) bastó para identificar a la mayoría de las personas en los datos estudiados.', pt: 'A combinação de poucos dados comuns (CEP, sexo, data de nascimento) bastou para identificar a maioria das pessoas nos dados estudados.', id: 'Gabungan beberapa data biasa (kode pos, jenis kelamin, tanggal lahir) sudah cukup untuk mengenali sebagian besar orang dalam data yang diteliti.', vi: 'Chỉ cần gộp vài thông tin bình thường (mã bưu chính, giới tính, ngày sinh) là đủ để nhận ra phần lớn người trong dữ liệu được nghiên cứu.' } },
  ],
};
