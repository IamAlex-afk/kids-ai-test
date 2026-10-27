// Lesson B, Vietnamese: "Kiểm tra một câu trả lời tự tin". Made-up workshop,
// made-up assistant; every fact the child needs is on the page. Adapted, not
// word for word (prices in đồng, 24-hour times). Not reviewed by a
// native-speaking editor or a teacher.

const WHO = 'Trợ lý (ví dụ tập học)';
const SCHEDULE = {
  title: 'Thời khóa biểu xưởng sáng tạo "Bánh Răng" (tài liệu gốc)',
  rows: [['Dành cho', 'trẻ từ 7 đến 12 tuổi'], ['Robot', 'Thứ Hai, 15:00'], ['Vẽ', 'Thứ Tư, 16:30'], ['Mô hình bìa cứng', 'Thứ Bảy, 11:00'], ['Thời lượng', 'mỗi buổi 1 tiếng']],
};
const SCHEDULE2 = {
  title: 'Thông báo của xưởng "Bánh Răng" (tài liệu gốc)',
  rows: [['Buổi tham quan xưởng', 'Thứ Bảy, 12:00'], ['Đăng ký', 'tại quầy lễ tân, tầng trệt']],
  note: 'Thông báo không nói gì về giá của buổi tham quan.',
};
const ANSWER = 'Xưởng Bánh Răng dành cho trẻ em. Lớp robot học vào Thứ Tư lúc 16:30. Mỗi buổi kéo dài một tiếng.';
const SENTENCES = ['Xưởng dành cho trẻ em.', 'Lớp robot học vào Thứ Tư lúc 16:30.', 'Mỗi buổi kéo dài một tiếng.'];

const findStep = () => ({
  title: 'Tìm câu đáng ngờ',
  intro: 'Em hỏi trợ lý xem lớp robot học khi nào. Trợ lý trả lời rất tự tin. Hãy so câu trả lời với thời khóa biểu.',
  doc: SCHEDULE,
  bubble: { who: WHO, text: ANSWER },
  questions: [
    { q: 'Câu nào của trợ lý không khớp với thời khóa biểu?', options: SENTENCES, correct: 1,
      ok: 'Đúng. Thứ Tư lúc 16:30 là lớp vẽ; robot học vào Thứ Hai lúc 15:00. Trợ lý đã nhầm dòng.',
      noAll: 'Câu này khớp với thời khóa biểu. Hãy tìm dòng "Robot" và so sánh.' },
  ],
});

const fixStep = {
  title: 'Sửa câu trả lời và nêu lý do',
  doc: SCHEDULE,
  questions: [
    { q: 'Điều gì mới đúng?', options: ['Lớp robot học vào Thứ Hai lúc 15:00.', 'Lớp robot học vào Thứ Tư lúc 16:30.', 'Lớp robot học vào Thứ Bảy lúc 11:00.'], correct: 0,
      ok: 'Đúng: thời khóa biểu ghi như vậy.', noAll: 'Hãy nhìn dòng "Robot" trong thời khóa biểu.' },
    { q: 'Vì sao em chắc chắn về chỗ sửa của mình?', options: ['Vì điều đó được ghi trong tài liệu gốc — thời khóa biểu của xưởng', 'Vì trợ lý trả lời rất tự tin', 'Vì nghe có vẻ đúng hơn'], correct: 0,
      ok: 'Đúng vậy. Căn cứ là chính tài liệu mà câu hỏi nói đến. Giọng tự tin không chứng minh được gì.',
      noAll: 'Giọng tự tin và "nghe có vẻ đúng" không phải bằng chứng. Em có thể dựa vào điều gì?' },
  ],
};

const unknownStep = {
  title: 'Ví dụ mới — em tự giải',
  intro: 'Em hỏi tiếp: buổi tham quan giá bao nhiêu?',
  doc: SCHEDULE2,
  bubble: { who: WHO, text: 'Buổi tham quan xưởng vào Thứ Bảy lúc 12:00 có giá 50.000 đồng.' },
  questions: [
    { q: 'Có đúng là buổi tham quan giá 50.000 đồng không?', options: ['Đúng', 'Sai', 'Chưa thể xác định'], correct: 2,
      ok: 'Đúng. Thông báo có giờ tham quan nhưng không có giá. Trợ lý chỉ có thể đoán "50.000 đồng" — và tài liệu không xác nhận được điều đó.',
      no: { 0: 'Tài liệu không có giá — không có gì xác nhận "50.000 đồng".', 1: 'Cũng không thể nói "sai": tài liệu hoàn toàn không có giá. Còn thiếu gì để quyết định?' } },
    { q: 'Làm sao biết được giá?', options: ['Hỏi quầy lễ tân của xưởng, như thông báo đã ghi', 'Hỏi lại trợ lý cho đến khi nó trả lời giống nhau', 'Tin luôn, vì trợ lý đã nêu con số chính xác'], correct: 0,
      ok: 'Đúng vậy. Cần một nguồn chịu trách nhiệm về thông tin này.',
      noAll: 'Câu trả lời lặp lại hay có con số cụ thể của trợ lý vẫn chưa được kiểm tra. Ai thật sự biết giá?' },
  ],
};

