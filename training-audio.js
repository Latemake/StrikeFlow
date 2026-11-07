// UI-independent timing controller. Advancing a step never queues old cues,
// and stopping invalidates every pending announcement.
function createTrainingCueController(output) {
    let key = null;
    let previousElapsed = 0;
    let running = false;
    let generation = 0;
    let pending = null;
    let speaking = false;
    let soundsUntil = 0;

    function cancelAnnouncement() {
        generation++;
        if (pending !== null) output.clearTimeout(pending);
        pending = null;
        speaking = false;
        output.cancelSpeech();
    }

    function gong(count) {
        output.stopSounds();
        output.gong(count);
        soundsUntil = output.now() + count * 650;
    }

    function announce(text, delay) {
        if (!text) return;
        const ticket = generation;
        pending = output.setTimeout(() => {
            pending = null;
            if (ticket !== generation || !running) return;
            speaking = true;
            Promise.resolve().then(() => {
                if (ticket !== generation || !running) return;
                return output.speak(text);
            }).catch(() => {
                if (ticket === generation) output.speechUnavailable();
            }).finally(() => {
                if (ticket === generation) speaking = false;
            });
        }, delay);
    }

    return {
        update(state) {
            if (!state.running) {
                if (running) {
                    cancelAnnouncement();
                    output.stopSounds();
                    soundsUntil = 0;
                }
                running = false;
                return;
            }
            const resumed = !running;
            running = true;
            const elapsed = Math.max(0, state.elapsed);
            const remaining = state.duration - elapsed;
            if (key !== state.key) {
                const first = key === null;
                cancelAnnouncement();
                key = state.key;
                previousElapsed = elapsed;
                if (output.bell) {
                    output.stopSounds();
                    const ticket = generation;
                    const bellEnabled = state.bellEnabled !== false;
                    soundsUntil = bellEnabled ? Infinity : 0;
                    const completion = bellEnabled ? output.bell() : Promise.resolve();
                    Promise.resolve(completion).catch(() => {}).then(() => {
                        if (ticket !== generation || !running) return;
                        soundsUntil = 0;
                        announce(state.voiceText, 0);
                    });
                    return;
                }
                if (state.cuesEnabled) gong(first ? 1 : 2);
                announce(state.voiceText, state.cuesEnabled ? (first ? 700 : 1350) : 0);
                return;
            }
            if (resumed) announce(state.voiceText, Math.max(0, soundsUntil - output.now()));
            if (state.cuesEnabled && remaining > 0) {
                const warning = state.duration > 15 && previousElapsed < state.duration - 15 && elapsed >= state.duration - 15;
                const periodic = state.periodicEnabled && Math.floor(elapsed / 30) > Math.floor(previousElapsed / 30);
                if (warning) {
                    cancelAnnouncement();
                    gong(1);
                } else if (periodic && remaining > 15 && elapsed % 30 < 1 && !speaking && pending === null && output.now() >= soundsUntil) {
                    output.beep();
                }
            }
            previousElapsed = elapsed;
        },
        reset() {
            cancelAnnouncement();
            output.stopSounds();
            key = null;
            previousElapsed = 0;
            running = false;
            soundsUntil = 0;
        },
        finish(cuesEnabled) {
            this.reset();
            if (cuesEnabled) gong(2);
        },
        cancelVoice: cancelAnnouncement
    };
}
