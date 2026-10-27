// Lesson B, Indonesian: "Cek jawaban yang yakin". Made-up workshop, made-up
// assistant; every fact the child needs is on the page. Adapted, not word for
// word (prices in rupiah, times as "pukul 15.00"). Not reviewed by a
// native-speaking editor or a teacher.

const WHO = 'Asisten (contoh latihan)';
const SCHEDULE = {
  title: 'Jadwal bengkel kreatif "Roda Gigi" (dokumen asli)',
  rows: [['Untuk siapa', 'anak usia 7–12 tahun'], ['Robot', 'Senin, pukul 15.00'], ['Menggambar', 'Rabu, pukul 16.30'], ['Model kardus', 'Sabtu, pukul 11.00'], ['Durasi', 'setiap sesi 1 jam']],
};
const SCHEDULE2 = {
  title: 'Pengumuman bengkel "Roda Gigi" (dokumen asli)',
  rows: [['Tur bengkel', 'Sabtu, pukul 12.00'], ['Pendaftaran', 'di meja resepsionis, lantai dasar']],
  note: 'Pengumuman tidak menyebut harga tur.',
};
const ANSWER = 'Bengkel Roda Gigi untuk anak-anak. Kelas robot diadakan hari Rabu pukul 16.30. Setiap sesi berlangsung satu jam.';
const SENTENCES = ['Bengkel ini untuk anak-anak.', 'Kelas robot diadakan hari Rabu pukul 16.30.', 'Setiap sesi berlangsung satu jam.'];

const findStep = () => ({
  title: 'Temukan pernyataan yang meragukan',
  intro: 'Kamu bertanya kepada asisten kapan kelas robot diadakan. Ia menjawab dengan sangat yakin. Bandingkan jawabannya dengan jadwal.',
  doc: SCHEDULE,
  bubble: { who: WHO, text: ANSWER },
  questions: [
    { q: 'Pernyataan asisten mana yang tidak sesuai dengan jadwal?', options: SENTENCES, correct: 1,
      ok: 'Ya. Rabu pukul 16.30 adalah kelas menggambar; robot hari Senin pukul 15.00. Asisten tertukar barisnya.',
      noAll: 'Pernyataan ini sesuai dengan jadwal. Cari baris tentang robot dan bandingkan.' },
  ],
});

const fixStep = {
  title: 'Perbaiki jawaban dan sebutkan alasannya',
  doc: SCHEDULE,
  questions: [
    { q: 'Mana yang benar?', options: ['Kelas robot hari Senin pukul 15.00.', 'Kelas robot hari Rabu pukul 16.30.', 'Kelas robot hari Sabtu pukul 11.00.'], correct: 0,
      ok: 'Benar: begitulah yang tertulis di jadwal.', noAll: 'Lihat baris "Robot" di jadwal.' },
    { q: 'Kenapa kamu yakin dengan perbaikanmu?', options: ['Karena tertulis di dokumen asli — jadwal bengkel', 'Karena asisten menjawab dengan sangat yakin', 'Karena kedengarannya lebih benar'], correct: 0,
      ok: 'Ya. Alasannya adalah dokumen yang ditanyakan. Nada yakin tidak membuktikan apa pun.',
      noAll: 'Nada yakin dan "kedengarannya benar" bukan bukti. Apa yang bisa kamu jadikan pegangan?' },
  ],
};

const unknownStep = {
  title: 'Contoh baru — selesaikan sendiri',
  intro: 'Kamu bertanya lagi: berapa harga turnya?',
  doc: SCHEDULE2,
  bubble: { who: WHO, text: 'Tur bengkel hari Sabtu pukul 12.00 harganya Rp50.000.' },
  questions: [
    { q: 'Benarkah harga turnya Rp50.000?', options: ['Ya, benar', 'Tidak, salah', 'Belum bisa dipastikan'], correct: 2,
      ok: 'Benar. Pengumuman menyebut waktu tur, tetapi tidak menyebut harga. Asisten hanya bisa menebak "Rp50.000" — dan dokumen tidak bisa memastikannya.',
      no: { 0: 'Dokumen tidak menyebut harga — tidak ada yang memastikan "Rp50.000".', 1: 'Kamu juga tidak bisa bilang "salah": dokumen sama sekali tidak menyebut harga. Apa yang kurang untuk memutuskan?' } },
    { q: 'Bagaimana cara mengetahui harganya?', options: ['Tanya di meja resepsionis bengkel, seperti tertulis di pengumuman', 'Tanya asisten berulang-ulang sampai jawabannya sama', 'Percaya saja, karena asisten menyebut jumlah yang tepat'], correct: 0,
      ok: 'Ya. Kamu perlu sumber yang bertanggung jawab atas informasi ini.',
      noAll: 'Jawaban asisten yang diulang atau terdengar tepat tetap belum dicek. Siapa yang benar-benar tahu harganya?' },
  ],
};

