// Recorded, continuous combination coaching. No network or device TTS is used.
const coachRepeatCounts = { double: 2, two: 2, triple: 3, three: 3, four: 4 };

function coachActionCount(phrase) {
    return coachRepeatCounts[phrase.trim().split(' ')[0].toLowerCase()] ?? 1;
}

const COACH_ROUNDS = (() => {
    const boxingStrikes = [
        "Jab.",
        "Cross.",
        "Lead hook.",
        "Rear hook.",
        "Lead uppercut.",
        "Rear uppercut.",
        "Lead hook to the body.",
        "Cross to the body.",
        "Two hooks.",
        "Three hooks.",
        "Four hooks.",
        "Two uppercuts.",
        "Four straight punches.",
        "Feint. Jab.",
        "Feint. Cross.",
        "Feint. Lead hook.",
        "Feint. Rear hook.",
        "Feint. Lead hook to the body.",
        "Feint. Rear uppercut.",
        "Jab. Rear hook to the body.",
        "Cross. Lead uppercut.",
        "Lead uppercut. Rear hook.",
        "Lead hook to the body. Rear hook.",
        "Lead hook. Rear uppercut.",
        "Rear uppercut. Lead hook.",
        "Jab to the body. Lead hook to the head.",
        "Double jab.",
        "Jab. Rear hook.",
        "Jab. Lead hook. Rear hook. Lead hook to the body.",
        // Punch sequences and changes of target.
        "Jab. Cross.",
        "Double jab. Cross.",
        "Jab. Cross. Lead hook.",
        "Jab to the body. Cross to the head.",
        "Jab. Cross. Lead uppercut. Cross.",
        "Jab. Lead hook. Cross.",
        "Double jab. Lead hook.",
        "Cross. Lead hook. Cross.",
        "Lead uppercut. Cross. Lead hook.",
        "Jab. Cross. Lead hook to the body.",
        "Lead hook to the body. Lead hook to the head.",
        "Jab. Rear uppercut. Lead hook.",
        "Jab. Lead uppercut. Cross.",
        "Cross to the body. Lead hook to the head.",
        "Double jab. Cross. Lead hook.",
        "Jab to the body. Jab to the head. Cross.",
        "Lead hook. Cross. Lead hook.",
        "Rear uppercut. Lead hook. Cross.",
        "Jab. Cross. Lead hook. Cross.",
        "Lead hook to the body. Cross.",
        "Jab. Cross to the body. Lead hook to the head.",
        "Double jab. Lead uppercut. Cross.",
        "Jab to the body. Cross. Lead hook.",
        "Jab. Cross. Lead uppercut.",
        "Jab. Cross. Lead hook to the body. Cross.",
        "Double jab. Cross. Lead uppercut.",
        "Double jab. Cross. Lead hook to the body.",
        "Double jab. Cross. Lead hook. Cross.",
        "Double jab. Cross. Lead uppercut. Cross.",
        "Jab to the body. Cross to the head. Lead hook.",
        "Jab to the body. Cross to the head. Lead hook to the body.",
        "Jab to the body. Cross to the head. Lead hook. Cross.",
        "Jab. Rear uppercut. Lead hook to the body.",
        "Jab. Rear uppercut. Lead hook. Cross.",
        "Jab. Rear uppercut. Lead hook to the body. Cross.",
        "Jab. Cross to the body. Lead hook.",
        "Jab. Cross to the body. Lead uppercut.",
        "Jab. Cross to the body. Lead hook. Cross.",
        "Jab. Cross to the body. Lead hook to the body. Cross.",
        "Lead uppercut. Cross. Lead hook to the body.",
        "Lead uppercut. Cross. Lead hook. Cross.",
        "Lead uppercut. Cross. Lead hook to the body. Cross.",
        "Jab to the head. Cross to the body. Lead hook.",
        "Jab to the head. Cross to the body. Lead hook. Cross.",
        "Jab to the head. Cross to the body. Lead hook to the body. Cross.",
        "Double jab. Rear uppercut. Lead hook.",
        "Double jab. Rear uppercut. Lead hook to the body.",
        "Double jab. Rear uppercut. Lead hook. Cross.",
        "Jab. Lead hook. Cross. Lead hook.",
        "Jab. Lead hook. Cross. Lead uppercut.",
        "Jab. Lead hook. Cross. Lead hook to the body.",
        "Jab. Lead hook. Cross. Lead hook. Cross.",
        "Jab. Lead hook. Cross. Lead hook to the body. Cross.",
        "Lead hook to the body. Cross. Lead hook.",
        "Lead hook to the body. Cross. Lead uppercut.",
        "Lead hook to the body. Cross. Lead hook to the head.",
        "Lead hook to the body. Cross. Lead hook. Cross.",
        "Rear uppercut. Lead hook. Cross. Lead hook.",
        "Rear uppercut. Lead hook. Cross. Lead hook to the body.",
        "Rear uppercut. Lead hook. Cross. Lead hook. Cross.",
        "Double jab. Cross to the body. Lead hook.",
        "Double jab. Cross to the body. Lead uppercut.",
        "Double jab. Cross to the body. Lead hook. Cross.",
        // Pull back and counter, or finish on an angle.
        "Jab. Step back. Cross.",
        "Double jab. Cross. Step out.",
        "Jab. Cross. Pivot out.",
        "Double jab. Step back. Cross.",
        "Jab. Lead hook. Pivot out.",
        "Cross. Lead hook. Step out.",
        "Step back. Cross. Lead hook.",
        "Step back. Cross. Lead hook to the body.",
        "Jab. Step back. Cross. Lead hook.",
    ];
    // Directions are relative to the athlete. Each slip loads the side of the counter.
    const orthodoxSlips = [
        "Jab. Slip to the left. Lead hook.",
        "Jab. Slip to the right. Rear hook.",
        "Jab. Slip to the right. Cross.",
        "Cross. Slip to the left. Lead hook.",
        "Cross. Slip to the left. Lead uppercut.",
        "Slip to the right. Cross.",
    ];
    const southpawSlips = orthodoxSlips.map(line => line.replace(/Slip to the (left|right)/,
        (_, direction) => direction === 'left' ? 'Slip to the right' : 'Slip to the left'));
    const boxing = [...boxingStrikes, ...orthodoxSlips];
    const kickAdditions = [
        "Lead low kick.",
        "Rear low kick.",
        "Lead body kick.",
        "Rear body kick.",
        "Lead front kick.",
        "Rear front kick.",
        "Two kicks.",
        "Two low kicks.",
        "Three kicks.",
        "Feint. Rear low kick.",
        "Feint. Lead body kick.",
        "Feint. Rear body kick.",
        "Check. Rear low kick.",
        "Check. Cross.",
        "Cross. Lead low kick.",
        "Lead hook. Rear low kick.",
        "Lead front kick. Cross.",
        // Punches into low and body kicks.
        "Jab. Cross. Rear low kick.",
        "Double jab. Rear body kick.",
        "Jab. Rear low kick.",
        "Cross. Lead hook. Rear low kick.",
        "Jab. Cross. Lead body kick.",
        "Jab. Lead hook. Rear body kick.",
        "Jab. Cross. Rear body kick.",
        "Double jab. Rear low kick.",
        "Lead hook. Rear body kick.",
        "Cross. Lead body kick.",
        "Jab. Cross. Lead hook. Rear low kick.",
        "Jab. Rear body kick. Step out.",
        "Double jab. Lead body kick.",
        "Cross. Lead hook. Rear body kick.",
        "Jab to the body. Rear low kick.",
        "Cross. Lead hook. Lead body kick.",
        "Jab. Cross to the body. Rear low kick.",
        "Double jab. Cross. Rear body kick.",
        "Jab. Cross. Lead low kick.",
        "Double jab. Cross. Rear low kick.",
        "Double jab. Cross. Lead low kick.",
        "Double jab. Cross. Lead body kick.",
        "Jab to the body. Cross to the head. Rear low kick.",
        "Jab to the body. Cross to the head. Rear body kick.",
        "Jab to the body. Cross to the head. Lead low kick.",
        "Jab to the body. Cross to the head. Lead body kick.",
        "Jab. Rear uppercut. Lead low kick.",
        "Jab. Rear uppercut. Lead body kick.",
        "Lead uppercut. Cross. Rear low kick.",
        "Lead uppercut. Cross. Rear body kick.",
        "Lead uppercut. Cross. Lead low kick.",
        "Lead uppercut. Cross. Lead body kick.",
        "Jab to the head. Cross to the body. Rear low kick.",
        "Jab to the head. Cross to the body. Rear body kick.",
        "Jab to the head. Cross to the body. Lead low kick.",
        "Jab to the head. Cross to the body. Lead body kick.",
        "Double jab. Rear uppercut. Lead low kick.",
        "Double jab. Rear uppercut. Lead body kick.",
        "Jab. Lead hook. Cross. Rear low kick.",
        "Jab. Lead hook. Cross. Rear body kick.",
        "Jab. Lead hook. Cross. Lead low kick.",
        "Jab. Lead hook. Cross. Lead body kick.",
        "Lead hook to the body. Cross. Rear low kick.",
        "Lead hook to the body. Cross. Rear body kick.",
        "Lead hook to the body. Cross. Lead low kick.",
        "Lead hook to the body. Cross. Lead body kick.",
        "Rear uppercut. Lead hook. Cross. Rear low kick.",
        "Rear uppercut. Lead hook. Cross. Rear body kick.",
        "Rear uppercut. Lead hook. Cross. Lead low kick.",
        "Rear uppercut. Lead hook. Cross. Lead body kick.",
        "Double jab. Cross to the body. Rear low kick.",
        "Double jab. Cross to the body. Rear body kick.",
        "Double jab. Cross to the body. Lead low kick.",
        "Double jab. Cross to the body. Lead body kick.",
        // Checks, kick entries and changes of range.
        "Check. Cross. Rear low kick.",
        "Check. Cross. Rear body kick.",
        "Lead front kick. Jab. Cross.",
        "Rear low kick. Cross. Lead hook.",
        "Check. Jab. Cross.",
        "Jab. Lead low kick. Cross.",
        "Rear front kick. Jab. Cross.",
        "Check. Lead hook. Rear low kick.",
        "Lead front kick. Cross. Lead hook.",
        "Jab. Cross. Rear low kick. Step out.",
        "Jab. Lead low kick.",
        "Check. Cross. Lead hook.",
        "Jab. Rear front kick.",
        "Lead low kick. Jab. Cross.",
        "Jab. Cross. Rear front kick.",
        "Jab. Cross. Lead front kick.",
        "Lead front kick. Jab. Cross. Rear low kick.",
        "Lead front kick. Jab. Cross. Rear body kick.",
        "Rear low kick. Jab. Cross. Rear low kick.",
        "Rear low kick. Jab. Cross. Rear body kick.",
        "Check. Jab. Cross. Rear low kick.",
        "Check. Jab. Cross. Rear body kick.",
        "Check. Jab. Cross. Lead low kick.",
        "Check. Jab. Cross. Lead body kick.",
        "Lead low kick. Cross. Rear low kick.",
        "Lead low kick. Cross. Rear body kick.",
    ];
    const thaiAdditions = [
        "Lead teep.",
        "Rear teep.",
        "Lead knee.",
        "Rear knee.",
        "Lead elbow.",
        "Rear elbow.",
        "Two knees.",
        "Three knees.",
        "Two elbows.",
        "Feint. Lead teep.",
        "Feint. Rear knee.",
        "Feint. Lead elbow.",
        "Lead hook. Rear knee.",
        "Cross. Lead elbow.",
        "Lead elbow. Rear knee.",
        // Knees, elbows and close-range exits.
        "Jab. Cross. One rear knee. Step out.",
        "Jab. Cross. Lead elbow.",
        "Jab. Cross. Two knees. Step out.",
        "Jab. Cross. Rear elbow.",
        "Jab. Lead knee. Step out.",
        "Cross. Lead hook. Rear knee.",
        "Check. Cross. Rear knee.",
        "Double jab. Rear knee.",
        "Lead elbow. Rear knee. Step out.",
        "Jab. Cross. Lead knee.",
        "Jab. Lead elbow. Rear elbow.",
        "Cross. Lead elbow. Step out.",
        "Jab. Cross. Rear knee. Lead elbow.",
        "Check. Cross. Lead elbow.",
        "Double jab. Cross. Rear elbow.",
        "Lead hook. Rear knee. Step out.",
        "Jab. Cross. Lead elbow. Rear knee.",
        "Jab. Cross. Lead knee. Step out.",
        "Jab. Lead hook. Rear elbow.",
        "Jab. Rear elbow. Lead elbow.",
        "Cross. Lead hook. Two knees. Step out.",
        "Jab. Cross. Rear knee. Step out.",
        "Double jab. Cross. Rear knee. Step out.",
        "Double jab. Cross. Lead knee. Step out.",
        "Double jab. Cross. Lead elbow.",
        "Double jab. Cross. Lead elbow. Rear knee.",
        "Double jab. Cross. Two knees. Step out.",
        "Jab to the body. Cross to the head. Rear knee. Step out.",
        "Jab to the body. Cross to the head. Lead knee. Step out.",
        "Jab to the body. Cross to the head. Lead elbow.",
        "Jab to the body. Cross to the head. Rear elbow.",
        "Jab to the body. Cross to the head. Lead elbow. Rear knee.",
        "Jab. Rear uppercut. Rear knee. Step out.",
        "Jab. Rear uppercut. Lead knee. Step out.",
        "Jab. Rear uppercut. Lead elbow.",
        "Jab. Rear uppercut. Rear elbow.",
        "Jab. Cross to the body. Rear knee. Step out.",
        "Jab. Cross to the body. Lead knee. Step out.",
        "Jab. Cross to the body. Lead elbow.",
        "Jab. Cross to the body. Rear elbow.",
        "Lead uppercut. Cross. Rear knee. Step out.",
        "Lead uppercut. Cross. Lead knee. Step out.",
        "Lead uppercut. Cross. Lead elbow.",
        "Lead uppercut. Cross. Rear elbow.",
        "Double jab. Rear uppercut. Rear knee. Step out.",
        "Double jab. Rear uppercut. Lead knee. Step out.",
        "Double jab. Rear uppercut. Lead elbow.",
        "Double jab. Rear uppercut. Rear elbow.",
        "Jab. Lead hook. Cross. Rear knee. Step out.",
        "Jab. Lead hook. Cross. Lead knee. Step out.",
        "Jab. Lead hook. Cross. Lead elbow.",
        "Jab. Lead hook. Cross. Rear elbow.",
        "Lead hook to the body. Cross. Rear knee. Step out.",
        "Lead hook to the body. Cross. Lead knee. Step out.",
        "Lead hook to the body. Cross. Lead elbow.",
        "Lead hook to the body. Cross. Rear elbow.",
        "Rear uppercut. Lead hook. Cross. Rear knee. Step out.",
        "Rear uppercut. Lead hook. Cross. Lead knee. Step out.",
        "Rear uppercut. Lead hook. Cross. Lead elbow.",
        "Rear uppercut. Lead hook. Cross. Rear elbow.",
        "Double jab. Cross to the body. Rear knee. Step out.",
        "Double jab. Cross to the body. Lead knee. Step out.",
        "Double jab. Cross to the body. Lead elbow.",
        "Double jab. Cross to the body. Rear elbow.",
        "Check. Cross. Rear knee. Step out.",
        "Check. Cross. Lead knee. Step out.",
        "Check. Cross. Rear elbow.",
        // Teeps and follow-ups at range.
        "Jab. Rear teep.",
        "Lead teep. Jab. Cross.",
        "Jab. Rear teep. Step out.",
        "Rear teep. Cross. Lead hook.",
        "Lead teep. Rear body kick.",
        "Jab. Lead teep.",
        "Rear teep. Jab. Rear low kick.",
        "Check. Jab. Rear teep.",
        "Lead teep. Cross. Rear knee.",
    ];
    const lines = [...boxing, ...kickAdditions, ...thaiAdditions];
    const clinch = {
        enter: 'Get close. Work inside.',
        exit: 'Step back. Reset your distance.',
        combos: [
            'Lead hook to the body. Rear hook.',
            'Lead uppercut. Rear hook.',
            'Rear uppercut. Lead hook to the body.',
            'Lead hook. Rear uppercut.',
            'Rear uppercut. Lead hook.',
            'Lead hook to the body. Lead hook to the head.',
            'Two hooks.',
            'Three hooks.',
            'Four hooks.',
            'Two uppercuts.'
        ]
    };
    const thaiClinch = {
        ...clinch,
        combos: [...clinch.combos, 'Lead hook to the body. Rear knee.', 'Rear hook. Lead knee.', 'Lead knee. Rear knee.',
            'Lead hook. Rear knee.', 'Two knees.', 'Three knees.']
    };
    const movements=[
        ['Circle left. Keep your stance.','Kierrä vasemmalle. Säilytä otteluasento.','Nach links kreisen. Kampfstellung halten.'],
        ['Circle right. Keep your guard up.','Kierrä oikealle. Pidä suojaus ylhäällä.','Nach rechts kreisen. Deckung oben halten.'],
        ['Step in. Step out. Stay balanced.','Askel sisään. Askel ulos. Pidä tasapaino.','Schritt rein. Schritt raus. Gleichgewicht halten.'],
        ['Move left. Move right. Keep your feet apart.','Liiku vasemmalle ja oikealle. Pidä jalat erillään.','Links bewegen. Rechts bewegen. Füße auseinander halten.'],
        ['Stay light. Small steps. Hands up.','Liiku kevyesti, pienin askelin. Kädet ylös.','Leicht bleiben. Kleine Schritte. Hände hoch.'],
        ['Slip left. Slip right. Stay relaxed.','Väistä vasemmalle ja oikealle. Pysy rentona.','Links ausweichen. Rechts ausweichen. Locker bleiben.'],
        ['Step back. Reset. Come forward again.','Askel taakse. Palaa asentoon. Liiku taas eteen.','Schritt zurück. Neu ausrichten. Wieder vorwärts.'],
        ['Pivot out. Face your target.','Käänny sivuun. Pidä katse kohteessa.','Seitlich rausdrehen. Zum Ziel ausrichten.'],
        ['Use your feet. Change the angle.','Liikuta jalkoja. Vaihda kulmaa.','Füße bewegen. Winkel wechseln.'],
        ['Keep moving. Breathe. Find your rhythm.','Jatka liikettä. Hengitä. Löydä rytmisi.','In Bewegung bleiben. Atmen. Rhythmus finden.'],
        ['Move forward and back. Keep your stance.','Liiku eteen ja taakse. Säilytä otteluasento.','Vor und zurück bewegen. Kampfstellung halten.'],
        ['Hands up. Chin down. Circle your target.','Kädet ylös. Leuka alas. Kierrä kohdetta.','Hände hoch. Kinn runter. Um das Ziel kreisen.'],
        ['Take a small step out. Reset your guard.','Pieni askel ulos. Palauta suojaus.','Kleinen Schritt raus. Deckung neu ausrichten.'],
        ['Loose shoulders. Quiet feet. Stay ready.','Rennot hartiat. Kevyet askeleet. Pysy valmiina.','Lockere Schultern. Leise Füße. Bereit bleiben.'],
        ['Stay on balance. Turn with your feet.','Pidä tasapaino. Käänny jalkojen mukana.','Gleichgewicht halten. Mit den Füßen drehen.'],
        ['Step to the side. Reset. Eyes forward.','Askel sivuun. Palaa asentoon. Katse eteen.','Schritt zur Seite. Neu ausrichten. Blick nach vorn.']
    ];
    const comments = [
    "Keep your guard up.",
    "Chin down. Eyes forward.",
    "Breathe out with every strike.",
    "Hands back to your guard.",
    "Stay balanced.",
    "Relax your shoulders.",
    "Move your feet.",
    "Stay sharp. Keep working.",
    "Reset your stance.",
    "Good work. Stay focused.",
    "Control the power. Keep the technique.",
    "Stay light on your feet.",
    "Keep your elbows in.",
    "Finish strong.",
    "Find your rhythm.",
    "Stay loose. Stay ready.",
    "Let's go! Sharp and fast.",
    "Push the pace. Stay in control.",
    "That's it! Keep working.",
    "Strong finish. You've got this.",
    "Quick hands. Back to guard.",
    "Stay with me. Keep moving.",
    "Good! Now stay sharp.",
    "Commit to the combo. Let's go!",
    "Move with purpose. Keep it clean.",
    "Keep that energy. You're doing great."
];
    const previewText = "Ready? Listen for the combination. Let's work.";
    const sportCounts={boxing:boxing.length,k1:boxing.length+kickAdditions.length,muaythai:lines.length};
    const pools=Object.fromEntries(Object.entries(sportCounts).map(([sport,count])=>[sport,
        Object.fromEntries(['light','steady','hard'].map(level=>[level,Array.from({length:count},(_,i)=>i)]))
    ]));
    const intensity = {
        light: {rounds:3, seconds:120, rest:30},
        steady: {rounds:4, seconds:120, rest:30},
        hard: {rounds:5, seconds:120, rest:30}
    };
    function plan(sport, level, stance = 'orthodox') {
        if (!pools[sport] || !intensity[level]) throw new Error('Unknown coach session');
        const recipe=intensity[level];
        const catalogue = stance === 'southpaw' ? [...boxingStrikes, ...southpawSlips, ...kickAdditions, ...thaiAdditions] : lines;
        return {id:`coach-${sport}-${level}`, title:'Coach Rounds', voicePilot:true,
            coachRounds:{sport,level,stance,...recipe,combos:pools[sport][level].map(i=>catalogue[i]),comments,movements:movements.map(m=>m[0]),clinch:sport==='boxing'?clinch:sport==='muaythai'?thaiClinch:null},
            sections:[{title:`Rounds - ${recipe.rounds} x 2 min, 30 s rest`,rounds:Array.from({length:recipe.rounds},(_,i)=>[`Round ${i+1} - Coach Rounds`,'Listen for the next combination.'])}]};
    }
    return {lines,recordedCombos:[...new Set([...lines, ...southpawSlips, ...thaiClinch.combos])],clinch,comments,movements,sportCounts,previewText,pools,intensity,plan,restText:'Rest. Breathe, reset your stance and get ready for the next round.'};
})();

