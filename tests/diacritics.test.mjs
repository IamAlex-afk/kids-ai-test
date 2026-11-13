// Text written without accents/umlauts (e.g. "donnees", "nao", "ueber") reads as a typo to native speakers.
// It slipped into ES/FR/PT game facts once (fixed in #80). Each word below does not exist without its
// diacritic, so a hit is a real error, not a style choice. Word edges are Unicode letters (\b would
// treat "ê" as a boundary and flag "tres" inside "êtres").
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const WORDS = {
  es: 'informacion|aplicacion|codigo|rapid[oa]s?|imagenes|maquinas?|tambien|despues|ademas|matematicas|estadisticas?|logica|especific[oa]s|explicit[oa]|educacion|tecnologia|sabiduria|algun|segun|traves|aqui|asi',
  fr: 'donnees|entrainement|entrainee?s?|systemes|probleme|reponses?|tres|etre|meme|deja|cree[es]?|specifiques?|securite|realite|ecran|regles|modeles|verifie[rz]?|generees?|reseaux',
  pt: 'nao|voce|sao|tambem|informacao|informacoes|codigo|rapid[oa]s?|maquinas?|logica|matematicas|especificos|seguranca|aplicacao|atencao|funcoes|neuronios|relacoes|inteligencia|cerebro|robo',
  de: 'ueber|fuer|koennen|muessen|moeglich|natuerlich|groesser|Gefuehle?|Maedchen|waehlen|spaeter|Erklaerung',
  vi: 'khong|nguoi|duoc|nhieu|nhung|thong minh|tri tue|hoc sinh',
};
const files = (l) => [`data/${l}.js`, `tools/articles/${l}.mjs`, `${l}.html`].filter((f) => fs.existsSync(f));

for (const [l, words] of Object.entries(WORDS)) {
  const re = new RegExp(`(?<!\\p{L})(${words})(?!\\p{L})`, l === 'de' ? 'gu' : 'giu');
  test(`${l}: no words missing their diacritics`, () => {
    const hits = [];
    for (const f of files(l)) {
      fs.readFileSync(f, 'utf8').split(/\r?\n/).forEach((line, i) => {
        // URLs and file names legitimately contain ASCII-only words
        const text = line.replace(/https?:\/\/\S+/g, '');
        for (const m of text.matchAll(re)) hits.push(`${f}:${i + 1} "${m[0]}"`);
      });
    }
    assert.deepEqual(hits, [], `words without diacritics:\n${hits.join('\n')}`);
  });
}
