// Lesson B, Turkish ("sen"): "Kendinden emin bir cevabı kontrol et". Made-up
// workshop, made-up assistant; every fact the child needs is on the page.
// Adapted, not word for word (prices in lira, times as "15.00"). Not reviewed
// by a native-speaking editor or a teacher.

const WHO = 'Asistan (alıştırma örneği)';
const SCHEDULE = {
  title: '“Çark” atölyesinin ders programı (asıl belge)',
  rows: [['Kimler için', '7–12 yaş arası çocuklar'], ['Robotlar', 'Pazartesi, 15.00'], ['Resim', 'Çarşamba, 16.30'], ['Kartondan maketler', 'Cumartesi, 11.00'], ['Süre', 'her ders 1 saat sürer']],
};
const SCHEDULE2 = {
  title: '“Çark” atölyesinin duyurusu (asıl belge)',
  rows: [['Atölye gezisi', 'Cumartesi, 12.00'], ['Kayıt', 'giriş katındaki danışmada']],
  note: 'Duyuruda gezinin ücretiyle ilgili hiçbir şey yazmıyor.',
};
const ANSWER = 'Çark atölyesi çocuklar için. Robot grubu Çarşamba saat 16.30’da toplanıyor. Her ders bir saat sürüyor.';
const SENTENCES = ['Atölye çocuklar için.', 'Robot grubu Çarşamba saat 16.30’da toplanıyor.', 'Her ders bir saat sürüyor.'];

const findStep = () => ({
  title: 'Şüpheli ifadeyi bul',
  intro: 'Asistana robot grubunun ne zaman olduğunu sordun. Çok kendinden emin cevap verdi. Cevabını ders programıyla karşılaştır.',
  doc: SCHEDULE,
  bubble: { who: WHO, text: ANSWER },
  questions: [
    { q: 'Asistanın hangi ifadesi ders programıyla uyuşmuyor?', options: SENTENCES, correct: 1,
      ok: 'Evet. Çarşamba 16.30’da resim var; robotlar Pazartesi 15.00’te. Asistan satırları karıştırmış.',
      noAll: 'Bu ifade ders programıyla uyuşuyor. Robotlarla ilgili satırı bul ve karşılaştır.' },
  ],
});

const fixStep = {
  title: 'Cevabı düzelt ve gerekçeni söyle',
  doc: SCHEDULE,
  questions: [
    { q: 'Doğrusu hangisi?', options: ['Robot grubu Pazartesi saat 15.00’te.', 'Robot grubu Çarşamba saat 16.30’da.', 'Robot grubu Cumartesi saat 11.00’de.'], correct: 0,
      ok: 'Doğru: ders programında böyle yazıyor.', noAll: 'Ders programındaki “Robotlar” satırına bak.' },
    { q: 'Düzeltmenden neden eminsin?', options: ['Asıl belgede — atölyenin ders programında — böyle yazıyor', 'Asistan çok kendinden emin cevap verdi', 'Kulağa daha doğru geliyor'], correct: 0,
      ok: 'Evet. Gerekçe, sorunun ilgili olduğu belgedir. Kendinden emin bir ses tonu hiçbir şey kanıtlamaz.',
      noAll: 'Kendinden emin bir ton ve “kulağa doğru geliyor” kanıt değildir. Neye dayanabilirsin?' },
  ],
};

const unknownStep = {
  title: 'Yeni örnek — kendin çöz',
  intro: 'Tekrar sordun: gezi ne kadar?',
  doc: SCHEDULE2,
  bubble: { who: WHO, text: 'Cumartesi saat 12.00’deki atölye gezisi 50 TL.' },
  questions: [
    { q: 'Gezinin 50 TL olduğu doğru mu?', options: ['Evet, doğru', 'Hayır, yanlış', 'Henüz bilinemez'], correct: 2,
      ok: 'Doğru. Duyuruda gezinin saati var ama ücreti yok. Asistan “50 TL”yi ancak tahmin etmiş olabilir — belge bunu doğrulayamaz.',
      no: { 0: 'Belgede ücret yok — “50 TL”yi doğrulayan bir şey yok.', 1: '“Yanlış” da diyemezsin: belgede hiç ücret yok. Karar vermek için ne eksik?' } },
    { q: 'Ücreti nasıl öğrenebilirsin?', options: ['Duyuruda yazdığı gibi atölyenin danışmasına sormak', 'Aynı cevabı verene kadar asistana tekrar tekrar sormak', 'İnanmak, çünkü asistan tam bir rakam söyledi'], correct: 0,
      ok: 'Evet. Bu bilgiden sorumlu bir kaynağa ihtiyacın var.',
      noAll: 'Asistanın tekrarlanan ya da tam rakamlı cevabı da hâlâ kontrol edilmiş değildir. Ücreti gerçekten kim bilir?' },
  ],
};