const coachRecentComboLimit = 8;

// Store only the catalogue draw state locally.
function createCoachRoundsMemory(storage){
    const cache=new Map();
    const fingerprint=pool=>{let h=2166136261;for(const char of pool.join('\n'))h=Math.imul(h^char.charCodeAt(0),16777619);return (h>>>0).toString(16);};
    return {
        read(sport,pool){
            const key='fightwise_coach_progress_v1:'+sport;
            let saved=cache.get(key);
            try{const raw=storage.getItem(key);if(raw&&raw.length<150000)saved=JSON.parse(raw);}catch{}
            if(!saved||saved.signature!==fingerprint(pool)||!Array.isArray(saved.remaining)||saved.remaining.length>pool.length)return null;
            const allowed=new Set(pool);
            if(saved.remaining.some(t=>!allowed.has(t))||new Set(saved.remaining).size!==saved.remaining.length)return null;
            const last = allowed.has(saved.last) ? saved.last : '';
            const recent = Array.isArray(saved.recent)
                ? saved.recent.slice(-coachRecentComboLimit).filter(text => allowed.has(text))
                : last ? [last] : [];
            return {remaining:[...saved.remaining],last,recent};
        },
        write(sport,pool,progress){
            const key='fightwise_coach_progress_v1:'+sport;
            const saved={signature:fingerprint(pool),remaining:[...progress.remaining],last:progress.last,recent:[...(progress.recent || [])]};
            cache.set(key,saved);try{storage.setItem(key,JSON.stringify(saved));}catch{}
        }
    };
}

