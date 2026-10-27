// Lesson C, Vietnamese: "Điều gì có thể chia sẻ?". Every name, address and
// number below is made up for the demo (Vietnamese names, a 10-digit phone of
// zeros); the child never types anything about themselves. Adapted, not word
// for word. Not reviewed by a native-speaking editor or a teacher.

const DEMO = 'Đây là nhân vật hư cấu với thông tin hư cấu — chỉ để làm bài tập.';
const P = (text, needed, why) => ({ text, needed, why });

const TASK = P('Giúp mình nghĩ tên cho đội robot của tụi mình.', true, 'đây chính là nhiệm vụ — thiếu nó trợ lý sẽ không biết cần làm gì');
const ROBOT = P('Tụi mình đang làm một con robot phân loại rác.', true, 'giúp nghĩ ra cái tên phù hợp và không nói gì về việc bạn là ai');
const NAME = P('Mình là Trần Minh Khôi,', false, 'họ tên không cần thiết để đặt tên cho đội');
const SCHOOL = P('học trường Tiểu học Sao Mai trên đường Hoa Phượng,', false, 'trường và tên đường cho biết có thể tìm bạn ở đâu, và không cần cho nhiệm vụ');
const PHONE = P('số điện thoại của mình là 0000 000 000,', false, 'không bao giờ cần số điện thoại để nghĩ ra một cái tên');
const CLUB = P('sáng thứ Bảy nào 10 giờ mình cũng đi câu lạc bộ cờ vua gần công viên,', false, 'lịch sinh hoạt và địa điểm cho biết lúc nào và ở đâu có thể gặp bạn');
const TEAM = P('Đội mình có bốn người.', true, 'số thành viên không tiết lộ gì và có thể giúp ích cho việc đặt tên');

const redact = (pieces, extra = {}) => ({
  q: 'Chạm vào những phần cần xoá hoặc thay thế. Nhiệm vụ vẫn phải rõ ràng.',
  checkBtn: 'Kiểm tra',
  pieces,
  ok: 'Xong rồi: nhiệm vụ vẫn còn, phần thừa đã được bỏ. Đây là lý do mỗi phần cần hay không cần:',
  no: 'Chưa hẳn. Xem phần giải thích: vẫn còn phần thừa, hoặc phần cần thiết đã bị xoá.',
  ...extra,
});

const ngocAnh = {
  title: 'Ví dụ mới — em tự giải',
  intro: 'Một yêu cầu khác. ' + DEMO + ' Gợi ý: khách mời cần địa chỉ, nhưng trợ lý thì không — trong văn bản có thể thay bằng [địa chỉ] rồi tự điền sau.',
  bubble: { who: 'Ngọc Anh nhắn cho trợ lý', text: 'Mình tên là Lê Ngọc Anh. Giúp mình viết thiệp mời sinh nhật, vào thứ Bảy lúc 15:00. Địa chỉ: số 7 đường Rừng Thông, căn hộ 12. Và xem giúp mật khẩu trò chơi của mình có mạnh không: meocon123?' },
  redact: redact([
    P('Mình tên là Lê Ngọc Anh.', false, 'bạn ấy có thể tự ký tên vào thiệp; trợ lý không cần biết họ tên'),
    P('Giúp mình viết thiệp mời sinh nhật,', true, 'đây chính là nhiệm vụ — thiếu nó trợ lý sẽ không biết cần viết gì'),
    P('vào thứ Bảy lúc 15:00.', true, 'thời gian cần cho tấm thiệp, và riêng nó không cho biết bạn ấy là ai'),
    P('Địa chỉ: số 7 đường Rừng Thông, căn hộ 12.', false, 'thay bằng [địa chỉ] rồi tự điền vào thiệp đã viết xong'),
    P('Mật khẩu trò chơi của mình: meocon123', false, 'mật khẩu không bao giờ đưa cho ai, kể cả để "kiểm tra"; có thể hỏi thế nào là một mật khẩu mạnh'),
  ], { result: 'Giúp mình viết thiệp mời sinh nhật, vào thứ Bảy lúc 15:00, tại [địa chỉ]. Và thế nào là một mật khẩu mạnh?', resultH: 'Yêu cầu an toàn:' }),
};

