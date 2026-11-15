const WORKOUT_HISTORY_KEY = 'fightwise_workout_history_v1';
const WORKOUT_HISTORY_GOAL = 3;
const WORKOUT_HISTORY_MODES = ['spar', 'training', 'coach'];

function workoutWeekNumber(monday) {
    // ISO weeks belong to the calendar year containing their Thursday.
    const thursday = monday + 3;
    const yearStart = Date.UTC(new Date(thursday * 86400000).getUTCFullYear(), 0, 1) / 86400000;
    return Math.floor((thursday - yearStart) / 7) + 1;
}

function workoutDay(date) {
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
        .map((part, index) => String(part).padStart(index ? 2 : 4, '0')).join('-');
}

function summarizeWorkoutHistory(entries, now = new Date()) {
    // Calendar days are mapped to UTC for week arithmetic, independently of DST.
    const day = date => Date.parse(date + 'T00:00:00Z') / 86400000;
    const monday = value => value - (value + 3) % 7;
    const today = day(workoutDay(now));
    const week = monday(today);
    const total = {count: 0, seconds: 0, rounds: 0};
    const weekly = {...total};
    const modes = Object.fromEntries(WORKOUT_HISTORY_MODES.map(mode => [mode, 0]));
    const weeks = new Set();
    const activity = Array.from({length: 6}, (_, index) => ({
        weekNumber: workoutWeekNumber(week - (5 - index) * 7),
        seconds: 0
    }));
    for (const entry of entries) {
        const entryDay = day(entry.day);
        if (entryDay > today) continue;
        total.count++;
        total.seconds += entry.seconds;
        total.rounds += entry.rounds;
        modes[entry.mode]++;
        weeks.add(monday(entryDay));
        const bucket = 5 - (week - monday(entryDay)) / 7;
        if (activity[bucket]) activity[bucket].seconds += entry.seconds;
        if (entryDay >= week) {
            weekly.count++;
            weekly.seconds += entry.seconds;
            weekly.rounds += entry.rounds;
        }
    }
    let streak = 0;
    for (let cursor = weeks.has(week) ? week : week - 7; weeks.has(cursor); cursor -= 7) streak++;
    return {total, weekly, streak, modes, activity};
}

function createWorkoutHistory(storage) {
    const uniqueId = () => globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2);
    function read() {
        try {
            const state = JSON.parse(storage.getItem(WORKOUT_HISTORY_KEY));
            if (typeof state?.id !== 'string' || !Array.isArray(state.entries)) return null;
            state.entries = state.entries.filter(entry => entry && typeof entry.id === 'string' &&
                /^\d{4}-\d{2}-\d{2}$/.test(entry.day) && Number.isFinite(Date.parse(entry.day)) &&
                WORKOUT_HISTORY_MODES.includes(entry.mode) && Number.isSafeInteger(entry.seconds) && entry.seconds > 0 &&
                Number.isSafeInteger(entry.rounds) && entry.rounds >= 0);
            return state;
        } catch {
            return null;
        }
    }
    function write(state) {
        try {
            storage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(state));
            return true;
        } catch {
            return false;
        }
    }
    return {
        read,
        enable: () => !!read() || write({id: uniqueId(), entries: []}),
        clear: () => write({id: uniqueId(), entries: []}),
        disable() {
            try {
                storage.removeItem(WORKOUT_HISTORY_KEY);
                return true;
            } catch {
                return false;
            }
        },
        start(mode, now = new Date(), title) {
            const state = read();
            if (!state || !WORKOUT_HISTORY_MODES.includes(mode)) return null;
            const entry = {id: uniqueId(), day: workoutDay(now), mode};
            const name = typeof title === 'string' ? title.trim().slice(0, 160) : '';
            if (name) entry.title = name;
            let savedSeconds = 0, savedRounds = 0, savedComplete = false;
            return {
                recordedEntry(snapshot) {
                    return snapshot?.id === state.id ? snapshot.entries.find(item => item.id === entry.id) : undefined;
                },
                save(stats, force = false) {
                    const seconds = Math.floor(stats.activeSeconds);
                    const rounds = stats.historyRounds || 0;
                    const complete = !!stats.historyComplete;
                    // Brief timer checks should never count towards a weekly goal.
                    if (seconds < 1 || (seconds < 30 && !rounds)) return;
                    if (seconds === savedSeconds && rounds === savedRounds && complete === savedComplete) return;
                    if (!force && rounds === savedRounds && seconds - savedSeconds < (savedSeconds ? 15 : 30)) return;
                    const latest = read();
                    if (latest?.id !== state.id) return;
                    const index = latest.entries.findIndex(item => item.id === entry.id);
                    const snapshot = {...entry, seconds, rounds, complete};
                    if (index === -1) latest.entries.push(snapshot);
                    else latest.entries[index] = snapshot;
                    if (write(latest)) {
                        savedSeconds = seconds;
                        savedRounds = rounds;
                        savedComplete = complete;
                    }
                }
            };
        }
    };
}
