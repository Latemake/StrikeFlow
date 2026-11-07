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
    const context = vm.createContext({ Audio: FakeAudio, Promise, WeakMap, setTimeout, clearTimeout,
        document: { addEventListener() {} }, navigator: { vibrate() {} },
        settings: { roundBellRepeats: 1, uiClickSoundsEnabled: true, roundSoundsEnabled: true, vibrationEnabled: false },
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
        ${section('function cancelRoundBellRepeats(', '// Swipe up to skip break')}
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

function addSessionFlow(c) {
    Object.assign(c, {
        timerState: { timeLeft: 180, currentRound: 1, isRound: true, isRunning: false, isFinished: false },
        sessionStats: { completedRounds: 0 }, taskState: {}, appMode: 'spar',
        intervalId: null, lastTickMs: null, lastWholeSecond: null,
        performance: { now: () => 1000 }, setInterval: () => 1, clearInterval() {},
        trainingCueController: { reset() {} }, stopPreRoundDisplay() {}, releaseWakeLock() {},
        requestWakeLock() {}, showModeChoice() {}, updateUI() {}, syncTrainingAudio() {}, tick() {},
        PRE_ROUND_READ_SECONDS: 5, finishedOverlay: { classList: { remove() {} } }
    });
    Object.assign(c.settings, { roundTime: 180, breakTime: 60, numberOfRounds: 3, taskSparEnabled: false });
    vm.runInContext(section('function openModeChoice(', 'function chooseSparMode('), c);
    vm.runInContext(section('function toggleTimer(', '// Continue timer'), c);
    vm.runInContext(section('function resetTimer(', 'let selectedTrainingDuration'), c);
}

test('leaving a spar session stops old audio and a new session primes and plays its bell', async () => {
    const c = setup();
    addSessionFlow(c);
    c.toggleTimer();
    await settle();
    const bell = c.pools[1][0];
    assert.equal(bell.paused, false);
    c.openModeChoice();
    assert.equal(bell.paused, true);
    c.resetTimer();
    const primingPlays = c.pools[2][0].plays;
    c.toggleTimer();
    await settle();
    assert.ok(c.pools[2][0].plays > primingPlays, 'new start refreshes media readiness');
    assert.equal(bell.paused, false);
    assert.equal(bell.muted, false);
    assert.equal(bell.volume, 1);
});

test('an old session playback rejection cannot retry over the next session bell', async () => {
    const c = setup(), pending = deferred();
    addSessionFlow(c);
    c.pools[1][0].results.push(pending.promise);
    c.toggleTimer();
    c.openModeChoice();
    c.resetTimer();
    c.toggleTimer();
    const plays = c.pools[1][0].plays;
    pending.reject(new Error('old session interrupted'));
    await settle();
    assert.equal(c.pools[1][0].plays, plays);
    assert.equal(c.pools[1][0].muted, false);
    assert.equal(c.bells, 0);
});

test('leaving invalidates an unfinished silent unlock before it can change the next session', async () => {
    const c = setup(), pending = deferred(), audio = c.pools[1][0];
    addSessionFlow(c);
    audio.results.push(pending.promise);
    c.primeAudioElement(audio);
    c.openModeChoice();
    const pauses = audio.pauses;
    pending.resolve();
    await settle();
    assert.equal(audio.pauses, pauses);
    c.resetTimer();
    c.toggleTimer();
    await settle();
    assert.equal(audio.paused, false);
    assert.equal(audio.muted, false);
    assert.equal(audio.volume, 1);
});

test('resetting a finished spar preserves the gesture-unlocked audio context', () => {
    const c = setup(), fresh = [];
    addSessionFlow(c);
    c.ensureAudioReady = forceFresh => fresh.push(forceFresh);
    c.timerState.isFinished = true;
    c.resetTimer();
    assert.ok(!fresh.includes(true), 'session reset must not close the unlocked context');
});

test('spar cleanup never stops an idle speech engine', () => {
    let stops = 0;
    const c = vm.createContext({
        window: { speechSynthesis: { cancel() { stops++; } } },
        voiceTestGeneration: 0, pendingBrowserSpeech: null, nativeSpeechGeneration: 0,
        nativeSpeechActive: false,
        nativeVoiceCoach: () => ({ stop() { stops++; return Promise.resolve(); } })
    });
    vm.runInContext(section('function cancelCoachSpeech(', 'function offlineBrowserVoice('), c);
    c.cancelCoachSpeech();
    c.cancelCoachSpeech();
    assert.equal(stops, 0);
    c.nativeSpeechActive = true;
    c.cancelCoachSpeech();
    c.cancelCoachSpeech();
    assert.equal(stops, 1, 'actual native speech is stopped once');
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

test('round bells repeat three times and cancelling prevents pending cues', () => {
 const c=setup(); let pending=new Map(), id=0;
 c.setTimeout=(fn)=>{pending.set(++id,fn);return id;}; c.clearTimeout=id=>pending.delete(id);
 c.settings.roundBellRepeats=3; c.playRoundStart();
 assert.equal(c.pools[1][0].plays,1); assert.equal(pending.size,2);
 for(const fn of [...pending.values()]) fn();
 assert.equal(c.pools[1][0].plays,3);
 c.playRoundEnd(); c.cancelRoundBellRepeats(); assert.equal(pending.size,0);
 c.settings.roundBellRepeats=1; c.playRoundStart(); assert.equal(pending.size,0);
});

test('bell preview uses the requested count even when round sounds are disabled', () => {
 const c=setup();const timers=new Map();let id=0;
 c.setTimeout=fn=>{timers.set(++id,fn);return id;};c.clearTimeout=id=>timers.delete(id);
 c.cancelCoachSpeech=()=>{};c.settings.roundSoundsEnabled=false;c.settings.roundBellRepeats=3;
 c.previewRoundBell(2);assert.equal(c.pools[1][0].plays,1);assert.equal(timers.size,1);
 for(const fn of [...timers.values()])fn();assert.equal(c.pools[1][0].plays,2);
 c.cancelRoundBellRepeats();assert.equal(timers.size,0);
});
