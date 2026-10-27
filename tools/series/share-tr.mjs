// Lesson C, Turkish ("sen"): "Neyi paylaşabilirim?". Every name, address and
// number below is made up for the demo (Turkish names, a phone of zeros); the
// child never types anything about themselves. Adapted, not word for word.
// Not reviewed by a native-speaking editor or a teacher.

const DEMO = 'Bu, hayali bilgileri olan hayali bir karakter — yalnızca etkinlik için.';
const P = (text, needed, why) => ({ text, needed, why });

const TASK = P('Robotik takımımıza bir isim bulmama yardım et.', true, 'görevin kendisi bu — o olmadan asistan neye ihtiyaç olduğunu bilemez');
const ROBOT = P('Çöpleri ayıran bir robot yapıyoruz.', true, 'uygun bir isim bulmaya yardım eder ve senin kim olduğun hakkında hiçbir şey söylemez');
const NAME = P('Ben Emre Yılmaz,', false, 'bir takıma isim koymak için adın ve soyadın gerekmez');
const SCHOOL = P('Bahçe Sokak’taki Güneş İlkokulu’na gidiyorum,', false, 'okulun ve sokağın seni nerede bulabileceklerini gösterir ve görev için gerekmez');
const PHONE = P('telefon numaram 0000 000 00 00,', false, 'bir isim bulmak için telefon numarası asla gerekmez');
const CLUB = P('her Cumartesi saat 10’da parkın yanındaki satranç kulübüne gidiyorum,', false, 'programın ve gittiğin yer, seni nerede ve ne zaman bulabileceklerini gösterir');
const TEAM = P('Takımda dört kişiyiz.', true, 'üye sayısı hiçbir şey açığa çıkarmaz ve isim bulmaya yardımcı olabilir');

const redact = (pieces, extra = {}) => ({
  q: 'Çıkarılması ya da değiştirilmesi gereken parçalara dokun. Görev anlaşılır kalmalı.',
  checkBtn: 'Kontrol et',
  pieces,
  ok: 'Tamam: görev duruyor, gereksiz olanlar gitti. Her parçanın neden gerekli olup olmadığı şöyle:',
  no: 'Henüz tam değil. Açıklamaya bak: gereksiz bir şey kalmış ya da gerekli bir şey çıkarılmış.',
  ...extra,
});

const elif = {
  title: 'Yeni örnek — kendin çöz',
  intro: 'Başka bir istek. ' + DEMO + ' İpucu: misafirlerin adrese ihtiyacı var, asistanın yok — metinde adres yerine [adres] yazılabilir ve sonra kendin doldurursun.',
  bubble: { who: 'Elif asistana yazıyor', text: 'Benim adım Elif Demir. Cumartesi saat 15.00’teki doğum günüm için bir davetiye yazmama yardım et. Adres: Çam Sokak No: 7, Daire 12. Bir de oyun şifrem güçlü mü, söyler misin: kedicik123?' },
  redact: redact([
    P('Benim adım Elif Demir.', false, 'davetiyeyi kendisi imzalayabilir; asistanın soyadını bilmesine gerek yok'),
    P('Cumartesi saat 15.00’teki doğum günüm için bir davetiye yazmama yardım et.', true, 'görevin kendisi bu; saat de davetiye için gerekli ve tek başına onun kim olduğunu göstermez'),
    P('Adres: Çam Sokak No: 7, Daire 12.', false, 'yerine [adres] yaz ve bitmiş metne kendin ekle'),
    P('Oyun şifrem: kedicik123', false, 'şifre kimseye verilmez, “kontrol etmek için” bile; güçlü bir şifrenin nasıl olduğunu sorabilirsin'),
  ], { result: 'Cumartesi saat 15.00’teki doğum günüm için bir davetiye yazmama yardım et, yer: [adres]. Bir de güçlü bir şifre nasıl olur?', resultH: 'Güvenli istek:' }),
};

