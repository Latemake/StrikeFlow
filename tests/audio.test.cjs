const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// Exercise the shipped browser code, including its actual click/bell wiring.
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
function section(start, end) {
    return html.slice(html.indexOf(start), html.indexOf(end, html.indexOf(start)));
}
function deferred() {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
}
const settle = () => new Promise(resolve => setImmediate(resolve));

class FakeAudio {
    constructor(src) {
        this.dataset = { src };
        this.paused = true;
        this.muted = false;
        this.volume = 1;
        this.currentTime = 0;
        this.plays = 0;
        this.pauses = 0;
        this.loads = 0;
        this.results = [];
    }
    load() { this.loads++; }
    pause() { this.paused = true; this.pauses++; }
    play() {
        this.plays++;
        this.paused = false;
        const result = this.results.shift();
        if (result instanceof Error) throw result;
        return result || Promise.resolve();
    }
}
function setup() {
    const context = vm.createContext({ Audio: FakeAudio, Promise, WeakMap,
        document: { addEventListener() {} }, navigator: { vibrate() {} },
        settings: { uiClickSoundsEnabled: true, roundSoundsEnabled: true, vibrationEnabled: false },
        ensureAudioReady() {}, clicks: 0, bells: 0,
        playSyntheticUiClick() { context.clicks++; },
        playToneEffect() { context.bells++; }
    });
    vm.runInContext(`
        const audioPlaybackStates = new WeakMap();
        let audioUnlocked = false;
        const uiClickAudioPool = [new Audio('click')];
        const roundStartAudioPool = [new Audio('start')];
        const roundEndAudioPool = [new Audio('end')];
        const managedAudioPools = [uiClickAudioPool, roundStartAudioPool, roundEndAudioPool];
        let uiClickAudioIndex = 0, roundStartAudioIndex = 0, roundEndAudioIndex = 0;
        ${section('function createManagedAudio(', "['pointerdown', 'touchstart', 'keydown']")}
        ${section('function playUiClick(', 'function playSyntheticUiClick(')}
        ${section('function playRoundStart(', '// Swipe up to skip break')}
        this.pools = managedAudioPools;
    `, context);
    return context;
}

test('all inline scripts parse', () => {
    for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
        new vm.Script(match[1]);
    }
});

test('late silent priming completion cannot stop an audible bell', async () => {
    const c = setup(), audio = c.pools[1][0], pending = deferred();
    audio.results.push(pending.promise);
    c.primeAudioElement(audio);
    c.playRoundStart();
    audio.currentTime = 0.25;
    const pauses = audio.pauses;
    pending.resolve();
    await settle();
    assert.equal(audio.pauses, pauses);
    assert.equal(audio.currentTime, 0.25);
    assert.equal(audio.paused, false);
    assert.equal(audio.muted, false);
    assert.equal(audio.volume, 1);
});

test('duplicate gestures cannot prime an element twice while pending', async () => {
    const c = setup(), audio = c.pools[0][0], pending = deferred();
    audio.results.push(pending.promise);
    c.unlockAppAudio();
    c.unlockAppAudio();
    assert.equal(audio.plays, 1);
    pending.resolve();
    await settle();
    assert.equal(audio.muted, false);
    assert.equal(audio.volume, 1);
});

test('failed unlocking is retried on the next user gesture', async () => {
    const c = setup(), audio = c.pools[0][0];
    audio.results.push(Promise.reject(new Error('blocked')));
    c.unlockAppAudio();
    await settle();
    assert.equal(audio.muted, false);
    c.unlockAppAudio();
    await settle();
    assert.equal(audio.plays, 2);
    c.unlockAppAudio();
    assert.equal(audio.plays, 2);
});

test('gestures do not reload or mute a playing sound', async () => {
    const c = setup(), audio = c.pools[1][0];
    c.playRoundStart();
    c.unlockAppAudio();
    await settle();
    assert.equal(audio.loads, 0);
    assert.equal(audio.plays, 1);
    assert.equal(audio.muted, false);
    assert.equal(audio.paused, false);
});

