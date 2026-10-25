/* ═══════════════════════════════════════════════════════════════════
   KIDS AI TEST  ·  storage-ui.js
   💾 button in the top bar + panel: where progress is kept, an explicit
   switch for saving on this device, and a delete button. Also a notice
   when saves from an older version are found on the device.
═══════════════════════════════════════════════════════════════════ */

'use strict';

(function () {
  const T = {
    en: { btn: 'Saving', title: 'Where is progress kept?',
      tab: 'Now: only in this browser tab. Closing the tab clears it.',
      dev: 'Now: saved on this device until you switch it off.',
      mem: 'Now: only until the page reloads (this browser blocks tab storage).',
      off: 'Saving on this device is not available in this browser.',
      sw: 'Save progress on this device', del: 'Delete saved progress', close: 'Close',
      note: 'Nothing is sent anywhere. A grown-up should decide about saving on a shared device.',
      legacy: 'Progress from an earlier visit is saved on this device.',
      keep: 'Keep saving here', remove: 'Delete it',
      quota: 'Could not save on the device (storage full). Progress is kept in this tab.',
      done: 'Saved progress deleted.', confirm: 'Delete all saved progress of Kids AI Test on this device and in this tab?' },
    ru: { btn: 'Сохранение', title: 'Где хранится прогресс?',
      tab: 'Сейчас: только в этой вкладке. Закроете вкладку — прогресс исчезнет.',
      dev: 'Сейчас: сохраняется на этом устройстве, пока вы не выключите.',
      mem: 'Сейчас: только до перезагрузки страницы (браузер запрещает хранение во вкладке).',
      off: 'В этом браузере сохранение на устройстве недоступно.',
      sw: 'Сохранять прогресс на этом устройстве', del: 'Удалить сохранённый прогресс', close: 'Закрыть',
      note: 'Ничего никуда не отправляется. О сохранении на общем устройстве пусть решает взрослый.',
      legacy: 'На этом устройстве есть прогресс с прошлого визита.',
      keep: 'Продолжить сохранять', remove: 'Удалить его',
      quota: 'Не удалось сохранить на устройстве (память заполнена). Прогресс остаётся в этой вкладке.',
      done: 'Сохранённый прогресс удалён.', confirm: 'Удалить весь сохранённый прогресс Kids AI Test на этом устройстве и в этой вкладке?' },
    de: { btn: 'Speichern', title: 'Wo wird der Fortschritt gespeichert?',
      tab: 'Jetzt: nur in diesem Browser-Tab. Beim Schließen wird er gelöscht.',
      dev: 'Jetzt: auf diesem Gerät gespeichert, bis du es ausschaltest.',
      mem: 'Jetzt: nur bis zum Neuladen der Seite (dieser Browser blockiert Tab-Speicher).',
      off: 'Speichern auf dem Gerät ist in diesem Browser nicht verfügbar.',
      sw: 'Fortschritt auf diesem Gerät speichern', del: 'Gespeicherten Fortschritt löschen', close: 'Schließen',
      note: 'Nichts wird irgendwohin gesendet. Über das Speichern auf einem geteilten Gerät sollte ein Erwachsener entscheiden.',
      legacy: 'Auf diesem Gerät ist Fortschritt von einem früheren Besuch gespeichert.',
      keep: 'Weiter hier speichern', remove: 'Löschen',
      quota: 'Speichern auf dem Gerät fehlgeschlagen (Speicher voll). Der Fortschritt bleibt in diesem Tab.',
      done: 'Gespeicherter Fortschritt gelöscht.', confirm: 'Gesamten gespeicherten Fortschritt von Kids AI Test auf diesem Gerät und in diesem Tab löschen?' },
    es: { btn: 'Guardar', title: '¿Dónde se guarda el progreso?',
      tab: 'Ahora: solo en esta pestaña. Al cerrarla, se borra.',
      dev: 'Ahora: guardado en este dispositivo hasta que lo desactives.',
      mem: 'Ahora: solo hasta recargar la página (este navegador bloquea el almacenamiento de pestaña).',
      off: 'Guardar en el dispositivo no está disponible en este navegador.',
      sw: 'Guardar el progreso en este dispositivo', del: 'Borrar el progreso guardado', close: 'Cerrar',
      note: 'No se envía nada a ningún sitio. En un dispositivo compartido, que decida un adulto.',
      legacy: 'Hay progreso de una visita anterior guardado en este dispositivo.',
      keep: 'Seguir guardando aquí', remove: 'Borrarlo',
      quota: 'No se pudo guardar en el dispositivo (almacenamiento lleno). El progreso sigue en esta pestaña.',
      done: 'Progreso guardado borrado.', confirm: '¿Borrar todo el progreso guardado de Kids AI Test en este dispositivo y en esta pestaña?' },
    fr: { btn: 'Sauvegarde', title: 'Où la progression est-elle gardée ?',
      tab: 'Maintenant : seulement dans cet onglet. Fermer l\'onglet l\'efface.',
      dev: 'Maintenant : enregistrée sur cet appareil jusqu\'à ce que tu désactives.',
      mem: 'Maintenant : seulement jusqu\'au rechargement (ce navigateur bloque le stockage d\'onglet).',
      off: 'L\'enregistrement sur l\'appareil n\'est pas disponible dans ce navigateur.',
      sw: 'Enregistrer la progression sur cet appareil', del: 'Effacer la progression enregistrée', close: 'Fermer',
      note: 'Rien n\'est envoyé nulle part. Sur un appareil partagé, c\'est à un adulte de décider.',
      legacy: 'Une progression d\'une visite précédente est enregistrée sur cet appareil.',
      keep: 'Continuer à enregistrer ici', remove: 'L\'effacer',
      quota: 'Impossible d\'enregistrer sur l\'appareil (stockage plein). La progression reste dans cet onglet.',
      done: 'Progression enregistrée effacée.', confirm: 'Effacer toute la progression de Kids AI Test enregistrée sur cet appareil et dans cet onglet ?' },
    hi: { btn: 'सहेजना', title: 'प्रगति कहाँ रखी जाती है?',
      tab: 'अभी: केवल इसी ब्राउज़र टैब में। टैब बंद करने पर मिट जाएगी।',
      dev: 'अभी: इस डिवाइस पर सहेजी जा रही है, जब तक आप बंद न करें।',
      mem: 'अभी: केवल पेज दोबारा लोड होने तक (यह ब्राउज़र टैब स्टोरेज रोकता है)।',
      off: 'इस ब्राउज़र में डिवाइस पर सहेजना उपलब्ध नहीं है।',
      sw: 'इस डिवाइस पर प्रगति सहेजें', del: 'सहेजी गई प्रगति मिटाएँ', close: 'बंद करें',
      note: 'कुछ भी कहीं नहीं भेजा जाता। साझा डिवाइस पर सहेजने का फ़ैसला किसी बड़े को करना चाहिए।',
      legacy: 'इस डिवाइस पर पिछली बार की प्रगति सहेजी हुई है।',
      keep: 'यहीं सहेजते रहें', remove: 'उसे मिटाएँ',
      quota: 'डिवाइस पर सहेजा नहीं जा सका (स्टोरेज भरा है)। प्रगति इसी टैब में है।',
      done: 'सहेजी गई प्रगति मिटा दी गई।', confirm: 'इस डिवाइस और इस टैब में Kids AI Test की सारी सहेजी गई प्रगति मिटाएँ?' },
    id: { btn: 'Simpan', title: 'Di mana kemajuan disimpan?',
      tab: 'Sekarang: hanya di tab browser ini. Menutup tab akan menghapusnya.',
      dev: 'Sekarang: tersimpan di perangkat ini sampai kamu mematikannya.',
      mem: 'Sekarang: hanya sampai halaman dimuat ulang (browser ini memblokir penyimpanan tab).',
      off: 'Menyimpan di perangkat tidak tersedia di browser ini.',
      sw: 'Simpan kemajuan di perangkat ini', del: 'Hapus kemajuan tersimpan', close: 'Tutup',
      note: 'Tidak ada yang dikirim ke mana pun. Di perangkat bersama, biarkan orang dewasa yang memutuskan.',
      legacy: 'Ada kemajuan dari kunjungan sebelumnya yang tersimpan di perangkat ini.',
      keep: 'Tetap simpan di sini', remove: 'Hapus',
      quota: 'Gagal menyimpan di perangkat (penyimpanan penuh). Kemajuan tetap ada di tab ini.',
      done: 'Kemajuan tersimpan dihapus.', confirm: 'Hapus semua kemajuan Kids AI Test yang tersimpan di perangkat ini dan di tab ini?' },
    pt: { btn: 'Salvar', title: 'Onde o progresso fica guardado?',
      tab: 'Agora: só nesta aba do navegador. Fechar a aba apaga.',
      dev: 'Agora: salvo neste dispositivo até você desligar.',
      mem: 'Agora: só até recarregar a página (este navegador bloqueia o armazenamento da aba).',
      off: 'Salvar no dispositivo não está disponível neste navegador.',
      sw: 'Salvar o progresso neste dispositivo', del: 'Apagar o progresso salvo', close: 'Fechar',
      note: 'Nada é enviado a lugar nenhum. Em um dispositivo compartilhado, um adulto deve decidir.',
      legacy: 'Há progresso de uma visita anterior salvo neste dispositivo.',
      keep: 'Continuar salvando aqui', remove: 'Apagar',
      quota: 'Não foi possível salvar no dispositivo (armazenamento cheio). O progresso continua nesta aba.',
      done: 'Progresso salvo apagado.', confirm: 'Apagar todo o progresso salvo do Kids AI Test neste dispositivo e nesta aba?' },
    tr: { btn: 'Kayıt', title: 'İlerleme nerede tutuluyor?',
      tab: 'Şu an: yalnızca bu tarayıcı sekmesinde. Sekmeyi kapatınca silinir.',
      dev: 'Şu an: siz kapatana kadar bu cihaza kaydediliyor.',
      mem: 'Şu an: yalnızca sayfa yenilenene kadar (bu tarayıcı sekme depolamasını engelliyor).',
      off: 'Bu tarayıcıda cihaza kaydetme kullanılamıyor.',
      sw: 'İlerlemeyi bu cihaza kaydet', del: 'Kayıtlı ilerlemeyi sil', close: 'Kapat',
      note: 'Hiçbir şey hiçbir yere gönderilmez. Ortak bir cihazda kaydetmeye bir yetişkin karar vermeli.',
      legacy: 'Bu cihazda önceki bir ziyaretten kalan ilerleme kayıtlı.',
      keep: 'Burada kaydetmeye devam et', remove: 'Sil',
      quota: 'Cihaza kaydedilemedi (depolama dolu). İlerleme bu sekmede duruyor.',
      done: 'Kayıtlı ilerleme silindi.', confirm: 'Kids AI Test\'in bu cihazdaki ve bu sekmedeki tüm kayıtlı ilerlemesi silinsin mi?' },
    vi: { btn: 'Lưu', title: 'Tiến trình được giữ ở đâu?',
      tab: 'Hiện tại: chỉ trong tab trình duyệt này. Đóng tab sẽ xóa.',
      dev: 'Hiện tại: được lưu trên thiết bị này cho đến khi bạn tắt.',
      mem: 'Hiện tại: chỉ đến khi tải lại trang (trình duyệt này chặn bộ nhớ tab).',
      off: 'Trình duyệt này không hỗ trợ lưu trên thiết bị.',
      sw: 'Lưu tiến trình trên thiết bị này', del: 'Xóa tiến trình đã lưu', close: 'Đóng',
      note: 'Không có gì được gửi đi đâu cả. Trên thiết bị dùng chung, hãy để người lớn quyết định.',
      legacy: 'Thiết bị này đang lưu tiến trình từ lần truy cập trước.',
      keep: 'Tiếp tục lưu ở đây', remove: 'Xóa nó',
      quota: 'Không lưu được trên thiết bị (bộ nhớ đầy). Tiến trình vẫn ở trong tab này.',
      done: 'Đã xóa tiến trình đã lưu.', confirm: 'Xóa toàn bộ tiến trình đã lưu của Kids AI Test trên thiết bị này và trong tab này?' },
  };

  const lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
  const t = T[lang] || T.en;
  const Store = window.KAT_Store;
  if (!Store) return;

  let btn, panel, msg, sw, lastFocus;

  function el(tag, attrs, text) {
    const e = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v));
    if (text) e.textContent = text;
    return e;
  }

  function build() {
    const bar = document.querySelector('.top-bar');
    if (!bar) return;

    btn = el('button', { type: 'button', class: 'top-btn kat-store-btn', 'aria-haspopup': 'dialog',
      'aria-controls': 'kat-store-panel', title: t.title });
    btn.innerHTML = '💾 <span class="kat-store-btn-label"></span>';
    btn.querySelector('span').textContent = t.btn;
    bar.appendChild(btn);

    panel = el('div', { id: 'kat-store-panel', class: 'kat-store-panel', role: 'dialog',
      'aria-modal': 'true', 'aria-labelledby': 'kat-store-title', hidden: '' });
    panel.innerHTML = `
      <h2 id="kat-store-title" class="kat-store-title"></h2>
      <p class="kat-store-state" role="status" aria-live="polite"></p>
      <label class="kat-store-switch"><input type="checkbox" id="kat-store-sw"> <span></span></label>
      <p class="kat-store-note"></p>
      <div class="kat-store-actions">
        <button type="button" class="btn-outline" data-act="delete"></button>
        <button type="button" class="btn-primary" data-act="close"></button>
      </div>`;
    panel.querySelector('#kat-store-title').textContent = t.title;
    panel.querySelector('.kat-store-switch span').textContent = t.sw;
    panel.querySelector('.kat-store-note').textContent = t.note;
    panel.querySelector('[data-act="delete"]').textContent = t.del;
    panel.querySelector('[data-act="close"]').textContent = t.close;
    document.body.appendChild(panel);

    msg = panel.querySelector('.kat-store-state');
    sw  = panel.querySelector('#kat-store-sw');

    btn.addEventListener('click', open);
    sw.addEventListener('change', () => {
      if (sw.checked) Store.enableDevice(); else Store.disableDevice();
      render();
    });
    panel.querySelector('[data-act="delete"]').addEventListener('click', () => {
      if (!confirm(t.confirm)) return;
      Store.deleteAll();
      render(t.done);
    });
    panel.querySelector('[data-act="close"]').addEventListener('click', close);
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      if (e.key === 'Tab') trapFocus(e);
    });
    Store.onChange(() => { render(); renderLegacy(); });
  }

  function trapFocus(e) {
    const items = [...panel.querySelectorAll('button, input')].filter(x => !x.disabled);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function render(extra) {
    if (!panel) return;
    const s = Store.status();
    sw.checked = s.device;
    sw.disabled = !s.available;
    let text = !s.available ? t.off : s.device ? t.dev : s.tabOnly ? t.mem : t.tab;
    if (!s.available && s.tabOnly) text = t.mem + ' ' + t.off;
    if (s.error === 'quota') text = t.quota;
    if (extra) text = extra + ' ' + text;
    msg.textContent = text;
    btn.classList.toggle('on', s.device);
  }

  function open() {
    lastFocus = document.activeElement;
    render();
    panel.hidden = false;
    sw.disabled ? panel.querySelector('[data-act="close"]').focus() : sw.focus();
  }
  function close() {
    panel.hidden = true;
    (lastFocus && lastFocus.focus ? lastFocus : btn).focus();
  }

  // Older version stored progress without asking: offer keep / delete.
  function renderLegacy() {
    const s = Store.status();
    let bar = document.getElementById('kat-store-legacy');
    if (!s.legacy) { if (bar) bar.remove(); return; }
    if (bar) return;
    bar = el('div', { id: 'kat-store-legacy', class: 'kat-store-legacy', role: 'region', 'aria-label': t.title });
    bar.innerHTML = `<p></p><div class="kat-store-actions">
      <button type="button" class="btn-primary" data-act="keep"></button>
      <button type="button" class="btn-outline" data-act="remove"></button></div>`;
    bar.querySelector('p').textContent = t.legacy;
    bar.querySelector('[data-act="keep"]').textContent = t.keep;
    bar.querySelector('[data-act="remove"]').textContent = t.remove;
    bar.querySelector('[data-act="keep"]').addEventListener('click', () => {
      if (Store.keepLegacy()) location.reload();   // reload so modules read the kept progress
    });
    bar.querySelector('[data-act="remove"]').addEventListener('click', () => {
      Store.deleteDevice(); bar.remove();
    });
    const page = document.querySelector('.page') || document.body;
    page.insertBefore(bar, page.firstChild ? page.firstChild.nextSibling : null);
  }

  function init() { build(); render(); renderLegacy(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