export const vi = {
  common: {
    title: 'Điều gì có thể chia sẻ?',
    desc: 'Một nhân vật hư cấu nhờ trợ lý giúp việc và kể quá nhiều về bản thân. Trẻ xoá hoặc thay thế thông tin cá nhân mà vẫn giữ được nhiệm vụ, và xem vì sao mỗi phần cần hay không cần.',
    goal: 'Học cách chỉ giữ lại trong yêu cầu những gì nhiệm vụ cần, và không chia sẻ thông tin cá nhân.',
    noJs: 'Phần bài tập cần JavaScript. Nếu không có, bên dưới vẫn có mục tiêu, lời giải thích và bài tập để in.',
    explain1: 'Với hầu hết các việc, trợ lý không cần tên, địa chỉ, trường học, số điện thoại hay mật khẩu của bạn. Có thể mô tả nhiệm vụ mà không cần chúng.',
    explain2: 'Đôi khi thông tin cần cho kết quả (ví dụ địa chỉ trên thiệp mời), nhưng không nhất thiết phải đưa cho trợ lý: hãy để trống rồi tự điền.',
    explain3: 'Những chi tiết riêng lẻ trông vô hại, khi gộp lại có thể cho biết bạn là ai và tìm bạn ở đâu. Nếu không chắc, hãy hỏi một người lớn đáng tin cậy.',
    doneH: 'Tiếp theo là gì?',
    doneText: 'Trước khi gửi yêu cầu, hãy tự hỏi: nhiệm vụ thật sự cần gì trong đây? Phần còn lại có thể xoá hoặc thay thế.',
    choices: ['Làm lại bài này', 'Bài tiếp theo: "Vì sao máy phân loại đoán sai?"', 'Tất cả bài học'],
    adult: {
      goal: 'Trẻ tách nhiệm vụ khỏi thông tin cá nhân, xoá hoặc thay thế phần thừa, và hiểu rằng nhiều chi tiết nhỏ gộp lại có thể tiết lộ một người là ai.',
      questions: ['Trong tin nhắn của Khôi, điều gì không cần để nghĩ ra tên đội?', 'Vì sao khách mời cần địa chỉ còn trợ lý thì không?', 'Em sẽ làm gì nếu không chắc có nên viết điều gì đó không?'],
      misconception: 'Không nói tên thì không chia sẻ gì riêng tư. Trường học, lịch sinh hoạt, địa điểm và ảnh gộp lại có thể chỉ ra một người ngay cả khi không có tên.',
      signs: ['Xoá tên, trường, số điện thoại và mật khẩu, nhưng giữ lại ý chính của nhiệm vụ.', 'Đề xuất cách thay thế: [địa chỉ], "thành phố của mình" thay cho tên đường.', 'Nói rằng sẽ hỏi người lớn khi không chắc.'],
      method: 'Mọi tên, địa chỉ và số điện thoại đều hư cấu. Trẻ không nhập gì về bản thân: chỉ đánh dấu các phần của một đoạn văn có sẵn. Phần kiểm tra so dấu đánh với phần giải thích viết sẵn và giải thích từng phần.',
      print: {
        task: 'Gạch chân phần không cần: "Chào bạn, mình là Phạm Thu Hà, lớp 3B trường Tiểu học Đồi Thông. Mật khẩu của mình là 1234. Giúp mình nghĩ một câu đố về con mèo." Viết lại yêu cầu sao cho chỉ còn nhiệm vụ.',
        answers: 'Không cần: họ tên, lớp và trường, mật khẩu. Yêu cầu an toàn: "Giúp mình nghĩ một câu đố về con mèo."',
      },
    },
  },
  tiny: {
    goal: 'Cùng tìm hiểu điều gì có thể kể cho trợ lý, và điều gì nên giữ cho riêng mình nhé.',
    steps: [
      { title: 'Phần nào không cần?', intro: 'Người lớn đọc to. ' + DEMO, bubble: { who: 'Khôi nhắn cho trợ lý', text: 'Mình là Trần Minh Khôi. Giúp mình nghĩ tên cho đội robot. Mình học trường Tiểu học Sao Mai.' },
        redact: redact([NAME, P('Giúp mình nghĩ tên cho đội robot.', true, 'đây chính là nhiệm vụ — thiếu nó trợ lý sẽ không biết cần làm gì'), P('Mình học trường Tiểu học Sao Mai.', false, 'tên trường không cần để đặt tên cho đội')]) },
      { title: 'Không chắc thì làm gì?', questions: [{ q: 'Em không chắc có nên viết điều gì đó không. Em làm gì?', options: ['Hỏi người lớn', 'Viết hết những gì mình biết'], correct: 0, ok: 'Đúng rồi! Khi không chắc, hãy hỏi người lớn.', noAll: 'Tốt hơn là hỏi trước. Em có thể hỏi ai?' }] },
      { title: 'Ví dụ mới', intro: DEMO, questions: [{ q: 'Ngọc Anh muốn nhờ trợ lý sáng tác một bài thơ ngắn. Bạn ấy KHÔNG cần viết điều gì?', options: ['Địa chỉ nhà mình', 'Bài thơ nói về cái gì'], correct: 0, ok: 'Đúng: làm thơ thì không cần địa chỉ.', noAll: 'Bài thơ nói về cái gì chính là nhiệm vụ. Vậy cái gì không cần?' }] },
    ],
  },
  child: {
    goal: 'Xoá thông tin cá nhân khỏi yêu cầu mà vẫn giữ được nhiệm vụ, và giải thích vì sao mỗi phần cần hay không cần.',
    steps: [
      { title: 'Xoá phần không cần', intro: DEMO, bubble: { who: 'Khôi nhắn cho trợ lý', text: [NAME, SCHOOL, PHONE, TASK, ROBOT].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, PHONE, TASK, ROBOT]) },
      ngocAnh,
    ],
  },
  teen: {
    goal: 'Tách nhiệm vụ khỏi thông tin cá nhân và hiểu vì sao nhiều chi tiết nhỏ gộp lại có thể làm lộ một người.',
    steps: [
      { title: 'Xoá phần không cần', intro: DEMO, bubble: { who: 'Khôi nhắn cho trợ lý', text: [NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM]) },
      { title: 'Khi các chi tiết gộp lại', questions: [{ q: 'Khôi đã xoá tên nhưng vẫn giữ "trường Tiểu học Sao Mai trên đường Hoa Phượng" và "cờ vua sáng thứ Bảy 10 giờ gần công viên". Vì sao vẫn có rủi ro?',
        options: ['Gộp lại, những chi tiết này cho biết lúc nào và ở đâu có thể gặp bạn ấy, dù không có tên', 'Không rủi ro: không có tên thì không ai biết đó là ai', 'Rủi ro chỉ vì chữ "cờ vua"'], correct: 0,
        ok: 'Đúng vậy. Từng chi tiết riêng thì vô hại; gộp lại thì thu hẹp xuống còn đúng một người.', noAll: 'Hãy nghĩ xem: có bao nhiêu bạn nam trường Sao Mai đi câu lạc bộ cờ vua gần công viên vào 10 giờ sáng thứ Bảy?' }] },
      ngocAnh,
    ],
  },
  adult: {
    goal: 'Giữ dữ liệu trong yêu cầu ở mức tối thiểu, tính đến việc các chi tiết gộp lại và ai là người nhận yêu cầu.',
    steps: [
      { title: 'Xoá phần không cần', intro: DEMO, bubble: { who: 'Khôi nhắn cho trợ lý', text: [NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM]) },
      { title: 'Chi tiết gộp lại, và ai nhận được chúng', questions: [
        { q: 'Khôi đã xoá tên nhưng vẫn giữ trường, tên đường và lịch câu lạc bộ. Vì sao vẫn có rủi ro?',
          options: ['Gộp lại, những chi tiết này thu hẹp xuống còn một người và cho biết tìm bạn ấy ở đâu, lúc nào', 'Không rủi ro: không có tên thì không ai biết đó là ai', 'Chỉ rủi ro với người lớn'], correct: 0,
          ok: 'Đúng vậy. Điều này gọi là tái nhận dạng: một người bị nhận ra nhờ tổ hợp các đặc điểm.', noAll: 'Hãy nghĩ xem có bao nhiêu người cùng lúc khớp với tất cả những điều này.' },
        { q: 'Yêu cầu gửi tới một chatbot sẽ đến tay công ty vận hành nó. Điều đó có nghĩa là gì?',
          options: ['Hãy viết như thể người lạ có thể đọc: không có gì mà bạn không dám dán lên bảng tin công cộng', 'Không có gì: trò chuyện với bot luôn hoàn toàn riêng tư', 'Có thể viết gì cũng được nếu sau đó xoá cuộc trò chuyện'], correct: 0,
          ok: 'Đúng vậy. Mỗi dịch vụ lưu dữ liệu theo quy định khác nhau; an toàn hơn là ngay từ đầu không gửi phần thừa.', noAll: 'Ta không thể biết chắc ai xem được yêu cầu và trong bao lâu. Vậy viết thế nào thì hợp lý?' },
      ] },
      ngocAnh,
    ],
  },
};
