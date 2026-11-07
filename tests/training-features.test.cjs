const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const html = read('index.html');
function section(start, end) { return html.slice(html.indexOf(start), html.indexOf(end, html.indexOf(start))); }
function catalogue() {
    const c = vm.createContext({ settings: { language: 'en' } });
    vm.runInContext(read('training-sports.js'), c);
    vm.runInContext(section('const TRAINING_WORKOUTS =', 'function isPremiumUnlocked()'), c);
    vm.runInContext(section('function parseMinutesFromTitle(', 'function getCurrentGuideStep('), c);
    vm.runInContext(section('function getSportWorkouts(', 'function updateSportLibraryCounts('), c);
    vm.runInContext(section('function findTrainingWorkout(', 'function parseMinutesFromTitle('), c);
    vm.runInContext(section('function formatTime(', 'function renderSessionSummary('), c);
    return c;
}

test('every sport has usable plans in every duration, with accurate complete timelines', () => {
    const c = catalogue();
    for (const sport of ['boxing', 'k1', 'muaythai']) {
        for (const minutes of [20, 30, 45, 60, 90]) {
            const workouts = c.getSportWorkouts(minutes, sport);
            assert.ok(workouts.length > 0, `${sport} ${minutes}`);
            assert.ok(workouts.some(workout => !workout.premium) || [20, 45, 60].includes(minutes));
            for (const workout of workouts) {
                assert.equal(c.findTrainingWorkout(minutes, workout.id).id, workout.id);
                const steps = c.buildTrainingTimeline(workout);
                let previousEnd = 0;
                for (const step of steps) {
                    assert.equal(step.start, previousEnd, workout.id);
                    assert.ok(step.end > step.start, workout.id);
                    previousEnd = step.end;
                }
                assert.equal(c.getTrainingDuration(workout), previousEnd);
                if (workout.sports) assert.equal(previousEnd, minutes * 60, workout.id);
            }
        }
    }
});

test('boxing never prescribes kicks, knees, elbows or clinch, and K1 excludes prohibited drills', () => {
    const c = catalogue();
    for (const minutes of [20, 30, 45, 60, 90]) {
        for (const workout of c.getSportWorkouts(minutes, 'boxing')) {
            assert.doesNotMatch(JSON.stringify(workout.sections), /\b(kicks?|teeps?|knees?|elbows?|clinch|sweeps?)\b/i, workout.id);
        }
        for (const workout of c.getSportWorkouts(minutes, 'k1')) {
            assert.doesNotMatch(JSON.stringify(workout.sections), /\b(elbows?|clinch|sweeps?)\b|\d+ knees/i, workout.id);
        }
        assert.ok(c.getSportWorkouts(minutes, 'muaythai').every(workout => !/mma/i.test(workout.id)));
    }
});

test('workout summaries count real rounds, sections and rest without relying on card metadata', () => {
    const c = catalogue();
    const basics = c.findTrainingWorkout(30, 'quick-technique');
    assert.equal(JSON.stringify(c.getWorkoutStructureStats(basics)), JSON.stringify({ sections: 3, rounds: 4, breaks: 0, restSeconds: 0, totalSeconds: 1320 }));
    const boxing = c.findTrainingWorkout(30, 'boxing-basics-30');
    const stats = c.getWorkoutStructureStats(boxing);
    assert.equal(stats.rounds, 6);
    assert.equal(stats.breaks, 5);
    assert.equal(stats.restSeconds, 150);
    assert.match(c.renderWorkoutStructureSummary(boxing), /5 breaks \(02:30\).*Total 30:00/);
});

function audio(overrides = {}) {
    let now = 0, nextTimer = 0;
    const timers = new Map(), events = [];
    const c = vm.createContext({});
    vm.runInContext(read('training-audio.js'), c);
    const controller = c.createTrainingCueController({
        now: () => now,
        setTimeout(fn, delay) { const id = ++nextTimer; timers.set(id, { fn, at: now + delay }); return id; },
        clearTimeout(id) { timers.delete(id); },
        gong: count => events.push(['gong', count]),
        beep: () => events.push(['beep']),
        stopSounds() {}, cancelSpeech() { events.push(['cancel']); },
        speak: text => { events.push(['speak', text]); return Promise.resolve(); },
        speechUnavailable: () => events.push(['unavailable']),
        ...overrides
    });
    return { controller, events,
        async advance(ms) {
            now += ms;
            for (const [id, timer] of [...timers]) {
                if (timer.at <= now) { timers.delete(id); timer.fn(); }
            }
            await new Promise(resolve => setImmediate(resolve));
        }
    };
}
const state = (elapsed = 0, extra = {}) => ({ key: 'round-1', elapsed, duration: 180, running: true, cuesEnabled: true, periodicEnabled: true, voiceText: 'Jab', ...extra });