const twoSources = {
  title: 'So sánh hai nguồn',
  intro: 'Câu hỏi: xưởng Bánh Răng mở cửa năm nào? Trợ lý trả lời: "Năm 2022 — rất nhiều trang web nói vậy." Đây là những gì em tìm được.',
  sources: [
    { name: 'Nguồn A: trang web của xưởng, mục "Giới thiệu"', origin: 'chính xưởng viết', date: 'trang được cập nhật năm 2026', says: '"Xưởng mở cửa năm 2019"' },
    { name: 'Nguồn B: một bài đăng trên diễn đàn', origin: 'một người dùng không ghi tên', date: 'không ghi ngày', says: '"Họ mới mở gần đây thôi, hình như năm 2022"' },
  ],
  questions: [
    { q: 'Nguồn nào tốt hơn để trả lời câu hỏi này?', options: ['A: do chính xưởng viết và có ghi ngày', 'B: nói "2022", giống trợ lý', 'Như nhau: cả hai đều nêu năm'], correct: 0,
      ok: 'Đúng vậy. Hãy xem ai viết (nguồn gốc), viết khi nào (ngày) và có nói thẳng về câu hỏi không.',
      noAll: 'Trùng với trợ lý hay có nhiều trang web giống nhau đều không chứng minh được gì. Ai biết rõ nhất năm xưởng mở cửa?' },
  ],
};

const teenWhy = {
  q: '"Rất nhiều trang web nói vậy" — vì sao đó là lý do yếu?',
  options: ['Các trang web có thể chép cùng một lỗi của nhau', 'Đó là lý do mạnh: nhiều nơi nói thì chắc là đúng', 'Chẳng bao giờ có nhiều trang web cả'], correct: 0,
  ok: 'Đúng. Mười bản sao của một lỗi vẫn chỉ là một lỗi. Điều quan trọng là thông tin đến từ đâu.',
  noAll: 'Hãy nghĩ xem các trang web lấy thông tin từ đâu và liệu chúng có thể lặp lại nhau không.',
};
const adultStakes = {
  q: 'Ngay cả nguồn A cũng có thể sai. Nếu một quyết định quan trọng phụ thuộc vào năm này (ví dụ hồ sơ dự thi), em làm gì?',
  options: ['Kiểm tra thêm bằng một cách độc lập khác: ví dụ xin giấy tờ hoặc gọi điện cho xưởng', 'Không cần: trang web chính thức không bao giờ sai', 'Dùng năm mà trợ lý đưa ra'], correct: 0,
  ok: 'Đúng vậy. Quyết định càng quan trọng thì càng cần nhiều xác nhận độc lập.',
  noAll: 'Nguồn chính thức đáng tin hơn nhưng không phải không bao giờ sai. Làm sao xác nhận một thông tin quan trọng?',
};

