// Lesson B — "Check a confident answer" (registry entry). Texts: check-ru/en.
// Engine: js/workshop-scenario.js (kind 'check'). Fully scripted examples.
export const check = {
  id: 'check',
  file: 'check.html',
  kind: 'check',
  skill: 'verify-against-source',          // compare a claim with its source; "cannot be decided" is allowed
  langs: ['ru', 'en', 'vi', 'id'],
  review: { editorial: 'draft (author)', native: false, teacher: false, children: false, checked: '2026-10-26' },
  sample: true,                            // shows "Teaching example: not a live chat"
  data: {},
  sources: [
    { url: 'https://arxiv.org/abs/2202.03629', title: 'Ji et al., "Survey of Hallucination in Natural Language Generation", ACM Computing Surveys, 2023',
      supports: { ru: 'Языковые модели могут выдавать гладкий, уверенный текст, который не подтверждается исходными данными.', en: 'Language models can produce fluent, confident text that is not supported by the source data.', id: 'Model bahasa bisa menghasilkan teks yang lancar dan yakin, tetapi tidak didukung oleh data sumbernya.', vi: 'Mô hình ngôn ngữ có thể tạo ra văn bản trôi chảy, tự tin nhưng không được dữ liệu nguồn xác nhận.' } },
    { url: 'https://doi.org/10.1177/016146811912101102', title: 'Wineburg & McGrew, "Lateral Reading and the Nature of Expertise", Teachers College Record, 2019',
      supports: { ru: 'Опытные фактчекеры оценивают источник, выясняя, кто за ним стоит, а не по тому, как убедительно он выглядит.', en: 'Experienced fact-checkers judge a source by finding out who is behind it, not by how convincing it looks.', id: 'Pemeriksa fakta yang berpengalaman menilai sumber dengan mencari tahu siapa di baliknya, bukan dari seberapa meyakinkan tampilannya.', vi: 'Những người kiểm chứng thông tin có kinh nghiệm đánh giá một nguồn bằng cách tìm hiểu ai đứng sau nó, chứ không dựa vào vẻ ngoài thuyết phục.' } },
  ],
};
