// Lesson C — "What is OK to share?" (registry entry). Texts: share-ru/en.
// Engine: js/workshop-scenario.js (kind 'share'). Only made-up demo data;
// the child never types anything about themselves.
export const share = {
  id: 'share',
  file: 'share.html',
  kind: 'share',
  skill: 'personal-data',                  // keep the task, drop details it does not need
  langs: ['ru', 'en', 'vi'],
  review: { editorial: 'draft (author)', native: false, teacher: false, children: false, checked: '2026-10-26' },
  sample: true,
  data: {},
  sources: [
    { url: 'https://www.unicef.org/innocenti/reports/policy-guidance-ai-children', title: 'UNICEF Innocenti, Guidance on AI and children',
      supports: { ru: 'Защита данных и приватности детей — одно из требований к системам ИИ, с которыми взаимодействуют дети.', en: 'Protecting children’s data and privacy is one of the requirements for AI systems that children interact with.', vi: 'Bảo vệ dữ liệu và quyền riêng tư của trẻ em là một trong những yêu cầu đối với các hệ thống AI mà trẻ em sử dụng.' } },
    { url: 'https://dataprivacylab.org/projects/identifiability/paper1.pdf', title: 'Sweeney, "Simple Demographics Often Identify People Uniquely", Carnegie Mellon University, 2000',
      supports: { ru: 'Сочетание нескольких обычных сведений (почтовый индекс, пол, дата рождения) позволяло узнать большинство людей в исследованных данных.', en: 'A combination of a few ordinary details (ZIP code, sex, date of birth) was enough to single out most people in the data studied.', vi: 'Chỉ cần gộp vài thông tin bình thường (mã bưu chính, giới tính, ngày sinh) là đủ để nhận ra phần lớn người trong dữ liệu được nghiên cứu.' } },
  ],
};