export const tr = {
  common: {
    title: 'Neyi paylaşabilirim?',
    desc: 'Hayali bir karakter bir asistandan yardım ister ve kendisi hakkında fazla şey anlatır. Çocuk görevi koruyarak kişisel bilgileri çıkarır ya da değiştirir ve her parçanın neden gerekli olup olmadığına bakar.',
    goal: 'Bir istekte yalnızca görevin ihtiyaç duyduğunu bırakmayı ve kişisel bilgileri paylaşmamayı öğrenmek.',
    noJs: 'Etkinliğin kendisi JavaScript gerektirir. JavaScript olmadan da aşağıda amaç, açıklama ve yazdırılabilir bir görev var.',
    explain1: 'Çoğu görev için asistanın adına, adresine, okuluna, telefon numarana ya da şifrene ihtiyacı yoktur. Görev bunlar olmadan da anlatılabilir.',
    explain2: 'Bazen bir bilgi sonuç için gerekir (örneğin davetiyedeki adres), ama onu asistana vermek zorunda değilsin: boşluk bırak ve kendin doldur.',
    explain3: 'Tek tek zararsız görünen bilgiler bir araya gelince kim olduğunu ve seni nerede bulabileceklerini gösterebilir. Emin değilsen güvendiğin bir yetişkine sor.',
    doneH: 'Sırada ne var?',
    doneText: 'Bir isteği göndermeden önce kendine sor: görevin burada gerçekten neye ihtiyacı var? Gerisi çıkarılabilir ya da değiştirilebilir.',
    choices: ['Bu etkinliği tekrar yap', 'Sonraki etkinlik: “Ayırıcı neden yanıldı?”', 'Tüm dersler'],
    adult: {
      goal: 'Çocuk görevi kişisel bilgilerden ayırır, gereksiz olanı çıkarır ya da değiştirir ve küçük ayrıntıların bir araya gelince birinin kim olduğunu ortaya çıkarabileceğini anlar.',
      questions: ['Emre’nin mesajında isim bulmak için gerekmeyen ne var?', 'Misafirlerin adrese neden ihtiyacı var da asistanın yok?', 'Bir şeyi yazıp yazamayacağından emin değilsen ne yaparsın?'],
      misconception: 'Adını söylemezsen kişisel hiçbir şey paylaşmış olmazsın. Okul, program, yerler ve fotoğraflar bir araya gelince isim olmadan da bir kişiyi gösterebilir.',
      signs: ['Adı, okulu, telefon numarasını ve şifreyi çıkarır ama görevin özünü korur.', 'Yerine bir şey önerir: [adres], sokak yerine “şehrim”.', 'Emin olmadığında bir yetişkine soracağını söyler.'],
      method: 'Bütün isimler, adresler ve numaralar uydurmadır. Çocuk kendisi hakkında hiçbir şey yazmaz: yalnızca hazır bir metnin parçalarını işaretler. Kontrol, işaretleri önceden yazılmış bir açıklamayla karşılaştırır ve her parçayı açıklar.',
      print: {
        task: 'Gereksiz olanların altını çiz: “Merhaba, ben Tepe İlkokulu 3-B sınıfından Zeynep Kaya. Şifrem 1234. Kedi hakkında bir bilmece uydurmama yardım et.” İsteği yalnızca görev kalacak şekilde yeniden yaz.',
        answers: 'Gereksiz: ad ve soyad, sınıf ve okul, şifre. Güvenli istek: “Kedi hakkında bir bilmece uydurmama yardım et.”',
      },
    },
  },
  tiny: {
    goal: 'Hadi, bir asistana neyi anlatabileceğimizi ve neyi kendimize saklamanın daha iyi olduğunu bulalım.',
    steps: [
      { title: 'Ne gereksiz?', intro: 'Bir yetişkin sesli okur. ' + DEMO, bubble: { who: 'Emre asistana yazıyor', text: 'Ben Emre Yılmaz. Robot takımıma bir isim bulmama yardım et. Güneş İlkokulu’na gidiyorum.' },
        redact: redact([NAME, P('Robot takımıma bir isim bulmama yardım et.', true, 'görevin kendisi bu — o olmadan asistan neye ihtiyaç olduğunu bilemez'), P('Güneş İlkokulu’na gidiyorum.', false, 'takıma isim koymak için okul gerekmez')]) },
      { title: 'Emin değilsen ne yaparsın?', questions: [{ q: 'Bir şeyi yazabilir misin, emin değilsin. Ne yaparsın?', options: ['Bir yetişkine sorarım', 'Bildiğim her şeyi yazarım'], correct: 0, ok: 'Evet! Emin olmadığında bir yetişkine sor.', noAll: 'Önce sormak daha iyi. Kime sorabilirsin?' }] },
      { title: 'Yeni örnek', intro: DEMO, questions: [{ q: 'Elif, asistanın kısa bir şiir yazmasını istiyor. Neyi yazmasına GEREK YOK?', options: ['Adresini', 'Şiirin ne hakkında olduğunu'], correct: 0, ok: 'Doğru: şiir için adres gerekmez.', noAll: 'Şiirin ne hakkında olduğu görevin kendisi. O zaman gereksiz olan ne?' }] },
    ],
  },
  child: {
    goal: 'Görevi koruyarak bir istekten kişisel bilgileri çıkar ve her parçanın neden gerekli olup olmadığını açıkla.',
    steps: [
      { title: 'Gereksiz olanı çıkar', intro: DEMO, bubble: { who: 'Emre asistana yazıyor', text: [NAME, SCHOOL, PHONE, TASK, ROBOT].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, PHONE, TASK, ROBOT]) },
      elif,
    ],
  },
  teen: {
    goal: 'Görevi kişisel bilgilerden ayır ve küçük ayrıntıların bir araya gelince bir kişiyi nasıl ortaya çıkardığını anla.',
    steps: [
      { title: 'Gereksiz olanı çıkar', intro: DEMO, bubble: { who: 'Emre asistana yazıyor', text: [NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM]) },
      { title: 'Ayrıntılar bir araya gelince', questions: [{ q: 'Emre adını çıkardı ama “Bahçe Sokak’taki Güneş İlkokulu” ve “Cumartesi saat 10’da parkın yanında satranç” kaldı. Bu neden hâlâ riskli?',
        options: ['Bu ayrıntılar bir araya gelince, isim olmasa da onu nerede ve ne zaman bulabileceklerini ele verir', 'Riskli değil: isim yoksa kimse onun kim olduğunu bilemez', 'Sadece “satranç” kelimesi yüzünden riskli'], correct: 0,
        ok: 'Evet. Ayrıntılar tek tek zararsızdır; bir araya gelince tek bir kişiye kadar daralır.', noAll: 'Düşün: Güneş İlkokulu’ndan kaç erkek çocuk Cumartesi saat 10’da parkın yanındaki satranç kulübüne gidiyordur?' }] },
      elif,
    ],
  },
  adult: {
    goal: 'Bir istekteki verileri en aza indir; ayrıntıların bir araya gelmesini ve isteği kimin aldığını hesaba kat.',
    steps: [
      { title: 'Gereksiz olanı çıkar', intro: DEMO, bubble: { who: 'Emre asistana yazıyor', text: [NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM].map((p) => p.text).join(' ') },
        redact: redact([NAME, SCHOOL, CLUB, TASK, ROBOT, TEAM]) },
      { title: 'Bir araya gelen ayrıntılar ve onları kim alır', questions: [
        { q: 'Emre adını çıkardı ama okulunu, sokağını ve kulübünün saatini bıraktı. Bu neden hâlâ riskli?',
          options: ['Bu ayrıntılar bir araya gelince tek bir kişiye kadar daralır ve onu nerede, ne zaman bulabileceklerini gösterir', 'Riskli değil: isim yoksa kimse onun kim olduğunu bilemez', 'Yalnızca yetişkinler için riskli'], correct: 0,
          ok: 'Evet. Buna yeniden tanımlama denir: bir kişi, özelliklerinin birleşiminden tanınır.', noAll: 'Bütün bunlara aynı anda kaç kişinin uyduğunu düşün.' },
        { q: 'Bir sohbet botuna gönderilen isteği, onu işleten şirket alır. Bundan ne çıkar?',
          options: ['Bir yabancı okuyabilirmiş gibi yaz: herkese açık bir panoya asmayacağın hiçbir şeyi yazma', 'Hiçbir şey: botla sohbetler her zaman tamamen gizlidir', 'Sohbeti sonra silersen her şeyi yazabilirsin'], correct: 0,
          ok: 'Evet. Her hizmet verileri farklı kurallarla saklar; gereksiz şeyleri baştan hiç göndermemek daha güvenlidir.', noAll: 'Bir isteği kimin, ne kadar süre gördüğünü kesin olarak bilemeyiz. O zaman nasıl yazmak mantıklı?' },
      ] },
      elif,
    ],
  },
};
