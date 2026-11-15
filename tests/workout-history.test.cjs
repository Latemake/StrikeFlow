const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup() {
    const c = vm.createContext({});
    vm.runInContext(fs.readFileSync('workout-history.js', 'utf8'), c);
    const data = new Map();
    const history = c.createWorkoutHistory({
        getItem: key => data.get(key) ?? null,
        setItem: (key, value) => data.set(key, value),
        removeItem: key => data.delete(key)
    });
    return {c, history, data};
}

test('history is opt-in, ignores a short timer check, and updates a single session through completion', () => {
    const {history, data} = setup();
    assert.equal(history.start('coach'), null);
    assert.equal(data.size, 0);
    assert.equal(history.enable(), true);
    const session = history.start('coach', new Date(2026, 10, 14, 12), ' Muay Thai · Hard ');
    session.save({activeSeconds: 29.9}, true);
    assert.equal(history.read().entries.length, 0);
    session.save({activeSeconds: 30.9, breakSeconds: 60});
    assert.equal(history.read().entries[0].seconds, 30);
    session.save({activeSeconds: 120, historyRounds: 1});
    session.save({activeSeconds: 120, historyRounds: 1, historyComplete: true}, true);
    const [entry] = history.read().entries;
    assert.equal(history.read().entries.length, 1);
    assert.equal(entry.mode, 'coach');
    assert.equal(entry.title, 'Muay Thai · Hard');
    assert.equal(entry.day, '2026-11-14');
    assert.equal(entry.seconds, 120);
    assert.equal(entry.rounds, 1);
    assert.equal(entry.complete, true);
    assert.equal(session.recordedEntry(history.read()).id, entry.id);
});

test('clear and disable invalidate in-progress sessions and remove old data', () => {
    const {history, data} = setup();
    history.enable();
    const old = history.start('spar');
    old.save({activeSeconds: 60, historyRounds: 1});
    history.clear();
    old.save({activeSeconds: 90}, true);
    assert.equal(history.read().entries.length, 0);
    assert.equal(old.recordedEntry(history.read()), undefined);
    history.disable();
    history.enable();
    old.save({activeSeconds: 105}, true);
    assert.equal(history.read().entries.length, 0);
    history.disable();
    assert.equal(data.size, 0);
});

test('weekly streak counts distinct Monday-based weeks and gives the current week time to train', () => {
    const {c} = setup();
    const entries = ['2026-10-25', '2026-10-26', '2026-11-08', '2026-11-08', '2026-11-09']
        .map(day => ({day, mode:'training', seconds:60, rounds:1}));
    const monday = c.summarizeWorkoutHistory(entries.slice(0,4), new Date(2026,10,9,12));
    const later = c.summarizeWorkoutHistory(entries, new Date(2026,10,14,12));
    assert.equal(monday.streak, 3);
    assert.equal(monday.weekly.count, 0);
    assert.equal(later.streak, 4);
    assert.equal(later.total.count, 5);
    assert.equal(later.weekly.seconds, 60);
    assert.equal(later.modes.training, 5);
    assert.deepEqual(Array.from(later.activity, week => week.seconds), [0, 0, 60, 60, 120, 60]);
    assert.deepEqual(Array.from(later.activity, week => week.weekNumber), [41, 42, 43, 44, 45, 46]);
    assert.equal(c.summarizeWorkoutHistory(entries, new Date(2026,10,23,12)).streak, 0);
});

test('week numbers follow the ISO week year across New Year', () => {
    const {c} = setup();
    const week = date => c.summarizeWorkoutHistory([], date).activity.at(-1).weekNumber;
    assert.equal(week(new Date(2027, 0, 1, 12)), 53);
    assert.equal(week(new Date(2027, 0, 4, 12)), 1);
});
