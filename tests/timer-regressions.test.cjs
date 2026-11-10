const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('index.html', 'utf8');

function timer() {
    const signals = [];
    const context = vm.createContext({
        now: 0, lastTickMs: 0, lastWholeSecond: 120,
        performance: { now: () => context.now },
        timerState: { isRunning: true, isFinished: false, isRound: true, currentRound: 1, timeLeft: 120 },
        settings: { roundTime: 120, breakTime: 30, numberOfRounds: 5 },
        sessionStats: { activeSeconds: 0, breakSeconds: 0, completedRounds: 0 },
        taskState: { showingPreRound: false },
        appMode: 'spar', activeTrainingWorkout: null, trainingTimeline: [],
        playRoundStart: () => signals.push('start'),
        playRoundEnd: () => signals.push('end'),
        playWarningVibration: () => signals.push('warning'),
        progressCircle: { classList: { remove() {} } },
        timerDisplay: { classList: { add() {}, remove() {} } },
        updateUI() {}, updateRingWarning() {}, syncTrainingAudio() {},
    });
    vm.runInContext(html.slice(html.indexOf('function recordTimerTime('), html.indexOf('function stopPreRoundDisplay(')), context);
    return {
        context,
        signals,
        advance(ms) { context.now += ms; context.tick(); },
    };
}

test('a late tick catches up across multiple sparring boundaries and counts time by phase', () => {
    const { context, signals, advance } = timer();
    advance(20000);
    advance(200000);
    assert.equal(context.timerState.currentRound, 2);
    assert.equal(context.timerState.isRound, true);
    assert.equal(context.timerState.timeLeft, 50);
    assert.equal(context.sessionStats.activeSeconds, 190);
    assert.equal(context.sessionStats.breakSeconds, 30);
    assert.equal(context.sessionStats.completedRounds, 1);
    assert.deepEqual(signals, []);
    advance(50000);
    assert.deepEqual(signals, ['end']);
});

test('the warning vibrates once when crossing ten seconds', () => {
    const { context, signals, advance } = timer();
    context.timerState.timeLeft = 10.5;
    for (let tick = 0; tick < 40; tick++) advance(50);
    assert.deepEqual(signals, ['warning']);
});

test('guided training accounts for rest even when a single tick spans both rest boundaries', () => {
    const { context, advance } = timer();
    context.appMode = 'training';
    context.activeTrainingWorkout = {};
    context.trainingTimeline = [
        { kind: 'round', start: 0, end: 20 },
        { kind: 'rest', start: 20, end: 30 },
        { kind: 'round', start: 30, end: 120 },
    ];
    advance(40000);
    assert.equal(context.sessionStats.activeSeconds, 30);
    assert.equal(context.sessionStats.breakSeconds, 10);
});

test('custom round count rejects non-integer input formats', () => {
    const context = vm.createContext({});
    vm.runInContext(html.slice(html.indexOf('function parseSetupSecondsInput('), html.indexOf('function applySetupCustom(')), context);
    const step = { custom: { type: 'rounds' } };
    for (const value of ['3.5', '1e2', '0', '100', '-1', '']) {
        assert.equal(context.parseSetupCustomValue(step, value), null, value);
    }
    for (const value of ['1', ' 3 ', '99']) {
        assert.equal(context.parseSetupCustomValue(step, value), Number(value), value);
    }
});

test('offline navigation keeps the home and privacy pages separate under a subpath', async () => {
    const scope = 'https://example.test/StrikeFlow/';
    const pages = new Map([[scope + 'index.html', 'home'], [scope + 'privacy-policy.html', 'privacy']]);
    const handlers = new Map();
    let online = true;
    const context = vm.createContext({
        URL,
        self: { registration: { scope }, addEventListener: (name, handler) => handlers.set(name, handler) },
        fetch: async request => {
            if (!online) throw Error('Offline');
            return pages.get(request.url);
        },
        caches: {
            open: async () => ({
                match(request, { ignoreSearch }) {
                    const url = new URL(request.url ?? request, scope);
                    if (ignoreSearch) url.search = '';
                    return pages.get(url.href);
                },
            }),
        },
    });
    vm.runInContext(fs.readFileSync('sw.js', 'utf8'), context);
    function navigate(path) {
        let response;
        handlers.get('fetch')({
            request: { url: scope + path, mode: 'navigate' },
            respondWith: promise => { response = promise; },
        });
        return response;
    }
    assert.equal(await navigate('privacy-policy.html'), 'privacy');
    online = false;
    assert.equal(await navigate(''), 'home');
    assert.equal(await navigate('index.html?installed=1'), 'home');
    assert.equal(await navigate('privacy-policy.html'), 'privacy');
});