// Execution allowance in seconds, measured after the last spoken technique.
function coachComboExecutionTime(text){
    const parts=text.split('.').map(t=>t.trim()).filter(Boolean);
    return parts.reduce((time, part) => {
        const slower = /\b(?:kicks?|knees?|elbows?|teeps?|check|roll|slip|pivot|switch|step)\b/i.test(part);
        return time + coachActionCount(part) * (slower ? .95 : .65);
    }, .25);
}

function coachComboSize(text) {
    const parts = text.split('.').filter(part => part.trim());
    // One spoken call belongs in a short slot even when it asks for several strikes.
    return parts.length === 1 ? 1 : parts.reduce((size, part) => size + coachActionCount(part), 0);
}

function isFreeChoiceCall(text) {
    return /^(?:Two|Three|Four) (?:straight punches|hooks|uppercuts|(?:low )?kicks|knees|elbows)\.$/.test(text);
}

function coachComboOpening(text) {
    return text.toLowerCase().split('.').slice(0, 2).map(part => part.trim()
        .replace(/^(?:double|triple|two|three|four) /, '')
        .replace(/ to the (?:head|body|left|right)$/, ''));
}

function chooseCoachCombo(pool, recent, random) {
    const unusedRecently = pool.filter(text => !recent.includes(text));
    if (!unusedRecently.length) {
        // A small or nearly exhausted slot may only contain recently used calls.
        return pool.reduce((oldest, text) => recent.lastIndexOf(text) < recent.lastIndexOf(oldest) ? text : oldest);
    }
    const openings = recent.map(coachComboOpening).reverse();
    let bestScore = Infinity;
    let candidates = [];
    for (const text of unusedRecently) {
        const [first, second] = coachComboOpening(text);
        const score = openings.reduce((total, [recentFirst, recentSecond], index) => {
            if (first !== recentFirst) return total;
            return total + (openings.length - index) * (second === recentSecond ? 3 : 1);
        }, 0);
        if (score < bestScore) {
            bestScore = score;
            candidates = [];
        }
        if (score === bestScore) candidates.push(text);
    }
    return candidates[Math.floor(random() * candidates.length)];
}