const twoSources = {
  title: 'İki kaynağı karşılaştır',
  intro: 'Soru: Çark atölyesi hangi yıl açıldı? Asistan şöyle cevap verdi: “2022’de — birçok sitede böyle yazıyor.” İşte bulduğun kaynaklar.',
  sources: [
    { name: 'Kaynak A: atölyenin web sitesi, “Hakkımızda” sayfası', origin: 'atölyenin kendisi', date: 'sayfa 2026’da güncellendi', says: '“Atölye 2019’da açıldı”' },
    { name: 'Kaynak B: bir forum gönderisi', origin: 'adı olmayan bir kullanıcı', date: 'tarih yok', says: '“Yeni açıldılar, galiba 2022’de”' },
  ],
  questions: [
    { q: 'Bu soruyu cevaplamak için hangi kaynak daha iyi?', options: ['A: atölyenin kendisi yazmış ve tarihi var', 'B: asistan gibi “2022” diyor', 'İkisi de aynı: ikisi de bir yıl veriyor'], correct: 0,
      ok: 'Evet. Kimin yazdığına (köken), ne zaman yazdığına (tarih) ve doğrudan soruyla ilgili olup olmadığına bak.',
      noAll: 'Asistanla aynı şeyi söylemek ve benzer sitelerin çokluğu bir şey kanıtlamaz. Açılış yılını en iyi kim bilir?' },
  ],
};

const teenWhy = {
  q: '“Birçok sitede böyle yazıyor” — bu neden zayıf bir gerekçe?',
  options: ['Siteler aynı hatayı birbirinden kopyalayabilir', 'Güçlü bir gerekçe: birçok yer söylüyorsa doğrudur', 'Hiçbir zaman çok site olmaz'], correct: 0,
  ok: 'Doğru. Bir hatanın on kopyası yine tek bir hatadır. Önemli olan bilginin nereden geldiğidir.',
  noAll: 'Sitelerin bilgilerini nereden aldığını ve birbirini tekrarlayıp tekrarlayamayacağını düşün.',
};
const adultStakes = {
  q: 'A kaynağı da yanılabilir. Önemli bir karar bu yıla bağlıysa (örneğin bir yarışma başvurusu) ne yaparsın?',
  options: ['Başka, bağımsız bir yolla kontrol ederim: örneğin bir belge isterim ya da atölyeyi ararım', 'Hiçbir şey: resmî site asla yanılmaz', 'Asistanın verdiği yılı kullanırım'], correct: 0,
  ok: 'Evet. Karar ne kadar önemliyse, o kadar çok bağımsız doğrulama gerekir.',
  noAll: 'Resmî bir kaynak daha güvenilirdir ama yanılmaz değildir. Önemli bir bilgiyi nasıl doğrularsın?',
};

