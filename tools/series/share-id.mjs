// Lesson C, Indonesian: "Apa yang boleh dibagikan?". Every name, address and
// number below is made up for the demo (Indonesian names, a phone of zeros);
// the child never types anything about themselves. Adapted, not word for
// word. Not reviewed by a native-speaking editor or a teacher.

const DEMO = 'Ini tokoh rekaan dengan data rekaan — hanya untuk latihan.';
const P = (text, needed, why) => ({ text, needed, why });

const TASK = P('Bantu aku cari nama untuk tim robotik kami.', true, 'inilah tugasnya — tanpa ini asisten tidak tahu apa yang dibutuhkan');
const ROBOT = P('Kami sedang membuat robot pemilah sampah.', true, 'membantu mencari nama yang cocok dan tidak mengatakan apa pun tentang siapa kamu');
const NAME = P('Aku Bima Pratama,', false, 'nama lengkap tidak diperlukan untuk memberi nama tim');
const SCHOOL = P('sekolah di SD Cahaya Pagi di Jalan Melati,', false, 'sekolah dan nama jalan menunjukkan di mana kamu bisa ditemukan, dan tidak diperlukan untuk tugasnya');
const PHONE = P('nomor HP-ku 0000-0000-0000.', false, 'nomor telepon tidak pernah diperlukan untuk mencari nama');
const CLUB = P('setiap Sabtu pukul 10 aku ikut klub catur dekat taman.', false, 'jadwal dan tempat menunjukkan kapan dan di mana kamu bisa ditemui');
const TEAM = P('Tim kami ada empat orang.', null, 'jumlah anggota tidak mengungkap apa pun dan bisa membantu mencari nama');

const redact = (pieces, extra = {}) => ({
  q: 'Ketuk bagian yang perlu dihapus atau diganti. Tugasnya harus tetap jelas.',
  checkBtn: 'Cek',
  pieces,
  ok: 'Selesai: tugasnya masih ada dan yang tidak perlu sudah hilang. Ini alasan setiap bagian perlu atau tidak:',
  no: 'Belum pas. Lihat penjelasannya: masih ada yang tidak perlu, atau ada yang penting ikut terhapus.',
  ...extra,
});

const nadia = {
  title: 'Contoh baru — selesaikan sendiri',
  intro: 'Permintaan yang lain. ' + DEMO + ' Petunjuk: tamu perlu alamat, asisten tidak — di teks, alamat bisa diganti dengan [alamat] lalu diisi sendiri nanti.',
  bubble: { who: 'Nadia menulis kepada asisten', text: 'Namaku Nadia Putri. Bantu aku menulis undangan ulang tahun, hari Sabtu pukul 15.00. Alamat: Jalan Cemara No. 7, unit 12. Dan cek apakah kata sandi gim-ku kuat: kucing123?' },
  redact: redact([
    P('Namaku Nadia Putri.', false, 'ia bisa menandatangani undangan sendiri; asisten tidak perlu nama lengkapnya'),
    P('Bantu aku menulis undangan ulang tahun,', true, 'inilah tugasnya — tanpa ini asisten tidak tahu apa yang harus ditulis'),
    P('hari Sabtu pukul 15.00.', true, 'waktunya diperlukan untuk undangan dan, sendirian, tidak menunjukkan siapa dia'),
    P('Alamat: Jalan Cemara No. 7, unit 12.', false, 'ganti dengan [alamat] dan isi sendiri di teks yang sudah jadi'),
    P('Kata sandi gim-ku: kucing123', false, 'kata sandi tidak pernah diberikan kepada siapa pun, bahkan untuk "dicek"; kamu bisa bertanya seperti apa kata sandi yang kuat'),
  ], { result: 'Bantu aku menulis undangan ulang tahun, hari Sabtu pukul 15.00, di [alamat]. Dan seperti apa kata sandi yang kuat?', resultH: 'Permintaan yang aman:' }),
};

