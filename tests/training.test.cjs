const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '..', 'index.html'), 'utf8');
const c = vm.createContext({});
vm.runInContext(html.slice(html.indexOf('const TRAINING_WORKOUTS ='), html.indexOf('function isPremiumUnlocked()')), c);
vm.runInContext(html.slice(html.indexOf('function parseMinutesFromTitle('), html.indexOf('function getCurrentGuideStep(')), c);
const workout = sections => ({ title: 'Test workout', sections });

test('second-based sprint rounds include rest between every round', () => {
    const w = workout([{ title: 'Bag sprints - 10 x 90 s, 30 s rest', rounds: [
        ['Sprints 1-2 - Straight punches', 'jab'], ['Sprints 3-4 - Hooks', 'hook'],
        ['Sprints 5-6 - Body shots', 'body'], ['Sprints 7-8 - Knees', 'knee'],
        ['Sprints 9-10 - Freestyle', 'all']
    ] }]);
    const steps = c.buildTrainingTimeline(w);
    assert.equal(steps.length, 19);
    assert.equal(steps[0].end, 90);
    assert.equal(steps[1].title, 'Rest');
    assert.equal(steps[1].end, 120);
    assert.equal(steps[4].note, 'hook');
    assert.equal(steps.at(-1).title, 'Sprints 9-10 - Freestyle');
    assert.equal(c.getTrainingDuration(w), 1170);
    assert.equal(c.getTrainingDurationText(w), '19 min 30 s');
});

test('minute rounds preserve each round and omit rest after the last round', () => {
    const w = workout([{ title: 'Main - 3 x 2 min, 45 s rest', rounds: [
        ['Rounds 1-2 - Technique', 'first'], ['Round 3 - Power', 'last']
    ] }]);
    const steps = c.buildTrainingTimeline(w);
    assert.equal(steps.length, 5);
    assert.equal(steps[2].note, 'first');
    assert.equal(steps[4].note, 'last');
    assert.equal(c.getTrainingDuration(w), 450);
});

test('Sharp basics finishes at the actual end of its cooldown', () => {
    const w = vm.runInContext('TRAINING_WORKOUTS[30].find(w => w.id === "quick-technique")', c);
    assert.equal(c.getTrainingDuration(w), 22 * 60);
    assert.equal(c.getTrainingDurationText(w), '22 min');
});

test('custom workout uses explicit step durations', () => {
    const w = workout([{ title: 'My drill', durationSeconds: 75, items: ['note'] },
        { title: 'Cooldown', durationSeconds: 60, items: [] }]);
    assert.equal(c.getTrainingDuration(w), 135);
});

test('all catalogue workouts have continuous, positive, whole-second timelines', () => {
    const workouts = vm.runInContext('Object.values(TRAINING_WORKOUTS).flat()', c);
    assert.equal(workouts.length, 71);
    assert.equal(new Set(workouts.map(w => w.id)).size, workouts.length);
    for (const w of workouts) {
        const steps = c.buildTrainingTimeline(w);
        assert.ok(steps.length, w.id);
        let end = 0;
        for (const step of steps) {
            assert.equal(step.start, end, w.id);
            assert.ok(Number.isInteger(step.end) && step.end > step.start, w.id);
            assert.ok(step.title && typeof step.note === 'string', w.id);
            end = step.end;
        }
        assert.equal(c.getTrainingDuration(w), end, w.id);
    }
});

test('starting a guided workout uses timeline duration instead of its category', () => {
    const s = vm.createContext({ requested: workout([{ title: 'Warmup - 2 min', items: [] }]),
        findTrainingWorkout: () => ({ premium: false, title: 'Two minutes', sections: [{ title: 'Warmup - 2 min', items: [] }] }),
        settings: {}, modeChoice: {classList: {add() {}}}, trainingSection: {classList: {add() {}}},
        workoutPreview: {classList: {remove() {}}}, resetTimer() {} });
    vm.runInContext(html.slice(html.indexOf('function parseMinutesFromTitle('), html.indexOf('function getCurrentGuideStep(')), s);
    vm.runInContext(html.slice(html.indexOf('function startTrainingPlan('), html.indexOf('// Settings', html.indexOf('function startTrainingPlan('))), s);
    s.startTrainingPlan(1800, 'Test', 30, 'test');
    assert.equal(s.settings.roundTime, 120);
});