function createCoachRoundsController(output) {
    let generation=0,key=null,running=false,busy=false,due=0,current='',latest=null;
    let comboBag=[],tipBag=[],movementBag=[],poolSignature='',lastCombo='',lastTip='',lastMovement='',currentMovement='',sinceTip=0,nextTip=4,burstLeft=0;
    // Short calls give the athlete room to reset before a longer sequence.
    const rhythms = [
        ['short', 'short', 'long'],
        ['short', 'medium', 'long'],
        ['short', 'long', 'short', 'medium'],
        ['medium', 'short', 'short', 'long']
    ];
    let rhythm = [], rhythmIndex = 0, rhythmPools = null;
    let recentCombos = [];
    let clinchStarts = [], clinchQueue = [], clinchBag = [], lastClinchCombo = '', currentKind = 'combo';
    let untilFreeChoice = 0;
    const random=output.random||Math.random;
    function selectRhythm(opening) {
        const choices = (opening ? rhythms.slice(0, 3) : rhythms).filter(pattern => pattern !== rhythm);
        rhythm = choices[Math.floor(random() * choices.length)];
        rhythmIndex = 0;
    }
    function draw(list,bag,last,eligible=()=>true){
        if(!bag.length){
            bag.push(...list);
            for(let i=bag.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
            // A fresh bag cannot immediately repeat the previous bag's last call.
            if(bag.length>1&&bag[bag.length-1]===last)[bag[0],bag[bag.length-1]]=[bag[bag.length-1],bag[0]];
        }
        let index=bag.findLastIndex(eligible);
        if(index<0)return null;
        if(last&&coachComboOpening(bag[index]).join('.')===coachComboOpening(last).join('.')){
            const alternative=bag.findIndex(text=>eligible(text)&&coachComboOpening(text).join('.')!==coachComboOpening(last).join('.'));
            if(alternative>=0)index=alternative;
        }
        return bag.splice(index,1)[0];
    }
    function invalidate(){generation++;busy=false;output.cancelSpeech();output.stopSounds();}
    function guidanceThreshold(){return latest.level==='light'?2+Math.floor(random()*2):latest.level==='hard'?5+Math.floor(random()*4):4+Math.floor(random()*3);}
    function delayAfter(text,kind){
        if(!latest.level)return kind==='tip'?2:null; // Compatibility for the plain cue-controller contract.
        const range=(min,max)=>min+random()*(max-min);
        if(kind==='movement')return latest.level==='light'?range(3,5):range(1.5,2.5);
        if(kind==='tip')return range(.5,1.3);
        if(kind==='distance')return 2;
        const techniques=text.split('.').filter(t=>t.trim()).length;
        // This starts AFTER speech ends: tightening the recording must not remove execution time.
        const execution=coachComboExecutionTime(text);
        if(latest.level==='light')return Math.max(range(1.8,3.8)+techniques*.12,execution+.8);
        if(latest.level==='steady')return Math.max(range(1,2.7)+techniques*.1,execution+.4);
        if(burstLeft>0){burstLeft--;return execution+range(0,.45);}
        burstLeft=1+Math.floor(random()*2);
        return execution+range(.25,.65);
    }
    function speak(text,kind='combo'){
        const ticket=generation;busy=true;
        if(kind!=='tip')currentKind=kind;
        if(kind==='tip')output.onTip?.(text);
        else if(kind==='movement'){currentMovement=text;output.onMovement?.(text);output.onTip?.('');}
        else {current=text;currentMovement='';output.onMovement?.('');output.onCombo(text);output.onTip?.('');}
        const started=latest.elapsed;
        Promise.resolve().then(()=>{
            if(ticket!==generation||!running)return;
            return output.speak(text);
        }).catch(error=>{
            // A stalled clip has already been stopped by the player. Keep coaching
            // after the athlete has had time to perform the displayed instructions.
            if(error?.name!=='TimeoutError')throw error;
        }).then(()=>{
            if(ticket!==generation||!running)return;
            const delay=delayAfter(text,kind);
            due=delay===null?Math.max(started+(latest.cadence||7),latest.elapsed+2):latest.elapsed+delay;
        }).catch(()=>{if(ticket===generation&&running)output.onError();})
        .finally(()=>{if(ticket===generation)busy=false;});
    }
    function next(forceCombo=false){
        const remaining=latest.duration===undefined?Infinity:latest.duration-latest.elapsed;
        if(clinchQueue.length){
            if(remaining < 14 && clinchQueue.length > 1)clinchQueue = [latest.clinch.exit];
            const cue = clinchQueue.shift();
            speak(cue,cue===latest.clinch.exit?'distance':'combo');
            return;
        }
        if(remaining<6){busy=false;due=Infinity;return;}
        if(!forceCombo && latest.elapsed >= clinchStarts[0] && remaining >= 30){
            clinchStarts.shift();
            const {enter,exit,combos}=latest.clinch;
            const maxCalls = Math.min(6, Math.floor((remaining - 8) / 7));
            const count = 3 + Math.floor(random() * (maxCalls - 2));
            const block = new Set();
            for(let i=0;i<count;i++){
                const unused = clinchBag.filter(text => !block.has(text));
                if(!unused.length)clinchBag = combos.filter(text => !block.has(text));
                lastClinchCombo = chooseCoachCombo(clinchBag.filter(text => !block.has(text)), [lastClinchCombo, ...block].filter(Boolean), random);
                clinchBag.splice(clinchBag.indexOf(lastClinchCombo),1);
                block.add(lastClinchCombo);
            }
            clinchQueue=[...block,exit];
            speak(enter,'distance');
            return;
        }
        if(!forceCombo&&(!rhythmPools||rhythmIndex===0||rhythm[rhythmIndex-1]==='long')&&remaining>12&&sinceTip>=nextTip&&(latest.comments?.length||latest.movements?.length)){
            sinceTip=0;nextTip=guidanceThreshold();burstLeft=0;
            const movementChance=latest.level==='light' ? .8 : latest.level==='steady' ? .3 : .1;
            if(latest.movements?.length&&(!latest.comments?.length||random()<movementChance)){
                lastMovement=draw(latest.movements,movementBag,lastMovement);speak(lastMovement,'movement');
            }else{lastTip=draw(latest.comments,tipBag,lastTip);speak(lastTip,'tip');}
            return;
        }
        const fits=text=>remaining>=9||coachComboSize(text)<=3;
        const beat=rhythm[rhythmIndex];
        let combo;
        if(rhythmPools){
            const slot=remaining<9 && beat==='long'?'medium':beat;
            const pool=rhythmPools[slot];
            let available=pool.filter(text=>comboBag.includes(text));
            if (!available.length) {
                comboBag.push(...pool);
                available=pool;
            }
            const freeChoice = available.filter(isFreeChoiceCall);
            const prescribed = available.filter(text => !isFreeChoiceCall(text));
            const candidates = slot === 'short' && untilFreeChoice <= 0 && freeChoice.length ? freeChoice : prescribed;
            combo=chooseCoachCombo(candidates.length ? candidates : available,recentCombos,random);
            comboBag.splice(comboBag.indexOf(combo),1);
            if (isFreeChoiceCall(combo)) untilFreeChoice = 2 + Math.floor(random() * 3);
            else untilFreeChoice--;
        }else{
            combo=draw(latest.combos,comboBag,lastCombo,fits);
        }
        if(!combo){busy=false;due=Infinity;return;}
        if(rhythmPools && ++rhythmIndex === rhythm.length)selectRhythm(false);
        lastCombo=combo;
        recentCombos.push(combo);
        if (recentCombos.length > coachRecentComboLimit) recentCombos.shift();
        output.remember?.(latest,{remaining:comboBag,last:lastCombo,recent:recentCombos});
        sinceTip++;speak(lastCombo);
    }
    return {
        update(state){
            latest=state;
            const signature=JSON.stringify(state.combos);
            if(signature!==poolSignature){
                poolSignature=signature;
                const short=state.combos.filter(text=>coachComboSize(text)<=2);
                const medium=state.combos.filter(text=>coachComboSize(text)===3);
                const long=state.combos.filter(text=>coachComboSize(text)>=4);
                rhythmPools=state.level&&short.length&&medium.length&&long.length?{short,medium,long}:null;
                const saved=output.restore?.(state);
                comboBag=saved?.remaining?[...saved.remaining]:rhythmPools?[...state.combos]:[];
                lastCombo=saved?.last||'';
                recentCombos=saved?.recent?.length ? [...saved.recent] : lastCombo ? [lastCombo] : [];
                clinchBag=[];lastClinchCombo='';
                untilFreeChoice=2;
                tipBag=[];movementBag=[];lastTip='';lastMovement='';sinceTip=0;nextTip=state.level?guidanceThreshold():4;burstLeft=0;
            }
            if(!state.running){if(running)invalidate();running=false;return;}
            const resumed=!running;running=true;
            if(key!==state.key){
                invalidate();key=state.key;current='';currentMovement='';due=0;burstLeft=0;
                if(rhythmPools && !state.rest)selectRhythm(true);
                clinchQueue=[];clinchStarts=[];
                if(state.clinch && !state.rest){
                    const roll = random();
                    if (roll >= .65) clinchStarts = [13 + random() * 9, 64 + random() * 12];
                    else if (roll >= .2) clinchStarts = [27 + random() * 39];
                }
                output.onStep?.();
                const ticket=generation;busy=true;
                const bell=state.bellEnabled?output.bell(state.rest):Promise.resolve();
                Promise.resolve(bell).catch(()=>{}).then(()=>{
                    if(ticket!==generation||!running)return;
                    if(latest.rest)speak(COACH_ROUNDS.restText);else next(true);
                });
                return;
            }
            if(resumed){if(currentMovement)speak(currentMovement,'movement');else if(current)speak(current,currentKind);else if(state.rest)speak(COACH_ROUNDS.restText);else next(true);return;}
            if(!state.rest&&!busy&&state.elapsed>=due)next();
        },
        reset(){invalidate();key=null;running=false;current='';currentMovement='';latest=null;due=0;comboBag=[];tipBag=[];movementBag=[];poolSignature='';sinceTip=0;burstLeft=0;rhythm=[];rhythmIndex=0;clinchQueue=[];clinchStarts=[];},
        current(){return current;}
    };
}

let coachRoundSport='boxing',coachRoundLevel='steady',coachRoundCue='',coachRoundError=false,coachRoundTip='',coachRoundMovement='',coachSetupStep=0;
let coachRoundStance = 'orthodox';
try { if (localStorage.getItem('fightwise_coach_stance') === 'southpaw') coachRoundStance = 'southpaw'; } catch {}
function coachText(en,fi,de){return settings.language==='fi'?fi:settings.language==='de'?de:en;}
function coachSportName(sport){return sport==='boxing'?coachText('Boxing','Nyrkkeily','Boxen'):sport==='k1'?coachText('Kickboxing','Potkunyrkkeily','Kickboxen'):'Muay Thai';}
function coachLevelName(level){return ({light:coachText('Light','Kevyt','Leicht'),steady:coachText('Steady','Reipas','Mittel'),hard:coachText('Hard','Kova','Hart')})[level];}
function coachPaceDescription(level){return ({
    light:coachText('Technique, footwork and room to learn.','Tekniikkaa, liikkumista ja aikaa oppia.','Technik, Beinarbeit und Zeit zum Lernen.'),
    steady:coachText('Varied calls. Keep your rhythm.','Vaihteleva rytmi. Pysy liikkeessä.','Wechselnde Ansagen. Im Rhythmus bleiben.'),
    hard:coachText('Hard pace. Time to finish each combo.','Kova tahti. Aikaa tehdä jokainen yhdistelmä.','Hohes Tempo. Zeit für jede Kombination.')
})[level];}
function openCoachRounds(){
    cancelCoachSpeech();coachSetupStep=0;
    modeChoice.classList.add('hidden');trainingSection.classList.add('hidden');sparringSetup.classList.add('hidden');
    document.getElementById('coachRoundsSection').hidden=false;
    renderCoachRoundsPicker('coachSetupHeading');
}
function closeCoachRoundsSetup(){cancelCoachSpeech();showModeChoice();}
function selectCoachSport(sport){if(!COACH_ROUNDS.pools[sport])return;coachRoundSport=sport;renderCoachRoundsPicker('coach-sport-'+sport);}
function selectCoachStance(stance) {
    if (stance !== 'orthodox' && stance !== 'southpaw') return;
    coachRoundStance = stance;
    try { localStorage.setItem('fightwise_coach_stance', stance); } catch {}
}
function selectCoachIntensity(level){if(!COACH_ROUNDS.intensity[level])return;coachRoundLevel=level;renderCoachRoundsPicker('coach-level-'+level);}
function playCoachRoundsPreview(coach){unlockAppAudio();speakCoachText(COACH_ROUNDS.previewText,coach).catch(()=>{});}
function selectRoundCoach(coach){if(!['max','maya'].includes(coach))return;setCoachVoice(coach);renderCoachRoundsPicker('coach-voice-'+coach);playCoachRoundsPreview(coach);}
function moveCoachSetup(direction){
    cancelCoachSpeech();
    if(direction<0&&coachSetupStep===0){closeCoachRoundsSetup();return;}
    if(direction>0&&coachSetupStep===2){startCoachRounds();return;}
    coachSetupStep=Math.max(0,Math.min(2,coachSetupStep+(direction>0?1:-1)));
    renderCoachRoundsPicker('coachSetupHeading');
    if(coachSetupStep===1)playCoachRoundsPreview(settings.coachVoice);
}
function coachSportDescription(sport){return sport==='boxing'?coachText('Hands only.','Vain käsitekniikoita.','Nur Fausttechniken.'):sport==='k1'?coachText('Punches and kicks.','Lyöntejä ja potkuja.','Schläge und Tritte.'):coachText('Punches, kicks, knees and elbows.','Lyönnit, potkut, polvet ja kyynärpäät.','Schläge, Tritte, Knie und Ellbogen.');}
function renderCoachRoundsPicker(focusId){
    const root=document.getElementById('coachRoundsSection');if(!root||root.hidden)return;
    const r=COACH_ROUNDS.intensity[coachRoundLevel],total=r.rounds*r.seconds+(r.rounds-1)*r.rest;
    const labels=[coachText('Sport','Laji','Sportart'),coachText('Coach','Coach','Coach'),coachText('Intensity','Intensiteetti','Intensität')];
    const titles=[coachText('Choose your sport','Valitse laji','Wähle deine Sportart'),coachText('Choose your coach','Valitse coach','Wähle deinen Coach'),coachText('Set the intensity','Valitse intensiteetti','Wähle die Intensität')];
    const hints=[coachText('Your combinations match your sport.','Yhdistelmät valitsemasi lajin mukaan.','Kombinationen passend zu deiner Sportart.'),coachText('Tap a coach to hear the voice.','Kuuntele ääni painamalla coachia.','Tippe auf einen Coach, um die Stimme zu hören.'),coachText('Choose the pace for today.','Valitse tähän päivään sopiva tahti.','Wähle das Tempo für heute.')];
    const marker='<span class="coach-choice-check" aria-hidden="true">✓</span>';
    let choices;
    if(coachSetupStep===0)choices=['boxing','k1','muaythai'].map(s=>`<button id="coach-sport-${s}" class="coach-choice-card coach-sport-choice" aria-pressed="${s===coachRoundSport}" onclick="selectCoachSport('${s}')"><span class="coach-choice-main"><strong>${coachSportName(s)}</strong><span>${coachSportDescription(s)}</span><small>${COACH_ROUNDS.sportCounts[s]} ${coachText('combinations','yhdistelmää','Kombinationen')}</small></span>${s===coachRoundSport?marker:''}</button>`).join('');
    else if(coachSetupStep===1)choices=['max','maya'].map(c=>`<button id="coach-voice-${c}" class="coach-choice-card" aria-pressed="${settings.coachVoice===c}" onclick="selectRoundCoach('${c}')"><img class="coach-choice-art" src="Coach ${c==='max'?'Max':'Maya'}.png" alt=""><span class="coach-choice-main"><strong>${c==='max'?'Max':'Maya'}</strong><span>${c==='max'?coachText('Energetic · Clear','Energinen · Selkeä','Energisch · Klar'):coachText('Encouraging · Punchy','Kannustava · Napakka','Ermutigend · Kraftvoll')}</span><small>▷ ${coachText('Hear voice','Kuuntele ääni','Stimme hören')}</small></span>${settings.coachVoice===c?marker:''}</button>`).join('');
    else choices=Object.entries(COACH_ROUNDS.intensity).map(([level,v])=>`<button id="coach-level-${level}" class="coach-choice-card" aria-pressed="${level===coachRoundLevel}" onclick="selectCoachIntensity('${level}')"><img class="coach-choice-art" src="Intensity ${level[0].toUpperCase()+level.slice(1)}.svg" alt=""><span class="coach-choice-main"><strong>${coachLevelName(level)}</strong><span>${v.rounds} × 2 min · 30 s ${coachText('rest','tauko','Pause')}</span><small>${coachPaceDescription(level)}</small></span>${level===coachRoundLevel?marker:''}</button>`).join('');
    root.innerHTML=`<div class="coach-rounds-panel coach-setup-panel" data-coach-i18n>
        <div class="coach-setup-top"><button class="coach-home" onclick="closeCoachRoundsSetup()">← ${coachText('Home','Etusivu','Startseite')}</button><span>Coach Rounds</span></div>
        <ol class="coach-setup-progress" aria-label="${coachText('Setup progress','Valintojen vaiheet','Einrichtungsschritte')}">${labels.map((label,i)=>`<li class="${i<=coachSetupStep?'reached':''}"${i===coachSetupStep?' aria-current="step"':''}>${i+1}. ${label}</li>`).join('')}</ol>
        <h1 id="coachSetupHeading" tabindex="-1">${titles[coachSetupStep]}</h1><p class="coach-intro">${hints[coachSetupStep]}</p>
        <div class="coach-setup-choices" role="group" aria-label="${titles[coachSetupStep]}">${choices}</div>
        ${coachSetupStep===1?`<p class="coach-detail">${coachText('Prerecorded English AI coach voices.','Valmiiksi tallennetut englanninkieliset tekoälyäänet.','Aufgezeichnete englische KI-Coach-Stimmen.')}</p>`:coachSetupStep===2?`<p class="coach-session-info">${coachSportName(coachRoundSport)} · ${settings.coachVoice==='maya'?'Maya':'Max'} · ${formatTime(total)}</p>
        <label class="coach-stance">${coachText('Stance for slip calls','Otteluasento väistöohjeisiin','Kampfstellung für Ausweichansagen')}
            <select onchange="selectCoachStance(this.value)">
                <option value="orthodox" ${coachRoundStance==='orthodox'?'selected':''}>${coachText('Left foot forward','Vasen jalka edessä','Linker Fuß vorn')}</option>
                <option value="southpaw" ${coachRoundStance==='southpaw'?'selected':''}>${coachText('Right foot forward','Oikea jalka edessä','Rechter Fuß vorn')}</option>
            </select>
        </label>
        <p class="coach-detail">${coachText('Warm up before starting.','Lämmittele ennen aloitusta.','Vor dem Start aufwärmen.')}</p>`:''}
        <div class="coach-setup-footer"><button onclick="moveCoachSetup(-1)">${coachText('Back','Takaisin','Zurück')}</button><button class="coach-setup-next" onclick="moveCoachSetup(1)">${coachSetupStep===2?coachText('Start session','Aloita harjoitus','Einheit starten'):coachText('Continue','Jatka','Weiter')}</button></div>
    </div>`;
    if(focusId){document.getElementById(focusId)?.focus({preventScroll:true});if(focusId==='coachSetupHeading')root.scrollTop=0;}
}
function startCoachRounds(){
    cancelCoachSpeech();
    const plan=COACH_ROUNDS.plan(coachRoundSport,coachRoundLevel,coachRoundStance);
    coachRoundError=false;coachRoundCue='';coachRoundTip='';coachRoundMovement='';
    startTrainingPlan(getTrainingDuration(plan),'COACH ROUNDS',null,null,plan);
}
function renderCoachRoundsGuide(step){
    const plan=activeTrainingWorkout.coachRounds;
    const paused=!!sessionStats.startedAt&&!timerState.isRunning;
    const round=trainingTimeline.filter(s=>s.kind==='round').indexOf(step)+1;
    const movement=COACH_ROUNDS.movements.find(m=>m[0]===coachRoundMovement);
    const movementText=movement?.[settings.language==='fi'?1:settings.language==='de'?2:0]||coachRoundMovement;
    const cue=step.kind==='rest'?coachText('Breathe. Reset.','Hengitä. Palaudu.','Atmen. Erholen.'):movementText||coachRoundCue;
    const parts=cue?cue.split('.').map(x=>x.trim()).filter(Boolean):[];
    const terms={fi:{'Jab':'Etusuora','Cross':'Takasuora','Double jab':'Tuplaetusuora','Lead hook':'Etukoukku','Lead uppercut':'Etukäden alakoukku','Rear low kick':'Takajalan alapotku','Rear body kick':'Takajalan vartalopotku','Rear teep':'Takajalan työntöpotku','Lead elbow':'Etukäden kyynärpää','One rear knee':'Yksi takajalan polvi','Two knees':'Kaksi polvea','Step out':'Poistu','Slip':'Väistö','Check':'Potkublokki','Jab to the body':'Etusuora vartaloon','Cross to the head':'Takasuora päähän'},de:{'Jab':'Jab','Cross':'Cross','Double jab':'Doppelter Jab','Lead hook':'Führungshaken','Lead uppercut':'Führhand-Aufwärtshaken','Rear low kick':'Lowkick hinten','Rear body kick':'Körpertritt hinten','Rear teep':'Teep hinten','Lead elbow':'Ellbogen vorne','One rear knee':'Ein hinteres Knie','Two knees':'Zwei Knie','Step out':'Rausgehen','Slip':'Ausweichen','Check':'Kick blocken','Jab to the body':'Jab zum Körper','Cross to the head':'Cross zum Kopf'}};
    const extraTerms={
        'Feint':['Harhauta','Täusche an'],
        'Two hooks':['Kaksi koukkua','Zwei Haken'],
        'Three hooks':['Kolme koukkua','Drei Haken'],
        'Four hooks':['Neljä koukkua','Vier Haken'],
        'Two uppercuts':['Kaksi alakoukkua','Zwei Aufwärtshaken'],
        'Four straight punches':['Neljä suoraa lyöntiä','Vier gerade Schläge'],
        'Rear hook to the body':['Takakoukku vartaloon','Schlaghandhaken zum Körper'],
        'Two kicks':['Kaksi potkua','Zwei Kicks'],
        'Three kicks':['Kolme potkua','Drei Kicks'],
        'Two low kicks':['Kaksi alapotkua','Zwei Lowkicks'],
        'Three knees':['Kolme polvi-iskua','Drei Kniestöße'],
        'Two elbows':['Kaksi kyynärpääiskua','Zwei Ellbogenstöße'],
        'Get close':['Mene lähelle','Geh nah ran'],
        'Work inside':['Työskentele lähietäisyydeltä','Arbeite in der Nahdistanz'],
        'Reset your distance':['Palaa otteluetäisyydelle','Geh zurück auf Distanz'],
        'Slip to the left':['Väistä vasemmalle','Nach links ausweichen'],
        'Slip to the right':['Väistä oikealle','Nach rechts ausweichen'],
        'Rear hook':['Takakoukku','Schlaghandhaken'],
        'Lead hook to the body':['Etukoukku vartaloon','Führungshaken zum Körper'],
        'Lead hook to the head':['Etukoukku päähän','Führungshaken zum Kopf'],
        'Cross to the body':['Takasuora vartaloon','Cross zum Körper'],
        'Jab to the head':['Etusuora päähän','Jab zum Kopf'],
        'Rear uppercut':['Takakäden alakoukku','Hinterer Aufwärtshaken'],
        'Roll':['Sukella lyönnin ali','Unter dem Schlag abtauchen'],
        'Step back':['Askel taakse','Schritt zurück'],
        'Pivot out':['Käänny sivuun','Seitlich rausdrehen'],
        'Lead body kick':['Etujalan vartalopotku','Körpertritt vorne'],
        'Lead low kick':['Etujalan alapotku','Lowkick vorne'],
        'Lead front kick':['Etujalan työntöpotku','Frontkick vorne'],
        'Rear front kick':['Takajalan työntöpotku','Frontkick hinten'],
        'Lead teep':['Etujalan työntöpotku','Teep vorne'],
        'Lead knee':['Etujalan polvi','Knie vorne'],
        'Rear knee':['Takajalan polvi','Knie hinten'],
        'Rear elbow':['Takakäden kyynärpää','Ellbogen hinten']
    };
    for(const [term,pair] of Object.entries(extraTerms)){terms.fi[term]=pair[0];terms.de[term]=pair[1];}
    const reminderTranslations={
        'Keep your guard up.':['Pidä suojaus ylhäällä.','Deckung oben halten.'],
        'Chin down. Eyes forward.':['Leuka alas. Katse eteen.','Kinn runter. Blick nach vorn.'],
        'Breathe out with every strike.':['Hengitä ulos jokaisella iskulla.','Bei jedem Schlag ausatmen.'],
        'Hands back to your guard.':['Palauta kädet suojaukseen.','Hände zurück in die Deckung.'],
        'Stay balanced.':['Pidä tasapaino.','Im Gleichgewicht bleiben.'],
        'Relax your shoulders.':['Rentouta hartiat.','Schultern locker lassen.'],
        'Move your feet.':['Liikuta jalkoja.','Füße bewegen.'],
        'Stay sharp. Keep working.':['Pysy tarkkana. Jatka työtä.','Wach bleiben. Weiterarbeiten.'],
        'Reset your stance.':['Palaa otteluasentoon.','Kampfstellung neu ausrichten.'],
        'Good work. Stay focused.':['Hyvää työtä. Keskity.','Gute Arbeit. Konzentriert bleiben.'],
        'Control the power. Keep the technique.':['Hallitse voima. Pidä tekniikka.','Kraft kontrollieren. Technik halten.'],
        'Stay light on your feet.':['Liiku kevyesti.','Leicht auf den Füßen bleiben.'],
        'Keep your elbows in.':['Pidä kyynärpäät lähellä vartaloa.','Ellbogen eng am Körper halten.'],
        'Finish strong.':['Tee loppuun asti vahvasti.','Stark abschließen.'],
        'Find your rhythm.':['Löydä rytmisi.','Finde deinen Rhythmus.'],
        'Stay loose. Stay ready.':['Pysy rentona ja valmiina.','Locker und bereit bleiben.'],
        "Let's go! Sharp and fast.":['Nyt mennään! Terävästi ja nopeasti.','Los geht’s! Präzise und schnell.'],
        'Push the pace. Stay in control.':['Lisää vauhtia. Pidä hallinta.','Tempo erhöhen. Kontrolliert bleiben.'],
        "That's it! Keep working.":['Juuri noin! Jatka työtä.','Genau so! Weiterarbeiten.'],
        "Strong finish. You've got this.":['Vahvasti loppuun. Sinä pystyt tähän.','Stark abschließen. Du schaffst das.'],
        'Quick hands. Back to guard.':['Nopeat kädet. Takaisin suojaukseen.','Schnelle Hände. Zurück in die Deckung.'],
        'Stay with me. Keep moving.':['Pysy mukana. Jatka liikettä.','Bleib bei mir. Weiter bewegen.'],
        'Good! Now stay sharp.':['Hyvä! Pysy tarkkana.','Gut! Jetzt wach bleiben.'],
        "Commit to the combo. Let's go!":['Tee yhdistelmä päättäväisesti. Mennään!','Kombination entschlossen ausführen. Los geht’s!'],
        'Move with purpose. Keep it clean.':['Liiku tarkoituksella. Pidä tekniikka puhtaana.','Gezielt bewegen. Sauber bleiben.'],
        "Keep that energy. You're doing great.":['Pidä energia yllä. Hyvin menee.','Energie halten. Du machst das gut.']
    };
    const tip=reminderTranslations[coachRoundTip]?.[settings.language==='fi'?0:settings.language==='de'?1:2]||coachRoundTip;
    const error=coachRoundError?coachText('Coach audio could not play. Tap Continue to try again.','Coach-ääni ei käynnistynyt. Yritä uudelleen painamalla Jatka.','Coach-Audio konnte nicht starten. Mit Weiter erneut versuchen.'):'';
    return `<div class="guide-card" data-coach-i18n><div class="guide-round-label">${step.kind==='rest'?coachText('Rest','Tauko','Pause'):`${coachText('Round','Erä','Runde')} ${round}/${plan.rounds}`}</div>
      ${error?`<p role="alert" class="coach-error">${escapeHtml(error)}</p>`:''}
      ${paused?`<h2 class="guide-title">${coachText('Paused','Tauotettu','Pausiert')}</h2>`:parts.length?`<ol class="coach-combo">${parts.map(p=>`<li>${escapeHtml(terms[settings.language]?.[p]||p)}</li>`).join('')}</ol>`:`<h2 class="guide-title">${coachText('Listen and react','Kuuntele ja reagoi','Hören und reagieren')}</h2>`}
      <p class="coach-tip">${!paused&&step.kind!=='rest'?escapeHtml(tip):''}</p>
      <p class="coach-detail">${paused?coachText('Continue when ready.','Jatka, kun olet valmis.','Weiter, wenn du bereit bist.'):step.kind==='rest'?'':coachRoundMovement?coachText('Keep moving until the next call.','Jatka liikettä seuraavaan ohjeeseen asti.','Bis zur nächsten Ansage in Bewegung bleiben.'):coachText('Do the combo once. Stay ready.','Tee yhdistelmä kerran. Pysy valmiina.','Kombination einmal ausführen. Bereit bleiben.')}</p></div>`;
}
function initCoachRoundsUI(){
    const section=document.createElement('section');section.id='coachRoundsSection';section.hidden=true;section.className='coach-rounds-section';document.body.append(section);
    if(['boxing','k1','muaythai'].includes(selectedTrainingSport))coachRoundSport=selectedTrainingSport;
}