export const id = {
  common: {
    title: 'Apa yang boleh dibagikan?',
    desc: 'Tokoh rekaan meminta bantuan asisten dan menceritakan terlalu banyak tentang dirinya. Anak menghapus atau mengganti data pribadi sambil tetap menjaga tugasnya, lalu melihat kenapa setiap bagian perlu atau tidak.',
    goal: 'Belajar hanya menyisakan apa yang dibutuhkan tugas dalam sebuah permintaan, dan tidak membagikan data pribadi.',
    noJs: 'Kegiatannya memerlukan JavaScript. Tanpa itu, di bawah tetap ada tujuan, penjelasan, dan tugas yang bisa dicetak.',
    explain1: 'Untuk sebagian besar tugas, asisten tidak perlu nama, alamat, sekolah, nomor telepon, atau kata sandimu. Tugasnya bisa dijelaskan tanpa semua itu.',
    explain2: 'Kadang data diperlukan untuk hasilnya (misalnya alamat di undangan), tetapi tidak harus diberikan kepada asisten: sisakan tempat kosong dan isi sendiri.',
    explain3: 'Data yang satu per satu tampak tidak berbahaya, kalau digabung bisa menunjukkan siapa kamu dan di mana kamu bisa ditemukan. Kalau ragu, tanyakan orang dewasa yang kamu percayai.',
    doneH: 'Selanjutnya apa?',
    doneText: 'Sebelum mengirim permintaan, tanyakan pada dirimu: apa yang benar-benar dibutuhkan tugas ini? Sisanya bisa dihapus atau diganti.',
    choices: ['Ulangi kegiatan ini', 'Kegiatan berikutnya: "Kenapa mesin penyortir salah?"', 'Semua pelajaran'],
    adult: {
      goal: 'Anak memisahkan tugas dari data pribadi, menghapus atau mengganti yang tidak perlu, dan memahami bahwa gabungan detail kecil bisa mengungkap siapa seseorang.',
      questions: ['Apa dalam pesan Bima yang tidak diperlukan untuk mencari nama?', 'Kenapa tamu perlu alamat, tetapi asisten tidak?', 'Apa yang akan kamu lakukan kalau tidak yakin boleh menulis sesuatu?'],
      misconception: 'Kalau tidak menyebut nama, berarti tidak membagikan hal pribadi. Sekolah, jadwal, tempat, dan foto kalau digabung bisa menunjuk ke seseorang meski tanpa nama.',
      signs: ['Menghapus nama, sekolah, nomor telepon, dan kata sandi, tetapi tetap menjaga inti tugasnya.', 'Mengusulkan pengganti: [alamat], "kotaku" sebagai ganti nama jalan.', 'Berkata akan bertanya kepada orang dewasa kalau ragu.'],
      method: 'Semua nama, alamat, dan nomor dibuat-buat. Anak tidak mengetik apa pun tentang dirinya: ia hanya menandai bagian dari teks yang sudah ada. Pengecekan membandingkan tandanya dengan penjelasan yang sudah disiapkan dan menjelaskan setiap bagian.',
      print: {
        task: 'Garis bawahi yang tidak perlu: "Halo, aku Sari Wulandari dari kelas 3B SD Bukit Hijau. Kata sandiku 1234. Bantu aku membuat tebak-tebakan tentang kucing." Tulis ulang permintaan itu supaya hanya tugasnya yang tersisa.',
        answers: 'Tidak perlu: nama lengkap, kelas dan sekolah, kata sandi. Permintaan yang aman: "Bantu aku membuat tebak-tebakan tentang kucing."',
      },
    },
  },
  tiny: {
    goal: 'Yuk, cari tahu apa yang boleh diceritakan kepada asisten dan apa yang sebaiknya kita simpan sendiri.',
    steps: [
      { title: 'Mana yang tidak perlu?', intro: 'Orang dewasa membacakan dengan suara keras. ' + DEMO, bubble: { who: 'Bima menulis kepada asisten', text: 'Aku Bima Pratama. Bantu aku cari nama untuk tim robotku. Aku sekolah di SD Cahaya Pagi.' },
        redact: redact([{ ...NAME, text: NAME.text.replace(/,$/, '.') }, P('Bantu aku cari nama untuk tim robotku.', true, 'inilah tugasnya — tanpa ini asisten tidak tahu apa yang dibutuhkan'), P('Aku sekolah di SD Cahaya Pagi.', false, 'nama sekolah tidak diperlukan untuk memberi nama tim')]) },
      { title: 'Kalau ragu, harus bagaimana?', questions: [{ q: 'Kamu tidak yakin boleh menulis sesuatu atau tidak. Apa yang kamu lakukan?', options: ['Tanya orang dewasa', 'Tulis semua yang aku tahu'], correct: 0, ok: 'Ya! Kalau ragu, tanya orang dewasa.', noAll: 'Lebih baik bertanya dulu. Kepada siapa?' }] },
      { title: 'Contoh baru', intro: DEMO, questions: [{ q: 'Nadia ingin asisten membuat puisi pendek. Apa yang TIDAK perlu ia tulis?', options: ['Alamat rumahnya', 'Puisinya tentang apa'], correct: 0, ok: 'Benar: puisi tidak memerlukan alamat.', noAll: 'Puisinya tentang apa itulah tugasnya. Jadi apa yang tidak perlu?' }] },
    ],
  },
  child: {
    goal: 'Hapus data pribadi dari permintaan sambil tetap menjaga tugasnya, dan jelaskan kenapa setiap bagian perlu atau tidak.',
    steps: [
      { title: 'Hapus yang tidak perlu', intro: DEMO, bubble: { who: 'Bima menulis kepada asisten', text: [NAME, SCHOOL, PHONE, TASK, ROBOT].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, PHONE, TASK, ROBOT]) },
      nadia,
    ],
  },
  teen: {
    goal: 'Pisahkan tugas dari data pribadi dan pahami bagaimana gabungan detail kecil bisa mengungkap seseorang.',
    steps: [
      { title: 'Hapus yang tidak perlu', intro: DEMO, bubble: { who: 'Bima menulis kepada asisten', text: [NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM]) },
      { title: 'Kalau detailnya digabung', questions: [{ q: 'Bima menghapus namanya, tetapi menyisakan "SD Cahaya Pagi di Jalan Melati" dan "catur setiap Sabtu pukul 10 dekat taman". Kenapa itu masih berisiko?',
        options: ['Kalau digabung, detail-detail ini memberi petunjuk kapan dan di mana ia bisa ditemui, meski tanpa nama', 'Tidak berisiko: tanpa nama tidak ada yang tahu siapa dia', 'Berisiko hanya karena kata "catur"'], correct: 0,
        ok: 'Ya. Satu per satu detailnya tidak berbahaya; kalau digabung, pilihannya menyempit menjadi satu orang.', noAll: 'Pikirkan: berapa banyak anak laki-laki dari SD Cahaya Pagi yang ikut klub catur dekat taman setiap Sabtu pukul 10?' }] },
      nadia,
    ],
  },
  adult: {
    goal: 'Menjaga data dalam permintaan seminimal mungkin, mempertimbangkan gabungan detail, dan siapa yang menerima permintaan itu.',
    steps: [
      { title: 'Hapus yang tidak perlu', intro: DEMO, bubble: { who: 'Bima menulis kepada asisten', text: [NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM]) },
      { title: 'Detail yang digabung, dan siapa yang menerimanya', questions: [
        { q: 'Bima menghapus namanya, tetapi menyisakan sekolah, jalan, dan jadwal klubnya. Kenapa itu masih berisiko?',
          options: ['Kalau digabung, detail-detail ini menyempit menjadi satu orang dan menunjukkan di mana dan kapan ia bisa ditemui', 'Tidak berisiko: tanpa nama tidak ada yang tahu siapa dia', 'Berisiko hanya untuk orang dewasa'], correct: 0,
          ok: 'Ya. Ini disebut identifikasi ulang: seseorang dikenali dari gabungan ciri-cirinya.', noAll: 'Pikirkan berapa banyak orang yang cocok dengan semua ini sekaligus.' },
        { q: 'Permintaan ke chatbot diterima oleh perusahaan yang menjalankannya. Apa artinya?',
          options: ['Tulislah seolah-olah orang asing bisa membacanya: jangan tulis apa pun yang tidak akan kamu tempel di papan pengumuman umum', 'Tidak ada artinya: obrolan dengan bot selalu sepenuhnya pribadi', 'Boleh menulis apa saja asal obrolannya dihapus nanti'], correct: 0,
          ok: 'Ya. Setiap layanan menyimpan data dengan aturan yang berbeda; lebih aman tidak mengirim hal yang tidak perlu sejak awal.', noAll: 'Kita tidak bisa tahu pasti siapa yang melihat permintaan itu dan berapa lama. Jadi bagaimana cara menulis yang bijak?' },
      ] },
      nadia,
    ],
  },
};