const twoSources = {
  title: 'Bandingkan dua sumber',
  intro: 'Pertanyaan: tahun berapa bengkel Roda Gigi dibuka? Asisten menjawab: "Tahun 2022 — banyak situs yang bilang begitu." Ini yang kamu temukan.',
  sources: [
    { name: 'Sumber A: situs web bengkel, halaman "Tentang kami"', origin: 'ditulis oleh bengkel itu sendiri', date: 'halaman diperbarui tahun 2026', says: '"Bengkel dibuka tahun 2019"' },
    { name: 'Sumber B: unggahan di forum', origin: 'pengguna tanpa nama', date: 'tanpa tanggal', says: '"Mereka baru buka, kayaknya tahun 2022"' },
  ],
  questions: [
    { q: 'Sumber mana yang lebih baik untuk menjawab pertanyaan ini?', options: ['A: ditulis oleh bengkel itu sendiri dan ada tanggalnya', 'B: menyebut "2022", sama dengan asisten', 'Sama saja: keduanya menyebut tahun'], correct: 0,
      ok: 'Ya. Lihat siapa yang menulis (asal), kapan (tanggal), dan apakah langsung membahas pertanyaannya.',
      noAll: 'Sama dengan jawaban asisten dan banyaknya situs serupa tidak membuktikan apa pun. Siapa yang paling tahu tahun pembukaannya?' },
  ],
};

const teenWhy = {
  q: '"Banyak situs yang bilang begitu" — kenapa itu alasan yang lemah?',
  options: ['Situs-situs bisa saling menyalin kesalahan yang sama', 'Itu alasan kuat: kalau banyak yang bilang, pasti benar', 'Situs tidak pernah banyak'], correct: 0,
  ok: 'Benar. Sepuluh salinan dari satu kesalahan tetap satu kesalahan. Yang penting adalah dari mana informasinya berasal.',
  noAll: 'Pikirkan dari mana situs-situs mendapat informasi dan apakah mereka bisa saling mengulang.',
};
const adultStakes = {
  q: 'Sumber A pun bisa salah. Apa yang kamu lakukan kalau keputusan penting bergantung pada tahun itu (misalnya formulir lomba)?',
  options: ['Cek dengan cara lain yang independen: misalnya minta dokumen atau menelepon bengkel', 'Tidak perlu: situs resmi tidak pernah salah', 'Pakai tahun dari asisten'], correct: 0,
  ok: 'Ya. Makin penting keputusannya, makin perlu konfirmasi yang independen.',
  noAll: 'Sumber resmi lebih bisa dipercaya, tetapi bukan berarti tidak pernah salah. Bagaimana memastikan fakta yang penting?',
};