export const vi = {
  common: {
    title: 'Kiểm tra một câu trả lời tự tin',
    desc: 'Một trợ lý tập học kể lại thời khóa biểu rất tự tin nhưng có lỗi. Trẻ tìm câu đáng ngờ, so với tài liệu, sửa lại và nêu lý do; sau đó là một tình huống không đủ thông tin.',
    goal: 'Học cách so một câu trả lời tự tin với tài liệu gốc, và nói "chưa thể xác định" khi không có thông tin.',
    noJs: 'Phần bài tập cần JavaScript. Nếu không có, bên dưới vẫn có mục tiêu, lời giải thích và bài tập để in.',
    explain1: 'Trợ lý có thể trả lời tự tin mà vẫn sai: nó đã nhầm các dòng trong thời khóa biểu. Kiểm tra nghĩa là so với nguồn mà câu hỏi nói đến.',
    explain2: 'Nếu nguồn không có thông tin, câu trả lời trung thực là "chưa thể xác định". Một con số chính xác trong câu trả lời không có nghĩa là nó đã được kiểm tra.',
    explain3: 'Giọng tự tin, sự lặp lại và số lượng đường link không chứng minh sự thật. Hãy xem ai viết, viết khi nào và có đúng về câu hỏi không.',
    doneH: 'Tiếp theo là gì?',
    doneText: 'Câu trả lời tự tin chưa phải là câu trả lời đã kiểm tra. Kiểm tra là dựa vào nguồn — và khi thiếu thông tin, ta nói rõ là thiếu.',
    choices: ['Làm lại bài này', 'Bài tiếp theo: "Điều gì có thể chia sẻ?"', 'Tất cả bài học'],
    adult: {
      goal: 'Trẻ so các khẳng định với nguồn gốc, phân biệt "sai" với "chưa thể xác định", và không coi sự tự tin hay số lượng đường link là bằng chứng.',
      questions: ['Em nhận ra trợ lý sai bằng cách nào?', '"Sai" và "chưa thể xác định" khác nhau thế nào?', 'Nếu tài liệu không có câu trả lời, em sẽ hỏi ai?'],
      misconception: 'Câu trả lời nghe tự tin và có con số chính xác thì là đúng. Cách diễn đạt chính xác không có nghĩa là thông tin đã được kiểm tra.',
      signs: ['Chỉ ra được dòng trong tài liệu mà mình dựa vào.', 'Nói "chưa thể xác định" khi thiếu thông tin và nêu được nên tìm ở đâu.', 'Khi so sánh nguồn, xem nguồn gốc và ngày tháng chứ không xem nguồn có trùng với câu trả lời hay không.'],
      method: 'Mọi câu của trợ lý đều được viết sẵn — đây không phải trò chuyện trực tiếp và không phải yêu cầu gửi tới mạng nơ-ron. Xưởng và thời khóa biểu là hư cấu để có thể kiểm tra câu trả lời ngay trên trang.',
      print: {
        task: 'Thời khóa biểu: "Robot — Thứ Hai 15:00; Vẽ — Thứ Tư 16:30". Trợ lý nói: "Robot học vào Thứ Tư". 1) Tìm lỗi. 2) Sửa lại. 3) Trợ lý nói: "Mỗi buổi giá 50.000 đồng". Có thể kiểm tra điều này bằng thời khóa biểu không?',
        answers: '1) Ngày và giờ bị nhầm. 2) Robot học vào Thứ Hai lúc 15:00. 3) Không: thời khóa biểu không có giá — chưa thể xác định; hãy hỏi xưởng.',
      },
    },
  },
  tiny: {
    goal: 'Cùng xem thời khóa biểu để biết trợ lý có nói đúng không nhé.',
    steps: [
      { title: 'So với thời khóa biểu', intro: 'Người lớn đọc to. Trợ lý nói: "Lớp robot học vào Thứ Tư." Hãy cùng nhìn thời khóa biểu.', doc: SCHEDULE,
        questions: [{ q: 'Robot có học vào Thứ Tư không?', options: ['Có', 'Không'], correct: 1, ok: 'Đúng: trong thời khóa biểu, robot học vào Thứ Hai. Trợ lý đã nhầm.', noAll: 'Cùng tìm dòng "Robot" nhé. Ở đó ghi thứ mấy?' }] },
      { title: 'Vì sao em nghĩ vậy?', questions: [{ q: 'Làm sao em biết?', options: ['Em đã xem thời khóa biểu', 'Trợ lý nói rất chắc chắn'], correct: 0, ok: 'Đúng rồi! Chúng ta đã kiểm tra bằng thời khóa biểu.', noAll: 'Giọng chắc chắn chưa phải là kiểm tra. Chúng ta đã nhìn vào đâu?' }] },
      { title: 'Ví dụ mới', intro: 'Trợ lý nói: "Buổi tham quan giá 50.000 đồng." Thông báo chỉ ghi giờ.', doc: SCHEDULE2,
        questions: [{ q: 'Mình có biết giá không?', options: ['Có, 50.000 đồng', 'Chưa biết — cần hỏi người lớn hoặc quầy lễ tân'], correct: 1, ok: 'Đúng: thông báo không có giá. Khi chưa biết, ta nói là chưa biết — và đi hỏi.', noAll: 'Nhìn thông báo xem: có ghi giá không?' }] },
    ],
  },
  child: {
    goal: 'Tìm lỗi trong một câu trả lời tự tin, sửa lại bằng tài liệu, và phân biệt "sai" với "chưa thể xác định".',
    steps: [findStep(), fixStep, unknownStep],
  },
  teen: {
    goal: 'So các khẳng định với tài liệu, phân biệt "sai" với "chưa thể xác định", và so sánh các nguồn theo nguồn gốc và ngày tháng.',
    steps: [findStep(), fixStep, unknownStep, { ...twoSources, questions: [...twoSources.questions, teenWhy] }],
  },
  adult: {
    goal: 'Đối chiếu khẳng định với nguồn gốc, cân nhắc ai viết, viết khi nào và có liên quan đến câu hỏi không, và kiểm tra kỹ tương xứng với mức quan trọng của quyết định.',
    steps: [findStep(), fixStep, unknownStep, { ...twoSources, questions: [...twoSources.questions, teenWhy, adultStakes] }],
  },
};