test('late priming rejection leaves newer audible playback intact', async () => {
    const c = setup(), audio = c.pools[2][0], pending = deferred();
    audio.results.push(pending.promise);
    c.primeAudioElement(audio);
    c.playRoundEnd();
    const pauses = audio.pauses;
    pending.reject(new Error('interrupted prime'));
    await settle();
    assert.equal(audio.pauses, pauses);
    assert.equal(audio.muted, false);
    assert.equal(audio.volume, 1);
    assert.equal(c.bells, 0);
});

test('transient media failure retries the same unlocked element', async () => {
    const c = setup(), audio = c.pools[1][0];
    audio.results.push(Promise.reject(new Error('media interrupted')));
    c.playRoundStart();
    await settle();
    assert.equal(c.pools[1][0], audio);
    assert.equal(audio.plays, 2);
    assert.equal(audio.loads, 1);
    assert.equal(c.bells, 0);
});

for (const [pool, action, fallback] of [[0, 'playUiClick', 'clicks'], [1, 'playRoundStart', 'bells'], [2, 'playRoundEnd', 'bells']]) {
    test(`${action} has an audible fallback after two failed attempts`, async () => {
        const c = setup(), audio = c.pools[pool][0];
        audio.results.push(Promise.reject(new Error('first')), Promise.reject(new Error('retry')));
        c[action]();
        await settle();
        assert.equal(audio.plays, 2);
        assert.equal(c[fallback], 1);
    });
}

test('autoplay denial goes directly to fallback without creating a blocked replacement', async () => {
    const c = setup(), audio = c.pools[1][0];
    audio.results.push(Promise.reject(Object.assign(new Error('blocked'), { name: 'NotAllowedError' })));
    c.playRoundStart();
    await settle();
    assert.equal(audio.plays, 1);
    assert.equal(c.pools[1][0], audio);
    assert.equal(c.bells, 1);
});

test('stale playback failure cannot restart or duplicate a newer sound', async () => {
    const c = setup(), audio = c.pools[0][0], pending = deferred();
    audio.results.push(pending.promise);
    c.playUiClick();
    c.playUiClick();
    pending.reject(new Error('old playback'));
    await settle();
    assert.equal(audio.plays, 2);
    assert.equal(audio.loads, 0);
    assert.equal(c.clicks, 0);
});

test('synchronous playback errors also reach fallback', async () => {
    const c = setup(), audio = c.pools[2][0];
    audio.results.push(new Error('first'), new Error('retry'));
    c.playRoundEnd();
    await settle();
    assert.equal(c.bells, 1);
});

test('pool rotation wraps and successful playback uses full volume', async () => {
    const c = setup(), pool = [new FakeAudio('a'), new FakeAudio('b')];
    pool[1].muted = true;
    pool[1].volume = 0;
    const result = c.playLoudAudioFromPool(pool, 1);
    await settle();
    assert.equal(result.nextIndex, 0);
    assert.equal(pool[1].volume, 1);
    assert.equal(pool[1].muted, false);
});

test('disabled sounds trigger neither media playback nor fallback', async () => {
    const c = setup();
    c.settings.uiClickSoundsEnabled = false;
    c.settings.roundSoundsEnabled = false;
    c.playUiClick(); c.playRoundStart(); c.playRoundEnd();
    await settle();
    assert.equal(c.pools.flat().reduce((n, audio) => n + audio.plays, 0), 0);
    assert.equal(c.clicks + c.bells, 0);
});


test('ten-second cue keeps vibration without requiring speech support', () => {
    const calls = [];
    const c = vm.createContext({ settings: { vibrationEnabled: true }, navigator: { vibrate: value => calls.push(value) } });
    vm.runInContext(section('function playWarningVibration(', 'function playRoundStart('), c);
    c.playWarningVibration();
    assert.deepEqual(calls, [200]);
    c.settings.vibrationEnabled = false;
    c.playWarningVibration();
    assert.deepEqual(calls, [200]);
    c.settings.vibrationEnabled = true;
    c.navigator = {};
    assert.doesNotThrow(() => c.playWarningVibration());
});