export const tr = {
  common: {
    title: 'Kendinden emin bir cevabı kontrol et',
    desc: 'Bir alıştırma asistanı bir ders programını kendinden emin ama hatalı biçimde aktarır. Çocuk şüpheli ifadeyi bulur, belgeyle karşılaştırır, düzeltir ve gerekçesini söyler; ardından bilginin yetmediği bir durum gelir.',
    goal: 'Kendinden emin bir cevabı asıl belgeyle karşılaştırmayı ve bilgi yoksa “henüz bilinemez” demeyi öğrenmek.',
    noJs: 'Etkinliğin kendisi JavaScript gerektirir. JavaScript olmadan da aşağıda amaç, açıklama ve yazdırılabilir bir görev var.',
    explain1: 'Bir asistan kendinden emin cevap verip yine de yanılabilir: ders programının satırlarını karıştırdı. Kontrol etmek, sorunun ilgili olduğu kaynakla karşılaştırmak demektir.',
    explain2: 'Kaynakta bilgi yoksa dürüst cevap “henüz bilinemez”dir. Cevaptaki tam bir rakam, cevabın kontrol edildiği anlamına gelmez.',
    explain3: 'Kendinden emin bir ton, tekrar ve bağlantı sayısı doğruluğu kanıtlamaz. Kimin yazdığına, ne zaman yazdığına ve soruyla ilgili olup olmadığına bak.',
    doneH: 'Sırada ne var?',
    doneText: 'Kendinden emin bir cevap henüz kontrol edilmiş bir cevap değildir. Kontrol bir kaynağa dayanır — bilgi eksikse bunu açıkça söyleriz.',
    choices: ['Bu etkinliği tekrar yap', 'Sonraki etkinlik: “Neyi paylaşabilirim?”', 'Tüm dersler'],
    adult: {
      goal: 'Çocuk ifadeleri asıl kaynakla karşılaştırır, “yanlış” ile “henüz bilinemez”i ayırt eder ve kendinden eminliği ya da bağlantı sayısını kanıt saymaz.',
      questions: ['Asistanın yanıldığını nasıl fark ettin?', '“Yanlış” ile “henüz bilinemez” arasındaki fark ne?', 'Belgede cevap yoksa kime sorardın?'],
      misconception: 'Bir cevap kendinden emin geliyorsa ve tam rakamlar içeriyorsa doğrudur. Kesin ifadeler, bilginin kontrol edildiği anlamına gelmez.',
      signs: ['Dayandığı belge satırını gösterir.', 'Bilgi eksikse “henüz bilinemez” der ve nereye bakılacağını söyler.', 'Kaynakları karşılaştırırken cevapla uyuşup uyuşmadığına değil, kökenine ve tarihine bakar.'],
      method: 'Asistanın bütün metinleri önceden yazıldı — bu canlı bir sohbet de, bir yapay sinir ağına gönderilen istek de değil. Atölye ve ders programı uydurmadır; böylece cevap doğrudan sayfada kontrol edilebilir.',
      print: {
        task: 'Ders programı: “Robotlar — Pzt 15.00; Resim — Çrş 16.30”. Asistan şöyle dedi: “Robotlar Çarşamba.” 1) Hatayı bul. 2) Düzelt. 3) Asistan şöyle dedi: “Bir ders 50 TL.” Bunu ders programıyla kontrol edebilir misin?',
        answers: '1) Gün ve saat karışmış. 2) Robotlar Pazartesi saat 15.00’te. 3) Hayır: ders programında ücret yok — henüz bilinemez; atölyeye sormak gerekir.',
      },
    },
  },
  tiny: {
    goal: 'Hadi, asistanın doğru söyleyip söylemediğini ders programından kontrol edelim.',
    steps: [
      { title: 'Ders programıyla karşılaştır', intro: 'Bir yetişkin sesli okur. Asistan şöyle dedi: “Robot grubu Çarşamba.” Ders programına birlikte bakın.', doc: SCHEDULE,
        questions: [{ q: 'Robotlar Çarşamba mı?', options: ['Evet', 'Hayır'], correct: 1, ok: 'Doğru: ders programında robotlar Pazartesi. Asistan yanılmış.', noAll: '“Robotlar” satırını birlikte bulun. Hangi gün yazıyor?' }] },
      { title: 'Neden böyle düşünüyorsun?', questions: [{ q: 'Nereden biliyorsun?', options: ['Ders programına baktım', 'Asistan çok emin konuşuyordu'], correct: 0, ok: 'Evet! Ders programından kontrol ettik.', noAll: 'Emin bir ses kontrol demek değildir. Nereye baktık?' }] },
      { title: 'Yeni örnek', intro: 'Asistan şöyle dedi: “Gezi 50 TL.” Duyuruda sadece saat yazıyor.', doc: SCHEDULE2,
        questions: [{ q: 'Ücreti biliyor muyuz?', options: ['Evet, 50 TL', 'Henüz bilmiyoruz — bir yetişkine ya da danışmaya sormalıyız'], correct: 1, ok: 'Doğru: duyuruda ücret yok. Bilmediğimizde bunu söyleriz — ve sorarız.', noAll: 'Duyuruya bak: ücret yazıyor mu?' }] },
    ],
  },
  child: {
    goal: 'Kendinden emin bir cevaptaki hatayı bul, belgeyle düzelt ve “yanlış” ile “henüz bilinemez”i ayırt et.',
    steps: [findStep(), fixStep, unknownStep],
  },
  teen: {
    goal: 'İfadeleri belgeyle karşılaştır, “yanlış” ile “henüz bilinemez”i ayırt et ve kaynakları köken ve tarihe göre karşılaştır.',
    steps: [findStep(), fixStep, unknownStep, { ...twoSources, questions: [...twoSources.questions, teenWhy] }],
  },
  adult: {
    goal: 'İfadeleri asıl kaynaktan kontrol et; köken, tarih ve ilgiyi tart; kontrolün kapsamını kararın önemine göre ayarla.',
    steps: [findStep(), fixStep, unknownStep, { ...twoSources, questions: [...twoSources.questions, teenWhy, adultStakes] }],
  },
};