test('gong plays before voice and repeated updates never repeat a step announcement', async () => {
    const { controller, events, advance } = audio();
    controller.update(state());
    controller.update(state(0.05));
    await advance(699);
    assert.deepEqual(events.filter(event => event[0] !== 'cancel'), [['gong', 1]]);
    await advance(1);
    assert.deepEqual(events.filter(event => event[0] !== 'cancel'), [['gong', 1], ['speak', 'Jab']]);
    controller.update(state(1));
    await advance(1000);
    assert.equal(events.filter(event => event[0] === 'speak').length, 1);
});

test('periodic and warning cues fire once at boundaries; the warning suppresses the beep', async () => {
    const { controller, events, advance } = audio();
    controller.update(state(0, { voiceText: '', duration: 75 }));
    await advance(1000);
    controller.update(state(29.99, { voiceText: '', duration: 75 }));
    controller.update(state(30.01, { voiceText: '', duration: 75 }));
    controller.update(state(30.06, { voiceText: '', duration: 75 }));
    controller.update(state(60.01, { voiceText: '', duration: 75 }));
    controller.update(state(60.06, { voiceText: '', duration: 75 }));
    assert.equal(events.filter(event => event[0] === 'beep').length, 1);
    assert.deepEqual(events.filter(event => event[0] === 'gong'), [['gong', 1], ['gong', 1]]);
});

test('step skip cancels the old announcement and waits for both gongs before the new one', async () => {
    const { controller, events, advance } = audio();
    controller.update(state());
    controller.update(state(0, { key: 'round-2', voiceText: 'Cross' }));
    await advance(1349);
    assert.equal(events.filter(event => event[0] === 'speak').length, 0);
    await advance(1);
    assert.deepEqual(events.filter(event => event[0] === 'speak'), [['speak', 'Cross']]);
    assert.deepEqual(events.filter(event => event[0] === 'gong'), [['gong', 1], ['gong', 2]]);
});

test('pause, reset and finish cancel every queued announcement', async () => {
    for (const action of ['pause', 'reset', 'finish']) {
        const { controller, events, advance } = audio();
        controller.update(state());
        if (action === 'pause') controller.update(state(0, { running: false }));
        if (action === 'reset') controller.reset();
        if (action === 'finish') controller.finish(true);
        await advance(10000);
        assert.equal(events.filter(event => event[0] === 'speak').length, 0, action);
        if (action === 'finish') assert.deepEqual(events.filter(event => event[0] === 'gong').at(-1), ['gong', 2]);
    }
});

test('optional beeps and all section signals can be disabled independently of voice', async () => {
    const { controller, events, advance } = audio();
    controller.update(state(0, { cuesEnabled: false }));
    await advance(1);
    controller.update(state(30, { cuesEnabled: false }));
    controller.update(state(165, { cuesEnabled: false }));
    assert.equal(events.filter(event => ['gong', 'beep'].includes(event[0])).length, 0);
    assert.deepEqual(events.filter(event => event[0] === 'speak'), [['speak', 'Jab']]);
    controller.reset();
    controller.update(state(0, { voiceText: '', periodicEnabled: false }));
    await advance(1000);
    controller.update(state(30, { voiceText: '', periodicEnabled: false }));
    assert.equal(events.filter(event => event[0] === 'beep').length, 0);
});

test('turning voice off cancels a queued announcement without interrupting timing', async () => {
    const { controller, events, advance } = audio();
    controller.update(state());
    controller.cancelVoice();
    await advance(1000);
    controller.update(state(30, { voiceText: '' }));
    assert.equal(events.filter(event => event[0] === 'speak').length, 0);
    assert.equal(events.filter(event => event[0] === 'beep').length, 1);
});

test('an unavailable speech engine reports failure and leaves section signals working', async () => {
    const { controller, events, advance } = audio({ speak() { throw new Error('Voice unavailable'); } });
    controller.update(state());
    await advance(700);
    assert.equal(events.filter(event => event[0] === 'unavailable').length, 1);
    controller.update(state(165));
    assert.equal(events.filter(event => event[0] === 'gong').length, 2);
});

test('long speech suppresses periodic beeps and a section-ending warning cancels speech', async () => {
    const { controller, events, advance } = audio({ speak() { return new Promise(() => {}); } });
    controller.update(state());
    await advance(700);
    controller.update(state(30));
    assert.equal(events.filter(event => event[0] === 'beep').length, 0);
    const cancels = events.filter(event => event[0] === 'cancel').length;
    controller.update(state(165));
    assert.equal(events.filter(event => event[0] === 'cancel').length, cancels + 1);
    assert.equal(events.filter(event => event[0] === 'gong').length, 2);
});