export const id = {
  common: {
    title: 'Cek jawaban yang yakin',
    desc: 'Asisten latihan menceritakan ulang jadwal dengan yakin, tetapi ada kesalahan. Anak menemukan pernyataan yang meragukan, membandingkannya dengan dokumen, memperbaikinya, dan menyebutkan alasannya; lalu ada kasus ketika informasinya tidak cukup.',
    goal: 'Belajar membandingkan jawaban yang yakin dengan dokumen asli, dan berkata "belum bisa dipastikan" ketika informasinya tidak ada.',
    noJs: 'Kegiatannya memerlukan JavaScript. Tanpa itu, di bawah tetap ada tujuan, penjelasan, dan tugas yang bisa dicetak.',
    explain1: 'Asisten bisa menjawab dengan yakin dan tetap salah: ia tertukar baris jadwal. Mengecek berarti membandingkan dengan sumber yang ditanyakan.',
    explain2: 'Kalau sumbernya tidak memuat informasi itu, jawaban yang jujur adalah "belum bisa dipastikan". Angka yang tepat dalam jawaban tidak berarti jawabannya sudah dicek.',
    explain3: 'Nada yakin, pengulangan, dan banyaknya tautan tidak membuktikan kebenaran. Lihat siapa yang menulis, kapan, dan apakah membahas pertanyaannya.',
    doneH: 'Selanjutnya apa?',
    doneText: 'Jawaban yang yakin belum tentu jawaban yang sudah dicek. Mengecek berarti berpegang pada sumber — dan kalau informasinya tidak ada, kita katakan terus terang.',
    choices: ['Ulangi kegiatan ini', 'Kegiatan berikutnya: "Apa yang boleh dibagikan?"', 'Semua pelajaran'],
    adult: {
      goal: 'Anak membandingkan pernyataan dengan sumber asli, membedakan "salah" dari "belum bisa dipastikan", dan tidak menganggap nada yakin atau banyaknya tautan sebagai bukti.',
      questions: ['Bagaimana kamu tahu asisten salah?', 'Apa bedanya "salah" dan "belum bisa dipastikan"?', 'Kalau dokumen tidak punya jawabannya, kamu akan bertanya kepada siapa?'],
      misconception: 'Kalau jawaban terdengar yakin dan ada angka yang tepat, berarti benar. Kata-kata yang tepat tidak berarti informasinya sudah dicek.',
      signs: ['Menunjuk baris dokumen yang dijadikan pegangan.', 'Berkata "belum bisa dipastikan" ketika informasinya kurang, dan menyebut di mana harus mencari.', 'Saat membandingkan sumber, melihat asal dan tanggal, bukan apakah sumber itu sama dengan jawaban.'],
      method: 'Semua teks asisten ditulis sebelumnya — ini bukan obrolan langsung dan bukan permintaan ke jaringan saraf. Bengkel dan jadwalnya dibuat-buat supaya jawabannya bisa dicek langsung di halaman.',
      print: {
        task: 'Jadwal: "Robot — Senin pukul 15.00; Menggambar — Rabu pukul 16.30". Asisten berkata: "Robot hari Rabu". 1) Temukan kesalahannya. 2) Perbaiki. 3) Asisten berkata: "Satu sesi harganya Rp50.000". Bisakah ini dicek dengan jadwal?',
        answers: '1) Hari dan jamnya tertukar. 2) Robot hari Senin pukul 15.00. 3) Tidak: jadwal tidak menyebut harga — belum bisa dipastikan; tanyakan ke bengkel.',
      },
    },
  },
  tiny: {
    goal: 'Yuk, cek dengan jadwal apakah asisten berkata benar.',
    steps: [
      { title: 'Bandingkan dengan jadwal', intro: 'Orang dewasa membacakan dengan suara keras. Asisten berkata: "Kelas robot hari Rabu." Lihat jadwalnya bersama-sama.', doc: SCHEDULE,
        questions: [{ q: 'Apakah robot hari Rabu?', options: ['Ya', 'Tidak'], correct: 1, ok: 'Benar: di jadwal, robot hari Senin. Asisten keliru.', noAll: 'Cari baris "Robot" bersama-sama. Hari apa yang tertulis?' }] },
      { title: 'Kenapa kamu berpikir begitu?', questions: [{ q: 'Bagaimana kamu tahu?', options: ['Aku melihat jadwal', 'Asisten terdengar yakin'], correct: 0, ok: 'Ya! Kita sudah mengecek dengan jadwal.', noAll: 'Suara yang yakin bukan cara mengecek. Kita melihat ke mana tadi?' }] },
      { title: 'Contoh baru', intro: 'Asisten berkata: "Turnya Rp50.000." Pengumuman hanya menyebut waktunya.', doc: SCHEDULE2,
        questions: [{ q: 'Apakah kita tahu harganya?', options: ['Ya, Rp50.000', 'Belum tahu — perlu tanya orang dewasa atau resepsionis'], correct: 1, ok: 'Benar: pengumuman tidak menyebut harga. Kalau belum tahu, kita bilang belum tahu — lalu bertanya.', noAll: 'Lihat pengumumannya: ada harganya?' }] },
    ],
  },
  child: {
    goal: 'Temukan kesalahan dalam jawaban yang yakin, perbaiki dengan dokumen, dan bedakan "salah" dari "belum bisa dipastikan".',
    steps: [findStep(), fixStep, unknownStep],
  },
  teen: {
    goal: 'Bandingkan pernyataan dengan dokumen, bedakan "salah" dari "belum bisa dipastikan", dan bandingkan sumber berdasarkan asal dan tanggal.',
    steps: [findStep(), fixStep, unknownStep, { ...twoSources, questions: [...twoSources.questions, teenWhy] }],
  },
  adult: {
    goal: 'Cek pernyataan dengan sumber asli, pertimbangkan asal, tanggal, dan relevansinya, dan sesuaikan seberapa teliti pengecekan dengan pentingnya keputusan.',
    steps: [findStep(), fixStep, unknownStep, { ...twoSources, questions: [...twoSources.questions, teenWhy, adultStakes] }],
  },
};
