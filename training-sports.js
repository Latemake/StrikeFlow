// Curated plans: boxing contains hands and movement only; K1 uses punches,
// kicks and single knees with an immediate exit, without elbows or clinch work.
const SPORT_TRAINING_WORKOUTS = (() => {
    const drills = {
        boxing: {
            basics: [
                ['Jab and movement', 'Jab, double jab, step out.'],
                ['Straight punches', 'Jab-cross, reset guard, move.'],
                ['Hooks', 'Jab-hook, cross-hook, hook-cross-hook.'],
                ['Defense and counters', 'Slip, cross. Block, hook. Step out.']
            ],
            rhythm: [
                ['Range and rhythm', 'Double jab, step back, jab-cross.'],
                ['Body and head', 'Jab to the body, cross to the head, step out.'],
                ['Short combinations', 'Jab-cross-hook, reset guard, move.'],
                ['Speed and defense', '10 s fast hands, 20 s relaxed movement. Repeat.']
            ]
        },
        k1: {
            basics: [
                ['Hands into kicks', 'Jab-cross-low kick. Reset your stance.'],
                ['Body kicks', 'Jab, body kick, step out.'],
                ['Kick defense', 'Check, cross-low kick, step out.'],
                ['Single knee and exit', 'Jab-cross, one knee, step out immediately. No holding.']
            ],
            rhythm: [
                ['Range control', 'Jab, teep, step out.'],
                ['Kick combinations', 'Jab-hook-low kick, cross-body kick.'],
                ['Counters', 'Block, cross-low kick. Slip, cross-body kick.'],
                ['Fight rhythm', 'Jab-cross, one knee, step out immediately. No holding.']
            ]
        }
    };
    const recipes = {
        20: { warmup: 180, count: 4, round: 180, rest: 30, cooldown: 210 },
        30: { warmup: 300, count: 6, round: 180, rest: 30, cooldown: 270 },
        45: { warmup: 360, count: 8, round: 240, rest: 30, cooldown: 210 },
        60: { warmup: 480, count: 10, round: 240, rest: 60, cooldown: 180 },
        90: { warmup: 720, count: 14, round: 240, rest: 60, cooldown: 540 }
    };
    return Object.fromEntries(Object.entries(drills).map(([sport, variants]) => [sport,
        Object.fromEntries(Object.entries(recipes).map(([minutes, recipe]) => [minutes,
            Object.entries(variants).map(([variant, rounds]) => {
                const label = sport === 'boxing' ? 'Boxing' : 'K1';
                return {
                    id: `${sport}-${variant}-${minutes}`,
                    sports: [sport],
                    title: `${label} ${variant === 'basics' ? 'foundations' : 'rhythm'}`,
                    subtitle: sport === 'boxing' ? 'Punches, defense and footwork. No kicks.' : 'Punches, kicks and single knees with an immediate exit.',
                    type: variant === 'basics' ? 'Shadowbox training' : 'Bag workout',
                    structure: `${recipe.count} rounds x ${recipe.round / 60} min, ${recipe.rest} s rest`,
                    intensity: variant === 'basics' ? 2 : 4,
                    intensityLabel: variant === 'basics' ? 'Light' : 'Hard',
                    minutes: Number(minutes),
                    premium: [20, 45, 60].includes(Number(minutes)),
                    voicePilot: Number(minutes) === 30,
                    stats: [[minutes, 'Minutes'], [String(recipe.count), 'Rounds'], [variant === 'basics' ? 'Light' : 'Hard', 'Intensity']],
                    sections: [
                        { title: 'Warmup', durationSeconds: recipe.warmup,
                            items: ['Easy movement, mobility and light shadowboxing.'] },
                        { title: `${label} rounds - ${recipe.count} x ${recipe.round / 60} min, ${recipe.rest} s rest`,
                            rounds: Array.from({ length: recipe.count }, (_, index) => {
                                const drill = rounds[index % rounds.length];
                                return [`Round ${index + 1} - ${drill[0]}`, drill[1]];
                            }) },
                        { title: 'Cooldown', durationSeconds: recipe.cooldown,
                            items: ['Walk, breathe and stretch.'] }
                    ]
                };
            })
        ]))
    ]));
})();
