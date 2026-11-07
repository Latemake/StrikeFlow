const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
function setup(language = 'fi') {
    const context = vm.createContext({ settings: { language } });
    vm.runInContext(html.slice(html.indexOf('const UI_TRANSLATIONS ='), html.indexOf('function translateDocument(')), context);
    return context;
}

test('Finnish and German translate techniques and preserve combo separators and numbers', () => {
    const c = setup();
    const source = 'Jab-cross-hook, slip, 1-2-low kick';
    assert.equal(c.t(source), 'Etukäden suora-takakäden suora-koukku, sivuväistö, 1-2-alapotku');
    c.settings.language = 'de';
    assert.equal(c.t(source), 'Führhand-Schlaghand-Haken, seitliches Ausweichen, 1-2-Tiefkick');
    c.settings.language = 'en';
    assert.equal(c.t(source), source);
});

test('specific techniques win over individual words without corrupting unrelated words', () => {
    const c = setup();
    assert.equal(c.t('Double jab, rear hook, lead uppercut, body kick.'),
        'Kaksi etukäden suoraa, takakäden koukku, etukäden kohokoukku, vartalopotku.');
    assert.equal(c.t('crossing, hooker, headline, checkbox'), 'crossing, hooker, headline, checkbox');
    assert.equal(c.t(' JAB / SLIP '), ' ETUKÄDEN SUORA / SIVUVÄISTÖ ');
});

test('spar objectives translate as instructions and keep repetition counts', () => {
    const c = setup();
    assert.equal(c.t('Land 5x jab, cross, low kick'), 'Toista 5 kertaa: etukäden suora, takakäden suora, alapotku');
    assert.equal(c.t('Slip 10x punches and counter'), 'Väistä 10 lyöntiä sivulle ja vastaa vastaiskulla');
    assert.equal(c.t('Block 5x kicks'), 'Torju 5 potkua');
    assert.equal(c.t('Catch 4x kicks'), 'Ota kiinni 4 potkua');
    assert.equal(c.t('Sweep opponent 3x times'), 'Pyyhkäise vastustaja 3 kertaa');
    c.settings.language = 'de';
    assert.equal(c.t('Land 5x jab, cross, low kick'), '5 Mal ausführen: Führhand, Schlaghand, Tiefkick');
});

test('all spar objectives translate techniques in both supported translations', () => {
    const c = setup();
    vm.runInContext(html.slice(html.indexOf('const TASKS ='), html.indexOf('// Settings', html.indexOf('const TASKS ='))), c);
    const tasks = vm.runInContext('[...Object.values(TASKS).flat(), ...TRAINING_TASKS]', c);
    for (const language of ['fi', 'de']) {
        c.settings.language = language;
        for (const source of tasks) {
            const result = c.t(source);
            assert.notEqual(result, source, `${language}: ${source}`);
            assert.doesNotMatch(result, /\b(jabs?|cross(?:es)?|hooks?|uppercuts?|slips?|teeps?|knees|low kicks?|body kicks?)\b/i,
                `${language}: ${source}`);
        }
    }
});

test('translated nodes survive repeated language switches and accept updated drill text', () => {
    const c = setup();
    const node = { nodeValue: 'Jab, slip' };
    c.translateTextNode(node);
    assert.equal(node.nodeValue, 'Etukäden suora, sivuväistö');
    c.translateTextNode(node); // Observer sees our own write.
    c.settings.language = 'de';
    c.translateTextNode(node);
    assert.equal(node.nodeValue, 'Führhand, seitliches Ausweichen');
    c.settings.language = 'en';
    c.translateTextNode(node);
    assert.equal(node.nodeValue, 'Jab, slip');
    c.settings.language = 'fi';
    node.nodeValue = 'Cross, check'; // The workout advances in the same node.
    c.translateTextNode(node);
    assert.equal(node.nodeValue, 'Takakäden suora, sääritorjunta');
    c.settings.language = 'en';
    c.translateTextNode(node);
    assert.equal(node.nodeValue, 'Cross, check');
});

test('complete instruction translations take precedence over word replacements', () => {
    const c = setup();
    assert.equal(c.t('Slip, roll, block, check and answer with one clean strike.'),
        'Tee sivuväistö, väistä alakautta, torju käsillä tai säärellä ja vastaa yhdellä puhtaalla iskulla.');
    assert.equal(c.t('ROUND 2/5'), 'ERÄ 2/5');
    assert.equal(c.t('ROUND START/END SOUNDS'), 'ERÄN ALKU- JA LOPPUÄÄNET');
    assert.equal(c.t('BOXING FOUNDATIONS'), 'Nyrkkeilyn perusteet');
    assert.equal(c.t('Boxing rounds - 6 x 3 min, 30 s rest'), 'Nyrkkeilyerät - 6 x 3 min, 30 s tauko');
});

test('every new voice pilot drill has translated instructions and titles', () => {
    const c = setup();
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'training-sports.js'), 'utf8'), c);
    const workouts = vm.runInContext('Object.values(SPORT_TRAINING_WORKOUTS).flatMap(byDuration => byDuration[30])', c);
    for (const language of ['fi', 'de']) {
        c.settings.language = language;
        for (const workout of workouts) {
            for (const section of workout.sections) {
                for (const [title, note] of section.rounds || []) {
                    assert.notEqual(c.t(title), title);
                    assert.notEqual(c.t(note), note);
                    assert.doesNotMatch(c.t(note), /\b(jab|cross|hook|slip|step|your|holding|immediately|repeat|and|the)\b/i);
                }
            }
        }
    }
});
